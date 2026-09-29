import React, { useState, useEffect } from 'react';
import { 
  Globe2, 
  Layers, 
  MapPin, 
  Video, 
  Radio, 
  AlertTriangle, 
  Shield, 
  Eye, 
  Compass, 
  Maximize2, 
  Users, 
  Car, 
  Sun, 
  Wind,
  CheckCircle,
  Activity
} from 'lucide-react';
import { api } from '../services/api';
import { useSystem } from '../context/SystemContext';
import { PriorityBadge, StatusBadge } from '../components/common/StatusBadge';

export const BorderTwin = () => {
  const { incidents } = useSystem();
  const [cameras, setCameras] = useState([]);
  const [sensors, setSensors] = useState([]);
  const [personnel, setPersonnel] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [selectedEntity, setSelectedEntity] = useState(null);

  // Layer toggles
  const [showCameras, setShowCameras] = useState(true);
  const [showSensors, setShowSensors] = useState(true);
  const [showIncidents, setShowIncidents] = useState(true);
  const [showPatrols, setShowPatrols] = useState(true);
  const [mapStyle, setMapStyle] = useState('tactical'); // 'tactical', 'satellite', 'thermal'

  useEffect(() => {
    loadMapEntities();
  }, []);

  const loadMapEntities = async () => {
    try {
      const [camData, sensData, persData, vehData] = await Promise.all([
        api.getCameras().catch(() => []),
        api.getSensors().catch(() => []),
        api.getPersonnel().catch(() => []),
        api.getVehicles().catch(() => [])
      ]);
      setCameras(camData);
      setSensors(sensData);
      setPersonnel(persData);
      setVehicles(vehData);
    } catch (err) {
      console.error('Failed to load map data:', err);
    }
  };

  // Mock geographic positions for sector 4 entities on 2D visual digital twin plane
  const zoneCoordinates = [
    { name: 'Zone A - North Perimeter Fence', top: '15%', left: '20%', width: '60%', height: '18%', color: 'border-red-500/40 bg-red-500/5' },
    { name: 'Zone B - East Gate Checkpoint', top: '40%', left: '65%', width: '25%', height: '35%', color: 'border-blue-500/40 bg-blue-500/5' },
    { name: 'Zone C - Outpost 9 Desert Trail', top: '45%', left: '15%', width: '38%', height: '40%', color: 'border-amber-500/40 bg-amber-500/5' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Tactical Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Globe2 className="w-5 h-5 text-[#4B2E83]" />
            Digital Border Twin (Sector 4 Tactical GIS)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Geospatial sensor triangulation, real-time perimeter threat tracking, and situational awareness mesh.
          </p>
        </div>

        {/* Map Styles & Layer Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setMapStyle('tactical')}
              className={`px-2.5 py-1 rounded font-semibold ${mapStyle === 'tactical' ? 'bg-white text-[#4B2E83] shadow-xs' : 'text-slate-600'}`}
            >
              Tactical Grid
            </button>
            <button
              onClick={() => setMapStyle('satellite')}
              className={`px-2.5 py-1 rounded font-semibold ${mapStyle === 'satellite' ? 'bg-white text-[#4B2E83] shadow-xs' : 'text-slate-600'}`}
            >
              Satellite
            </button>
            <button
              onClick={() => setMapStyle('thermal')}
              className={`px-2.5 py-1 rounded font-semibold ${mapStyle === 'thermal' ? 'bg-white text-amber-800 shadow-xs' : 'text-slate-600'}`}
            >
              Thermal IR
            </button>
          </div>

          {/* Layer toggles */}
          <button
            onClick={() => setShowCameras(!showCameras)}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg border flex items-center gap-1.5 transition-colors ${
              showCameras ? 'bg-purple-100 text-[#4B2E83] border-purple-200' : 'bg-slate-50 text-slate-400 border-slate-200'
            }`}
          >
            <Video className="w-3.5 h-3.5" /> Cameras
          </button>
          <button
            onClick={() => setShowSensors(!showSensors)}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg border flex items-center gap-1.5 transition-colors ${
              showSensors ? 'bg-emerald-100 text-[#159A74] border-emerald-200' : 'bg-slate-50 text-slate-400 border-slate-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5" /> Sensors
          </button>
          <button
            onClick={() => setShowIncidents(!showIncidents)}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg border flex items-center gap-1.5 transition-colors ${
              showIncidents ? 'bg-red-100 text-red-700 border-red-200' : 'bg-slate-50 text-slate-400 border-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" /> Incidents
          </button>
        </div>
      </div>

      {/* Main Tactical Map Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Visual Map Surface */}
        <div className="lg:col-span-8 bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-lg relative min-h-[580px] flex flex-col justify-between p-4">
          
          {/* Map Surface Styling */}
          <div className={`absolute inset-0 transition-colors duration-500 ${
            mapStyle === 'tactical' 
              ? 'bg-[#0b1322]' 
              : mapStyle === 'satellite' 
              ? 'bg-[#1a2016]' 
              : 'bg-[#150a0a]'
          }`}>
            {/* Tactical Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />
            
            {/* International Border Defense Line */}
            <div className="absolute top-[8%] left-[5%] right-[5%] h-0 border-t-2 border-dashed border-red-500/70 pointer-events-none flex items-center justify-between px-4">
              <span className="text-[9px] font-mono font-bold bg-red-950 text-red-300 px-2 py-0.5 rounded border border-red-800 -translate-y-3">
                INTERNATIONAL BORDER LINE (ZERO LINE)
              </span>
              <span className="text-[9px] font-mono text-red-400/80 -translate-y-3">
                BUFFER ZONE: 150 METERS
              </span>
            </div>

            {/* Perimeter Fence Line */}
            <div className="absolute top-[22%] left-[10%] right-[10%] h-0 border-t-2 border-emerald-500/50 pointer-events-none flex items-center justify-end px-4">
              <span className="text-[9px] font-mono font-bold bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800 -translate-y-3">
                SMART PERIMETER FENCE & SEISMIC TRIPWIRE
              </span>
            </div>

            {/* Zones Overlays */}
            {zoneCoordinates.map((z, idx) => (
              <div
                key={idx}
                style={{ top: z.top, left: z.left, width: z.width, height: z.height }}
                className={`absolute rounded-xl border-2 border-dashed ${z.color} pointer-events-none p-2`}
              >
                <span className="text-[9px] font-mono font-bold text-slate-300 uppercase bg-black/60 px-1.5 py-0.5 rounded">
                  {z.name}
                </span>
              </div>
            ))}

            {/* Camera Markers */}
            {showCameras && cameras.map((cam, idx) => {
              const positions = [
                { top: '24%', left: '25%' },
                { top: '24%', left: '55%' },
                { top: '48%', left: '72%' },
                { top: '55%', left: '30%' },
                { top: '35%', left: '42%' },
                { top: '65%', left: '50%' },
              ];
              const pos = positions[idx % positions.length];
              return (
                <div
                  key={cam.id}
                  onClick={() => setSelectedEntity({ type: 'CAMERA', data: cam })}
                  style={{ top: pos.top, left: pos.left }}
                  className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 group z-20"
                >
                  {/* FOV Vision Cone projection */}
                  <div className="w-16 h-16 rounded-full bg-[#4B2E83]/15 border border-[#4B2E83]/40 absolute -inset-5 pointer-events-none group-hover:scale-125 transition-transform" />
                  
                  <div className={`p-2 rounded-full border shadow-md transition-transform group-hover:scale-110 ${
                    cam.status === 'ONLINE' ? 'bg-[#4B2E83] border-purple-400 text-white' : 'bg-red-900 border-red-500 text-red-200'
                  }`}>
                    <Video className="w-3.5 h-3.5" />
                  </div>
                  <span className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-[9px] font-mono font-bold text-white px-1.5 py-0.5 rounded whitespace-nowrap">
                    {cam.code}
                  </span>
                </div>
              );
            })}

            {/* Incident Markers */}
            {showIncidents && incidents.slice(0, 3).map((inc, idx) => {
              const positions = [
                { top: '21%', left: '28%' },
                { top: '45%', left: '75%' },
                { top: '52%', left: '26%' }
              ];
              const pos = positions[idx % positions.length];
              return (
                <div
                  key={inc.id}
                  onClick={() => setSelectedEntity({ type: 'INCIDENT', data: inc })}
                  style={{ top: pos.top, left: pos.left }}
                  className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 z-30 group"
                >
                  <div className="relative">
                    <span className="w-8 h-8 rounded-full bg-red-600/30 absolute -inset-1 animate-ping pointer-events-none" />
                    <div className="p-2.5 rounded-full bg-red-600 border-2 border-white text-white shadow-lg">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                  </div>
                  <span className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-red-950/90 text-red-200 border border-red-800 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded whitespace-nowrap">
                    {inc.incident_code}
                  </span>
                </div>
              );
            })}

            {/* Sensor Array Nodes */}
            {showSensors && sensors.slice(0, 6).map((sens, idx) => {
              const positions = [
                { top: '23%', left: '18%' },
                { top: '23%', left: '38%' },
                { top: '23%', left: '68%' },
                { top: '60%', left: '20%' },
                { top: '50%', left: '80%' },
                { top: '70%', left: '60%' }
              ];
              const pos = positions[idx % positions.length];
              return (
                <div
                  key={sens.id}
                  onClick={() => setSelectedEntity({ type: 'SENSOR', data: sens })}
                  style={{ top: pos.top, left: pos.left }}
                  className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 z-15 group"
                >
                  <div className="p-1.5 rounded-full bg-[#159A74] border border-emerald-300 text-white shadow-xs">
                    <Radio className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-[8px] font-mono text-emerald-300 hidden group-hover:block bg-black/80 px-1 rounded absolute top-5 left-1/2 -translate-x-1/2">
                    {sens.sensor_type}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Top HUD Stats Overlay */}
          <div className="relative z-30 flex items-center justify-between text-xs text-white bg-black/60 backdrop-blur-xs px-3 py-2 rounded-lg border border-white/10">
            <div className="flex items-center gap-3">
              <span className="font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                TACTICAL SAT-LINK: LOCKED
              </span>
              <span className="text-slate-400">|</span>
              <span className="font-mono text-slate-300 text-[11px]">FOV: 12.4 KM² SECTOR</span>
            </div>

            <div className="flex items-center gap-3 text-slate-300 text-[11px]">
              <span className="flex items-center gap-1">
                <Sun className="w-3.5 h-3.5 text-amber-400" /> 34°C CLEAR
              </span>
              <span className="flex items-center gap-1">
                <Wind className="w-3.5 h-3.5 text-blue-400" /> 14 KM/H NW
              </span>
            </div>
          </div>

          {/* Bottom Legend */}
          <div className="relative z-30 flex flex-wrap items-center gap-4 text-[10px] text-slate-300 bg-black/70 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-white/10">
            <span className="font-bold text-white uppercase">Legend:</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#4B2E83]" /> CCTV / PTZ Nodes</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#159A74]" /> Seismic & Acoustic Nodes</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> Active Threat Incidents</span>
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-red-500 border-t border-dashed" /> International Zero Line</span>
          </div>

        </div>

        {/* Tactical Telemetry & Selected Node Inspector (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {selectedEntity ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-purple-50 text-[#4B2E83]">
                    {selectedEntity.type === 'CAMERA' ? <Video className="w-4 h-4" /> : selectedEntity.type === 'SENSOR' ? <Radio className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4 text-red-600" />}
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{selectedEntity.data.name || selectedEntity.data.title || selectedEntity.data.code}</h3>
                    <p className="text-[10px] text-slate-400">{selectedEntity.type} INSPECTOR</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedEntity(null)}
                  className="text-xs text-slate-400 hover:text-slate-700"
                >
                  ✕
                </button>
              </div>

              {/* Entity Details */}
              <div className="space-y-2 text-xs">
                {selectedEntity.type === 'INCIDENT' && (
                  <>
                    <div className="flex justify-between p-2 bg-slate-50 rounded">
                      <span className="text-slate-500">Incident Code:</span>
                      <span className="font-mono font-bold text-slate-800">{selectedEntity.data.incident_code}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-slate-50 rounded">
                      <span className="text-slate-500">Severity:</span>
                      <PriorityBadge priority={selectedEntity.data.priority} />
                    </div>
                    <p className="text-slate-700 text-xs p-2 bg-purple-50/50 rounded border border-purple-100">
                      {selectedEntity.data.description}
                    </p>
                  </>
                )}

                {selectedEntity.type === 'CAMERA' && (
                  <>
                    <div className="flex justify-between p-2 bg-slate-50 rounded">
                      <span className="text-slate-500">Camera Code:</span>
                      <span className="font-mono font-bold text-slate-800">{selectedEntity.data.code}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-slate-50 rounded">
                      <span className="text-slate-500">Sensor Modality:</span>
                      <span className="font-bold text-[#4B2E83]">{selectedEntity.data.camera_type}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-slate-50 rounded">
                      <span className="text-slate-500">Status:</span>
                      <StatusBadge status={selectedEntity.data.status} />
                    </div>
                  </>
                )}

                {selectedEntity.type === 'SENSOR' && (
                  <>
                    <div className="flex justify-between p-2 bg-slate-50 rounded">
                      <span className="text-slate-500">Sensor Code:</span>
                      <span className="font-mono font-bold text-slate-800">{selectedEntity.data.code}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-slate-50 rounded">
                      <span className="text-slate-500">Modality:</span>
                      <span className="font-bold text-[#159A74]">{selectedEntity.data.sensor_type}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-slate-50 rounded">
                      <span className="text-slate-500">Health:</span>
                      <span className="font-bold text-emerald-600">100% Calibrated</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-6 text-center text-slate-400 text-xs">
              <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              Click any camera, sensor node, or incident marker on the tactical map to inspect real-time coordinates.
            </div>
          )}

          {/* Sector 4 Coverage Health */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#4B2E83]" />
              Sector 4 Perimeter Integrity
            </h3>

            <div className="space-y-2 text-xs">
              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-slate-600">Optical Coverage</span>
                  <span className="text-slate-900 font-bold">100% (6/6 Active)</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#4B2E83] rounded-full w-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-slate-600">Seismic & Acoustic Triangulation</span>
                  <span className="text-slate-900 font-bold">100% (11/11 Active)</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#159A74] rounded-full w-full" />
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
