// TRINETRA Standalone Vercel Demo & Proxy Intelligence Layer

export const MOCK_CAMERAS = [
  { id: 1, camera_id: "C-01", code: "C-01", name: "Sector 4 North Perimeter Optical 1", type: "IP CCTV", location_name: "Post 4A North", latitude: 32.226, longitude: 75.133, zone_code: "Zone B", fps: 25.0, status: "ONLINE", active_track_count: 1, source_type: "LOCAL_VIDEO" },
  { id: 2, camera_id: "C-02", code: "C-02", name: "Sector 4 North Perimeter Optical 2", type: "IP CCTV", location_name: "Post 4B Central", latitude: 32.228, longitude: 75.137, zone_code: "Zone B", fps: 25.0, status: "ONLINE", active_track_count: 1, source_type: "LOCAL_VIDEO" },
  { id: 3, camera_id: "C-03", code: "C-03", name: "Patrol Road West Cam", type: "PTZ CCTV", location_name: "Junction C2", latitude: 32.208, longitude: 75.112, zone_code: "Zone C", fps: 30.0, status: "ONLINE", active_track_count: 0, source_type: "LOCAL_VIDEO" },
  { id: 4, camera_id: "C-04", code: "C-04", name: "Main Checkpoint Ingress ANPR", type: "ANPR CCTV", location_name: "Gate Alpha Ingress", latitude: 32.216, longitude: 75.122, zone_code: "Zone A", fps: 25.0, status: "ONLINE", active_track_count: 2, source_type: "LOCAL_VIDEO" },
  { id: 5, camera_id: "C-05", code: "C-05", name: "Main Checkpoint Egress Optical", type: "IP CCTV", location_name: "Gate Alpha Egress", latitude: 32.217, longitude: 75.124, zone_code: "Zone A", fps: 25.0, status: "ONLINE", active_track_count: 0, source_type: "LOCAL_VIDEO" },
  { id: 6, camera_id: "C-06", code: "C-06", name: "Culvert 14 Drainage Sentry", type: "IP CCTV", location_name: "Drainage Trench B", latitude: 32.229, longitude: 75.139, zone_code: "Zone B", fps: 25.0, status: "ONLINE", active_track_count: 1, source_type: "LOCAL_VIDEO" },
  { id: 7, camera_id: "C-07", code: "C-07", name: "Sector 4 Observation Post", type: "Thermal CCTV", location_name: "Watchtower 7", latitude: 32.230, longitude: 75.142, zone_code: "Zone B", fps: 20.0, status: "ONLINE", active_track_count: 1, source_type: "LOCAL_VIDEO" },
  { id: 8, camera_id: "C-08", code: "C-08", name: "Patrol Corridor Charlie Sentry", type: "PTZ CCTV", location_name: "Post Charlie 3", latitude: 32.210, longitude: 75.115, zone_code: "Zone C", fps: 30.0, status: "ONLINE", active_track_count: 0, source_type: "LOCAL_VIDEO" },
  { id: 9, camera_id: "C-09", code: "C-09", name: "Gate Bravo North Lane 1 ANPR", type: "ANPR CCTV", location_name: "Gate Bravo Ingress", latitude: 32.219, longitude: 75.127, zone_code: "Zone A", fps: 25.0, status: "ONLINE", active_track_count: 1, source_type: "LOCAL_VIDEO" },
  { id: 10, camera_id: "C-10", code: "C-10", name: "Gate Bravo North Lane 2 ANPR", type: "ANPR CCTV", location_name: "Gate Bravo Egress", latitude: 32.220, longitude: 75.129, zone_code: "Zone A", fps: 25.0, status: "ONLINE", active_track_count: 1, source_type: "LOCAL_VIDEO" },
  { id: 11, camera_id: "C-11", code: "C-11", name: "Perimeter East Electric Wire 1", type: "IP CCTV", location_name: "Post 5A East", latitude: 32.232, longitude: 75.150, zone_code: "Zone B", fps: 25.0, status: "ONLINE", active_track_count: 0, source_type: "LOCAL_VIDEO" },
  { id: 12, camera_id: "C-12", code: "C-12", name: "Zero-Line Buffer Post 9", type: "Thermal CCTV", location_name: "Watchtower 9 Zero Line", latitude: 32.234, longitude: 75.146, zone_code: "Zone B", fps: 20.0, status: "ONLINE", active_track_count: 1, source_type: "LOCAL_VIDEO" },
  { id: 13, camera_id: "C-13", code: "C-13", name: "Tactical QRT Helipad & Depot", type: "PTZ CCTV", location_name: "Sector HQ Helipad", latitude: 32.195, longitude: 75.105, zone_code: "Zone D", fps: 30.0, status: "ONLINE", active_track_count: 0, source_type: "LOCAL_VIDEO" },
  { id: 14, camera_id: "C-14", code: "C-14", name: "Ammunition & Armory Outer Ring", type: "IP CCTV", location_name: "Depot Perimeter", latitude: 32.192, longitude: 75.100, zone_code: "Zone D", fps: 25.0, status: "ONLINE", active_track_count: 0, source_type: "LOCAL_VIDEO" },
  { id: 15, camera_id: "C-15", code: "C-15", name: "Riverine Crossing Sentry South", type: "Thermal CCTV", location_name: "River Basin Sector 2", latitude: 32.200, longitude: 75.092, zone_code: "Zone B", fps: 20.0, status: "ONLINE", active_track_count: 1, source_type: "LOCAL_VIDEO" },
  { id: 16, camera_id: "C-16", code: "C-16", name: "Sector 4 Elevated Radar Mast Cam", type: "PTZ CCTV", location_name: "Hilltop Bravo Mast", latitude: 32.232, longitude: 75.148, zone_code: "Zone B", fps: 30.0, status: "ONLINE", active_track_count: 0, source_type: "LOCAL_VIDEO" },
  { id: 17, camera_id: "C-17", code: "C-17", name: "Patrol Junction Delta 4", type: "IP CCTV", location_name: "Logistics Crossing Delta", latitude: 32.188, longitude: 75.102, zone_code: "Zone D", fps: 25.0, status: "ONLINE", active_track_count: 0, source_type: "LOCAL_VIDEO" },
  { id: 18, camera_id: "C-18", code: "C-18", name: "Dense Foliage Cam Post 3", type: "Thermal CCTV", location_name: "Sector 4 Treeline", latitude: 32.228, longitude: 75.136, zone_code: "Zone B", fps: 20.0, status: "ONLINE", active_track_count: 1, source_type: "LOCAL_VIDEO" },
  { id: 19, camera_id: "C-19", code: "C-19", name: "Netra-V Tethered UAV Drone Cam", type: "UAV Camera", location_name: "Airborne Grid Sector 4", latitude: 32.228, longitude: 75.140, zone_code: "Zone B", fps: 30.0, status: "ONLINE", active_track_count: 1, source_type: "LOCAL_VIDEO" },
  { id: 20, camera_id: "C-20", code: "C-20", name: "Forward Sentry Bunker 1", type: "IP CCTV", location_name: "Bunker Zero 1", latitude: 32.236, longitude: 75.152, zone_code: "Zone B", fps: 25.0, status: "ONLINE", active_track_count: 1, source_type: "LOCAL_VIDEO" }
];

