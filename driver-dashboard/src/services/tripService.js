import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE || 'https://driveguard.local/api/v1';

const tripService = {
  // Trips
  getAllTrips: async () => {
    return axios.get(`${API_BASE_URL}/trips`);
  },

  getTrip: async (id) => {
    return axios.get(`${API_BASE_URL}/trips/${id}`);
  },

  createTrip: async (trip) => {
    return axios.post(`${API_BASE_URL}/trips`, trip);
  },

  updateTrip: async (id, trip) => {
    return axios.put(`${API_BASE_URL}/trips/${id}`, trip);
  },

  deleteTrip: async (id) => {
    return axios.delete(`${API_BASE_URL}/trips/${id}`);
  },

  // Related Data (for dropdowns)
  getAllDrivers: async () => {
    return axios.get(`${API_BASE_URL}/drivers`);
  },

  getAllVehicles: async () => {
    return axios.get(`${API_BASE_URL}/vehicles`);
  }
};

export default tripService;
