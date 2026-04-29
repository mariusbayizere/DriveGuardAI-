/**
 * components/layout/TopBar.jsx
 * Sticky header bar — shows page title, date, notifications, and
 * the hamburger menu trigger on mobile.
 */
import React from 'react';
import { useLocation } from 'react-router-dom';
import { Icons } from '../icons/Icons';
import { PAGE_META } from '../../constants/navigation';

const TopBar = ({ onMenuClick, isMobile }) => {
  const { pathname } = useLocation();

  const match  = Object.entries(PAGE_META).find(([p]) =>
    p === '/' ? pathname === '/' : pathname.startsWith(p)
  );
  const { title, sub } = match ? match[1] : { title: 'DriveGuardAI', sub: '' };

  const dateLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  });

  return (
    <header style={{
      height: 64, background: '#fff', borderBottom: '1px solid #f1f5f9',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: isMobile ? '0 16px' : '0 28px',
      position: 'sticky', top: 0, zIndex: 30,
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)', flexShrink: 0,
    }}>
      {/* Left — hamburger (mobile) + page title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 10 : 0 }}>
        {isMobile && (
          <button
            onClick={onMenuClick}
            aria-label="Open navigation menu"
            style={{
              background: 'none', border: 'none', outline: 'none', cursor: 'pointer',
              color: '#374151', padding: '4px',
              display: 'flex', alignItems: 'center',
              borderRadius: 8, flexShrink: 0,
            }}
          >
            <Icons.Menu />
          </button>
        )}
        <div>
          <h1 style={{
            fontSize: isMobile ? 16 : 18, fontWeight: 800, color: '#0f172a',
            fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1.2,
          }}>
            {title}
          </h1>
          {sub && (
            <p style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>{sub}</p>
          )}
        </div>
      </div>

      {/* Right — date + notification bell */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          fontSize: isMobile ? 11 : 12, fontWeight: 600, color: '#64748b',
          background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: 8,
          padding: isMobile ? '5px 10px' : '6px 14px', whiteSpace: 'nowrap',
        }}>
          {dateLabel}
        </div>

        <div style={{ position: 'relative', cursor: 'pointer' }} aria-label="Notifications">
          <div style={{
            width: 38, height: 38, borderRadius: 10, background: '#f8fafc',
            border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: '#64748b',
          }}>
            <Icons.Bell />
          </div>
          <span style={{
            position: 'absolute', top: -2, right: -2, width: 9, height: 9,
            borderRadius: '50%', background: '#ef4444', border: '2px solid #fff',
          }} />
        </div>
      </div>
    </header>
  );
};

export default TopBar;
