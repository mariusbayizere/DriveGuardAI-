import React from 'react';

const LiveMonitoringBanner = ({ pythonStatus, isMobile }) => {
  if (!pythonStatus?.monitoring_active) return null;
  const { driver_id, vehicle_id, trip_id } = pythonStatus.current_session ?? {};
  return (
    <div style={{ display:'flex', alignItems:'flex-start', gap:10, background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:10, padding:'10px 16px', marginBottom:24, animation:'fadeUp 0.4s ease both', flexWrap:'wrap' }}>
      <span style={{ width:8, height:8, borderRadius:'50%', background:'#22c55e', display:'inline-block', flexShrink:0, marginTop:3, animation:'pulse-live 1.5s ease infinite' }}/>
      <span style={{ fontSize:isMobile?12:13, fontWeight:600, color:'#16a34a', flex:1 }}>
        Live Monitoring Active — Driver {driver_id} &nbsp;·&nbsp; Vehicle {vehicle_id} &nbsp;·&nbsp; Trip {trip_id}
      </span>
    </div>
  );
};

export default LiveMonitoringBanner;
