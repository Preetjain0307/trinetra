# TRINETRA — System Architecture & Data Pipeline

## 1. High-Level Architectural Flow

TRINETRA follows a strict **Defense-in-Depth, Edge-First Architecture** designed for border security environments with intermittent connectivity:

```
[ PHYSICAL & SIMULATED SENSORS ]
  ├── Optical IP CCTV (1080p RTSP / Video)
  ├── Thermal Infrared Array (36-38°C Calibrated IR)
  ├── Doppler Radar Mesh (Micro-Doppler Speed & Azimuth)
  ├── Unattended Ground Sensors (UGS Seismic 4-12 Hz)
  ├── Acoustic Wire-Cut / Perimeter Nodes
  └── Tactical UAV Waypoint Telemetry
                 │
                 ▼
[ NORMALIZATION INGESTION LAYER ]
  (Converts heterogeneous payloads to NormalizedEvent Schema)
                 │
                 ▼
[ EDGE AI INFERENCE & TRACKING ]
  ├── YOLO Object Detection (Person, Vehicle, Object)
  ├── ByteTrack Trajectory Association (Tracks P-014, V-008)
  └── ANPR Number Plate OCR Pipeline
                 │
                 ▼
[ MULTI-SENSOR SPATIO-TEMPORAL FUSION ENGINE ]
  ├── Time Window Clustering (120s window)
  ├── Spatial Zone Corroboration (Sector Zones A, B, C)
  ├── Alert Deduplication (N Observations → 1 Incident)
  └── Sensor Contradiction Detection (Radar vs Optical/Thermal)
                 │
                 ▼
[ CONTEXT & ANOMALY ENGINE ]
  ├── Restricted Zone & Active Hours Evaluation
  ├── Personnel Roster & Route Schedule Check
  └── Watchlist ANPR Matching
                 │
                 ▼
[ INCIDENT CREATION & XAI REASONING ]
  ├── Unified Incident Ticket (e.g., INC-1042)
  ├── Explainable AI Breakdown (Why Flagged + Uncertainties)
  └── Cryptographic SHA-256 Evidence Hashing
                 │
                 ▼
[ HUMAN-IN-THE-LOOP VERIFICATION DESK ]
  ├── Operator Actions: [ Verify ] | [ Dismiss ] | [ Escalate ]
  └── Continuous Evaluation Feedback Loop
                 │
                 ▼
[ IMMUTABLE ZERO-TRUST AUDIT TRAIL ]
  (Database log of every operator action, timestamp, user, hash)
```

---

## 2. Component Directory Structure

- `backend/app/api/`: REST endpoints (auth, cameras, sensors, detections, incidents, personnel, vehicles, investigation, analytics, security, simulation, system).
- `backend/app/core/`: Configuration, database engine, central truth capabilities (`capabilities.py`), security tokens.
- `backend/app/models/`: SQLAlchemy ORM database models.
- `backend/app/schemas/`: Pydantic validation schemas and `NormalizedEvent`.
- `backend/app/services/`: Core business logic:
  - `fusion_engine.py`: Multi-sensor correlation, deduplication, contradiction logic.
  - `context_engine.py`: Zone boundaries, active hours, duty schedules.
  - `evidence_service.py`: SHA-256 cryptographic evidence hashing.
  - `metrics_service.py`: Real measured evaluation latency & metrics.
  - `simulation_service.py`: 4 deterministic SIH evaluation scenarios.
  - `continuity_service.py`: Camera failure detection & sensor mesh handover.
- `frontend/src/pages/`: 12 Command & Control views.
- `tests/`: Automated pytest verification test suite.
