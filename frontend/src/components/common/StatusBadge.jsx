import React from 'react';

export const PriorityBadge = ({ priority }) => {
  const styles = {
    CRITICAL: 'bg-red-50 text-red-700 border-red-200 ring-1 ring-red-300',
    HIGH: 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-300',
    MEDIUM: 'bg-blue-50 text-blue-700 border-blue-200',
    LOW: 'bg-slate-50 text-slate-700 border-slate-200',
    INFORMATIONAL: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  const p = priority ? priority.toUpperCase() : 'MEDIUM';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider border ${styles[p] || styles.MEDIUM}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${p === 'CRITICAL' ? 'bg-red-600 animate-pulse' : (p === 'HIGH' ? 'bg-amber-500' : 'bg-blue-500')}`} />
      {p}
    </span>
  );
};

export const StatusBadge = ({ status }) => {
  const styles = {
    NEW: 'bg-red-50 text-red-700 border-red-200',
    UNDER_REVIEW: 'bg-amber-50 text-amber-700 border-amber-200',
    VERIFIED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    DISMISSED: 'bg-slate-100 text-slate-600 border-slate-200',
    ESCALATED: 'bg-purple-50 text-purple-700 border-purple-200',
    RESOLVED: 'bg-teal-50 text-teal-700 border-teal-200',
    ONLINE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    OFFLINE: 'bg-red-50 text-red-700 border-red-200',
    DEGRADED: 'bg-amber-50 text-amber-700 border-amber-200',
    CONTRADICTION_FLAGGED: 'bg-amber-50 text-amber-800 border-amber-300 ring-1 ring-amber-200 font-bold',
  };

  const s = status ? status.toUpperCase().replace(' ', '_') : 'NEW';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[s] || 'bg-slate-50 text-slate-700 border-slate-200'}`}>
      {status ? status.replace(/_/g, ' ') : 'Unknown'}
    </span>
  );
};

export const TruthBadge = ({ status = 'SIMULATED' }) => {
  const styles = {
    'FUNCTIONAL': 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-1 ring-emerald-200',
    'SIMULATED': 'bg-amber-50 text-amber-900 border-amber-300 ring-1 ring-amber-200',
    'INTEGRATION_READY': 'bg-blue-50 text-blue-800 border-blue-300 ring-1 ring-blue-200',
    'POTENTIAL_MATCH': 'bg-purple-50 text-purple-800 border-purple-300 ring-1 ring-purple-200',
  };

  const labels = {
    'FUNCTIONAL': 'LIVE / FUNCTIONAL',
    'SIMULATED': 'SIMULATED FEED',
    'INTEGRATION_READY': 'INTEGRATION READY',
    'POTENTIAL_MATCH': 'POTENTIAL MATCH (REQUIRES VERIFICATION)',
  };

  const key = status ? status.toUpperCase().replace(/ /g, '_') : 'SIMULATED';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${styles[key] || styles.SIMULATED}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${key === 'FUNCTIONAL' ? 'bg-emerald-600' : (key === 'SIMULATED' ? 'bg-amber-500' : 'bg-blue-600')}`} />
      {labels[key] || key}
    </span>
  );
};

export const OperationalAttentionBadge = ({ level }) => {
  const styles = {
    'NORMAL': 'bg-emerald-50 text-emerald-800 border-emerald-200',
    'ELEVATED ATTENTION': 'bg-amber-50 text-amber-800 border-amber-300 ring-1 ring-amber-200',
    'HIGH ATTENTION': 'bg-red-50 text-red-800 border-red-300 ring-1 ring-red-200 animate-pulse',
  };

  const lvl = level || 'NORMAL';
  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider border shadow-sm ${styles[lvl] || styles.NORMAL}`}>
      <span className={`w-2 h-2 rounded-full ${lvl === 'HIGH ATTENTION' ? 'bg-red-600' : (lvl === 'ELEVATED ATTENTION' ? 'bg-amber-500' : 'bg-emerald-500')}`} />
      TRINETRA: {lvl}
    </div>
  );
};
