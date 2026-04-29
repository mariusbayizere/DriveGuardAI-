/**
 * components/screens/LoadingScreen.jsx
 * Full-page spinner shown while resolving auth state on initial load.
 */
import React from 'react';

const LoadingScreen = () => (
  <div style={{
    height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: '#f8fafc', fontFamily: "'Plus Jakarta Sans', sans-serif",
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

export default LoadingScreen;
