"""
TRINETRA System Truth Layer & Capability Matrix
Central authoritative registry of all system capabilities, feed statuses, and deployment modes.
Every frontend view and API route references this truth configuration.
"""

from typing import Dict, Any

FEATURE_STATUS: Dict[str, Dict[str, Any]] = {
    "cctv_detection": {
        "status": "FUNCTIONAL",
        "label": "LIVE / FUNCTIONAL",
        "description": "Optical CCTV stream frame extraction, YOLO inference, and bounding box generation.",
        "badge_color": "emerald"
    },
    "person_tracking": {
        "status": "FUNCTIONAL",
        "label": "LIVE / FUNCTIONAL",
        "description": "Spatio-temporal track correlation, speed calculation, and trajectory mapping.",
        "badge_color": "emerald"
    },
    "thermal_feed": {
        "status": "SIMULATED",
        "label": "SIMULATED FEED",
        "description": "Deterministic synthetic thermal infrared sensor generation with calibrated heat delta (°C).",
        "badge_color": "amber"
    },
    "radar_feed": {
        "status": "SIMULATED",
        "label": "SIMULATED FEED",
        "description": "Synthetic micro-Doppler radar velocity and azimuth telemetry.",
        "badge_color": "amber"
    },
    "ugs_feed": {
        "status": "SIMULATED",
        "label": "SIMULATED FEED",
        "description": "Synthetic seismic ground vibration waveform and frequency (Hz) telemetry.",
        "badge_color": "amber"
    },
    "acoustic_feed": {
        "status": "SIMULATED",
        "label": "SIMULATED FEED",
        "description": "Synthetic perimeter acoustic event signature detection.",
        "badge_color": "amber"
    },
    "uav_feed": {
        "status": "INTEGRATION_READY",
        "label": "INTEGRATION READY",
        "description": "Normalized data schema and waypoint interface for tactical drone integration.",
        "badge_color": "blue"
    },
    "anpr": {
        "status": "FUNCTIONAL",
        "label": "LIVE / FUNCTIONAL",
        "description": "Automatic Number Plate Recognition OCR pipeline and database lookup.",
        "badge_color": "emerald"
    },
    "face_recognition": {
        "status": "FUNCTIONAL_RESTRICTED",
        "label": "POTENTIAL IDENTITY MATCH",
        "description": "Local appearance feature matching requiring mandatory human operator verification.",
        "badge_color": "purple"
    },
    "sha256_integrity": {
        "status": "FUNCTIONAL",
        "label": "LIVE / FUNCTIONAL",
        "description": "Cryptographic SHA-256 evidence hashing and immutable audit logging.",
        "badge_color": "emerald"
    },
    "blockchain": {
        "status": "INTEGRATION_READY",
        "label": "ROADMAP / INTEGRATION READY",
        "description": "Permissioned ledger anchoring for multi-agency evidence chain of custody.",
        "badge_color": "blue"
    },
    "multi_sensor_fusion": {
        "status": "FUNCTIONAL",
        "label": "LIVE / FUNCTIONAL",
        "description": "Spatio-temporal correlation rules, window deduplication, and XAI explainability.",
        "badge_color": "emerald"
    },
    "sensor_contradiction": {
        "status": "FUNCTIONAL",
        "label": "LIVE / FUNCTIONAL",
        "description": "Automated physical sensor contradiction detection and confidence attenuation.",
        "badge_color": "emerald"
    },
    "offline_edge_mode": {
        "status": "FUNCTIONAL",
        "label": "LIVE / FUNCTIONAL",
        "description": "Autonomous edge intelligence with local database queuing and sync on reconnect.",
        "badge_color": "emerald"
    }
}

def get_system_capabilities() -> Dict[str, Any]:
    """Returns the central capabilities registry."""
    return {
        "platform": "TRINETRA",
        "version": "1.0.0-SIH-PROTOTYPE",
        "sector": "Sector 4 Ground Command Node",
        "truth_layer_active": True,
        "features": FEATURE_STATUS
    }
