export const API_BASE       = "http://localhost:8080";
export const AUTH_ENDPOINTS = {
  signIn: `${API_BASE}/api/v1/auth/signin`,
  signUp: `${API_BASE}/api/v1/auth/signup`,
  google: `${API_BASE}/oauth2/authorization/google?prompt=select_account`,
};

export const INITIAL_FORM = {
  firstName:       "",
  lastName:        "",
  email:           "",
  phone:           "",
  role:            "DRIVER",
  password:        "",
  confirmPassword: "",
};

export const USER_ROLES = [
  { value: "DRIVER",  label: "Driver"  },
  { value: "MANAGER", label: "Manager" },
  { value: "ADMIN",   label: "Admin"   },
];

export const FEATURES = [
  "Real-time AI Detection",
  "Instant Driver Alerts",
  "Fleet Safety Reports",
];
