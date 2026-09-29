# TRINETRA Scientific Limitations & Engineering Tradeoffs

## 1. Scientific Honesty & Boundary Conditions

To maintain rigorous technical credibility during SIH evaluation and defense audits, TRINETRA explicitly documents the boundary conditions and operational limitations of its current prototype architecture:

---

## 2. Identified Limitations & Mitigations

### 1. Long-Distance Cross-Camera Appearance Re-Identification (Re-ID)
- **Limitation**: Appearance feature embeddings (ResNet/OSNet) degrade significantly when targets move between cameras kilometers apart under varying illumination, clothing changes, or severe aspect angle shifts.
- **TRINETRA Mitigation**: TRINETRA uses **spatio-temporal continuity bounds** (timestamp, topological path constraints, estimated travel velocity) as the primary filter, treating appearance similarity strictly as secondary probabilistic support rather than a definitive match.

### 2. Extreme Weather & Environmental Degradation
- **Limitation**: Heavy fog, torrential rain, and dust storms drastically reduce optical visibility and attenuate long-range thermal infrared contrast.
- **TRINETRA Mitigation**: Multi-sensor fusion weights automatically shift toward Ground Surveillance Radar and Seismic UGS arrays when optical sensors report `DEGRADED` or `LOW_VISIBILITY` states.

### 3. Face Recognition in Tactical Conditions
- **Limitation**: Tactical operators and unverified targets frequently wear balaclavas, helmets, or turn away from cameras, rendering facial recognition ineffective.
- **TRINETRA Mitigation**: Face recognition is strictly optional and non-blocking; the system flags `POTENTIAL IDENTITY MATCH` requiring human verification rather than autonomous threat classification.

### 4. Sensor Spatial Alignment & Clock Drift
- **Limitation**: Physical sensors across border sectors may have slight GPS inaccuracies ($\pm 5\text{–}10\text{ m}$) or network latency jitter ($50\text{–}200\text{ ms}$).
- **TRINETRA Mitigation**: The spatio-temporal fusion engine uses configurable fuzzy spatial windows ($\Delta d \le 25\text{ m}$) and temporal sliding buffers ($\Delta t \le 10\text{ s}$) with explicit uncertainty reporting in the incident explanation.

### 5. Adversarial Attacks & Physical Tampering
- **Limitation**: Optical dazzlers/lasers or physical obstruction can blind optical cameras without severing power.
- **TRINETRA Mitigation**: Optical frame entropy and frozen frame analysis combined with cross-corroboration from adjacent radar nodes detect anomalies and flag `Possible Camera Tampering / Observation Loss`.
