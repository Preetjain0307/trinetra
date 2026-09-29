import React from 'react';
import { useNavigate } from 'react-router-dom';

export const StatCard = ({ title, value, subtext, icon: Icon, color = 'blue', linkTo, badge }) => {
  const navigate = useNavigate();

  const colorStyles = {
    blue: 'bg-[#EAF3FB] text-[#3F7FBF] border-[#3F7FBF]/20',
    red: 'bg-[#FDF2F2] text-red-700 border-red-200',
    green: 'bg-[#EDF7ED] text-[#159A74] border-[#159A74]/20',
    purple: 'bg-[#F3EEF9] text-[#4B2E83] border-[#4B2E83]/20',
    orange: 'bg-[#FFF4E6] text-[#F7941D] border-[#F7941D]/20',
    teal: 'bg-[#E6F7F9] text-[#2997A8] border-[#2997A8]/20',
  };

  return (
    <div 
      onClick={() => linkTo && navigate(linkTo)}
      className={`bg-white rounded-lg border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all duration-200 ${linkTo ? 'cursor-pointer hover:border-slate-300' : ''}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            {badge && <span>{badge}</span>}
          </div>
          {subtext && <p className="text-xs text-slate-500 mt-1">{subtext}</p>}
        </div>
        {Icon && (
          <div className={`p-3 rounded-lg border ${colorStyles[color] || colorStyles.blue}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
};
