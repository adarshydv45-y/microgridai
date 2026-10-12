import logging
import os
from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from .config import settings
from .api import router
from .ml.train_models import train_and_evaluate_models
from .ml.predictor import predictor_service
from .ml.anomaly_detector import anomaly_service
from .services.energy_service import energy_service

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("microgridai")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup & Shutdown lifecycle logic: ensure datasets & models exist and are loaded."""
    logger.info("Initializing MicrogridAI services...")
    
    # 1. Ensure data & trained models exist
    model_file = settings.models_dir / "solar_forecast_model.joblib"
    if not model_file.exists():
        logger.info("Trained models not found on startup. Triggering initial training pipeline...")
        try:
            train_and_evaluate_models(settings.data_dir, settings.models_dir)
        except Exception as e:
            logger.error(f"Failed during initial training: {e}", exc_info=True)
            
    # 2. Warm up services
    try:
        energy_service.get_dataframe()
        predictor_service.load_models()
        anomaly_service.load_model()
        logger.info("All MicrogridAI services and ML models are warmed up and operational.")
    except Exception as e:
        logger.warning(f"Warning during service warm-up: {e}")
        
    yield
    
    logger.info("MicrogridAI service shutting down.")

app = FastAPI(
    title="MicrogridAI API",
    description="Smart Renewable Energy Intelligence Platform — Real-Time Monitoring, AI Forecasting, Anomaly Detection & Battery Optimization",
    version=settings.version,
    lifespan=lifespan
)

# CORS Middleware for local frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Router
app.include_router(router)

# Single-Container Static Files & SPA Routing for Google Cloud Run
static_dir = settings.static_dir
assets_dir = static_dir / "assets"

if static_dir.exists():
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")
        
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Do not intercept API or documentation routes
        if full_path.startswith("api/") or full_path in ["docs", "openapi.json", "redoc"]:
            return JSONResponse(status_code=404, content={"detail": "Not Found"})
            
        requested_file = static_dir / full_path
        if requested_file.is_file():
            return FileResponse(str(requested_file))
            
        index_file = static_dir / "index.html"
        if index_file.is_file():
            return FileResponse(str(index_file))
            
        return JSONResponse(status_code=404, content={"detail": "Frontend assets not compiled yet."})
else:
    @app.get("/")
    def index_placeholder():
        return {
            "message": "MicrogridAI API is operational.",
            "documentation": "/docs",
            "frontend": "Run 'npm run dev' inside the frontend directory for local UI development, or 'npm run build' for single-container production deployment."
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host=settings.host, port=settings.port, reload=settings.debug)
