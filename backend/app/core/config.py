import os
from typing import List, Union
from pydantic_settings import BaseSettings
from pydantic import field_validator

class Settings(BaseSettings):
    PROJECT_NAME: str = "TRINETRA"
    VERSION: str = "1.0.0-sih-prototype"
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"

    DATABASE_URL: str = "sqlite:///./trinetra.db"
    
    JWT_SECRET: str = "trinetra_sih_super_secure_jwt_secret_key_2026_change_in_production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 480
    
    CORS_ORIGINS: Union[str, List[str]] = "http://localhost:5173,http://127.0.0.1:5173,*"
    
    DATA_DIR: str = "./data"
    VIDEO_DIR: str = "./data/videos"
    EVIDENCE_DIR: str = "./data/evidence"
    DEMO_DIR: str = "./data/demo"
    
    AI_MODEL_NAME: str = "yolov8n.pt"
    AI_CONFIDENCE_THRESHOLD: float = 0.35
    AI_IOU_THRESHOLD: float = 0.45
    AI_IMAGE_SIZE: int = 640
    AI_TRACK_CONFIDENCE: float = 0.45
    AI_INFERENCE_FPS: int = 5
    AI_ENABLE_GPU: bool = False
    AI_ENABLE_CLAHE_ENHANCEMENT: bool = True
    AI_ENABLE_NMS: bool = True
    
    OPERATIONAL_MODE: str = "NORMAL"

    @field_validator("CORS_ORIGINS", mode="before")
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return v
        return ["*"]

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

# Ensure directories exist
os.makedirs(settings.DATA_DIR, exist_ok=True)
os.makedirs(settings.VIDEO_DIR, exist_ok=True)
os.makedirs(settings.EVIDENCE_DIR, exist_ok=True)
os.makedirs(settings.DEMO_DIR, exist_ok=True)
