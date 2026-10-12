from typing import List, Optional
from pydantic import BaseModel, Field

class TelemetryReading(BaseModel):
    timestamp: str = Field(..., description="ISO 8601 formatted timestamp")
    solar_kw: float = Field(..., ge=0.0, description="Solar PV generation in kW")
    demand_kw: float = Field(..., ge=0.0, description="Electricity demand / load in kW")
    battery_soc: float = Field(..., ge=0.0, le=100.0, description="Battery State of Charge in %")
    battery_power_kw: float = Field(..., description="Battery power in kW (+ is charging, - is discharging)")
    grid_import_kw: float = Field(..., ge=0.0, description="Power imported from utility grid in kW")
    grid_export_kw: float = Field(..., ge=0.0, description="Surplus solar exported to grid in kW")
    ambient_temp_c: float = Field(..., description="Ambient temperature in Celsius")
    irradiance_wm2: float = Field(..., ge=0.0, description="Solar irradiance in W/m^2")
    net_power_kw: float = Field(..., description="Net generation surplus/deficit (solar - demand) in kW")

class CurrentMetrics(BaseModel):
    solar_kw: float
    demand_kw: float
    battery_soc: float
    renewable_utilization_pct: float
    grid_import_kw: float
    grid_export_kw: float
    battery_power_kw: float
    net_balance_kw: float
    timestamp: str
    status_summary: str

class DailyEnergySummary(BaseModel):
    date: str
    solar_generated_kwh: float
    demand_consumed_kwh: float
    battery_throughput_kwh: float
    grid_imported_kwh: float
    grid_exported_kwh: float
    renewable_fraction_pct: float

class EnergyHistoryResponse(BaseModel):
    time_range: str
    interval: str
    total_solar_kwh: float
    total_demand_kwh: float
    total_grid_import_kwh: float
    total_grid_export_kwh: float
    renewable_fraction_pct: float
    data: List[TelemetryReading]
    daily_summaries: List[DailyEnergySummary]
    data_source: str = "Deterministic Demonstration Dataset (Microgrid Simulator)"
