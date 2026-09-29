# TRINETRA SIH Live Demonstration Guide & Script

## 1. Demonstration Setup & Startup

Ensure the backend and frontend are running:
1. **Backend Server**: `http://localhost:8000` (FastAPI + WebSocket)
2. **Frontend Console**: `http://localhost:5173` (Vite + React)
3. **Login Credentials**: `admin` / `password123` (Role: Commander)

---

## 2. The Killer SIH Demonstration: Night-Time Perimeter Movement

Navigate to **Demo Scenarios** (`/demo-scenarios`) or use the step-by-step interactive runner:

```
[ Step 1: Optical Detection ] ──▶ CCTV-01 detects unverified person near Sector-4 Fence
              │
[ Step 2: Thermal Corroboration ] ──▶ THERMAL-01 confirms human-range heat signature
              │
[ Step 3: Radar Track ] ──▶ RADAR-01 detects moving target at 1.4 m/s heading SE
              │
[ Step 4: Ground Seismic ] ──▶ UGS-04 detects localized footstep vibrations
              │
[ Step 5: Spatio-Temporal Fusion ] ──▶ TRINETRA Correlates all 4 events into ONE Correlated Incident
              │
[ Step 6: XAI & Uncertainty Review ] ──▶ Inspect Explainability factors & positional variance
              │
[ Step 7: Cryptographic Verification ] ──▶ SHA-256 integrity check passes with green badge
              │
[ Step 8: Human Verification & Audit ] ──▶ Operator clicks [ VERIFY ] ──▶ Tamper-evident Audit Log written
```

### Script & Narration Points for Judges:
- **Alert Deduplication**: Point out how 4 disparate sensor spikes did *not* spam 4 alerts; the spatio-temporal fusion engine unified them into Incident `INC-2026-NIGHT-01` (`4:1` deduplication ratio).
- **Truth Layer Integrity**: Show the `SIMULATED FEED` and `LIVE / FUNCTIONAL` badges on every card, explaining that TRINETRA clearly distinguishes between real and simulated streams.
- **Explainable AI (XAI)**: Highlight the breakdown of *Why Flagged* and *Uncertainties* (positional delta 8m, unverified identity).
- **Cryptographic Chain of Custody**: Click **Verify SHA-256** to demonstrate deterministic mathematical evidence tampering verification.
- **Audit Trail**: Switch to Zero-Trust Security / Audit view to show the immutable log entry recording the operator's verification.

---

## 3. Secondary Demonstrations

### Scenario 2: Camera Tampering & Handover
- Camera stream drops with simultaneous seismic spike.
- TRINETRA flags `Possible Camera Tampering / Observation Loss` (avoiding unsubstantiated "wire cut" claims) and tracks handover to thermal radar.

### Scenario 3: Sensor Contradiction Detection
- Radar flags moving target; CCTV and Thermal show no signature.
- TRINETRA decreases threat attention and flags `Sensor Contradiction Detected` requiring human verification rather than triggering a false alarm.

### Scenario 4: ANPR Watchlist Match & Route Deviation
- Vehicle `JK-02-AB-9912` spotted deviating from designated patrol corridor.
- Flags `Watchlist Match — Requires Verification`.
