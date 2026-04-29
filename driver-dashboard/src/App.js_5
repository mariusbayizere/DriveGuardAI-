import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router, Routes, Route,
  useLocation, useNavigate, Navigate
} from 'react-router-dom';
import Dashboard from './Dashboard/Dashboard';
import DriverList          from './components/DriverList';
import TripList            from './components/TripList';
import ViolationList       from './components/ViolationList';
import MonitoringControl   from './components/MonitoringControl';
import UsersManagement     from './components/UsersManagement';
import DriversManagement   from './components/Drivers/DriversManagement';
import VehiclesManagement  from './components/Vehicles/VehiclesManagement';
import TripsManagement     from './components/Trips/TripsManagement';
import IncidentsManagement from './components/Incidents/IncidentsManagement';
import AlertsManagement    from './components/Alerts/AlertsManagement';
import IncidentReports     from './components/Incidents/IncidentReports';
import DriveGuardAuth      from './components/Auth/DriveGuardAI_Auth';
import DriverPortal        from './components/Drivers/DriverPortal';
import { NotFoundPage, ServerErrorPage } from './components/Errors/ErrorPages';

const API_BASE = process.env.REACT_APP_API_BASE;

// ── Auth helpers ──────────────────────────────────────────────────────────
const getToken = () => {
  const token = localStorage.getItem('dg_token');
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const isExpired = payload.exp && (Date.now() / 1000) > payload.exp;
    if (isExpired) {
      localStorage.removeItem('dg_token');
      localStorage.removeItem('dg_user');
      return null;
    }
    return token;
  } catch {
    return token;
  }
};

const getUser  = () => {
  try { return JSON.parse(localStorage.getItem('dg_user')); } catch { return null; }
};

// ── All valid paths rendered inside AppShell ──────────────────────────────
const SHELL_PATHS = [
  '/', '/drivers', '/drivers-management', '/vehicles-management',
  '/trips-management', '/incidents-management', '/reports',
  '/alerts-management', '/users', '/trips', '/violations', '/monitoring',
];

// ── SVG Icons ─────────────────────────────────────────────────────────────
const Svg = ({ children, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
    style={{ display: 'block', flexShrink: 0 }}>{children}</svg>
);
const Icons = {
  Dashboard:    () => <Svg><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></Svg>,
  Drivers:      () => <Svg><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></Svg>,
  Vehicles:     () => <Svg><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></Svg>,
  Trips:        () => <Svg><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></Svg>,
  Incidents:    () => <Svg><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></Svg>,
  Alerts:       () => <Svg><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></Svg>,
  Reports:      () => <Svg><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></Svg>,
  Monitoring:   () => <Svg><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2"/></Svg>,
  Users:        () => <Svg><circle cx="12" cy="8" r="4"/><path d="M2 21a10 10 0 0 1 20 0"/></Svg>,
  LogOut:       () => <Svg><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></Svg>,
  ChevronLeft:  () => <Svg size={16}><polyline points="15 18 9 12 15 6"/></Svg>,
  ChevronRight: () => <Svg size={16}><polyline points="9 18 15 12 9 6"/></Svg>,
  Bell:         () => <Svg size={18}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></Svg>,
  Shield:       () => <Svg size={18}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></Svg>,
  Menu:         () => <Svg size={22}><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></Svg>,
  Close:        () => <Svg size={20}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></Svg>,
};

const NAV_ITEMS = [
  { path: '/',                     Icon: Icons.Dashboard,  label: 'Dashboard' },
  { path: '/drivers-management',   Icon: Icons.Drivers,    label: 'Drivers' },
  { path: '/vehicles-management',  Icon: Icons.Vehicles,   label: 'Vehicles' },
  { path: '/trips-management',     Icon: Icons.Trips,      label: 'Trips' },
  { path: '/incidents-management', Icon: Icons.Incidents,  label: 'Incidents' },
  { path: '/alerts-management',    Icon: Icons.Alerts,     label: 'Alerts' },
  { path: '/reports',              Icon: Icons.Reports,    label: 'Reports' },
  { path: '/monitoring',           Icon: Icons.Monitoring, label: 'Live Monitoring' },
  { path: '/users',                Icon: Icons.Users,      label: 'Users' },
];

// ── NavItem ───────────────────────────────────────────────────────────────
const NavItem = ({ item, active, collapsed, onClick }) => {
  const [hovered, setHovered] = useState(false);
  const { Icon, label } = item;
  return (
    <button onClick={onClick} title={collapsed ? label : undefined}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12, width: '100%',
        padding: collapsed ? '11px 0' : '10px 14px',
        justifyContent: collapsed ? 'center' : 'flex-start',
        borderRadius: 10, border: 'none', outline: 'none', cursor: 'pointer', marginBottom: 2,
        background: active ? '#f0fdf4' : hovered ? '#f8fafc' : 'transparent',
        color: active ? '#15803d' : hovered ? '#111827' : '#374151',
        fontWeight: active ? 700 : 500, fontSize: 14.5,
        fontFamily: "'Plus Jakarta Sans',sans-serif",
        transition: 'all 0.15s ease', position: 'relative',
        textAlign: 'left', whiteSpace: 'nowrap', boxShadow: 'none',
      }}>
      {active && !collapsed && (
        <span style={{
          position: 'absolute', left: 0, top: '20%', bottom: '20%',
          width: 3, borderRadius: '0 3px 3px 0', background: '#84CC16',
        }} />
      )}
      <span style={{
        color: active ? '#16a34a' : hovered ? '#374151' : '#64748b',
        display: 'flex', alignItems: 'center',
        marginLeft: active && !collapsed ? 4 : 0, transition: 'color 0.15s',
      }}><Icon /></span>
      {!collapsed && <span>{label}</span>}
    </button>
  );
};

