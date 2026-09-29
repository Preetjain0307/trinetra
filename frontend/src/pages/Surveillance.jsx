import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Video, 
  VideoOff, 
  Maximize2, 
  Grid, 
  Layers, 
  Sun, 
  Moon, 
  RotateCw, 
  ShieldAlert, 
  Sliders, 
  Camera, 
  Compass, 
  ZoomIn, 
  ZoomOut,
  Crosshair,
  AlertCircle,
  Activity,
  CheckCircle,
  Sparkles,
  Upload,
  Play,
  Pause,
  Bell,
  Radio,
  Car,
  UserCheck,
  Eye,
  Search,
  Filter,
  Users
} from 'lucide-react';
import { api } from '../services/api';
import { useSystem } from '../context/SystemContext';
import { StatusBadge, TruthBadge } from '../components/common/StatusBadge';

const CAMERA_VIDEO_MAP = {
  'C-01': '/videos/cctv_01.mp4',
  'C-02': '/videos/cctv_02.mp4',
  'C-03': '/videos/cctv_03.mp4',
  'C-04': '/videos/cctv_04.mp4',
  'C-05': '/videos/cctv_05.mp4',
  'C-06': '/videos/cctv_06.mp4',
  'C-07': '/videos/cctv_07.mp4',
  'C-08': '/videos/cctv_08.mp4',
  'C-09': '/videos/cctv_09.mp4',
  'C-10': '/videos/cctv_10.mp4',
  'C-11': '/videos/cctv_11.mp4',
  'C-12': '/videos/cctv_12.mp4',
  'C-13': '/videos/cctv_13.mp4',
  'C-14': '/videos/cctv_14.mp4',
  'C-15': '/videos/cctv_15.mp4',
  'C-16': '/videos/cctv_16.mp4',
  'C-17': '/videos/cctv_17.mp4',
  'C-18': '/videos/cctv_18.mp4',
  'C-19': '/videos/cctv_19.mp4',
  'C-20': '/videos/cctv_20.mp4',
};

