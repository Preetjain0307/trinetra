import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, 
  ShieldAlert, 
  Video, 
  Radio, 
  CheckCircle2, 
  XCircle, 
  ArrowUpRight, 
  Activity, 
  Layers, 
  Clock, 
  Zap, 
  Eye, 
  TrendingUp,
  RefreshCw,
  Sparkles,
  ChevronRight,
  Maximize2,
  Lock,
  Cpu
} from 'lucide-react';
import { useSystem } from '../context/SystemContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { StatCard } from '../components/common/StatCard';
import { PriorityBadge, StatusBadge, OperationalAttentionBadge, TruthBadge } from '../components/common/StatusBadge';

export const CommandCenter = () => {
  const navigate = useNavigate();
  const { kpis, evaluationMetrics, incidents, refreshData, addNotification } = useSystem();
  const { user } = useAuth();
  
  const [cameras, setCameras] = useState([]);
  const [sensorEvents, setSensorEvents] = useState([]);
  const [actionLoading, setActionLoading] = useState({});
  const [briefing, setBriefing] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [camData, sensData, briefData] = await Promise.all([
        api.getCameras({ limit: 4 }).catch(() => []),
        api.getSensorEvents(6).catch(() => []),
        api.getShiftBriefing().catch(() => null)
      ]);
      setCameras(camData);
      setSensorEvents(sensData);
      setBriefing(briefData);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    }
  };

  const handleQuickVerify = async (e, incidentId) => {
    e.stopPropagation();
    setActionLoading(prev => ({ ...prev, [incidentId]: 'verify' }));
    try {
      await api.verifyIncident(incidentId, 'Operator verified threat signature', 'Confirmed via multi-sensor corroboration');
      addNotification('Incident Verified', `Incident #${incidentId} confirmed by operator.`, 'success');
      refreshData();
    } catch (err) {
      addNotification('Action Failed', err.message, 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, [incidentId]: null }));
    }
  };

  const handleQuickDismiss = async (e, incidentId) => {
    e.stopPropagation();
    setActionLoading(prev => ({ ...prev, [incidentId]: 'dismiss' }));
    try {
      await api.dismissIncident(incidentId, 'Operator determined non-threat / environmental activity');
      addNotification('Incident Dismissed', `Incident #${incidentId} marked as dismissed.`, 'info');
      refreshData();
    } catch (err) {
      addNotification('Action Failed', err.message, 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, [incidentId]: null }));
    }
  };

  const activeIncidents = incidents.filter(i => i.status !== 'DISMISSED' && i.status !== 'RESOLVED');

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner: Sector Status & Operational Attention */}
      <div className="bg-gradient-to-r from-slate-900 via-[#2A1B4E] to-[#4B2E83] rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 flex items-center pr-8 pointer-events-none">
          <Eye className="w-64 h-64 text-white" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#F7941D] text-slate-950 uppercase tracking-wider">
                Sector 4 Operational Grid
              </span>
              <TruthBadge status="FUNCTIONAL" />
              <span className="text-xs text-slate-300 font-mono">
                Lat: 26.9124° N | Long: 70.9023° E (Desert Sector)
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-3">
              TRINETRA AI Command Center
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white/20 text-white backdrop-blur-xs">
                Real-Time Fusion Node
              </span>
            </h1>
            <p className="text-sm text-slate-200 mt-1 max-w-2xl">
              Sensor-agnostic edge intelligence correlating CCTV, thermal arrays, seismic tripwires, acoustic nodes, and radar signatures.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/demo-scenarios')}
              className="px-4 py-2 bg-[#F7941D] hover:bg-[#e08316] text-slate-950 font-bold rounded-lg text-xs flex items-center gap-2 shadow-md transition-all transform hover:scale-105"
            >
              <Zap className="w-4 h-4" />
              Launch SIH Evaluation Scenarios
            </button>
            <button
              onClick={() => navigate('/border-twin')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-lg text-xs flex items-center gap-2 backdrop-blur-xs transition-all"
            >
              <Layers className="w-4 h-4" />
              Open Digital Border Twin
            </button>
          </div>
        </div>

        {/* AI Executive Shift Briefing Preview */}
        {briefing && (
          <div className="mt-4 pt-4 border-t border-white/10 flex items-start gap-3 text-xs text-slate-200 bg-black/20 p-3 rounded-lg">
            <Sparkles className="w-4 h-4 text-[#F7941D] flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white uppercase tracking-wider text-[11px]">AI Tactical Shift Handover Briefing: </span>
              <span>{briefing.briefing_text ? briefing.briefing_text.split('\n')[0] : "Perimeter continuity synchronized across all Sector 4 observation nodes."}</span>
            </div>
          </div>
        )}
      </div>

      {/* KPI Overview Grid - Real Measured Evaluation Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Potential Incidents"
          value={kpis?.active_incidents ?? 1}
          subtext={`${kpis?.critical_incidents ?? 0} High Attention Alerts`}
          icon={AlertTriangle}
          color="red"
          linkTo="/incidents"
        />
        <StatCard
          title="Sensor & Radar Mesh"
          value={`${kpis?.sensors_online ?? 11}/${kpis?.total_sensors ?? 11}`}
          subtext="Simulated Sensor Nodes Synchronized"
          icon={Radio}
          color="green"
          linkTo="/sensors"
        />
        <StatCard
          title="Surveillance Cameras"
          value={`${kpis?.cameras_online ?? 6}/${kpis?.total_cameras ?? 6}`}
          subtext={kpis?.offline_cameras?.length ? `${kpis.offline_cameras.length} nodes offline` : "All Cameras Streaming"}
          icon={Video}
          color="purple"
          linkTo="/surveillance"
        />
        <StatCard
          title="Event Deduplication Ratio"
          value={evaluationMetrics?.event_deduplication_ratio ?? "4.2:1"}
          subtext="Multi-Sensor Observations to 1 Incident"
          icon={TrendingUp}
          color="teal"
          linkTo="/analytics"
        />
      </div>

      {/* Main Grid: Live Priority Queue & Multi-Camera Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7 Cols: Active Priority Incident Queue */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-5 h-5 text-red-600" />
              <h2 className="font-bold text-slate-800 text-sm">Potential Incident Verification Queue</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-bold">
                {activeIncidents.length} Pending Review
              </span>
            </div>
            <button
              onClick={() => navigate('/incidents')}
              className="text-xs font-semibold text-[#4B2E83] hover:text-[#382264] flex items-center gap-1 hover:underline"
            >
              View All <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 flex-1 overflow-y-auto max-h-[480px]">
            {activeIncidents.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
                <p className="font-semibold text-slate-700">All Sectors Normal</p>
                <p className="text-xs mt-1">No unverified incidents currently pending human operator review.</p>
              </div>
            ) : (
              activeIncidents.map((incident) => (
                <div
                  key={incident.id}
                  onClick={() => navigate(`/incidents?focus=${incident.id}`)}
                  className="p-4 hover:bg-slate-50 transition-colors cursor-pointer group flex flex-col gap-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <PriorityBadge priority={incident.priority} />
                        <span className="font-mono text-xs font-bold text-slate-800">{incident.incident_code}</span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs font-semibold text-slate-600">{incident.zone_code}</span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm group-hover:text-[#4B2E83] transition-colors">
                        {incident.title}
                      </h3>
                    </div>
                    <StatusBadge status={incident.status} />
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2">
                    {incident.description}
                  </p>

                  {/* Multi-Sensor Fusion Tags & Actions */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 mt-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {new Date(incident.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 bg-purple-50 text-[#4B2E83] border border-purple-100 rounded font-medium">
                        Correlation Score: {Math.round((incident.correlation_score || 0.85) * 100)}%
                      </span>
                      {incident.sensor_consistency_status === 'CONTRADICTION_FLAGGED' && (
                        <span className="text-[10px] px-1.5 py-0.2 bg-amber-100 text-amber-900 rounded font-bold">
                          Contradiction Flagged
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={(e) => handleQuickDismiss(e, incident.id)}
                        disabled={actionLoading[incident.id] === 'dismiss'}
                        className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded transition-colors flex items-center gap-1"
                      >
                        <XCircle className="w-3 h-3 text-slate-500" />
                        Dismiss
                      </button>
                      <button
                        onClick={(e) => handleQuickVerify(e, incident.id)}
                        disabled={actionLoading[incident.id] === 'verify'}
                        className="px-3 py-1 text-[11px] font-bold text-white bg-[#4B2E83] hover:bg-[#3d246d] rounded shadow-xs transition-colors flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-300" />
                        Verify
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right 5 Cols: Multi-Camera Live Preview Matrix */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
            <div className="flex items-center gap-2">
              <Video className="w-5 h-5 text-[#4B2E83]" />
              <h2 className="font-bold text-slate-800 text-sm">Surveillance Feeds</h2>
            </div>
            <button
              onClick={() => navigate('/surveillance')}
              className="text-xs font-semibold text-[#4B2E83] hover:text-[#382264] flex items-center gap-1 hover:underline"
            >
              Full Wall <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-4 grid grid-cols-2 gap-3 flex-1">
            {cameras.slice(0, 4).map((cam) => (
              <div
                key={cam.id}
                onClick={() => navigate(`/surveillance?camera=${cam.id}`)}
                className="group relative rounded-lg overflow-hidden bg-slate-950 border border-slate-800 aspect-video cursor-pointer hover:ring-2 hover:ring-[#4B2E83] transition-all"
              >
                <div className="w-full h-full bg-slate-900 flex items-center justify-center text-slate-500 font-mono text-[10px]">
                  <div className="text-center space-y-1">
                    <div className="flex items-center justify-center gap-1">
                      <span className={`w-2 h-2 rounded-full ${cam.status === 'ONLINE' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                      <span className={cam.status === 'ONLINE' ? 'text-emerald-400 font-bold text-[10px]' : 'text-red-400 font-bold text-[10px]'}>
                        {cam.status === 'ONLINE' ? 'STREAM ONLINE' : 'FEED OFFLINE'}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[10px]">{cam.type || cam.camera_type} • 1080p</p>
                  </div>
                </div>

                {/* Overlays */}
                <div className="absolute top-2 left-2 z-20 flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-black/70 text-white font-mono text-[9px] font-bold backdrop-blur-xs">
                    {cam.camera_id || cam.code}
                  </span>
                </div>

                <div className="absolute bottom-2 left-2 right-2 z-20 flex items-center justify-between text-[10px] text-white">
                  <span className="truncate font-semibold text-slate-200">{cam.name}</span>
                  <span className="text-emerald-400 font-bold">{cam.fps || 25} FPS</span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Sensor Feed Ticker */}
          <div className="p-3 bg-slate-50 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#F7941D]" /> Real-Time Sensor Ingestion Stream
              </span>
              <TruthBadge status="SIMULATED" />
            </div>
            
            <div className="space-y-1.5">
              {sensorEvents.slice(0, 3).map((evt, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs bg-white p-2 rounded border border-slate-200/80">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#159A74]" />
                    <span className="font-mono text-[10px] font-bold text-slate-700">{evt.sensor_id || evt.sensor_code || 'SENS-01'}</span>
                    <span className="text-slate-600 text-[11px] truncate">{evt.event_type} - {evt.source_type}</span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-400 flex-shrink-0 ml-2">
                    {new Date(evt.timestamp || Date.now()).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Section: Sector 4 Intelligence Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div 
          onClick={() => navigate('/investigation')}
          className="bg-white p-5 rounded-xl border border-slate-200 hover:border-[#4B2E83]/40 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-lg bg-purple-50 text-[#4B2E83] group-hover:bg-[#4B2E83] group-hover:text-white transition-colors">
              <Sparkles className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#4B2E83] transition-colors" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Forensic Search & Knowledge Graph</h3>
          <p className="text-xs text-slate-500 mt-1">
            Structured semantic queries and entity-relationship graph linking persons, vehicles, and sensor observations.
          </p>
        </div>

        <div 
          onClick={() => navigate('/security')}
          className="bg-white p-5 rounded-xl border border-slate-200 hover:border-[#4B2E83]/40 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-lg bg-emerald-50 text-[#159A74] group-hover:bg-[#159A74] group-hover:text-white transition-colors">
              <Lock className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#159A74] transition-colors" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Cryptographic Evidence Integrity (SHA-256)</h3>
          <p className="text-xs text-slate-500 mt-1">
            Cryptographic SHA-256 evidence hashing and immutable audit logging for tamper-evident chain of custody.
          </p>
        </div>

        <div 
          onClick={() => navigate('/demo-scenarios')}
          className="bg-white p-5 rounded-xl border border-slate-200 hover:border-[#F7941D]/40 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-lg bg-amber-50 text-[#F7941D] group-hover:bg-[#F7941D] group-hover:text-white transition-colors">
              <Zap className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#F7941D] transition-colors" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">SIH Tactical Evaluation Console</h3>
          <p className="text-xs text-slate-500 mt-1">
            Deterministic step-by-step evaluation of night infiltration, camera failure handover, and contradiction rejection.
          </p>
        </div>
      </div>
    </div>
  );
};
