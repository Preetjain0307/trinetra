import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlayCircle, 
  Zap, 
  Moon, 
  VideoOff, 
  ShieldAlert, 
  Compass, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles,
  RefreshCw,
  AlertTriangle,
  Flame,
  Layers,
  RotateCcw,
  StepForward
} from 'lucide-react';
import { api } from '../services/api';
import { useSystem } from '../context/SystemContext';
import { TruthBadge } from '../components/common/StatusBadge';

export const DemoScenarios = () => {
  const navigate = useNavigate();
  const { refreshData, addNotification, setIsDemoRunning } = useSystem();
  
  const [runningScenario, setRunningScenario] = useState(null);
  const [activeStepNum, setActiveStepNum] = useState(0);
  const [activeStepText, setActiveStepText] = useState(null);
  const [scenarioLogs, setScenarioLogs] = useState([]);

  const addLog = (msg, type = 'info') => {
    setScenarioLogs(prev => [...prev, { text: msg, type, time: new Date().toLocaleTimeString() }]);
  };

  const handleReset = async () => {
    try {
      await api.resetDemoScenarios();
      setActiveStepNum(0);
      setActiveStepText(null);
      setScenarioLogs([]);
      setRunningScenario(null);
      refreshData();
      addNotification('Demo Scenarios Reset', 'Database test incidents cleared. Cameras restored to ONLINE.', 'info');
    } catch (err) {
      addNotification('Reset Failed', err.message, 'error');
    }
  };

  const handleRunNightStep = async (step) => {
    setRunningScenario('night-movement');
    setActiveStepNum(step);
    try {
      const res = await api.triggerNightMovementStep(step);
      addLog(`[Step ${step}] ${res.event || 'Executed'}: ${res.details || JSON.stringify(res)}`, 'success');
      setActiveStepText(`Step ${step} Completed: ${res.event}`);
      refreshData();
      if (step === 5) {
        addNotification('Night Infiltration Incident Created', 'INC-1042 correlated across 4 sensor sources. Awaiting verification.', 'error');
        setRunningScenario(null);
      }
    } catch (err) {
      addLog(`Step ${step} Error: ${err.message}`, 'error');
      setRunningScenario(null);
    }
  };

  const handleRunNightMovementFull = async () => {
    setRunningScenario('night-movement');
    setScenarioLogs([]);
    setIsDemoRunning(true);
    
    addLog('Initiating The Killer Demo: Multi-Sensor Night Infiltration (INC-1042)...', 'info');

    try {
      for (let s = 1; s <= 5; s++) {
        setActiveStepNum(s);
        const res = await api.triggerNightMovementStep(s);
        addLog(`[Step ${s}/5] ${res.event}: ${res.details || 'Processed into correlation pipeline'}`, s === 5 ? 'error' : 'success');
        await new Promise(r => setTimeout(r, 900));
      }
      
      refreshData();
      addNotification('Incident #INC-1042 Ready', 'Correlated CCTV + Thermal + Radar + UGS. Review in Incident Center.', 'error');
      setRunningScenario(null);
      setIsDemoRunning(false);

    } catch (err) {
      addLog(`Scenario error: ${err.message}`, 'error');
      setRunningScenario(null);
      setIsDemoRunning(false);
    }
  };

  const handleRunCameraFailure = async () => {
    setRunningScenario('camera-failure');
    setScenarioLogs([]);
    setIsDemoRunning(true);

    addLog('Initiating Scenario 2: Camera Blindspot & Resilience Handover...', 'info');

    try {
      const res = await api.triggerCameraFailureScenario();
      addLog('C-02 is OFFLINE. Autonomous acoustic and radar handover engaged.', 'error');
      addLog('Alternative sensors active: Acoustic node A-01, Thermal T-01. Coverage maintained.', 'success');
      refreshData();
      addNotification('Edge Mesh Handover Complete', 'Surveillance intact via Acoustic & Radar handover.', 'warning');
      setRunningScenario(null);
      setIsDemoRunning(false);
    } catch (err) {
      addLog(`Scenario error: ${err.message}`, 'error');
      setRunningScenario(null);
      setIsDemoRunning(false);
    }
  };

  const handleRunContradiction = async () => {
    setRunningScenario('contradiction');
    setScenarioLogs([]);
    setIsDemoRunning(true);

    addLog('Initiating Scenario 3: Sensor Contradiction & False Alarm Rejection...', 'info');

    try {
      const res = await api.triggerSensorContradictionScenario();
      addLog('Radar R-02 reported target. Multi-sensor cross-validation checked Thermal T-02 & CCTV C-03.', 'warning');
      addLog('Physical contradiction flagged: No heat signature, no visual confirmation.', 'info');
      addLog('Result: Incident marked CONTRADICTION_FLAGGED with reduced correlation score. False escalation avoided.', 'success');
      refreshData();
      addNotification('Sensor Contradiction Flagged', 'Radar echo flagged. Operator review required without false alarm dispatch.', 'info');
      setRunningScenario(null);
      setIsDemoRunning(false);
    } catch (err) {
      addLog(`Scenario error: ${err.message}`, 'error');
      setRunningScenario(null);
      setIsDemoRunning(false);
    }
  };

  const handleRunRouteDeviation = async () => {
    setRunningScenario('route-deviation');
    setScenarioLogs([]);
    setIsDemoRunning(true);

    addLog('Initiating Scenario 4: Route Deviation for Authorized Personnel...', 'info');

    try {
      const res = await api.triggerRouteDeviationScenario();
      addLog('Personnel P-001 (Havildar Ramesh Singh) observed in Zone B.', 'warning');
      addLog('Duty schedule check: Authorized for Zone A corridor only.', 'info');
      addLog('Generated non-hostile Route Check incident ticket INC-ROUTE-001 for supervisor review.', 'success');
      refreshData();
      addNotification('Route Deviation Flagged', 'Personnel P-001 route deviation recorded for review.', 'warning');
      setRunningScenario(null);
      setIsDemoRunning(false);
    } catch (err) {
      addLog(`Scenario error: ${err.message}`, 'error');
      setRunningScenario(null);
      setIsDemoRunning(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-[#311b58] to-[#4B2E83] p-6 rounded-xl text-white shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-[#F7941D]">
            <Zap className="w-5 h-5" />
            <span>SMART INDIA HACKATHON EVALUATION CONSOLE</span>
          </div>
          <button
            onClick={handleReset}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset All Scenarios
          </button>
        </div>
        <h1 className="text-2xl font-black">Deterministic SIH Demonstration Scenarios</h1>
        <p className="text-xs text-slate-200 max-w-2xl">
          Execute end-to-end multi-sensor correlation, blindspot camera failure handover, and physical contradiction filtering.
        </p>
      </div>

      {/* Scenario 1: The Killer Demo with Step-by-Step Controls */}
      <div className="bg-white rounded-xl border-2 border-[#4B2E83]/40 shadow-sm p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-purple-100 text-[#4B2E83] rounded-lg">
                <Moon className="w-5 h-5" />
              </span>
              <h2 className="font-black text-slate-900 text-base">
                Primary Demo (Scenario 1): Multi-Sensor Night Perimeter Movement (INC-1042)
              </h2>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Demonstrates end-to-end pipeline: CCTV → Track → Thermal → Radar → UGS → Correlation Engine → 1 Correlated Incident → XAI Explainability → SHA-256 Evidence.
            </p>
          </div>

          <button
            onClick={handleRunNightMovementFull}
            disabled={runningScenario !== null}
            className="px-5 py-2.5 bg-[#4B2E83] hover:bg-[#3d246d] text-white font-bold rounded-lg text-xs shadow-md transition-all flex items-center gap-2 flex-shrink-0"
          >
            <PlayCircle className="w-4 h-4 text-[#F7941D]" />
            Run Full 5-Step Pipeline
          </button>
        </div>

        {/* Step-by-Step Interactive Playback Strip */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            STEP-BY-STEP DETERMINISTIC DEMO PLAYBACK:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 text-xs">
            <button
              onClick={() => handleRunNightStep(1)}
              className={`p-3 rounded-lg border text-left transition-all ${
                activeStepNum === 1 ? 'border-[#4B2E83] bg-purple-50 ring-2 ring-purple-200' : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span className="font-bold block text-slate-800">1. CCTV C-01</span>
              <span className="text-[10px] text-slate-500">Track P-014 Created</span>
            </button>

            <button
              onClick={() => handleRunNightStep(2)}
              className={`p-3 rounded-lg border text-left transition-all ${
                activeStepNum === 2 ? 'border-[#4B2E83] bg-purple-50 ring-2 ring-purple-200' : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span className="font-bold block text-slate-800">2. Thermal T-01</span>
              <span className="text-[10px] text-slate-500">36.8°C Heat Signature</span>
            </button>

            <button
              onClick={() => handleRunNightStep(3)}
              className={`p-3 rounded-lg border text-left transition-all ${
                activeStepNum === 3 ? 'border-[#4B2E83] bg-purple-50 ring-2 ring-purple-200' : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span className="font-bold block text-slate-800">3. Radar R-01</span>
              <span className="text-[10px] text-slate-500">2.1 m/s Target Doppler</span>
            </button>

            <button
              onClick={() => handleRunNightStep(4)}
              className={`p-3 rounded-lg border text-left transition-all ${
                activeStepNum === 4 ? 'border-[#4B2E83] bg-purple-50 ring-2 ring-purple-200' : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span className="font-bold block text-slate-800">4. UGS G-04</span>
              <span className="text-[10px] text-slate-500">8.4 Hz Footstep Pulse</span>
            </button>

            <button
              onClick={() => handleRunNightStep(5)}
              className={`p-3 rounded-lg border text-left transition-all ${
                activeStepNum === 5 ? 'border-[#4B2E83] bg-purple-50 ring-2 ring-purple-200' : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span className="font-bold block text-slate-800">5. Correlate INC-1042</span>
              <span className="text-[10px] text-slate-500">XAI & SHA-256 Saved</span>
            </button>
          </div>
        </div>
      </div>

      {/* Scenarios 2, 3, 4 Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Scenario 2 */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4 hover:border-red-400 transition-all flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="p-2 bg-red-50 text-red-600 rounded-lg">
                <VideoOff className="w-5 h-5" />
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-700 uppercase">
                Scenario 2
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Camera Failure & Sensor Handover</h3>
            <p className="text-xs text-slate-600">
              Simulates camera loss on C-02. Demonstrates autonomous edge handover to acoustic wire-cut arrays and radar with zero blindspots.
            </p>
          </div>

          <button
            onClick={handleRunCameraFailure}
            disabled={runningScenario !== null}
            className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <PlayCircle className="w-4 h-4 text-white" />
            Trigger Camera Failure
          </button>
        </div>

        {/* Scenario 3 */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4 hover:border-emerald-400 transition-all flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="p-2 bg-emerald-50 text-[#159A74] rounded-lg">
                <ShieldAlert className="w-5 h-5" />
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-[#159A74] uppercase">
                Scenario 3
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Sensor Contradiction Filtering</h3>
            <p className="text-xs text-slate-600">
              Radar R-02 detects high-speed target, but thermal and visual report clean background. Correlation engine flags contradiction and prevents false alarm.
            </p>
          </div>

          <button
            onClick={handleRunContradiction}
            disabled={runningScenario !== null}
            className="w-full py-2.5 bg-[#159A74] hover:bg-[#118060] text-white font-bold rounded-lg text-xs shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <PlayCircle className="w-4 h-4 text-white" />
            Trigger Contradiction Check
          </button>
        </div>

        {/* Scenario 4 */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4 hover:border-blue-400 transition-all flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Compass className="w-5 h-5" />
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700 uppercase">
                Scenario 4
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Personnel Route Deviation</h3>
            <p className="text-xs text-slate-600">
              Personnel P-001 observed in Zone B. Duty schedule check flags unauthorized patrol corridor for non-hostile supervisory review.
            </p>
          </div>

          <button
            onClick={handleRunRouteDeviation}
            disabled={runningScenario !== null}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <PlayCircle className="w-4 h-4 text-white" />
            Trigger Route Check
          </button>
        </div>

      </div>

      {/* Live Scenario Execution Terminal Output */}
      {scenarioLogs.length > 0 && (
        <div className="bg-slate-950 rounded-xl p-5 text-white shadow-lg space-y-3 border border-slate-800 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-[#F7941D] flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Live Scenario Terminal Output
            </span>
            {activeStepText && (
              <span className="text-emerald-400 text-[11px] font-semibold">{activeStepText}</span>
            )}
          </div>

          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {scenarioLogs.map((log, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-slate-500 text-[10px]">[{log.time}]</span>
                <span className={
                  log.type === 'error' ? 'text-red-400 font-bold' : log.type === 'success' ? 'text-emerald-400 font-bold' : 'text-slate-200'
                }>
                  {log.text}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              onClick={() => navigate('/incidents?focus=INC-1042')}
              className="px-3 py-1.5 bg-[#4B2E83] hover:bg-[#3d246d] text-white rounded text-xs flex items-center gap-1 transition-colors"
            >
              Inspect Incident #INC-1042 <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
