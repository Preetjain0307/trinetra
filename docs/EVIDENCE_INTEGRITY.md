# TRINETRA Cryptographic Evidence Integrity

## 1. Overview

In military border intelligence and forensic investigation, evidence admissibility and tamper detection are paramount. TRINETRA implements a deterministic cryptographic verification system for all captured frames, video clips, and AI inference metadata.

---

## 2. Integrity Hashing Protocol

Whenever an incident or sensor observation occurs, an evidence package is compiled:
1. **Raw Media Payload**: Binary bytes of the keyframe image or video snippet ($M$).
2. **Metadata Payload**: Normalized JSON containing timestamp, sensor ID, geo-coordinates, detected bounding boxes, and tracker IDs ($D$).
3. **Reasoning Synthesis**: Explainable AI deduction rules and confidence scores ($R$).

The combined canonical payload is hashed using **SHA-256**:

$$\text{EvidenceHash} = \text{SHA-256}(M \,\|\, D \,\|\, R)$$

The resulting 64-character hexadecimal digest is recorded in the evidence database alongside UTC timestamp, recording operator ID, and sensor certificate.

---

## 3. Real-Time Verification Mechanism

Operators can trigger instant verification on any historical evidence package through the UI or REST API (`POST /api/evidence/{evidence_id}/verify`):
- TRINETRA recomputes the SHA-256 digest directly from the stored media file and serialized metadata.
- If the computed hash matches the database registry:
  $$\text{Result: } \mathbf{\text{INTEGRITY VERIFIED (Match: 100\%)}}$$
- If a single bit in the file, bounding box, or timestamp has been altered:
  $$\text{Result: } \mathbf{\text{INTEGRITY CHECK FAILED (Hash Mismatch)}}$$

---

## 4. Blockchain & Ledger Distinction

- **Current Implementation**: Cryptographic SHA-256 Evidence Integrity (Functional).
- **Roadmap / Integration-Ready**: Anchoring root hashes into a permissioned Hyperledger Fabric / Ethereum private blockchain network for multi-agency joint jurisdiction verification.
