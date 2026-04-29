/**
 * components/layout/Sidebar.jsx
 * Desktop-only collapsible sidebar.
 * Hidden on mobile — MobileDrawer handles that breakpoint instead.
 */
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import NavItem from '../navigation/NavItem';
import { Icons } from '../icons/Icons';
import { NAV_ITEMS } from '../../constants/navigation';

const Sidebar = ({ collapsed, setCollapsed, currentUser, onLogout }) => {
  const location  = useLocation();
  const navigate  = useNavigate();
  const [logoutHover, setLogoutHover] = useState(false);

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const displayName = currentUser
    ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim()
    : 'Admin';
  const rawRole     = currentUser?.userRole || currentUser?.role || 'Fleet Manager';
  const displayRole = rawRole.charAt(0) + rawRole.slice(1).toLowerCase().replace('_', ' ');
  const initials    = displayName.split(' ').map(w => w[0]?.toUpperCase() || '').slice(0, 2).join('');

  return (
    <aside style={{
      width: collapsed ? 72 : 260,
      height: '100vh',
      background: '#ffffff',
      borderRight: '1px solid #e8edf2',
      display: 'flex', flexDirection: 'column',
      transition: 'width 0.25s cubic-bezier(.4,0,.2,1)',
      overflow: 'hidden',
      flexShrink: 0,
      position: 'sticky', top: 0, zIndex: 40,
      boxShadow: '2px 0 12px rgba(0,0,0,0.05)',
    }}>
      {/* ── Logo ── */}
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
        }}>
          <Icons.Shield />
        </div>

        {!collapsed && (
          <>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <p style={{
                fontSize: 16, fontWeight: 800, color: '#0f172a',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                lineHeight: 1.2, whiteSpace: 'nowrap',
              }}>
                DriveGuard<span style={{ color: '#84CC16' }}>AI</span>
              </p>
              <p style={{
                fontSize: 10, fontWeight: 600, color: '#94a3b8',
                letterSpacing: '0.9px', textTransform: 'uppercase',
              }}>
                Fleet Intelligence
              </p>
            </div>

            <button
              onClick={() => setCollapsed(true)}
              title="Collapse sidebar"
              style={{
                background: 'none', border: 'none', outline: 'none', cursor: 'pointer',
                color: '#94a3b8', padding: 6, borderRadius: 7,
                display: 'flex', alignItems: 'center',
                transition: 'background 0.15s, color 0.15s', flexShrink: 0,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#475569'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none';    e.currentTarget.style.color = '#94a3b8'; }}
            >
              <Icons.ChevronLeft />
            </button>
          </>
        )}
      </div>

      {/* ── Nav Links ── */}
      <nav style={{
        flex: 1, overflowY: 'auto', overflowX: 'hidden',
        padding: collapsed ? '14px 8px' : '14px 12px',
      }}>
        {NAV_ITEMS.map(item => (
          <NavItem
            key={item.path}
            item={item}
            active={isActive(item.path)}
            collapsed={collapsed}
            onClick={() => navigate(item.path)}
          />
        ))}
      </nav>

      {/* ── User Info ── */}
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

      {/* ── Logout ── */}
      <div style={{
        padding: collapsed ? '12px 8px' : '10px 12px',
        borderTop: currentUser && !collapsed ? 'none' : '1px solid #f1f5f9',
        flexShrink: 0,
      }}>
        <button
          onMouseEnter={() => setLogoutHover(true)}
          onMouseLeave={() => setLogoutHover(false)}
          onClick={onLogout}
          title={collapsed ? 'Log out' : undefined}
          style={{
            display: 'flex', alignItems: 'center', gap: 12, width: '100%',
            padding: collapsed ? '11px 0' : '10px 14px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            borderRadius: 10, border: 'none', outline: 'none', cursor: 'pointer',
            background: logoutHover ? '#fff1f2' : 'transparent',
            color:      logoutHover ? '#dc2626' : '#64748b',
            fontWeight: 600, fontSize: 14.5,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            transition: 'all 0.15s ease', boxShadow: 'none', whiteSpace: 'nowrap',
          }}
        >
          <span style={{
            display: 'flex', alignItems: 'center',
            color: logoutHover ? '#dc2626' : '#94a3b8',
            transition: 'color 0.15s',
          }}>
            <Icons.LogOut />
          </span>
          {!collapsed && <span>Log out</span>}
        </button>
      </div>

      {/* ── Expand button (collapsed state only) ── */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          title="Expand sidebar"
          style={{
            width: '100%', padding: '10px 0',
            background: 'none', border: 'none', outline: 'none',
            borderTop: '1px solid #f1f5f9', cursor: 'pointer',
            color: '#94a3b8', display: 'flex', alignItems: 'center',
            justifyContent: 'center', transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          <Icons.ChevronRight />
        </button>
      )}
    </aside>
  );
};

export default Sidebar;
