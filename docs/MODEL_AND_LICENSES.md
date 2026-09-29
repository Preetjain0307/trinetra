# TRINETRA — AI Models, Licensure & Commercial Viability

## 1. AI Architecture Overview

TRINETRA uses a **modular, pluggable AI interface architecture** rather than hard-coding dependencies to a single vendor model:

```
                  ┌──────────────────────┐
                  │   AI Pipeline Base   │
                  └──────────┬───────────┘
                             │
       ┌─────────────────────┼─────────────────────┐
       ▼                     ▼                     ▼
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   Detector   │      │   Tracker    │      │  ANPR / OCR  │
│  (YOLOv8/11) │      │ (ByteTrack)  │      │  (Tesseract) │
└──────────────┘      └──────────────┘      └──────────────┘
```

---

## 2. Models & Licensure Matrix

| Component | Model / Engine | Version | License Type | Commercial-Use Status | Open-Source / Defence Alternative |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Object Detection** | Ultralytics YOLOv8n / v11 | v8.0 / v11.0 | AGPL-3.0 (Open Source) / Enterprise Commercial | Prototype evaluated under AGPL-3.0. For closed-source defence deployment, commercial license or Apache-2.0 alternative required. | ONNX Runtime + TensorRT-YOLO (Apache 2.0) / RT-DETR (Apache 2.0) |
| **Multi-Object Tracking** | ByteTrack / SimpleTracker | v1.0.2 | MIT License | 100% Free & Unrestricted Commercial Use. | Included natively. |
| **ANPR / License OCR** | EasyOCR / PyTesseract | v1.7.0 | Apache 2.0 / BSD | 100% Free & Unrestricted Commercial Use. | Included natively. |
| **Cross-Camera Re-ID** | Spatio-Temporal Topology | Native Rule Engine | MIT License | 100% Free & Defensible Algorithm. | Included natively. |
| **Feature Extraction** | ResNet50 / MobileNetV3 | PyTorch Pretrained | BSD 3-Clause | 100% Free & Unrestricted Commercial Use. | Included natively. |

---

## 3. Modular Replacement Architecture

To swap the detector from YOLOv8 to an Apache-2.0 or proprietary defence model:
1. Implement the `BaseDetector` interface (`backend/app/services/ai_service.py`).
2. Implement `detect_frame(frame: np.ndarray) -> List[DetectionResult]`.
3. Configure `DETECTOR_BACKEND="ONNX_TENSORRT"` in `.env`.
