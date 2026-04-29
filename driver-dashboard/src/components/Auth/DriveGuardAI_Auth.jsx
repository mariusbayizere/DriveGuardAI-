import { useState, useRef, useEffect } from "react";
import { countries, getCountryByCode } from "../../utils/countries";
import UpdatePassword from "./UpdatePassword";

/* ─────────────────────────────────────────────────────────────────────────
   PhoneInput — unchanged
───────────────────────────────────────────────────────────────────────── */
function PhoneInput({ value, onChange }) {
  const [selected, setSelected] = useState(getCountryByCode('RW'));
  const [open, setOpen]         = useState(false);
  const [search, setSearch]     = useState('');
  const dropRef                 = useRef(null);

  const localNumber = value && value.startsWith(selected.dialCode)
    ? value.slice(selected.dialCode.length)
    : value || '';

  const filtered = countries.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.dialCode.includes(search)
  );

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const select = (c) => {
    setSelected(c);
    setOpen(false);
    setSearch('');
    onChange({ target: { name: 'phone', value: c.dialCode + localNumber } });
  };

  const handleNumberChange = (e) => {
    onChange({ target: { name: 'phone', value: selected.dialCode + e.target.value } });
  };

  return (
    <div className="flex gap-2 w-full" ref={dropRef}>
      <div className="relative flex-shrink-0">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          style={{
            height: '100%', minHeight: 44, padding: '0 10px',
            border: '1.5px solid #e5e7eb', borderRadius: 12,
            background: '#f9fafb', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 14, fontFamily: "'Outfit',sans-serif",
            color: '#374151', whiteSpace: 'nowrap', transition: 'border-color 0.2s',
          }}
        >
          <span style={{ fontSize: 20 }}>{selected.flag}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{selected.dialCode}</span>
          <svg viewBox="0 0 12 8" fill="none"
            style={{ width: 10, height: 10, marginLeft: 2,
              transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
            <path d="M1 1l5 5 5-5" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        {open && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 6px)', left: 0,
            width: 240, maxHeight: 260, overflowY: 'auto',
            background: '#fff', border: '1.5px solid #e5e7eb',
            borderRadius: 14, zIndex: 100, boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
          }}>
            <div style={{ padding: '8px 10px', borderBottom: '1px solid #f3f4f6', position: 'sticky', top: 0, background: '#fff' }}>
              <input
                autoFocus value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search country..."
                style={{ width: '100%', padding: '7px 10px', border: '1.5px solid #e5e7eb',
                  borderRadius: 8, fontSize: 13, fontFamily: "'Outfit',sans-serif",
                  outline: 'none', color: '#111827' }}
              />
            </div>
            {filtered.map(c => (
              <button key={c.code} type="button" onClick={() => select(c)}
                style={{ width: '100%', padding: '9px 14px', display: 'flex', alignItems: 'center',
                  gap: 10, background: selected.code === c.code ? '#f0fdf4' : 'transparent',
                  border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f0fdf4'}
                onMouseLeave={e => e.currentTarget.style.background = selected.code === c.code ? '#f0fdf4' : 'transparent'}>
                <span style={{ fontSize: 18 }}>{c.flag}</span>
                <span style={{ fontSize: 13, color: '#374151', fontWeight: 500, flex: 1 }}>{c.name}</span>
                <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>{c.dialCode}</span>
              </button>
            ))}
            {filtered.length === 0 && (
              <div style={{ padding: '14px', textAlign: 'center', fontSize: 13, color: '#9ca3af' }}>No results</div>
            )}
          </div>
        )}
      </div>

      <input
        className="dg-input"
        name="phone"
        type="tel"
        placeholder="7XX XXX XXX"
        value={localNumber}
        onChange={handleNumberChange}
        style={{ flex: 1 }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Icons / Illustrations — all unchanged
───────────────────────────────────────────────────────────────────────── */
const EyeIcon = ({ open }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
    {open
      ? (<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>)
      : (<><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
          <line x1="1" y1="1" x2="23" y2="23"/></>)
    }
  </svg>
);

const ShieldLogo = () => (
  <svg viewBox="0 0 48 52" fill="none" style={{ width: 48, height: 52 }}>
    <path d="M24 2L4 11V26C4 37.5 13 48 24 50C35 48 44 37.5 44 26V11L24 2Z"
      fill="rgba(255,255,255,0.2)" stroke="white" strokeWidth="2"/>
    <path d="M17 25L22 30L31 20" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="24" cy="19" r="4" fill="rgba(255,255,255,0.3)"/>
  </svg>
);

const CarIllustration = () => (
  <svg viewBox="0 0 160 80" fill="none" style={{ width: 160, height: 80 }}>
    <ellipse cx="80" cy="70" rx="60" ry="6" fill="rgba(0,0,0,0.15)"/>
    <rect x="15" y="35" width="130" height="28" rx="10"
      fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
    <path d="M30 35 L50 14 L110 14 L130 35"
      fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5"/>
    <rect x="54" y="16" width="22" height="16" rx="3"
      fill="rgba(180,230,255,0.25)" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
    <rect x="84" y="16" width="22" height="16" rx="3"
      fill="rgba(180,230,255,0.25)" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
    <circle cx="38" cy="63" r="11"
      fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
    <circle cx="38" cy="63" r="5" fill="rgba(255,255,255,0.2)"/>
    <circle cx="122" cy="63" r="11"
      fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
    <circle cx="122" cy="63" r="5" fill="rgba(255,255,255,0.2)"/>
    <ellipse cx="20" cy="45" rx="6" ry="4" fill="rgba(255,220,50,0.5)"/>
    <rect x="15" y="42" width="8" height="6" rx="3" fill="rgba(255,220,80,0.6)"/>
  </svg>
);

const GoogleButton = () => {
  const [hovered, setHovered] = useState(false);
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8080/oauth2/authorization/google?prompt=select_account";
  };
  return (
    <button
      onClick={handleGoogleLogin}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "100%", padding: "11px 16px",
        border: "1.5px solid #e5e7eb", borderRadius: 12,
        background: hovered ? "#f8f9fa" : "#ffffff",
        color: "#3c4043", fontSize: 14, fontWeight: 600,
        fontFamily: "'Outfit',sans-serif", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
        transition: "background 0.2s, box-shadow 0.2s",
        boxShadow: hovered ? "0 1px 6px rgba(0,0,0,0.12)" : "none",
      }}
    >
      <svg width="18" height="18" viewBox="0 0 48 48">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
      </svg>
      Continue with Google
    </button>
  );
};

