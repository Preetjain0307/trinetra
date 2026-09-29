# TRINETRA Edge Deployment Architecture

## 1. Tactical Edge Node Architecture

TRINETRA is designed to run in harsh, forward-operating environments where constant cloud connectivity cannot be assumed. Each border sector is equipped with autonomous Edge Compute Nodes (e.g., NVIDIA Jetson AGX Orin or ruggedized x86-64 industrial IPCs).

```
[ Tactical Edge Node (Sector 4) ]
┌────────────────────────────────────────────────────────┐
│ • Local Frame Grabber & RTSP Stream Ingestion          │
│ • Hardware-Accelerated YOLOv8n / TensorRT Inference    │
│ • Local Spatio-Temporal Event Correlator               │
│ • SQLite / Embedded PostGIS Event Store                │
│ • Local Web Command Interface (FastAPI + React)        │
│ • Offline Store-and-Forward Sync Queue                 │
└───────────────────────────┬────────────────────────────┘
                            │ (Encrypted Tactical Mesh / UHF Link)
                            ▼
[ Central Headquarters Command Server ]
┌────────────────────────────────────────────────────────┐
│ • Multi-Sector Strategic Intelligence Fusion           │
│ • Central PostgreSQL Database                          │
│ • Long-Term Evidence Archive & Forensic Indexing       │
└────────────────────────────────────────────────────────┘
```

---

## 2. Bandwidth Adaptation Modes

TRINETRA supports 3 distinct operational modes configurable via the Settings interface:

### A. NORMAL MODE (High Bandwidth / Local LAN)
- Full 1080p/4K video streaming (25–30 FPS).
- Real-time bi-directional WebSocket telemetry and instant bounding box streaming.

### B. LOW BANDWIDTH MODE (Tactical Mesh / 2G / SATCOM)
- Raw video streaming paused; only low-FPS keyframes and bounding box coordinates transmitted.
- Metadata and synthesized incidents prioritised ($\approx 2\text{ KB/event}$).
- High-res evidence cached on local SSD, transmitted on-demand during verification.

### C. OFFLINE EDGE MODE (Comms Blackout / Air-Gapped)
- Complete autonomous operation: local AI detection, tracking, spatio-temporal fusion, and incident synthesis.
- Events queued in persistent local transaction log.
- On link restoration: automatic cryptographic batch sync (`SYNC IN PROGRESS` $\to$ `SYNC COMPLETE`).
