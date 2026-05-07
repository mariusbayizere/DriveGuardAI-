// api.js - API Service for communicating with Java backend
import axios from 'axios';

const JAVA_API_URL = process.env.REACT_APP_API_BASE || 'https://driveguard.local/api/v1';
const PYTHON_API_URL = (process.env.REACT_APP_FLASK_BASE || 'https://driveguard.local/ai') + '/api';

const javaApi = axios.create({
  baseURL: JAVA_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

const pythonApi = axios.create({
  baseURL: PYTHON_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ============ DRIVERS ============
export const getDrivers = async () => {
  try {
    const response = await javaApi.get('/drivers');
    return response.data;
  } catch (error) {
    console.error('Error fetching drivers:', error);
    return [];
  }
};

export const getDriver = async (id) => {
  const response = await javaApi.get(`/drivers/${id}`);
  return response.data;
};

export const createDriver = async (driver) => {
  const response = await javaApi.post('/drivers', driver);
  return response.data;
};

export const updateDriver = async (id, driver) => {
  const response = await javaApi.put(`/drivers/${id}`, driver);
  return response.data;
};

export const deleteDriver = async (id) => {
  const response = await javaApi.delete(`/drivers/${id}`);
  return response.data;
};

// ============ TRIPS ============
export const getTrips = async () => {
  try {
    const response = await javaApi.get('/trips');
    return response.data;
  } catch (error) {
    console.error('Error fetching trips:', error);
    return [];
  }
};

export const getTrip = async (id) => {
  const response = await javaApi.get(`/trips/${id}`);
  return response.data;
};

export const createTrip = async (trip) => {
  const response = await javaApi.post('/trips', trip);
  return response.data;
};

export const updateTrip = async (id, trip) => {
  const response = await javaApi.put(`/trips/${id}`, trip);
  return response.data;
};

export const deleteTrip = async (id) => {
  const response = await javaApi.delete(`/trips/${id}`);
  return response.data;
};

// ============ INCIDENTS ============
export const getIncidents = async () => {
  try {
    const response = await javaApi.get('/incidents');
    return response.data;
  } catch (error) {
    console.error('Error fetching incidents:', error);
    return [];
  }
};

export const getIncident = async (id) => {
  const response = await javaApi.get(`/incidents/${id}`);
  return response.data;
};

export const getIncidentsByDriver = async (driverId) => {
  const response = await javaApi.get(`/incidents/driver/${driverId}`);
  return response.data;
};

export const getIncidentsByTrip = async (tripId) => {
  const response = await javaApi.get(`/incidents/trip/${tripId}`);
  return response.data;
};

export const createIncident = async (incident) => {
  const response = await javaApi.post('/incidents', incident);
  return response.data;
};

export const updateIncident = async (id, incident) => {
  const response = await javaApi.put(`/incidents/${id}`, incident);
  return response.data;
};

export const deleteIncident = async (id) => {
  const response = await javaApi.delete(`/incidents/${id}`);
  return response.data;
};

// ============ VEHICLES ============
export const getVehicles = async () => {
  try {
    const response = await javaApi.get('/vehicles');
    return response.data;
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return [];
  }
};

export const getVehicle = async (id) => {
  const response = await javaApi.get(`/vehicles/${id}`);
  return response.data;
};

export const createVehicle = async (vehicle) => {
  const response = await javaApi.post('/vehicles', vehicle);
  return response.data;
};

export const updateVehicle = async (id, vehicle) => {
  const response = await javaApi.put(`/vehicles/${id}`, vehicle);
  return response.data;
};

export const deleteVehicle = async (id) => {
  const response = await javaApi.delete(`/vehicles/${id}`);
  return response.data;
};

// ============ USERS ============
export const getUsers = async () => {
  try {
    const response = await javaApi.get('/users');
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

export const getUser = async (id) => {
  const response = await javaApi.get(`/users/${id}`);
  return response.data;
};

export const createUser = async (user) => {
  const response = await javaApi.post('/users', user);
  return response.data;
};

export const updateUser = async (id, user) => {
  const response = await javaApi.put(`/users/${id}`, user);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await javaApi.delete(`/users/${id}`);
  return response.data;
};

// ============ PYTHON MONITORING ============
export const getPythonStatus = async () => {
  try {
    const response = await pythonApi.get('/monitoring/status');
    return response.data;
  } catch (error) {
    console.error('Error fetching Python status:', error);
    return { monitoring_active: false };
  }
};

export const startMonitoring = async (driverId, vehicleId, tripId) => {
  const response = await pythonApi.post('/monitoring/start', {
    driver_id: driverId,
    vehicle_id: vehicleId,
    trip_id: tripId,
  });
  return response.data;
};

export const stopMonitoring = async () => {
  const response = await pythonApi.post('/monitoring/stop');
  return response.data;
};

// ============ UTILITY FUNCTIONS ============
export const calculateStats = (incidents) => {
  const stats = {
    total: incidents.length,
    byType: {},
    bySeverity: {},
    recent: incidents.slice(-10).reverse(),
  };

  incidents.forEach(incident => {
    const type = incident.incident_type || 'UNKNOWN';
    const severity = incident.severity || 'LOW';
    
    stats.byType[type] = (stats.byType[type] || 0) + 1;
    stats.bySeverity[severity] = (stats.bySeverity[severity] || 0) + 1;
  });

  return stats;
};

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString();
};

export const getSeverityColor = (severity) => {
  const colors = {
    CRITICAL: '#dc2626',
    HIGH: '#ea580c',
    MEDIUM: '#f59e0b',
    LOW: '#10b981',
  };
  return colors[severity] || '#6b7280';
};

export const getIncidentIcon = (type) => {
  const icons = {
    SPEEDING: '🏎️',
    HARSH_ACCELERATION: '⚡',
    HARSH_BRAKING: '🛑',
    LANE_DEPARTURE: '🛣️',
    DISTRACTED_DRIVING: '📱',
    DROWSY_DRIVING: '😴',
    AGGRESSIVE_DRIVING: '😠',
    COLLISION: '💥',
    TAILGATING: '📏',
    PHONE_USE: '☎️',
    DROWSINESS: '😴',
    DISTRACTION: '👀',
    NO_SEATBELT: '🚫',
    FATIGUE: '🥱',
  };
  return icons[type] || '⚠️';
};

export default javaApi;
