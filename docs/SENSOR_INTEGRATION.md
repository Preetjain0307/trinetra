# TRINETRA Sensor Integration Specification

## 1. Sensor-Agnostic Abstraction Layer

TRINETRA operates on heterogeneous sensor inputs without coupling the core fusion pipeline to vendor-specific SDKs. Every external signal is normalized into a standard JSON message payload adhering to the `NormalizedEvent` schema:

```json
{
  "event_id": "EVT-CCTV-10291",
  "source_type": "CCTV",
  "source_id": "CCTV-01-N",
  "timestamp": "2026-09-28T22:14:03Z",
  "latitude": 32.7301,
  "longitude": 74.8601,
  "zone_id": "Sector-4-Alpha",
  "event_type": "DETECTION",
  "object_type": "PERSON",
  "direction": "SOUTH_EAST",
  "speed": 1.4,
  "confidence": 0.88,
  "evidence_reference": "evidence/cctv_01_frame_10291.jpg",
  "status": "RAW_INGESTED"
}
```

---

## 2. Supported Sensor Interfaces & Protocols

| Sensor Type | Field Interface / Transport | Payload Format | Data Frequency | Status in Prototype |
|---|---|---|---|---|
| **Optical / PTZ CCTV** | RTSP / H.264 / ONVIF Profile S | Video Stream / Frame Extraction | 25–30 FPS | Live / Functional (Local MP4 + RTSP ready) |
| **Long-Range Thermal IR** | RTSP / FLIR GigE Vision SDK | Radiometric Video / IR Blobs | 15–25 FPS | Simulated Feed / Integration-Ready |
| **Ground Surveillance Radar** | ASTERIX Eurocontrol (Cat 010/048) / TCP Socket | Polar Coordinates $(\theta, r, \dot{r})$ | 2–5 Hz | Simulated Feed / Integration-Ready |
| **Unattended Ground Sensors (UGS)** | LoRaWAN / RS-485 Modbus / MQTT | Seismic/Acoustic Trigger Vector | Event-driven (0.1–10 Hz) | Simulated Feed / Integration-Ready |
| **Automatic Number Plate Recognition (ANPR)** | HTTP Webhook / MQTT / RTSP | Crop Image + OCR String | Trigger-based | Functional & Simulated |
| **UAV Tethered / Patrol Drones** | MAVLink V2 / RTSP Stream | Telemetry (GPS, Alt) + Video | 10 Hz Telemetry | Integration-Ready |

---

## 3. Sensor Health Monitoring & Failure Handling

TRINETRA monitors sensor availability using a multi-factor heartbeat state machine:

- **ONLINE**: Heartbeat confirmed within interval $\le 5\text{ s}$; active stream decoding without dropped frames.
- **DEGRADED**: Bitrate drops $>40\%$, or SNR drops below threshold.
- **NO SIGNAL**: Stream connection timeout without physical sensor movement.
- **POSSIBLE TAMPERING**: Stream termination preceded by sudden lens obstruction, orientation shift, or simultaneous ground seismic spike without operator dispatch.
- **OFFLINE**: Known maintenance or power-down state.
