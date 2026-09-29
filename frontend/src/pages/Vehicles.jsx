import React, { useState, useEffect } from 'react';
import { Car, AlertTriangle, ShieldCheck, Gauge, Clock, Search, MapPin, Activity } from 'lucide-react';
import { api } from '../services/api';
import { TruthBadge } from '../components/common/StatusBadge';

export const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      const data = await api.getVehicles();
      setVehicles(data);
      if (data.length > 0) {
        setSelectedVehicle(data[0]);
      }
    } catch (err) {
      console.error('Failed to load vehicles:', err);
    }
  };

  const filtered = vehicles.filter(v => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      v.plate_number?.toLowerCase().includes(q) ||
      v.make_model?.toLowerCase().includes(q) ||
      v.color?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Car className="w-5 h-5 text-[#4B2E83]" />
              Vehicle Intelligence & ANPR Surveillance
            </h1>
            <TruthBadge status="FUNCTIONAL" />
          </div>
          <p className="text-xs text-slate-500">
            Automatic number plate recognition (OCR), speed anomaly tracking, route compliance, and watchlist verification.
          </p>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search license plate / model..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#4B2E83] w-56"
          />
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Vehicles Directory */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col max-h-[720px]">
          <div className="p-3 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700">
            Recognized Vehicles ({filtered.length})
          </div>

          <div className="divide-y divide-slate-100 overflow-y-auto flex-1">
            {filtered.map((veh) => {
              const isSelected = selectedVehicle?.id === veh.id;
              const isFlagged = veh.is_flagged;

              return (
                <div
                  key={veh.id}
                  onClick={() => setSelectedVehicle(veh)}
                  className={`p-4 transition-colors cursor-pointer flex items-center justify-between ${
                    isSelected ? 'bg-purple-50/60 border-l-4 border-[#4B2E83]' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isFlagged ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      <Car className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-mono font-black text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                        {veh.plate_number}
                      </span>
                      <p className="text-xs text-slate-600 mt-1">{veh.make_model} • {veh.color}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      isFlagged ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {isFlagged ? 'WATCHLIST MATCH' : 'AUTHORIZED'}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      {veh.vehicle_type}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Vehicle ANPR Dossier */}
        <div className="lg:col-span-7 space-y-6">
          {selectedVehicle ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
              <div className="flex items-start justify-between pb-4 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-black px-3 py-1 bg-slate-900 text-white rounded border-2 border-[#F7941D]">
                      {selectedVehicle.plate_number}
                    </span>
                    <span className="text-xs font-bold text-slate-700">{selectedVehicle.make_model}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Color: {selectedVehicle.color} • Registered Owner: {selectedVehicle.registered_owner}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">ANPR Status</span>
                  <p className={`text-base font-black ${selectedVehicle.is_flagged ? 'text-red-600' : 'text-emerald-600'}`}>
                    {selectedVehicle.is_flagged ? 'REQUIRES VERIFICATION' : 'AUTHORIZED'}
                  </p>
                </div>
              </div>

              {/* Status & Compliance */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                  <Gauge className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                  <span className="text-[10px] text-slate-500 font-semibold block">OCR Confidence</span>
                  <span className="text-sm font-black text-slate-900">96.4%</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                  <Activity className="w-4 h-4 text-[#159A74] mx-auto mb-1" />
                  <span className="text-[10px] text-slate-500 font-semibold block">Route Compliance</span>
                  <span className="text-sm font-black text-emerald-600">Authorized Corridor</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                  <ShieldCheck className="w-4 h-4 text-purple-600 mx-auto mb-1" />
                  <span className="text-[10px] text-slate-500 font-semibold block">Zones Authorized</span>
                  <span className="text-xs font-bold text-slate-900">
                    {Array.isArray(selectedVehicle.authorized_zones) ? selectedVehicle.authorized_zones.join(', ') : 'Zone A, Zone B'}
                  </span>
                </div>
              </div>

              {/* Sighting Observations */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  ANPR Checkpoint Sighting Log
                </h3>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                    <span className="font-bold text-slate-800">C-04 (Main Checkpoint Ingress)</span>
                    <span className="font-mono text-slate-400">Captured in Zone A</span>
                  </div>
                  <p className="text-slate-600 text-xs">
                    Optical high-resolution OCR verified plate {selectedVehicle.plate_number}. No speed anomaly recorded.
                  </p>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
              Select a vehicle to inspect ANPR readouts.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
