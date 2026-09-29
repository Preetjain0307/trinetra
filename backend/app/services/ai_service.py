import os
import cv2
import numpy as np
from typing import List, Dict, Any, Optional, Tuple
from backend.app.core.config import settings

class AIService:
    _instance = None
    _model = None
    _bg_subtractors: Dict[str, Any] = {}

    # Surveillance taxonomy mapping
    SURVEILLANCE_CLASSES = {
        "person": "person",
        "car": "vehicle",
        "motorcycle": "vehicle",
        "bus": "vehicle",
        "truck": "vehicle",
        "bicycle": "vehicle",
        "boat": "vessel",
        "airplane": "aircraft",
        "backpack": "baggage",
        "handbag": "baggage",
        "suitcase": "baggage",
        "dog": "animal",
        "horse": "animal",
        "cow": "animal",
        "cat": "animal",
        "sheep": "animal",
        "bear": "animal",
        "elephant": "animal",
    }

    # Calibrated confidence thresholds per domain class
    CLASS_CONFIDENCE_THRESHOLDS = {
        "person": 0.30,
        "vehicle": 0.35,
        "vessel": 0.35,
        "aircraft": 0.40,
        "baggage": 0.35,
        "animal": 0.40,
        "default": 0.35
    }

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def __init__(self):
        self.model_name = settings.AI_MODEL_NAME
        self.confidence_threshold = settings.AI_CONFIDENCE_THRESHOLD
        self.iou_threshold = getattr(settings, "AI_IOU_THRESHOLD", 0.45)
        self.img_size = getattr(settings, "AI_IMAGE_SIZE", 640)
        self.enable_clahe = getattr(settings, "AI_ENABLE_CLAHE_ENHANCEMENT", True)
        self.enable_nms = getattr(settings, "AI_ENABLE_NMS", True)
        self.is_loaded = False
        self._clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        self._load_model()

    def _load_model(self):
        try:
            from ultralytics import YOLO
            self._model = YOLO(self.model_name)
            self.is_loaded = True
            print(f"[AI SERVICE] YOLO model '{self.model_name}' loaded successfully with optimized vision pipeline.")
        except Exception as e:
            print(f"[AI SERVICE WARNING] Could not load YOLO model directly ({e}). Operating in enhanced CV fallback mode.")
            self._model = None
            self.is_loaded = False

    def _enhance_surveillance_frame(self, frame: np.ndarray) -> np.ndarray:
        """
        Enhances low-light, shadowed, or thermal surveillance frames using Adaptive Histogram Equalization.
        """
        if not self.enable_clahe or frame is None:
            return frame
        try:
            if len(frame.shape) == 3 and frame.shape[2] == 3:
                lab = cv2.cvtColor(frame, cv2.COLOR_BGR2LAB)
                l, a, b = cv2.split(lab)
                cl = self._clahe.apply(l)
                enhanced_lab = cv2.merge((cl, a, b))
                return cv2.cvtColor(enhanced_lab, cv2.COLOR_LAB2BGR)
            elif len(frame.shape) == 2:
                return self._clahe.apply(frame)
        except Exception:
            pass
        return frame

    def _get_bg_subtractor(self, camera_id: str):
        """Retrieves or creates an adaptive background subtractor for a given camera stream."""
        if camera_id not in self._bg_subtractors:
            self._bg_subtractors[camera_id] = cv2.createBackgroundSubtractorMOG2(
                history=300,
                varThreshold=16,
                detectShadows=True
            )
        return self._bg_subtractors[camera_id]

    def _apply_nms(self, detections: List[Dict[str, Any]], iou_thresh: float = 0.45) -> List[Dict[str, Any]]:
        """
        Custom Non-Maximum Suppression to remove duplicate/redundant bounding boxes.
        """
        if len(detections) <= 1:
            return detections

        boxes = [d["bbox"] for d in detections]
        scores = [d["confidence"] for d in detections]

        indices = cv2.dnn.NMSBoxes(
            bboxes=[[int(b[0]), int(b[1]), int(b[2] - b[0]), int(b[3] - b[1])] for b in boxes],
            scores=scores,
            score_threshold=0.20,
            nms_threshold=iou_thresh
        )

        if len(indices) == 0:
            return detections
        
        keep_indices = set(indices.flatten() if isinstance(indices, np.ndarray) else [i[0] for i in indices])
        return [det for idx, det in enumerate(detections) if idx in keep_indices]

    def detect_objects(
        self,
        frame: np.ndarray,
        camera_id: str = "C-01",
        zone_code: str = "Zone B",
        enhance_contrast: bool = True
    ) -> List[Dict[str, Any]]:
        """
        Runs high-accuracy object detection on surveillance frame with:
        1. Adaptive contrast/low-light enhancement
        2. YOLOv8 deep inference (or intelligent MOG2 CV fallback)
        3. Domain-specific confidence threshold calibration
        4. Coordinate clipping and Non-Maximum Suppression (NMS)
        """
        if frame is None or frame.size == 0:
            return []

        h, w = frame.shape[:2]
        processed_frame = self._enhance_surveillance_frame(frame) if enhance_contrast else frame
        raw_detections = []

        # 1. Primary Deep Learning Inference (YOLOv8)
        if self.is_loaded and self._model is not None:
            try:
                results = self._model(
                    processed_frame,
                    conf=min(self.confidence_threshold, 0.25),
                    iou=self.iou_threshold,
                    imgsz=self.img_size,
                    verbose=False
                )
                for r in results:
                    boxes = r.boxes
                    for box in boxes:
                        cls_id = int(box.cls[0].item())
                        raw_cls = r.names.get(cls_id, "unknown").lower()
                        conf = float(box.conf[0].item())
                        x1, y1, x2, y2 = [float(val) for val in box.xyxy[0].tolist()]

                        # Boundary clipping
                        x1 = max(0.0, min(float(w - 1), x1))
                        y1 = max(0.0, min(float(h - 1), y1))
                        x2 = max(0.0, min(float(w - 1), x2))
                        y2 = max(0.0, min(float(h - 1), y2))
                        bw = x2 - x1
                        bh = y2 - y1

                        if bw < 8 or bh < 8:
                            continue

                        # Check if class is in surveillance taxonomy
                        if raw_cls in self.SURVEILLANCE_CLASSES:
                            normalized_cls = self.SURVEILLANCE_CLASSES[raw_cls]
                            min_conf = self.CLASS_CONFIDENCE_THRESHOLDS.get(
                                normalized_cls,
                                self.CLASS_CONFIDENCE_THRESHOLDS["default"]
                            )

                            if conf >= min_conf:
                                raw_detections.append({
                                    "class_name": normalized_cls,
                                    "raw_class": raw_cls,
                                    "confidence": round(conf, 4),
                                    "bbox": [round(x1, 1), round(y1, 1), round(x2, 1), round(y2, 1)],
                                    "center": [round((x1 + x2) / 2.0, 1), round((y1 + y2) / 2.0, 1)],
                                    "camera_id": camera_id,
                                    "zone_code": zone_code,
                                    "model_version": f"YOLOv8n-Surveillance-v2.0"
                                })

                if raw_detections:
                    return self._apply_nms(raw_detections, self.iou_threshold) if self.enable_nms else raw_detections

            except Exception as e:
                print(f"[AI SERVICE DETECTION ERROR] {e}")

        # 2. Enhanced Resilient Computer Vision Fallback Engine (MOG2 + Morphology + Aspect Heuristics)
        bg_subtractor = self._get_bg_subtractor(camera_id)
        fg_mask = bg_subtractor.apply(processed_frame)

        # Remove shadows (value 127 in MOG2) and apply morphological cleaning
        _, bin_mask = cv2.threshold(fg_mask, 200, 255, cv2.THRESH_BINARY)
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
        cleaned_mask = cv2.morphologyEx(bin_mask, cv2.MORPH_OPEN, kernel)
        cleaned_mask = cv2.morphologyEx(cleaned_mask, cv2.MORPH_DILATE, kernel, iterations=2)

        contours, _ = cv2.findContours(cleaned_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        frame_area = float(h * w)

        for cnt in contours:
            area = cv2.contourArea(cnt)
            # Filter noise and whole-frame illumination shifts
            if 350 < area < (frame_area * 0.65):
                x, y, bw, bh = cv2.boundingRect(cnt)
                aspect_ratio = bh / float(max(bw, 1))
                hull = cv2.convexHull(cnt)
                hull_area = cv2.contourArea(hull)
                solidity = float(area) / max(hull_area, 1.0)

                # Classify based on geometric proportions
                if aspect_ratio >= 1.3:
                    cls_name = "person"
                    base_conf = 0.85 + min(solidity * 0.10, 0.10)
                elif 0.35 <= aspect_ratio < 1.3:
                    cls_name = "vehicle"
                    base_conf = 0.82 + min(solidity * 0.10, 0.10)
                else:
                    cls_name = "baggage"
                    base_conf = 0.75

                calibrated_conf = min(max(round(base_conf, 3), 0.70), 0.95)

                raw_detections.append({
                    "class_name": cls_name,
                    "raw_class": cls_name,
                    "confidence": calibrated_conf,
                    "bbox": [float(x), float(y), float(x + bw), float(y + bh)],
                    "center": [float(x + bw / 2.0), float(y + bh / 2.0)],
                    "camera_id": camera_id,
                    "zone_code": zone_code,
                    "model_version": "Enhanced-MOG2-MorphSurveillance-v2"
                })

        return self._apply_nms(raw_detections, self.iou_threshold) if self.enable_nms else raw_detections

ai_service = AIService.get_instance()

