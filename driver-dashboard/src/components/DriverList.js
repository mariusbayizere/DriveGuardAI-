// DriverList.js - Driver Management Component with Tailwind
// Save as: ~/DriveGuardAI-/driver-dashboard/src/components/DriverList.js

import React, { useState, useEffect } from 'react';
import { getDrivers, getIncidentsByDriver } from '../services/api';

const DriverList = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [driverIncidents, setDriverIncidents] = useState([]);

  useEffect(() => {
    loadDrivers();
  }, []);

  const loadDrivers = async () => {
    try {
      setLoading(true);
      const data = await getDrivers();
      setDrivers(data);
      setError(null);
    } catch (err) {
      setError('Failed to load drivers: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const viewDriverDetails = async (driver) => {
    setSelectedDriver(driver);
    try {
      const incidents = await getIncidentsByDriver(driver.id);
      setDriverIncidents(incidents);
    } catch (err) {
      console.error('Failed to load driver incidents:', err);
      setDriverIncidents([]);
    }
  };

  const getSafetyScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    if (score >= 40) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading drivers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
        <p className="text-red-800">{error}</p>
        <button onClick={loadDrivers} className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">👥 Drivers</h1>
          <p className="text-gray-600 mt-1">Manage and monitor all drivers</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-purple-600">{drivers.length}</p>
          <p className="text-sm text-gray-500">Total Drivers</p>
        </div>
      </div>

      {/* Drivers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {drivers.map((driver) => (
          <div 
            key={driver.id}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition cursor-pointer border-2 border-transparent hover:border-purple-500"
            onClick={() => viewDriverDetails(driver)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="bg-purple-100 rounded-full p-3">
                <span className="text-3xl">👤</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                driver.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {driver.status}
              </span>
            </div>

            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {driver.user?.firstName} {driver.user?.lastName}
            </h3>

            <div className="space-y-2 text-sm text-gray-600">
              <p className="flex items-center">
                <span className="font-semibold mr-2">📧</span>
                {driver.user?.email}
              </p>
              <p className="flex items-center">
                <span className="font-semibold mr-2">📱</span>
                {driver.user?.phoneNumber}
              </p>
              <p className="flex items-center">
                <span className="font-semibold mr-2">🪪</span>
                {driver.licenseNumber}
              </p>
              <p className="flex items-center">
                <span className="font-semibold mr-2">📅</span>
                Hired: {new Date(driver.hireDate).toLocaleDateString()}
              </p>
            </div>

            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-600">Safety Score</span>
                <span className={`text-2xl font-bold px-3 py-1 rounded-lg ${getSafetyScoreColor(driver.safetyScore)}`}>
                  {driver.safetyScore}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Driver Details Modal */}
      {selectedDriver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-3xl font-bold mb-2">
                    {selectedDriver.user?.firstName} {selectedDriver.user?.lastName}
                  </h2>
                  <p className="text-purple-100">{selectedDriver.licenseNumber}</p>
                </div>
                <button 
                  onClick={() => setSelectedDriver(null)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition"
                >
                  <span className="text-2xl">✕</span>
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Driver Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-green-600">{selectedDriver.safetyScore}</p>
                  <p className="text-sm text-gray-600">Safety Score</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-blue-600">{driverIncidents.length}</p>
                  <p className="text-sm text-gray-600">Total Violations</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-orange-600">
                    {driverIncidents.filter(i => i.severity === 'CRITICAL').length}
                  </p>
                  <p className="text-sm text-gray-600">Critical</p>
                </div>
              </div>

              {/* Recent Violations */}
              <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Violations</h3>
              {driverIncidents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-4xl mb-2">✨</p>
                  <p>No violations recorded - Excellent driver!</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {driverIncidents.slice(0, 10).map((incident) => (
                    <div key={incident.incident_id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-2xl">
                              {incident.incident_type === 'PHONE_USE' ? '📱' :
                               incident.incident_type === 'DROWSINESS' ? '😴' :
                               incident.incident_type === 'DISTRACTION' ? '👀' :
                               incident.incident_type === 'NO_SEATBELT' ? '🚫' : '⚠️'}
                            </span>
                            <span className="font-semibold text-gray-800">
                              {incident.incident_type.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{incident.description}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(incident.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          incident.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                          incident.severity === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {incident.severity}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverList;
