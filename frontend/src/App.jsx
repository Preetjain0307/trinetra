import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SystemProvider } from './context/SystemContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';

// Pages
import { CommandCenter } from './pages/CommandCenter';
import { Surveillance } from './pages/Surveillance';
import { IncidentCenter } from './pages/IncidentCenter';
import { BorderTwin } from './pages/BorderTwin';
import { Investigation } from './pages/Investigation';
import { Personnel } from './pages/Personnel';
import { Vehicles } from './pages/Vehicles';
import { Sensors } from './pages/Sensors';
import { Analytics } from './pages/Analytics';
import { SecurityCenter } from './pages/SecurityCenter';
import { Settings } from './pages/Settings';
import { DemoScenarios } from './pages/DemoScenarios';

function App() {
  return (
    <AuthProvider>
      <SystemProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-[#F8FAFC] flex text-slate-900 antialiased">
            {/* Sidebar Navigation */}
            <Sidebar />

            {/* Main Application Container */}
            <div className="flex-1 flex flex-col pl-64 min-w-0">
              {/* Top Operational Header */}
              <Header />

              {/* Main Content Viewport */}
              <main className="flex-1 pt-20 px-8 max-w-7xl w-full mx-auto">
                <Routes>
                  <Route path="/" element={<CommandCenter />} />
                  <Route path="/surveillance" element={<Surveillance />} />
                  <Route path="/incidents" element={<IncidentCenter />} />
                  <Route path="/border-twin" element={<BorderTwin />} />
                  <Route path="/investigation" element={<Investigation />} />
                  <Route path="/personnel" element={<Personnel />} />
                  <Route path="/vehicles" element={<Vehicles />} />
                  <Route path="/sensors" element={<Sensors />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/security" element={<SecurityCenter />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/demo-scenarios" element={<DemoScenarios />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
            </div>
          </div>
        </BrowserRouter>
      </SystemProvider>
    </AuthProvider>
  );
}

export default App;
