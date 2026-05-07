// ─── API endpoints ───────────────────────────────────────────────────────────
export const API_BASE_URL = process.env.REACT_APP_API_BASE ? process.env.REACT_APP_API_BASE.replace('/api/v1','') : 'https://driveguard.local';

export const AUTH_ENDPOINTS = {
  SIGN_IN: `${API_BASE_URL}/api/v1/auth/signin`,
  SIGN_UP: `${API_BASE_URL}/api/v1/auth/signup`,
  GOOGLE:  `${API_BASE_URL}/oauth2/authorization/google?prompt=select_account`,
};

// ─── Form defaults ────────────────────────────────────────────────────────────
export const INITIAL_FORM_STATE = {
  firstName:       '',
  lastName:        '',
  email:           '',
  phone:           '',
  role:            'DRIVER',
  password:        '',
  confirmPassword: '',
};

// ─── Role options ─────────────────────────────────────────────────────────────
export const USER_ROLES = [
  { value: 'DRIVER',  label: 'Driver'  },
  { value: 'MANAGER', label: 'Manager' },
  { value: 'ADMIN',   label: 'Admin'   },
];

// ─── Feature bullets shown on overlay ────────────────────────────────────────
export const FEATURE_BULLETS = [
  'Real-time AI Detection',
  'Instant Driver Alerts',
  'Fleet Safety Reports',
];

// ─── Design tokens (shared across sub-components) ────────────────────────────
export const GREEN_GRADIENT =
  'linear-gradient(150deg,#5fa820 0%,#7dc832 35%,#6db82a 65%,#4a8f18 100%)';

export const CARD_SHADOW =
  '0 50px 120px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06)';
