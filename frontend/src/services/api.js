import { 
  MOCK_CAMERAS, 
  MOCK_SENSORS, 
  MOCK_INCIDENTS, 
  MOCK_PERSONNEL, 
  MOCK_VEHICLES, 
  MOCK_CAPABILITIES, 
  MOCK_METRICS 
} from './mockData';

const API_BASE_URL = 'http://localhost:8000/api';

class ApiClient {
  constructor() {
    this.baseUrl = API_BASE_URL;
    this.isOffline = false;
  }

  getToken() {
    return localStorage.getItem('trinetra_token');
  }

  setToken(token) {
    localStorage.setItem('trinetra_token', token);
  }

  clearToken() {
    localStorage.removeItem('trinetra_token');
    localStorage.removeItem('trinetra_user');
  }

  async request(endpoint, options = {}, fallbackData = null) {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s timeout for swift fallback

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        if (fallbackData !== null) return fallbackData;
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Request failed with status ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      // Graceful fallback for standalone Vercel demo deployment
      if (fallbackData !== null) {
        return fallbackData;
      }
      throw err;
    }
  }

  // Auth
  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }, {
      access_token: 'demo-jwt-token-sih-2026',
      token_type: 'bearer',
      user: {
        id: 1,
        email: email || 'operator@trinetra.local',
        full_name: 'Preet Jain (Commander)',
        role: 'commander',
        department: 'Border Command Directorate'
      }
    });
  }

  getMe() {
    return this.request('/auth/me', {}, {
      id: 1,
      email: 'admin@trinetra.local',
      full_name: 'Preet Jain (Commander)',
      role: 'commander',
      department: 'Border Command Directorate'
    });
  }

  // Analytics & Summary
  getKpiSummary() {
    return this.request('/analytics/summary', {}, {
      active_incidents: 3,
      cameras_online: 20,
      total_cameras: 20,
      sensors_online: 11,
      total_sensors: 11,
      tracks_active: 4,
      avg_latency_ms: 14.2,
      deduplication_ratio: '4:1'
    });
  }

  getEventsByZone() {
    return this.request('/analytics/events-by-zone', {}, [
      { zone: 'Zone A', count: 48 },
      { zone: 'Zone B', count: 86 },
      { zone: 'Zone C', count: 32 },
      { zone: 'Zone D', count: 14 }
    ]);
  }

  getActivityTrends() {
    return this.request('/analytics/activity-trends', {}, [
      { time: '00:00', detections: 12, alerts: 1 },
      { time: '04:00', detections: 8, alerts: 2 },
      { time: '08:00', detections: 45, alerts: 0 },
      { time: '12:00', detections: 64, alerts: 1 },
      { time: '16:00', detections: 52, alerts: 0 },
      { time: '20:00', detections: 38, alerts: 3 }
    ]);
  }

  getAIFeedbackStats() {
    return this.request('/analytics/ai-feedback-stats', {}, {
      verified: 18,
      dismissed: 2,
      accuracy_rate: '90.0%'
    });
  }

  getShiftBriefing() {
    return this.request('/analytics/shift-briefing', {}, {
      shift_leader: 'Commander Preet Jain',
      active_threat_level: 'ELEVATED (Sector 4 Night Watch)',
      briefing_notes: 'Sector 4 North Perimeter under 4-sensor multi-spectral surveillance. Incident INC-2026-NIGHT-01 verified with SHA-256 integrity.'
    });
  }

  // Cameras (20-Node Fleet)
  getCameras(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/cameras${query ? `?${query}` : ''}`, {}, MOCK_CAMERAS);
  }

  toggleCameraStatus(cameraId, newStatus) {
    return this.request(`/cameras/${cameraId}/toggle-status?new_status=${newStatus}`, {
      method: 'POST',
    }, { status: 'SUCCESS', camera_id: cameraId, new_status: newStatus });
  }

  // Sensors
  getSensors(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/sensors${query ? `?${query}` : ''}`, {}, MOCK_SENSORS);
  }

  getSensorEvents(limit = 50) {
    return this.request(`/sensors/events?limit=${limit}`, {}, [
      { id: 1, source_type: 'CCTV', source_id: 'C-01', event_type: 'DETECTION', timestamp: new Date().toISOString(), confidence: 0.94 },
      { id: 2, source_type: 'THERMAL', source_id: 'T-01', event_type: 'HEAT_BLOB', timestamp: new Date().toISOString(), confidence: 0.91 },
      { id: 3, source_type: 'RADAR', source_id: 'R-01', event_type: 'MICRO_DOPPLER', timestamp: new Date().toISOString(), confidence: 0.89 },
      { id: 4, source_type: 'UGS', source_id: 'G-04', event_type: 'SEISMIC_TRIGGER', timestamp: new Date().toISOString(), confidence: 0.85 }
    ]);
  }

  injectSensorEvent(eventData) {
    return this.request('/sensors/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    }, { status: 'INGESTED', event_id: 'EVT-' + Date.now() });
  }

  // Detections & Tracks
  getDetections(limit = 50) {
    return this.request(`/detections?limit=${limit}`, {}, [
      { id: 1, camera_id: 'C-01', class_name: 'person', confidence: 0.942, bbox: [120, 80, 240, 320], tracker_id: 'TRK-P014' },
      { id: 2, camera_id: 'C-04', class_name: 'car', confidence: 0.961, bbox: [180, 140, 420, 280], tracker_id: 'TRK-V001' }
    ]);
  }

  getTracks(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/detections/tracks${query ? `?${query}` : ''}`, {}, [
      { id: 1, track_id: 'TRK-P014', object_type: 'PERSON', speed: 1.4, direction: 'SE', status: 'ACTIVE' },
      { id: 2, track_id: 'TRK-V001', object_type: 'VEHICLE', speed: 34.0, direction: 'W', status: 'ACTIVE' }
    ]);
  }

  // Incidents
  getIncidents(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/incidents${query ? `?${query}` : ''}`, {}, MOCK_INCIDENTS);
  }

  getIncident(id) {
    return this.request(`/incidents/${id}`, {}, MOCK_INCIDENTS[0]);
  }

  verifyIncident(id, reason = '', notes = '') {
    return this.request(`/incidents/${id}/verify`, {
      method: 'POST',
      body: JSON.stringify({ action: 'VERIFY', reason, notes }),
    }, { status: 'VERIFIED', incident_id: id, verified_at: new Date().toISOString() });
  }

  dismissIncident(id, reason = '', notes = '') {
    return this.request(`/incidents/${id}/dismiss`, {
      method: 'POST',
      body: JSON.stringify({ action: 'DISMISS', reason, notes }),
    }, { status: 'DISMISSED', incident_id: id });
  }

  escalateIncident(id, reason = '', notes = '') {
    return this.request(`/incidents/${id}/escalate`, {
      method: 'POST',
      body: JSON.stringify({ action: 'ESCALATE', reason, notes }),
    }, { status: 'ESCALATED', incident_id: id, qrf_status: 'DISPATCHED' });
  }

  submitFeedback(incidentId, feedbackType, comments = '') {
    return this.request(`/incidents/${incidentId}/feedback`, {
      method: 'POST',
      body: JSON.stringify({ incident_id: incidentId, feedback_type: feedbackType, comments }),
    }, { status: 'RECORDED' });
  }

  // Investigation & Search
  search(query) {
    return this.request(`/investigation/search?q=${encodeURIComponent(query)}`, {}, {
      query: query,
      interpreted_query: {
        vehicle: query.toLowerCase().includes('truck') ? 'Inspection Truck' : query.toLowerCase().includes('suv') ? 'Patrol SUV' : 'Any Target',
        location: query.toLowerCase().includes('gate') ? 'Gate Alpha / Bravo' : 'Sector 4 Perimeter',
        time_window: query.toLowerCase().includes('night') ? '22:00 - 05:00' : 'Last 24 Hours'
      },
      results_count: 2,
      incidents: MOCK_INCIDENTS,
      tracks: [
        { id: 'TRK-P014', type: 'PERSON', location: 'Post 4A North', timestamp: '22:14:03' }
      ]
    });
  }

  getIntelligenceGraph(focusId = null) {
    return this.request(`/investigation/graph${focusId ? `?focus_id=${focusId}` : ''}`, {}, {
      nodes: [
        { id: 'INC-2026-NIGHT-01', label: 'Perimeter Incursion', type: 'incident' },
        { id: 'C-01', label: 'CCTV C-01', type: 'sensor' },
        { id: 'T-01', label: 'Thermal T-01', type: 'sensor' },
        { id: 'R-01', label: 'Radar R-01', type: 'sensor' },
        { id: 'G-04', label: 'UGS G-04', type: 'sensor' },
        { id: 'TRK-P014', label: 'Track P014', type: 'track' }
      ],
      edges: [
        { source: 'C-01', target: 'INC-2026-NIGHT-01' },
        { source: 'T-01', target: 'INC-2026-NIGHT-01' },
        { source: 'R-01', target: 'INC-2026-NIGHT-01' },
        { source: 'G-04', target: 'INC-2026-NIGHT-01' },
        { source: 'INC-2026-NIGHT-01', target: 'TRK-P014' }
      ]
    });
  }

  getSimilarIncidents(incidentId) {
    return this.request(`/investigation/similar-incidents?incident_id=${incidentId}`, {}, [MOCK_INCIDENTS[1]]);
  }

  // Personnel & Vehicles
  getPersonnel() {
    return this.request('/personnel', {}, MOCK_PERSONNEL);
  }

  getPersonnelJourney(personnelId) {
    return this.request(`/personnel/${personnelId}/journey`, {}, {
      personnel_id: personnelId,
      sightings: [
        { camera: 'C-04', location: 'Gate Alpha', timestamp: '08:00' },
        { camera: 'C-08', location: 'Post Charlie 3', timestamp: '11:30' }
      ]
    });
  }

  getVehicles() {
    return this.request('/vehicles', {}, MOCK_VEHICLES);
  }

  getVehicleObservations() {
    return this.request('/vehicles/observations', {}, [
      { plate_number: 'MH01AB1234', camera_id: 'C-04', timestamp: new Date().toISOString(), status: 'APPROVED' },
      { plate_number: 'JK02AB9912', camera_id: 'C-10', timestamp: new Date().toISOString(), status: 'WATCHLIST_FLAGGED' }
    ]);
  }

  getVehicleJourney(plate) {
    return this.request(`/vehicles/${encodeURIComponent(plate)}/journey`, {}, {
      plate_number: plate,
      route: ['Gate Alpha (08:15)', 'Patrol Corridor Charlie (09:30)', 'Logistics Junction (11:00)']
    });
  }

  // Security & Audit
  getSecurityPosture() {
    return this.request('/security/posture', {}, {
      zero_trust_status: 'ENFORCED',
      jwt_rbac: 'ACTIVE',
      evidence_hashing: 'SHA-256 (Canonical Payload)',
      audit_integrity: 'HASH_CHAIN_VERIFIED'
    });
  }

  getAuditLogs(limit = 50) {
    return this.request(`/security/audit-logs?limit=${limit}`, {}, [
      { id: 1, timestamp: new Date().toISOString(), user_email: 'admin@trinetra.local', role: 'Commander', action: 'INCIDENT_VERIFIED', resource_id: 'INC-2026-NIGHT-01', status: 'SUCCESS' },
      { id: 2, timestamp: new Date(Date.now() - 3600000).toISOString(), user_email: 'operator@trinetra.local', role: 'Operator', action: 'EVIDENCE_SHA256_CHECKED', resource_id: 'EV-1042', status: 'SUCCESS' }
    ]);
  }

  verifyEvidenceIntegrity(evidenceId) {
    return this.request(`/security/evidence/${evidenceId}/verify-integrity`, {
      method: 'POST',
    }, { status: 'INTEGRITY_VERIFIED', sha256_hash: 'a4f89d38c1b97e55fa41893c0d8f6120b5439e761f05a9c38174efbc3081e9f1', match: true });
  }

  // System Truth & Real Metrics
  getSystemCapabilities() {
    return this.request('/system/capabilities', {}, MOCK_CAPABILITIES);
  }

  getSystemMetrics() {
    return this.request('/system/metrics', {}, MOCK_METRICS);
  }

  // Demo Scenarios
  triggerNightMovementScenario() {
    return this.request('/simulation/scenario/night-movement', { method: 'POST' }, {
      status: 'SUCCESS',
      scenario: 'Night-Time Perimeter Movement',
      created_incident: MOCK_INCIDENTS[0]
    });
  }

  triggerNightMovementStep(step = 1) {
    return this.request(`/simulation/scenario/night-movement/step?step=${step}`, { method: 'POST' }, {
      step: step,
      status: 'STEP_PROCESSED',
      description: `Step ${step} executed: Sensor observation correlated.`,
      incident: step === 5 ? MOCK_INCIDENTS[0] : null
    });
  }

  triggerCameraFailureScenario() {
    return this.request('/simulation/scenario/camera-failure', { method: 'POST' }, {
      status: 'SUCCESS',
      scenario: 'Camera Failure & Mesh Handover'
    });
  }

  triggerSensorContradictionScenario() {
    return this.request('/simulation/scenario/sensor-contradiction', { method: 'POST' }, {
      status: 'SUCCESS',
      scenario: 'Sensor Contradiction (Radar without Visual)'
    });
  }

  triggerRouteDeviationScenario() {
    return this.request('/simulation/scenario/route-deviation', { method: 'POST' }, {
      status: 'SUCCESS',
      scenario: 'Route Deviation & ANPR Watchlist Match'
    });
  }

  resetDemoScenarios() {
    return this.request('/simulation/reset', { method: 'POST' }, {
      status: 'RESET_COMPLETE',
      message: 'Simulation state cleanly reset to baseline.'
    });
  }
}

export const api = new ApiClient();
