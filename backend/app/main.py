import os
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.app.core.config import settings
from backend.app.core.database import Base, engine
from backend.app.db.seed import seed_database
from backend.app.services.video_service import SyntheticVideoGenerator

from backend.app.api.auth import router as auth_router
from backend.app.api.cameras import router as cameras_router
from backend.app.api.sensors import router as sensors_router
from backend.app.api.detections import router as detections_router
from backend.app.api.incidents import router as incidents_router
from backend.app.api.personnel import router as personnel_router
from backend.app.api.vehicles import router as vehicles_router
from backend.app.api.investigation import router as investigation_router
from backend.app.api.analytics import router as analytics_router
from backend.app.api.security import router as security_router
from backend.app.api.simulation import router as simulation_router
from backend.app.api.websockets import router as ws_router
from backend.app.api.reports import router as reports_router
from backend.app.api.system import router as system_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize Database & Seed
    print(f"[{settings.PROJECT_NAME}] Initializing database schema...")
    Base.metadata.create_all(bind=engine)
    seed_database()

    # Generate sample demonstration surveillance video files if none present
    sample_videos = ["cctv_01_day.mp4", "cctv_02_day.mp4", "cctv_03_night.mp4", "cctv_04_vehicle.mp4"]
    for vid_name in sample_videos:
        vid_path = os.path.join(settings.VIDEO_DIR, vid_name)
        if not os.path.exists(vid_path):
            try:
                SyntheticVideoGenerator.generate_demo_video(vid_path, duration_sec=10, fps=15)
                print(f"[{settings.PROJECT_NAME}] Generated demo surveillance feed: {vid_path}")
            except Exception as e:
                print(f"[{settings.PROJECT_NAME} WARNING] Could not generate synthetic video: {e}")

    yield

    # Shutdown
    print(f"[{settings.PROJECT_NAME}] Shutting down...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="TRINETRA: Sensor-Agnostic AI Border Intelligence Platform",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Static Directories for Evidence & Videos
if os.path.exists(settings.DATA_DIR):
    app.mount("/data", StaticFiles(directory=settings.DATA_DIR), name="data")

# Include Routers
app.include_router(auth_router, prefix="/api")
app.include_router(cameras_router, prefix="/api")
app.include_router(sensors_router, prefix="/api")
app.include_router(detections_router, prefix="/api")
app.include_router(incidents_router, prefix="/api")
app.include_router(personnel_router, prefix="/api")
app.include_router(vehicles_router, prefix="/api")
app.include_router(investigation_router, prefix="/api")
app.include_router(analytics_router, prefix="/api")
app.include_router(security_router, prefix="/api")
app.include_router(simulation_router, prefix="/api")
app.include_router(reports_router, prefix="/api")
app.include_router(system_router, prefix="/api")
app.include_router(ws_router)


@app.get("/api/health")
def health_check():
    return {
        "status": "HEALTHY",
        "platform": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "operational_mode": settings.OPERATIONAL_MODE
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
