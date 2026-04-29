import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/v1';

const driverService = {
  getAllDrivers: async () => {
    return axios.get(`${API_BASE_URL}/drivers`);
  },

  getDriver: async (id) => {
    return axios.get(`${API_BASE_URL}/drivers/${id}`);
  },

  createDriver: async (driver) => {
    return axios.post(`${API_BASE_URL}/drivers`, driver);
  },

  updateDriver: async (id, driver) => {
    return axios.put(`${API_BASE_URL}/drivers/${id}`, driver);
  },

  deleteDriver: async (id) => {
    return axios.delete(`${API_BASE_URL}/drivers/${id}`);
  },

  getAllUsers: async () => {
    return axios.get(`${API_BASE_URL}/users`);
  }
};

export default driverService;
