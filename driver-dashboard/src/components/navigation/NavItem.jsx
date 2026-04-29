/**
 * components/navigation/NavItem.jsx
 * A single sidebar navigation button.
 * Accepts active, collapsed, and onClick — pure presentational component.
 */
import React, { useState } from 'react';

const NavItem = ({ item, active, collapsed, onClick }) => {
  const [hovered, setHovered] = useState(false);
  const { Icon, label } = item;

  return (
    <button
      onClick={onClick}
      title={collapsed ? label : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12, width: '100%',
        padding: collapsed ? '11px 0' : '10px 14px',
        justifyContent: collapsed ? 'center' : 'flex-start',
        borderRadius: 10, border: 'none', outline: 'none', cursor: 'pointer',
        marginBottom: 2,
        background: active ? '#f0fdf4' : hovered ? '#f8fafc' : 'transparent',
        color:      active ? '#15803d' : hovered ? '#111827' : '#374151',
        fontWeight: active ? 700 : 500,
        fontSize: 14.5,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        transition: 'all 0.15s ease',
        position: 'relative',
        textAlign: 'left',
        whiteSpace: 'nowrap',
        boxShadow: 'none',
      }}
    >
      {active && !collapsed && (
        <span style={{
          position: 'absolute', left: 0, top: '20%', bottom: '20%',
          width: 3, borderRadius: '0 3px 3px 0', background: '#84CC16',
        }} />
      )}
      <span style={{
        color: active ? '#16a34a' : hovered ? '#374151' : '#64748b',
        display: 'flex', alignItems: 'center',
        marginLeft: active && !collapsed ? 4 : 0,
        transition: 'color 0.15s',
      }}>
        <Icon />
      </span>
      {!collapsed && <span>{label}</span>}
    </button>
  );
};

export default NavItem;
