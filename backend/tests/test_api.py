import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_endpoint():
    resp = client.get("/api/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "healthy"
    assert data["service"] == "MicrogridAI"
    assert data["models_loaded"] is True

def test_dashboard_endpoint():
    resp = client.get("/api/dashboard")
    assert resp.status_code == 200
    data = resp.json()
    assert "current_metrics" in data
    assert "forecast_preview" in data
    assert "top_recommendations" in data
    assert "system_info" in data
    assert data["current_metrics"]["solar_kw"] >= 0.0

def test_energy_history_endpoint():
    resp = client.get("/api/energy/history?range=24h")
    assert resp.status_code == 200
    data = resp.json()
    assert data["time_range"] == "24h"
    assert len(data["data"]) == 24
    assert data["total_solar_kwh"] >= 0.0
    assert data["total_demand_kwh"] > 0.0

def test_energy_history_invalid_range():
    resp = client.get("/api/energy/history?range=invalid")
    assert resp.status_code == 400

def test_energy_csv_export():
    resp = client.get("/api/energy/export-csv?range=24h")
    assert resp.status_code == 200
    assert "text/csv" in resp.headers["content-type"]
    assert "timestamp,solar_kw,demand_kw" in resp.text

def test_forecast_endpoint():
    resp = client.get("/api/forecast")
    assert resp.status_code == 200
    data = resp.json()
    assert data["forecast_horizon_hours"] == 24
    assert len(data["hourly_forecast"]) == 24
    assert "summary" in data

def test_anomalies_detect_post():
    payload = {
        "solar_kw": 25.0,
        "demand_kw": 50.0,
        "battery_soc": 10.0,
        "battery_power_kw": -22.0,
        "ambient_temp_c": 52.0,
        "grid_import_kw": 30.0
    }
    resp = client.post("/api/anomalies/detect", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["is_anomaly"] is True
    assert data["anomaly_score"] > 0.5
    assert len(data["explanation"]) > 0

def test_anomalies_list():
    resp = client.get("/api/anomalies")
    assert resp.status_code == 200
    data = resp.json()
    assert "records" in data
    assert "metrics" in data
    assert data["metrics"]["f1_score"] >= 0.0

def test_recommendations_endpoint():
    resp = client.get("/api/recommendations")
    assert resp.status_code == 200
    data = resp.json()
    assert "recommendations" in data
    assert len(data["recommendations"]) > 0

def test_model_metrics():
    resp = client.get("/api/model/metrics")
    assert resp.status_code == 200
    data = resp.json()
    assert "solar_forecast" in data
    assert "demand_forecast" in data
    assert "anomaly_detection" in data
