import pytest
from app.ml.predictor import predictor_service
from app.ml.anomaly_detector import anomaly_service

def test_models_loaded():
    assert predictor_service.solar_model is not None, "Solar forecast model should be loaded"
    assert predictor_service.demand_model is not None, "Demand forecast model should be loaded"
    assert anomaly_service.model is not None, "Anomaly detection model should be loaded"

def test_forecast_24h_shape_and_bounds():
    forecast = predictor_service.get_24h_forecast(current_soc=60.0)
    assert forecast["forecast_horizon_hours"] == 24
    assert len(forecast["hourly_forecast"]) == 24
    
    # Solar generation must be strictly non-negative
    for pt in forecast["hourly_forecast"]:
        assert pt["predicted_solar_kw"] >= 0.0, f"Solar cannot be negative: {pt['predicted_solar_kw']}"
        assert pt["predicted_demand_kw"] >= 0.0, f"Demand cannot be negative: {pt['predicted_demand_kw']}"
        assert 0.0 <= pt["expected_battery_soc"] <= 100.0, f"SoC must be in [0, 100]: {pt['expected_battery_soc']}"
        
    summary = forecast["summary"]
    assert summary["total_predicted_solar_kwh"] >= 0.0
    assert summary["total_predicted_demand_kwh"] > 0.0

def test_anomaly_detector_normal_vs_outlier():
    # Test nominal reading
    normal_res = anomaly_service.analyze_reading(
        solar_kw=15.0,
        demand_kw=12.0,
        battery_soc=65.0,
        battery_power_kw=3.0,
        ambient_temp_c=26.0,
        grid_import_kw=0.0
    )
    assert normal_res["status"] in ["NORMAL", "SUSPICIOUS"]
    assert normal_res["anomaly_score"] < 0.70
    
    # Test severe outlier (huge load spike)
    spike_res = anomaly_service.analyze_reading(
        solar_kw=0.0,
        demand_kw=55.0,
        battery_soc=10.0,
        battery_power_kw=-25.0,
        ambient_temp_c=52.0,
        grid_import_kw=45.0
    )
    assert spike_res["is_anomaly"] is True
    assert spike_res["anomaly_score"] >= 0.70
    assert spike_res["severity"] in ["HIGH", "CRITICAL"]
