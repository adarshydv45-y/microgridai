import pytest
from app.services.recommendation_service import recommendation_engine

def test_charge_recommendation_when_solar_surplus():
    telemetry = {
        "solar_kw": 22.0,
        "demand_kw": 8.0,
        "battery_soc": 40.0
    }
    res = recommendation_engine.generate_recommendations(telemetry)
    assert len(res["recommendations"]) > 0
    actions = [r["action_type"] for r in res["recommendations"]]
    assert "CHARGE_BATTERY" in actions
    
    charge_rec = next(r for r in res["recommendations"] if r["action_type"] == "CHARGE_BATTERY")
    assert "mathematical_basis" in charge_rec
    assert charge_rec["priority"] in ["HIGH", "MEDIUM"]

def test_discharge_recommendation_when_demand_deficit():
    telemetry = {
        "solar_kw": 0.0,
        "demand_kw": 18.0,
        "battery_soc": 75.0
    }
    res = recommendation_engine.generate_recommendations(telemetry)
    actions = [r["action_type"] for r in res["recommendations"]]
    assert "DISCHARGE_BATTERY" in actions

def test_preserve_reserve_when_soc_low():
    telemetry = {
        "solar_kw": 0.0,
        "demand_kw": 15.0,
        "battery_soc": 14.0  # below 15% cutoff
    }
    res = recommendation_engine.generate_recommendations(telemetry)
    actions = [r["action_type"] for r in res["recommendations"]]
    assert "PRESERVE_RESERVE" in actions