/* ─────────────────────────────────────────────────────────────────────────
   Shared small components — defined OUTSIDE main component so React
   does NOT recreate their identity on every render (fixes cursor loss)
───────────────────────────────────────────────────────────────────────── */
const LogoBox = () => (
  <div style={{
    width:40, height:40, borderRadius:12, flexShrink:0, marginBottom:12,
    background:'linear-gradient(135deg,#7dc832,#5fa820)',
    display:'flex', alignItems:'center', justifyContent:'center',
    boxShadow:'0 4px 15px rgba(125,200,50,0.4)',
  }}>
    <svg viewBox="0 0 24 24" fill="white" style={{ width:20, height:20 }}>
      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
    </svg>
  </div>
);

const Label = ({ children }) => (
  <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#374151',
    letterSpacing:1, textTransform:'uppercase', marginBottom:5 }}>
    {children}
  </label>
);

const FieldWrap = ({ children }) => (
  <div style={{ position:'relative', marginBottom:13, width:'100%' }}>{children}</div>
);

const HRule = ({ text }) => (
  <div className="flex items-center gap-3 w-full my-3">
    <div className="flex-1 h-px bg-gray-200" />
    {text && <span style={{ fontSize:12, color:'#9ca3af', fontWeight:600 }}>{text}</span>}
    <div className="flex-1 h-px bg-gray-200" />
  </div>
);

/* Green background blobs */
const GreenBg = () => (
  <>
    <div style={{ position:'absolute', width:320, height:320, borderRadius:'50%', background:'rgba(255,255,255,0.03)', top:-80, left:-80 }}/>
    <div style={{ position:'absolute', width:200, height:200, borderRadius:'50%', background:'rgba(255,255,255,0.04)', bottom:-50, right:-50 }}/>
    <div style={{ position:'absolute', width:400, height:400, borderRadius:'50%', border:'1px solid rgba(255,255,255,0.06)', top:-120, left:-120 }}/>
  </>
);

