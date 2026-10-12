import json
import logging
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, Any, List
import joblib
import numpy as np
import pandas as pd

from ..config import settings
from .train_models import FEATURE_COLS_SOLAR, FEATURE_COLS_DEMAND

logger = logging.getLogger(__name__)

class EnergyPredictor:
    def __init__(self, models_dir: Path = None, data_dir: Path = None):
        self.models_dir = models_dir or settings.models_dir
        self.data_dir = data_dir or settings.data_dir
        self.solar_model = None
        self.demand_model = None
        self.metrics = {}
        self._cached_forecast = None
        self._cached_time = None
        self._cached_soc = None
        self.load_models()
        
    def load_models(self):
        solar_path = self.models_dir / "solar_forecast_model.joblib"
        demand_path = self.models_dir / "demand_forecast_model.joblib"
        metrics_path = self.models_dir / "metrics.json"
        
        if solar_path.exists() and demand_path.exists():
            try:
                self.solar_model = joblib.load(solar_path)
                self.demand_model = joblib.load(demand_path)
                if metrics_path.exists():
                    with open(metrics_path, "r") as f:
                        self.metrics = json.load(f)
                logger.info("Forecasting models loaded successfully.")
            except Exception as e:
                logger.error(f"Error loading forecasting models: {e}")
        else:
            logger.warning("Forecasting model files not found on disk yet.")
            
    def get_24h_forecast(self, current_soc: float = None) -> Dict[str, Any]:
        """
        Generates a 24-hour ahead forecast using the trained ML models and recent telemetry.
        """
        now = datetime.now()
        if (
            self._cached_forecast is not None
            and self._cached_time is not None
            and (now - self._cached_time).total_seconds() < 5.0
            and (current_soc is None or abs(current_soc - (self._cached_soc or current_soc)) < 0.1)
        ):
            return self._cached_forecast

        if self.solar_model is None or self.demand_model is None:
            self.load_models()
            
        telemetry_file = self.data_dir / "telemetry_history.csv"
        if not telemetry_file.exists():
            raise FileNotFoundError("Telemetry history file not found. Please initialize data.")
            
        history_df = pd.read_csv(telemetry_file)
        history_df["dt"] = pd.to_datetime(history_df["timestamp"])
        last_dt = history_df["dt"].iloc[-1]
        
        if current_soc is None:
            current_soc = float(history_df["battery_soc"].iloc[-1])
            
        # Build 24 future hourly timestamps
        future_timestamps = [last_dt + timedelta(hours=i+1) for i in range(24)]
        
        # Prepare inputs for each future hour
        hourly_forecasts: List[Dict[str, Any]] = []
        sim_soc = current_soc
        
        total_pred_solar_kwh = 0.0
        total_pred_demand_kwh = 0.0
        peak_solar_kw = -1.0
        peak_solar_hour = 0
        peak_demand_kw = -1.0
        peak_demand_hour = 0
        expected_curtailment_kwh = 0.0
        expected_grid_deficit_kwh = 0.0
        
        # Get past 48 hours from history for lag lookups
        recent_solar = history_df["solar_kw"].values
        recent_demand = history_df["demand_kw"].values
        
        # Dynamic rolling forecast across 24 steps
        rolling_solar = list(recent_solar)
        rolling_demand = list(recent_demand)
        
        for i, ts in enumerate(future_timestamps):
            h = ts.hour
            dow = ts.dayofweek
            is_wknd = 1 if dow >= 5 else 0
            
            h_sin = np.sin(2 * np.pi * h / 24.0)
            h_cos = np.cos(2 * np.pi * h / 24.0)
            dow_sin = np.sin(2 * np.pi * dow / 7.0)
            dow_cos = np.cos(2 * np.pi * dow / 7.0)
            
            # Weather extrapolation
            temp_est = 24.0 + 7.0 * np.sin(2 * np.pi * (h - 9) / 24.0)
            solar_elevation = max(0.0, np.sin(np.pi * (h - 6) / 12.0)) if 6 <= h <= 18 else 0.0
            irradiance_est = 1000.0 * (solar_elevation ** 1.1) * 0.9  # approx 10% clear clouds
            cloud_est = 15.0
            
            # Lags from rolling lists
            # t-1, t-24, t-48
            s_lag_1 = rolling_solar[-1]
            s_lag_24 = rolling_solar[-24] if len(rolling_solar) >= 24 else s_lag_1
            s_lag_48 = rolling_solar[-48] if len(rolling_solar) >= 48 else s_lag_24
            s_rolling_24 = float(np.mean(rolling_solar[-24:]))
            
            d_lag_1 = rolling_demand[-1]
            d_lag_24 = rolling_demand[-24] if len(rolling_demand) >= 24 else d_lag_1
            d_lag_48 = rolling_demand[-48] if len(rolling_demand) >= 48 else d_lag_24
            d_rolling_24 = float(np.mean(rolling_demand[-24:]))
            
            solar_feats = pd.DataFrame([[
                h, h_sin, h_cos, dow, dow_sin, dow_cos, is_wknd,
                temp_est, irradiance_est, cloud_est,
                s_lag_1, s_lag_24, s_lag_48, s_rolling_24
            ]], columns=FEATURE_COLS_SOLAR)
            
            demand_feats = pd.DataFrame([[
                h, h_sin, h_cos, dow, dow_sin, dow_cos, is_wknd,
                temp_est,
                d_lag_1, d_lag_24, d_lag_48, d_rolling_24
            ]], columns=FEATURE_COLS_DEMAND)
            
            # Predict
            if self.solar_model is not None and (6 <= h <= 18):
                p_solar = float(np.maximum(0.0, self.solar_model.predict(solar_feats)[0]))
            else:
                p_solar = 0.0
                
            if self.demand_model is not None:
                p_demand = float(np.maximum(3.0, self.demand_model.predict(demand_feats)[0]))
            else:
                p_demand = max(3.0, d_lag_24)
                
            p_solar = round(p_solar, 2)
            p_demand = round(p_demand, 2)
            net_bal = round(p_solar - p_demand, 2)
            
            # Append to rolling
            rolling_solar.append(p_solar)
            rolling_demand.append(p_demand)
            
            # Accumulators
            total_pred_solar_kwh += p_solar * 1.0
            total_pred_demand_kwh += p_demand * 1.0
            
            if p_solar > peak_solar_kw:
                peak_solar_kw = p_solar
                peak_solar_hour = h
                
            if p_demand > peak_demand_kw:
                peak_demand_kw = p_demand
                peak_demand_hour = h
                
            # Simulate SoC change for expected battery trace
            cap = settings.battery_capacity_kwh
            if net_bal > 0:
                headroom = max(0.0, (settings.battery_max_soc - sim_soc) / 100.0 * cap)
                charge_kw = min(net_bal, settings.battery_max_charge_kw, headroom / settings.battery_charge_efficiency)
                sim_soc = min(settings.battery_max_soc, sim_soc + (charge_kw * settings.battery_charge_efficiency / cap) * 100.0)
                curtailment = max(0.0, net_bal - charge_kw)
                expected_curtailment_kwh += curtailment
            else:
                deficit = abs(net_bal)
                avail_energy = max(0.0, (sim_soc - settings.battery_min_soc) / 100.0 * cap)
                discharge_kw = min(deficit, settings.battery_max_discharge_kw, avail_energy * settings.battery_discharge_efficiency)
                sim_soc = max(settings.battery_min_soc, sim_soc - (discharge_kw / (settings.battery_discharge_efficiency * cap)) * 100.0)
                grid_shortfall = max(0.0, deficit - discharge_kw)
                expected_grid_deficit_kwh += grid_shortfall
                
            hourly_forecasts.append({
                "timestamp": ts.strftime("%Y-%m-%d %H:%M:%S"),
                "hour": h,
                "predicted_solar_kw": p_solar,
                "predicted_demand_kw": p_demand,
                "net_predicted_balance_kw": net_bal,
                "expected_battery_soc": round(sim_soc, 1),
                "baseline_solar_kw": round(float(s_lag_24), 2),
                "baseline_demand_kw": round(float(d_lag_24), 2),
                "is_peak_generation": False,
                "is_peak_demand": False
            })
            
        # Flag peak points
        for pt in hourly_forecasts:
            if pt["hour"] == peak_solar_hour and peak_solar_kw > 0.5:
                pt["is_peak_generation"] = True
            if pt["hour"] == peak_demand_hour:
                pt["is_peak_demand"] = True
                
        summary = {
            "total_predicted_solar_kwh": round(total_pred_solar_kwh, 2),
            "total_predicted_demand_kwh": round(total_pred_demand_kwh, 2),
            "net_predicted_balance_kwh": round(total_pred_solar_kwh - total_pred_demand_kwh, 2),
            "peak_solar_hour": peak_solar_hour,
            "peak_solar_kw": round(peak_solar_kw, 2),
            "peak_demand_hour": peak_demand_hour,
            "peak_demand_kw": round(peak_demand_kw, 2),
            "expected_curtailment_kwh": round(expected_curtailment_kwh, 2),
            "expected_grid_deficit_kwh": round(expected_grid_deficit_kwh, 2)
        }
        
        explanation = (
            f"Next 24h outlook: Solar generation estimated at {summary['total_predicted_solar_kwh']} kWh with "
            f"peak of {summary['peak_solar_kw']} kW around {peak_solar_hour:02d}:00. Total load demand estimated at "
            f"{summary['total_predicted_demand_kwh']} kWh peaking at {summary['peak_demand_kw']} kW at {peak_demand_hour:02d}:00. "
            f"Net energy balance: {summary['net_predicted_balance_kwh']:+.1f} kWh."
        )
        
        result = {
            "generated_at": datetime.now().isoformat(),
            "forecast_horizon_hours": 24,
            "solar_model_name": "GradientBoostingRegressor (v1.0)",
            "demand_model_name": "GradientBoostingRegressor (v1.0)",
            "summary": summary,
            "hourly_forecast": hourly_forecasts,
            "model_performance": self.metrics,
            "explanation": explanation,
            "data_source": "Trained Regression ML Pipeline (Deterministic Split)"
        }
        self._cached_forecast = result
        self._cached_time = now
        self._cached_soc = current_soc
        return result

predictor_service = EnergyPredictor()
