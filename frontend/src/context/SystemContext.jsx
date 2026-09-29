import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const SystemContext = createContext(null);

export const SystemProvider = ({ children }) => {
  const [kpis, setKpis] = useState({
    active_incidents: 1,
    critical_incidents: 1,
    total_incidents: 2,
    unverified_persons: 1,
    cameras_online: 6,
    total_cameras: 6,
    sensors_online: 11,
    total_sensors: 11,
    coverage_health_pct: 100.0,
    operational_attention: 'HIGH ATTENTION',
    offline_cameras: [],
  });

  const [capabilities, setCapabilities] = useState(null);
  const [evaluationMetrics, setEvaluationMetrics] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [operationalMode, setOperationalMode] = useState('NORMAL'); // NORMAL, LOW_BANDWIDTH, OFFLINE
  const [isDemoRunning, setIsDemoRunning] = useState(false);
  const [activeScenarioStep, setActiveScenarioStep] = useState(null);

  const fetchKpisAndIncidents = useCallback(async () => {
    try {
      const [kpiData, incData, capData, metricData] = await Promise.all([
        api.getKpiSummary().catch(() => null),
        api.getIncidents({ limit: 15 }).catch(() => []),
        api.getSystemCapabilities().catch(() => null),
        api.getSystemMetrics().catch(() => null),
      ]);

      if (kpiData) {
        setKpis(kpiData);
      }
      if (incData && Array.isArray(incData)) {
        setIncidents(incData);
      }
      if (capData) {
        setCapabilities(capData);
      }
      if (metricData) {
        setEvaluationMetrics(metricData);
      }
    } catch (err) {
      console.warn('[SystemContext] Background poll error:', err);
    }
  }, []);

  useEffect(() => {
    fetchKpisAndIncidents();
    const interval = setInterval(fetchKpisAndIncidents, 4000);
    return () => clearInterval(interval);
  }, [fetchKpisAndIncidents]);

  const addNotification = (title, message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [{ id, title, message, type, time: new Date() }, ...prev.slice(0, 9)]);
  };

  const clearNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <SystemContext.Provider value={{
      kpis,
      capabilities,
      evaluationMetrics,
      incidents,
      notifications,
      operationalMode,
      setOperationalMode,
      isDemoRunning,
      setIsDemoRunning,
      activeScenarioStep,
      setActiveScenarioStep,
      refreshData: fetchKpisAndIncidents,
      addNotification,
      clearNotification,
    }}>
      {children}
    </SystemContext.Provider>
  );
};

export const useSystem = () => useContext(SystemContext);