export const MOCK_SENSORS = [
  { id: 1, sensor_id: "T-01", name: "Long-Range Thermal Imager 1", sensor_type: "THERMAL", location_name: "Watchtower 4 North", latitude: 32.227, longitude: 75.135, zone_code: "Zone B", range_meters: 800.0, status: "ONLINE" },
  { id: 2, sensor_id: "T-02", name: "Thermal Barrier Sensor 2", sensor_type: "THERMAL", location_name: "Post Charlie 3", latitude: 32.210, longitude: 75.115, zone_code: "Zone C", range_meters: 500.0, status: "ONLINE" },
  { id: 3, sensor_id: "A-01", name: "Checkpoint ANPR Scanner 1", sensor_type: "ANPR", location_name: "Alpha Gate Lane 1", latitude: 32.216, longitude: 75.122, zone_code: "Zone A", range_meters: 50.0, status: "ONLINE" },
  { id: 4, sensor_id: "A-02", name: "Checkpoint ANPR Scanner 2", sensor_type: "ANPR", location_name: "Alpha Gate Lane 2", latitude: 32.217, longitude: 75.124, zone_code: "Zone A", range_meters: 50.0, status: "ONLINE" },
  { id: 5, sensor_id: "R-01", name: "Ground Surveillance Radar 1", sensor_type: "RADAR", location_name: "Hilltop Post Bravo", latitude: 32.232, longitude: 75.148, zone_code: "Zone B", range_meters: 2500.0, status: "ONLINE" },
  { id: 6, sensor_id: "R-02", name: "Short-Range Tactical Radar 2", sensor_type: "RADAR", location_name: "Patrol Junction 3", latitude: 32.204, longitude: 75.108, zone_code: "Zone C", range_meters: 1200.0, status: "ONLINE" },
  { id: 7, sensor_id: "G-01", name: "Seismic Ground Sensor 1", sensor_type: "UGS", location_name: "Fence Segment 12", latitude: 32.224, longitude: 75.130, zone_code: "Zone B", range_meters: 35.0, status: "ONLINE" },
  { id: 8, sensor_id: "G-02", name: "Seismic Ground Sensor 2", sensor_type: "UGS", location_name: "Fence Segment 14", latitude: 32.226, longitude: 75.134, zone_code: "Zone B", range_meters: 35.0, status: "ONLINE" },
  { id: 9, sensor_id: "G-03", name: "Seismic Ground Sensor 3", sensor_type: "UGS", location_name: "Culvert Alpha", latitude: 32.229, longitude: 75.139, zone_code: "Zone B", range_meters: 35.0, status: "ONLINE" },
  { id: 10, sensor_id: "G-04", name: "Acoustic-Seismic UGS 4", sensor_type: "UGS", location_name: "Sector 4 Treeline", latitude: 32.228, longitude: 75.136, zone_code: "Zone B", range_meters: 45.0, status: "ONLINE" },
  { id: 11, sensor_id: "U-01", name: "Netra-V Tactical UAV Feed", sensor_type: "UAV", location_name: "Airborne Grid Sector 4", latitude: 32.228, longitude: 75.140, zone_code: "Zone B", range_meters: 3000.0, status: "ONLINE" }
];

