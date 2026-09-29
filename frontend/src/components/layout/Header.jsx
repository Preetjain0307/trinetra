import React, { useState, useEffect } from 'react';
import { Bell, Shield, Radio, Activity, RefreshCw, AlertCircle } from 'lucide-react';
import { useSystem } from '../../context/SystemContext';
import { OperationalAttentionBadge } from '../common/StatusBadge';

export const Header = () => {
  const { kpis, notifications, refreshData } = useSystem();
  const [timeStr, setTimeStr] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toUTCString().replace('GMT', 'UTC'));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-14 bg-white border-b border-slate-200 fixed top-0 right-0 left-64 z-20 flex items-center justify-between px-6 shadow-xs select-none">
      {/* Left: Operational Tag & Attention Badge */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#159A74] animate-pulse" />
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Sector 4 Command Node</span>
        </div>
        <div className="h-4 w-[1px] bg-slate-200" />
        <OperationalAttentionBadge level={kpis?.operational_attention} />
      </div>

      {/* Right: Time, System Status, Notifications */}
      <div className="flex items-center gap-4">
        <div className="font-mono text-xs text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded">
          {timeStr || 'Connecting...'}
        </div>

        <button
          onClick={refreshData}
          title="Refresh telemetry"
          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded relative"
          >
            <Bell className="w-4 h-4" />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-lg shadow-lg p-3 z-50">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                <span className="text-xs font-bold text-slate-800">Operational Alerts ({notifications.length})</span>
              </div>
              <div className="max-h-60 overflow-y-auto space-y-2 text-xs">
                {notifications.length === 0 ? (
                  <p className="text-slate-400 text-center py-2">No active alerts</p>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className="p-2 bg-slate-50 rounded border border-slate-100">
                      <p className="font-bold text-slate-800">{n.title}</p>
                      <p className="text-slate-600 text-[11px]">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
