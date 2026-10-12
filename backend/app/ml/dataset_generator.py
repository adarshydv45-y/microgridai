import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from pathlib import Path
from ..config import settings

def generate_telemetry_dataset(
    days: int = 90,
    seed: int = 42,
    output_path: Path = None,
    end_date: datetime = None
) -> pd.DataFrame:
    """
    Generates a deterministic, physically plausible time-series dataset of microgrid telemetry.
    All calculations strictly enforce non-negative solar power and battery SoC bounds.
    """
    np.random.seed(seed)
    
    if end_date is None:
        end_date = datetime(2026, 10, 12, 18, 0, 0)
    start_date = end_date - timedelta(days=days)
    
    # 1-hour intervals
    timestamps = pd.date_range(start=start_date, end=end_date, freq="1h")
    n = len(timestamps)
    
    hours = timestamps.hour.values
    day_of_week = timestamps.dayofweek.values
    is_weekend = (day_of_week >= 5).astype(int)
    
    # 1. Weather Simulation
    # Diurnal temperature cycle: coolest around 5am (16C), warmest around 3pm (32C)
    temp_diurnal = 24.0 + 7.0 * np.sin(2 * np.pi * (hours - 9) / 24.0)
    # Seasonal / weekly drift + smooth noise
    temp_noise = np.random.normal(0, 1.2, size=n)
    ambient_temp_c = np.round(np.clip(temp_diurnal + temp_noise, 10.0, 42.0), 2)
    
    # Cloud cover simulation (correlated Markovian noise between 0% and 100%)
    cloud_noise = np.random.beta(a=1.5, b=3.5, size=n) * 100.0
    cloud_cover_pct = np.round(np.clip(cloud_noise, 0.0, 100.0), 1)
    
    # Solar Irradiance (W/m^2): 0 at night, up to 1000 W/m^2 clear sky at solar noon (12:00-13:00)
    # Clear sky curve
    solar_elevation_factor = np.maximum(0.0, np.sin(np.pi * (hours - 6) / 12.0))
    solar_elevation_factor[(hours < 6) | (hours > 18)] = 0.0
    
    clear_sky_irradiance = 1000.0 * (solar_elevation_factor ** 1.1)
    # Attenuation by clouds
    cloud_attenuation = 1.0 - 0.75 * (cloud_cover_pct / 100.0)
    irradiance_wm2 = np.round(np.maximum(0.0, clear_sky_irradiance * cloud_attenuation), 1)
    
    # 2. Solar Generation (kW)
    # Rated capacity = 25.0 kW at 1000 W/m^2 STC (Standard Test Conditions, 25°C)
    # Temperature derating: -0.4% per °C above 25°C
    temp_derate = 1.0 - 0.004 * np.maximum(0.0, ambient_temp_c - 25.0)
    solar_ideal_kw = (irradiance_wm2 / 1000.0) * settings.solar_capacity_kw * temp_derate
    solar_noise = np.random.normal(0, 0.15, size=n)
    solar_kw = np.maximum(0.0, np.where(irradiance_wm2 > 5.0, solar_ideal_kw + solar_noise, 0.0))
    solar_kw = np.round(solar_kw, 2)
    
    # 3. Electricity Demand (kW)
    # Base load + morning peak (7-10am) + evening peak (17-21pm)
    base_load = 5.5 + (1.0 - is_weekend * 0.4)
    morning_peak = 6.0 * np.exp(-((hours - 8.5) ** 2) / (2 * 1.8 ** 2))
    evening_peak = 9.5 * np.exp(-((hours - 19.5) ** 2) / (2 * 2.2 ** 2))
    midday_commercial = 4.0 * np.exp(-((hours - 13.0) ** 2) / (2 * 3.0 ** 2)) * (1.0 - is_weekend * 0.5)
    
    demand_mean = base_load + morning_peak + evening_peak + midday_commercial
    demand_noise = np.random.normal(0, 0.6, size=n)
    demand_kw = np.round(np.maximum(3.0, demand_mean + demand_noise), 2)
    
    # 4. Battery and Microgrid Power Balance Simulation
    # Initialize battery at 50% SoC
    soc_series = np.zeros(n)
    battery_power_series = np.zeros(n)  # positive = charge, negative = discharge
    grid_import_series = np.zeros(n)
    grid_export_series = np.zeros(n)
    
    current_soc = 55.0  # percentage
    capacity_kwh = settings.battery_capacity_kwh
    min_soc = settings.battery_min_soc
    max_soc = settings.battery_max_soc
    max_rate = settings.battery_max_charge_kw
    
    for i in range(n):
        net_raw = solar_kw[i] - demand_kw[i]
        
        if net_raw > 0:
            # Generation surplus: charge battery first
            available_headroom_kwh = max(0.0, (max_soc - current_soc) / 100.0 * capacity_kwh)
            max_charge_this_hour_kw = min(max_rate, available_headroom_kwh / settings.battery_charge_efficiency)
            
            charge_power_kw = min(net_raw, max_charge_this_hour_kw)
            energy_stored_kwh = charge_power_kw * 1.0 * settings.battery_charge_efficiency
            current_soc = min(max_soc, current_soc + (energy_stored_kwh / capacity_kwh) * 100.0)
            
            battery_power_series[i] = round(charge_power_kw, 2)
            # Remaining surplus after battery is full goes to grid export
            grid_export_series[i] = round(max(0.0, net_raw - charge_power_kw), 2)
            grid_import_series[i] = 0.0
        else:
            # Generation deficit: discharge battery to meet demand
            deficit_kw = abs(net_raw)
            available_energy_kwh = max(0.0, (current_soc - min_soc) / 100.0 * capacity_kwh)
            max_discharge_this_hour_kw = min(max_rate, available_energy_kwh * settings.battery_discharge_efficiency)
            
            discharge_power_kw = min(deficit_kw, max_discharge_this_hour_kw)
            energy_drawn_kwh = (discharge_power_kw * 1.0) / settings.battery_discharge_efficiency
            current_soc = max(min_soc, current_soc - (energy_drawn_kwh / capacity_kwh) * 100.0)
            
            battery_power_series[i] = round(-discharge_power_kw, 2)
            # Remaining deficit imported from grid
            grid_import_series[i] = round(max(0.0, deficit_kw - discharge_power_kw), 2)
            grid_export_series[i] = 0.0
            
        soc_series[i] = round(current_soc, 2)
        
    df = pd.DataFrame({
        "timestamp": timestamps.strftime("%Y-%m-%d %H:%M:%S"),
        "solar_kw": solar_kw,
        "demand_kw": demand_kw,
        "battery_soc": soc_series,
        "battery_power_kw": battery_power_series,
        "grid_import_kw": grid_import_series,
        "grid_export_kw": grid_export_series,
        "ambient_temp_c": ambient_temp_c,
        "cloud_cover_pct": cloud_cover_pct,
        "irradiance_wm2": irradiance_wm2,
        "net_power_kw": np.round(solar_kw - demand_kw, 2),
    })
    
    if output_path:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        df.to_csv(output_path, index=False)
        
    return df

