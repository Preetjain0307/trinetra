import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Video,
  AlertTriangle,
  Globe2,
  Search,
  Users,
  Car,
  Radio,
  BarChart3,
  ShieldCheck,
  Settings,
  PlayCircle,
  Eye,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSystem } from '../../context/SystemContext';

export const Sidebar = () => {
  const { user, logout, setDemoRole } = useAuth();
  const { operationalMode } = useSystem();

  const navItems = [
    { to: '/', label: 'Command Center', icon: LayoutDashboard },
    { to: '/surveillance', label: 'Live Surveillance', icon: Video },
    { to: '/incidents', label: 'Incident Center', icon: AlertTriangle },
    { to: '/border-twin', label: 'Digital Border Twin', icon: Globe2 },
    { to: '/investigation', label: 'Investigation', icon: Search },
    { to: '/personnel', label: 'Person Intelligence', icon: Users },
    { to: '/vehicles', label: 'Vehicle Intelligence', icon: Car },
    { to: '/sensors', label: 'Sensor Center', icon: Radio },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/security', label: 'Security Center', icon: ShieldCheck },
    { to: '/settings', label: 'System Settings', icon: Settings },
    { to: '/demo-scenarios', label: 'SIH Demo Console', icon: PlayCircle, highlight: true },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen fixed left-0 top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-200 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-[#4B2E83] flex items-center justify-center text-white shadow-sm ring-2 ring-[#4B2E83]/20">
          <Eye className="w-5 h-5 text-[#F7941D]" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-base tracking-wider text-slate-900">TRINETRA</span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 bg-[#4B2E83] text-white rounded">AI</span>
          </div>
          <p className="text-[10px] text-slate-500 font-medium tracking-tight">Border Intelligence Platform</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-[#4B2E83] text-white shadow-sm'
                    : item.highlight
                    ? 'bg-[#FFF4E6] text-[#F7941D] hover:bg-[#FFE8CC] font-bold border border-[#F7941D]/30'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Mode & User Footer */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/70 space-y-2">
        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span>Mode: <strong className="text-slate-700">{operationalMode}</strong></span>
          <span className="flex items-center gap-1 text-[#159A74] font-medium">
            <span className="w-2 h-2 rounded-full bg-[#159A74] animate-pulse" /> Live Edge
          </span>
        </div>

        {/* Role Switcher */}
        <div className="bg-white p-2 rounded border border-slate-200">
          <div className="flex items-center justify-between">
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-800 truncate">{user?.full_name || 'Operator'}</p>
              <p className="text-[10px] text-slate-500 truncate">{user?.role || 'Operator'} • {user?.badge_number || 'OP-8821'}</p>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-slate-100"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
          
          {/* Quick Demo Role Selector */}
          <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
            <span>Role:</span>
            <select
              value={user?.role || 'Operator'}
              onChange={(e) => setDemoRole(e.target.value)}
              className="text-[10px] font-semibold bg-slate-50 border border-slate-200 rounded px-1 py-0.5 text-slate-700 focus:outline-none"
            >
              <option value="Operator">Operator</option>
              <option value="Investigator">Investigator</option>
              <option value="Supervisor">Supervisor</option>
              <option value="System Admin">System Admin</option>
            </select>
          </div>
        </div>
      </div>
    </aside>
  );
};
