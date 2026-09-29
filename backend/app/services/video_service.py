import os
import cv2
import time
import numpy as np
from typing import Optional, Generator, Tuple
from abc import ABC, abstractmethod

class VideoSourceAdapter(ABC):
    @abstractmethod
    def connect(self) -> bool:
        pass

    @abstractmethod
    def disconnect(self) -> None:
        pass

    @abstractmethod
    def read_frame(self) -> Tuple[bool, Optional[np.ndarray]]:
        pass

    @abstractmethod
    def get_status(self) -> dict:
        pass

class LocalVideoAdapter(VideoSourceAdapter):
    def __init__(self, source_path: str, loop: bool = True):
        self.source_path = source_path
        self.loop = loop
        self.cap: Optional[cv2.VideoCapture] = None
        self.is_connected = False
        self.fps = 25.0
        self.frame_count = 0
        self.current_frame_idx = 0

    def connect(self) -> bool:
        if not os.path.exists(self.source_path):
            self.is_connected = False
            return False
        self.cap = cv2.VideoCapture(self.source_path)
        if self.cap.isOpened():
            self.is_connected = True
            self.fps = self.cap.get(cv2.CAP_PROP_FPS) or 25.0
            self.frame_count = int(self.cap.get(cv2.CAP_PROP_FRAME_COUNT))
            return True
        self.is_connected = False
        return False

    def disconnect(self) -> None:
        if self.cap:
            self.cap.release()
            self.cap = None
        self.is_connected = False

    def read_frame(self) -> Tuple[bool, Optional[np.ndarray]]:
        if not self.is_connected or not self.cap:
            return False, None
        
        ret, frame = self.cap.read()
        if not ret:
            if self.loop and self.frame_count > 0:
                self.cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                ret, frame = self.cap.read()
                if not ret:
                    return False, None
            else:
                return False, None
        self.current_frame_idx += 1
        return True, frame

    def get_status(self) -> dict:
        return {
            "adapter": "LocalVideoAdapter",
            "source": self.source_path,
            "connected": self.is_connected,
            "fps": self.fps,
            "frame_idx": self.current_frame_idx,
            "total_frames": self.frame_count
        }

class RTSPAdapter(VideoSourceAdapter):
    """Integration-ready RTSP stream adapter with reconnection handling"""
    def __init__(self, rtsp_url: str):
        self.rtsp_url = rtsp_url
        self.cap: Optional[cv2.VideoCapture] = None
        self.is_connected = False
        self.fps = 25.0

    def connect(self) -> bool:
        try:
            self.cap = cv2.VideoCapture(self.rtsp_url, cv2.CAP_FFMPEG)
            self.is_connected = self.cap.isOpened()
            if self.is_connected:
                self.fps = self.cap.get(cv2.CAP_PROP_FPS) or 25.0
            return self.is_connected
        except Exception:
            self.is_connected = False
            return False

    def disconnect(self) -> None:
        if self.cap:
            self.cap.release()
            self.cap = None
        self.is_connected = False

    def read_frame(self) -> Tuple[bool, Optional[np.ndarray]]:
        if not self.is_connected or not self.cap:
            return False, None
        return self.cap.read()

    def get_status(self) -> dict:
        return {
            "adapter": "RTSPAdapter",
            "source": self.rtsp_url,
            "connected": self.is_connected,
            "fps": self.fps,
            "status": "INTEGRATION_READY"
        }

class SyntheticVideoGenerator:
    """Generates synthetic surveillance video frames with moving targets for zero-setup demo"""
    @staticmethod
    def generate_demo_video(output_path: str, duration_sec: int = 15, fps: int = 20):
        width, height = 640, 360
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
        
        total_frames = duration_sec * fps
        for i in range(total_frames):
            # Create border security scene background (night / thermal tones)
            frame = np.zeros((height, width, 3), dtype=np.uint8)
            frame[:] = (30, 35, 40) # dark ground
            
            # Draw border fence line
            cv2.line(frame, (0, 200), (640, 200), (80, 80, 80), 2)
            for x in range(0, 640, 40):
                cv2.line(frame, (x, 170), (x, 230), (60, 60, 60), 1)
                
            # Draw patrol road
            pts = np.array([[0, 260], [640, 260], [640, 360], [0, 360]], np.int32)
            cv2.fillPoly(frame, [pts], (45, 50, 55))
            
            # Moving person
            progress = (i % (fps * 10)) / (fps * 10)
            person_x = int(50 + progress * 500)
            person_y = int(220 + np.sin(progress * np.pi * 4) * 15)
            
            # Draw synthetic person silhouette
            cv2.circle(frame, (person_x, person_y - 30), 8, (200, 200, 210), -1) # head
            cv2.rectangle(frame, (person_x - 6, person_y - 20), (person_x + 6, person_y + 10), (180, 180, 190), -1) # torso
            cv2.line(frame, (person_x - 4, person_y + 10), (person_x - 8, person_y + 28), (160, 160, 170), 3) # leg 1
            cv2.line(frame, (person_x + 4, person_y + 10), (person_x + 8, person_y + 28), (160, 160, 170), 3) # leg 2
            
            # Moving vehicle (on road)
            veh_progress = (i % (fps * 8)) / (fps * 8)
            veh_x = int(600 - veh_progress * 550)
            veh_y = 290
            cv2.rectangle(frame, (veh_x - 30, veh_y - 15), (veh_x + 30, veh_y + 10), (70, 110, 150), -1) # vehicle body
            cv2.circle(frame, (veh_x - 18, veh_y + 12), 6, (30, 30, 30), -1) # wheel
            cv2.circle(frame, (veh_x + 18, veh_y + 12), 6, (30, 30, 30), -1) # wheel
            
            # Overlay timestamp & camera HUD
            cv2.putText(frame, f"CAM: C-01 [SECTOR 4]  FPS: {fps}", (10, 25), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 180), 1)
            cv2.putText(frame, time.strftime("%Y-%m-%d %H:%M:%S"), (10, 50), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (220, 220, 220), 1)
            
            out.write(frame)
            
        out.release()
        return output_path
