import logging
from datetime import datetime
from typing import Dict, Any, List
import pandas as pd

from ..config import settings
from ..ml.predictor import predictor_service

logger = logging.getLogger(__name__)

class RecommendationEngine:
    def __init__(self):
        pass
        
    def generate_recommendations(
        self,
        current_telemetry: Dict[str, Any],
        forecast_data: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """
        Calculates deterministic, rule-based microgrid optimization recommendations
        derived from real power balance math, SoC constraints, and 24-hour forecasts.
        """
        solar_kw = float(current_telemetry.get("solar_kw", 0.0))
        demand_kw = float(current_telemetry.get("demand_kw", 0.0))
        battery_soc = float(current_telemetry.get("battery_soc", 50.0))
        net_power = round(solar_kw - demand_kw, 2)
        
        cap_kwh = settings.battery_capacity_kwh
        min_soc = settings.battery_min_soc
        max_soc = settings.battery_max_soc
        max_rate = settings.battery_max_charge_kw
        
        # Calculate battery headroom and available energy
        headroom_kwh = round(max(0.0, (max_soc - battery_soc) / 100.0 * cap_kwh), 2)
        available_energy_kwh = round(max(0.0, (battery_soc - min_soc) / 100.0 * cap_kwh), 2)
        
        # Pull forecast outlook if available
        if forecast_data is None:
            try:
                forecast_data = predictor_service.get_24h_forecast(current_soc=battery_soc)
            except Exception as e:
                logger.warning(f"Could not fetch forecast in recommendation engine: {e}")
                forecast_data = {}
                
        forecast_summary = forecast_data.get("summary", {})
        hourly_forecast = forecast_data.get("hourly_forecast", [])
        
        # Calculate next 4-hour forward metrics
        next_4h_solar = sum([h.get("predicted_solar_kw", 0.0) for h in hourly_forecast[:4]])
        next_4h_demand = sum([h.get("predicted_demand_kw", 0.0) for h in hourly_forecast[:4]])
        
        recommendations: List[Dict[str, Any]] = []
        rec_id = 1
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        # 1. Solar Surplus & Storage Charging
        if net_power > 0.5:
            if battery_soc < max_soc - 1.0:
                charge_dispatch = min(net_power, max_rate, round(headroom_kwh / settings.battery_charge_efficiency, 2))
                recommendations.append({
                    "id": f"REC-{rec_id:03d}",
                    "action_type": "CHARGE_BATTERY",
                    "title": "Maximize Battery Charging from Solar Surplus",
                    "priority": "HIGH" if headroom_kwh > 5.0 else "MEDIUM",
                    "impact_estimate": f"Absorb +{charge_dispatch:.1f} kW solar surplus locally, saving ~{charge_dispatch * 0.15:.2f} USD/h grid cost.",
                    "reasoning": (
                        f"Current solar generation ({solar_kw:.1f} kW) exceeds facility demand ({demand_kw:.1f} kW) "
                        f"by +{net_power:.1f} kW with {headroom_kwh:.1f} kWh battery capacity remaining."
                    ),
                    "mathematical_basis": (
                        f"P_net = +{net_power:.2f} kW > 0; SoC = {battery_soc:.1f}% < {max_soc}%; "
                        f"Headroom = ({max_soc}% - {battery_soc:.1f}%) * {cap_kwh} kWh = {headroom_kwh:.2f} kWh. "
                        f"Target Charge Rate = min({net_power}, {max_rate}) = {charge_dispatch:.2f} kW."
                    ),
                    "created_at": now_str,
                    "parameters": {
                        "target_charge_kw": charge_dispatch,
                        "headroom_kwh": headroom_kwh,
                        "battery_soc": battery_soc
                    }
                })
                rec_id += 1
            else:
                # Battery full, export surplus
                export_kw = net_power
                recommendations.append({
                    "id": f"REC-{rec_id:03d}",
                    "action_type": "GRID_EXPORT",
                    "title": "Export Surplus Solar Generation or Divert to Dump Load",
                    "priority": "MEDIUM",
                    "impact_estimate": f"Export up to {export_kw:.1f} kW to utility grid or activate thermal heat storage.",
                    "reasoning": (
                        f"Battery SoC is at {battery_soc:.1f}% (upper ceiling {max_soc}%). "
                        f"Continuous solar surplus cannot be chemically stored."
                    ),
                    "mathematical_basis": (
                        f"P_net = +{net_power:.2f} kW; SoC = {battery_soc:.1f}% >= ({max_soc}% - 1.0%). "
                        f"Available Curtailment/Export Rate = {export_kw:.2f} kW."
                    ),
                    "created_at": now_str,
                    "parameters": {"export_kw": export_kw, "battery_soc": battery_soc}
                })
                rec_id += 1
                
        # 2. Deficit & Peak Shaving Discharge
        elif net_power < -0.5:
            deficit = abs(net_power)
            if battery_soc > min_soc + 5.0 and available_energy_kwh > 2.0:
                discharge_dispatch = min(deficit, max_rate, round(available_energy_kwh * settings.battery_discharge_efficiency, 2))
                recommendations.append({
                    "id": f"REC-{rec_id:03d}",
                    "action_type": "DISCHARGE_BATTERY",
                    "title": "Discharge Battery to Offset High Grid Demand",
                    "priority": "HIGH",
                    "impact_estimate": f"Offset {discharge_dispatch:.1f} kW of peak grid import, preserving grid transformer capacity.",
                    "reasoning": (
                        f"Microgrid load ({demand_kw:.1f} kW) exceeds current PV generation ({solar_kw:.1f} kW). "
                        f"Usable battery reserve is {available_energy_kwh:.1f} kWh above the {min_soc}% emergency buffer."
                    ),
                    "mathematical_basis": (
                        f"Deficit = {deficit:.2f} kW; SoC = {battery_soc:.1f}% > {min_soc}%; "
                        f"Usable Energy = ({battery_soc:.1f}% - {min_soc}%) * {cap_kwh} kWh = {available_energy_kwh:.2f} kWh. "
                        f"Discharge Dispatch = min({deficit}, {max_rate}) = {discharge_dispatch:.2f} kW."
                    ),
                    "created_at": now_str,
                    "parameters": {
                        "target_discharge_kw": discharge_dispatch,
                        "available_energy_kwh": available_energy_kwh,
                        "battery_soc": battery_soc
                    }
                })
                rec_id += 1
            else:
                recommendations.append({
                    "id": f"REC-{rec_id:03d}",
                    "action_type": "PRESERVE_RESERVE",
                    "title": "Preserve Battery Reserve & Inhibit Deep Discharge",
                    "priority": "HIGH",
                    "impact_estimate": "Protect battery cell longevity and avoid low-voltage shutdown.",
                    "reasoning": (
                        f"Battery SoC ({battery_soc:.1f}%) is at or near minimum threshold ({min_soc}%). "
                        f"Further discharge prohibited to prevent irreversible lithium cell degradation."
                    ),
                    "mathematical_basis": (
                        f"SoC = {battery_soc:.1f}% <= ({min_soc}% + 5.0%). Minimum cutoff enforced at {min_soc}%."
                    ),
                    "created_at": now_str,
                    "parameters": {"battery_soc": battery_soc, "min_soc": min_soc}
                })
                rec_id += 1

        # 3. Forward-Looking Forecast Recommendations
        if next_4h_solar < 3.0 and battery_soc < 35.0:
            recommendations.append({
                "id": f"REC-{rec_id:03d}",
                "action_type": "DEMAND_RESPONSE",
                "title": "Upcoming Low-Solar Period: Initiate Demand Conservation",
                "priority": "HIGH",
                "impact_estimate": "Anticipate grid import spike of ~15-20 kWh over next 4 hours.",
                "reasoning": (
                    f"AI forecast indicates only {next_4h_solar:.1f} kWh solar generation over the next 4 hours, "
                    f"while projected demand is {next_4h_demand:.1f} kWh."
                ),
                "mathematical_basis": (
                    f"Forecast 4h Solar = {next_4h_solar:.2f} kWh; Forecast 4h Demand = {next_4h_demand:.2f} kWh; "
                    f"Net 4h Projected Deficit = {next_4h_demand - next_4h_solar:.2f} kWh."
                ),
                "created_at": now_str,
                "parameters": {"next_4h_solar_kwh": round(next_4h_solar, 2), "next_4h_demand_kwh": round(next_4h_demand, 2)}
            })
            rec_id += 1
            
        # 4. 24h Energy Balance Optimization
        net_24h = forecast_summary.get("net_predicted_balance_kwh", 0.0)
        if net_24h > 15.0 and headroom_kwh < 10.0:
            recommendations.append({
                "id": f"REC-{rec_id:03d}",
                "action_type": "SCHEDULE_LOAD",
                "title": "Schedule Discretionary Heavy Loads for Midday Solar Peak",
                "priority": "LOW",
                "impact_estimate": "Increase direct self-consumption by 18-25% without grid cycling.",
                "reasoning": (
                    f"Solar forecast projects a net 24h surplus of {net_24h:.1f} kWh peaking at "
                    f"{forecast_summary.get('peak_solar_kw', 20.0):.1f} kW at {forecast_summary.get('peak_solar_hour', 12):02d}:00."
                ),
                "mathematical_basis": (
                    f"Peak Solar = {forecast_summary.get('peak_solar_kw', 0.0)} kW at {forecast_summary.get('peak_solar_hour', 12)}:00; "
                    f"Total 24h Net Generation = {net_24h:.2f} kWh."
                ),
                "created_at": now_str,
                "parameters": {"peak_hour": forecast_summary.get("peak_solar_hour", 12), "net_24h_kwh": net_24h}
            })
            rec_id += 1
            
        system_status = "OPTIMAL" if len([r for r in recommendations if r["priority"] == "HIGH"]) == 0 else "ACTION_RECOMMENDED"
        
        return {
            "timestamp": now_str,
            "system_status": system_status,
            "current_net_power_kw": net_power,
            "battery_headroom_kwh": headroom_kwh,
            "recommendations": recommendations,
            "calculation_basis": (
                f"Configured Limits: Battery Capacity {cap_kwh} kWh, Safe SoC [{min_soc}% - {max_soc}%], "
                f"Max Charge/Discharge {max_rate} kW. Evaluated against real-time power balance and 24h forecast."
            )
        }

recommendation_engine = RecommendationEngine()
