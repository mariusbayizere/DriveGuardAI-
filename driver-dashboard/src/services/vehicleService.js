import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE || 'https://driveguard.local/api/v1';

const vehicleService = {
  // Vehicles
  getAllVehicles: async () => {
    return axios.get(`${API_BASE_URL}/vehicles`);
  },

  getVehicle: async (id) => {
    return axios.get(`${API_BASE_URL}/vehicles/${id}`);
  },

  createVehicle: async (vehicle) => {
    return axios.post(`${API_BASE_URL}/vehicles`, vehicle);
  },

  updateVehicle: async (id, vehicle) => {
    return axios.put(`${API_BASE_URL}/vehicles/${id}`, vehicle);
  },

  deleteVehicle: async (id) => {
    return axios.delete(`${API_BASE_URL}/vehicles/${id}`);
  },

  // Related Data (for dropdowns)
  getAllDrivers: async () => {
    return axios.get(`${API_BASE_URL}/drivers`);
  }
};

export default vehicleService;
