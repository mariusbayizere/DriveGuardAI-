import React from 'react';
import { IcoRefresh } from './icons';

/**
 * Page-level header containing the title block and the Refresh button.
 *
 * @param {Function} onRefresh
 * @param {boolean}  loading
 * @param {boolean}  isMobile
 */
const DashboardHeader = ({ onRefresh, loading, isMobile }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: 24,
      animation: 'fadeUp 0.4s ease 0.05s both',
      flexWrap: 'wrap',
      gap: 12,
    }}
  >
    <div>
      <h2 style={{ fontSize: isMobile ? 18 : 22, fontWeight: 800, color: '#111827', marginBottom: 4 }}>
        Operations Overview
      </h2>
      <p style={{ fontSize: isMobile ? 11 : 13, color: '#9ca3af', fontWeight: 500 }}>
        Real-time fleet safety monitoring · auto-updates every 10 s
      </p>
    </div>

    <button
      onClick={onRefresh}
      disabled={loading}
      className="refresh-btn"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: '#84CC16',
        color: '#fff',
        border: 'none',
        outline: 0,
        borderRadius: 10,
        padding: isMobile ? '9px 14px' : '10px 20px',
        fontWeight: 700,
        fontSize: isMobile ? 12 : 13,
        cursor: loading ? 'not-allowed' : 'pointer',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        opacity: loading ? 0.7 : 1,
        boxShadow: '0 2px 8px rgba(132,204,22,0.28)',
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ display: 'inline-flex', animation: loading ? 'spin 0.8s linear infinite' : 'none' }}>
        <IcoRefresh size={16} color="#fff" />
      </span>
      {loading ? 'Refreshing…' : 'Refresh Data'}
    </button>
  </div>
);

export default DashboardHeader;
