import numpy as np
import pytest
from backend.app.services.ai_service import AIService

def test_ai_service_contrast_enhancement():
    service = AIService.get_instance()
    # Create dark surveillance test image
    dark_frame = np.full((360, 640, 3), 25, dtype=np.uint8)
    enhanced = service._enhance_surveillance_frame(dark_frame)
    assert enhanced is not None
    assert enhanced.shape == dark_frame.shape

def test_ai_service_surveillance_taxonomy():
    service = AIService.get_instance()
    assert service.SURVEILLANCE_CLASSES["person"] == "person"
    assert service.SURVEILLANCE_CLASSES["car"] == "vehicle"
    assert service.SURVEILLANCE_CLASSES["truck"] == "vehicle"
    assert service.SURVEILLANCE_CLASSES["boat"] == "vessel"
    assert service.SURVEILLANCE_CLASSES["backpack"] == "baggage"

def test_ai_service_nms_filtering():
    service = AIService.get_instance()
    # Overlapping boxes of same person
    dets = [
        {
            "class_name": "person",
            "confidence": 0.95,
            "bbox": [100.0, 100.0, 200.0, 300.0],
            "center": [150.0, 200.0],
            "camera_id": "C-01",
            "zone_code": "Zone B"
        },
        {
            "class_name": "person",
            "confidence": 0.85,
            "bbox": [102.0, 101.0, 198.0, 298.0],
            "center": [150.0, 200.0],
            "camera_id": "C-01",
            "zone_code": "Zone B"
        }
    ]
    nms_res = service._apply_nms(dets, iou_thresh=0.45)
    assert len(nms_res) == 1
    assert nms_res[0]["confidence"] == 0.95

def test_ai_service_fallback_detection_execution():
    service = AIService.get_instance()
    frame = np.zeros((480, 640, 3), dtype=np.uint8)
    # Put a distinct person silhouette
    frame[120:320, 280:330] = (220, 220, 220)
    dets = service.detect_objects(frame, camera_id="C-01", zone_code="Zone B")
    assert isinstance(dets, list)
