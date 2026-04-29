import React, { useState, useEffect, useRef } from 'react';

const PYTHON_URL = 'http://localhost:5000';

// ── Responsive hook ──
const useResponsive = () => {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return {
    isMobile:  width < 640,
    isTablet:  width >= 640 && width < 1024,
    isDesktop: width >= 1024,
    width,
  };
};

const MonitoringControl = () => {
  const [status, setStatus]               = useState(null);
  const [drivers, setDrivers]             = useState([]);
  const [vehicles, setVehicles]           = useState([]);
  const [trips, setTrips]                 = useState([]);
  const [selectedDriver, setSelectedDriver]   = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedTrip, setSelectedTrip]       = useState('');
  const [loading, setLoading]             = useState(false);
  const [streamKey, setStreamKey]         = useState(Date.now());
  const [streamError, setStreamError]     = useState(false);
  const statusInterval                    = useRef(null);

  const { isMobile, isTablet } = useResponsive();

  useEffect(() => {
    loadData();
    checkStatus();
    statusInterval.current = setInterval(checkStatus, 4000);
    return () => clearInterval(statusInterval.current);
  }, []);

  const loadData = async () => {
    try {
      const { getDrivers, getVehicles, getTrips } = await import('../services/api');
      const [d, v, t] = await Promise.all([getDrivers(), getVehicles(), getTrips()]);
      setDrivers(d);
      setVehicles(v);
      setTrips(t.filter(trip => trip.status === 'ONGOING'));
    } catch (err) { console.error(err); }
  };

  const checkStatus = async () => {
    try {
      const { getPythonStatus } = await import('../services/api');
      const data = await getPythonStatus();
      setStatus(data);
    } catch {
      setStatus({ monitoring_active: false });
    }
  };

  const startMonitoring = async () => {
    if (!selectedDriver || !selectedVehicle || !selectedTrip) {
      alert('Please select Driver, Vehicle, and Trip');
      return;
    }
    setLoading(true);
    setStreamError(false);
    try {
      const driverObj  = drivers.find(d => String(d.id) === String(selectedDriver));
      const vehicleObj = vehicles.find(v => String(v.vehicleId) === String(selectedVehicle));
      const tripObj    = trips.find(t => String(t.tripId) === String(selectedTrip));

      const driverName  = driverObj  ? (driverObj.user?.firstName + ' ' + driverObj.user?.lastName).trim() : '';
      const vehicleName = vehicleObj ? (vehicleObj.model + ' (' + vehicleObj.plateNumber + ')') : '';
      const tripName    = tripObj    ? (tripObj.tripName || 'Trip #' + tripObj.tripId) : '';

      const res = await fetch('http://localhost:5000/api/monitoring/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driver_id:    Number(selectedDriver),
          vehicle_id:   Number(selectedVehicle),
          trip_id:      Number(selectedTrip),
          driver_name:  driverName,
          vehicle_name: vehicleName,
          trip_name:    tripName,
        }),
      });
      if (!res.ok) throw new Error('Failed to start');
      setTimeout(() => setStreamKey(Date.now()), 2000);
      checkStatus();
    } catch (err) {
      alert('Failed to start monitoring: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const stopMonitoring = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${PYTHON_URL}/api/monitoring/stop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Stop failed');
      const tripId = status?.current_session?.trip_id;
      if (tripId) {
        try {
          const { updateTrip } = await import('../services/api');
          await updateTrip(tripId, { status: 'COMPLETED' });
        } catch (e) { console.error('Trip update (non-critical):', e); }
      }
      setStreamKey(Date.now());
      loadData();
      checkStatus();
    } catch (err) {
      alert('Failed to stop monitoring: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const driverTrips = trips.filter(t => String(t.driverId) === String(selectedDriver));

  const isActive = status?.monitoring_active;

  // ── Responsive values ──
  const outerPadding     = isMobile ? '16px 12px 40px' : isTablet ? '20px 16px 44px' : '28px 24px 48px';
  const headingFontSize  = isMobile ? '22px' : isTablet ? '26px' : '32px';
  const videoHeight      = isMobile ? '220px' : isTablet ? '340px' : '460px';
  const cardBodyPadding  = isMobile ? '16px' : '24px';
  const selectGridCols   = isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(200px, 1fr))';
  const btnFontSize      = isMobile ? '13px' : '15px';
  const btnPadding       = isMobile ? '12px 14px' : '14px 24px';
  const statusBarPadding = isMobile ? '12px 14px' : '14px 20px';
  const statusFontSize   = isMobile ? '14px' : '16px';
  const statusInfoSize   = isMobile ? '11px' : '13px';

  return (
    <div style={{ padding: outerPadding, fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap');
        @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.6;transform:scale(1.25)} }
        @keyframes spin { to { transform: rotate(360deg); } }
        .select-field { width:100%; padding:12px 16px; border:2px solid #e5e7eb; border-radius:8px; font-size:14px; font-family:'Inter',sans-serif; color:#1f2937; background:white; transition:border-color .3s,box-shadow .3s; appearance:none; cursor:pointer; }
        .select-field:focus { outline:none; border-color:#84CC16; box-shadow:0 0 0 3px rgba(132,204,22,.12); }
        .select-field:disabled { background:#f9fafb; color:#9ca3af; cursor:not-allowed; }
        .btn-start { flex:1; padding:${btnPadding}; background:linear-gradient(135deg,#84CC16,#65A30D); color:white; border:none; border-radius:50px; font-weight:700; font-size:${btnFontSize}; font-family:'Inter',sans-serif; cursor:pointer; transition:all .3s; display:flex; align-items:center; justify-content:center; gap:6px; min-width:0; white-space:nowrap; overflow:hidden; }
        .btn-start:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 12px 24px rgba(132,204,22,.3); }
        .btn-start:disabled { opacity:.45; cursor:not-allowed; }
        .btn-stop { flex:1; padding:${btnPadding}; background:linear-gradient(135deg,#ef4444,#dc2626); color:white; border:none; border-radius:50px; font-weight:700; font-size:${btnFontSize}; font-family:'Inter',sans-serif; cursor:pointer; transition:all .3s; display:flex; align-items:center; justify-content:center; gap:6px; min-width:0; white-space:nowrap; overflow:hidden; }
        .btn-stop:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 12px 24px rgba(239,68,68,.3); }
        .btn-stop:disabled { opacity:.45; cursor:not-allowed; }
        .refresh-btn { background:white; border:2px solid #e5e7eb; border-radius:50px; width:44px; height:44px; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all .3s; color:#6b7280; flex-shrink:0; }
        .refresh-btn:hover { background:#84CC16; border-color:#84CC16; color:white; transform:scale(1.1); }
      `}</style>

      <div style={{ width: '100%' }}>

        {/* HEADER */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <h1 style={{
            color: '#1f2937',
            margin: 0,
            fontSize: headingFontSize,
            fontWeight: 800,
            fontFamily: "'Poppins',sans-serif",
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
          }}>
            <svg width={isMobile ? '24' : '32'} height={isMobile ? '24' : '32'} viewBox="0 0 24 24" fill="none" stroke="#84CC16" strokeWidth="2.5" style={{ flexShrink: 0 }}>
              <path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2"/>
            </svg>
            Live Monitoring Control
          </h1>
          <button className="refresh-btn" title="Refresh" onClick={checkStatus}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36M20.49 15a9 9 0 0 1-14.85 3.36"/>
            </svg>
          </button>
        </div>

        {/* LIVE VIDEO STREAM */}
        <div style={{
          background: '#111',
          borderRadius: '16px',
          overflow: 'hidden',
          marginBottom: '16px',
          position: 'relative',
          height: videoHeight,
        }}>
          {isActive ? (
            <>
              {!streamError ? (
                <img
                  key={streamKey}
                  src={`${PYTHON_URL}/api/stream?t=${streamKey}`}
                  alt="Live driver feed"
                  onError={() => setStreamError(true)}
                  style={{ width:'100%', height:'100%', objectFit:'contain', display:'block' }}
                />
              ) : (
                <div style={{ height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:'#666', padding: '0 16px', textAlign: 'center' }}>
                  <p style={{ margin:0, fontSize: isMobile ? 13 : 14 }}>Stream initialising — camera is warming up...</p>
                  <button
                    onClick={() => { setStreamError(false); setStreamKey(Date.now()); }}
                    style={{ marginTop:12, padding:'8px 16px', background:'#84CC16', color:'white', border:'none', borderRadius:6, cursor:'pointer', fontSize:13 }}
                  >
                    Retry stream
                  </button>
                </div>
              )}
              <div style={{ position:'absolute', top:14, left:14, background:'#e53e3e', color:'white', fontSize:11, fontWeight:700, padding:'4px 10px', borderRadius:4, letterSpacing:1, display:'flex', alignItems:'center', gap:6 }}>
                <div style={{ width:7, height:7, borderRadius:'50%', background:'white', animation:'pulse-dot 1.4s ease-in-out infinite' }} />
                LIVE
              </div>
              {status?.current_session && (
                <div style={{
                  position: 'absolute',
                  bottom: 12,
                  left: 12,
                  right: isMobile ? 12 : 'auto',
                  background: 'rgba(0,0,0,0.65)',
                  color: 'white',
                  fontSize: isMobile ? 11 : 12,
                  padding: '6px 12px',
                  borderRadius: 6,
                  whiteSpace: isMobile ? 'normal' : 'nowrap',
                  lineHeight: isMobile ? '1.6' : '1',
                }}>
                  {isMobile ? (
                    <>
                      Driver {status.current_session.driver_id}<br />
                      Vehicle {status.current_session.vehicle_id} · Trip {status.current_session.trip_id}
                    </>
                  ) : (
                    <>
                      Driver {status.current_session.driver_id} &nbsp;|&nbsp;
                      Vehicle {status.current_session.vehicle_id} &nbsp;|&nbsp;
                      Trip {status.current_session.trip_id}
                    </>
                  )}
                </div>
              )}
            </>
          ) : (
            <div style={{ height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:'#555', gap:12, padding: '0 24px', textAlign: 'center' }}>
              <svg width={isMobile ? '36' : '48'} height={isMobile ? '36' : '48'} viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="1.5">
                <path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2"/>
                <line x1="1" y1="1" x2="23" y2="23" stroke="#666"/>
              </svg>
              <p style={{ margin:0, fontSize: isMobile ? 13 : 14 }}>Camera inactive — start a monitoring session to see the live feed</p>
            </div>
          )}
        </div>

        {/* STATUS BAR */}
        <div style={{
          borderRadius: '12px',
          padding: statusBarPadding,
          marginBottom: '20px',
          background: isActive ? 'rgba(132,204,22,0.06)' : 'rgba(107,114,128,0.06)',
          border: `2px solid ${isActive ? '#84CC16' : '#e5e7eb'}`,
          display: 'flex',
          alignItems: isMobile ? 'flex-start' : 'center',
          gap: isMobile ? '10px' : '16px',
          transition: 'all .4s',
          boxShadow: isActive ? '0 0 0 4px rgba(132,204,22,.08)' : 'none',
          flexWrap: isMobile ? 'wrap' : 'nowrap',
        }}>
          <div style={{
            width: '14px', height: '14px', borderRadius: '50%', flexShrink: 0,
            background: isActive ? '#84CC16' : '#9ca3af',
            animation: isActive ? 'pulse-dot 1.4s ease-in-out infinite' : 'none',
            boxShadow: isActive ? '0 0 0 5px rgba(132,204,22,.2)' : 'none',
            marginTop: isMobile ? '3px' : '0',
          }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={{ fontWeight:700, fontSize: statusFontSize, fontFamily:"'Poppins',sans-serif", color: isActive ? '#3f6212' : '#374151' }}>
              {isActive ? 'Monitoring Active' : 'Monitoring Inactive'}
            </span>
            <span style={{
              display: isMobile ? 'block' : 'inline',
              marginLeft: isMobile ? 0 : 12,
              marginTop: isMobile ? '2px' : 0,
              fontSize: statusInfoSize,
              color: '#9ca3af',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: isMobile ? 'normal' : 'nowrap',
            }}>
              {isActive
                ? `Driver ${status?.current_session?.driver_id} · Vehicle ${status?.current_session?.vehicle_id} · Trip ${status?.current_session?.trip_id}`
                : 'No active session'}
            </span>
          </div>
          <span style={{
            padding: '4px 14px', borderRadius: '20px', fontWeight: 700, fontSize: '11px', letterSpacing: .5,
            background: isActive ? 'rgba(132,204,22,.15)' : 'rgba(107,114,128,.12)',
            color: isActive ? '#3f6212' : '#6b7280',
            border: `1px solid ${isActive ? '#84CC16' : '#d1d5db'}`,
            flexShrink: 0,
            alignSelf: isMobile ? 'flex-start' : 'center',
          }}>
            {isActive ? 'LIVE' : 'OFFLINE'}
          </span>
        </div>

        {/* SESSION CONFIG CARD */}
        <div style={{ background:'white', borderRadius:'16px', overflow:'hidden', boxShadow:'0 10px 30px rgba(0,0,0,.08)', border:'1px solid #e5e7eb' }}>
          <div style={{ background:'linear-gradient(135deg,#84CC16,#65A30D)', padding: isMobile ? '14px 16px' : '16px 24px' }}>
            <h3 style={{ margin:0, fontSize: isMobile ? '14px' : '16px', fontWeight:700, color:'white', fontFamily:"'Poppins',sans-serif" }}>
              New Monitoring Session
            </h3>
            <p style={{ margin:'2px 0 0', fontSize:'12px', color:'rgba(255,255,255,.8)' }}>
              Select a driver, vehicle, and active trip to begin
            </p>
          </div>

          <div style={{ padding: cardBodyPadding }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: selectGridCols,
              gap: isMobile ? '14px' : '20px',
              marginBottom: isMobile ? '16px' : '24px',
            }}>

              {/* Driver Select */}
              <div>
                <label style={{ display:'block', fontWeight:600, marginBottom:8, color:'#1f2937', fontSize:14 }}>Select Driver *</label>
                <div style={{ position:'relative' }}>
                  <select
                    className="select-field"
                    value={selectedDriver}
                    onChange={e => {
                      setSelectedDriver(e.target.value);
                      setSelectedTrip('');
                    }}
                    disabled={isActive}
                  >
                    <option value="">Choose driver...</option>
                    {drivers.map(d => (
                      <option key={d.id} value={d.id}>{d.user?.firstName} {d.user?.lastName} ({d.licenseNumber})</option>
                    ))}
                  </select>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}><polyline points="6 9 12 15 18 9"/></svg>
                </div>
              </div>

              {/* Vehicle Select */}
              <div>
                <label style={{ display:'block', fontWeight:600, marginBottom:8, color:'#1f2937', fontSize:14 }}>Select Vehicle *</label>
                <div style={{ position:'relative' }}>
                  <select className="select-field" value={selectedVehicle} onChange={e => setSelectedVehicle(e.target.value)} disabled={isActive}>
                    <option value="">Choose vehicle...</option>
                    {vehicles.map(v => (
                      <option key={v.vehicleId} value={v.vehicleId}>{v.model} ({v.plateNumber})</option>
                    ))}
                  </select>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}><polyline points="6 9 12 15 18 9"/></svg>
                </div>
              </div>

              {/* Trip Select */}
              <div style={{ gridColumn: isMobile ? 'auto' : isTablet ? '1 / -1' : 'auto' }}>
                <label style={{ display:'block', fontWeight:600, marginBottom:8, color:'#1f2937', fontSize:14 }}>Select Trip *</label>
                <div style={{ position:'relative' }}>
                  <select
                    className="select-field"
                    value={selectedTrip}
                    onChange={e => setSelectedTrip(e.target.value)}
                    disabled={isActive || !selectedDriver}
                  >
                    <option value="">
                      {!selectedDriver
                        ? 'Select a driver first...'
                        : driverTrips.length === 0
                          ? 'No ongoing trips for this driver'
                          : 'Choose trip...'}
                    </option>
                    {driverTrips.map(t => (
                      <option key={t.tripId} value={t.tripId}>
                        Trip #{t.tripId} — {t.tripName || t.status}
                      </option>
                    ))}
                  </select>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}><polyline points="6 9 12 15 18 9"/></svg>
                </div>
              </div>

            </div>

            {isActive && (
              <div style={{ background:'rgba(132,204,22,.08)', border:'1px solid rgba(132,204,22,.3)', borderRadius:8, padding: isMobile ? '10px 12px' : '10px 16px', marginBottom: isMobile ? '14px' : '20px', fontSize:13, color:'#3f6212' }}>
                Monitoring is active. Stop the current session before starting a new one.
              </div>
            )}

            <div style={{ display:'flex', gap: isMobile ? '10px' : '16px', flexWrap:'wrap' }}>
              <button className="btn-start" onClick={startMonitoring} disabled={isActive || loading}>
                {loading && !isActive
                  ? <div style={{ width:16, height:16, border:'2px solid rgba(255,255,255,.4)', borderTop:'2px solid white', borderRadius:'50%', animation:'spin .8s linear infinite', flexShrink:0 }} />
                  : !isMobile && <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink:0 }}><polygon points="5 3 19 12 5 21 5 3"/></svg>
                }
                {loading && !isActive ? 'Starting...' : 'Start Monitoring'}
              </button>

              <button className="btn-stop" onClick={stopMonitoring} disabled={!isActive || loading}>
                {loading && isActive
                  ? <div style={{ width:16, height:16, border:'2px solid rgba(255,255,255,.4)', borderTop:'2px solid white', borderRadius:'50%', animation:'spin .8s linear infinite', flexShrink:0 }} />
                  : !isMobile && <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink:0 }}><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
                }
                {loading && isActive ? 'Stopping...' : 'Stop Monitoring'}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MonitoringControl;
