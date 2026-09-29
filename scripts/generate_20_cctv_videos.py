import os
import cv2
import time
import math
import numpy as np

def create_surveillance_videos(output_dir: str):
    os.makedirs(output_dir, exist_ok=True)
    width, height = 640, 360
    fps = 20
    duration_sec = 10
    total_frames = duration_sec * fps
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')

    print(f"Generating 20 distinct real-world surveillance CCTV video feeds in {output_dir}...")

    scenes = [
        # (id, name, theme, objects)
        ("cctv_01.mp4", "C-01 North Perimeter Fence", "night_fence", "person"),
        ("cctv_02.mp4", "C-02 North Post Sentry", "day_post", "guard"),
        ("cctv_03.mp4", "C-03 Patrol Road West", "road_patrol", "suv"),
        ("cctv_04.mp4", "C-04 Checkpoint Ingress ANPR", "gate_anpr", "car_plate1"),
        ("cctv_05.mp4", "C-05 Checkpoint Egress", "gate_egress", "truck"),
        ("cctv_06.mp4", "C-06 Culvert Drainage Trench", "culvert_trench", "anomaly"),
        ("cctv_07.mp4", "C-07 Watchtower 7 Thermal", "thermal_ir", "heat_blob"),
        ("cctv_08.mp4", "C-08 Patrol Corridor Charlie", "convoy_road", "two_cars"),
        ("cctv_09.mp4", "C-09 Gate Bravo Lane 1", "gate_bravo", "pickup_plate"),
        ("cctv_10.mp4", "C-10 Gate Bravo Lane 2", "gate_bravo_flagged", "flagged_car"),
        ("cctv_11.mp4", "C-11 East Perimeter Wire", "electric_fence", "fence_sweep"),
        ("cctv_12.mp4", "C-12 Zero-Line Buffer Thermal", "thermal_buffer", "heat_human"),
        ("cctv_13.mp4", "C-13 QRT Helipad & Depot", "helipad_depot", "ground_crew"),
        ("cctv_14.mp4", "C-14 Ammunition Armory Ring", "armory_revetment", "patrol_sentry"),
        ("cctv_15.mp4", "C-15 Riverine Crossing South", "river_boundary", "boat_movement"),
        ("cctv_16.mp4", "C-16 Radar Mast Vista", "radar_hilltop", "radar_dish"),
        ("cctv_17.mp4", "C-17 Logistics Junction Delta", "crossroads", "turning_truck"),
        ("cctv_18.mp4", "C-18 Dense Foliage Treeline", "thermal_foliage", "treeline_blob"),
        ("cctv_19.mp4", "C-19 Netra-V UAV Drone Cam", "drone_aerial", "aerial_cars"),
        ("cctv_20.mp4", "C-20 Forward Bunker 1", "bunker_slit", "bunker_sentry"),
    ]

    for idx, (filename, label, theme, obj_type) in enumerate(scenes, 1):
        out_path = os.path.join(output_dir, filename)
        out = cv2.VideoWriter(out_path, fourcc, fps, (width, height))
        
        for frame_idx in range(total_frames):
            t = frame_idx / fps
            frame = np.zeros((height, width, 3), dtype=np.uint8)

            # 1. Background generation based on theme
            if "thermal" in theme:
                # Dark green-black infrared palette
                frame[:] = (15, 30, 20)
                # Thermal noise and gradient ground
                for y in range(height):
                    shade = int(20 + 25 * (y / height))
                    frame[y, :] = (int(shade * 0.7), shade, int(shade * 0.8))
                # Add thermal trees
                for tx in [80, 180, 320, 480, 580]:
                    cv2.ellipse(frame, (tx, 140), (40, 70), 0, 0, 360, (25, 45, 30), -1)
            elif "aerial" in theme:
                # Aerial desert / border terrain
                frame[:] = (55, 75, 90)
                # Diagonal road
                cv2.line(frame, (0, 300), (640, 60), (70, 70, 75), 45)
                cv2.line(frame, (0, 300), (640, 60), (180, 180, 180), 2)
            elif "river" in theme:
                # Water background
                for y in range(height):
                    if y < 150:
                        frame[y, :] = (40, 45, 50) # Far bank
                    else:
                        wave = int(math.sin((y + frame_idx * 4) * 0.1) * 8)
                        frame[y, :] = (90 + wave, 65 + wave, 35) # River surface
            elif "gate" in theme:
                # Checkpoint pavement
                frame[:] = (45, 45, 50)
                # Inspection booth
                cv2.rectangle(frame, (460, 100), (620, 280), (70, 75, 80), -1)
                cv2.rectangle(frame, (480, 130), (540, 180), (140, 160, 180), -1) # Booth window
                # Lane markings
                for y in range(80, 360, 40):
                    cv2.rectangle(frame, (280, y), (290, y + 25), (200, 200, 200), -1)
                # Barrier boom arm
                barrier_angle = math.sin(t * 1.2) * 0.4 if "egress" in theme or "plate1" in obj_type else 0
                bx_end = int(280 + math.cos(barrier_angle) * 160)
                by_end = int(220 - math.sin(barrier_angle) * 120)
                cv2.line(frame, (460, 220), (bx_end, by_end), (40, 40, 220), 6)
                cv2.line(frame, (460, 220), (bx_end, by_end), (220, 220, 220), 2)
            elif "helipad" in theme:
                frame[:] = (40, 45, 45)
                # Helipad circle and H
                cv2.circle(frame, (320, 200), 100, (200, 200, 200), 4)
                cv2.line(frame, (280, 150), (280, 250), (200, 200, 200), 10)
                cv2.line(frame, (360, 150), (360, 250), (200, 200, 200), 10)
                cv2.line(frame, (280, 200), (360, 200), (200, 200, 200), 10)
            elif "bunker" in theme:
                frame[:] = (20, 25, 30)
                # Bunker viewport mask
                cv2.rectangle(frame, (0, 0), (640, 80), (10, 10, 12), -1)
                cv2.rectangle(frame, (0, 280), (640, 360), (10, 10, 12), -1)
                cv2.rectangle(frame, (0, 0), (60, 360), (10, 10, 12), -1)
                cv2.rectangle(frame, (580, 0), (640, 360), (10, 10, 12), -1)
                # Wire fence visible outside
                cv2.line(frame, (60, 200), (580, 200), (70, 70, 80), 2)
            else:
                # General perimeter ground and fence
                frame[:] = (35, 40, 45)
                # Asphalt road or fence
                if "road" in theme or "crossroads" in theme:
                    cv2.rectangle(frame, (0, 200), (640, 340), (55, 60, 65), -1)
                    for x in range(0, 640, 50):
                        cv2.rectangle(frame, (x, 265), (x + 30, 270), (210, 210, 210), -1)
                else:
                    # Fence posts and wire
                    cv2.line(frame, (0, 190), (640, 190), (80, 80, 90), 2)
                    cv2.line(frame, (0, 220), (640, 220), (80, 80, 90), 2)
                    for x in range(0, 640, 40):
                        cv2.line(frame, (x, 160), (x, 250), (100, 100, 110), 2)

            # 2. Dynamic Moving Objects & Silhouettes
            progress = (frame_idx % (fps * 8)) / (fps * 8)

            if "person" in obj_type or "guard" in obj_type or "bunker_sentry" in obj_type:
                px = int(80 + progress * 460) if "person" in obj_type else int(200 + math.sin(t * 1.5) * 80)
                py = int(210 + math.sin(t * 6) * 5)
                # Person body
                cv2.circle(frame, (px, py - 32), 9, (190, 200, 210), -1) # Head
                cv2.rectangle(frame, (px - 8, py - 22), (px + 8, py + 12), (150, 160, 170), -1) # Torso
                # Legs walking animation
                leg_swing = int(math.sin(t * 10) * 12)
                cv2.line(frame, (px - 4, py + 12), (px - 4 + leg_swing, py + 34), (130, 140, 150), 3)
                cv2.line(frame, (px + 4, py + 12), (px + 4 - leg_swing, py + 34), (130, 140, 150), 3)
                # Flashlight beam if night sentry
                if "01" in filename or "02" in filename:
                    pts = np.array([[px + 8, py - 10], [px + 120, py - 50], [px + 120, py + 60]], np.int32)
                    overlay = frame.copy()
                    cv2.fillPoly(overlay, [pts], (180, 220, 255))
                    cv2.addWeighted(overlay, 0.15, frame, 0.85, 0, frame)

            elif "heat" in obj_type:
                # Thermal heat signature (Hot white/yellow/red glow)
                hx = int(120 + progress * 400)
                hy = int(180 + math.sin(t * 4) * 10)
                # Multi-layered glowing thermal blob
                cv2.circle(frame, (hx, hy), 22, (40, 180, 255), -1) # Red-orange outer
                cv2.circle(frame, (hx, hy), 15, (80, 240, 255), -1) # Yellow mid
                cv2.circle(frame, (hx, hy), 8, (240, 255, 255), -1) # White hot core
                # Foot heat trail
                cv2.circle(frame, (hx - 15, hy + 20), 6, (30, 120, 200), -1)

            elif "suv" in obj_type or "car" in obj_type or "flagged_car" in obj_type or "pickup" in obj_type or "truck" in obj_type:
                vx = int(620 - progress * 600) if "03" in filename or "05" in filename or "08" in filename else int(80 + progress * 460)
                vy = 250 if "gate" in theme else 270

                # Vehicle body
                v_color = (40, 40, 180) if "flagged" in obj_type else (160, 140, 110) if "suv" in obj_type else (80, 90, 100)
                cv2.rectangle(frame, (vx - 50, vy - 24), (vx + 50, vy + 14), v_color, -1)
                cv2.rectangle(frame, (vx - 30, vy - 42), (vx + 30, vy - 24), (120, 130, 140), -1) # Cabin
                # Wheels
                cv2.circle(frame, (vx - 32, vy + 16), 10, (20, 20, 20), -1)
                cv2.circle(frame, (vx + 32, vy + 16), 10, (20, 20, 20), -1)
                cv2.circle(frame, (vx - 32, vy + 16), 4, (180, 180, 180), -1)
                cv2.circle(frame, (vx + 32, vy + 16), 4, (180, 180, 180), -1)

                # Headlights
                hl_x = vx + 52 if vx < 320 else vx - 52
                cv2.circle(frame, (hl_x, vy - 10), 5, (200, 255, 255), -1)
                
                # Visible License Plate Graphic on gate cameras
                if "plate" in obj_type or "flagged" in obj_type or "gate" in theme:
                    plate_str = "JK 02 AB 9912" if "flagged" in obj_type else "MH 01 AB 1234" if "plate1" in obj_type else "DL 04 C 9921"
                    cv2.rectangle(frame, (vx - 22, vy + 2), (vx + 22, vy + 14), (240, 240, 240), -1)
                    cv2.rectangle(frame, (vx - 22, vy + 2), (vx + 22, vy + 14), (0, 0, 0), 1)
                    cv2.putText(frame, plate_str[:8], (vx - 20, vy + 11), cv2.FONT_HERSHEY_SIMPLEX, 0.25, (0, 0, 0), 1)

            elif "boat" in obj_type:
                # River patrol boat
                bx = int(100 + progress * 440)
                by = int(220 + math.sin(t * 3) * 6)
                pts = np.array([[bx - 40, by], [bx + 40, by], [bx + 30, by + 18], [bx - 30, by + 18]], np.int32)
                cv2.fillPoly(frame, [pts], (60, 70, 80))
                cv2.rectangle(frame, (bx - 15, by - 16), (bx + 10, by), (180, 190, 200), -1)
                # Wake ripples
                cv2.line(frame, (bx - 40, by + 10), (bx - 90, by + 20), (140, 180, 210), 2)
                cv2.line(frame, (bx - 40, by + 10), (bx - 90, by), (140, 180, 210), 2)

            elif "radar_dish" in obj_type:
                # Radar antenna rotation
                rx, ry = 320, 200
                angle = t * 3.0
                cv2.ellipse(frame, (rx, ry), (60, int(abs(math.sin(angle)) * 30 + 8)), 0, 0, 360, (200, 210, 220), 4)
                cv2.line(frame, (rx, ry), (rx, ry + 70), (120, 130, 140), 6)

            elif "aerial_cars" in obj_type:
                # Aerial vehicles driving along road
                for ax_offset in [-120, 40, 200]:
                    ax = int(((frame_idx * 3 + ax_offset) % 640))
                    ay = int(300 - (ax / 640) * 240)
                    cv2.rectangle(frame, (ax - 12, ay - 6), (ax + 12, ay + 6), (220, 180, 90), -1)
                # Drone HUD Reticle
                cv2.circle(frame, (320, 180), 40, (0, 255, 180), 1)
                cv2.line(frame, (320, 120), (320, 240), (0, 255, 180), 1)
                cv2.line(frame, (260, 180), (380, 180), (0, 255, 180), 1)
                cv2.putText(frame, "UAV ALT: 120m  LAT: 32.228 N", (20, 340), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 255, 180), 1)

            # 3. Stamp Real CCTV Timestamp and Node HUD
            cv2.putText(frame, f"NODE: {label.split(' ')[0]} | {label.split(' ')[1]}", (12, 24), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 255, 200), 1)
            ts_str = time.strftime("%Y-%m-%d %H:%M:%S") + f".{int(t*100)%100:02d}"
            cv2.putText(frame, f"UTC {ts_str}  25.0 FPS", (12, 45), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (200, 200, 200), 1)
            cv2.circle(frame, (620, 20), 5, (0, 0, 255) if (frame_idx // 10) % 2 == 0 else (0, 180, 0), -1) # REC Blinking Dot

            out.write(frame)

        out.release()
        print(f"[{idx}/20] Created {filename} ({label})")

    print("All 20 CCTV surveillance video feeds generated successfully!")

if __name__ == "__main__":
    create_surveillance_videos("d:/TriNetra/data/videos")
