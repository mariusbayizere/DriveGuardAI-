import React from 'react';

export const Svg = ({ children, size = 20, color = 'currentColor', strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
    style={{ display: 'block', flexShrink: 0 }}>{children}</svg>
);
export const IcoViolations = ({ size = 22, color }) => (
  <Svg size={size} color={color}>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </Svg>
);
export const IcoDrivers = ({ size = 22, color }) => (
  <Svg size={size} color={color}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </Svg>
);
export const IcoTrips = ({ size = 22, color }) => (
  <Svg size={size} color={color}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </Svg>
);
export const IcoCritical = ({ size = 22, color }) => (
  <Svg size={size} color={color}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </Svg>
);
export const IcoDistraction = ({ size = 16, color = '#6b7280' }) => (
  <Svg size={size} color={color} strokeWidth={1.9}>
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </Svg>
);
export const IcoSpeeding = ({ size = 16, color = '#6b7280' }) => (
  <Svg size={size} color={color} strokeWidth={1.9}>
    <path d="M12 2a10 10 0 1 0 10 10"/><polyline points="12 6 12 12 16 14"/>
  </Svg>
);
export const IcoSeatbelt = ({ size = 16, color = '#6b7280' }) => (
  <Svg size={size} color={color} strokeWidth={1.9}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </Svg>
);
export const IcoPhone = ({ size = 16, color = '#6b7280' }) => (
  <Svg size={size} color={color} strokeWidth={1.9}>
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
    <line x1="12" y1="18" x2="12.01" y2="18"/>
  </Svg>
);
export const IcoFatigue = ({ size = 16, color = '#6b7280' }) => (
  <Svg size={size} color={color} strokeWidth={1.9}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <line x1="12" y1="10" x2="12" y2="14"/>
  </Svg>
);
export const IcoGeneric = ({ size = 16, color = '#6b7280' }) => (
  <Svg size={size} color={color} strokeWidth={1.9}>
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </Svg>
);
export const IcoRefresh = ({ size = 16, color = '#fff' }) => (
  <Svg size={size} color={color} strokeWidth={2.2}>
    <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
  </Svg>
);
export const IcoError = ({ size = 28, color = '#dc2626' }) => (
  <Svg size={size} color={color} strokeWidth={1.8}>
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </Svg>
);
export const IcoEmpty = ({ size = 40, color = '#d1d5db' }) => (
  <Svg size={size} color={color} strokeWidth={1.5}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    <line x1="10" y1="9" x2="8" y2="9"/>
  </Svg>
);
