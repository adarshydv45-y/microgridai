import os
from pathlib import Path
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent.parent
STATIC_DIR = BASE_DIR.parent / "frontend" / "dist"

class AppConfig(BaseModel):
    app_name: str = "MicrogridAI"
    app_subtitle: str = "Smart Renewable Energy Intelligence"
    version: str = "1.0.0"
    port: int = int(os.getenv("PORT", "8080"))
    host: str = "0.0.0.0"
    debug: bool = os.getenv("DEBUG", "false").lower() == "true"
    
    # Storage paths
    data_dir: Path = BASE_DIR / "data"
    models_dir: Path = BASE_DIR / "models"
    static_dir: Path = STATIC_DIR
    
    # Microgrid Specifications
    solar_capacity_kw: float = 25.0
    battery_capacity_kwh: float = 60.0
    battery_min_soc: float = 15.0  # Safe reserve cutoff %
    battery_max_soc: float = 95.0  # Overcharge cutoff %
    battery_max_charge_kw: float = 12.0
    battery_max_discharge_kw: float = 12.0
    battery_charge_efficiency: float = 0.95
    battery_discharge_efficiency: float = 0.95
    
    # Data generation
    random_seed: int = 42
    history_days: int = 90
    demo_mode: bool = True

settings = AppConfig()
settings.data_dir.mkdir(parents=True, exist_ok=True)
settings.models_dir.mkdir(parents=True, exist_ok=True)