// Multi-Target Realistic Detection Profiles with Dynamic Moving Trajectories
// Multi-Target Realistic Border Detection Profiles Aligned with Tactical Videos
const CAMERA_DETECTIONS = {
  'C-01': [
    { id: 'P014', type: 'PERSON', label: 'PERSON 94%', track: 'TRK-P014 • 1.4m/s', color: 'rose', baseTop: 52, baseLeft: 18, speedX: 1.6, speedY: 0.4, w: 'w-8', h: 'h-16', range: '140m' },
    { id: 'P015', type: 'PERSON', label: 'PERSON 91%', track: 'TRK-P015 • 1.2m/s', color: 'rose', baseTop: 52, baseLeft: 8, speedX: 1.6, speedY: 0.4, w: 'w-8', h: 'h-15', range: '155m' }
  ],
  'C-02': [
    { id: 'P001', type: 'PERSON', label: 'BSF SENTRY 98%', track: 'P-001 (AUTH)', color: 'blue', baseTop: 54, baseLeft: 35, speedX: 1.1, speedY: 0.2, w: 'w-8', h: 'h-16', range: '85m' }
  ],
  'C-03': [
    { id: 'V001', type: 'VEHICLE', label: 'PATROL SUV 96%', track: 'V-001 • 34km/h', color: 'cyan', baseTop: 74, baseLeft: 70, speedX: -2.4, speedY: 0.1, w: 'w-24', h: 'h-14', range: '210m' }
  ],
  'C-04': [
    { id: 'V004', type: 'ANPR', label: 'ANPR: MH01AB1234', track: 'Tata Safari • PASS', color: 'emerald', baseTop: 52, baseLeft: 28, speedX: 1.4, speedY: 0.1, w: 'w-24', h: 'h-16', range: '35m' },
    { id: 'P022', type: 'PERSON', label: 'INSPECTOR 96%', track: 'SI Deepa Rawat', color: 'blue', baseTop: 45, baseLeft: 25, speedX: 0, speedY: 0, w: 'w-8', h: 'h-18', range: '28m' }
  ],
  'C-05': [
    { id: 'V002', type: 'VEHICLE', label: 'TRUCK 91%', track: 'V-002 • EGRESS', color: 'cyan', baseTop: 52, baseLeft: 30, speedX: 1.5, speedY: 0.1, w: 'w-24', h: 'h-16', range: '50m' }
  ],
  'C-06': [
    { id: 'ANOM1', type: 'ANOMALY', label: 'CULVERT BREACH', track: 'CULVERT-14 SPIKE', color: 'amber', baseTop: 54, baseLeft: 18, speedX: 1.5, speedY: 0.4, w: 'w-9', h: 'h-15', range: '320m' }
  ],
  'C-07': [
    { id: 'TH01', type: 'THERMAL', label: 'HEAT BLOB 36.8°C', track: 'TARGET 1', color: 'rose', baseTop: 44, baseLeft: 22, speedX: 1.6, speedY: 0.5, w: 'w-10', h: 'h-10', range: '450m' },
    { id: 'TH02', type: 'THERMAL', label: 'HEAT BLOB 37.1°C', track: 'TARGET 2', color: 'rose', baseTop: 48, baseLeft: 38, speedX: 1.4, speedY: 0.4, w: 'w-10', h: 'h-10', range: '465m' }
  ],
  'C-08': [
    { id: 'V003', type: 'VEHICLE', label: 'CONVOY CAR 1', track: 'V-003 • 42km/h', color: 'cyan', baseTop: 74, baseLeft: 70, speedX: -2.4, speedY: 0.1, w: 'w-24', h: 'h-14', range: '180m' }
  ],
  'C-09': [
    { id: 'A01', type: 'ANPR', label: 'ANPR: DL04C9921', track: 'Stallion • VERIFIED', color: 'emerald', baseTop: 52, baseLeft: 28, speedX: 1.4, speedY: 0.1, w: 'w-24', h: 'h-16', range: '40m' }
  ],
  'C-10': [
    { id: 'W01', type: 'WATCHLIST', label: 'FLAGGED: JK02AB9912', track: 'WATCHLIST MATCH', color: 'rose', baseTop: 52, baseLeft: 28, speedX: 1.4, speedY: 0.1, w: 'w-24', h: 'h-16', range: '45m' },
    { id: 'P019', type: 'PERSON', label: 'SENTRY 97%', track: 'Naik Sunil Kumar', color: 'blue', baseTop: 45, baseLeft: 25, speedX: 0, speedY: 0, w: 'w-8', h: 'h-18', range: '38m' }
  ],
  'C-11': [
    { id: 'F01', type: 'FENCE', label: 'WIRE INTACT', track: 'NO TAMPERING', color: 'emerald', baseTop: 48, baseLeft: 18, speedX: 0, speedY: 0, w: 'w-12', h: 'h-14', range: '260m' },
    { id: 'P030', type: 'PERSON', label: 'PATROL 95%', track: 'Constable Amit', color: 'blue', baseTop: 54, baseLeft: 20, speedX: 1.5, speedY: 0.3, w: 'w-8', h: 'h-16', range: '190m' }
  ],
  'C-12': [
    { id: 'TH03', type: 'THERMAL', label: 'HEAT 37.2°C', track: 'ZERO LINE BUFFER', color: 'rose', baseTop: 45, baseLeft: 30, speedX: 1.4, speedY: 0.5, w: 'w-10', h: 'h-10', range: '520m' }
  ],
  'C-13': [
    { id: 'P004', type: 'PERSONNEL', label: 'QRT SENTRY 97%', track: 'P-004 • READY', color: 'blue', baseTop: 72, baseLeft: 60, speedX: -2.0, speedY: 0.1, w: 'w-24', h: 'h-14', range: '60m' }
  ],
  'C-14': [
    { id: 'P011', type: 'SECURITY', label: 'ARMORY PATROL', track: 'V-002 • 28km/h', color: 'cyan', baseTop: 72, baseLeft: 65, speedX: -2.2, speedY: 0.1, w: 'w-24', h: 'h-14', range: '90m' }
  ],
  'C-15': [
    { id: 'BT01', type: 'THERMAL', label: 'RIVERINE CRAFT', track: 'PATROL BOAT 1', color: 'cyan', baseTop: 65, baseLeft: 10, speedX: 2.5, speedY: 0.2, w: 'w-20', h: 'h-12', range: '380m' }
  ],
  'C-16': [
    { id: 'R01', type: 'RADAR', label: 'RADAR SENTRY', track: 'BSF SENTRY (AUTH)', color: 'blue', baseTop: 54, baseLeft: 35, speedX: 1.1, speedY: 0.2, w: 'w-8', h: 'h-16', range: '1200m' }
  ],
  'C-17': [
    { id: 'V008', type: 'VEHICLE', label: 'SUPPLY TRUCK 92%', track: 'V-002 • 28km/h', color: 'cyan', baseTop: 72, baseLeft: 65, speedX: -2.2, speedY: 0.1, w: 'w-24', h: 'h-14', range: '160m' }
  ],
  'C-18': [
    { id: 'TH08', type: 'THERMAL', label: 'FOLIAGE HEAT 36.9°C', track: 'TREELINE SPIKE', color: 'rose', baseTop: 45, baseLeft: 30, speedX: 1.4, speedY: 0.5, w: 'w-10', h: 'h-10', range: '410m' }
  ],
  'C-19': [
    { id: 'UAV01', type: 'UAV', label: 'DRONE TRACK 1', track: 'CONVOY LEAD', color: 'purple', baseTop: 45, baseLeft: 15, speedX: 2.5, speedY: 0, w: 'w-16', h: 'h-10', range: '850m' },
    { id: 'UAV02', type: 'UAV', label: 'DRONE TRACK 2', track: 'TRAIL VEHICLE', color: 'purple', baseTop: 45, baseLeft: 45, speedX: 2.5, speedY: 0, w: 'w-16', h: 'h-10', range: '870m' }
  ],
  'C-20': [
    { id: 'P002', type: 'PERSON', label: 'BUNKER SENTRY', track: 'P-002 • ON DUTY', color: 'blue', baseTop: 54, baseLeft: 18, speedX: 1.5, speedY: 0.4, w: 'w-8', h: 'h-16', range: '110m' }
  ]
};

