# TRINETRA — Data Model Specification

## 1. Normalized Event Schema (`NormalizedEvent`)

All raw sensor telemetry is converted into this unified model prior to ingestion into the fusion pipeline:

```json
{
  "event_id": "EVT-CCTV-1790620000-001",
  "source_type": "CCTV",
  "source_id": "C-01",
  "timestamp": "2026-09-28T21:40:00Z",
  "latitude": 26.9124,
  "longitude": 70.9023,
  "zone_code": "Zone B",
  "event_type": "person_detected",
  "object_type": "PERSON",
  "direction": "NE",
  "speed": 1.4,
  "range_dist": 120.0,
  "confidence": 0.94,
  "evidence_reference": "cctv_c01_capture_p014.jpg",
  "metadata_json": {
    "track_id": "P-014",
    "bbox": [120, 180, 190, 310]
  },
  "status": "INGESTED"
}
```

---

## 2. Core Database Entity Relational Model

```
                    ┌─────────────┐
                    │    zones    │
                    └──────┬──────┘
                           │ 1:N
         ┌─────────────────┼──────────────────┐
         │                 │                  │
         ▼                 ▼                  ▼
  ┌─────────────┐   ┌─────────────┐    ┌─────────────┐
  │   cameras   │   │   sensors   │    │  incidents  │◄──┐
  └──────┬──────┘   └──────┬──────┘    └──────┬──────┘   │
         │ 1:N             │ 1:N              │ 1:N      │
         ▼                 ▼                  ▼          │ 1:N
  ┌─────────────┐   ┌───────────────┐  ┌─────────────┐   │
  │ detections  │   │ sensor_events │  │  timelines  │   │
  └─────────────┘   └───────────────┘  └─────────────┘   │
                                              │ 1:N      │
                                              ▼          │
                                       ┌─────────────┐   │
                                       │  evidence   ├───┘
                                       └─────────────┘
```

### Table Definitions:

1. **`users`**: Email, password hash (Bcrypt), role (`Operator`, `Investigator`, `Supervisor`, `Security Admin`, `System Admin`), department, badge number.
2. **`incidents`**: Incident code (e.g., `INC-1042`), title, zone, priority (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`), status (`NEW`, `VERIFIED`, `DISMISSED`, `ESCALATED`), correlation score, contributing sources array, sensor consistency status (`CONSISTENT`, `CONTRADICTION_FLAGGED`).
3. **`evidence`**: Incident ID, file name, physical file path, **`file_hash` (SHA-256 string)**, source ID, verified boolean.
4. **`audit_logs`**: Timestamp, user email, role, action, target resource, result status, parameters JSON.
5. **`tracks`**: Track ID (`P-014`, `V-008`), object class, trajectory points array, status, associated person/vehicle.
6. **`personnel`**: Personnel ID, name, role, unit, authorized zones, duty schedule, verification status.
7. **`vehicles`**: Plate number, make/model, color, registered owner, authorized zones, flagged watchlist boolean.