/* ─────────────────────────────────────────────────────────────────────────
   Main component
───────────────────────────────────────────────────────────────────────── */
export default function DriveGuardAuth({ onAuthSuccess }) {
  const [isLogin, setIsLogin]         = useState(true);
  const [showPass, setShowPass]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [message, setMessage]         = useState(null);
  const [showUpdatePassword, setShowUpdatePassword] = useState(false);
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "",
    phone: "", role: "DRIVER", password: "", confirmPassword: ""
  });

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  if (showUpdatePassword) {
    return <UpdatePassword onBackToLogin={() => setShowUpdatePassword(false)} />;
  }

  const submit = async () => {
    if (!form.email || !form.password) {
      setMessage({ type: "error", text: "Please fill in all required fields." });
      return;
    }
    if (!isLogin && form.password !== form.confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match." });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const url  = isLogin ? 'http://localhost:8080/api/v1/auth/signin' : 'http://localhost:8080/api/v1/auth/signup';
      const body = isLogin
        ? { email: form.email, password: form.password }
        : { firstName: form.firstName, lastName: form.lastName, email: form.email,
            phoneNumber: form.phone, userRole: form.role,
            password: form.password, confirmPassword: form.confirmPassword };
      const res  = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (data.status === true) {
        setLoading(false);
        if (isLogin) {
          setMessage({ type: "success", text: "✓ Sign in successful! Redirecting to dashboard..." });
          setTimeout(() => { if (onAuthSuccess) onAuthSuccess(data.jwt, { email: form.email, role: data.role, ...form }); }, 800);
        } else {
          setMessage({ type: "success", text: "✓ Account created successfully! Please sign in to continue." });
          setTimeout(() => {
            setForm({ firstName: "", lastName: "", email: "", phone: "", role: "DRIVER", password: "", confirmPassword: "" });
            setIsLogin(true);
            setMessage({ type: "success", text: "✓ Account created! Please sign in with your new credentials." });
          }, 1200);
        }
      } else {
        setLoading(false);
        setMessage({ type: "error", text: data.message || "Something went wrong." });
      }
    } catch {
      setLoading(false);
      setMessage({ type: "error", text: "Cannot connect to server. Make sure Spring Boot is running on port 8080." });
    }
  };

  const switchMode = (toLogin) => {
    setIsLogin(toLogin);
    setMessage(null);
    setForm({ firstName: "", lastName: "", email: "", phone: "", role: "DRIVER", password: "", confirmPassword: "" });
  };

  /* ── CSS ── */
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Outfit', sans-serif; }

    .dg-input {
      width:100%; padding:11px 16px; border:1.5px solid #e5e7eb; border-radius:12px;
      font-size:14px; font-family:'Outfit',sans-serif; color:#111827; background:#fff;
      outline:none; transition:border-color 0.2s,box-shadow 0.2s;
    }
    .dg-input:focus { border-color:#7dc832; box-shadow:0 0 0 3px rgba(125,200,50,0.13); }

    .dg-select {
      width:100%; padding:11px 16px; border:1.5px solid #e5e7eb; border-radius:12px;
      font-size:14px; font-family:'Outfit',sans-serif; color:#111827; background:#fff;
      outline:none; appearance:none; transition:border-color 0.2s;
    }
    .dg-select:focus { border-color:#7dc832; box-shadow:0 0 0 3px rgba(125,200,50,0.13); }

    .dg-spinner {
      width:18px; height:18px; border:2.5px solid rgba(255,255,255,0.3);
      border-top-color:white; border-radius:50%; animation:dg-spin 0.7s linear infinite;
    }
    @keyframes dg-spin { to { transform:rotate(360deg); } }

    .dg-overlay-slide { transition: transform 0.75s cubic-bezier(0.76,0,0.24,1); }

    .dg-submit { transition: transform 0.25s, box-shadow 0.25s; }
    .dg-submit:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 8px 28px rgba(125,200,50,0.45); }
    .dg-submit:disabled { opacity:0.65; cursor:not-allowed; }

    .dg-ov-btn { transition: background 0.25s, color 0.25s; }
    .dg-ov-btn:hover { background:white !important; color:#5fa820 !important; }
  `;

  /* ── Message box ── */
  const MsgBox = ({ show }) =>
    show && message ? (
      <div style={{
        padding:'10px 14px', borderRadius:10, fontSize:13, fontWeight:600,
        marginBottom:12, width:'100%',
        background: message.type === 'success' ? '#d1fae5' : '#fee2e2',
        color:       message.type === 'success' ? '#3a6e10'  : '#991b1b',
      }}>{message.text}</div>
    ) : null;

  /* ── Submit button ── */
  const SubmitBtn = ({ active, label, loadingLabel }) => (
    <button
      className="dg-submit"
      onClick={active ? submit : undefined}
      disabled={loading}
      style={{
        width:'100%', padding:13, border:'none', borderRadius:12, marginTop:6, cursor:'pointer',
        background:'linear-gradient(135deg,#7dc832,#5fa820)', color:'white',
        fontSize:14.5, fontWeight:800, fontFamily:"'Outfit',sans-serif", letterSpacing:0.3,
        display:'flex', alignItems:'center', justifyContent:'center', gap:8,
      }}
    >
      {loading && active
        ? <><div className="dg-spinner"/><span>{loadingLabel}</span></>
        : <span>→  {label}</span>
      }
    </button>
  );

  /* Overlay content — full (desktop) or compact (tablet) */
  const OverlayContent = ({ compact = false }) => (
    <div className="relative z-10 flex flex-col items-center text-center">
      <div style={{ marginBottom: compact ? 8 : 16 }}><ShieldLogo/></div>
      <div style={{
        background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.25)',
        borderRadius:50, padding: compact ? '4px 14px' : '6px 20px',
        fontSize:10, fontWeight:700, color:'white', letterSpacing:2.5,
        textTransform:'uppercase', marginBottom: compact ? 8 : 20,
      }}>DriveGuard AI</div>
      <div style={{ fontFamily:"'Outfit',sans-serif", fontSize: compact ? 20 : 30,
        fontWeight:800, color:'white', lineHeight:1.25, marginBottom: compact ? 6 : 12 }}>
        {isLogin ? "New Here?" : "Welcome Back!"}
      </div>
      <div style={{ fontSize: compact ? 12 : 13.5, color:'rgba(255,255,255,0.72)',
        lineHeight:1.65, marginBottom: compact ? 12 : 24, maxWidth: compact ? 200 : 230 }}>
        {isLogin
          ? "Join thousands of drivers using AI-powered real-time safety monitoring"
          : "Sign back in to monitor your fleet and drive with confidence"}
      </div>
      {!compact && <CarIllustration/>}
      <div style={{ marginTop: compact ? 0 : 12, display:'flex',
        flexDirection: compact ? 'row' : 'column', flexWrap:'wrap',
        gap: compact ? 5 : 0, justifyContent:'center' }}>
        {["Real-time AI Detection", "Instant Driver Alerts", "Fleet Safety Reports"].map(f => (
          <div key={f} style={{
            display:'flex', alignItems:'center', gap: compact ? 5 : 10,
            background:'rgba(255,255,255,0.09)', borderRadius:50,
            padding: compact ? '4px 9px' : '7px 16px', margin: compact ? 0 : '4px 0',
          }}>
            <div style={{ width: compact ? 5 : 7, height: compact ? 5 : 7,
              borderRadius:'50%', background:'#a3e635', flexShrink:0 }}/>
            <span style={{ fontSize: compact ? 10.5 : 12.5, color:'rgba(255,255,255,0.88)', fontWeight:600 }}>{f}</span>
          </div>
        ))}
      </div>
      <button className="dg-ov-btn" onClick={() => switchMode(!isLogin)}
        style={{ marginTop: compact ? 14 : 24, background:'transparent',
          border:'2px solid rgba(255,255,255,0.85)', color:'white',
          padding: compact ? '9px 26px' : '12px 38px', borderRadius:50,
          fontSize:13, fontWeight:700, letterSpacing:1,
          cursor:'pointer', fontFamily:"'Outfit',sans-serif" }}>
        {isLogin ? "CREATE ACCOUNT" : "SIGN IN"}
      </button>
    </div>
  );

  const greenGradient = 'linear-gradient(150deg,#5fa820 0%,#7dc832 35%,#6db82a 65%,#4a8f18 100%)';
  const cardShadow    = '0 50px 120px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06)';

  /* ── Inline Sign In fields (NOT a sub-component — avoids remount on each render) ── */
  const signInFields = (
    <>
      <MsgBox show={isLogin}/>
      <FieldWrap>
        <Label>Email Address</Label>
        <input className="dg-input" name="email" type="email"
          placeholder="driver@company.com" value={form.email} onChange={handle}/>
      </FieldWrap>
      <FieldWrap>
        <Label>Password</Label>
        <div style={{ position:'relative' }}>
          <input className="dg-input" name="password"
            type={showPass ? "text" : "password"}
            placeholder="Enter your password"
            value={form.password} onChange={handle} style={{ paddingRight:44 }}/>
          <button type="button" onClick={() => setShowPass(!showPass)} style={{
            position:'absolute', right:12, top:'50%', transform:'translateY(-50%)',
            background:'none', border:'none', cursor:'pointer', color:'#9ca3af',
            padding:4, display:'flex', alignItems:'center',
          }}>
            <EyeIcon open={showPass}/>
          </button>
        </div>
      </FieldWrap>
      <div className="w-full text-right" style={{ marginTop:-6, marginBottom:14 }}>
        <button onClick={() => setShowUpdatePassword(true)}
          style={{ fontSize:13, color:'#7dc832', fontWeight:700,
            background:'none', border:'none', cursor:'pointer', fontFamily:"'Outfit',sans-serif" }}>
          Forgot password?
        </button>
      </div>
      <SubmitBtn active={isLogin} label="SIGN IN" loadingLabel="Signing in..."/>
      <HRule text="OR"/>
      <GoogleButton/>
      <HRule/>
      <p style={{ fontSize:13, color:'#6b7280', textAlign:'center' }}>
        No account?{' '}
        <button onClick={() => switchMode(false)} style={{ background:'none', border:'none',
          color:'#7dc832', fontWeight:800, cursor:'pointer', fontSize:13, fontFamily:"'Outfit',sans-serif" }}>
          Create one →
        </button>
      </p>
    </>
  );

  /* ── Inline Sign Up fields (NOT a sub-component — avoids remount on each render) ── */
  const signUpFields = (
    <>
      <MsgBox show={!isLogin}/>
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <FieldWrap>
          <Label>First Name</Label>
          <input className="dg-input" name="firstName" placeholder="Aime" value={form.firstName} onChange={handle}/>
        </FieldWrap>
        <FieldWrap>
          <Label>Last Name</Label>
          <input className="dg-input" name="lastName" placeholder="Roger" value={form.lastName} onChange={handle}/>
        </FieldWrap>
      </div>
      <FieldWrap>
        <Label>Email Address</Label>
        <input className="dg-input" name="email" type="email"
          placeholder="driver@company.com" value={form.email} onChange={handle}/>
      </FieldWrap>
      <FieldWrap>
        <Label>Phone Number</Label>
        <PhoneInput value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}/>
        {form.phone && (
          <div style={{ fontSize:11, color:'#6b7280', marginTop:4, paddingLeft:2 }}>
            Will be saved as: <strong style={{ color:'#7dc832' }}>{form.phone}</strong>
          </div>
        )}
      </FieldWrap>
      <FieldWrap>
        <Label>Role</Label>
        <select className="dg-select" name="role" value={form.role} onChange={handle}>
          <option value="DRIVER">Driver</option>
          <option value="MANAGER">Manager</option>
          <option value="ADMIN">Admin</option>
        </select>
      </FieldWrap>
      <FieldWrap>
        <Label>Password</Label>
        <div style={{ position:'relative' }}>
          <input className="dg-input" name="password"
            type={showPass ? "text" : "password"} placeholder="Min. 8 characters"
            value={form.password} onChange={handle} style={{ paddingRight:44 }}/>
          <button type="button" onClick={() => setShowPass(!showPass)} style={{
            position:'absolute', right:12, top:'50%', transform:'translateY(-50%)',
            background:'none', border:'none', cursor:'pointer', color:'#9ca3af',
            padding:4, display:'flex', alignItems:'center',
          }}>
            <EyeIcon open={showPass}/>
          </button>
        </div>
      </FieldWrap>
      <FieldWrap>
        <Label>Confirm Password</Label>
        <div style={{ position:'relative' }}>
          <input className="dg-input" name="confirmPassword"
            type={showConfirm ? "text" : "password"} placeholder="Repeat password"
            value={form.confirmPassword} onChange={handle} style={{ paddingRight:44 }}/>
          <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{
            position:'absolute', right:12, top:'50%', transform:'translateY(-50%)',
            background:'none', border:'none', cursor:'pointer', color:'#9ca3af',
            padding:4, display:'flex', alignItems:'center',
          }}>
            <EyeIcon open={showConfirm}/>
          </button>
        </div>
      </FieldWrap>
      <SubmitBtn active={!isLogin} label="CREATE ACCOUNT" loadingLabel="Creating account..."/>
      <HRule text="OR"/>
      <GoogleButton/>
      <p style={{ fontSize:13, color:'#6b7280', textAlign:'center', marginTop:12 }}>
        Already have an account?{' '}
        <button onClick={() => switchMode(true)} style={{ background:'none', border:'none',
          color:'#7dc832', fontWeight:800, cursor:'pointer', fontSize:13, fontFamily:"'Outfit',sans-serif" }}>
          Sign in →
        </button>
      </p>
    </>
  );

  return (
    <div
      className="min-h-screen flex items-center justify-center px-3 py-6 sm:px-4 sm:py-8 lg:py-6"
      style={{
        fontFamily:"'Outfit',sans-serif",
        background:'radial-gradient(ellipse at 20% 50%,#e8f5f0 0%,#f0f9f5 60%,#ffffff 100%)',
      }}
    >
      <style>{css}</style>

      {/* ════════════════════════════════════════════════════════════════
          MOBILE  (< 640px)
      ════════════════════════════════════════════════════════════════ */}
      <div
        className="sm:hidden w-full max-w-sm flex flex-col rounded-3xl overflow-hidden"
        style={{ boxShadow: cardShadow }}
      >
        {/* ── Green top panel ── */}
        <div style={{ background: greenGradient, position:'relative', overflow:'hidden',
          padding: isLogin ? '32px 24px 28px' : '16px 24px' }}>
          <GreenBg/>
          <div className="relative z-10 flex flex-col items-center text-center">
            <div style={{ marginBottom: isLogin ? 10 : 6 }}><ShieldLogo/></div>
            <div style={{
              background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.25)',
              borderRadius:50, padding:'4px 14px', fontSize:10, fontWeight:700,
              color:'white', letterSpacing:2.5, textTransform:'uppercase',
              marginBottom: isLogin ? 10 : 10,
            }}>DriveGuard AI</div>

            {isLogin && (
              <>
                <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:22, fontWeight:800,
                  color:'white', lineHeight:1.25, marginBottom:6 }}>
                  Welcome Back!
                </div>
                <div style={{ fontSize:12.5, color:'rgba(255,255,255,0.75)', lineHeight:1.6,
                  marginBottom:16, maxWidth:260 }}>
                  Sign in to monitor your fleet and drive with confidence
                </div>
                <div className="flex flex-wrap justify-center gap-2" style={{ marginBottom:16 }}>
                  {["Real-time AI Detection", "Instant Driver Alerts", "Fleet Safety Reports"].map(f => (
                    <div key={f} style={{ display:'flex', alignItems:'center', gap:6,
                      background:'rgba(255,255,255,0.09)', borderRadius:50, padding:'5px 10px' }}>
                      <div style={{ width:5, height:5, borderRadius:'50%', background:'#a3e635', flexShrink:0 }}/>
                      <span style={{ fontSize:11, color:'rgba(255,255,255,0.88)', fontWeight:600 }}>{f}</span>
                    </div>
                  ))}
                </div>
                <button className="dg-ov-btn" onClick={() => switchMode(false)}
                  style={{ background:'transparent', border:'2px solid rgba(255,255,255,0.85)',
                    color:'white', padding:'10px 36px', borderRadius:50,
                    fontSize:13, fontWeight:700, letterSpacing:1,
                    cursor:'pointer', fontFamily:"'Outfit',sans-serif" }}>
                  SIGN UP
                </button>
              </>
            )}

            {!isLogin && (
              <button className="dg-ov-btn" onClick={() => switchMode(true)}
                style={{ background:'transparent', border:'2px solid rgba(255,255,255,0.85)',
                  color:'white', padding:'8px 28px', borderRadius:50,
                  fontSize:12, fontWeight:700, letterSpacing:1,
                  cursor:'pointer', fontFamily:"'Outfit',sans-serif" }}>
                ← SIGN IN
              </button>
            )}
          </div>
        </div>

        {/* ── White form panel ── */}
        <div className="flex flex-col items-center bg-white px-6 py-7">
          <LogoBox/>
          {isLogin ? (
            <>
              <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:22, fontWeight:800,
                color:'#0a1628', marginBottom:4 }}>Sign In</div>
              <div style={{ fontSize:13, color:'#6b7280', marginBottom:18 }}>
                Access your DriveGuard AI account
              </div>
              {signInFields}
            </>
          ) : (
            <>
              <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:22, fontWeight:800,
                color:'#0a1628', marginBottom:4 }}>Create Account</div>
              <div style={{ fontSize:13, color:'#6b7280', marginBottom:18 }}>
                Join DriveGuard AI — drive smarter &amp; safer
              </div>
              {signUpFields}
            </>
          )}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          TABLET  (640px – 1023px)
      ════════════════════════════════════════════════════════════════ */}
      <div
        className="hidden sm:flex lg:hidden relative rounded-3xl overflow-hidden"
        style={{ width:'100%', maxWidth:720, minHeight:520, boxShadow: cardShadow }}
      >
        {/* Sign In — left panel */}
        <div style={{ flex:'0 0 50%', background:'#ffffff', overflowY:'auto',
          display:'flex', flexDirection:'column', alignItems:'center',
          justifyContent:'center', padding:'32px 32px' }}>
          <LogoBox/>
          <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:22, fontWeight:800, color:'#0a1628', marginBottom:4 }}>Welcome Back</div>
          <div style={{ fontSize:12.5, color:'#6b7280', marginBottom:18 }}>Sign in to your DriveGuard AI account</div>
          {signInFields}
        </div>

        {/* Green sliding overlay */}
        <div className="dg-overlay-slide" style={{
          position:'absolute', top:0, left:0, width:'50%', height:'100%',
          background: greenGradient,
          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
          padding:'32px 24px', zIndex:20, overflow:'hidden',
          transform: isLogin ? 'translateX(100%)' : 'translateX(0)',
        }}>
          <GreenBg/>
          <OverlayContent compact={true}/>
        </div>

        {/* Sign Up — right panel */}
        <div style={{ flex:'0 0 50%', background:'#ffffff', overflowY:'auto',
          display:'flex', flexDirection:'column', alignItems:'center',
          justifyContent:'center', padding:'32px 32px' }}>
          <LogoBox/>
          <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:22, fontWeight:800, color:'#0a1628', marginBottom:4 }}>Create Account</div>
          <div style={{ fontSize:12.5, color:'#6b7280', marginBottom:18 }}>Join DriveGuard AI — drive smarter &amp; safer</div>
          {signUpFields}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          DESKTOP  (≥ 1024px)
      ════════════════════════════════════════════════════════════════ */}
      <div
        className="hidden lg:flex relative rounded-3xl overflow-hidden"
        style={{ width:880, minHeight:600, boxShadow: cardShadow }}
      >
        {/* Sign In — left panel */}
        <div style={{ flex:'0 0 50%', background:'#ffffff', overflowY:'auto',
          display:'flex', flexDirection:'column', alignItems:'center',
          justifyContent:'center', padding:'40px 48px' }}>
          <LogoBox/>
          <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:26, fontWeight:800, color:'#0a1628', marginBottom:4 }}>Welcome Back</div>
          <div style={{ fontSize:13, color:'#6b7280', marginBottom:22 }}>Sign in to your DriveGuard AI account</div>
          {signInFields}
        </div>

        {/* Green sliding overlay */}
        <div className="dg-overlay-slide" style={{
          position:'absolute', top:0, left:0, width:'50%', height:'100%',
          background: greenGradient,
          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
          padding:'50px 40px', zIndex:20, overflow:'hidden',
          transform: isLogin ? 'translateX(100%)' : 'translateX(0)',
        }}>
          <GreenBg/>
          <OverlayContent/>
        </div>

        {/* Sign Up — right panel */}
        <div style={{ flex:'0 0 50%', background:'#ffffff', overflowY:'auto',
          display:'flex', flexDirection:'column', alignItems:'center',
          justifyContent:'center', padding:'40px 48px' }}>
          <LogoBox/>
          <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:26, fontWeight:800, color:'#0a1628', marginBottom:4 }}>Create Account</div>
          <div style={{ fontSize:13, color:'#6b7280', marginBottom:22 }}>Join DriveGuard AI — drive smarter &amp; safer</div>
          {signUpFields}
        </div>
      </div>

    </div>
  );
}
