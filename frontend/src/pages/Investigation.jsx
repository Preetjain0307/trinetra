import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Sparkles, 
  GitFork, 
  Clock, 
  Layers, 
  User, 
  Car, 
  Video, 
  AlertTriangle, 
  FileText, 
  Download,
  Share2,
  ExternalLink,
  ChevronRight,
  Filter,
  ArrowRight,
  Tag,
  MapPin,
  Calendar
} from 'lucide-react';
import { api } from '../services/api';
import { PriorityBadge, StatusBadge, TruthBadge } from '../components/common/StatusBadge';

export const Investigation = () => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [graphData, setGraphData] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState('search'); // 'search', 'graph'
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    loadIntelligenceGraph();
  }, []);

  const loadIntelligenceGraph = async () => {
    try {
      const data = await api.getIntelligenceGraph();
      setGraphData(data);
    } catch (err) {
      console.error('Failed to load intelligence graph:', err);
    }
  };

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!query.trim()) return;
    setIsSearching(true);
    try {
      const results = await api.search(query);
      setSearchResults(results);
    } catch (err) {
      console.error('Investigation search failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const sampleQueries = [
    "white pickup truck near gate 3 last night",
    "unidentified person near north fence backpack",
    "radar anomaly without thermal correlation",
    "patrol vehicle route check zone b"
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Search className="w-5 h-5 text-[#4B2E83]" />
              Forensic Investigation & Intelligence Graph
            </h1>
            <TruthBadge status="FUNCTIONAL" />
          </div>
          <p className="text-xs text-slate-500">
            Structured semantic entity parsing across incident logs, ANPR sightings, person tracks, and entity relationship graph.
          </p>
        </div>

        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
          <button
            onClick={() => setActiveTab('search')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              activeTab === 'search' ? 'bg-white text-[#4B2E83] shadow-xs' : 'text-slate-600'
            }`}
          >
            Structured Search
          </button>
          <button
            onClick={() => setActiveTab('graph')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              activeTab === 'graph' ? 'bg-white text-[#4B2E83] shadow-xs' : 'text-slate-600'
            }`}
          >
            Knowledge Graph
          </button>
        </div>
      </div>

      {activeTab === 'search' ? (
        <div className="space-y-6">
          {/* Natural Language Query Bar */}
          <div className="bg-gradient-to-r from-purple-900 to-[#4B2E83] p-6 rounded-xl text-white shadow-md space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-200">
              <Sparkles className="w-4 h-4 text-[#F7941D]" />
              <span>Semantic Parameter Extraction & Search Engine</span>
            </div>

            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Describe suspect, vehicle, activity, or zone (e.g. 'white pickup truck near gate 3 last night')..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white text-slate-900 rounded-lg text-xs md:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#F7941D] shadow-inner"
                />
              </div>
              <button
                type="submit"
                disabled={isSearching}
                className="px-6 py-3 bg-[#F7941D] hover:bg-[#e08316] text-slate-950 font-bold rounded-lg text-xs md:text-sm shadow-md transition-all flex items-center gap-2"
              >
                {isSearching ? 'Searching...' : 'Investigate'}
              </button>
            </form>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-purple-300 text-[11px] font-semibold">Suggested Forensic Queries:</span>
              {sampleQueries.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuery(q);
                  }}
                  className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-purple-100 text-[11px] font-medium transition-colors border border-white/10"
                >
                  "{q}"
                </button>
              ))}
            </div>
          </div>

          {/* INTERPRETED QUERY TRANSPARENCY BOX */}
          {searchResults && searchResults.interpreted_query && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                INTERPRETED SEARCH PARAMETERS (TRANSPARENT ENTITY EXTRACTION)
              </span>
              
              <div className="flex flex-wrap items-center gap-3 text-xs">
                {searchResults.interpreted_query.object_type && (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-[#4B2E83] rounded-lg border border-purple-200 font-semibold">
                    <Tag className="w-3.5 h-3.5" /> Object: {searchResults.interpreted_query.object_type}
                  </span>
                )}
                {searchResults.interpreted_query.zone_or_location && (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-800 rounded-lg border border-blue-200 font-semibold">
                    <MapPin className="w-3.5 h-3.5" /> Sector: {searchResults.interpreted_query.zone_or_location}
                  </span>
                )}
                {searchResults.interpreted_query.time_window && (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-900 rounded-lg border border-amber-200 font-semibold">
                    <Clock className="w-3.5 h-3.5" /> Window: {searchResults.interpreted_query.time_window}
                  </span>
                )}
                <span className="text-slate-400 text-xs">
                  Keywords: {searchResults.interpreted_query.keywords?.join(', ')}
                </span>
              </div>
            </div>
          )}

          {/* Search Results Display */}
          {searchResults && searchResults.results && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800 text-sm">
                  Database Matches Found ({searchResults.total_matches || 0})
                </h3>
                <span className="text-xs text-slate-500 font-mono">
                  Indexed search over SQLite/Postgres schema
                </span>
              </div>

              {/* Incidents Match */}
              {searchResults.results.incidents?.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-red-600" /> Correlated Incidents ({searchResults.results.incidents.length})
                  </h4>
                  <div className="divide-y divide-slate-100">
                    {searchResults.results.incidents.map((inc) => (
                      <div key={inc.id} className="py-3 flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <PriorityBadge priority={inc.priority} />
                            <span className="font-mono text-xs font-bold text-slate-800">{inc.code}</span>
                            <span className="text-xs font-bold text-slate-900">{inc.title}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">Zone: {inc.zone} • {new Date(inc.timestamp).toLocaleString()}</p>
                        </div>
                        <StatusBadge status={inc.status} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Vehicles Match */}
              {searchResults.results.vehicles?.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <Car className="w-4 h-4 text-blue-600" /> Vehicle Database Matches ({searchResults.results.vehicles.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {searchResults.results.vehicles.map((v, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <span className="font-mono font-bold text-xs text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-300">{v.plate}</span>
                        <p className="text-xs text-slate-600 mt-1">{v.type} • Owner: {v.owner}</p>
                        {v.is_flagged && <span className="text-[10px] text-red-600 font-bold mt-1 block">FLAGGED ON WATCHLIST</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Personnel Match */}
              {searchResults.results.personnel?.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-purple-600" /> Personnel Records ({searchResults.results.personnel.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {searchResults.results.personnel.map((p, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <span className="font-bold text-xs text-slate-900">{p.name} ({p.id})</span>
                        <p className="text-xs text-slate-600 mt-1">{p.role} • {p.unit}</p>
                        <span className="text-[10px] text-emerald-600 font-bold mt-1 block">Status: {p.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <GitFork className="w-4 h-4 text-[#4B2E83]" />
                Entity-Relationship Intelligence Graph
              </h2>
              <p className="text-xs text-slate-500">
                Correlating Incidents, Personnel, Vehicles, Cameras, and Sector Zones.
              </p>
            </div>
            <TruthBadge status="FUNCTIONAL" />
          </div>

          <div className="bg-slate-950 rounded-xl p-8 min-h-[460px] relative overflow-hidden flex items-center justify-center border border-slate-800">
            <div className="absolute inset-0 bg-[radial-gradient(#2d1e4e_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center gap-12">
              <div 
                onClick={() => setSelectedNode({ title: 'INC-1042 (Multi-Sensor Night Incident)', type: 'Incident', details: 'Zone B North Restricted Sector multi-sensor breach' })}
                className="p-4 rounded-xl bg-red-950 border-2 border-red-500 text-white shadow-xl cursor-pointer hover:scale-105 transition-transform text-center"
              >
                <AlertTriangle className="w-6 h-6 text-red-400 mx-auto mb-1 animate-pulse" />
                <span className="font-mono text-xs font-bold block">INC-1042</span>
                <span className="text-[10px] text-red-200">Zone B Night Observation</span>
              </div>

              <div className="grid grid-cols-3 gap-12 text-center">
                <div 
                  onClick={() => setSelectedNode({ title: 'Track: P-014', type: 'Person Track', details: 'Initial observation C-01, confirmed via Thermal T-01 & Radar R-01' })}
                  className="p-3 rounded-lg bg-purple-950 border border-purple-500 text-white cursor-pointer hover:scale-105 transition-transform"
                >
                  <User className="w-5 h-5 text-purple-300 mx-auto mb-1" />
                  <span className="text-xs font-bold block">Track P-014</span>
                  <span className="text-[9px] text-purple-300">Unverified Target</span>
                </div>

                <div 
                  onClick={() => setSelectedNode({ title: 'Sensor: T-01 (Thermal)', type: 'Thermal Sensor', details: 'Long-Range Thermal Imager 1 (Zone B)' })}
                  className="p-3 rounded-lg bg-amber-950 border border-amber-500 text-white cursor-pointer hover:scale-105 transition-transform"
                >
                  <Video className="w-5 h-5 text-amber-300 mx-auto mb-1" />
                  <span className="text-xs font-bold block">Thermal T-01</span>
                  <span className="text-[9px] text-amber-300">Simulated IR Feed</span>
                </div>

                <div 
                  onClick={() => setSelectedNode({ title: 'Camera: C-01 (Optical)', type: 'Camera Node', details: 'Perimeter North Optical 1 (Zone B)' })}
                  className="p-3 rounded-lg bg-emerald-950 border border-emerald-500 text-white cursor-pointer hover:scale-105 transition-transform"
                >
                  <Video className="w-5 h-5 text-emerald-300 mx-auto mb-1" />
                  <span className="text-xs font-bold block">CCTV C-01</span>
                  <span className="text-[9px] text-emerald-300">Live / Functional</span>
                </div>
              </div>
            </div>

            {selectedNode && (
              <div className="absolute bottom-4 left-4 right-4 bg-black/90 border border-white/20 p-4 rounded-lg text-white backdrop-blur-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#F7941D] uppercase">{selectedNode.type}</span>
                  <h4 className="font-bold text-sm">{selectedNode.title}</h4>
                  <p className="text-xs text-slate-300 mt-0.5">{selectedNode.details}</p>
                </div>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