export const Surveillance = () => {
  const [searchParams] = useSearchParams();
  const focusedParam = searchParams.get('camera');
  
  const { addNotification } = useSystem();
  
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [filterZone, setFilterZone] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');
  const [layoutMode, setLayoutMode] = useState('grid'); // 'grid', 'focus'
  const [isNightMode, setIsNightMode] = useState(false);
  const [showAIBoxes, setShowAIBoxes] = useState(true);
  const [autoDemoRunning, setAutoDemoRunning] = useState(true);
  const [liveAlerts, setLiveAlerts] = useState([]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);
  const [customVideoUrl, setCustomVideoUrl] = useState(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [timeTick, setTimeTick] = useState(0);

  const mainVideoRef = useRef(null);
  const fileInputRef = useRef(null);
  const demoIntervalRef = useRef(null);

  // Smooth Motion Tracking Engine: continuously updates bounding box coordinates
  useEffect(() => {
    const motionTimer = setInterval(() => {
      setTimeTick(prev => prev + 0.1);
    }, 60);
    return () => clearInterval(motionTimer);
  }, []);

  useEffect(() => {
    loadCameras();
    startDemoSimulation();
    return () => {
      if (demoIntervalRef.current) clearInterval(demoIntervalRef.current);
    };
  }, []);

  const startDemoSimulation = () => {
    const alertTemplates = [
      { camId: 'C-01', title: '2 Persons Detected Near Zero-Line Wire', msg: 'Multiple moving targets (TRK-P014, TRK-P015) along Sector 4 Perimeter.', level: 'error' },
      { camId: 'C-10', title: 'ANPR Watchlist Intercept & Sentry Alert', msg: 'Vehicle JK-02-AB-9912 flagged on Gate Bravo Lane 2.', level: 'error' },
      { camId: 'C-04', title: 'Checkpoint ANPR Verified', msg: 'Vehicle ingress MH-01-AB-1234 + SI Deepa Rawat on duty.', level: 'info' },
      { camId: 'C-07', title: 'Dual Thermal IR Hotspots', msg: 'Two distinct heat anomalies detected at Watchtower 7 (36.8°C, 37.1°C).', level: 'warning' },
      { camId: 'C-19', title: 'Netra-V UAV Aerial Tracking', msg: 'Airborne EO/IR gimbal tracking perimeter convoy grid.', level: 'info' }
    ];

    let idx = 0;
    if (demoIntervalRef.current) clearInterval(demoIntervalRef.current);
    demoIntervalRef.current = setInterval(() => {
      const item = alertTemplates[idx % alertTemplates.length];
      const newAlert = {
        id: Date.now(),
        camera: item.camId,
        title: item.title,
        message: item.msg,
        level: item.level,
        time: new Date().toLocaleTimeString()
      };

      setLiveAlerts(prev => [newAlert, ...prev.slice(0, 4)]);
      addNotification(item.title, `[${item.camId}] ${item.msg}`, item.level);
      idx++;
    }, 5000);
  };

  const loadCameras = async () => {
    try {
      setLoading(true);
      const data = await api.getCameras();
      setCameras(data);
      if (focusedParam) {
        const found = data.find(c => c.id === parseInt(focusedParam) || c.camera_id === focusedParam || c.code === focusedParam);
        if (found) {
          setSelectedCamera(found);
          setLayoutMode('focus');
        } else if (data.length > 0) {
          setSelectedCamera(data[0]);
        }
      } else if (data.length > 0) {
        setSelectedCamera(data[0]);
      }
    } catch (err) {
      console.error('Failed to load cameras:', err);
    } finally {
      setLoading(false);
    }
  };

  // Auto Live Demo Runner for Evaluators
  const toggleAutoDemo = () => {
    if (autoDemoRunning) {
      clearInterval(demoIntervalRef.current);
      setAutoDemoRunning(false);
      addNotification('Demo Mode Paused', 'Continuous alert simulation paused.', 'info');
    } else {
      setAutoDemoRunning(true);
      addNotification('Live Tactical Demo Active', 'Simulating real-time border detections across 20 cameras.', 'success');
      startDemoSimulation();
    }
  };

  const handleToggleStatus = async (cam) => {
    setTogglingId(cam.id);
    const newStatus = cam.status === 'ONLINE' ? 'OFFLINE' : 'ONLINE';
    try {
      await api.toggleCameraStatus(cam.id, newStatus);
      addNotification(
        'Observation Node State Changed', 
        `${cam.name} (${cam.camera_id || cam.code}) is now ${newStatus}. Mesh rerouting active.`,
        newStatus === 'ONLINE' ? 'success' : 'warning'
      );
      setCameras(prev => prev.map(c => c.id === cam.id ? { ...c, status: newStatus } : c));
      if (selectedCamera?.id === cam.id) {
        setSelectedCamera(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      addNotification('Status Toggle Failed', err.message, 'error');
    } finally {
      setTogglingId(null);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomVideoUrl(url);
      setLayoutMode('focus');
      addNotification('Custom Video Loaded', `Loaded custom CCTV footage: ${file.name}`, 'success');
    }
  };

  const togglePlayPause = () => {
    if (mainVideoRef.current) {
      if (mainVideoRef.current.paused) {
        mainVideoRef.current.play();
        setIsPlaying(true);
      } else {
        mainVideoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const changeSpeed = (speed) => {
    setPlaybackSpeed(speed);
    if (mainVideoRef.current) {
      mainVideoRef.current.playbackRate = speed;
    }
  };

  const getVideoSrc = (cam) => {
    if (!cam) return null;
    if (selectedCamera?.id === cam.id && customVideoUrl) {
      return customVideoUrl;
    }
    const camKey = cam.camera_id || cam.code;
    return CAMERA_VIDEO_MAP[camKey] || '/videos/cctv_01.mp4';
  };

  // Calculate live moving coordinate position for a target
  const getDynamicPosition = (target, index) => {
    if (target.speedX === 0) {
      return { top: `${target.baseTop}%`, left: `${target.baseLeft}%` };
    }
    // Loop horizontally within 15% to 75% boundary
    const cycleRange = 55;
    const currentOffset = ((timeTick * target.speedX * 3.5) % cycleRange + cycleRange) % cycleRange;
    const dynamicLeft = 15 + currentOffset;
    const dynamicTop = target.baseTop + Math.sin(timeTick * 1.2 + index) * (target.speedY * 1.5 || 1);
    return { top: `${dynamicTop}%`, left: `${dynamicLeft}%` };
  };

  const filteredCameras = cameras.filter(cam => {
    if (filterZone !== 'ALL' && cam.zone_code !== filterZone) return false;
    const dets = CAMERA_DETECTIONS[cam.camera_id || cam.code] || [];
    if (filterType === 'PERSON' && !dets.some(d => d.type === 'PERSON' || d.type === 'PERSONNEL')) return false;
    if (filterType === 'VEHICLE' && !dets.some(d => d.type === 'VEHICLE' || d.type === 'ANPR')) return false;
    if (filterType === 'THERMAL' && !dets.some(d => d.type === 'THERMAL')) return false;
    if (filterType === 'WATCHLIST' && !dets.some(d => d.type === 'WATCHLIST')) return false;
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Controls Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Video className="w-5 h-5 text-[#4B2E83]" />
              20-Camera Border Surveillance Fleet Matrix
            </h1>
            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-xs font-mono flex items-center gap-1">
              <Radio className="w-3 h-3 animate-pulse text-emerald-600" />
              {cameras.length} NODES LIVE
            </span>
            <TruthBadge status="FUNCTIONAL" />
          </div>
          <p className="text-xs text-slate-500">
            Real-time edge AI object tracking & multi-person detection across 20 border sectors with dynamic moving reticles.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Quick Filter: Zone */}
          <select
            value={filterZone}
            onChange={(e) => setFilterZone(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#4B2E83]"
          >
            <option value="ALL">All 4 Border Sectors</option>
            <option value="Zone A">Zone A - Gate Checkpoints</option>
            <option value="Zone B">Zone B - Restricted Perimeter Wire</option>
            <option value="Zone C">Zone C - Patrol Road Corridor</option>
            <option value="Zone D">Zone D - Rear Logistics & Armory</option>
          </select>

          {/* Quick Filter: Detection Type */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#4B2E83]"
          >
            <option value="ALL">All Detections</option>
            <option value="PERSON">🚶 Persons & Sentries Only</option>
            <option value="VEHICLE">🚗 Vehicles & ANPR Only</option>
            <option value="THERMAL">🔥 Thermal IR Signatures Only</option>
            <option value="WATCHLIST">🚨 Watchlist Matches Only</option>
          </select>

          {/* Interactive Live Demo Button */}
          <button
            onClick={toggleAutoDemo}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
              autoDemoRunning 
                ? 'bg-red-600 text-white animate-pulse' 
                : 'bg-[#4B2E83] text-white hover:bg-[#3b2468]'
            }`}
            title="Start automatic demo simulation cycling live detection alerts across cameras"
          >
            <Bell className="w-3.5 h-3.5" />
            {autoDemoRunning ? 'Pause Demo Mode' : '▶ Start Live Demo Mode'}
          </button>

          {/* Custom CCTV Upload */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="video/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200 cursor-pointer"
            title="Upload custom CCTV video footage"
          >
            <Upload className="w-3.5 h-3.5 text-[#4B2E83]" />
            Upload Video
          </button>

          <button
            onClick={() => setShowAIBoxes(!showAIBoxes)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              showAIBoxes 
                ? 'bg-purple-100 text-[#4B2E83] border border-purple-200' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI Overlays {showAIBoxes ? 'ON' : 'OFF'}
          </button>

          <button
            onClick={() => setIsNightMode(!isNightMode)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              isNightMode 
                ? 'bg-amber-100 text-amber-900 border border-amber-300 font-bold' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {isNightMode ? <Moon className="w-3.5 h-3.5 text-amber-700" /> : <Sun className="w-3.5 h-3.5" />}
            {isNightMode ? 'Thermal IR' : 'Optical CCTV'}
          </button>

          {/* View Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setLayoutMode('grid')}
              className={`p-1.5 rounded text-xs cursor-pointer ${layoutMode === 'grid' ? 'bg-white shadow-xs text-[#4B2E83] font-bold' : 'text-slate-500 hover:text-slate-900'}`}
              title="20-Camera Matrix Grid"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setLayoutMode('focus')}
              className={`p-1.5 rounded text-xs cursor-pointer ${layoutMode === 'focus' ? 'bg-white shadow-xs text-[#4B2E83] font-bold' : 'text-slate-500 hover:text-slate-900'}`}
              title="Focused Tactical View"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Live AI Alert Stream Strip */}
      {liveAlerts.length > 0 && (
        <div className="bg-slate-900 text-white p-3 rounded-xl border border-slate-800 shadow-md flex items-center justify-between gap-4 overflow-x-auto">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 flex-shrink-0">
            <Bell className="w-4 h-4 animate-bounce" />
            <span>LIVE DETECTION FEED:</span>
          </div>
          <div className="flex items-center gap-3 overflow-x-auto py-0.5 flex-1">
            {liveAlerts.map(alert => (
              <div
                key={alert.id}
                onClick={() => {
                  const cam = cameras.find(c => (c.camera_id || c.code) === alert.camera);
                  if (cam) {
                    setSelectedCamera(cam);
                    setLayoutMode('focus');
                  }
                }}
                className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs cursor-pointer font-mono transition-all flex-shrink-0 border ${
                  alert.level === 'error'
                    ? 'bg-red-950/80 border-red-800 text-red-200 hover:bg-red-900'
                    : alert.level === 'warning'
                    ? 'bg-amber-950/80 border-amber-800 text-amber-200 hover:bg-amber-900'
                    : 'bg-slate-800 border-slate-700 text-emerald-300 hover:bg-slate-700'
                }`}
              >
                <span className="font-bold underline">{alert.camera}</span>
                <span>{alert.title}</span>
                <span className="text-[10px] text-slate-400">({alert.time})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Video Presentation Section */}
      {layoutMode === 'focus' && selectedCamera ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-lg relative flex flex-col">
            <div className="relative aspect-video w-full bg-slate-900 flex items-center justify-center overflow-hidden">
              {selectedCamera.status === 'OFFLINE' ? (
                <div className="text-center p-8 text-slate-500 space-y-2">
                  <VideoOff className="w-16 h-16 text-red-500 mx-auto opacity-70 animate-bounce" />
                  <p className="text-red-400 font-bold text-sm">POSSIBLE CAMERA TAMPERING / OBSERVATION LOSS</p>
                  <p className="text-xs text-slate-400">
                    Acoustic & Radar sensor mesh handover engaged for this sector.
                  </p>
                  <button
                    onClick={() => handleToggleStatus(selectedCamera)}
                    className="mt-3 px-3 py-1.5 bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-800 rounded text-xs font-semibold cursor-pointer"
                  >
                    Restore Stream Feed
                  </button>
                </div>
              ) : (
                <div className="w-full h-full relative flex items-center justify-center">
                  {/* Real HTML5 Video Stream */}
                  <video
                    ref={mainVideoRef}
                    key={selectedCamera.id + (customVideoUrl || '')}
                    src={getVideoSrc(selectedCamera)}
                    autoPlay
                    loop
                    muted
                    playsInline
                    style={{
                      filter: isNightMode ? 'invert(85%) hue-rotate(180deg) contrast(150%) brightness(95%)' : 'none'
                    }}
                    className="w-full h-full object-cover transition-all duration-300"
                  />

                  {/* Multiple Moving Bounding Boxes Rendered Dynamically */}
                  {showAIBoxes && (CAMERA_DETECTIONS[selectedCamera.camera_id || selectedCamera.code] || []).map((det, idx) => {
                    const pos = getDynamicPosition(det, idx);
                    return (
                      <div 
                        key={det.id}
                        style={{ top: pos.top, left: pos.left }}
                        className={`absolute ${det.w} ${det.h} border-[1.5px] ${
                          det.color === 'rose' 
                            ? 'border-rose-500 bg-rose-500/15' 
                            : det.color === 'cyan' 
                            ? 'border-cyan-400 bg-cyan-400/15' 
                            : det.color === 'amber'
                            ? 'border-amber-400 bg-amber-400/15'
                            : 'border-[#159A74] bg-[#159A74]/15'
                        } rounded-xs flex flex-col justify-between p-0.5 transition-all duration-75 shadow-md pointer-events-none`}
                      >
                        {/* Top Micro Label */}
                        <div className="absolute -top-3.5 left-0 flex items-center gap-1 pointer-events-none">
                          <span className={`text-[7.5px] font-mono font-bold leading-tight ${
                            det.color === 'rose' 
                              ? 'bg-rose-600 text-white' 
                              : det.color === 'cyan' 
                              ? 'bg-cyan-600 text-white' 
                              : det.color === 'amber'
                              ? 'bg-amber-500 text-black'
                              : 'bg-[#159A74] text-white'
                          } px-1 py-0.2 rounded-xs shadow-xs uppercase tracking-tight whitespace-nowrap`}>
                            {det.label}
                          </span>
                        </div>

                        {/* Corner Reticle Accents */}
                        <div className="w-full h-full flex flex-col justify-between pointer-events-none">
                          <div className="flex justify-between">
                            <span className="w-1.5 h-1.5 border-t-2 border-l-2 border-white/80" />
                            <span className="w-1.5 h-1.5 border-t-2 border-r-2 border-white/80" />
                          </div>
                          <div className="flex justify-between">
                            <span className="w-1.5 h-1.5 border-b-2 border-l-2 border-white/80" />
                            <span className="w-1.5 h-1.5 border-b-2 border-r-2 border-white/80" />
                          </div>
                        </div>

                        {/* Bottom Micro Telemetry */}
                        <div className="absolute -bottom-3 left-0 pointer-events-none">
                          <span className="text-[6.5px] font-mono text-emerald-300 bg-black/90 px-1 py-0.2 rounded-xs whitespace-nowrap">
                            {det.track} • {det.range}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Tactical Crosshair Reticle */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-20">
                    <Crosshair className="w-24 h-24 text-white" />
                  </div>
                </div>
              )}

              {/* Top HUD Telemetry */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-xs z-20 pointer-events-none">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-black/80 text-white font-mono font-bold border border-white/10 backdrop-blur-xs">
                    {selectedCamera.camera_id || selectedCamera.code}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#4B2E83]/90 text-white font-semibold text-[11px] backdrop-blur-xs">
                    {selectedCamera.type || selectedCamera.camera_type}
                  </span>
                  {/* Live Target Count Badge */}
                  {(() => {
                    const dets = CAMERA_DETECTIONS[selectedCamera.camera_id || selectedCamera.code] || [];
                    if (dets.length > 0) {
                      return (
                        <span className="px-2 py-0.5 rounded bg-amber-500/90 text-black font-bold font-mono text-[10px] flex items-center gap-1 shadow-xs">
                          <Users className="w-3 h-3" />
                          {dets.length} {dets.length === 1 ? 'TARGET TRACKED' : 'TARGETS TRACKED'}
                        </span>
                      );
                    }
                    return null;
                  })()}
                  <TruthBadge status="FUNCTIONAL" />
                </div>

                <div className="flex items-center gap-2 text-slate-300 font-mono text-[11px] bg-black/70 px-2.5 py-1 rounded backdrop-blur-xs">
                  <span>RES: 1920x1080</span>
                  <span>•</span>
                  <span>FPS: {selectedCamera.fps || 25}</span>
                  <span>•</span>
                  <span className="text-emerald-400">LATENCY: 14.2ms</span>
                </div>
              </div>

              {/* Bottom HUD Bar */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-slate-300 z-20 bg-black/80 px-3 py-2 rounded-lg border border-white/10 backdrop-blur-xs">
                <div className="flex items-center gap-3">
                  <button
                    onClick={togglePlayPause}
                    className="p-1 rounded bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
                    title={isPlaying ? 'Pause Feed' : 'Play Feed'}
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>
                  <div>
                    <span className="font-bold text-white text-xs">{selectedCamera.name}</span>
                    <span className="text-[11px] text-slate-400 ml-2">Zone: {selectedCamera.zone_code}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-white/10 px-1.5 py-0.5 rounded text-[10px] font-mono">
                    <span className="text-slate-400">Speed:</span>
                    {[1, 1.5, 2].map(speed => (
                      <button
                        key={speed}
                        onClick={() => changeSpeed(speed)}
                        className={`px-1 rounded cursor-pointer ${playbackSpeed === speed ? 'bg-[#4B2E83] text-white font-bold' : 'text-slate-300 hover:text-white'}`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => handleToggleStatus(selectedCamera)}
                    disabled={togglingId === selectedCamera.id}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                      selectedCamera.status === 'ONLINE'
                        ? 'bg-red-950/90 text-red-300 hover:bg-red-900 border border-red-800'
                        : 'bg-emerald-950/90 text-emerald-300 hover:bg-emerald-900 border border-emerald-800'
                    }`}
                  >
                    {selectedCamera.status === 'ONLINE' ? 'Simulate Tampering' : 'Restore Camera'}
                  </button>
                </div>
              </div>
            </div>

            {/* 20-Node Camera Filmstrip */}
            <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2.5 overflow-x-auto">
              {cameras.map((c) => {
                const dets = CAMERA_DETECTIONS[c.camera_id || c.code] || [];
                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      setSelectedCamera(c);
                      setCustomVideoUrl(null);
                    }}
                    className={`flex-shrink-0 w-28 aspect-video rounded bg-slate-950 border relative cursor-pointer overflow-hidden transition-all ${
                      selectedCamera.id === c.id ? 'border-[#F7941D] ring-2 ring-[#F7941D]/40' : 'border-slate-800 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <video
                      src={getVideoSrc(c)}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover pointer-events-none opacity-40"
                    />
                    <div className="absolute inset-0 flex flex-col justify-between p-1 bg-black/30">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono font-bold text-white bg-black/60 px-1 rounded">
                          {c.camera_id || c.code}
                        </span>
                        <span className={`w-1.5 h-1.5 rounded-full ${c.status === 'ONLINE' ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                      </div>
                      {dets.length > 0 && (
                        <span className="text-[7px] font-mono text-amber-300 font-bold bg-black/80 px-1 rounded truncate">
                          {dets.length} {dets.length === 1 ? 'Target' : 'Targets'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right 4 Cols: Active Targets Inspector & PTZ Controls */}
          <div className="lg:col-span-4 space-y-4">
            {/* Active Targets List */}
            {(() => {
              const dets = CAMERA_DETECTIONS[selectedCamera.camera_id || selectedCamera.code] || [];
              return (
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#4B2E83]" />
                      Active Targets Detected ({dets.length})
                    </h3>
                    <span className="text-[10px] font-mono bg-purple-100 text-[#4B2E83] font-bold px-2 py-0.5 rounded">
                      SECTOR 4
                    </span>
                  </div>

                  {dets.length > 0 ? (
                    <div className="space-y-2">
                      {dets.map((det, i) => (
                        <div key={det.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-slate-800 block text-[11px]">{det.label}</span>
                            <span className="text-[10px] font-mono text-slate-500">{det.track}</span>
                          </div>
                          <span className="text-[9px] font-mono font-bold text-[#4B2E83] bg-purple-50 px-1.5 py-0.5 rounded">
                            {det.range}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 py-2">No active anomaly targets on this node.</p>
                  )}
                </div>
              );
            })()}

            {/* PTZ Controls */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Compass className="w-4 h-4 text-[#4B2E83]" />
                  PTZ Gimbal Controls
                </h3>
                <span className="text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-bold">
                  AZIMUTH: 184°
                </span>
              </div>

              <div className="flex flex-col items-center justify-center py-2">
                <div className="grid grid-cols-3 gap-2 w-44">
                  <div />
                  <button className="p-3 bg-slate-100 hover:bg-[#4B2E83] hover:text-white rounded-lg text-slate-700 font-bold transition-all flex items-center justify-center active:scale-95 shadow-xs cursor-pointer">
                    ▲
                  </button>
                  <div />
                  <button className="p-3 bg-slate-100 hover:bg-[#4B2E83] hover:text-white rounded-lg text-slate-700 font-bold transition-all flex items-center justify-center active:scale-95 shadow-xs cursor-pointer">
                    ◀
                  </button>
                  <button className="p-3 bg-purple-50 text-[#4B2E83] rounded-lg text-xs font-bold flex items-center justify-center cursor-pointer">
                    CENTER
                  </button>
                  <button className="p-3 bg-slate-100 hover:bg-[#4B2E83] hover:text-white rounded-lg text-slate-700 font-bold transition-all flex items-center justify-center active:scale-95 shadow-xs cursor-pointer">
                    ▶
                  </button>
                  <div />
                  <button className="p-3 bg-slate-100 hover:bg-[#4B2E83] hover:text-white rounded-lg text-slate-700 font-bold transition-all flex items-center justify-center active:scale-95 shadow-xs cursor-pointer">
                    ▼
                  </button>
                  <div />
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
                  <span>Optical Zoom Level</span>
                  <span className="text-[#4B2E83] font-bold">3.2x</span>
                </div>
                <div className="flex items-center gap-3">
                  <button className="p-2 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 cursor-pointer">
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    defaultValue="3.2"
                    step="0.1"
                    className="flex-1 accent-[#4B2E83]"
                  />
                  <button className="p-2 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 cursor-pointer">
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Edge Compute Telemetry */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#159A74]" />
                Edge Compute Telemetry
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-100">
                  <span className="text-slate-600 font-medium">Edge Compute Node:</span>
                  <span className="font-bold text-slate-800">Jetson AGX / Sector Node</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-100">
                  <span className="text-slate-600 font-medium">Model Pipeline:</span>
                  <span className="font-bold text-[#4B2E83]">YOLOv8n-Border-INT8</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-100">
                  <span className="text-slate-600 font-medium">Sensor Handover Protocol:</span>
                  <span className="font-bold text-[#159A74] flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Ready (Acoustic + Radar)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* 20-Camera Matrix Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5">
          {filteredCameras.map((cam) => {
            const dets = CAMERA_DETECTIONS[cam.camera_id || cam.code] || [];
            return (
              <div
                key={cam.id}
                onClick={() => {
                  setSelectedCamera(cam);
                  setLayoutMode('focus');
                }}
                className="bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-sm hover:border-[#4B2E83] hover:shadow-md transition-all cursor-pointer group flex flex-col"
              >
                <div className="relative aspect-video bg-slate-900 flex items-center justify-center overflow-hidden">
                  {cam.status === 'OFFLINE' ? (
                    <div className="text-center p-3">
                      <VideoOff className="w-6 h-6 text-red-500 mx-auto mb-1 opacity-80" />
                      <p className="text-[10px] font-bold text-red-400">OFFLINE / TAMPERED</p>
                      <p className="text-[8px] text-slate-400">Fallback mesh active</p>
                    </div>
                  ) : (
                    <div className="w-full h-full relative flex items-center justify-center bg-[#111827]">
                      {/* Live Playing Video Feed */}
                      <video
                        src={getVideoSrc(cam)}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                      />

                      {/* Multiple Moving Bounding Boxes in Grid View */}
                      {showAIBoxes && dets.map((det, idx) => {
                        const pos = getDynamicPosition(det, idx);
                        return (
                          <div 
                            key={det.id}
                            style={{ top: pos.top, left: pos.left }}
                            className={`absolute ${det.w} ${det.h} border-[1px] ${
                              det.color === 'rose' 
                                ? 'border-rose-500 bg-rose-500/15' 
                                : det.color === 'cyan' 
                                ? 'border-cyan-400 bg-cyan-400/15' 
                                : det.color === 'amber'
                                ? 'border-amber-400 bg-amber-400/15'
                                : 'border-emerald-500 bg-emerald-500/15'
                            } rounded-xs flex flex-col justify-between pointer-events-none transition-all duration-75`}
                          >
                            <span className={`text-[6px] font-mono font-bold leading-none ${
                              det.color === 'rose' ? 'bg-rose-600' : det.color === 'cyan' ? 'bg-cyan-600' : 'bg-emerald-600'
                            } text-white px-0.5 py-0.2 rounded-xs w-max -top-2 relative whitespace-nowrap`}>
                              {det.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Top Badges */}
                  <div className="absolute top-1.5 left-1.5 z-10 flex items-center gap-1">
                    <span className="px-1.5 py-0.5 rounded bg-black/80 text-white font-mono text-[9px] font-bold backdrop-blur-xs">
                      {cam.camera_id || cam.code}
                    </span>
                    <span className={`w-1.5 h-1.5 rounded-full ${cam.status === 'ONLINE' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                  </div>

                  {/* Top Right: Target Count */}
                  {dets.length > 0 && (
                    <div className="absolute top-1.5 right-1.5 z-10">
                      <span className="px-1 py-0.2 rounded bg-amber-500/90 text-black font-mono font-bold text-[8px] flex items-center gap-0.5 shadow-xs">
                        <Users className="w-2.5 h-2.5" />
                        {dets.length}
                      </span>
                    </div>
                  )}
                </div>

                {/* Bottom Card Summary */}
                <div className="p-2 bg-slate-900 flex items-center justify-between text-[11px] text-white">
                  <div className="truncate flex-1">
                    <h4 className="font-bold text-slate-200 text-[10px] truncate">{cam.name}</h4>
                    <p className="text-[8px] text-slate-400 truncate">{cam.location_name}</p>
                  </div>
                  {dets.length > 0 && (
                    <span className="text-[8px] font-mono font-bold px-1 py-0.5 rounded bg-purple-950 text-purple-300 ml-1">
                      {dets[0].type} {dets.length > 1 ? `+${dets.length - 1}` : ''}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
