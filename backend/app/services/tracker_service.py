import time
import math
from typing import List, Dict, Any, Optional

class ObjectTracker:
    def __init__(self, max_disappeared: int = 30, distance_threshold: float = 80.0):
        self.next_person_id = 14 # Seeded to match demo scenario P-014
        self.next_vehicle_id = 8  # Seeded to match demo scenario V-008
        self.tracks: Dict[str, Dict[str, Any]] = {}
        self.disappeared: Dict[str, int] = {}
        self.distance_threshold = distance_threshold
        self.max_disappeared = max_disappeared

    def _calculate_iou(self, bbox1: List[float], bbox2: List[float]) -> float:
        x1 = max(bbox1[0], bbox2[0])
        y1 = max(bbox1[1], bbox2[1])
        x2 = min(bbox1[2], bbox2[2])
        y2 = min(bbox1[3], bbox2[3])

        intersection = max(0.0, x2 - x1) * max(0.0, y2 - y1)
        area1 = (bbox1[2] - bbox1[0]) * (bbox1[3] - bbox1[1])
        area2 = (bbox2[2] - bbox2[0]) * (bbox2[3] - bbox2[1])
        union = area1 + area2 - intersection

        return intersection / union if union > 0 else 0.0

    def _calculate_direction(self, trajectory: List[Dict[str, Any]]) -> str:
        if len(trajectory) < 2:
            return "STATIONARY"
        p1 = trajectory[0]
        p2 = trajectory[-1]
        dx = p2["x"] - p1["x"]
        dy = p2["y"] - p1["y"]

        if abs(dx) < 5 and abs(dy) < 5:
            return "STATIONARY"
        
        angle = math.degrees(math.atan2(-dy, dx)) # Cartesian angle
        if -22.5 <= angle < 22.5:
            return "E"
        elif 22.5 <= angle < 67.5:
            return "NE"
        elif 67.5 <= angle < 112.5:
            return "N"
        elif 112.5 <= angle < 157.5:
            return "NW"
        elif angle >= 157.5 or angle < -157.5:
            return "W"
        elif -157.5 <= angle < -112.5:
            return "SW"
        elif -112.5 <= angle < -67.5:
            return "S"
        else:
            return "SE"

    def update(self, detections: List[Dict[str, Any]], camera_id: str, zone_code: str) -> List[Dict[str, Any]]:
        current_time = time.time()
        updated_detections = []

        if len(detections) == 0:
            for track_id in list(self.disappeared.keys()):
                self.disappeared[track_id] += 1
                if self.disappeared[track_id] > self.max_disappeared:
                    del self.tracks[track_id]
                    del self.disappeared[track_id]
            return []

        # Match existing tracks with incoming detections using IoU + Centroid Distance
        active_track_ids = list(self.tracks.keys())
        matched_tracks = set()
        matched_detections = set()

        for det_idx, det in enumerate(detections):
            best_match_id = None
            best_score = 0.0
            
            for track_id in active_track_ids:
                if track_id in matched_tracks:
                    continue
                track = self.tracks[track_id]
                if track["object_class"] != det["class_name"]:
                    continue

                # Compute IoU
                iou = self._calculate_iou(track["last_bbox"], det["bbox"])
                # Compute distance between centers
                cx, cy = det["center"]
                tcx, tcy = track["last_center"]
                dist = math.hypot(cx - tcx, cy - tcy)

                score = iou * 0.7 + (1.0 - min(dist / self.distance_threshold, 1.0)) * 0.3
                if (iou > 0.2 or dist < self.distance_threshold) and score > best_score:
                    best_score = score
                    best_match_id = track_id

            if best_match_id is not None:
                matched_tracks.add(best_match_id)
                matched_detections.add(det_idx)
                
                track = self.tracks[best_match_id]
                track["last_bbox"] = det["bbox"]
                track["last_center"] = det["center"]
                track["last_seen"] = current_time
                track["observation_count"] += 1
                track["camera_id"] = camera_id
                track["zone_code"] = zone_code
                track["trajectory"].append({
                    "x": det["center"][0],
                    "y": det["center"][1],
                    "t": current_time,
                    "cam": camera_id
                })
                track["direction"] = self._calculate_direction(track["trajectory"])
                self.disappeared[best_match_id] = 0

                det["track_id"] = best_match_id
                det["direction"] = track["direction"]
                det["observation_count"] = track["observation_count"]
                updated_detections.append(det)

        # Create new tracks for unmatched detections
        for det_idx, det in enumerate(detections):
            if det_idx not in matched_detections:
                if det["class_name"] == "person":
                    track_id = f"P-{self.next_person_id:03d}"
                    self.next_person_id += 1
                elif det["class_name"] == "vehicle":
                    track_id = f"V-{self.next_vehicle_id:03d}"
                    self.next_vehicle_id += 1
                else:
                    track_id = f"OBJ-{int(current_time) % 1000:03d}"

                self.tracks[track_id] = {
                    "track_id": track_id,
                    "object_class": det["class_name"],
                    "camera_id": camera_id,
                    "zone_code": zone_code,
                    "first_seen": current_time,
                    "last_seen": current_time,
                    "observation_count": 1,
                    "last_bbox": det["bbox"],
                    "last_center": det["center"],
                    "trajectory": [{
                        "x": det["center"][0],
                        "y": det["center"][1],
                        "t": current_time,
                        "cam": camera_id
                    }],
                    "direction": "STATIONARY",
                    "status": "ACTIVE"
                }
                self.disappeared[track_id] = 0

                det["track_id"] = track_id
                det["direction"] = "STATIONARY"
                det["observation_count"] = 1
                updated_detections.append(det)

        return updated_detections

tracker_service = ObjectTracker()
