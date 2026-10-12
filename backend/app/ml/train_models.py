import json
import logging
from datetime import datetime
from pathlib import Path
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor, IsolationForest
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score, precision_score, recall_score, f1_score, confusion_matrix

from ..config import settings
from .dataset_generator import generate_telemetry_dataset, generate_labelled_anomaly_dataset

logger = logging.getLogger(__name__)

FEATURE_COLS_SOLAR = [
    "hour", "hour_sin", "hour_cos", "day_of_week", "dayofweek_sin", "dayofweek_cos", "is_weekend",
    "ambient_temp_c", "irradiance_wm2", "cloud_cover_pct",
    "solar_lag_1h", "solar_lag_24h", "solar_lag_48h", "solar_rolling_mean_24h"
]

FEATURE_COLS_DEMAND = [
    "hour", "hour_sin", "hour_cos", "day_of_week", "dayofweek_sin", "dayofweek_cos", "is_weekend",
    "ambient_temp_c",
    "demand_lag_1h", "demand_lag_24h", "demand_lag_48h", "demand_rolling_mean_24h"
]

ANOMALY_FEATURES = [
    "solar_kw", "demand_kw", "battery_soc", "battery_power_kw", "ambient_temp_c", "grid_import_kw"
]

def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """Computes temporal, lag, and rolling features for time-series forecasting."""
    data = df.copy()
    data["dt"] = pd.to_datetime(data["timestamp"])
    data["hour"] = data["dt"].dt.hour
    data["day_of_week"] = data["dt"].dt.dayofweek
    data["is_weekend"] = (data["day_of_week"] >= 5).astype(int)
    
    # Cyclical representations
    data["hour_sin"] = np.sin(2 * np.pi * data["hour"] / 24.0)
    data["hour_cos"] = np.cos(2 * np.pi * data["hour"] / 24.0)
    data["dayofweek_sin"] = np.sin(2 * np.pi * data["day_of_week"] / 7.0)
    data["dayofweek_cos"] = np.cos(2 * np.pi * data["day_of_week"] / 7.0)
    
    # Lag features
    data["solar_lag_1h"] = data["solar_kw"].shift(1)
    data["solar_lag_24h"] = data["solar_kw"].shift(24)
    data["solar_lag_48h"] = data["solar_kw"].shift(48)
    data["solar_rolling_mean_24h"] = data["solar_kw"].shift(1).rolling(window=24, min_periods=1).mean()
    
    data["demand_lag_1h"] = data["demand_kw"].shift(1)
    data["demand_lag_24h"] = data["demand_kw"].shift(24)
    data["demand_lag_48h"] = data["demand_kw"].shift(48)
    data["demand_rolling_mean_24h"] = data["demand_kw"].shift(1).rolling(window=24, min_periods=1).mean()
    
    return data