// ── Sidebar (desktop only — hidden on mobile) ─────────────────────────────
const Sidebar = ({ collapsed, setCollapsed, currentUser, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [logoutHover, setLogoutHover] = useState(false);

  const isActive    = (path) => path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
  const displayName = currentUser ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() : 'Admin';
  const rawRole     = currentUser?.userRole || currentUser?.role || 'Fleet Manager';
  const displayRole = rawRole.charAt(0) + rawRole.slice(1).toLowerCase().replace('_', ' ');
  const initials    = displayName.split(' ').map(w => w[0]?.toUpperCase() || '').slice(0, 2).join('');

  return (
    <aside style={{
      width: collapsed ? 72 : 260, height: '100vh', background: '#ffffff',
      borderRight: '1px solid #e8edf2', display: 'flex', flexDirection: 'column',
      transition: 'width 0.25s cubic-bezier(.4,0,.2,1)', overflow: 'hidden',
      flexShrink: 0, position: 'sticky', top: 0, zIndex: 40,
      boxShadow: '2px 0 12px rgba(0,0,0,0.05)',
    }}>
      {/* Logo Row */}
      <div style={{
        height: 64, display: 'flex', alignItems: 'center',
        padding: collapsed ? '0' : '0 18px',
        justifyContent: collapsed ? 'center' : 'space-between',
        borderBottom: '1px solid #f1f5f9', flexShrink: 0, gap: 10,
      }}>
        <div style={{
          width: 38, height: 38, borderRadius: 11, flexShrink: 0,
          background: 'linear-gradient(135deg,#84CC16 0%,#4d7c0f 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', boxShadow: '0 3px 10px rgba(132,204,22,0.35)',
        }}><Icons.Shield /></div>
        {!collapsed && (<>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <p style={{
              fontSize: 16, fontWeight: 800, color: '#0f172a',
              fontFamily: "'Plus Jakarta Sans',sans-serif", lineHeight: 1.2, whiteSpace: 'nowrap',
            }}>DriveGuard<span style={{ color: '#84CC16' }}>AI</span></p>
            <p style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', letterSpacing: '0.9px', textTransform: 'uppercase' }}>
              Fleet Intelligence
            </p>
          </div>
          <button onClick={() => setCollapsed(true)}
            style={{
              background: 'none', border: 'none', outline: 'none', cursor: 'pointer',
              color: '#94a3b8', padding: 6, borderRadius: 7, display: 'flex',
              alignItems: 'center', transition: 'background 0.15s,color 0.15s', flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#475569'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#94a3b8'; }}
            title="Collapse sidebar"><Icons.ChevronLeft /></button>
        </>)}
      </div>

      {/* Nav Links */}
      <nav style={{
        flex: 1, overflowY: 'auto', overflowX: 'hidden',
        padding: collapsed ? '14px 8px' : '14px 12px',
      }}>
        {NAV_ITEMS.map(item => (
          <NavItem key={item.path} item={item} active={isActive(item.path)}
            collapsed={collapsed} onClick={() => navigate(item.path)} />
        ))}
      </nav>

      {/* User Info */}
      {!collapsed && currentUser && (
        <div style={{
          padding: '10px 16px', borderTop: '1px solid #f1f5f9',
          display: 'flex', alignItems: 'center', gap: 10, background: '#fafafa',
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg,#84CC16,#16a34a)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 800, color: '#fff',
          }}>{initials || 'AD'}</div>
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <p style={{
              fontSize: 13, fontWeight: 700, color: '#0f172a',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{displayName}</p>
            <p style={{
              fontSize: 11, color: '#64748b', fontWeight: 500,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{displayRole}</p>
          </div>
        </div>
      )}

      {/* Logout */}
      <div style={{
        padding: collapsed ? '12px 8px' : '10px 12px',
        borderTop: currentUser && !collapsed ? 'none' : '1px solid #f1f5f9', flexShrink: 0,
      }}>
        <button
          onMouseEnter={() => setLogoutHover(true)}
          onMouseLeave={() => setLogoutHover(false)}
          onClick={onLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: 12, width: '100%',
            padding: collapsed ? '11px 0' : '10px 14px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            borderRadius: 10, border: 'none', outline: 'none', cursor: 'pointer',
            background: logoutHover ? '#fff1f2' : 'transparent',
            color: logoutHover ? '#dc2626' : '#64748b',
            fontWeight: 600, fontSize: 14.5,
            fontFamily: "'Plus Jakarta Sans',sans-serif",
            transition: 'all 0.15s ease', boxShadow: 'none', whiteSpace: 'nowrap',
          }}
          title={collapsed ? 'Log out' : undefined}>
          <span style={{
            display: 'flex', alignItems: 'center',
            color: logoutHover ? '#dc2626' : '#94a3b8', transition: 'color 0.15s',
          }}><Icons.LogOut /></span>
          {!collapsed && <span>Log out</span>}
        </button>
      </div>

      {/* Expand button when collapsed */}
      {collapsed && (
        <button onClick={() => setCollapsed(false)} title="Expand sidebar"
          style={{
            width: '100%', padding: '10px 0', background: 'none', border: 'none',
            outline: 'none', borderTop: '1px solid #f1f5f9', cursor: 'pointer',
            color: '#94a3b8', display: 'flex', alignItems: 'center',
            justifyContent: 'center', transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}>
          <Icons.ChevronRight />
        </button>
      )}
    </aside>
  );
};

// ── MobileDrawer — full overlay, slides over content like Image 3 ─────────
const MobileDrawer = ({ open, onClose, currentUser, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive    = (path) => path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
  const displayName = currentUser ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() : 'Admin';
  const rawRole     = currentUser?.userRole || currentUser?.role || 'Fleet Manager';
  const displayRole = rawRole.charAt(0) + rawRole.slice(1).toLowerCase().replace('_', ' ');
  const initials    = displayName.split(' ').map(w => w[0]?.toUpperCase() || '').slice(0, 2).join('');

  const handleNav = (path) => { navigate(path); onClose(); };

  if (!open) return null;

  return (
    <>
      {/* Backdrop — tap to close */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.45)',
          zIndex: 200,
          animation: 'drawerFadeIn 0.25s ease both',
        }}
      />

      {/* Drawer panel — slides in from left over content */}
      <div style={{
        position: 'fixed', top: 0, left: 0, bottom: 0,
        width: 270,
        background: '#fff',
        zIndex: 201,
        display: 'flex', flexDirection: 'column',
        boxShadow: '4px 0 32px rgba(0,0,0,0.18)',
        animation: 'drawerSlideIn 0.28s cubic-bezier(0.4,0,0.2,1) both',
      }}>

        {/* Header */}
        <div style={{
          height: 64, display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '0 16px 0 18px',
          borderBottom: '1px solid #f1f5f9', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: 'linear-gradient(135deg,#84CC16 0%,#4d7c0f 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', boxShadow: '0 3px 10px rgba(132,204,22,0.35)',
            }}><Icons.Shield /></div>
            <div>
              <p style={{
                fontSize: 15, fontWeight: 800, color: '#0f172a',
                fontFamily: "'Plus Jakarta Sans',sans-serif", lineHeight: 1.2,
              }}>DriveGuard<span style={{ color: '#84CC16' }}>AI</span></p>
              <p style={{ fontSize: 9, fontWeight: 600, color: '#94a3b8', letterSpacing: '0.9px', textTransform: 'uppercase' }}>
                Fleet Intelligence
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', outline: 'none', cursor: 'pointer',
            color: '#94a3b8', padding: 6, borderRadius: 8, display: 'flex', alignItems: 'center',
          }}>
            <Icons.Close />
          </button>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 10px' }}>
          {NAV_ITEMS.map(item => {
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                  padding: '11px 14px', borderRadius: 10,
                  border: 'none', outline: 'none', cursor: 'pointer', marginBottom: 2,
                  background: active ? '#f0fdf4' : 'transparent',
                  color: active ? '#15803d' : '#374151',
                  fontWeight: active ? 700 : 500, fontSize: 14.5,
                  fontFamily: "'Plus Jakarta Sans',sans-serif",
                  textAlign: 'left', position: 'relative', whiteSpace: 'nowrap',
                }}
              >
                {active && (
                  <span style={{
                    position: 'absolute', left: 0, top: '20%', bottom: '20%',
                    width: 3, borderRadius: '0 3px 3px 0', background: '#84CC16',
                  }} />
                )}
                <span style={{ color: active ? '#16a34a' : '#64748b', display: 'flex', alignItems: 'center', marginLeft: active ? 4 : 0 }}>
                  <item.Icon />
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User info */}
        {currentUser && (
          <div style={{
            padding: '10px 16px', borderTop: '1px solid #f1f5f9',
            display: 'flex', alignItems: 'center', gap: 10, background: '#fafafa',
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg,#84CC16,#16a34a)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 800, color: '#fff',
            }}>{initials || 'AD'}</div>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <p style={{
                fontSize: 13, fontWeight: 700, color: '#0f172a',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>{displayName}</p>
              <p style={{
                fontSize: 11, color: '#64748b', fontWeight: 500,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>{displayRole}</p>
            </div>
          </div>
        )}

        {/* Logout */}
        <div style={{ padding: '10px 10px', borderTop: '1px solid #f1f5f9', flexShrink: 0 }}>
          <button
            onClick={() => { onLogout(); onClose(); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 12, width: '100%',
              padding: '10px 14px', borderRadius: 10,
              border: 'none', outline: 'none', cursor: 'pointer',
              background: 'transparent', color: '#64748b',
              fontWeight: 600, fontSize: 14.5,
              fontFamily: "'Plus Jakarta Sans',sans-serif",
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#fff1f2'; e.currentTarget.style.color = '#dc2626'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b'; }}
          >
            <span style={{ display: 'flex', alignItems: 'center', color: '#94a3b8' }}><Icons.LogOut /></span>
            <span>Log out</span>
          </button>
        </div>
      </div>
    </>
  );
};

// ── TopBar — shows hamburger on mobile ───────────────────────────────────
const TopBar = ({ onMenuClick, isMobile }) => {
  const location = useLocation();
  const PAGE_MAP = {
    '/':                     { title: 'Dashboard',          sub: 'Fleet safety overview' },
    '/drivers':              { title: 'Drivers',            sub: 'Driver roster list' },
    '/drivers-management':   { title: 'Drivers Management', sub: 'Manage driver accounts' },
    '/vehicles-management':  { title: 'Vehicles',           sub: 'Fleet vehicle registry' },
    '/trips-management':     { title: 'Trips',              sub: 'Manage all trips' },
    '/incidents-management': { title: 'Incidents',          sub: 'Safety incident tracking' },
    '/reports':              { title: 'Incident Reports',   sub: 'Analytics & reporting' },
    '/alerts-management':    { title: 'Alerts',             sub: 'System alert management' },
    '/users':                { title: 'Users',              sub: 'User account management' },
    '/trips':                { title: 'Trips (List)',        sub: 'View all trips' },
    '/violations':           { title: 'Violations',         sub: 'Driver violations log' },
    '/monitoring':           { title: 'Live Monitoring',    sub: 'Real-time video feed' },
  };
  const match = Object.entries(PAGE_MAP).find(([p]) =>
    p === '/' ? location.pathname === '/' : location.pathname.startsWith(p)
  );
  const { title, sub } = match ? match[1] : { title: 'DriveGuardAI', sub: '' };

  return (
    <header style={{
      height: 64, background: '#fff', borderBottom: '1px solid #f1f5f9',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: isMobile ? '0 16px' : '0 28px',
      position: 'sticky', top: 0, zIndex: 30,
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)', flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 10 : 0 }}>
        {/* Hamburger — only on mobile */}
        {isMobile && (
          <button
            onClick={onMenuClick}
            style={{
              background: 'none', border: 'none', outline: 'none', cursor: 'pointer',
              color: '#374151', padding: '4px', display: 'flex', alignItems: 'center',
              borderRadius: 8, flexShrink: 0,
            }}
          >
            <Icons.Menu />
          </button>
        )}
        <div>
          <h1 style={{
            fontSize: isMobile ? 16 : 18, fontWeight: 800, color: '#0f172a',
            fontFamily: "'Plus Jakarta Sans',sans-serif", lineHeight: 1.2,
          }}>{title}</h1>
          {sub && <p style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>{sub}</p>}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {!isMobile && (
          <div style={{
            fontSize: 12, fontWeight: 600, color: '#64748b', background: '#f8fafc',
            border: '1px solid #f1f5f9', borderRadius: 8, padding: '6px 14px',
          }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        )}
        {isMobile && (
          <div style={{
            fontSize: 11, fontWeight: 600, color: '#64748b', background: '#f8fafc',
            border: '1px solid #f1f5f9', borderRadius: 8, padding: '5px 10px', whiteSpace: 'nowrap',
          }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        )}
        <div style={{ position: 'relative', cursor: 'pointer' }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10, background: '#f8fafc',
            border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: '#64748b',
          }}><Icons.Bell /></div>
          <span style={{
            position: 'absolute', top: -2, right: -2, width: 9, height: 9,
            borderRadius: '50%', background: '#ef4444', border: '2px solid #fff',
          }} />
        </div>
      </div>
    </header>
  );
};

// ── AppShell ──────────────────────────────────────────────────────────────
function AppShell({ onLogout }) {
  const [collapsed,     setCollapsed]     = useState(false);
  const [mobileOpen,    setMobileOpen]    = useState(false);
  const [currentUser,   setCurrentUser]   = useState(getUser());
  const [isMobile,      setIsMobile]      = useState(window.innerWidth < 768);
  const location = useLocation();

  // Track window width to toggle mobile mode
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  useEffect(() => {
    const stored = getUser();
    if (stored) setCurrentUser(stored);
  }, []);

  const isKnownShellPath = SHELL_PATHS.some(p =>
    p === '/' ? location.pathname === '/' : location.pathname.startsWith(p)
  );
  if (!isKnownShellPath) return <NotFoundPage />;

  return (
    <div style={{
      display: 'flex', minHeight: '100vh', background: '#f8fafc',
      fontFamily: "'Plus Jakarta Sans',sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        body{background:#f8fafc;}
        button{font-family:inherit;}
        button:focus{outline:none;}
        button:focus-visible{outline:2px solid #84CC16;outline-offset:2px;}
        nav::-webkit-scrollbar{width:3px;}
        nav::-webkit-scrollbar-track{background:transparent;}
        nav::-webkit-scrollbar-thumb{background:#e2e8f0;border-radius:2px;}
        ::-webkit-scrollbar{width:5px;height:5px;}
        ::-webkit-scrollbar-track{background:#f8fafc;}
        ::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:4px;}
        ::-webkit-scrollbar-thumb:hover{background:#84CC16;}
        @keyframes drawerSlideIn {
          from { transform: translateX(-100%); opacity: 0.6; }
          to   { transform: translateX(0);     opacity: 1; }
        }
        @keyframes drawerFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>

      {/* Desktop sidebar — hidden on mobile */}
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

      {/* Main content — always full width on mobile */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <TopBar
          isMobile={isMobile}
          onMenuClick={() => setMobileOpen(true)}
        />
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
}

// ── OAuth2 Callback ───────────────────────────────────────────────────────
function OAuth2Callback({ onAuthSuccess }) {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token  = params.get('token');
    if (!token) { navigate('/login?error=oauth_failed', { replace: true }); return; }
    onAuthSuccess(token)
      .then(() => {
        const savedUser = getUser();
        const role = String(savedUser?.role || savedUser?.userRole || '').toUpperCase();
        navigate(role === 'DRIVER' ? '/driver-portal' : '/', { replace: true });
      })
      .catch(() => navigate('/', { replace: true }));
  }, []);

  return (
    <div style={{
      height: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at 20% 50%,#0d2137 0%,#050d18 60%,#000 100%)',
      fontFamily: "'Plus Jakarta Sans',sans-serif",
    }}>
      <div style={{
        width: 48, height: 48, border: '3px solid rgba(29,148,96,0.3)',
        borderTop: '3px solid #1d9460', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite', marginBottom: 20,
      }} />
      <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
      <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, fontWeight: 600 }}>
        Signing you in with Google...
      </p>
      <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, marginTop: 8 }}>
        Please wait a moment
      </p>
    </div>
  );
}

// ── Loading Spinner ───────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div style={{
      height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#f8fafc', fontFamily: "'Plus Jakarta Sans',sans-serif",
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 44, height: 44, border: '4px solid #e5e7eb', borderTopColor: '#84CC16',
          borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 14px',
        }} />
        <div style={{ color: '#94a3b8', fontSize: 13 }}>Loading…</div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── ROOT APP ──────────────────────────────────────────────────────────────
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!getToken());
  const [userRole, setUserRole]               = useState('');
  const [roleLoading, setRoleLoading]         = useState(!!getToken());

  useEffect(() => {
    const token = getToken();
    if (!token) { setRoleLoading(false); return; }

    const savedUser = getUser();
    const savedRole = savedUser?.role || savedUser?.userRole || '';
    if (savedRole) {
      setUserRole(savedRole.toUpperCase());
      setRoleLoading(false);
    } else {
      fetch(`${API_BASE}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data?.role) {
            const role = String(data.role).toUpperCase();
            setUserRole(role);
            localStorage.setItem('dg_user', JSON.stringify({ ...(savedUser || {}), ...data, role }));
          }
        })
        .catch(() => {})
        .finally(() => setRoleLoading(false));
    }
  }, []);

  const handleAuthSuccess = async (token) => {
    localStorage.setItem('dg_token', token);
    try {
      const controller = new AbortController();
      const timeout    = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (res.ok) {
        const userData = await res.json();
        const role = String(userData.role || userData.userRole || '').toUpperCase();
        localStorage.setItem('dg_user', JSON.stringify({ ...userData, role }));
        setUserRole(role);
      }
    } catch (err) {
      console.warn('Could not fetch user profile:', err.message);
    }
    setIsAuthenticated(true);
    setRoleLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('dg_token');
    localStorage.removeItem('dg_user');
    setIsAuthenticated(false);
    setUserRole('');
  };

  const isDriver  = userRole === 'DRIVER';
  const homeRoute = isDriver ? '/driver-portal' : '/';

  if (roleLoading) return <LoadingScreen />;

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated
              ? <Navigate to={homeRoute} replace />
              : <DriveGuardAuth onAuthSuccess={handleAuthSuccess} />
          }
        />
        <Route
          path="/oauth2/callback"
          element={<OAuth2Callback onAuthSuccess={handleAuthSuccess} />}
        />
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="/500" element={<ServerErrorPage />} />
        <Route
          path="/driver-portal"
          element={
            !isAuthenticated ? <Navigate to="/login" replace />
            : isDriver        ? <DriverPortal />
            :                   <Navigate to="/" replace />
          }
        />
        <Route
          path="/*"
          element={
            !isAuthenticated ? <Navigate to="/login" replace />
            : isDriver        ? <Navigate to="/driver-portal" replace />
            :                   <AppShell onLogout={handleLogout} />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
