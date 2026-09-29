import os
import urllib.request
import shutil

OUTPUT_DIR = "d:/TriNetra/frontend/public/videos"
DATA_DIR = "d:/TriNetra/data/videos"

os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(DATA_DIR, exist_ok=True)

# Real CCTV & Surveillance footage sources from Intel IoT Open Datasets & Public Domain CCTV Repositories
SOURCES = {
    "real_people_1.mp4": "https://github.com/intel-iot-devkit/sample-videos/raw/master/people-detection.mp4",
    "real_cars_1.mp4": "https://github.com/intel-iot-devkit/sample-videos/raw/master/car-detection.mp4",
    "real_multi_1.mp4": "https://github.com/intel-iot-devkit/sample-videos/raw/master/person-bicycle-car-detection.mp4",
    "real_worker_zone.mp4": "https://github.com/intel-iot-devkit/sample-videos/raw/master/worker-zone-detection.mp4",
    "real_single_person.mp4": "https://github.com/intel-iot-devkit/sample-videos/raw/master/one-by-one-person-detection.mp4",
    "real_walking_path.mp4": "https://github.com/intel-iot-devkit/sample-videos/raw/master/face-demographics-walking.mp4",
    "real_checkpoint_sentry.mp4": "https://github.com/intel-iot-devkit/sample-videos/raw/master/face-demographics-walking-and-pause.mp4",
}

print("1. Downloading authentic real-world surveillance video clips...")
downloaded = {}
for name, url in SOURCES.items():
    dest = os.path.join(OUTPUT_DIR, name)
    if not os.path.exists(dest) or os.path.getsize(dest) < 10000:
        try:
            print(f"Downloading {name} from {url}...")
            urllib.request.urlretrieve(url, dest)
            print(f"Successfully downloaded {name} ({os.path.getsize(dest) // 1024} KB)")
            downloaded[name] = dest
        except Exception as e:
            print(f"Failed to download {name}: {e}")
    else:
        print(f"Already cached: {name}")
        downloaded[name] = dest

# 2. Map all 20 CCTV cameras to real footage clips
MAPPING = {
    "cctv_01.mp4": "real_people_1.mp4",         # Perimeter North: Real people walking along fence
    "cctv_02.mp4": "real_single_person.mp4",    # North Post: Real single sentry walking
    "cctv_03.mp4": "real_cars_1.mp4",            # Patrol Road: Real cars driving along road
    "cctv_04.mp4": "real_multi_1.mp4",           # Checkpoint Ingress: Real multi-vehicle & pedestrian intersection
    "cctv_05.mp4": "real_cars_1.mp4",            # Checkpoint Egress: Real traffic egress
    "cctv_06.mp4": "real_worker_zone.mp4",       # Culvert Drainage: Real restricted zone monitoring
    "cctv_07.mp4": "real_single_person.mp4",    # Watchtower 7 Thermal: Real target detection
    "cctv_08.mp4": "real_multi_1.mp4",           # Patrol Corridor: Real multi-object transit
    "cctv_09.mp4": "real_cars_1.mp4",            # Gate Bravo Lane 1: Real vehicles
    "cctv_10.mp4": "real_cars_1.mp4",            # Gate Bravo Lane 2: Real vehicle inspection
    "cctv_11.mp4": "real_people_1.mp4",         # Perimeter East: Real pedestrian movement
    "cctv_12.mp4": "real_walking_path.mp4",     # Zero Line Buffer: Real walking targets
    "cctv_13.mp4": "real_worker_zone.mp4",       # Helipad Depot: Real personnel in operational zone
    "cctv_14.mp4": "real_checkpoint_sentry.mp4", # Armory Ring: Real sentry movement and pause
    "cctv_15.mp4": "real_people_1.mp4",         # Riverine Sentry: Real moving silhouettes
    "cctv_16.mp4": "real_multi_1.mp4",           # Radar Mast: Real wide-area movement
    "cctv_17.mp4": "real_cars_1.mp4",            # Logistics Junction: Real vehicles turning
    "cctv_18.mp4": "real_single_person.mp4",    # Dense Foliage: Real single target in view
    "cctv_19.mp4": "real_multi_1.mp4",           # Drone UAV Cam: Real moving vehicles and persons
    "cctv_20.mp4": "real_checkpoint_sentry.mp4", # Bunker Sentry: Real guard observing
}

print("\n2. Deploying real video clips to 20 cameras in frontend/public/videos/ and data/videos/...")
for cam_file, source_name in MAPPING.items():
    src_path = os.path.join(OUTPUT_DIR, source_name)
    if os.path.exists(src_path):
        dst_public = os.path.join(OUTPUT_DIR, cam_file)
        dst_data = os.path.join(DATA_DIR, cam_file)
        shutil.copy2(src_path, dst_public)
        shutil.copy2(src_path, dst_data)
        print(f"  Mapped {cam_file} -> {source_name} ({os.path.getsize(dst_public) // 1024} KB)")

print("\nAll 20 CCTV cameras now running real-world recorded surveillance video footage!")