def train_and_evaluate_models(data_dir: Path = None, models_dir: Path = None) -> dict:
    """
    Executes full ML training pipeline:
    1. Generates / loads telemetry and anomaly datasets.
    2. Chronological train/test split (80% train, 20% test).
    3. Trains HistGradientBoosting models for Solar & Demand forecasting.
    4. Evaluates against persistence baselines.
    5. Trains Isolation Forest for anomaly detection and benchmarks against labelled ground truth.
    6. Persists models and metric artifacts to disk.
    """
    data_dir = data_dir or settings.data_dir
    models_dir = models_dir or settings.models_dir
    data_dir.mkdir(parents=True, exist_ok=True)
    models_dir.mkdir(parents=True, exist_ok=True)
    
    telemetry_file = data_dir / "telemetry_history.csv"
    anomalies_file = data_dir / "test_anomalies.csv"
    
    # Generate datasets if not present
    if not telemetry_file.exists():
        logger.info("Generating deterministic demonstration telemetry dataset...")
        base_df = generate_telemetry_dataset(days=settings.history_days, seed=settings.random_seed, output_path=telemetry_file)
    else:
        base_df = pd.read_csv(telemetry_file)
        
    if not anomalies_file.exists():
        logger.info("Generating labelled anomaly evaluation dataset...")
        anomaly_df = generate_labelled_anomaly_dataset(base_df, seed=101, output_path=anomalies_file)
    else:
        anomaly_df = pd.read_csv(anomalies_file)
        
    # Feature engineering for forecasting
    feat_df = engineer_features(base_df)
    # Drop rows with NaN from lags (first 48 hours)
    clean_df = feat_df.dropna().reset_index(drop=True)
    
    # Chronological Split (80% Train, 20% Test)
    split_idx = int(len(clean_df) * 0.8)
    train_df = clean_df.iloc[:split_idx].copy()
    test_df = clean_df.iloc[split_idx:].copy()
    
    # ----------------- 1. Solar Generation Model -----------------
    X_train_solar = train_df[FEATURE_COLS_SOLAR]
    y_train_solar = train_df["solar_kw"]
    X_test_solar = test_df[FEATURE_COLS_SOLAR]
    y_test_solar = test_df["solar_kw"]
    
    solar_model = GradientBoostingRegressor(
        n_estimators=80,
        max_depth=5,
        min_samples_leaf=15,
        random_state=settings.random_seed,
        loss="squared_error"
    )
    solar_model.fit(X_train_solar, y_train_solar)
    
    y_pred_solar = np.maximum(0.0, solar_model.predict(X_test_solar))
    # Persistence baseline: same hour yesterday (solar_lag_24h)
    y_baseline_solar = test_df["solar_lag_24h"].values
    
    solar_mae = float(round(mean_absolute_error(y_test_solar, y_pred_solar), 3))
    solar_rmse = float(round(np.sqrt(mean_squared_error(y_test_solar, y_pred_solar)), 3))
    solar_r2 = float(round(r2_score(y_test_solar, y_pred_solar), 3))
    
    base_solar_mae = float(round(mean_absolute_error(y_test_solar, y_baseline_solar), 3))
    base_solar_rmse = float(round(np.sqrt(mean_squared_error(y_test_solar, y_baseline_solar)), 3))
    solar_improvement_pct = float(round(((base_solar_mae - solar_mae) / base_solar_mae) * 100.0, 1))
    
    # ----------------- 2. Electricity Demand Model -----------------
    X_train_demand = train_df[FEATURE_COLS_DEMAND]
    y_train_demand = train_df["demand_kw"]
    X_test_demand = test_df[FEATURE_COLS_DEMAND]
    y_test_demand = test_df["demand_kw"]
    
    demand_model = GradientBoostingRegressor(
        n_estimators=80,
        max_depth=5,
        min_samples_leaf=15,
        random_state=settings.random_seed,
        loss="squared_error"
    )
    demand_model.fit(X_train_demand, y_train_demand)
    
    y_pred_demand = np.maximum(0.0, demand_model.predict(X_test_demand))
    y_baseline_demand = test_df["demand_lag_24h"].values
    
    demand_mae = float(round(mean_absolute_error(y_test_demand, y_pred_demand), 3))
    demand_rmse = float(round(np.sqrt(mean_squared_error(y_test_demand, y_pred_demand)), 3))
    demand_r2 = float(round(r2_score(y_test_demand, y_pred_demand), 3))
    
    base_demand_mae = float(round(mean_absolute_error(y_test_demand, y_baseline_demand), 3))
    base_demand_rmse = float(round(np.sqrt(mean_squared_error(y_test_demand, y_baseline_demand)), 3))
    demand_improvement_pct = float(round(((base_demand_mae - demand_mae) / base_demand_mae) * 100.0, 1))
    
    # ----------------- 3. Isolation Forest Anomaly Detection -----------------
    X_train_anomaly = train_df[ANOMALY_FEATURES]
    iso_forest = IsolationForest(
        n_estimators=150,
        contamination=0.04,
        random_state=settings.random_seed,
        n_jobs=-1
    )
    iso_forest.fit(X_train_anomaly)
    
    # Benchmark on labelled test anomalies dataset
    X_test_eval = anomaly_df[ANOMALY_FEATURES]
    y_true_anomaly = anomaly_df["is_anomaly"].values
    
    # IsolationForest: -1 is anomaly, +1 is inlier
    raw_preds = iso_forest.predict(X_test_eval)
    y_pred_anomaly = (raw_preds == -1).astype(int)
    
    prec = float(round(precision_score(y_true_anomaly, y_pred_anomaly, zero_division=0), 3))
    rec = float(round(recall_score(y_true_anomaly, y_pred_anomaly, zero_division=0), 3))
    f1 = float(round(f1_score(y_true_anomaly, y_pred_anomaly, zero_division=0), 3))
    
    cm = confusion_matrix(y_true_anomaly, y_pred_anomaly)
    tn, fp, fn, tp = int(cm[0, 0]), int(cm[0, 1]), int(cm[1, 0]), int(cm[1, 1])
    
    # ----------------- 4. Save Models & Metrics -----------------
    joblib.dump(solar_model, models_dir / "solar_forecast_model.joblib")
    joblib.dump(demand_model, models_dir / "demand_forecast_model.joblib")
    joblib.dump(iso_forest, models_dir / "anomaly_model.joblib")
    
    metrics = {
        "generated_at": datetime.now().isoformat(),
        "train_samples": len(train_df),
        "test_samples": len(test_df),
        "split_method": "Chronological (80/20 No-Leakage Split)",
        "solar_forecast": {
            "model_type": "GradientBoostingRegressor",
            "features": FEATURE_COLS_SOLAR,
            "mae_kw": solar_mae,
            "rmse_kw": solar_rmse,
            "r2_score": solar_r2,
            "baseline_mae_kw": base_solar_mae,
            "baseline_rmse_kw": base_solar_rmse,
            "mae_reduction_pct": solar_improvement_pct
        },
        "demand_forecast": {
            "model_type": "GradientBoostingRegressor",
            "features": FEATURE_COLS_DEMAND,
            "mae_kw": demand_mae,
            "rmse_kw": demand_rmse,
            "r2_score": demand_r2,
            "baseline_mae_kw": base_demand_mae,
            "baseline_rmse_kw": base_demand_rmse,
            "mae_reduction_pct": demand_improvement_pct
        },
        "anomaly_detection": {
            "model_type": "IsolationForest",
            "features": ANOMALY_FEATURES,
            "contamination": 0.04,
            "test_evaluation_samples": len(anomaly_df),
            "precision": prec,
            "recall": rec,
            "f1_score": f1,
            "true_positives": tp,
            "false_positives": fp,
            "true_negatives": tn,
            "false_negatives": fn
        }
    }
    
    with open(models_dir / "metrics.json", "w") as f:
        json.dump(metrics, f, indent=2)
        
    logger.info("ML Models and metrics generated and persisted successfully.")
    return metrics

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    res = train_and_evaluate_models()
    print("Training finished:", json.dumps(res, indent=2))
