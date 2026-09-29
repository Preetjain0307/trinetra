# TRINETRA Deployment Architecture: Prototype vs Production

## 1. Architectural Comparison

| Dimension | SIH Hackathon Demonstration Prototype | Military Production / Field Deployment |
|---|---|---|
| **Deployment Target** | Single Local Workstation (Laptop / Tower PC) | Ruggedized Edge Nodes (Jetson Orin / Industrial IPC) + Sector HQ |
| **Backend Framework** | FastAPI (Python 3.12) with Uvicorn ASGI | FastAPI in Containerized Podman / Docker on Linux (RHEL/Ubuntu Core) |
| **Frontend Framework** | React 19 + Vite + Tailwind CSS | React Embedded PWA / Electron Desktop Command Console |
| **Database** | SQLite with WAL mode & Foreign Keys | PostgreSQL 16 + PostGIS Spatial Engine with High Availability |
| **Video Streams** | Local MP4 Video Loops + RTSP Simulators | Real RTSP/ONVIF Profile S H.264/H.265 Streams from Flir / Axis CCTVs |
| **Sensors** | High-fidelity Deterministic Simulation Engine | Hardware Gateways (ASTERIX Radar, LoRa UGS, FLIR GigE Vision) |
| **AI Inference** | PyTorch / ONNX Runtime CPU & CUDA | TensorRT / ONNX FP16 on NVIDIA DeepStream / Jetson Hardware Engines |
| **Evidence Store** | Local filesystem with SHA-256 Hashing | Encrypted NVMe Tactical NAS with Immutable WORM Storage |
| **Networking** | Localhost / Internal Loopback (127.0.0.1) | Air-Gapped Tactical LAN / IPsec VPN / mTLS Encrypted Tactical Mesh |
| **Cloud Dependency** | **Zero Cloud Dependencies** (100% Local) | **Zero Cloud Dependencies** (Air-gapped Defence Compliant) |
