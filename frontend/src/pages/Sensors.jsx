import React, { useState, useEffect } from 'react';
import { Radio, Activity, Zap, CheckCircle2, AlertCircle, RefreshCw, Send, PlusCircle } from 'lucide-react';
import { api } from '../services/api';
import { useSystem } from '../context/SystemContext';
import { TruthBadge } from '../components/common/StatusBadge';

export const Sensors = () => {
  const { addNotification } = useSystem();
  const [sensors, setSensors] = useState([]);
  const [sensorEvents, setSensorEvents] = useState([]);
  const [injectType, setInjectType] = useState('SEISMIC_VIBRATION');
  const [injectZone, setInjectZone] = useState('Zone A');
  const [injectDescription, setInjectDescription] = useState('Simulated footstep seismic ground vibration');
  const [isInjecting, setIsInjecting] = useState(false);

  useEffect(() => {
    loadSensorsAndEvents();
  }, []);

  const loadSensorsAndEvents = async () => {
    try {
      const [sData, eData] = await Promise.all([
        api.getSensors(),
        api.getSensorEvents(20)
      ]);
      setSensors(sData);
      setSensorEvents(eData);
    } catch (err) {
      console.error('Failed to load sensors:', err);
    }
  };

  const handleInjectEvent = async (e) => {
    e.preventDefault();
    setIsInjecting(true);
    try {
      await api.injectSensorEvent({
        source_type: injectType.split('_')[0],
        sensor_id: 'G-04',
        zone_code: injectZone,
        event_type: injectType.toLowerCase(),
        object_type: 'PERSON',
        confidence: 0.88,
        metadata_json: { description: injectDescription }
      });
      addNotification('Sensor Event Injected', `Injected ${injectType} in ${injectZone}. Correlation engine active.`, 'success');
      loadSensorsAndEvents();
    } catch (err) {
      addNotification('Injection Failed', err.message, 'error');
    } finally {
      setIsInjecting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Radio className="w-5 h-5 text-[#159A74]" />
              Sensor Fleet & Telemetry Ingestion Center
            </h1>
            <TruthBadge status="SIMULATED" />
          </div>
          <p className="text-xs text-slate-500">
            Real-time status of seismic tripwires (UGS), micro-Doppler radar, thermal IR arrays, acoustic nodes, and UAV feeds.
          </p>
        </div>

        <button
          onClick={loadSensorsAndEvents}
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Telemetry
        </button>
      </div>

      {/* Grid: Sensor Fleet Grid & Event Injector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Sensor Node Fleet Status */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-900 text-sm">
                Connected Sensor Nodes ({sensors.length})
              </h2>
              <span className="text-xs text-emerald-600 font-bold">100% Synchronized</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {sensors.map((s) => (
                <div key={s.id} className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 flex flex-col justify-between space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-800">{s.sensor_id}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{s.name}</h4>
                    <p className="text-[10px] text-slate-500">{s.sensor_type} • {s.zone_code}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-200/60 flex justify-between text-[10px]">
                    <span className="text-slate-400">Battery: {s.battery_pct}%</span>
                    <span className="font-bold text-[#159A74]">{s.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Sensor Events Stream */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#F7941D]" />
                Sensor Event Ingestion Stream
              </h3>
              <TruthBadge status="SIMULATED" />
            </div>

            <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
              {sensorEvents.map((evt, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="font-mono text-[11px] font-bold text-slate-800">{evt.sensor_id}</span>
                    <span className="text-slate-700 font-medium">{evt.event_type}</span>
                    <span className="text-slate-400 text-[11px]">{evt.source_type} • {evt.zone_code}</span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-400">{new Date(evt.timestamp || Date.now()).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Manual Sensor Event Injection Panel */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-gradient-to-br from-slate-900 to-[#1e1430] p-5 rounded-xl text-white shadow-md space-y-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#F7941D]" />
              <h3 className="font-bold text-sm">Synthetic Telemetry Injector</h3>
            </div>
            <p className="text-xs text-slate-300">
              Inject synthetic ground sensor pulses to evaluate multi-sensor fusion, alert deduplication, and contradiction filtering.
            </p>

            <form onSubmit={handleInjectEvent} className="space-y-3 pt-2">
              <div>
                <label className="text-[11px] text-slate-300 font-semibold block mb-1">Sensor Modality</label>
                <select
                  value={injectType}
                  onChange={(e) => setInjectType(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="SEISMIC_VIBRATION">Seismic Ground Pulse (UGS Footsteps)</option>
                  <option value="RADAR_MICRO_DOPPLER">Radar Micro-Doppler Target (2.1 m/s)</option>
                  <option value="ACOUSTIC_SIGNATURE">Acoustic Wire-Cut Disturbance</option>
                  <option value="THERMAL_HOTSPOT">Thermal IR 36.8°C Delta</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-300 font-semibold block mb-1">Target Zone</label>
                <select
                  value={injectZone}
                  onChange={(e) => setInjectZone(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="Zone A">Zone A - Main Checkpoint Sector</option>
                  <option value="Zone B">Zone B - North Restricted Perimeter</option>
                  <option value="Zone C">Zone C - Patrol Road West</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-300 font-semibold block mb-1">Description</label>
                <input
                  type="text"
                  value={injectDescription}
                  onChange={(e) => setInjectDescription(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isInjecting}
                className="w-full py-2.5 bg-[#F7941D] hover:bg-[#e08316] text-slate-950 font-bold rounded-lg text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                {isInjecting ? 'Injecting Telemetry...' : 'Inject Event into Pipeline'}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};
