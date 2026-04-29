// ========================================
// TripList.js - Trip Management Component
// Save as: ~/DriveGuardAI-/driver-dashboard/src/components/TripList.js
// ========================================

import React, { useState, useEffect } from 'react';
import { getTrips } from '../services/api';

const TripList = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      const data = await getTrips();
      setTrips(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-20"><div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto"></div></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">🚙 Trips</h1>
      
      <div className="grid grid-cols-1 gap-4">
        {trips.map(trip => (
          <div key={trip.tripId} className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold">Trip #{trip.tripId}</h3>
                <p className="text-gray-600">Driver: {trip.driver?.user?.firstName} {trip.driver?.user?.lastName}</p>
                <p className="text-sm text-gray-500">Vehicle: {trip.vehicle?.model}</p>
              </div>
              <span className={`px-4 py-2 rounded-full font-semibold ${
                trip.status === 'ONGOING' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {trip.status}
              </span>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <p>Start: {new Date(trip.startTime).toLocaleString()}</p>
              {trip.endTime && <p>End: {new Date(trip.endTime).toLocaleString()}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TripList;
