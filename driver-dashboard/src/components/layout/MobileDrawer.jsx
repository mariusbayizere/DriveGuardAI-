/**
 * components/layout/MobileDrawer.jsx
 * Full-screen overlay drawer for mobile navigation.
 * Renders as a portal-like overlay — slides in from the left.
 */
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Icons } from '../icons/Icons';
import { NAV_ITEMS } from '../../constants/navigation';

const MobileDrawer = ({ open, onClose, currentUser, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const displayName = currentUser
    ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim()
    : 'Admin';
  const rawRole     = currentUser?.userRole || currentUser?.role || 'Fleet Manager';
  const displayRole = rawRole.charAt(0) + rawRole.slice(1).toLowerCase().replace('_', ' ');
  const initials    = displayName.split(' ').map(w => w[0]?.toUpperCase() || '').slice(0, 2).join('');

  const handleNav = (path) => { navigate(path); onClose(); };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.45)',
          zIndex: 200,
          animation: 'drawerFadeIn 0.25s ease both',
        }}
      />

      {/* Drawer panel */}
      <div style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, width: 270,
        background: '#fff', zIndex: 201,
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
            }}>
              <Icons.Shield />
            </div>
            <div>
              <p style={{
                fontSize: 15, fontWeight: 800, color: '#0f172a',
                fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1.2,
              }}>
                DriveGuard<span style={{ color: '#84CC16' }}>AI</span>
              </p>
              <p style={{
                fontSize: 9, fontWeight: 600, color: '#94a3b8',
                letterSpacing: '0.9px', textTransform: 'uppercase',
              }}>
                Fleet Intelligence
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', outline: 'none', cursor: 'pointer',
              color: '#94a3b8', padding: 6, borderRadius: 8,
              display: 'flex', alignItems: 'center',
            }}
          >
            <Icons.Close />
          </button>
        </div>

        {/* Nav Links */}
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
                  color:      active ? '#15803d' : '#374151',
                  fontWeight: active ? 700 : 500, fontSize: 14.5,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  textAlign: 'left', position: 'relative', whiteSpace: 'nowrap',
                }}
              >
                {active && (
                  <span style={{
                    position: 'absolute', left: 0, top: '20%', bottom: '20%',
                    width: 3, borderRadius: '0 3px 3px 0', background: '#84CC16',
                  }} />
                )}
                <span style={{
                  color: active ? '#16a34a' : '#64748b',
                  display: 'flex', alignItems: 'center',
                  marginLeft: active ? 4 : 0,
                }}>
                  <item.Icon />
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Info */}
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
            }}>
              {initials || 'AD'}
            </div>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <p style={{
                fontSize: 13, fontWeight: 700, color: '#0f172a',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {displayName}
              </p>
              <p style={{
                fontSize: 11, color: '#64748b', fontWeight: 500,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {displayRole}
              </p>
            </div>
          </div>
        )}

        {/* Logout */}
        <div style={{ padding: '10px', borderTop: '1px solid #f1f5f9', flexShrink: 0 }}>
          <button
            onClick={() => { onLogout(); onClose(); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 12, width: '100%',
              padding: '10px 14px', borderRadius: 10,
              border: 'none', outline: 'none', cursor: 'pointer',
              background: 'transparent', color: '#64748b',
              fontWeight: 600, fontSize: 14.5,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#fff1f2'; e.currentTarget.style.color = '#dc2626'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b'; }}
          >
            <span style={{ display: 'flex', alignItems: 'center', color: '#94a3b8' }}>
              <Icons.LogOut />
            </span>
            <span>Log out</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default MobileDrawer;
