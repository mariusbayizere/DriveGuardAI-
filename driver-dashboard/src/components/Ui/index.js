import React from 'react';

/* ─── Animation keyframes injected once at app root ──────────────────── */
export const GlobalStyles = () => (
  <style>{`
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(14px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes spin        { to { transform: rotate(360deg); } }
    @keyframes pulse-live  { 0%,100%{opacity:1} 50%{opacity:0.35} }
    .dash-tr:hover > td    { background: #fafafa !important; }
    .dash-tr > td          { transition: background 0.15s; }
    .refresh-btn:hover:not(:disabled) {
      background: #65a30d !important;
      box-shadow: 0 6px 20px rgba(101,163,13,0.35) !important;
      transform: translateY(-1px) !important;
    }
    .refresh-btn { transition: all 0.2s ease !important; }
  `}</style>
);

/* ─── Card shell ──────────────────────────────────────────────────────── */
export const Card = ({ children, style = {}, delay = 0 }) => (
  <div
    style={{
      background: '#fff',
      border: '1px solid #f3f4f6',
      borderRadius: 16,
      boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)',
      overflow: 'hidden',
      animation: `fadeUp 0.5s ease ${delay}s both`,
      ...style,
    }}
  >
    {children}
  </div>
);

/* ─── Card header ─────────────────────────────────────────────────────── */
export const CardHeader = ({ title, subtitle, right }) => (
  <div
    style={{
      padding: '18px 24px',
      borderBottom: '1px solid #f3f4f6',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 8,
    }}
  >
    <div>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: subtitle ? 2 : 0 }}>
        {title}
      </h3>
      {subtitle && (
        <p style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>{subtitle}</p>
      )}
    </div>
    {right}
  </div>
);

/* ─── Chip / label badge ──────────────────────────────────────────────── */
export const Chip = ({ label, color, bg, border }) => (
  <span
    style={{
      fontSize: 11,
      fontWeight: 700,
      color,
      background: bg,
      border: `1px solid ${border}`,
      borderRadius: 6,
      padding: '4px 10px',
      letterSpacing: '0.4px',
      textTransform: 'uppercase',
      whiteSpace: 'nowrap',
    }}
  >
    {label}
  </span>
);

/* ─── Severity badge ──────────────────────────────────────────────────── */
const SEVERITY_STYLES = {
  CRITICAL: { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
  HIGH:     { bg: '#fff7ed', color: '#ea580c', border: '#fed7aa' },
  MEDIUM:   { bg: '#fefce8', color: '#ca8a04', border: '#fde68a' },
  LOW:      { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
};

export const SeverityBadge = ({ severity }) => {
  const s = SEVERITY_STYLES[severity] ?? SEVERITY_STYLES.LOW;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
        padding: '3px 10px',
        borderRadius: 6,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.4px',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: '50%',
          background: s.color,
          display: 'inline-block',
        }}
      />
      {severity}
    </span>
  );
};

/* ─── Recharts custom tooltip ─────────────────────────────────────────── */
export const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: 10,
        padding: '10px 14px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
        fontSize: 13,
        color: '#111827',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      {label && (
        <p style={{ fontWeight: 700, marginBottom: 4, color: '#374151' }}>{label}</p>
      )}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || '#84CC16', fontWeight: 600 }}>
          {p.name || 'Count'}:{' '}
          <span style={{ color: '#111827' }}>{p.value}</span>
        </p>
      ))}
    </div>
  );
};
