from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.core.capabilities import get_system_capabilities
from backend.app.services.metrics_service import metrics_service

router = APIRouter(prefix="/system", tags=["System Truth & Metrics"])

@router.get("/capabilities")
def get_capabilities():
    """
    Returns the central truth layer specifying whether each sensor and module
    is REAL/FUNCTIONAL, SIMULATED, or INTEGRATION-READY.
    """
    return get_system_capabilities()

@router.get("/metrics")
def get_metrics(db: Session = Depends(get_db)):
    """
    Returns genuine measured evaluation metrics from active test runs and database records.
    """
    return metrics_service.get_evaluation_metrics(db)
