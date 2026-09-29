# TRINETRA Backend (FastAPI + SQLAlchemy + OpenCV + YOLOv8)

High-performance, asynchronous backend engine powering TRINETRA's multi-sensor fusion, edge AI object tracking, and cryptographic evidence hashing.

## 🌟 Core Services
- **AI Service (`backend/app/services/ai_service.py`)**: YOLOv8 neural inference with CLAHE adaptive contrast enhancement, Non-Maximum Suppression (NMS), and resilient MOG2 background subtraction fallback.
- **Multi-Sensor Fusion Engine (`backend/app/services/fusion_engine.py`)**: Spatio-temporal event correlation across Optical CCTV, Thermal IR, Doppler Radar, Seismic UGS, Drone UAV, and Gate ANPR.
- **Evidence Service (`backend/app/services/evidence_service.py`)**: SHA-256 cryptographic verification and chain-of-custody logging.
- **Tracker & Continuity Service (`backend/app/services/tracker_service.py`)**: Centroid and IoU object tracker with trajectory projection.
- **Simulation Service (`backend/app/services/simulation_service.py`)**: Deterministic demonstration scenario runner.

## 🛠️ Running the Backend
```bash
# Activate virtual environment
# Windows:
..\.venv\Scripts\activate
# Linux/macOS:
source ../.venv/bin/activate

# Install requirements
pip install -r requirements.txt

# Launch FastAPI server
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

- Swagger API Docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- Health Check: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)
