import React, { useState } from 'react';
import { Settings as SettingsIcon, Sliders, Wifi, WifiOff, Cpu, Shield, Save, Check } from 'lucide-react';
import { useSystem } from '../context/SystemContext';

export const Settings = () => {
  const { operationalMode, setOperationalMode, addNotification } = useSystem();
  const [confidenceThreshold, setConfidenceThreshold] = useState(80);
  const [edgeInferenceRate, setEdgeInferenceRate] = useState(15);
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    addNotification('Settings Updated', `System operating in ${operationalMode} mode with ${confidenceThreshold}% AI trigger threshold.`, 'success');
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-[#4B2E83]" />
            System & Edge Node Configuration
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational modes, bandwidth adaptation, AI detection sensitivity, and edge node parameters.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Operational Mode Adaptation */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Wifi className="w-4 h-4 text-[#4B2E83]" />
            Bandwidth & Network Operational Mode
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              onClick={() => setOperationalMode('NORMAL')}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                operationalMode === 'NORMAL'
                  ? 'border-[#4B2E83] bg-purple-50/50 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-900 text-xs">Full Bandwidth (Normal)</span>
                {operationalMode === 'NORMAL' && <Check className="w-4 h-4 text-[#4B2E83]" />}
              </div>
              <p className="text-xs text-slate-500">1080p full video streaming, full telemetry, cloud synch enabled.</p>
            </div>

            <div
              onClick={() => setOperationalMode('LOW_BANDWIDTH')}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                operationalMode === 'LOW_BANDWIDTH'
                  ? 'border-[#F7941D] bg-amber-50/50 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-900 text-xs">Low-Bandwidth (Tactical)</span>
                {operationalMode === 'LOW_BANDWIDTH' && <Check className="w-4 h-4 text-[#F7941D]" />}
              </div>
              <p className="text-xs text-slate-500">Transmits only bounding box metadata & keyframe thumbnails over HF/Sat-link.</p>
            </div>

            <div
              onClick={() => setOperationalMode('OFFLINE')}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                operationalMode === 'OFFLINE'
                  ? 'border-red-600 bg-red-50/50 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-900 text-xs">Degraded / Offline Edge</span>
                {operationalMode === 'OFFLINE' && <Check className="w-4 h-4 text-red-600" />}
              </div>
              <p className="text-xs text-slate-500">Local edge autonomous operation. Stores events locally and alarms sound.</p>
            </div>
          </div>
        </div>

        {/* AI Model & Sensitivity Thresholds */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#159A74]" />
            Edge AI Sensitivity & Trigger Thresholds
          </h3>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Threat Alert AI Confidence Threshold</span>
                <span className="text-[#4B2E83] font-bold">{confidenceThreshold}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="95"
                value={confidenceThreshold}
                onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
                className="w-full accent-[#4B2E83]"
              />
              <p className="text-[11px] text-slate-400 mt-1">Detections above this threshold automatically generate incident tickets.</p>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Edge Inference Frame Rate (FPS)</span>
                <span className="text-[#159A74] font-bold">{edgeInferenceRate} FPS</span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                value={edgeInferenceRate}
                onChange={(e) => setEdgeInferenceRate(Number(e.target.value))}
                className="w-full accent-[#159A74]"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#4B2E83] hover:bg-[#3d246d] text-white font-bold rounded-lg text-xs shadow-md transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saved ? 'Configuration Saved!' : 'Save Parameters'}
          </button>
        </div>
      </form>
    </div>
  );
};