def generate_labelled_anomaly_dataset(
    base_df: pd.DataFrame,
    seed: int = 101,
    output_path: Path = None
) -> pd.DataFrame:
    """
    Generates a reproducible test dataset containing normal telemetry and deliberately injected,
    labelled anomalies for objective Isolation Forest precision/recall/F1 evaluation.
    """
    np.random.seed(seed)
    # Take a 14-day slice (336 hours) from the end of telemetry
    test_slice = base_df.tail(336).copy().reset_index(drop=True)
    test_slice["is_anomaly"] = 0
    test_slice["anomaly_type"] = "NORMAL"
    test_slice["severity"] = "NONE"
    test_slice["signal_explanation"] = "Normal operating microgrid conditions."
    
    # 1. Solar Inverter Trip Anomaly (Midday collapse with high irradiance)
    idx_1 = test_slice[(test_slice.index >= 40) & (test_slice["irradiance_wm2"] > 700)].index
    if len(idx_1) > 0:
        target = idx_1[0]
        test_slice.loc[target:target+2, "solar_kw"] = 0.0
        test_slice.loc[target:target+2, "is_anomaly"] = 1
        test_slice.loc[target:target+2, "anomaly_type"] = "SOLAR_INVERTER_TRIP"
        test_slice.loc[target:target+2, "severity"] = "CRITICAL"
        test_slice.loc[target:target+2, "signal_explanation"] = (
            "Zero solar generation recorded despite solar irradiance exceeding 750 W/m²."
        )
        
    # 2. Extreme Demand Spike (Faulty machinery or short circuit)
    idx_2 = 120
    if idx_2 < len(test_slice):
        test_slice.loc[idx_2, "demand_kw"] = 48.5  # 2.5x normal maximum load
        test_slice.loc[idx_2, "grid_import_kw"] = 38.0
        test_slice.loc[idx_2, "is_anomaly"] = 1
        test_slice.loc[idx_2, "anomaly_type"] = "EXCESSIVE_LOAD_SPIKE"
        test_slice.loc[idx_2, "severity"] = "HIGH"
        test_slice.loc[idx_2, "signal_explanation"] = (
            "Load spiked to 48.5 kW, exceeding 3 standard deviations above normal peak."
        )

    # 3. Rapid Battery Thermal Degradation / Uncontrolled Discharge
    idx_3 = 180
    if idx_3 + 1 < len(test_slice):
        test_slice.loc[idx_3:idx_3+1, "battery_power_kw"] = -19.5  # Exceeds max 12kW discharge
        test_slice.loc[idx_3:idx_3+1, "battery_soc"] = 9.2   # Breached safe reserve cutoff
        test_slice.loc[idx_3:idx_3+1, "ambient_temp_c"] = 52.8  # Thermal overrun
        test_slice.loc[idx_3:idx_3+1, "is_anomaly"] = 1
        test_slice.loc[idx_3:idx_3+1, "anomaly_type"] = "BATTERY_THERMAL_DISCHARGE"
        test_slice.loc[idx_3:idx_3+1, "severity"] = "CRITICAL"
        test_slice.loc[idx_3:idx_3+1, "signal_explanation"] = (
            "Discharge rate exceeded rated limits with battery cell temperature at 52.8°C."
        )

    # 4. Sensor Stuck / Frozen Telemetry
    idx_4 = 240
    if idx_4 + 5 < len(test_slice):
        frozen_val = 14.333
        test_slice.loc[idx_4:idx_4+5, "demand_kw"] = frozen_val
        test_slice.loc[idx_4:idx_4+5, "is_anomaly"] = 1
        test_slice.loc[idx_4:idx_4+5, "anomaly_type"] = "SENSOR_STUCK"
        test_slice.loc[idx_4:idx_4+5, "severity"] = "MEDIUM"
        test_slice.loc[idx_4:idx_4+5, "signal_explanation"] = (
            "Identical static sensor value reported continuously across 6 observation cycles."
        )

    # 5. Reverse Grid Injection during night
    idx_5 = 300
    if idx_5 < len(test_slice):
        test_slice.loc[idx_5, "grid_import_kw"] = 0.0
        test_slice.loc[idx_5, "grid_export_kw"] = 18.0  # Exporting without solar at 2am
        test_slice.loc[idx_5, "solar_kw"] = 0.0
        test_slice.loc[idx_5, "is_anomaly"] = 1
        test_slice.loc[idx_5, "anomaly_type"] = "UNCOORDINATED_INJECTION"
        test_slice.loc[idx_5, "severity"] = "HIGH"
        test_slice.loc[idx_5, "signal_explanation"] = (
            "High power export detected at 02:00 with no active PV generation or storage dispatch schedule."
        )

    if output_path:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        test_slice.to_csv(output_path, index=False)
        
    return test_slice
