from typing import List, Optional
from pydantic import BaseModel, Field

class HourlyForecastPoint(BaseModel):
    timestamp: str
    hour: int
    predicted_solar_kw: float = Field(..., ge=0.0)
    predicted_demand_kw: float = Field(..., ge=0.0)
    net_predicted_balance_kw: float
    expected_battery_soc: float
    baseline_solar_kw: float
    baseline_demand_kw: float
    is_peak_generation: bool = False
    is_peak_demand: bool = False

class ForecastSummary(BaseModel):
    total_predicted_solar_kwh: float
    total_predicted_demand_kwh: float
    net_predicted_balance_kwh: float
    peak_solar_hour: int
    peak_solar_kw: float
    peak_demand_hour: int
    peak_demand_kw: float
    expected_curtailment_kwh: float
    expected_grid_deficit_kwh: float

class ModelEvaluationScore(BaseModel):
    mae: float
    rmse: float
    baseline_mae: float
    baseline_rmse: float
    improvement_mae_pct: float
    evaluation_samples: int

class ForecastResponse(BaseModel):
    generated_at: str
    forecast_horizon_hours: int = 24
    solar_model_name: str
    demand_model_name: str
    summary: ForecastSummary
    hourly_forecast: List[HourlyForecastPoint]
    model_performance: dict
    explanation: str
    data_source: str = "Trained Regression ML Pipeline (Deterministic Split)"
