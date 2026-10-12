from typing import List, Optional
from pydantic import BaseModel, Field
from .energy import CurrentMetrics
from .forecast import ForecastSummary

class EnergyRecommendation(BaseModel):
    id: str
    action_type: str  # CHARGE_BATTERY, DISCHARGE_BATTERY, PRESERVE_RESERVE, DEMAND_RESPONSE, GRID_EXPORT, SYSTEM_ALERT
    title: str
    priority: str  # HIGH, MEDIUM, LOW
    impact_estimate: str
    reasoning: str
    mathematical_basis: str
    created_at: str
    parameters: dict = Field(default_factory=dict)

class RecommendationsResponse(BaseModel):
    timestamp: str
    system_status: str
    current_net_power_kw: float
    battery_headroom_kwh: float
    recommendations: List[EnergyRecommendation]
    calculation_basis: str

class SystemInfoResponse(BaseModel):
    service_name: str
    version: str
    status: str
    data_source: str
    is_live_telemetry: bool = False
    last_refresh_timestamp: str
    ml_models: dict
    cloud_environment: str
    host: str
    port: int

class DashboardResponse(BaseModel):
    system_info: SystemInfoResponse
    current_metrics: CurrentMetrics
    forecast_preview: ForecastSummary
    top_recommendations: List[EnergyRecommendation]
    recent_alerts: List[dict]
