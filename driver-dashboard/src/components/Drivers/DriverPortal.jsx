import React, { useState, useEffect, useCallback } from 'react';

// ── Auth helpers ──────────────────────────────────────────────────────────
const getToken = () => localStorage.getItem('dg_token');
const getUser  = () => { try { return JSON.parse(localStorage.getItem('dg_user')); } catch { return null; } };
const API_BASE   = 'http://localhost:8080/api/v1';
const FLASK_BASE = 'http://localhost:5000';

const decodeJWT = (token) => {
  try { return JSON.parse(atob(token.split('.')[1])); } catch { return null; }
};

// ── Global styles ─────────────────────────────────────────────────────────
const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
  * { box-sizing: border-box; }
  @keyframes spin      { to { transform: rotate(360deg); } }
  @keyframes fadeUp    { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
  @keyframes pulse-dot { 0%,100%{transform:scale(1)} 50%{transform:scale(1.35)} }
  @keyframes orbit     { from{transform:rotate(0deg) translateX(42px) rotate(0deg)} to{transform:rotate(360deg) translateX(42px) rotate(-360deg)} }
  @keyframes modalIn   { from{opacity:0;transform:scale(.94) translateY(12px)} to{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes shimmer   { from{background-position:-200% 0} to{background-position:200% 0} }
  @keyframes slideUp   { from{opacity:0;transform:translateY(100%)} to{opacity:1;transform:translateY(0)} }

  .dg-main {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
  }
  .dg-main > * { animation: fadeUp .35s ease both; }
  .dg-main > *:nth-child(2){animation-delay:.07s}
  .dg-main > *:nth-child(3){animation-delay:.13s}
  .dg-main > *:nth-child(4){animation-delay:.19s}

  .dg-stat:hover { transform:translateY(-2px); box-shadow:0 10px 30px rgba(0,0,0,.1) !important; }
  .dg-stat { transition: transform .2s ease, box-shadow .2s ease; }
  .dg-nav:hover { background:rgba(255,255,255,.13) !important; }
  .dg-row:hover td { background:#f4fce8 !important; }
  .ps-retry:hover { background:#5fa820 !important; color:#fff !important; transform:translateY(-1px); box-shadow:0 6px 20px rgba(95,168,32,.28) !important; }
  .ps-out:hover   { color:#ef4444 !important; }

  .shot-btn {
    display:inline-flex; align-items:center; gap:6px;
    padding:6px 14px; border-radius:8px; border:1.5px solid #bfdbfe;
    background:#eff6ff; color:#1d4ed8; cursor:pointer;
    font-size:11px; font-weight:700;
    font-family:"Plus Jakarta Sans",sans-serif;
    transition:all .15s ease;
    white-space:nowrap;
  }
  .shot-btn:hover { background:#dbeafe !important; border-color:#93c5fd !important; transform:translateY(-1px); box-shadow:0 4px 12px rgba(29,78,216,.18) !important; }

  .modal-nav-btn {
    width:40px; height:40px; border-radius:50%; border:none; cursor:pointer;
    display:flex; align-items:center; justify-content:center;
    transition:all .15s ease;
  }
  .modal-nav-btn:hover:not(:disabled) { background:#f4fce8 !important; color:#5fa820 !important; transform:scale(1.08); }
  .modal-nav-btn:disabled { opacity:.3; cursor:not-allowed; }
  .modal-close-btn:hover { background:#fee2e2 !important; color:#dc2626 !important; }

  /* Mobile bottom-nav active indicator */
  .mob-nav-active { color:#5fa820 !important; }
  .mob-nav-active svg { color:#5fa820 !important; }

  ::-webkit-scrollbar { width:4px; }
  ::-webkit-scrollbar-track { background:transparent }
  ::-webkit-scrollbar-thumb { background:#d4edaa; border-radius:10px }
  button { outline: 0 !important; }
`;

// ── Icons ─────────────────────────────────────────────────────────────────
const Svg = ({ children, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
    style={{ display:'block', flexShrink:0 }}>{children}</svg>
);
const Icons = {
  Dashboard:  () => <Svg><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></Svg>,
  Violations: () => <Svg><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></Svg>,
  Trips:      () => <Svg><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></Svg>,
  Profile:    () => <Svg><circle cx="12" cy="8" r="4"/><path d="M2 21a10 10 0 0 1 20 0"/></Svg>,
  LogOut:     () => <Svg size={17}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></Svg>,
  Phone:      () => <Svg size={15}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></Svg>,
  Eye:        () => <Svg size={15}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></Svg>,
  Sleep:      () => <Svg size={15}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></Svg>,
  Belt:       () => <Svg size={15}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></Svg>,
  Car:        () => <Svg size={15}><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></Svg>,
  Clock:      () => <Svg size={14}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></Svg>,
  Warning:    () => <Svg size={15}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></Svg>,
  Shield:     () => <Svg size={18}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></Svg>,
  ShieldLg:   () => <Svg size={22}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></Svg>,
  Refresh:    () => <Svg size={15}><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></Svg>,
  Info:       () => <Svg size={16}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></Svg>,
  Camera:     () => <Svg size={14}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></Svg>,
  Download:   () => <Svg size={14}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></Svg>,
  ChevLeft:   () => <Svg size={18}><polyline points="15 18 9 12 15 6"/></Svg>,
  ChevRight:  () => <Svg size={18}><polyline points="9 18 15 12 9 6"/></Svg>,
  X:          () => <Svg size={16}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></Svg>,
  ImgBroken:  () => <Svg size={40}><rect x="2" y="5" width="20" height="15" rx="2"/><circle cx="12" cy="13" r="3"/><path d="M9 5V3h6v2"/><line x1="2" y1="2" x2="22" y2="22"/></Svg>,
  Menu:       () => <Svg size={20}><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></Svg>,
};

// ── Violation helpers ─────────────────────────────────────────────────────
const VMETA = {
  PHONE_USE:          { label:'Phone Use',        color:'#ef4444', bg:'rgba(239,68,68,.1)',   Icon: Icons.Phone   },
  DROWSY:             { label:'Drowsiness',       color:'#f59e0b', bg:'rgba(245,158,11,.1)',  Icon: Icons.Sleep   },
  DROWSINESS:         { label:'Drowsiness',       color:'#f59e0b', bg:'rgba(245,158,11,.1)',  Icon: Icons.Sleep   },
  DISTRACTED:         { label:'Distracted',       color:'#fb923c', bg:'rgba(251,146,60,.1)',  Icon: Icons.Eye     },
  DISTRACTION:        { label:'Distracted',       color:'#fb923c', bg:'rgba(251,146,60,.1)',  Icon: Icons.Eye     },
  NO_SEATBELT:        { label:'No Seatbelt',      color:'#a78bfa', bg:'rgba(167,139,250,.1)', Icon: Icons.Belt    },
  FATIGUE:            { label:'Fatigue',          color:'#f59e0b', bg:'rgba(245,158,11,.1)',  Icon: Icons.Sleep   },
  SMOKING:            { label:'Smoking',          color:'#64748b', bg:'rgba(100,116,139,.1)', Icon: Icons.Warning },
  DRUNK_DRIVING:      { label:'Drunk Driving',    color:'#dc2626', bg:'rgba(220,38,38,.12)',  Icon: Icons.Warning },
  UNAUTHORIZED_DRIVER:{ label:'Unknown Driver',   color:'#7c3aed', bg:'rgba(124,58,237,.1)', Icon: Icons.Warning },
  default:            { label:'Violation',        color:'#64748b', bg:'rgba(100,116,139,.1)', Icon: Icons.Warning },
};
const getVM = (t='') => VMETA[t.toUpperCase().replace(/ /g,'_')] || VMETA.default;

const getTripSt = (s) => {
  const v = String(s).toUpperCase();
  return (v==='COMPLETED'||v==='1'||v==='TRUE')
    ? { label:'Completed',   color:'#5fa820', bg:'#e9f7d0' }
    : { label:'In Progress', color:'#d97706', bg:'#fef3c7' };
};

const resolveIncidentType = (inc) => {
  const rawType = (inc?.incident_type ?? inc?.incidentType ?? '').toUpperCase().replace(/ /g,'_');
  if (rawType && rawType !== 'VIOLATION' && rawType !== '') return rawType;
  const desc = (inc?.description ?? '').toLowerCase();
  if (desc.includes('phone') || desc.includes('mobile') || desc.includes('cell')) return 'PHONE_USE';
  if (desc.includes('eyes closed') || desc.includes('eye') || desc.includes('drows') || desc.includes('drowsy') || desc.includes('sleep') || desc.includes('fatigue')) return 'DROWSY';
  if (desc.includes('seatbelt') || desc.includes('seat belt') || desc.includes('no seat')) return 'NO_SEATBELT';
  if (desc.includes('distract')) return 'DISTRACTED';
  if (desc.includes('smoking')) return 'SMOKING';
  if (desc.includes('drunk')) return 'DRUNK_DRIVING';
  return rawType || 'VIOLATION';
};

// ── Score Ring ────────────────────────────────────────────────────────────
const ScoreRing = ({ score }) => {
  const r=52, c=2*Math.PI*r, p=Math.max(0,Math.min(100,score));
  const col = p>=80?'#7dc832':p>=60?'#fbbf24':'#f87171';
  return (
    <svg width={130} height={130} style={{ display:'block', margin:'0 auto' }}>
      <circle cx={65} cy={65} r={r} fill="none" stroke={`${col}22`} strokeWidth={10}/>
      <circle cx={65} cy={65} r={r} fill="none" stroke={col} strokeWidth={10}
        strokeDasharray={c} strokeDashoffset={c*(1-p/100)} strokeLinecap="round"
        transform="rotate(-90 65 65)"
        style={{ transition:'stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)', filter:`drop-shadow(0 0 7px ${col}88)` }}/>
      <text x={65} y={60} textAnchor="middle" fontSize={27} fontWeight={800} fill={col} fontFamily="'Plus Jakarta Sans',sans-serif">{p}</text>
      <text x={65} y={77} textAnchor="middle" fontSize={10} fill="#94a3b8" fontFamily="'Plus Jakarta Sans',sans-serif" fontWeight={600} letterSpacing="0.5">SAFETY SCORE</text>
    </svg>
  );
};

// ── Stat Card ─────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, color, accent, Ic }) => (
  <div className="dg-stat" style={{ background:'#fff', borderRadius:16, padding:'20px 22px', flex:1, minWidth:0, border:`1px solid ${accent}20`, boxShadow:'0 2px 10px rgba(0,0,0,.05)', position:'relative', overflow:'hidden' }}>
    <div style={{ position:'absolute', top:-16, right:-16, width:64, height:64, borderRadius:'50%', background:`${accent}0d` }}/>
    <div style={{ width:36, height:36, borderRadius:10, background:`${accent}15`, display:'flex', alignItems:'center', justifyContent:'center', color:accent, marginBottom:12 }}><Ic/></div>
    <div style={{ fontSize:30, fontWeight:900, color, letterSpacing:'-1px', lineHeight:1 }}>{value}</div>
    <div style={{ fontSize:13, color:'#374151', fontWeight:600, marginTop:5 }}>{label}</div>
    <div style={{ fontSize:11, color:'#9ca3af', marginTop:2 }}>{sub}</div>
  </div>
);

// ══════════════════════════════════════════════════════════════════════════
//  PENDING SETUP SCREEN
// ══════════════════════════════════════════════════════════════════════════
const PendingSetupScreen = ({ displayUser, fullName, onRetry, onLogout }) => {
  const [retrying, setRetrying] = useState(false);
  const ini = (displayUser?.firstName||displayUser?.email||'D')[0].toUpperCase();
  const handleRetry = async () => {
    setRetrying(true);
    await new Promise(r=>setTimeout(r,1400));
    setRetrying(false); onRetry();
  };
  const steps = [
    { label:'Account Created',      desc:'Login credentials verified & active',       done:true },
    { label:'Driver Profile Setup', desc:'Administrator is configuring your profile', active:true },
    { label:'Ready to Drive',       desc:'Full dashboard access will be unlocked',    done:false },
  ];
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 sm:p-6" style={{ fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
      <style>{GLOBAL_STYLES}</style>
      <div className="w-full max-w-3xl rounded-2xl overflow-hidden flex flex-col md:flex-row bg-white shadow-2xl" style={{ minHeight: 'auto' }}>
        {/* Left green panel */}
        <div className="w-full md:w-5/12 relative flex flex-col items-center justify-center p-8 md:p-11 text-center overflow-hidden"
          style={{ background:'linear-gradient(160deg,#a3e635 0%,#7dc832 25%,#6db82a 60%,#5fa820 100%)', minHeight: 280 }}>
          <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full opacity-10" style={{ background:'rgba(255,255,255,.3)' }}/>
          <div className="absolute -bottom-12 -right-12 w-40 h-40 rounded-full opacity-10" style={{ background:'rgba(255,255,255,.2)' }}/>
          <div className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full"
            style={{ background:'rgba(255,255,255,.15)', backdropFilter:'blur(8px)', border:'1px solid rgba(255,255,255,.25)' }}>
            <div className="w-6 h-6 rounded-lg flex items-center justify-center text-white" style={{ background:'rgba(255,255,255,.25)' }}><Icons.ShieldLg/></div>
            <span className="text-xs font-extrabold text-white tracking-widest uppercase">DriveGuard AI</span>
          </div>
          <div className="relative w-24 h-24 mb-6">
            <div className="absolute inset-0 -m-3.5 rounded-full" style={{ border:'1.5px dashed rgba(255,255,255,.25)' }}/>
            <div className="absolute top-1/2 left-1/2 -mt-1.5 -ml-1.5 w-3 h-3 rounded-full" style={{ background:'rgba(255,255,255,.7)', animation:'orbit 4s linear infinite' }}/>
            <div className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-extrabold"
              style={{ background:'rgba(255,255,255,.18)', backdropFilter:'blur(10px)', border:'2.5px solid rgba(255,255,255,.5)' }}>{ini}</div>
          </div>
          <div className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color:'rgba(255,255,255,.75)' }}>Welcome Aboard</div>
          <div className="text-xl font-extrabold text-white mb-1" style={{ letterSpacing:'-0.4px' }}>{fullName}</div>
          <div className="text-sm" style={{ color:'rgba(255,255,255,.65)' }}>{displayUser?.email}</div>
        </div>

        {/* Right content panel */}
        <div className="flex-1 flex flex-col justify-center p-8 md:p-10">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
            style={{ background:'#f4fce8', border:'1px solid #d4edaa', color:'#5fa820' }}><Icons.ShieldLg/></div>
          <div className="text-xl font-extrabold text-gray-900 mb-2" style={{ letterSpacing:'-0.5px' }}>Account Setup in Progress</div>
          <div className="text-sm text-gray-500 leading-relaxed mb-5">Your account is live but your driver profile is pending activation.</div>
          <div className="inline-flex items-center gap-2 self-start px-4 py-1.5 rounded-full mb-6"
            style={{ background:'#fffbeb', border:'1px solid #fde68a' }}>
            <div className="w-2 h-2 rounded-full" style={{ background:'#f59e0b', boxShadow:'0 0 0 3px rgba(245,158,11,.2)', animation:'pulse-dot 1.8s ease infinite' }}/>
            <span className="text-xs font-bold tracking-wider uppercase" style={{ color:'#92400e' }}>Profile Pending</span>
          </div>
          <div className="mb-6">
            {steps.map((step,i)=>(
              <div key={i} className="flex gap-3.5">
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background:step.done?'linear-gradient(135deg,#7dc832,#5fa820)':step.active?'#fff':'#f1f5f9', border:step.active?'2px solid #f59e0b':'none', boxShadow:step.active?'0 0 0 4px rgba(245,158,11,.12)':'none' }}>
                    {step.done?<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                     :step.active?<div className="w-2.5 h-2.5 rounded-full" style={{ background:'#f59e0b' }}/>
                     :<div className="w-2.5 h-2.5 rounded-full bg-slate-300"/>}
                  </div>
                  {i<steps.length-1&&<div className="w-0.5 my-1 rounded-sm" style={{ height:26, background:step.done?'linear-gradient(#a3e635,#e2e8f0)':'#e2e8f0' }}/>}
                </div>
                <div className="pt-1">
                  <div className="text-sm" style={{ fontWeight:step.active||step.done?700:500, color:step.done?'#5fa820':step.active?'#92400e':'#94a3b8' }}>{step.label}</div>
                  <div className="text-xs mt-0.5" style={{ color:step.active?'#b45309':'#94a3b8', marginBottom:i<steps.length-1?4:0 }}>{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <button onClick={handleRetry} disabled={retrying}
            className="w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold mb-2.5 transition-all"
            style={{ background:'transparent', border:'2px solid #6db82a', color:'#5fa820', fontFamily:"'Plus Jakarta Sans',sans-serif", cursor:retrying?'not-allowed':'pointer' }}>
            {retrying?<><div className="w-4 h-4 rounded-full border-2 border-t-transparent" style={{ borderColor:'#6db82a', borderTopColor:'transparent', animation:'spin .7s linear infinite' }}/>Checking your profile…</>:<><Icons.Refresh/>Check Again</>}
          </button>
          <button onClick={onLogout}
            className="w-full py-2.5 rounded-xl text-sm font-medium text-gray-400 border-none bg-transparent cursor-pointer"
            style={{ fontFamily:"'Plus Jakarta Sans',sans-serif" }}>← Back to Sign In</button>
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════
//  SCREENSHOT MODAL
// ══════════════════════════════════════════════════════════════════════════
const ScreenshotModal = ({ modalShot, setModalShot, parseScreenshotFilename }) => {
  const [imgErr,  setImgErr]  = useState(false);
  const [imgLoad, setImgLoad] = useState(true);

  const current = modalShot ? modalShot.siblings[modalShot.index] : null;

  useEffect(() => {
    if (!current) return;
    console.log('DEBUG Modal: Loading image URL:', current.url);
    setImgErr(false);
    setImgLoad(true);
  }, [current?.url]);

  if (!modalShot || !current) return null;

  const { siblings, index, violationType } = modalShot;
  const hasPrev = index > 0;
  const hasNext = index < siblings.length - 1;
  const m       = getVM(violationType);
  const parsed  = parseScreenshotFilename(current.filename);

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href     = current.url;
    a.download = current.filename;
    a.target   = '_blank';
    a.click();
  };

  const formattedDate = parsed
    ? parsed.ts.toLocaleString('en-US', {
        month:'short', day:'numeric', year:'numeric',
        hour:'2-digit', minute:'2-digit', second:'2-digit',
      })
    : '—';

  return (
    <div
      onClick={() => setModalShot(null)}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
      style={{ background:'rgba(0,0,0,.75)', backdropFilter:'blur(6px)' }}>
      <div
        onClick={e => e.stopPropagation()}
        className="bg-white w-full sm:rounded-2xl sm:max-w-xl overflow-hidden"
        style={{
          boxShadow:'0 40px 100px rgba(0,0,0,.45)',
          fontFamily:"'Plus Jakarta Sans',sans-serif",
          animation:'modalIn .22s cubic-bezier(.4,0,.2,1)',
          borderRadius:'20px 20px 0 0',
        }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom:'1px solid #f1f5f9', background:'linear-gradient(135deg,#f4fce8 0%,#fff 70%)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background:m.bg, color:m.color }}><m.Icon/></div>
            <div>
              <div className="text-sm font-extrabold text-gray-900">Violation Screenshot</div>
              <div className="text-xs text-gray-400 mt-0.5 max-w-[200px] sm:max-w-xs truncate">{current.filename}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ color:m.color, background:m.bg }}>{m.label}</span>
            <button className="modal-nav-btn modal-close-btn" onClick={() => setModalShot(null)}
              style={{ background:'#f9fafb', color:'#6b7280', border:'1px solid #e5e7eb' }}>
              <Icons.X/>
            </button>
          </div>
        </div>

        {/* Image area */}
        <div className="relative flex items-center justify-center overflow-hidden"
          style={{ background:'#0f172a', minHeight:240, maxHeight:360 }}>
          {siblings.length > 1 && (
            <div className="absolute top-3 right-3 text-xs font-bold text-white px-2.5 py-1 rounded-full z-10"
              style={{ background:'rgba(0,0,0,.6)', backdropFilter:'blur(4px)' }}>
              {index + 1} / {siblings.length}
            </div>
          )}

          {imgLoad && !imgErr && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-20">
              <div className="w-10 h-10 rounded-full border-3" style={{ border:'3px solid rgba(255,255,255,.12)', borderTopColor:'#c8e6a0', animation:'spin .7s linear infinite' }}/>
              <div className="text-xs font-medium" style={{ color:'rgba(255,255,255,.35)' }}>Loading screenshot…</div>
              <div className="text-xs" style={{ color:'rgba(255,255,255,.2)' }}>{current.url}</div>
            </div>
          )}

          {imgErr && (
            <div className="flex flex-col items-center gap-3 text-center p-10" style={{ color:'rgba(255,255,255,.35)' }}>
              <div style={{ opacity:.4 }}><Icons.ImgBroken/></div>
              <div className="text-sm font-semibold" style={{ color:'rgba(255,255,255,.5)' }}>Image not available</div>
              <div className="text-xs max-w-[260px]" style={{ color:'rgba(255,255,255,.25)' }}>Could not load: {current.url}</div>
              <div className="text-xs" style={{ color:'rgba(255,255,255,.25)' }}>Make sure Flask has the /api/screenshots/&lt;filename&gt; route and CORS is enabled.</div>
            </div>
          )}

          {!imgErr && (
            <img key={current.url} src={current.url} alt={current.filename} crossOrigin="anonymous"
              onLoad={() => { setImgLoad(false); }}
              onError={() => { setImgLoad(false); setImgErr(true); }}
              style={{ maxWidth:'100%', maxHeight:360, objectFit:'contain', display:imgLoad?'none':'block', margin:'0 auto' }}/>
          )}

          {siblings.length > 1 && (
            <>
              <button className="modal-nav-btn" onClick={() => setModalShot(p => ({ ...p, index: p.index - 1 }))}
                disabled={!hasPrev}
                style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', background:hasPrev?'rgba(255,255,255,.92)':'rgba(255,255,255,.15)', color:hasPrev?'#374151':'rgba(255,255,255,.25)', zIndex:5, border:'none' }}>
                <Icons.ChevLeft/>
              </button>
              <button className="modal-nav-btn" onClick={() => setModalShot(p => ({ ...p, index: p.index + 1 }))}
                disabled={!hasNext}
                style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:hasNext?'rgba(255,255,255,.92)':'rgba(255,255,255,.15)', color:hasNext?'#374151':'rgba(255,255,255,.25)', zIndex:5, border:'none' }}>
                <Icons.ChevRight/>
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3.5" style={{ borderTop:'1px solid #f1f5f9', background:'#fafafa' }}>
          <div>
            <div className="text-xs text-gray-500">
              Captured <span className="text-gray-900 font-bold">{formattedDate}</span>
            </div>
            {siblings.length > 1 && (
              <div className="text-xs text-gray-400 mt-0.5">{siblings.length} screenshots for this violation</div>
            )}
          </div>
          <div className="flex gap-2 items-center">
            {siblings.length > 1 && (
              <>
                <button className="modal-nav-btn" onClick={() => setModalShot(p => ({ ...p, index: p.index - 1 }))}
                  disabled={!hasPrev}
                  style={{ width:34, height:34, background:hasPrev?'#fff':'#f9fafb', color:hasPrev?'#374151':'#d1d5db', border:'1px solid #e5e7eb' }}>
                  <Icons.ChevLeft/>
                </button>
                <button className="modal-nav-btn" onClick={() => setModalShot(p => ({ ...p, index: p.index + 1 }))}
                  disabled={!hasNext}
                  style={{ width:34, height:34, background:hasNext?'#fff':'#f9fafb', color:hasNext?'#374151':'#d1d5db', border:'1px solid #e5e7eb' }}>
                  <Icons.ChevRight/>
                </button>
              </>
            )}
            <button onClick={handleDownload}
              className="inline-flex items-center gap-1.5 text-xs font-bold cursor-pointer transition-all"
              style={{ padding:'7px 16px', borderRadius:9, border:'1.5px solid #d4edaa', background:'#f4fce8', color:'#5fa820', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
              <Icons.Download/> Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════
//  MAIN PORTAL
// ══════════════════════════════════════════════════════════════════════════
export default function DriverPortal() {
  const [user]  = useState(()=>getUser());
  const [token] = useState(()=>getToken());
  const [tab,           setTab]           = useState('dashboard');
  const [incidents,     setIncidents]     = useState([]);
  const [trips,         setTrips]         = useState([]);
  const [vehicles,      setVehicles]      = useState({});
  const [driverInfo,    setDriverInfo]    = useState(null);
  const [fullUserInfo,  setFullUserInfo]  = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [noProfile,     setNoProfile]     = useState(false);
  const [sideCollapsed, setSideCollapsed] = useState(false);
  const [mobileSideOpen,setMobileSideOpen]= useState(false);
  const [resolvedId,    setResolvedId]    = useState(null);
  const [screenshots,   setScreenshots]   = useState([]);
  const [modalShot,     setModalShot]     = useState(null);

  const authH = useCallback(()=>({ 'Content-Type':'application/json','Authorization':`Bearer ${token}` }),[token]);

  // ── Fetch screenshots list from Flask ─────────────────────────────────
  useEffect(() => {
    const url = `${FLASK_BASE}/api/screenshots`;
    console.log('DEBUG screenshots: Fetching list from', url);
    fetch(url)
      .then(r => { if (!r.ok) throw new Error('Status ' + r.status); return r.json(); })
      .then(data => {
        const rawList = data?.screenshots ?? (Array.isArray(data) ? data : []);
        const list = rawList
          .map(item => {
            if (typeof item === 'string') {
              const filename = item.split('/').pop();
              return { filename, url: `${FLASK_BASE}/api/screenshots/${encodeURIComponent(filename)}` };
            }
            const filename = item.filename ?? item.name ?? '';
            return { filename, url: `${FLASK_BASE}/api/screenshots/${encodeURIComponent(filename)}` };
          })
          .filter(s => s.filename);
        setScreenshots(list);
      })
      .catch(() => setScreenshots([]));
  }, []);

  const parseScreenshotFilename = useCallback((filename) => {
    const m = filename.match(/^(.+?)_(\d{8})_(\d{6})/);
    if (!m) return null;
    const [, rawType, d, t] = m;
    const ts = new Date(`${d.slice(0,4)}-${d.slice(4,6)}-${d.slice(6,8)}T${t.slice(0,2)}:${t.slice(2,4)}:${t.slice(4,6)}`);
    return { type: rawType.toUpperCase().replace(/-/g,'_'), ts };
  }, []);

  const normalizeTypeForMatch = useCallback((typeStr) => {
    const t = typeStr.toUpperCase().replace(/-/g,'_').replace(/\s/g,'_');
    if (t.includes('PHONE'))                               return 'PHONE_USE';
    if (t.includes('EYES_CLOSED') || t.includes('EYE'))   return 'DROWSY';
    if (t.includes('DROWS') || t.includes('SLEEP') || t.includes('FATIGUE')) return 'DROWSY';
    if (t.includes('SEATBELT') || t.includes('SEAT'))     return 'NO_SEATBELT';
    if (t.includes('DISTRACT'))                            return 'DISTRACTED';
    if (t.includes('SMOKING'))                             return 'SMOKING';
    if (t.includes('DRUNK'))                               return 'DRUNK_DRIVING';
    return t;
  }, []);

  const findMatchingShots = useCallback((inc) => {
    if (!screenshots.length) return [];
    const incType = resolveIncidentType(inc);
    const normalizedIncType = normalizeTypeForMatch(incType);
    const rawTime = inc?.timestamp ?? inc?.detectedAt ?? inc?.createdAt ?? null;
    const vTime = rawTime ? new Date(rawTime) : null;
    const parsed = screenshots.map(s => ({ ...s, parsed: parseScreenshotFilename(s.filename) })).filter(s => s.parsed !== null);
    const typeMatched = parsed.filter(s => normalizeTypeForMatch(s.parsed.type) === normalizedIncType);
    if (!typeMatched.length) return [];
    if (vTime) {
      const TIME_WINDOW_MS = 5 * 60 * 1000;
      const timeMatched = typeMatched.filter(s => Math.abs(s.parsed.ts - vTime) <= TIME_WINDOW_MS);
      if (timeMatched.length > 0) return timeMatched.sort((a, b) => a.parsed.ts - b.parsed.ts);
      const withDistance = typeMatched.map(s => ({ ...s, dist: Math.abs(s.parsed.ts - vTime) })).sort((a, b) => a.dist - b.dist);
      return withDistance.slice(0, 3).map(({ dist, ...s }) => s);
    }
    return typeMatched.sort((a, b) => b.parsed.ts - a.parsed.ts).slice(0, 3);
  }, [screenshots, parseScreenshotFilename, normalizeTypeForMatch]);

  useEffect(()=>{
    if(!token){ setError('No auth token.'); setLoading(false); return; }
    const resolve=async()=>{
      const direct=user?.id??user?.userId??user?.user_id;
      if(direct){ setResolvedId(direct); return; }
      const dec=decodeJWT(token);
      const jid=dec?.id??dec?.userId??dec?.user_id??dec?.sub;
      if(jid&&!isNaN(Number(jid))){ setResolvedId(Number(jid)); return; }
      try{ const r=await fetch(`${API_BASE}/auth/me`,{headers:authH()}); if(r.ok){const d=await r.json();const id=d?.id??d?.data?.id;if(id){setResolvedId(id);return;}} }catch{}
      const em=user?.email??dec?.email;
      if(em){ try{ const r=await fetch(`${API_BASE}/users`,{headers:authH()}); if(r.ok){const d=await r.json();const list=Array.isArray(d)?d:(d.data??[]);const f=list.find(u=>u.email===em);if(f?.id){setResolvedId(f.id);return;}} }catch{} }
      setError('Could not verify session.'); setLoading(false);
    };
    resolve();
  },[token]);

  const fetchData=useCallback(async()=>{
    if(!resolvedId) return;
    setLoading(true); setError(null); setNoProfile(false);
    try{
      const dr=await fetch(`${API_BASE}/drivers/user/${resolvedId}`,{headers:authH()});
      if(!dr.ok){
        if(dr.status===404){setNoProfile(true);setLoading(false);return;}
        setError(dr.status===401||dr.status===403?'Session expired.':`Error (${dr.status}).`);
        setLoading(false); return;
      }
      const dpRaw=await dr.json(); const dp=dpRaw?.data??dpRaw; setDriverInfo(dp);
      try{ const r=await fetch(`${API_BASE}/users/${resolvedId}`,{headers:authH()}); if(r.ok){const d=await r.json();setFullUserInfo(d?.data??d);} }catch{}
      const did=dp?.id??dp?.driverId??dp?.driver_id;
      if(!did){setError('Profile incomplete.');setLoading(false);return;}
      const[incR,trR,vhR]=await Promise.all([
        fetch(`${API_BASE}/incidents/driver/${did}`,{headers:authH()}),
        fetch(`${API_BASE}/trips/driver/${did}`,    {headers:authH()}),
        fetch(`${API_BASE}/vehicles`,               {headers:authH()}),
      ]);
      if(vhR.ok){const vd=await vhR.json();const vl=Array.isArray(vd)?vd:(Array.isArray(vd?.data)?vd.data:[]);const vm={};vl.forEach(v=>{const id=v.vehicleId??v.vehicle_id??v.id;if(id!=null)vm[String(id)]=v;});setVehicles(vm);}else setVehicles({});
      if(incR.ok){const d=await incR.json();setIncidents(Array.isArray(d)?d:(Array.isArray(d?.data)?d.data:[]));}else setIncidents([]);
      if(trR.ok){
        const d=await trR.json();const list=Array.isArray(d)?d:(Array.isArray(d?.data)?d.data:[]);
        if(list.length===0){
          try{const r=await fetch(`${API_BASE}/trips`,{headers:authH()});if(r.ok){const ad=await r.json();const al=Array.isArray(ad)?ad:(Array.isArray(ad?.data)?ad.data:[]);setTrips(al.filter(t=>{const ids=[t.driver?.id,t.driver?.driverId,t.driverId,t.driver_id].filter(v=>v!=null);return ids.some(id=>String(id)===String(did));}));}}catch{setTrips([]);}
        }else setTrips(list);
      }else setTrips([]);
    }catch{setError('Network error. Check connection.');}finally{setLoading(false);}
  },[resolvedId,authH]);

  useEffect(()=>{fetchData();},[fetchData]);

  const logout=()=>{
    localStorage.removeItem('dg_token');
    localStorage.removeItem('dg_user');
    window.location.href='/login';
  };

  const gT  = (i) => resolveIncidentType(i);
  const gTm = (i) => i?.timestamp??i?.detectedAt??i?.createdAt??null;

  const totalV    = incidents.length;
  const phoneV    = incidents.filter(i=>gT(i).includes('PHONE')).length;
  const drowsyV   = incidents.filter(i=>gT(i).includes('DROWS') || gT(i).includes('DROWSY')).length;
  const completedT= trips.filter(t=>{const s=String(t.status??'').toUpperCase();return s==='COMPLETED'||s==='1';}).length;
  const score     = driverInfo?.safetyScore??Math.max(0,100
    -incidents.filter(i=>gT(i).includes('PHONE')).length*10
    -incidents.filter(i=>gT(i).includes('DROWS')).length*8
    -incidents.filter(i=>gT(i).includes('SEATBELT')).length*5
    -incidents.filter(i=>gT(i).includes('DISTRACT')).length*3
  );
  const recent=[...incidents].sort((a,b)=>new Date(gTm(b)||0)-new Date(gTm(a)||0)).slice(0,5);
  const displayUser=fullUserInfo??user;
  const fullName=displayUser?`${displayUser.firstName||displayUser.first_name||''} ${displayUser.lastName||displayUser.last_name||''}`.trim()||displayUser.email:'Driver';
  const ini=(displayUser?.firstName||displayUser?.first_name||displayUser?.email||'D')[0].toUpperCase();

  if(loading) return(
    <div className="h-screen flex items-center justify-center" style={{ background:'#f4fce8', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
      <style>{GLOBAL_STYLES}</style>
      <div className="text-center">
        <div className="w-12 h-12 rounded-full mx-auto mb-4" style={{ border:'4px solid #d4edaa', borderTopColor:'#6db82a', animation:'spin .8s linear infinite' }}/>
        <div className="text-sm font-semibold" style={{ color:'#5fa820' }}>Loading your dashboard…</div>
      </div>
    </div>
  );

  if(noProfile) return <PendingSetupScreen displayUser={displayUser??user} fullName={fullName} onRetry={fetchData} onLogout={logout}/>;

  const NAV=[
    {key:'dashboard', Icon:Icons.Dashboard, label:'Dashboard'},
    {key:'violations',Icon:Icons.Violations,label:'Violations'},
    {key:'trips',     Icon:Icons.Trips,     label:'Trips'},
    {key:'profile',   Icon:Icons.Profile,   label:'Profile'},
  ];

  const TH={padding:'11px 16px',textAlign:'left',fontSize:10.5,fontWeight:700,color:'#9ca3af',textTransform:'uppercase',letterSpacing:'0.07em',borderBottom:'1px solid #f1f5f9',background:'#fafafa',whiteSpace:'nowrap'};
  const TD={padding:'13px 16px',borderBottom:'1px solid #f8fafc',verticalAlign:'middle'};

  const ErrBanner=({msg})=>msg?(
    <div className="flex items-center gap-2.5 rounded-xl px-4 py-3 mb-4 text-sm" style={{ background:'#fef2f2', border:'1px solid #fecaca', color:'#dc2626' }}>
      <Icons.Warning/>{msg}
    </div>
  ):null;

  // ── DASHBOARD ─────────────────────────────────────────────────────────
  const TabDashboard=()=>(
    <div className="dg-main">
      <ErrBanner msg={error}/>
      {/* Hero banner */}
      <div className="rounded-2xl p-6 sm:p-8 mb-5 relative overflow-hidden flex-shrink-0"
        style={{ background:'linear-gradient(130deg,#5fa820 0%,#7dc832 45%,#6db82a 100%)', boxShadow:'0 10px 36px rgba(95,168,32,.32)' }}>
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full" style={{ background:'rgba(255,255,255,.07)' }}/>
        <div className="absolute -bottom-10 right-40 w-32 h-32 rounded-full" style={{ background:'rgba(255,255,255,.05)' }}/>

        {/* Score panel — floats right on sm+, stacks below on mobile */}
        <div className="flex flex-col sm:flex-row items-start sm:items-stretch gap-4">
          <div className="flex-1 pr-0 sm:pr-4 sm:border-r sm:border-white/10">
            <div className="text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color:'rgba(255,255,255,.65)' }}>Welcome back</div>
            <div className="text-2xl sm:text-3xl font-black text-white mb-2" style={{ letterSpacing:'-0.6px', lineHeight:1.1 }}>{fullName}</div>
            <div className="text-sm" style={{ color:'rgba(255,255,255,.7)' }}>
              {driverInfo?.licenseNumber?`License: ${driverInfo.licenseNumber}`:'Driver Account'} · DriveGuard AI
            </div>
          </div>
          <div className="flex flex-row sm:flex-col items-center justify-start sm:justify-center sm:w-44 gap-3 sm:gap-0 sm:text-center sm:border-l sm:pl-6" style={{ borderLeft:'none' }}>
            <div className="text-4xl sm:text-5xl font-black text-white" style={{ textShadow:'0 2px 16px rgba(0,0,0,.2)', lineHeight:1 }}>{score}</div>
            <div>
              <div className="text-xs font-bold uppercase tracking-widest" style={{ color:'rgba(255,255,255,.65)' }}>Safety Score</div>
              <div className="text-xs mt-1" style={{ color:'rgba(255,255,255,.55)' }}>{score>=80?'🟢 Excellent':score>=60?'🟡 Fair':'🔴 Needs Work'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stat cards — 2 col on mobile, 4 col on lg */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5 flex-shrink-0">
        <StatCard label="Total Violations" value={totalV}     sub="All time"       color="#ef4444" accent="#ef4444" Ic={Icons.Warning}/>
        <StatCard label="Phone Violations" value={phoneV}     sub="Phone use"      color="#f59e0b" accent="#f59e0b" Ic={Icons.Phone}/>
        <StatCard label="Drowsy Events"    value={drowsyV}    sub="Drowsiness"     color="#a78bfa" accent="#a78bfa" Ic={Icons.Sleep}/>
        <StatCard label="Trips Completed"  value={completedT} sub="Finished trips" color="#5fa820" accent="#5fa820" Ic={Icons.Car}/>
      </div>

      {/* Score ring + recent violations — stack on mobile, side-by-side on md+ */}
      <div className="flex flex-col md:flex-row gap-4 flex-1 min-h-0">
        {/* Score ring card — hidden on small, visible on md+ */}
        <div className="hidden md:flex flex-col justify-center text-center bg-white rounded-2xl p-6 md:w-52 flex-shrink-0"
          style={{ border:'1px solid #f1f5f9', boxShadow:'0 2px 12px rgba(0,0,0,.04)' }}>
          <div className="text-sm font-bold text-gray-700 mb-3.5">Safety Score</div>
          <ScoreRing score={score}/>
          <div className="mt-3 text-xs text-gray-500 font-medium">
            {score>=80?'🟢 Great — keep it up!':score>=60?'🟡 Needs improvement':'🔴 High risk — review violations'}
          </div>
        </div>

        {/* Recent violations */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 flex-1 min-w-0 flex flex-col overflow-hidden"
          style={{ border:'1px solid #f1f5f9', boxShadow:'0 2px 12px rgba(0,0,0,.04)' }}>
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <div className="text-sm font-bold text-gray-900">Recent Violations</div>
            {incidents.length>0&&<span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ color:'#5fa820', background:'#f4fce8' }}>{incidents.length} total</span>}
          </div>
          <div className="flex-1 overflow-y-auto min-h-0">
            {recent.length===0
              ?<div className="text-gray-400 text-sm py-6 text-center">✅ No violations recorded</div>
              :recent.map((inc,i)=>{
                const resolvedType=gT(inc); const m=getVM(resolvedType);
                const t=gTm(inc); const shots=findMatchingShots(inc);
                return(
                  <div key={inc.incident_id??inc.id??i} className="flex items-center gap-3 py-3" style={{ borderBottom:i<recent.length-1?'1px solid #f8fafc':'none' }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background:m.bg, color:m.color }}><m.Icon/></div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900 truncate">{m.label}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{t?new Date(t).toLocaleString():'N/A'}</div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ color:m.color, background:m.bg }}>{inc.severity??'Violation'}</span>
                      {shots.length>0&&(
                        <button className="shot-btn" onClick={()=>setModalShot({siblings:shots,index:0,violationType:resolvedType})} title="View screenshot">
                          <Icons.Camera/><span className="hidden sm:inline">View photo</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            }
          </div>
        </div>
      </div>
    </div>
  );

  // ── VIOLATIONS ────────────────────────────────────────────────────────
  const TabViolations=()=>(
    <div className="dg-main">
      <ErrBanner msg={error}/>
      <div className="bg-white rounded-2xl overflow-hidden flex flex-col flex-1 min-h-0" style={{ border:'1px solid #f1f5f9', boxShadow:'0 2px 12px rgba(0,0,0,.04)' }}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 sm:px-6 py-4 sm:py-5 flex-shrink-0"
          style={{ borderBottom:'1px solid #f1f5f9', background:'linear-gradient(135deg,#f4fce8 0%,#fff 60%)' }}>
          <div>
            <div className="text-base font-extrabold text-gray-900">My Violation History</div>
            <div className="text-xs text-gray-400 mt-0.5">{incidents.length} total violations recorded</div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {screenshots.length>0&&(
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background:'#eff6ff', border:'1px solid #bfdbfe' }}>
                <Icons.Camera/>
                <span className="text-xs font-bold" style={{ color:'#1d4ed8' }}>{screenshots.length} screenshots</span>
              </div>
            )}
            <div className="text-xs font-bold px-4 py-1.5 rounded-full text-white" style={{ background:'linear-gradient(135deg,#dc2626,#f87171)', boxShadow:'0 2px 8px rgba(220,38,38,.3)' }}>
              Score: {score}/100
            </div>
          </div>
        </div>

        {incidents.length===0
          ?<div className="text-center py-12 text-gray-400 text-sm">✅ No violations — excellent driving!</div>
          :<div className="overflow-auto flex-1 min-h-0">
            {/* Desktop table */}
            <table className="w-full border-collapse hidden sm:table" style={{ fontSize:13.5 }}>
              <thead>
                <tr>{['#','Type','Severity','Date & Time','Description','Screenshot'].map(h=><th key={h} style={TH}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {incidents.map((inc,i)=>{
                  const resolvedType=gT(inc); const m=getVM(resolvedType);
                  const t=gTm(inc); const shots=findMatchingShots(inc);
                  return(
                    <tr key={inc.incident_id??inc.id??i} className="dg-row">
                      <td style={TD}><span className="text-xs text-gray-400 font-semibold">#{i+1}</span></td>
                      <td style={TD}>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background:m.bg, color:m.color }}><m.Icon/></div>
                          <span className="text-sm font-semibold text-gray-900">{m.label}</span>
                        </div>
                      </td>
                      <td style={TD}><span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ color:m.color, background:m.bg }}>{inc.severity??'Medium'}</span></td>
                      <td style={TD}><div className="text-xs text-gray-700">{t?new Date(t).toLocaleString():'N/A'}</div></td>
                      <td style={TD}><div className="text-xs text-gray-500 max-w-[220px]">{inc.description??'—'}</div></td>
                      <td style={TD}>
                        {shots.length===0
                          ?<span className="text-xs text-gray-300 italic">No photo</span>
                          :<button className="shot-btn" onClick={()=>setModalShot({siblings:shots,index:0,violationType:resolvedType})}>
                            <Icons.Camera/>{shots.length>1?`${shots.length} photos`:'View photo'}
                          </button>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Mobile cards */}
            <div className="flex flex-col gap-2 p-3 sm:hidden">
              {incidents.map((inc,i)=>{
                const resolvedType=gT(inc); const m=getVM(resolvedType);
                const t=gTm(inc); const shots=findMatchingShots(inc);
                return(
                  <div key={inc.incident_id??inc.id??i} className="bg-white rounded-xl p-4" style={{ border:'1px solid #f1f5f9', boxShadow:'0 1px 4px rgba(0,0,0,.05)' }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background:m.bg, color:m.color }}><m.Icon/></div>
                        <span className="text-sm font-bold text-gray-900">{m.label}</span>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ color:m.color, background:m.bg }}>{inc.severity??'Medium'}</span>
                    </div>
                    <div className="text-xs text-gray-400 mb-1">{t?new Date(t).toLocaleString():'N/A'}</div>
                    {inc.description&&<div className="text-xs text-gray-500 mb-2">{inc.description}</div>}
                    {shots.length>0&&(
                      <button className="shot-btn mt-1" onClick={()=>setModalShot({siblings:shots,index:0,violationType:resolvedType})}>
                        <Icons.Camera/>{shots.length>1?`${shots.length} photos`:'View photo'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        }
      </div>
    </div>
  );

  // ── TRIPS ─────────────────────────────────────────────────────────────
  const TabTrips=()=>(
    <div className="dg-main">
      <ErrBanner msg={error}/>
      <div className="bg-white rounded-2xl overflow-hidden flex flex-col flex-1 min-h-0" style={{ border:'1px solid #f1f5f9', boxShadow:'0 2px 12px rgba(0,0,0,.04)' }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 sm:px-6 py-4 sm:py-5 flex-shrink-0"
          style={{ borderBottom:'1px solid #f1f5f9', background:'linear-gradient(135deg,#f4fce8 0%,#fff 60%)' }}>
          <div>
            <div className="text-base font-extrabold text-gray-900">My Trip History</div>
            <div className="text-xs text-gray-400 mt-0.5">{trips.length} total trips · {completedT} completed</div>
          </div>
          <div className="text-xs font-bold px-4 py-1.5 rounded-full text-white self-start sm:self-auto"
            style={{ background:'linear-gradient(135deg,#5fa820,#7dc832)', boxShadow:'0 2px 8px rgba(95,168,32,.28)' }}>
            {completedT} Completed
          </div>
        </div>

        {trips.length===0
          ?<div className="text-center py-12 text-gray-400 text-sm">No trips recorded yet.</div>
          :<div className="overflow-auto flex-1 min-h-0">
            {/* Desktop table */}
            <table className="w-full border-collapse hidden sm:table" style={{ fontSize:13.5 }}>
              <thead><tr>{['Trip Name','Start Time','End Time','Status','Vehicle'].map(h=><th key={h} style={TH}>{h}</th>)}</tr></thead>
              <tbody>
                {[...trips].sort((a,b)=>new Date(a.startTime||0)<new Date(b.startTime||0)?1:-1).map((trip,i)=>{
                  const st=getTripSt(trip.status);const key=trip.tripId??trip.id??i;
                  const rv=trip.vehicle?.vehicleId??trip.vehicle?.id??trip.vehicleId??trip.vehicle_id;
                  const vobj=rv!=null?vehicles[String(rv)]:null;
                  return(
                    <tr key={key} className="dg-row">
                      <td style={TD}>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background:'rgba(125,200,50,.1)', color:'#6db82a' }}><Icons.Car/></div>
                          <span className="text-sm font-semibold text-gray-900">{trip.tripName??trip.trip_name??`Trip #${trip.tripId??i+1}`}</span>
                        </div>
                      </td>
                      <td style={TD}><div className="text-xs text-gray-700 flex items-center gap-1"><span className="text-gray-400"><Icons.Clock/></span>{trip.startTime?new Date(trip.startTime).toLocaleString():'N/A'}</div></td>
                      <td style={TD}><div className="text-xs text-gray-700">{trip.endTime?new Date(trip.endTime).toLocaleString():'—'}</div></td>
                      <td style={TD}><span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ color:st.color, background:st.bg }}>{st.label}</span></td>
                      <td style={TD}>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background:'rgba(125,200,50,.1)', color:'#6db82a' }}><Icons.Car/></div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{vobj?.model??(rv?`Vehicle #${rv}`:'—')}</div>
                            {vobj&&<div className="text-xs text-gray-500">{vobj.plateNumber??vobj.plate_number??''}</div>}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Mobile cards */}
            <div className="flex flex-col gap-2 p-3 sm:hidden">
              {[...trips].sort((a,b)=>new Date(a.startTime||0)<new Date(b.startTime||0)?1:-1).map((trip,i)=>{
                const st=getTripSt(trip.status);const key=trip.tripId??trip.id??i;
                const rv=trip.vehicle?.vehicleId??trip.vehicle?.id??trip.vehicleId??trip.vehicle_id;
                const vobj=rv!=null?vehicles[String(rv)]:null;
                return(
                  <div key={key} className="bg-white rounded-xl p-4" style={{ border:'1px solid #f1f5f9', boxShadow:'0 1px 4px rgba(0,0,0,.05)' }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background:'rgba(125,200,50,.1)', color:'#6db82a' }}><Icons.Car/></div>
                        <span className="text-sm font-semibold text-gray-900">{trip.tripName??trip.trip_name??`Trip #${trip.tripId??i+1}`}</span>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ color:st.color, background:st.bg }}>{st.label}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500 mt-1">
                      <div><span className="text-gray-400">Start: </span>{trip.startTime?new Date(trip.startTime).toLocaleString():'N/A'}</div>
                      <div><span className="text-gray-400">End: </span>{trip.endTime?new Date(trip.endTime).toLocaleString():'—'}</div>
                      <div><span className="text-gray-400">Vehicle: </span>{vobj?.model??(rv?`Vehicle #${rv}`:'—')}</div>
                      {vobj&&<div><span className="text-gray-400">Plate: </span>{vobj.plateNumber??vobj.plate_number??'—'}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        }
      </div>
    </div>
  );

  // ── PROFILE ───────────────────────────────────────────────────────────
  const TabProfile=()=>{
    const fields=[
      {label:'First Name',   value:displayUser?.firstName  ||displayUser?.first_name  ||'—'},
      {label:'Last Name',    value:displayUser?.lastName   ||displayUser?.last_name   ||'—'},
      {label:'Email',        value:displayUser?.email      ||'—'},
      {label:'Phone',        value:displayUser?.phoneNumber||displayUser?.phone_number||displayUser?.phone||'—'},
      {label:'Role',         value:'Driver'},
      {label:'License No.',  value:driverInfo?.licenseNumber||driverInfo?.license_number||'—'},
      {label:'Driver Status',value:driverInfo?.status??'—'},
      {label:'Hire Date',    value:driverInfo?.hireDate?new Date(driverInfo.hireDate).toLocaleDateString():'—'},
    ];
    return(
      <div className="dg-main w-full max-w-2xl">
        <ErrBanner msg={error}/>
        {/* Hero */}
        <div className="rounded-2xl p-6 sm:p-8 mb-4 flex items-center gap-4 sm:gap-5 flex-shrink-0 relative overflow-hidden"
          style={{ background:'linear-gradient(130deg,#5fa820,#7dc832)', boxShadow:'0 8px 28px rgba(95,168,32,.25)' }}>
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full" style={{ background:'rgba(255,255,255,.08)' }}/>
          <div className="w-16 h-16 sm:w-[68px] sm:h-[68px] rounded-full flex items-center justify-center text-white text-2xl font-extrabold flex-shrink-0"
            style={{ background:'rgba(255,255,255,.2)', backdropFilter:'blur(8px)', border:'2px solid rgba(255,255,255,.4)' }}>{ini}</div>
          <div>
            <div className="text-xl font-extrabold text-white">{fullName}</div>
            <div className="text-sm mt-0.5" style={{ color:'rgba(255,255,255,.75)' }}>{displayUser?.email}</div>
            <span className="text-xs font-bold px-3 py-1 rounded-full mt-2 inline-block" style={{ color:'#5fa820', background:'#e9f7d0' }}>DRIVER</span>
          </div>
        </div>

        {/* Fields */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 mb-4 flex-shrink-0" style={{ border:'1px solid #f1f5f9', boxShadow:'0 2px 12px rgba(0,0,0,.04)' }}>
          <div className="text-sm font-bold text-gray-900 mb-4">Account Details</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {fields.map(f=>(
              <div key={f.label} className="rounded-xl p-3" style={{ background:'#f8fafc', border:'1px solid #f1f5f9' }}>
                <div className="text-xs font-bold uppercase tracking-wider" style={{ color:'#9ca3af', letterSpacing:'0.06em' }}>{f.label}</div>
                <div className="text-sm font-semibold text-gray-900 mt-1 break-all">{f.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Safety summary */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-5 sm:gap-6 flex-1 min-h-0"
          style={{ border:'1px solid #f1f5f9', boxShadow:'0 2px 12px rgba(0,0,0,.04)' }}>
          <ScoreRing score={score}/>
          <div className="flex-1 w-full">
            <div className="text-sm font-bold text-gray-900 mb-3">Safety Summary</div>
            {[{label:'Total Violations',value:totalV,color:'#ef4444'},{label:'Completed Trips',value:completedT,color:'#5fa820'},{label:'Safety Score',value:`${score}/100`,color:score>=80?'#5fa820':score>=60?'#fbbf24':'#ef4444'}].map(r=>(
              <div key={r.label} className="flex justify-between py-2 text-sm" style={{ borderBottom:'1px solid #f8fafc' }}>
                <span className="text-gray-700">{r.label}</span>
                <span className="font-bold" style={{ color:r.color }}>{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const tabTitles={dashboard:'Dashboard',violations:'My Violations',trips:'My Trips',profile:'My Profile'};

  return(
    <div className="flex h-screen overflow-hidden" style={{ background:'#f0f4f8', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
      <style>{GLOBAL_STYLES}</style>

      {/* Screenshot Modal */}
      <ScreenshotModal modalShot={modalShot} setModalShot={setModalShot} parseScreenshotFilename={parseScreenshotFilename}/>

      {/* ── MOBILE SIDEBAR OVERLAY ─────────────────────────────────────── */}
      {mobileSideOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={()=>setMobileSideOpen(false)}
          style={{ background:'rgba(0,0,0,.5)', backdropFilter:'blur(3px)' }}/>
      )}

      {/* ── SIDEBAR ─────────────────────────────────────────────────────── */}
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-50 flex flex-col
        transition-all duration-300 ease-in-out overflow-hidden
        ${mobileSideOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${sideCollapsed ? 'lg:w-[68px] lg:min-w-[68px]' : 'w-[232px] min-w-[232px]'}
      `}
        style={{ background:'linear-gradient(180deg,#7dc832 0%,#5fa820 50%,#3d7010 100%)', boxShadow:'4px 0 28px rgba(0,0,0,.14)' }}>

        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full pointer-events-none" style={{ background:'rgba(255,255,255,.05)' }}/>
        <div className="absolute bottom-24 -left-12 w-36 h-36 rounded-full pointer-events-none" style={{ background:'rgba(255,255,255,.04)' }}/>

        {/* Logo */}
        <div className={`flex items-center gap-2.5 flex-shrink-0 ${sideCollapsed ? 'px-0 justify-center py-5' : 'px-4 py-5'}`}
          style={{ borderBottom:'1px solid rgba(255,255,255,.12)' }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0"
            style={{ background:'rgba(255,255,255,.18)', backdropFilter:'blur(8px)', border:'1px solid rgba(255,255,255,.3)' }}>
            <Icons.ShieldLg/>
          </div>
          {!sideCollapsed&&<div>
            <div className="text-sm font-black text-white" style={{ letterSpacing:'-0.3px', lineHeight:1.1 }}>DriveGuard</div>
            <div className="text-xs font-bold uppercase tracking-widest" style={{ color:'rgba(255,255,255,.5)', fontSize:9.5 }}>AI Platform</div>
          </div>}
          {/* Close button on mobile */}
          {mobileSideOpen&&(
            <button onClick={()=>setMobileSideOpen(false)} className="ml-auto lg:hidden text-white/60 hover:text-white p-1">
              <Icons.X/>
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className={`flex-1 overflow-y-auto py-3.5 ${sideCollapsed ? 'px-2' : 'px-2.5'}`}>
          {!sideCollapsed&&<div className="text-xs font-bold uppercase tracking-widest px-2 pb-2.5" style={{ color:'rgba(255,255,255,.3)', fontSize:9 }}>Main Menu</div>}
          {NAV.map(item=>(
            <button key={item.key} onClick={()=>{setTab(item.key);setMobileSideOpen(false);}}
              className="dg-nav flex items-center gap-2.5 w-full rounded-xl border-none cursor-pointer mb-1 text-white font-medium relative transition-all"
              title={sideCollapsed?item.label:undefined}
              style={{
                padding: sideCollapsed ? '11px 0' : '10px 12px',
                justifyContent: sideCollapsed ? 'center' : 'flex-start',
                background: tab===item.key ? 'rgba(255,255,255,.2)' : 'transparent',
                fontWeight: tab===item.key ? 700 : 500,
                fontSize: 14,
                fontFamily:"'Plus Jakarta Sans',sans-serif",
              }}>
              {tab===item.key&&!sideCollapsed&&<span className="absolute left-0 top-[18%] bottom-[18%] w-0.5 rounded-r" style={{ background:'#c8e6a0' }}/>}
              <span style={{ opacity:tab===item.key?1:.65, display:'flex', alignItems:'center', marginLeft:tab===item.key&&!sideCollapsed?4:0 }}><item.Icon/></span>
              {!sideCollapsed&&item.label}
            </button>
          ))}
        </nav>

        {/* Collapse toggle (desktop only) */}
        <div className="px-2.5 pb-2 flex-shrink-0 hidden lg:block" style={{ borderTop:'1px solid rgba(255,255,255,.1)' }}>
          <button onClick={()=>setSideCollapsed(c=>!c)}
            className="w-full py-2 rounded-lg flex items-center justify-center gap-1.5 text-xs cursor-pointer"
            style={{ border:'1px solid rgba(255,255,255,.15)', background:'rgba(255,255,255,.07)', color:'rgba(255,255,255,.65)', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
            {sideCollapsed?'→':'← Collapse'}
          </button>
        </div>

        {/* Logout */}
        <div className={`pb-5 flex-shrink-0 ${sideCollapsed ? 'px-2' : 'px-2.5'}`}>
          <button onClick={logout}
            className="flex items-center gap-2.5 w-full rounded-xl border-none cursor-pointer font-semibold"
            style={{
              padding: sideCollapsed ? '10px 0' : '11px 12px',
              justifyContent: sideCollapsed ? 'center' : 'flex-start',
              background:'rgba(239,68,68,.15)', color:'#fca5a5',
              fontSize:13.5, fontFamily:"'Plus Jakarta Sans',sans-serif",
            }}>
            <Icons.LogOut/>
            {!sideCollapsed&&'Log Out'}
          </button>
        </div>
      </div>

      {/* ── MAIN CONTENT ────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden flex flex-col min-w-0">
        {/* Topbar */}
        <div className="bg-white flex items-center justify-between px-4 sm:px-8 flex-shrink-0"
          style={{ height:66, borderBottom:'1px solid #e5e7eb', boxShadow:'0 1px 10px rgba(0,0,0,.05)' }}>
          <div className="flex items-center gap-3">
            {/* Hamburger — mobile only */}
            <button onClick={()=>setMobileSideOpen(true)} className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 border-none bg-transparent cursor-pointer">
              <Icons.Menu/>
            </button>
            <div>
              <div className="text-lg sm:text-xl font-black text-gray-900" style={{ letterSpacing:'-0.5px' }}>{tabTitles[tab]}</div>
              <div className="text-xs text-gray-400 mt-0.5 hidden sm:block">
                {new Date().toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-bold text-gray-900">{fullName}</div>
              <div className="text-xs text-gray-400">Driver</div>
            </div>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white font-extrabold text-sm sm:text-base"
              style={{ background:'linear-gradient(135deg,#5fa820,#7dc832)', boxShadow:'0 2px 10px rgba(95,168,32,.3)' }}>{ini}</div>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto flex flex-col min-h-0 p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
          {tab==='dashboard'  && <TabDashboard/>}
          {tab==='violations' && <TabViolations/>}
          {tab==='trips'      && <TabTrips/>}
          {tab==='profile'    && <TabProfile/>}
        </div>
      </div>

      {/* ── MOBILE BOTTOM NAV ──────────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-30 lg:hidden bg-white"
        style={{ borderTop:'1px solid #e5e7eb', boxShadow:'0 -4px 20px rgba(0,0,0,.08)' }}>
        <div className="flex items-center justify-around px-2 py-1.5">
          {NAV.map(item=>(
            <button key={item.key} onClick={()=>setTab(item.key)}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl border-none bg-transparent cursor-pointer transition-all ${tab===item.key?'mob-nav-active':''}`}
              style={{ color: tab===item.key ? '#5fa820' : '#9ca3af', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
              <span style={{ color: tab===item.key ? '#5fa820' : '#9ca3af' }}><item.Icon/></span>
              <span className="text-xs font-semibold" style={{ fontSize:10 }}>{item.label}</span>
            </button>
          ))}
          <button onClick={logout}
            className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl border-none bg-transparent cursor-pointer"
            style={{ color:'#ef4444', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
            <Icons.LogOut/>
            <span className="text-xs font-semibold" style={{ fontSize:10 }}>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
