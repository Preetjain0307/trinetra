import os
import math
import cv2
import numpy as np

def create_border_video(output_path: str, camera_id: str, duration_sec: int = 10, fps: int = 20):
    width, height = 640, 360
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
    total_frames = duration_sec * fps

    for f in range(total_frames):
        t = f / fps
        frame = np.zeros((height, width, 3), dtype=np.uint8)

        # Base background based on camera type
        cam_num = int(camera_id.replace("C-", ""))

        if cam_num in [7, 12, 15, 18]:
            # THERMAL FLIR PALETTE (Dark/Iron/Heat gradients)
            frame[:] = (18, 12, 28)
            # Draw thermal terrain contours
            for y_line in range(160, 360, 30):
                cv2.line(frame, (0, y_line), (width, y_line + 15), (35, 25, 55), 1)

            # Thermal fence/tree silhouettes
            for x in range(20, width, 50):
                tree_h = int(60 + 20 * math.sin(x))
                cv2.line(frame, (x, 220), (x, 220 - tree_h), (45, 30, 70), 2)
                cv2.circle(frame, (x, 220 - tree_h), 14, (55, 35, 80), -1)

            # Moving thermal targets (Hotspots)
            if cam_num == 7: # Dual thermal targets
                p1_x = int(120 + 200 * math.sin(t * 0.8))
                p1_y = int(180 + 10 * math.cos(t * 1.2))
                p2_x = int(220 + 180 * math.sin(t * 0.7 + 1.0))
                p2_y = int(200 + 8 * math.sin(t * 1.5))
                # White-hot / bright thermal core with gradient halo
                cv2.circle(frame, (p1_x, p1_y), 18, (120, 80, 240), -1)
                cv2.circle(frame, (p1_x, p1_y), 10, (200, 180, 255), -1)
                cv2.circle(frame, (p1_x, p1_y), 4, (255, 255, 255), -1)

                cv2.circle(frame, (p2_x, p2_y), 16, (120, 80, 240), -1)
                cv2.circle(frame, (p2_x, p2_y), 9, (200, 180, 255), -1)
                cv2.circle(frame, (p2_x, p2_y), 4, (255, 255, 255), -1)
            elif cam_num == 15: # Riverine thermal boat
                # River water surface with thermal ripples
                pts = np.array([[0, 200], [width, 180], [width, 360], [0, 360]], np.int32)
                cv2.fillPoly(frame, [pts], (40, 20, 20))
                for w_step in range(0, width, 40):
                    wave_y = int(240 + 8 * math.sin(t * 3 + w_step * 0.05))
                    cv2.line(frame, (w_step, wave_y), (w_step + 30, wave_y), (80, 40, 40), 1)
                # Thermal boat craft
                boat_x = int(60 + (f * 3.5) % (width - 120))
                boat_y = int(260 + 5 * math.sin(t * 2))
                cv2.ellipse(frame, (boat_x, boat_y), (35, 12), 0, 0, 360, (220, 180, 255), -1)
                cv2.rectangle(frame, (boat_x - 10, boat_y - 18), (boat_x + 10, boat_y - 4), (255, 220, 255), -1)
            else:
                th_x = int(180 + 160 * math.sin(t * 0.9))
                th_y = int(190 + 12 * math.cos(t * 1.1))
                cv2.circle(frame, (th_x, th_y), 16, (150, 90, 255), -1)
                cv2.circle(frame, (th_x, th_y), 8, (255, 255, 255), -1)

            # Thermal HUD
            cv2.putText(frame, "FLIR THERMAL IR [WHITE-HOT/IRONBOW]", (15, 25), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (220, 180, 255), 1)
            cv2.putText(frame, f"RANGE: 800m  CAL: AGC-AUTO  T-MAX: 38.4C", (15, 45), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (180, 140, 220), 1)

        elif cam_num == 19:
            # UAV AIRBORNE TOP-DOWN VIEW
            frame[:] = (35, 45, 30) # Terrain ground
            # Grid lines
            for gx in range(0, width, 80):
                cv2.line(frame, (gx, 0), (gx, height), (45, 60, 40), 1)
            for gy in range(0, height, 60):
                cv2.line(frame, (0, gy), (width, gy), (45, 60, 40), 1)

            # Top-down road
            cv2.line(frame, (0, 180), (width, 180), (70, 75, 70), 30)
            cv2.line(frame, (0, 180), (width, 180), (120, 120, 90), 1)

            # Top-down moving vehicles
            v1_x = int(80 + (f * 4.2) % (width - 160))
            v2_x = int(v1_x + 90) % (width - 160) + 80
            cv2.rectangle(frame, (v1_x - 20, 172), (v1_x + 20, 188), (140, 150, 160), -1)
            cv2.rectangle(frame, (v2_x - 20, 172), (v2_x + 20, 188), (120, 130, 140), -1)

            # UAV Reticle
            cv2.circle(frame, (width // 2, height // 2), 60, (0, 255, 200), 1)
            cv2.line(frame, (width // 2 - 80, height // 2), (width // 2 + 80, height // 2), (0, 255, 200), 1)
            cv2.line(frame, (width // 2, height // 2 - 80), (width // 2, height // 2 + 80), (0, 255, 200), 1)
            cv2.putText(frame, "NETRA-V UAV AIRBORNE GRID [EO/IR GIMBAL]", (15, 25), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 255, 200), 1)
            cv2.putText(frame, f"ALT: 120m  FOV: 42.5  GPS: 32.228N 75.140E", (15, 45), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (0, 220, 180), 1)

        elif cam_num in [4, 5, 9, 10]:
            # BORDER CHECKPOINT / ANPR GATE (Gate Alpha / Gate Bravo)
            # Dusk/Day Checkpoint Environment
            frame[:] = (45, 48, 52) # Asphalt tarmac
            # Guard Booth
            cv2.rectangle(frame, (30, 80), (160, 280), (80, 85, 95), -1)
            cv2.rectangle(frame, (50, 110), (140, 170), (180, 210, 230), -1) # Booth window
            cv2.putText(frame, "BSF CHECKPOST", (40, 100), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 255), 1)

            # Lane markings (Yellow stripes)
            for lx in range(180, width, 60):
                cv2.rectangle(frame, (lx, 260), (lx + 30, 270), (50, 180, 220), -1)

            # Boom Barrier (Striped red and white)
            cv2.line(frame, (160, 200), (480, 200), (255, 255, 255), 6)
            for bx in range(170, 480, 30):
                cv2.line(frame, (bx, 197), (bx + 15, 203), (0, 0, 220), 5)

            # Moving Checkpoint Vehicle
            veh_progress = (t * 0.35) % 1.0
            veh_x = int(180 + veh_progress * 300)
            veh_y = int(220)

            # Draw SUV / Car Body
            cv2.rectangle(frame, (veh_x - 55, veh_y - 30), (veh_x + 55, veh_y + 20), (160, 170, 180), -1)
            cv2.rectangle(frame, (veh_x - 35, veh_y - 50), (veh_x + 35, veh_y - 30), (80, 110, 130), -1) # Cabin
            cv2.circle(frame, (veh_x - 35, veh_y + 20), 12, (20, 20, 20), -1) # Wheels
            cv2.circle(frame, (veh_x + 35, veh_y + 20), 12, (20, 20, 20), -1)

            # License Plate on Bumper
            plate_text = "MH01AB1234" if cam_num == 4 else ("DL04C9921" if cam_num == 9 else "JK02AB9912")
            cv2.rectangle(frame, (veh_x - 22, veh_y + 5), (veh_x + 22, veh_y + 18), (240, 240, 240), -1)
            cv2.rectangle(frame, (veh_x - 22, veh_y + 5), (veh_x + 22, veh_y + 18), (0, 0, 0), 1)
            cv2.putText(frame, plate_text[:6], (veh_x - 20, veh_y + 15), cv2.FONT_HERSHEY_SIMPLEX, 0.3, (0, 0, 0), 1)

            # Guard Sentry standing at booth
            cv2.circle(frame, (175, 170), 9, (200, 190, 180), -1) # Head
            cv2.rectangle(frame, (168, 180), (182, 230), (45, 90, 60), -1) # Uniform Torso
            cv2.line(frame, (170, 230), (170, 270), (30, 60, 40), 4) # Legs
            cv2.line(frame, (180, 230), (180, 270), (30, 60, 40), 4)

            cv2.putText(frame, f"CAM {camera_id}: BORDER CHECKPOINT & ANPR", (15, 25), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 255, 180), 1)
            cv2.putText(frame, f"GATE LANE ANPR OCR: ACTIVE  SPEED: 18 km/h", (15, 45), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (200, 220, 220), 1)

        else:
            # BORDER FENCE & ZERO-LINE PERIMETER OPTICAL (Night/Dusk Tactical)
            # Terrain ground and twilight sky
            frame[0:150] = (25, 30, 35) # Dusk sky
            frame[150:360] = (30, 38, 30) # Border ground

            # Distant Mountains
            mountain_pts = np.array([[0, 150], [120, 90], [260, 140], [420, 80], [560, 130], [640, 100], [640, 150], [0, 150]], np.int32)
            cv2.fillPoly(frame, [mountain_pts], (20, 24, 28))

            # Border Watchtower in distance
            cv2.rectangle(frame, (520, 80), (550, 170), (50, 55, 60), -1)
            cv2.rectangle(frame, (510, 60), (560, 80), (60, 65, 70), -1) # Cabin
            # Searchlight beam
            beam_pts = np.array([[535, 70], [0, 320], [300, 360]], np.int32)
            overlay = frame.copy()
            cv2.fillPoly(overlay, [beam_pts], (60, 80, 85))
            cv2.addWeighted(overlay, 0.25, frame, 0.75, 0, frame)

            # Heavy Border Razor Wire Fence across middle
            cv2.line(frame, (0, 180), (width, 180), (75, 80, 85), 3)
            cv2.line(frame, (0, 210), (width, 210), (75, 80, 85), 3)
            cv2.line(frame, (0, 240), (width, 240), (75, 80, 85), 3)

            # Vertical Fence Posts & Concertina Coils
            for px in range(0, width, 35):
                cv2.line(frame, (px, 150), (px, 260), (90, 95, 100), 3)
                # Concertina coil circles
                cv2.circle(frame, (px + 17, 195), 14, (70, 75, 80), 1)
                cv2.circle(frame, (px + 17, 225), 14, (70, 75, 80), 1)

            # Patrol Road in foreground
            road_pts = np.array([[0, 280], [width, 280], [width, 360], [0, 360]], np.int32)
            cv2.fillPoly(frame, [road_pts], (42, 45, 48))

            # Moving Targets
            if cam_num in [1, 6, 11, 20]:
                # 2 Moving Person Silhouettes along the fence
                p_progress = (t * 0.4) % 1.0
                px1 = int(100 + p_progress * 380)
                py1 = int(220 + 8 * math.sin(t * 4))
                # Person 1
                cv2.circle(frame, (px1, py1 - 32), 8, (190, 190, 200), -1) # Head
                cv2.rectangle(frame, (px1 - 6, py1 - 22), (px1 + 6, py1 + 8), (140, 140, 150), -1) # Body
                cv2.line(frame, (px1 - 3, py1 + 8), (px1 - 7, py1 + 26), (120, 120, 130), 3) # Leg 1
                cv2.line(frame, (px1 + 3, py1 + 8), (px1 + 7, py1 + 26), (120, 120, 130), 3) # Leg 2

                # Person 2 (Following)
                px2 = px1 - 55
                if px2 > 20:
                    cv2.circle(frame, (px2, py1 - 30), 8, (180, 180, 190), -1)
                    cv2.rectangle(frame, (px2 - 6, py1 - 20), (px2 + 6, py1 + 8), (130, 130, 140), -1)
                    cv2.line(frame, (px2 - 3, py1 + 8), (px2 - 7, py1 + 26), (110, 110, 120), 3)
                    cv2.line(frame, (px2 + 3, py1 + 8), (px2 + 7, py1 + 26), (110, 110, 120), 3)

            elif cam_num in [3, 8, 13, 14, 17]:
                # Moving Patrol SUV / Convoy along patrol track
                v_progress = (t * 0.5) % 1.0
                vx = int(width - 60 - v_progress * 480)
                vy = 310
                # Vehicle Body
                cv2.rectangle(frame, (vx - 45, vy - 22), (vx + 45, vy + 12), (50, 75, 60), -1) # Military Green
                cv2.rectangle(frame, (vx - 25, vy - 36), (vx + 25, vy - 22), (40, 60, 50), -1) # Cabin
                cv2.circle(frame, (vx - 26, vy + 12), 9, (20, 20, 20), -1) # Wheels
                cv2.circle(frame, (vx + 26, vy + 12), 9, (20, 20, 20), -1)
                # Roof emergency strobe (Flashing amber/red)
                strobe_color = (0, 180, 255) if int(t * 8) % 2 == 0 else (0, 0, 255)
                cv2.circle(frame, (vx, vy - 40), 5, strobe_color, -1)
                # Headlight beam
                headlight_pts = np.array([[vx - 45, vy - 5], [0, vy + 30], [0, vy - 40]], np.int32)
                h_overlay = frame.copy()
                cv2.fillPoly(h_overlay, [headlight_pts], (180, 220, 240))
                cv2.addWeighted(h_overlay, 0.20, frame, 0.80, 0, frame)

            else:
                # Sentry Guard on Patrol
                s_progress = (math.sin(t * 1.5) + 1.0) / 2.0
                sx = int(220 + s_progress * 180)
                sy = 225
                cv2.circle(frame, (sx, sy - 30), 8, (210, 210, 210), -1) # Helmet
                cv2.rectangle(frame, (sx - 6, sy - 20), (sx + 6, sy + 8), (40, 80, 50), -1) # Camouflage
                cv2.line(frame, (sx - 3, sy + 8), (sx - 6, sy + 25), (30, 60, 40), 3)
                cv2.line(frame, (sx + 3, sy + 8), (sx + 6, sy + 25), (30, 60, 40), 3)
                # Sentry INSAS Rifle slung
                cv2.line(frame, (sx + 4, sy - 15), (sx + 14, sy + 10), (10, 10, 10), 2)

            cv2.putText(frame, f"CAM {camera_id}: PERIMETER WIRE SEC-4 [OPTICAL HD]", (15, 25), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 255, 180), 1)
            cv2.putText(frame, f"ZERO-LINE SENSOR ARRAY: ONLINE  FPS: {fps}", (15, 45), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (200, 220, 220), 1)

        # Tactical Timestamp HUD on all frames
        import datetime
        cur_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S") + f".{int((f % fps) * 45):02d}"
        cv2.putText(frame, cur_str, (width - 210, 25), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (220, 220, 220), 1)
        cv2.putText(frame, "TRINETRA SEC-NET", (width - 150, 45), cv2.FONT_HERSHEY_SIMPLEX, 0.35, (100, 200, 150), 1)

        out.write(frame)

    out.release()
    print(f"Generated border video for {camera_id} at {output_path}")

def generate_all_border_videos():
    frontend_videos_dir = os.path.abspath("frontend/public/videos")
    backend_videos_dir = os.path.abspath("data/videos")
    os.makedirs(frontend_videos_dir, exist_ok=True)
    os.makedirs(backend_videos_dir, exist_ok=True)

    for i in range(1, 21):
        cam_id = f"C-{i:02d}"
        fname = f"cctv_{i:02d}.mp4"
        f_path = os.path.join(frontend_videos_dir, fname)
        b_path = os.path.join(backend_videos_dir, fname)
        create_border_video(f_path, cam_id, duration_sec=10, fps=20)
        # Also copy / generate to backend data directory
        import shutil
        shutil.copy2(f_path, b_path)

if __name__ == "__main__":
    generate_all_border_videos()
