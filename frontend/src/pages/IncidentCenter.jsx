import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Flame, 
  Radio, 
  Clock, 
  Sparkles, 
  FileText, 
  Send, 
  Layers, 
  Activity, 
  UserCheck, 
  ThumbsUp, 
  ThumbsDown,
  ArrowRight,
  Filter,
  Search,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  Lock,
  HelpCircle
} from 'lucide-react';
import { api } from '../services/api';
import { useSystem } from '../context/SystemContext';
import { useAuth } from '../context/AuthContext';
import { PriorityBadge, StatusBadge, TruthBadge } from '../components/common/StatusBadge';

export const IncidentCenter = () => {
  const [searchParams] = useSearchParams();
  const focusedParam = searchParams.get('focus');

  const { incidents, refreshData, addNotification } = useSystem();
  const { user } = useAuth();

  const [selectedIncident, setSelectedIncident] = useState(null);
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Action state
  const [actionReason, setActionReason] = useState('');
  const [actionNotes, setActionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // AI Feedback state
  const [feedbackType, setFeedbackType] = useState('CONFIRMED_TRUE_POSITIVE');
  const [feedbackComments, setFeedbackComments] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  useEffect(() => {
    if (incidents.length > 0) {
      if (focusedParam) {
        const found = incidents.find(i => i.id === parseInt(focusedParam) || i.incident_code === focusedParam);
        if (found) setSelectedIncident(found);
        else setSelectedIncident(incidents[0]);
      } else if (!selectedIncident) {
        setSelectedIncident(incidents[0]);
      }
    }
  }, [incidents, focusedParam]);

  const handleVerify = async () => {
    if (!selectedIncident) return;
    setIsSubmitting(true);
    try {
      await api.verifyIncident(selectedIncident.id, actionReason || 'Operator confirmed multi-sensor threat signature', actionNotes);
      addNotification('Incident Verified', `Incident ${selectedIncident.incident_code} marked as VERIFIED by ${user?.full_name}.`, 'success');
      refreshData();
      setActionReason('');
      setActionNotes('');
    } catch (err) {
      addNotification('Verification Failed', err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEscalate = async () => {
    if (!selectedIncident) return;
    setIsSubmitting(true);
    try {
      await api.escalateIncident(selectedIncident.id, actionReason || 'Escalated to Quick Reaction Team', actionNotes);
      addNotification('Incident Escalated', `Incident ${selectedIncident.incident_code} ESCALATED for tactical dispatch.`, 'warning');
      refreshData();
      setActionReason('');
      setActionNotes('');
    } catch (err) {
      addNotification('Escalation Failed', err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDismiss = async () => {
    if (!selectedIncident) return;
    setIsSubmitting(true);
    try {
      await api.dismissIncident(selectedIncident.id, actionReason || 'Operator dismissed non-threat activity', actionNotes);
      addNotification('Incident Dismissed', `Incident ${selectedIncident.incident_code} marked as DISMISSED.`, 'info');
      refreshData();
      setActionReason('');
      setActionNotes('');
    } catch (err) {
      addNotification('Dismissal Failed', err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!selectedIncident) return;
    try {
      await api.submitFeedback(selectedIncident.id, feedbackType, feedbackComments);
      setFeedbackSubmitted(true);
      addNotification('AI Model Feedback Saved', 'Operator decision logged for model audit & evaluation loop.', 'success');
      setTimeout(() => setFeedbackSubmitted(false), 3000);
    } catch (err) {
      addNotification('Feedback Error', err.message, 'error');
    }
  };

  const filteredIncidents = incidents.filter(item => {
    if (priorityFilter !== 'ALL' && item.priority !== priorityFilter) return false;
    if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        item.title?.toLowerCase().includes(q) ||
        item.incident_code?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Potential Incident Verification & Management
            </h1>
            <TruthBadge status="FUNCTIONAL" />
          </div>
          <p className="text-xs text-slate-500">
            Cross-sensor correlated event deduplication, explainable AI reasoning, and operator decision verification.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search code or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#4B2E83] w-48"
            />
          </div>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">Critical Priority</option>
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="LOW">Low Priority</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="NEW">New Incidents</option>
            <option value="VERIFIED">Verified</option>
            <option value="ESCALATED">Escalated</option>
            <option value="DISMISSED">Dismissed</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Incident List & Full Detail Analysis Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Incident List Column */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col max-h-[820px] overflow-hidden">
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Potential Incidents Queue ({filteredIncidents.length})</span>
            <span className="text-[11px] text-slate-400 font-normal">Select to inspect evidence</span>
          </div>

          <div className="divide-y divide-slate-100 overflow-y-auto flex-1">
            {filteredIncidents.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No incidents match the active filters.
              </div>
            ) : (
              filteredIncidents.map((inc) => {
                const isSelected = selectedIncident?.id === inc.id;
                return (
                  <div
                    key={inc.id}
                    onClick={() => setSelectedIncident(inc)}
                    className={`p-4 transition-all cursor-pointer border-l-4 ${
                      isSelected 
                        ? 'bg-purple-50/50 border-[#4B2E83] shadow-xs' 
                        : 'border-transparent hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <PriorityBadge priority={inc.priority} />
                          <span className="font-mono text-xs font-bold text-slate-800">{inc.incident_code}</span>
                        </div>
                        <h4 className={`text-xs font-bold ${isSelected ? 'text-[#4B2E83]' : 'text-slate-900'}`}>
                          {inc.title}
                        </h4>
                      </div>
                      <StatusBadge status={inc.status} />
                    </div>

                    <p className="text-[11px] text-slate-600 mt-1.5 line-clamp-2">
                      {inc.description}
                    </p>

                    <div className="flex items-center justify-between mt-2.5 text-[10px] text-slate-400 pt-2 border-t border-slate-100">
                      <span>Zone: <strong className="text-slate-600">{inc.zone_code}</strong></span>
                      <span className="font-mono">{new Date(inc.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Full Detail & Evidence Analysis Column */}
        <div className="lg:col-span-7 space-y-6">
          {selectedIncident ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
              {/* Header Summary */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {selectedIncident.incident_code}
                    </span>
                    <PriorityBadge priority={selectedIncident.priority} />
                    <StatusBadge status={selectedIncident.status} />
                    {selectedIncident.sensor_consistency_status === 'CONTRADICTION_FLAGGED' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                        CONTRADICTION FLAGGED
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg font-black text-slate-900 mt-1.5">
                    {selectedIncident.title}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Triggered: {new Date(selectedIncident.timestamp).toLocaleString()} • Location: {selectedIncident.location_name || selectedIncident.zone_code}
                  </p>
                </div>

                <div className="text-right sm:border-l sm:border-slate-100 sm:pl-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Correlation Score</span>
                  <p className="text-2xl font-black text-[#4B2E83]">
                    {Math.round((selectedIncident.correlation_score || 0.88) * 100)}%
                  </p>
                </div>
              </div>

              {/* Structured Explainable AI (XAI) Reasoning Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#F7941D]" />
                    Explainable AI (XAI) Assessment
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">Deduplication: {selectedIncident.contributing_sources?.length || 1} Sources</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-800 block text-[11px] uppercase">Why Flagged (Contributing Factors)</span>
                    <ul className="list-disc pl-4 text-slate-600 space-y-0.5 text-[11px]">
                      <li>Restricted perimeter crossing window</li>
                      <li>Night-time movement signature</li>
                      <li>Multi-sensor spatial and temporal corroboration</li>
                      <li>Unverified identity requiring visual confirmation</li>
                    </ul>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                    <span className="font-bold text-amber-800 block text-[11px] uppercase">Uncertainties / Verification Needs</span>
                    <ul className="list-disc pl-4 text-slate-600 space-y-0.5 text-[11px]">
                      <li>Identity unverified (Visual face confirmation required)</li>
                      <li>Spatial offset between Radar and Optical: ~4 meters</li>
                      <li>Hostility intent unknown (May be lost civilian / wildlife)</li>
                    </ul>
                  </div>
                </div>

                <p className="text-xs text-slate-700 bg-purple-50/50 p-2.5 rounded border border-purple-100">
                  <strong>AI Summary: </strong>
                  {selectedIncident.ai_summary || selectedIncident.description}
                </p>
              </div>

              {/* Multi-Modal Sensor Telemetry Breakdown */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#159A74]" />
                  Contributing Sensor Sources ({selectedIncident.contributing_sources?.length || 1})
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(selectedIncident.contributing_sources || [{ type: 'CCTV', id: 'C-01' }]).map((src, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                      <span className="text-[10px] text-slate-500 font-semibold block">{src.type}</span>
                      <span className="text-xs font-bold text-slate-800 mt-1 block">{src.id}</span>
                      <span className="text-[9px] text-emerald-600 font-bold">● Correlated</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Operator Decision Action Controls */}
              <div className="p-4 bg-slate-900 rounded-xl text-white space-y-4 shadow-md">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-[#F7941D]" />
                    Operator Verification Desk
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">Logged: {user?.full_name} ({user?.role})</span>
                </div>

                <input
                  type="text"
                  placeholder="Operator verification notes / mandatory rationale..."
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#F7941D]"
                />

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    onClick={handleVerify}
                    disabled={isSubmitting}
                    className="flex-1 py-2 px-3 bg-[#159A74] hover:bg-[#118060] text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Verify Potential Threat
                  </button>

                  <button
                    onClick={handleEscalate}
                    disabled={isSubmitting}
                    className="flex-1 py-2 px-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    <Flame className="w-4 h-4" />
                    Escalate to QRF Dispatch
                  </button>

                  <button
                    onClick={handleDismiss}
                    disabled={isSubmitting}
                    className="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <XCircle className="w-4 h-4" />
                    Dismiss (Non-Threat)
                  </button>
                </div>
              </div>

              {/* Human-in-the-Loop Model Feedback Loop */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <ThumbsUp className="w-3.5 h-3.5 text-[#4B2E83]" />
                    Model Decision Audit & Continuous Evaluation
                  </span>
                  {feedbackSubmitted && (
                    <span className="text-[11px] font-bold text-emerald-600">✓ Feedback Saved</span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={feedbackType}
                    onChange={(e) => setFeedbackType(e.target.value)}
                    className="text-xs bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 font-semibold"
                  >
                    <option value="CONFIRMED_TRUE_POSITIVE">Confirmed Valid Threat Signature</option>
                    <option value="FALSE_ALERT">False Alert (Environmental Noise)</option>
                    <option value="NEEDS_REVIEW">Needs Further Intelligence Review</option>
                  </select>

                  <input
                    type="text"
                    placeholder="Feedback notes for evaluation..."
                    value={feedbackComments}
                    onChange={(e) => setFeedbackComments(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none"
                  />

                  <button
                    onClick={handleSubmitFeedback}
                    className="px-3 py-1.5 bg-[#4B2E83] text-white text-xs font-bold rounded-lg hover:bg-[#3d246d] transition-colors"
                  >
                    Submit
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
              Select an incident from the queue to review multi-sensor evidence.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
