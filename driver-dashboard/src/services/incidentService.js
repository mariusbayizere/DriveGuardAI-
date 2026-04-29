import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/v1';

const incidentService = {
  // Incidents
  getAllIncidents: async () => {
    return axios.get(`${API_BASE_URL}/incidents`);
  },

  getIncident: async (id) => {
    return axios.get(`${API_BASE_URL}/incidents/${id}`);
  },

  createIncident: async (incident) => {
    return axios.post(`${API_BASE_URL}/incidents`, incident);
  },

  updateIncident: async (id, incident) => {
    return axios.put(`${API_BASE_URL}/incidents/${id}`, incident);
  },

  deleteIncident: async (id) => {
    return axios.delete(`${API_BASE_URL}/incidents/${id}`);
  },

  getIncidentsByDriver: async (driverId) => {
    return axios.get(`${API_BASE_URL}/incidents/driver/${driverId}`);
  },

  getIncidentsByTrip: async (tripId) => {
    return axios.get(`${API_BASE_URL}/incidents/trip/${tripId}`);
  },

  getIncidentsByVehicle: async (vehicleId) => {
    return axios.get(`${API_BASE_URL}/incidents/vehicle/${vehicleId}`);
  },

  // Related Data (for dropdowns)
  getAllDrivers: async () => {
    return axios.get(`${API_BASE_URL}/drivers`);
  },

  getAllTrips: async () => {
    return axios.get(`${API_BASE_URL}/trips`);
  },

  getAllVehicles: async () => {
    return axios.get(`${API_BASE_URL}/vehicles`);
  }
};

export default incidentService;
