import io
import logging
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List
import pandas as pd

from ..config import settings
from ..ml.dataset_generator import generate_telemetry_dataset

logger = logging.getLogger(__name__)

class EnergyService:
    def __init__(self, data_dir: Path = None):
        self.data_dir = data_dir or settings.data_dir
        self._df = None
        
    def get_dataframe(self) -> pd.DataFrame:
        file_path = self.data_dir / "telemetry_history.csv"
        if not file_path.exists():
            logger.info("Initializing telemetry dataset on first access...")
            self._df = generate_telemetry_dataset(
                days=settings.history_days,
                seed=settings.random_seed,
                output_path=file_path
            )
        elif self._df is None:
            self._df = pd.read_csv(file_path)
        return self._df
        
    def refresh_data(self) -> pd.DataFrame:
        file_path = self.data_dir / "telemetry_history.csv"
        self._df = generate_telemetry_dataset(
            days=settings.history_days,
            seed=settings.random_seed,
            output_path=file_path
        )
        return self._df

    def get_current_metrics(self) -> Dict[str, Any]:
        """Returns the most recent real-time microgrid metrics and operational status."""
        df = self.get_dataframe()
        last_row = df.iloc[-1]
        
        solar_kw = float(last_row["solar_kw"])
        demand_kw = float(last_row["demand_kw"])
        battery_soc = float(last_row["battery_soc"])
        battery_power_kw = float(last_row["battery_power_kw"])
        grid_import_kw = float(last_row["grid_import_kw"])
        grid_export_kw = float(last_row["grid_export_kw"])
        net_balance = round(solar_kw - demand_kw, 2)
        
        # Renewable utilization %
        if demand_kw > 0:
            clean_consumed = min(solar_kw, demand_kw) + max(0.0, -battery_power_kw)
            utilization = round(min(100.0, (clean_consumed / demand_kw) * 100.0), 1)
        else:
            utilization = 100.0
            
        status = "Self-Sufficient (Solar & Battery)" if grid_import_kw < 0.5 else "Grid Assisted"
        if net_balance > 5.0 and battery_soc >= settings.battery_max_soc - 2.0:
            status = "Surplus Export Active"
            
        return {
            "solar_kw": solar_kw,
            "demand_kw": demand_kw,
            "battery_soc": battery_soc,
            "renewable_utilization_pct": utilization,
            "grid_import_kw": grid_import_kw,
            "grid_export_kw": grid_export_kw,
            "battery_power_kw": battery_power_kw,
            "net_balance_kw": net_balance,
            "timestamp": str(last_row["timestamp"]),
            "status_summary": status
        }

    def get_history(self, time_range: str = "24h") -> Dict[str, Any]:
        """
        Retrieves filtered telemetry history and daily kWh summaries.
        Supported ranges: '24h', '7d', '30d'.
        """
        df = self.get_dataframe()
        
        if time_range == "24h":
            slice_df = df.tail(24).copy()
        elif time_range == "7d":
            slice_df = df.tail(168).copy()
        elif time_range == "30d":
            slice_df = df.tail(720).copy()
        else:
            slice_df = df.tail(24).copy()
            
        # Calculate energy in kWh (1-hour step: Energy kWh = Power kW * 1h)
        total_solar_kwh = round(float(slice_df["solar_kw"].sum()), 2)
        total_demand_kwh = round(float(slice_df["demand_kw"].sum()), 2)
        total_grid_import_kwh = round(float(slice_df["grid_import_kw"].sum()), 2)
        total_grid_export_kwh = round(float(slice_df["grid_export_kw"].sum()), 2)
        
        # Renewable fraction %
        if total_demand_kwh > 0:
            renewable_frac = round(
                max(0.0, min(100.0, ((total_demand_kwh - total_grid_import_kwh) / total_demand_kwh) * 100.0)),
                1
            )
        else:
            renewable_frac = 100.0
            
        # Group by Date for Daily Summary table
        slice_df["date_str"] = pd.to_datetime(slice_df["timestamp"]).dt.strftime("%Y-%m-%d")
        daily_groups = slice_df.groupby("date_str")
        
        daily_summaries: List[Dict[str, Any]] = []
        for date_val, group in daily_groups:
            s_kwh = round(float(group["solar_kw"].sum()), 2)
            d_kwh = round(float(group["demand_kw"].sum()), 2)
            b_throughput = round(float(group["battery_power_kw"].abs().sum() / 2.0), 2)
            g_in = round(float(group["grid_import_kw"].sum()), 2)
            g_out = round(float(group["grid_export_kw"].sum()), 2)
            rf = round(max(0.0, min(100.0, ((d_kwh - g_in) / d_kwh * 100.0))), 1) if d_kwh > 0 else 100.0
            
            daily_summaries.append({
                "date": date_val,
                "solar_generated_kwh": s_kwh,
                "demand_consumed_kwh": d_kwh,
                "battery_throughput_kwh": b_throughput,
                "grid_imported_kwh": g_in,
                "grid_exported_kwh": g_out,
                "renewable_fraction_pct": rf
            })
            
        data_records = slice_df.to_dict(orient="records")
        for rec in data_records:
            rec.pop("date_str", None)
            
        return {
            "time_range": time_range,
            "interval": "1 Hour (60 min)",
            "total_solar_kwh": total_solar_kwh,
            "total_demand_kwh": total_demand_kwh,
            "total_grid_import_kwh": total_grid_import_kwh,
            "total_grid_export_kwh": total_grid_export_kwh,
            "renewable_fraction_pct": renewable_frac,
            "data": data_records,
            "daily_summaries": daily_summaries,
            "data_source": "Deterministic Demonstration Dataset (Microgrid Simulator)"
        }

    def export_csv(self, time_range: str = "30d") -> str:
        """Exports the requested time range telemetry as a CSV string."""
        history = self.get_history(time_range=time_range)
        records = history["data"]
        export_df = pd.DataFrame(records)
        return export_df.to_csv(index=False)

energy_service = EnergyService()