export const MOCK_INCIDENTS = [
  {
    id: 1042,
    incident_code: "INC-2026-NIGHT-01",
    title: "Correlated Perimeter Incursion: Sector 4 North Fence",
    timestamp: new Date().toISOString(),
    zone_code: "Zone B",
    location_name: "Post 4A North Perimeter",
    incident_type: "Perimeter Incursion",
    priority: "HIGH",
    status: "REQUIRES_VERIFICATION",
    attention_level: "HIGH",
    correlation_score: 0.94,
    description: "Multiple independent sensor observations (CCTV, Thermal, Radar, UGS) detected spatio-temporally correlated target.",
    contributing_sources: [
      { type: "CCTV", id: "C-01", confidence: 0.94 },
      { type: "THERMAL", id: "T-01", confidence: 0.91 },
      { type: "RADAR", id: "R-01", confidence: 0.89 },
      { type: "UGS", id: "G-04", confidence: 0.85 }
    ],
    sensor_consistency_status: "CONSISTENT",
    ai_summary: "High attention incident synthesized. 4 corroborating sensors observed human-range signature moving at 1.4 m/s in restricted night perimeter.",
    why_flagged: [
      "Restricted Zone B (Perimeter Wire Zero-Line)",
      "Night-time movement (22:00 - 05:00 restriction)",
      "4 corroborating independent sensors (CCTV, Thermal, Radar, UGS)",
      "Unverified identity profile"
    ],
    uncertainties: [
      "Target identity unconfirmed (face obscured)",
      "Positional difference between Radar R-01 and CCTV C-01: 8m"
    ],
    sha256_hash: "a4f89d38c1b97e55fa41893c0d8f6120b5439e761f05a9c38174efbc3081e9f1",
    integrity_status: "INTEGRITY_VERIFIED"
  },
  {
    id: 1041,
    incident_code: "INC-1041",
    title: "Route Deviation: Tactical Vehicle V-001 in Zone C",
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    zone_code: "Zone C",
    location_name: "Patrol Junction 3",
    incident_type: "Route Deviation",
    priority: "MEDIUM",
    status: "VERIFIED",
    attention_level: "MEDIUM",
    correlation_score: 0.91,
    description: "Patrol vehicle V-001 observed taking secondary unpaved route near sector boundary.",
    contributing_sources: [{ type: "ANPR", id: "A-02" }, { type: "RADAR", id: "R-02" }],
    sensor_consistency_status: "CONSISTENT",
    ai_summary: "Detour confirmed due to seasonal road repair.",
    sha256_hash: "3b7c91a0f8921e44dc8190fa763c2201e9d08431cb5602e334a17ef09281a4b8",
    integrity_status: "INTEGRITY_VERIFIED"
  },
  {
    id: 1040,
    incident_code: "INC-1040",
    title: "Optical Stream Degradation in Zone A",
    timestamp: new Date(Date.now() - 14400000).toISOString(),
    zone_code: "Zone A",
    location_name: "Gate Alpha Ingress",
    incident_type: "Camera Degradation",
    priority: "LOW",
    status: "RESOLVED",
    attention_level: "LOW",
    correlation_score: 0.82,
    description: "Camera C-04 experienced temporary frame drops. Alternative ANPR sensor A-01 verified continuity.",
    contributing_sources: [{ type: "CCTV", id: "C-04" }, { type: "ANPR", id: "A-01" }],
    sensor_consistency_status: "CONSISTENT",
    ai_summary: "Continuity maintained. Stream stabilized.",
    sha256_hash: "7f12e89a44c01d93b8214ef560129a834c90e712ba335602e9a8f4c10281b901",
    integrity_status: "INTEGRITY_VERIFIED"
  }
];

