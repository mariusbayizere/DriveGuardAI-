import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE || 'https://driveguard.local/api/v1';

const alertService = {
  // Alerts
  getAllAlerts: async () => {
    return axios.get(`${API_BASE_URL}/alerts`);
  },

  getAlert: async (id) => {
    return axios.get(`${API_BASE_URL}/alerts/${id}`);
  },

  getAlertsByUser: async (userId) => {
    return axios.get(`${API_BASE_URL}/alerts/user/${userId}`);
  },

  createAlert: async (alert) => {
    return axios.post(`${API_BASE_URL}/alerts`, alert);
  },

  updateAlert: async (id, alert) => {
    return axios.put(`${API_BASE_URL}/alerts/${id}`, alert);
  },

  deleteAlert: async (id) => {
    return axios.delete(`${API_BASE_URL}/alerts/${id}`);
  },

  // Related Data (for dropdowns)
  getAllUsers: async () => {
    return axios.get(`${API_BASE_URL}/users`);
  },

  getAllIncidents: async () => {
    return axios.get(`${API_BASE_URL}/incidents`);
  }
};

export default alertService;
