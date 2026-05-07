/**
 * components/layout/AppShell.jsx
 * Authenticated layout wrapper — sidebar, topbar, main content, footer.
 * Handles desktop/mobile switching and unknown-route 404 detection.
 */
import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Sidebar       from './Sidebar';
import MobileDrawer  from './MobileDrawer';
import TopBar        from './TopBar';
import { useIsMobile } from '../../hooks/useIsMobile';
import { getUser }     from '../../utils/auth';
import { SHELL_PATHS } from '../../constants/navigation';

// Page components
import Dashboard           from '../../Dashboard/Dashboard';
import DriverList          from '../DriverList';
import TripList            from '../TripList';
import ViolationList       from '../ViolationList';
import MonitoringControl   from '../MonitoringControl';
import UsersManagement     from '../UsersManagement';
import DriversManagement   from '../Drivers/DriversManagement';
import VehiclesManagement  from '../Vehicles/VehiclesManagement';
import TripsManagement     from '../Trips/TripsManagement';
import IncidentsManagement from '../Incidents/IncidentsManagement';
//import AlertsManagement    from '../Alerts/AlertsManagement';
import AlertsManagement from '../Alerts/AlertsManagement';
import IncidentReports     from '../Incidents/IncidentReports';
import { NotFoundPage }    from '../Errors/ErrorPages';

/** Global styles injected once at the shell level */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #f8fafc; }
    button { font-family: inherit; }
    button:focus { outline: none; }
    button:focus-visible { outline: 2px solid #84CC16; outline-offset: 2px; }
    nav::-webkit-scrollbar { width: 3px; }
    nav::-webkit-scrollbar-track { background: transparent; }
    nav::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 2px; }
    ::-webkit-scrollbar { width: 5px; height: 5px; }
    ::-webkit-scrollbar-track { background: #f8fafc; }
    ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: #84CC16; }
    @keyframes drawerSlideIn {
      from { transform: translateX(-100%); opacity: 0.6; }
      to   { transform: translateX(0);     opacity: 1;   }
    }
    @keyframes drawerFadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
  `}</style>
);

const AppShell = ({ onLogout }) => {
  const [collapsed,   setCollapsed]   = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [currentUser, setCurrentUser] = useState(getUser());
  const isMobile = useIsMobile();
  const location = useLocation();

  // Close mobile drawer on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  // Re-hydrate user from localStorage (handles post-login state)
  useEffect(() => {
    const stored = getUser();
    if (stored) setCurrentUser(stored);
  }, []);

  // Guard: unknown paths inside the authenticated shell → full-screen 404
  const isKnownPath = SHELL_PATHS.some(p =>
    p === '/' ? location.pathname === '/' : location.pathname.startsWith(p)
  );
  if (!isKnownPath) return <NotFoundPage />;

  return (
    <div style={{
      display: 'flex', minHeight: '100vh', background: '#f8fafc',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      <GlobalStyles />

      {/* Desktop sidebar */}
      {!isMobile && (
        <Sidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          currentUser={currentUser}
          onLogout={onLogout}
        />
      )}

      {/* Mobile overlay drawer */}
      {isMobile && (
        <MobileDrawer
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          currentUser={currentUser}
          onLogout={onLogout}
        />
      )}

      {/* Main content column */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <TopBar isMobile={isMobile} onMenuClick={() => setMobileOpen(true)} />

        <main style={{ flex: 1, overflowY: 'auto' }}>
          <Routes>
            <Route path="/"                     element={<Dashboard />} />
            <Route path="/drivers"              element={<DriverList />} />
            <Route path="/drivers-management"   element={<DriversManagement />} />
            <Route path="/vehicles-management"  element={<VehiclesManagement />} />
            <Route path="/trips-management"     element={<TripsManagement />} />
            <Route path="/incidents-management" element={<IncidentsManagement />} />
            <Route path="/reports"              element={<IncidentReports />} />
            <Route path="/alerts-management"    element={<AlertsManagement />} />
            <Route path="/users"                element={<UsersManagement />} />
            <Route path="/trips"                element={<TripList />} />
            <Route path="/violations"           element={<ViolationList />} />
            <Route path="/monitoring"           element={<MonitoringControl />} />
          </Routes>
        </main>

        <footer style={{
          borderTop: '1px solid #f1f5f9', background: '#fff',
          padding: isMobile ? '10px 16px' : '12px 28px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0, flexWrap: 'wrap', gap: 4,
        }}>
          <p style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>
            © 2026 DriveGuardAI — Professional Driver Monitoring System
          </p>
          {!isMobile && (
            <p style={{ fontSize: 11, color: '#cbd5e1', fontWeight: 500 }}>
              Powered by AI &nbsp;·&nbsp; Real-time Detection &nbsp;·&nbsp; Enterprise Ready
            </p>
          )}
        </footer>
      </div>
    </div>
  );
};

export default AppShell;