export const MOCK_PERSONNEL = [
  { id: 1, personnel_id: "P-001", name: "Havildar Ramesh Singh", role: "Patrol Lead", unit: "BSF 48 Bn Alpha Coy", authorized_zones: ["Zone A", "Zone C"], duty_schedule: "06:00 - 18:00", assigned_vehicle: "V-001", verification_status: "VERIFIED" },
  { id: 2, personnel_id: "P-002", name: "Naik Sunil Kumar", role: "Sentry Guard", unit: "BSF 48 Bn Alpha Coy", authorized_zones: ["Zone A"], duty_schedule: "00:00 - 08:00", assigned_vehicle: null, verification_status: "VERIFIED" },
  { id: 3, personnel_id: "P-003", name: "Sub-Inspector Deepa Rawat", role: "Inspection Officer", unit: "Customs & Border Intelligence", authorized_zones: ["Zone A", "Zone C", "Zone D"], duty_schedule: "08:00 - 20:00", assigned_vehicle: "V-002", verification_status: "VERIFIED" },
  { id: 4, personnel_id: "P-004", name: "Constable Amit Sharma", role: "QRT Specialist", unit: "Quick Reaction Team 2", authorized_zones: ["Zone A", "Zone B", "Zone C", "Zone D"], duty_schedule: "24x7 On-Call", assigned_vehicle: "V-003", verification_status: "VERIFIED" },
  { id: 5, personnel_id: "P-005", name: "Mohd Tariq (Contractor)", role: "Civil Maintenance", unit: "Border Fencing Works", authorized_zones: ["Zone D"], duty_schedule: "09:00 - 17:00", assigned_vehicle: null, verification_status: "VERIFIED" }
];

export const MOCK_VEHICLES = [
  { id: 1, vehicle_id: "V-001", plate_number: "MH01AB1234", vehicle_type: "Patrol SUV", make_model: "Tata Safari Storme GS800", registered_owner: "BSF Sector 4 Logistics", authorized_zones: ["Zone A", "Zone C"], is_flagged: false },
  { id: 2, vehicle_id: "V-002", plate_number: "DL04C9921", vehicle_type: "Inspection Truck", make_model: "Ashok Leyland Stallion", registered_owner: "Border Technical Corps", authorized_zones: ["Zone A", "Zone C", "Zone D"], is_flagged: false },
  { id: 3, vehicle_id: "V-003", plate_number: "PB02X5540", vehicle_type: "Tactical QRT Vehicle", make_model: "Mahindra Marksman Light Armoured", registered_owner: "Quick Reaction Unit", authorized_zones: ["Zone A", "Zone B", "Zone C"], is_flagged: false },
  { id: 4, vehicle_id: "V-004", plate_number: "JK02AB9912", vehicle_type: "Civilian SUV", make_model: "Toyota Fortuner", registered_owner: "Civilian Watchlist Record", authorized_zones: [], is_flagged: true }
];

export const MOCK_CAPABILITIES = {
  cctv_detection: "functional",
  person_tracking: "functional",
  thermal_feed: "simulated",
  radar_feed: "simulated",
  ugs_feed: "simulated",
  uav_feed: "integration-ready",
  anpr: "functional",
  face_recognition: "optional",
  blockchain: "not_implemented",
  sha256_integrity: "functional",
  spatio_temporal_fusion: "functional",
  alert_deduplication: "functional",
  sensor_contradiction: "functional",
  jwt_rbac_security: "functional",
  audit_trail: "functional",
  digital_border_twin: "functional",
  offline_sync_queue: "functional"
};

export const MOCK_METRICS = {
  inference_latency_ms: 14.2,
  inference_fps: 70.4,
  sensor_correlation_latency_ms: 4.8,
  alert_deduplication_ratio: "4:1",
  active_incidents_count: 3,
  events_processed_last_hour: 142,
  false_positive_rate_percent: 4.2,
  evidence_sha256_verification_latency_ms: 1.2
};
