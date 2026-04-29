// ========================================
// ViolationList.js - All Violations Component
// Save as: ~/DriveGuardAI-/driver-dashboard/src/components/ViolationList.js
// ========================================

import React, { useState, useEffect } from 'react';

const ViolationList = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    loadIncidents();
  }, []);

  const loadIncidents = async () => {
    try {
      const { getIncidents } = await import('../services/api');
      const data = await getIncidents();
      setIncidents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredIncidents = filter === 'ALL' 
    ? incidents 
    : incidents.filter(i => i.incident_type === filter);

  if (loading) return <div className="text-center py-20"><div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">⚠️ All Violations</h1>
        <select 
          className="px-4 py-2 border rounded-lg"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="ALL">All Types</option>
          <option value="DROWSINESS">Drowsiness</option>
          <option value="PHONE_USE">Phone Use</option>
          <option value="DISTRACTION">Distraction</option>
          <option value="NO_SEATBELT">No Seatbelt</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredIncidents.map((incident) => (
              <tr key={incident.incident_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(incident.timestamp).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-sm">
                  {incident.incident_type.replace('_', ' ')}
                </td>
                <td className="px-6 py-4 text-sm">
                  {incident.driver?.user?.firstName} {incident.driver?.user?.lastName}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    incident.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                    incident.severity === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {incident.severity}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ViolationList;
