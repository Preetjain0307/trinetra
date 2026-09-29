# TRINETRA — Correlation Engine & Multi-Sensor Fusion Logic

## 1. The Core Fusion Pipeline

The TRINETRA fusion engine (`backend/app/services/fusion_engine.py`) processes incoming normalized sensor events through four deterministic stages:

### Stage 1: Spatio-Temporal Window Clustering
- When a new event arrives from any sensor, the engine queries for active incidents within:
  - **Spatial filter**: Identical operational zone (e.g., `Zone B`).
  - **Temporal window**: `T_event - 120 seconds` to `T_event + 120 seconds`.
- If an active incident exists, the event is **deduplicated** and appended as a contributing observation source instead of generating a separate incident ticket.

### Stage 2: Correlation Scoring Algorithm
The correlation score ($S \in [0.15, 0.98]$) is mathematically computed based on sensor modality diversity:
$$S = S_{\text{base}} + \sum w_{\text{modality}} + B_{\text{diversity}} - P_{\text{contradiction}}$$

Where:
- $S_{\text{base}} = 0.50$
- $w_{\text{CCTV}} = +0.12$
- $w_{\text{THERMAL}} = +0.14$
- $w_{\text{RADAR}} = +0.12$
- $w_{\text{UGS}} = +0.10$
- $w_{\text{ANPR}} = +0.10$
- $B_{\text{diversity}} = +0.08$ if $\ge 3$ distinct modalities agree
- $P_{\text{contradiction}} = -0.40$ if physical contradiction is detected

### Stage 3: Contradiction Detection Logic
- A physical contradiction occurs when:
  - Doppler Radar detects high velocity target ($v > 10\text{ km/h}$), BUT:
  - Thermal infrared array detects zero ambient delta ($\Delta T < 1.0^\circ\text{C}$), AND
  - Optical CCTV detects empty background.
- **System Action on Contradiction**:
  1. Incident is flagged with `sensor_consistency_status = "CONTRADICTION_FLAGGED"`.
  2. Correlation score is attenuated to $< 0.30$.
  3. Priority is downgraded to `LOW`.
  4. Explanation warns operator: *"Radar observation lacks corroborating visual/thermal evidence. Potential environmental echo / dust artifact. Requires human verification before dispatch."*

### Stage 4: Explainable AI (XAI) Output Generation
Every generated incident contains:
1. **WHAT**: Observation types (person, heat signature, Doppler velocity).
2. **WHERE**: Zone, perimeter sector, coordinates.
3. **WHEN**: Synchronized UTC timestamps.
4. **SOURCES**: Contributing sensor IDs (e.g., `C-01`, `T-01`, `R-01`, `G-04`).
5. **WHY CORRELATED**: Specific spatio-temporal alignment reasons.
6. **UNCERTAINTIES**: Physical offsets, missing visual face verification, environmental noise.
7. **RECOMMENDED OPERATOR ACTION**: `[ Verify ]`, `[ Dismiss ]`, `[ Escalate ]`.
