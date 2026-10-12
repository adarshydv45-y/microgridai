import os
import json
from datetime import datetime
from fastapi import APIRouter, HTTPException, Query, Response, status
from fastapi.responses import PlainTextResponse

from ..config import settings
from ..schemas import (
    TelemetryReading,
    CurrentMetrics,
    EnergyHistoryResponse,
    ForecastResponse,
    AnomalyDetectionRequest,
    AnomalyDetectionResult,
    AnomaliesListResponse,
    RecommendationsResponse,
    DashboardResponse,
    SystemInfoResponse
)
from ..services.energy_service import energy_service
from ..services.recommendation_service import recommendation_engine
from ..ml.predictor import predictor_service
from ..ml.anomaly_detector import anomaly_service

router = APIRouter(prefix="/api", tags=["MicrogridAI API"])

@router.get("/health", status_code=status.HTTP_200_OK)
def get_health():
    """System health and liveness check for Cloud Run and container orchestration."""
    models_ready = (
        predictor_service.solar_model is not None and
        predictor_service.demand_model is not None and
        anomaly_service.model is not None
    )
    return {
        "status": "healthy",
        "service": settings.app_name,
        "subtitle": settings.app_subtitle,
        "version": settings.version,
        "timestamp": datetime.now().isoformat(),
        "models_loaded": models_ready,
        "environment": "Google Cloud Run / Containerized Production" if os.getenv("K_SERVICE") else "Local Development"
    }

@router.get("/dashboard", response_model=DashboardResponse)
def get_dashboard():
    """Aggregates all real-time KPIs, status, forecast overview, and top recommendations."""
    current = energy_service.get_current_metrics()
    forecast_data = predictor_service.get_24h_forecast(current_soc=current["battery_soc"])
    rec_data = recommendation_engine.generate_recommendations(current, forecast_data)
    
    # Recent alerts
    alerts = []
    if current["grid_import_kw"] > 8.0:
        alerts.append({
            "id": "alt-grid-high",
            "type": "WARNING",
            "message": f"Elevated grid import active ({current['grid_import_kw']} kW). Battery reserve prioritized.",
            "timestamp": current["timestamp"]
        })
    if current["battery_soc"] < settings.battery_min_soc + 5.0:
        alerts.append({
            "id": "alt-soc-low",
            "type": "ALERT",
            "message": f"Battery SoC at {current['battery_soc']}%. Approaching safety reserve cutoff ({settings.battery_min_soc}%).",
            "timestamp": current["timestamp"]
        })
    if not alerts:
        alerts.append({
            "id": "alt-ok",
            "type": "INFO",
            "message": "All microgrid circuits operating within nominal safety thresholds.",
            "timestamp": current["timestamp"]
        })
        
    models_ready = {
        "solar_forecast_model": "GradientBoostingRegressor (Active)",
        "demand_forecast_model": "GradientBoostingRegressor (Active)",
        "anomaly_detector": "IsolationForest (Active)"
    }
    
    sys_info = SystemInfoResponse(
        service_name=settings.app_name,
        version=settings.version,
        status="OPERATIONAL",
        data_source="Deterministic Demonstration Dataset (Microgrid Simulator, Seed 42)",
        is_live_telemetry=False,
        last_refresh_timestamp=current["timestamp"],
        ml_models=models_ready,
        cloud_environment=os.getenv("K_SERVICE", "Standalone Service"),
        host=settings.host,
        port=settings.port
    )
    
    return DashboardResponse(
        system_info=sys_info,
        current_metrics=CurrentMetrics(**current),
        forecast_preview=forecast_data["summary"],
        top_recommendations=rec_data["recommendations"][:3],
        recent_alerts=alerts
    )

@router.get("/energy/history", response_model=EnergyHistoryResponse)
def get_energy_history(range: str = Query("24h", description="Time window: 24h, 7d, or 30d")):
    """Retrieves historical energy telemetry, power readings, and daily kWh summaries."""
    if range not in ["24h", "7d", "30d"]:
        raise HTTPException(status_code=400, detail="Invalid range. Must be '24h', '7d', or '30d'.")
    return energy_service.get_history(time_range=range)

@router.get("/energy/export-csv")
def export_energy_csv(range: str = Query("30d", description="Time window for export: 24h, 7d, or 30d")):
    """Generates and downloads a clean CSV telemetry report."""
    if range not in ["24h", "7d", "30d"]:
        raise HTTPException(status_code=400, detail="Invalid range. Must be '24h', '7d', or '30d'.")
    csv_content = energy_service.export_csv(time_range=range)
    filename = f"microgridai_telemetry_{range}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.get("/forecast", response_model=ForecastResponse)
def get_energy_forecast():
    """Returns 24-hour ahead regression forecasts for solar generation and electricity demand."""
    current = energy_service.get_current_metrics()
    return predictor_service.get_24h_forecast(current_soc=current["battery_soc"])

@router.post("/anomalies/detect", response_model=AnomalyDetectionResult)
def detect_anomaly(reading: AnomalyDetectionRequest):
    """
    Evaluates an arbitrary telemetry reading in real time using the trained Isolation Forest model.
    Returns anomaly status, calibrated score, severity, and root-cause signal attribution.
    """
    return anomaly_service.analyze_reading(
        solar_kw=reading.solar_kw,
        demand_kw=reading.demand_kw,
        battery_soc=reading.battery_soc,
        battery_power_kw=reading.battery_power_kw,
        ambient_temp_c=reading.ambient_temp_c,
        grid_import_kw=reading.grid_import_kw,
        timestamp=reading.timestamp
    )

@router.get("/anomalies", response_model=AnomaliesListResponse)
def get_anomalies_list():
    """Lists detected historical anomalies and benchmark test cases along with model evaluation metrics."""
    return anomaly_service.get_historical_anomalies()

@router.get("/recommendations", response_model=RecommendationsResponse)
def get_recommendations():
    """Calculates actionable storage, dispatch, and demand-response recommendations."""
    current = energy_service.get_current_metrics()
    forecast_data = predictor_service.get_24h_forecast(current_soc=current["battery_soc"])
    return recommendation_engine.generate_recommendations(current, forecast_data)

@router.get("/model/metrics")
def get_model_metrics():
    """Provides transparent ML evaluation metrics (MAE, RMSE, baseline comparisons, F1-scores)."""
    metrics_path = settings.models_dir / "metrics.json"
    if not metrics_path.exists():
        raise HTTPException(status_code=404, detail="Model metrics have not been generated yet.")
    with open(metrics_path, "r") as f:
        return json.load(f)

@router.post("/system/refresh-telemetry")
def refresh_telemetry_dataset():
    """Regenerates deterministic telemetry data to reset or refresh simulation states."""
    energy_service.refresh_data()
    return {"status": "success", "message": "Telemetry dataset refreshed successfully."}
