# TRINETRA REST & WebSocket API Specification

## Base URL
- **REST API**: `http://localhost:8000/api`
- **WebSocket Feed**: `ws://localhost:8000/api/ws/events`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`

---

## 1. Authentication & RBAC (`/api/auth`)

| Method | Endpoint | Description | Auth Level |
|---|---|---|---|
| `POST` | `/api/auth/token` | OAuth2 Password Grant login returning JWT access token | Public |
| `GET` | `/api/auth/me` | Retrieve authenticated user profile, assigned role & permissions | Operator+ |
| `POST` | `/api/auth/register` | Register an operator account (admin or privileged role required) | Commander / Admin |

---

## 2. System Capabilities & Truth Layer (`/api/system`)

| Method | Endpoint | Description | Auth Level |
|---|---|---|---|
| `GET` | `/api/system/capabilities` | Return central feature status dictionary (`FEATURE_STATUS`) classifying every subsystem as `functional`, `simulated`, `integration-ready`, `optional`, or `not_implemented` | Public / Operator |
| `GET` | `/api/system/metrics` | Return real measured prototype performance metrics (inference latency, deduplication ratio, active incidents, memory/event rates) | Public / Operator |

---

## 3. Incident Management & XAI (`/api/incidents`)

| Method | Endpoint | Description | Auth Level |
|---|---|---|---|
| `GET` | `/api/incidents` | List security incidents with filters for status, severity, zone, and date range | Operator+ |
| `GET` | `/api/incidents/{incident_id}` | Retrieve incident details including XAI explanation, contributing sensor events, spatial coordinates, and timeline | Operator+ |
| `POST` | `/api/incidents/{incident_id}/verify` | Human operator confirms incident; updates status to `VERIFIED` and writes to audit log | Operator+ |
| `POST` | `/api/incidents/{incident_id}/dismiss` | Operator dismisses incident; updates status to `DISMISSED` with rationale | Operator+ |
| `POST` | `/api/incidents/{incident_id}/escalate` | Commander escalates incident to Quick Reaction Force (QRF) dispatch | Commander+ |

---

## 4. Multi-Sensor Simulation Engine (`/api/simulation`)

| Method | Endpoint | Description | Auth Level |
|---|---|---|---|
| `POST` | `/api/simulation/reset` | Clear simulation state, purge synthetic events/incidents, reset track registries | Operator+ |
| `POST` | `/api/simulation/scenario/{scenario_id}/step?step={N}` | Deterministic step-by-step playback of Scenarios 1–4: Step 1 (CCTV), Step 2 (Thermal), Step 3 (Radar), Step 4 (UGS), Step 5 (Correlation Incident Creation) | Operator+ |
| `POST` | `/api/simulation/scenario/night-movement` | Trigger full automated run of the Night-Time Perimeter Movement scenario | Operator+ |
| `POST` | `/api/simulation/scenario/camera-failure` | Trigger Camera Sabotage/Failure & Handover scenario | Operator+ |
| `POST` | `/api/simulation/scenario/sensor-contradiction` | Trigger Radar detection without visual confirmation contradiction scenario | Operator+ |
| `POST` | `/api/simulation/scenario/vehicle-deviation` | Trigger Vehicle Route Deviation & Watchlist ANPR scenario | Operator+ |

---

## 5. Investigation & Structured Search (`/api/investigation`)

| Method | Endpoint | Description | Auth Level |
|---|---|---|---|
| `GET` | `/api/investigation/search?query={nlp_query}` | Natural language forensic query. Extracts structured search entities (`INTERPRETED QUERY`: vehicle, location, time, object) and searches metadata | Operator+ |
| `GET` | `/api/investigation/poi/{poi_id}/timeline` | Cross-sensor timeline reconstruction for a specific Person or Vehicle of Interest | Operator+ |

---

## 6. Cryptographic Evidence Integrity (`/api/evidence`)

| Method | Endpoint | Description | Auth Level |
|---|---|---|---|
| `GET` | `/api/evidence/incident/{incident_id}` | Retrieve cryptographic evidence packages (video clips, normalized payloads, SHA-256 hashes, timestamps) | Operator+ |
| `POST` | `/api/evidence/{evidence_id}/verify` | Compute SHA-256 hash across stored binary/metadata payload and verify match against immutable database record | Operator+ |

---

## 7. Zero-Trust Audit Logging (`/api/audit`)

| Method | Endpoint | Description | Auth Level |
|---|---|---|---|
| `GET` | `/api/audit/logs` | Query tamper-evident audit logs with pagination and action filtering | Commander / Auditor |
| `GET` | `/api/audit/verify-chain` | Verify cryptographic SHA-256 hash chaining across consecutive audit log entries | Commander / Auditor |

---

## 8. Real-Time WebSocket Streaming (`/api/ws/events`)

- **Connection Protocol**: `ws://localhost:8000/api/ws/events`
- **Subscription Channels**:
  - `EVENT_INGESTED`: Triggered on every raw or normalized sensor event
  - `CORRELATED_INCIDENT`: Emitted when the spatio-temporal fusion engine forms an incident
  - `HEALTH_STATUS`: Emitted on sensor state changes (ONLINE, DEGRADED, NO_SIGNAL, POSSIBLE_TAMPERING)
  - `METRICS_UPDATE`: Periodic heartbeat of measured pipeline FPS and latencies
