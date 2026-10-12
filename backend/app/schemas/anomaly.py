from typing import List, Optional
from pydantic import BaseModel, Field

class AnomalyDetectionRequest(BaseModel):
    solar_kw: float = Field(..., ge=0.0, description="Measured solar power in kW")
    demand_kw: float = Field(..., ge=0.0, description="Measured load in kW")
    battery_soc: float = Field(..., ge=0.0, le=100.0, description="Battery SoC in %")
    battery_power_kw: float = Field(..., description="Battery power in kW (+ charge, - discharge)")
    ambient_temp_c: float = Field(default=25.0, description="Ambient temperature in Celsius")
    grid_import_kw: float = Field(default=0.0, ge=0.0, description="Import power in kW")
    timestamp: Optional[str] = None

class AnomalyDetectionResult(BaseModel):
    is_anomaly: bool
    anomaly_score: float = Field(..., description="Normalized score 0.0 to 1.0 (higher = more anomalous)")
    raw_decision_score: float
    status: str  # NORMAL, SUSPICIOUS, ANOMALOUS
    severity: str  # NONE, LOW, MEDIUM, HIGH, CRITICAL
    primary_deviant_signal: str
    explanation: str
    recommended_action: str
    timestamp: str

class HistoricalAnomalyRecord(BaseModel):
    id: str
    timestamp: str
    solar_kw: float
    demand_kw: float
    battery_soc: float
    anomaly_score: float
    severity: str
    fault_type: str
    signal_explanation: str
    is_synthetic_demo: bool = True

class AnomalyEvaluationMetrics(BaseModel):
    model_name: str = "Isolation Forest"
    contamination_rate: float
    n_test_samples: int
    precision: float
    recall: float
    f1_score: float
    true_positives: int
    false_positives: int
    true_negatives: int
    false_negatives: int

class AnomaliesListResponse(BaseModel):
    total_anomalies: int
    active_anomalies_count: int
    records: List[HistoricalAnomalyRecord]
    metrics: AnomalyEvaluationMetrics
    data_label: str = "Demonstration Benchmark Dataset with Injected Ground Truth Faults"
