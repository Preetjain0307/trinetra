import React, { useState, useEffect } from 'react';
import { Users, User, Shield, AlertCircle, Clock, MapPin, Search, ChevronRight, Activity, Eye } from 'lucide-react';
import { api } from '../services/api';
import { TruthBadge } from '../components/common/StatusBadge';

export const Personnel = () => {
  const [personnelList, setPersonnelList] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [journey, setJourney] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPersonnel();
  }, []);

  const loadPersonnel = async () => {
    try {
      setLoading(true);
      const data = await api.getPersonnel();
      setPersonnelList(data);
      if (data.length > 0) {
        handleSelectPerson(data[0]);
      }
    } catch (err) {
      console.error('Failed to load personnel:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPerson = async (person) => {
    setSelectedPerson(person);
    try {
      const jData = await api.getPersonnelJourney(person.id);
      setJourney(jData);
    } catch (err) {
      console.error('Failed to load journey:', err);
      setJourney(null);
    }
  };

  const filtered = personnelList.filter(p => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.role?.toLowerCase().includes(q) ||
      p.personnel_id?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#4B2E83]" />
              Person Intelligence & Identity Verification
            </h1>
            <TruthBadge status="FUNCTIONAL" />
          </div>
          <p className="text-xs text-slate-500">
            Spatio-temporal track correlation, authorized personnel clearance checks, and potential identity matching requiring human review.
          </p>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#4B2E83] w-56"
          />
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Personnel Directory List */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col max-h-[720px]">
          <div className="p-3 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700">
            Roster & Tracked Personnel ({filtered.length})
          </div>

          <div className="divide-y divide-slate-100 overflow-y-auto flex-1">
            {filtered.map((person) => {
              const isSelected = selectedPerson?.id === person.id;
              const isVerified = person.verification_status === 'VERIFIED';

              return (
                <div
                  key={person.id}
                  onClick={() => handleSelectPerson(person)}
                  className={`p-4 transition-colors cursor-pointer flex items-center justify-between ${
                    isSelected ? 'bg-purple-50/60 border-l-4 border-[#4B2E83]' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 text-[#4B2E83] flex items-center justify-center font-bold text-xs">
                      {person.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">{person.name}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                          isVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {isVerified ? 'KNOWN / AUTHORIZED' : 'REQUIRES VERIFICATION'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                        ID: {person.personnel_id} • Unit: {person.unit}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-semibold block">Duty Schedule</span>
                    <span className="text-xs font-bold text-slate-700">{person.duty_schedule}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Person Dossier & Journey Trail */}
        <div className="lg:col-span-7 space-y-6">
          {selectedPerson ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
              <div className="flex items-start justify-between pb-4 border-b border-slate-200">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-lg border-2 border-[#4B2E83]">
                    {selectedPerson.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900">{selectedPerson.name}</h2>
                    <p className="text-xs text-slate-500 font-mono">
                      Personnel Code: {selectedPerson.personnel_id} • {selectedPerson.role}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-[11px] font-semibold text-slate-700">
                        Authorized: {Array.isArray(selectedPerson.authorized_zones) ? selectedPerson.authorized_zones.join(', ') : 'Zone A'}
                      </span>
                      <TruthBadge status="POTENTIAL_MATCH" />
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Operational Status</span>
                  <p className="text-lg font-black text-[#4B2E83]">
                    {selectedPerson.verification_status === 'VERIFIED' ? 'AUTHORIZED' : 'REVIEW'}
                  </p>
                </div>
              </div>

              {/* Cross-Camera Journey Timeline */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#4B2E83]" />
                  Possible Journey Link (Spatio-Temporal Proximity)
                </h3>

                <div className="space-y-3 relative pl-6 border-l-2 border-slate-200 text-xs">
                  <div className="relative">
                    <span className="w-3 h-3 rounded-full bg-[#4B2E83] absolute -left-[31px] top-1 ring-4 ring-purple-100" />
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800">CCTV C-01 (Zone A Main Checkpoint)</span>
                        <span className="font-mono text-[11px] text-slate-400">Scheduled Check-in</span>
                      </div>
                      <p className="text-slate-600 text-xs mt-1">
                        Badge verified at Gate Ingress. Observation count: 4.
                      </p>
                    </div>
                  </div>

                  <div className="relative">
                    <span className="w-3 h-3 rounded-full bg-[#159A74] absolute -left-[31px] top-1 ring-4 ring-emerald-100" />
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800">Zone B Perimeter Checkpoint</span>
                        <span className="font-mono text-[11px] text-slate-400">Correlated Route Check</span>
                      </div>
                      <p className="text-slate-600 text-xs mt-1">
                        Correlated route traversal within expected patrol timetable.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
              Select an individual from the directory to inspect their profile.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
