from datetime import datetime, timezone, timedelta
from backend.app.core.database import SessionLocal, Base, engine
from backend.app.core.security import get_password_hash
from backend.app.models import (
    User, UserRole, Zone, Camera, Sensor, Personnel, Vehicle, VehicleObservation,
    Incident, IncidentTimeline, Evidence, Track, Detection, AuditLog
)

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Check if already seeded
    if db.query(User).first():
        print("[DB SEED] Database already seeded. Skipping initial seeding.")
        db.close()
        return

    print("[DB SEED] Seeding TRINETRA database with realistic border security infrastructure...")

    # 1. Users
    dev_pass = get_password_hash("Trinetra@2026")
    users = [
        User(
            email="operator@trinetra.local",
            full_name="Rajesh Verma",
            role=UserRole.OPERATOR.value,
            hashed_password=dev_pass,
            department="Border Control Room 1",
            badge_number="OP-8821"
        ),
        User(
            email="investigator@trinetra.local",
            full_name="Captain Ananya Sen",
            role=UserRole.INVESTIGATOR.value,
            hashed_password=dev_pass,
            department="Sector Intelligence Wing",
            badge_number="INV-4412"
        ),
        User(
            email="supervisor@trinetra.local",
            full_name="Maj. Vikram Rathore",
            role=UserRole.SUPERVISOR.value,
            hashed_password=dev_pass,
            department="Tactical Command",
            badge_number="SUP-1002"
        ),
        User(
            email="admin@trinetra.local",
            full_name="Preet Jain (Admin)",
            role=UserRole.SYSTEM_ADMIN.value,
            hashed_password=dev_pass,
            department="Directorate of Surveillance Cyber & AI",
            badge_number="ADM-0001"
        )
    ]
    db.add_all(users)
    db.commit()

    # 2. Zones
    zones = [
        Zone(
            code="Zone A",
            name="Forward Checkpoint Alpha",
            description="Border entry gate and primary inspection terminal",
            risk_level="NORMAL",
            restricted=False,
            active_hours="24x7",
            polygon_coords=[[32.215, 75.120], [32.220, 75.130], [32.210, 75.135], [32.205, 75.122]]
        ),
        Zone(
            code="Zone B",
            name="Restricted Perimeter Sector 4",
            description="High-security restricted border wire perimeter and zero-line buffer",
            risk_level="HIGH",
            restricted=True,
            active_hours="Restricted 24x7",
            polygon_coords=[[32.225, 75.132], [32.235, 75.145], [32.220, 75.155], [32.215, 75.138]]
        ),
        Zone(
            code="Zone C",
            name="Patrol Corridor Charlie",
            description="Designated all-weather tactical vehicular patrol corridor",
            risk_level="ELEVATED",
            restricted=False,
            active_hours="06:00-22:00",
            polygon_coords=[[32.205, 75.105], [32.215, 75.118], [32.200, 75.125], [32.195, 75.110]]
        ),
        Zone(
            code="Zone D",
            name="Secondary Buffer Delta",
            description="Rear observation and logistics support zone",
            risk_level="NORMAL",
            restricted=False,
            active_hours="24x7",
            polygon_coords=[[32.190, 75.095], [32.200, 75.105], [32.185, 75.115], [32.180, 75.100]]
        )
    ]
    db.add_all(zones)
    db.commit()

    # 3. Cameras (20-Node Surveillance Fleet)
    cameras = [
        Camera(camera_id="C-01", name="Perimeter North Optical 1", type="IP CCTV", location_name="Post 4A North", latitude=32.226, longitude=75.133, zone_code="Zone B", fps=25.0, status="ONLINE", active_track_count=1),
        Camera(camera_id="C-02", name="Perimeter North Optical 2", type="IP CCTV", location_name="Post 4B Central", latitude=32.228, longitude=75.137, zone_code="Zone B", fps=25.0, status="ONLINE", active_track_count=1),
        Camera(camera_id="C-03", name="Patrol Road West Cam", type="PTZ CCTV", location_name="Junction C2", latitude=32.208, longitude=75.112, zone_code="Zone C", fps=30.0, status="ONLINE", active_track_count=0),
        Camera(camera_id="C-04", name="Main Checkpoint Ingress ANPR", type="ANPR CCTV", location_name="Gate Alpha Ingress", latitude=32.216, longitude=75.122, zone_code="Zone A", fps=25.0, status="ONLINE", active_track_count=2),
        Camera(camera_id="C-05", name="Main Checkpoint Egress Optical", type="IP CCTV", location_name="Gate Alpha Egress", latitude=32.217, longitude=75.124, zone_code="Zone A", fps=25.0, status="ONLINE", active_track_count=0),
        Camera(camera_id="C-06", name="Culvert 14 Drainage Sentry", type="IP CCTV", location_name="Drainage Trench B", latitude=32.229, longitude=75.139, zone_code="Zone B", fps=25.0, status="ONLINE", active_track_count=1),
        Camera(camera_id="C-07", name="Sector 4 Observation Post", type="Thermal CCTV", location_name="Watchtower 7", latitude=32.230, longitude=75.142, zone_code="Zone B", fps=20.0, status="ONLINE", active_track_count=1),
        Camera(camera_id="C-08", name="Patrol Corridor Charlie Sentry", type="PTZ CCTV", location_name="Post Charlie 3", latitude=32.210, longitude=75.115, zone_code="Zone C", fps=30.0, status="ONLINE", active_track_count=0),
        Camera(camera_id="C-09", name="Gate Bravo North Lane 1 ANPR", type="ANPR CCTV", location_name="Gate Bravo Ingress", latitude=32.219, longitude=75.127, zone_code="Zone A", fps=25.0, status="ONLINE", active_track_count=1),
        Camera(camera_id="C-10", name="Gate Bravo North Lane 2 ANPR", type="ANPR CCTV", location_name="Gate Bravo Egress", latitude=32.220, longitude=75.129, zone_code="Zone A", fps=25.0, status="ONLINE", active_track_count=1),
        Camera(camera_id="C-11", name="Perimeter East Electric Wire 1", type="IP CCTV", location_name="Post 5A East", latitude=32.232, longitude=75.150, zone_code="Zone B", fps=25.0, status="ONLINE", active_track_count=0),
        Camera(camera_id="C-12", name="Zero-Line Buffer Post 9", type="Thermal CCTV", location_name="Watchtower 9 Zero Line", latitude=32.234, longitude=75.146, zone_code="Zone B", fps=20.0, status="ONLINE", active_track_count=1),
        Camera(camera_id="C-13", name="Tactical QRT Helipad & Depot", type="PTZ CCTV", location_name="Sector HQ Helipad", latitude=32.195, longitude=75.105, zone_code="Zone D", fps=30.0, status="ONLINE", active_track_count=0),
        Camera(camera_id="C-14", name="Ammunition & Armory Outer Ring", type="IP CCTV", location_name="Depot Perimeter", latitude=32.192, longitude=75.100, zone_code="Zone D", fps=25.0, status="ONLINE", active_track_count=0),
        Camera(camera_id="C-15", name="Riverine Crossing Sentry South", type="Thermal CCTV", location_name="River Basin Sector 2", latitude=32.200, longitude=75.092, zone_code="Zone B", fps=20.0, status="ONLINE", active_track_count=1),
        Camera(camera_id="C-16", name="Sector 4 Elevated Radar Mast Cam", type="PTZ CCTV", location_name="Hilltop Bravo Mast", latitude=32.232, longitude=75.148, zone_code="Zone B", fps=30.0, status="ONLINE", active_track_count=0),
        Camera(camera_id="C-17", name="Patrol Junction Delta 4", type="IP CCTV", location_name="Logistics Crossing Delta", latitude=32.188, longitude=75.102, zone_code="Zone D", fps=25.0, status="ONLINE", active_track_count=0),
        Camera(camera_id="C-18", name="Dense Foliage Cam Post 3", type="Thermal CCTV", location_name="Sector 4 Treeline", latitude=32.228, longitude=75.136, zone_code="Zone B", fps=20.0, status="ONLINE", active_track_count=1),
        Camera(camera_id="C-19", name="Netra-V Tethered UAV Drone Cam", type="UAV Camera", location_name="Airborne Grid Sector 4", latitude=32.228, longitude=75.140, zone_code="Zone B", fps=30.0, status="ONLINE", active_track_count=1),
        Camera(camera_id="C-20", name="Forward Sentry Bunker 1", type="IP CCTV", location_name="Bunker Zero 1", latitude=32.236, longitude=75.152, zone_code="Zone B", fps=25.0, status="ONLINE", active_track_count=1)
    ]
    db.add_all(cameras)
    db.commit()

    # 4. Sensors
    sensors = [
        Sensor(sensor_id="T-01", name="Long-Range Thermal Imager 1", sensor_type="THERMAL", location_name="Watchtower 4 North", latitude=32.227, longitude=75.135, zone_code="Zone B", range_meters=800.0, direction_facing="NE", status="ONLINE"),
        Sensor(sensor_id="T-02", name="Thermal Barrier Sensor 2", sensor_type="THERMAL", location_name="Post Charlie 3", latitude=32.210, longitude=75.115, zone_code="Zone C", range_meters=500.0, direction_facing="NW", status="ONLINE"),
        Sensor(sensor_id="A-01", name="Checkpoint ANPR Scanner 1", sensor_type="ANPR", location_name="Alpha Gate Lane 1", latitude=32.216, longitude=75.122, zone_code="Zone A", range_meters=50.0, direction_facing="N", status="ONLINE"),
        Sensor(sensor_id="A-02", name="Checkpoint ANPR Scanner 2", sensor_type="ANPR", location_name="Alpha Gate Lane 2", latitude=32.217, longitude=75.124, zone_code="Zone A", range_meters=50.0, direction_facing="S", status="ONLINE"),
        Sensor(sensor_id="R-01", name="Ground Surveillance Radar 1", sensor_type="RADAR", location_name="Hilltop Post Bravo", latitude=32.232, longitude=75.148, zone_code="Zone B", range_meters=2500.0, direction_facing="NE", status="ONLINE"),
        Sensor(sensor_id="R-02", name="Short-Range Tactical Radar 2", sensor_type="RADAR", location_name="Patrol Junction 3", latitude=32.204, longitude=75.108, zone_code="Zone C", range_meters=1200.0, direction_facing="W", status="ONLINE"),
        Sensor(sensor_id="G-01", name="Seismic Ground Sensor 1", sensor_type="UGS", location_name="Fence Segment 12", latitude=32.224, longitude=75.130, zone_code="Zone B", range_meters=35.0, status="ONLINE"),
        Sensor(sensor_id="G-02", name="Seismic Ground Sensor 2", sensor_type="UGS", location_name="Fence Segment 14", latitude=32.226, longitude=75.134, zone_code="Zone B", range_meters=35.0, status="ONLINE"),
        Sensor(sensor_id="G-03", name="Seismic Ground Sensor 3", sensor_type="UGS", location_name="Culvert Alpha", latitude=32.229, longitude=75.139, zone_code="Zone B", range_meters=35.0, status="ONLINE"),
        Sensor(sensor_id="G-04", name="Acoustic-Seismic UGS 4", sensor_type="UGS", location_name="Sector 4 Treeline", latitude=32.228, longitude=75.136, zone_code="Zone B", range_meters=45.0, status="ONLINE"),
        Sensor(sensor_id="U-01", name="Netra-V Tactical UAV Feed", sensor_type="UAV", location_name="Airborne Grid Sector 4", latitude=32.228, longitude=75.140, zone_code="Zone B", range_meters=3000.0, status="ONLINE")
    ]
    db.add_all(sensors)
    db.commit()

    # 5. Personnel Registry
    personnel = [
        Personnel(personnel_id="P-001", name="Havildar Ramesh Singh", role="Patrol Lead", unit="BSF 48 Bn Alpha Coy", authorized_zones=["Zone A", "Zone C"], duty_schedule="06:00 - 18:00", assigned_vehicle="V-001", verification_status="VERIFIED"),
        Personnel(personnel_id="P-002", name="Naik Sunil Kumar", role="Sentry Guard", unit="BSF 48 Bn Alpha Coy", authorized_zones=["Zone A"], duty_schedule="00:00 - 08:00", assigned_vehicle=None, verification_status="VERIFIED"),
        Personnel(personnel_id="P-003", name="Sub-Inspector Deepa Rawat", role="Inspection Officer", unit="Customs & Border Intelligence", authorized_zones=["Zone A", "Zone C", "Zone D"], duty_schedule="08:00 - 20:00", assigned_vehicle="V-002", verification_status="VERIFIED"),
        Personnel(personnel_id="P-004", name="Constable Amit Sharma", role="QRT Specialist", unit="Quick Reaction Team 2", authorized_zones=["Zone A", "Zone B", "Zone C", "Zone D"], duty_schedule="24x7 On-Call", assigned_vehicle="V-003", verification_status="VERIFIED"),
        Personnel(personnel_id="P-005", name="Mohd Tariq (Contractor)", role="Civil Maintenance", unit="Border Fencing Works", authorized_zones=["Zone D"], duty_schedule="09:00 - 17:00", assigned_vehicle=None, verification_status="VERIFIED")
    ]
    db.add_all(personnel)
    db.commit()

    # 6. Vehicles Registry
    vehicles = [
        Vehicle(vehicle_id="V-001", plate_number="MH01AB1234", vehicle_type="Patrol SUV", make_model="Tata Safari Storme GS800", registered_owner="BSF Sector 4 Logistics", authorized_zones=["Zone A", "Zone C"], is_flagged=False),
        Vehicle(vehicle_id="V-002", plate_number="DL04C9921", vehicle_type="Inspection Truck", make_model="Ashok Leyland Stallion", registered_owner="Border Technical Corps", authorized_zones=["Zone A", "Zone C", "Zone D"], is_flagged=False),
        Vehicle(vehicle_id="V-003", plate_number="PB02X5540", vehicle_type="Tactical QRT Vehicle", make_model="Mahindra Marksman Light Armoured", registered_owner="Quick Reaction Unit", authorized_zones=["Zone A", "Zone B", "Zone C"], is_flagged=False)
    ]
    db.add_all(vehicles)
    db.commit()

    # 7. Historical Incidents & Timelines
    now = datetime.now(timezone.utc)
    
    # Historical Incident 1040
    inc_1040 = Incident(
        incident_code="INC-1040",
        title="Surveillance Continuity: Optical Stream Degradation in Zone A",
        timestamp=now - timedelta(hours=4),
        zone_code="Zone A",
        location_name="Gate Alpha Ingress",
        incident_type="Camera Degradation",
        priority="MEDIUM",
        status="RESOLVED",
        correlation_score=0.82,
        description="Camera C-04 experienced temporary frame drops. Alternative ANPR sensor A-01 verified continuity.",
        contributing_sources=[{"type": "CCTV", "id": "C-04"}, {"type": "ANPR", "id": "A-01"}],
        sensor_consistency_status="CONSISTENT",
        verified_by="operator@trinetra.local",
        verified_at=now - timedelta(hours=3, minutes=45),
        ai_summary="Sensor continuity verified. Ingress stream stabilized after diagnostic reset."
    )
    db.add(inc_1040)

    # Historical Incident 1041
    inc_1041 = Incident(
        incident_code="INC-1041",
        title="Route Deviation / Patrol Vehicle Ingress in Zone C",
        timestamp=now - timedelta(hours=2),
        zone_code="Zone C",
        location_name="Patrol Junction 3",
        incident_type="Route Deviation",
        priority="HIGH",
        status="VERIFIED",
        correlation_score=0.91,
        description="Patrol vehicle V-001 observed taking secondary unpaved route near sector boundary.",
        contributing_sources=[{"type": "ANPR", "id": "A-02"}, {"type": "RADAR", "id": "R-02"}],
        sensor_consistency_status="CONSISTENT",
        verified_by="supervisor@trinetra.local",
        verified_at=now - timedelta(hours=1, minutes=50),
        ai_summary="Vehicle V-001 departed authorized corridor. Supervisor verified authorized weather detour."
    )
    db.add(inc_1041)
    db.commit()

    # Add initial audit log
    log = AuditLog(
        timestamp=now,
        user_email="system@trinetra.local",
        role="System Admin",
        action="DATABASE_SEEDED",
        resource="Database",
        status="SUCCESS",
        details={"message": "System baseline operational data loaded successfully"}
    )
    db.add(log)
    db.commit()
    db.close()
    print("[DB SEED] Database seeding completed successfully.")

if __name__ == "__main__":
    seed_database()
