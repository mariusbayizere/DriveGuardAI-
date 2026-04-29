import React from 'react';
import { useNavigate } from 'react-router-dom';

// ── Shared brand styles ───────────────────────────────────────────────────
const BASE_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #ffffff; }

  .dg-err-bg {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(95,168,32,0.06) 1px, transparent 1px),
      linear-gradient(90deg, rgba(95,168,32,0.06) 1px, transparent 1px);
    background-size: 48px 48px;
    animation: gridPan 20s linear infinite;
    pointer-events: none;
  }
  @keyframes gridPan { from { background-position: 0 0; } to { background-position: 48px 48px; } }

  .dg-orb { position: absolute; border-radius: 50%; filter: blur(90px); pointer-events: none; }

  @keyframes fadeUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
  .dg-fade-up { animation: fadeUp 0.65s cubic-bezier(0.22,1,0.36,1) both; }
  .dg-fade-up-2 { animation: fadeUp 0.65s 0.12s cubic-bezier(0.22,1,0.36,1) both; }
  .dg-fade-up-3 { animation: fadeUp 0.65s 0.24s cubic-bezier(0.22,1,0.36,1) both; }

  @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
  .dg-float { animation: float 3.5s ease-in-out infinite; }

  @keyframes spin { to { transform: rotate(360deg); } }
  .dg-glow { text-shadow: 0 0 40px rgba(95,168,32,0.25), 0 0 80px rgba(95,168,32,0.10); }

  .dg-btn-primary {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 13px 28px; border-radius: 12px; border: none; cursor: pointer;
    background: linear-gradient(135deg,#7dc832 0%,#5fa820 100%);
    color: #fff; font-size: 15px; font-weight: 700;
    font-family: "'Plus Jakarta Sans', sans-serif";
    box-shadow: 0 4px 20px rgba(95,168,32,0.30);
    transition: transform 0.15s, box-shadow 0.15s;
  }
  .dg-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(95,168,32,0.45); }

  .dg-btn-ghost {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 12px 24px; border-radius: 12px; cursor: pointer;
    background: transparent; border: 1.5px solid rgba(0,0,0,0.12);
    color: rgba(0,0,0,0.50); font-size: 15px; font-weight: 600;
    font-family: "'Plus Jakarta Sans', sans-serif";
    transition: border-color 0.15s, color 0.15s, background 0.15s;
  }
  .dg-btn-ghost:hover { border-color: rgba(95,168,32,0.5); color: #5fa820; background: rgba(95,168,32,0.06); }
`;

const ShieldIcon = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const HomeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

const BackIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12 19 5 12 12 5"/>
  </svg>
);

const RefreshIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/>
    <polyline points="1 20 1 14 7 14"/>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
  </svg>
);

// ── Shared Layout ─────────────────────────────────────────────────────────
const ErrorLayout = ({ children }) => (
  <div style={{
    minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    fontFamily: "'Plus Jakarta Sans', sans-serif", position: 'relative', overflow: 'hidden',
    background: 'radial-gradient(ellipse at 20% 50%, #e8f5f0 0%, #f0f9f5 60%, #ffffff 100%)',
    padding: '40px 20px',
  }}>
    <style>{BASE_STYLES}</style>
    <div className="dg-err-bg" />
    {children}
  </div>
);

// ── 404 Page ──────────────────────────────────────────────────────────────
export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <ErrorLayout>
      {/* Orbs */}
      <div className="dg-orb" style={{ width: 400, height: 400, background: 'rgba(125,200,50,0.10)', top: -120, left: -120 }} />
      <div className="dg-orb" style={{ width: 280, height: 280, background: 'rgba(95,168,32,0.08)', bottom: -60, right: -60 }} />

      {/* Logo */}
      <div className="dg-fade-up" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48, zIndex: 1 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 14,
          background: 'linear-gradient(135deg,#7dc832 0%,#5fa820 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', boxShadow: '0 4px 18px rgba(95,168,32,0.35)',
        }}><ShieldIcon size={22} /></div>
        <span style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
          DriveGuard<span style={{ color: '#5fa820' }}>AI</span>
        </span>
      </div>

      {/* Big 404 Number */}
      <div className="dg-float" style={{ zIndex: 1, marginBottom: 8 }}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          {/* Background ghost text */}
          <span style={{
            position: 'absolute', inset: 0, fontSize: 'clamp(140px, 22vw, 220px)', fontWeight: 800,
            color: 'transparent', WebkitTextStroke: '1.5px rgba(95,168,32,0.15)',
            userSelect: 'none', lineHeight: 1, letterSpacing: '-4px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>404</span>
          <span className="dg-glow" style={{
            fontSize: 'clamp(140px, 22vw, 220px)', fontWeight: 800, lineHeight: 1,
            letterSpacing: '-4px', color: '#7dc832', display: 'block', position: 'relative',
          }}>404</span>
        </div>
      </div>

      {/* Message */}
      <div className="dg-fade-up-2" style={{ textAlign: 'center', zIndex: 1, maxWidth: 480 }}>
        <h2 style={{ fontSize: 'clamp(22px,4vw,32px)', fontWeight: 800, color: '#0f172a', marginBottom: 14 }}>
          Page Not Found
        </h2>
        <p style={{ fontSize: 15.5, color: 'rgba(15,23,42,0.50)', lineHeight: 1.7, marginBottom: 36 }}>
          Oops! The page you're looking for doesn't exist or may have been moved.
          Let's get you back on the right route.
        </p>

        {/* Actions */}
        <div className="dg-fade-up-3" style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="dg-btn-primary" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            onClick={() => navigate('/')}>
            <HomeIcon /> Back to Dashboard
          </button>
          <button className="dg-btn-ghost" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            onClick={() => navigate(-1)}>
            <BackIcon /> Go Back
          </button>
        </div>
      </div>

      {/* Decorative road line */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, zIndex: 1,
        background: 'linear-gradient(90deg, transparent, #7dc832 30%, #5fa820 70%, transparent)',
        opacity: 0.45,
      }} />

      {/* Footer */}
      <p style={{
        position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
        fontSize: 12, color: 'rgba(15,23,42,0.25)', fontWeight: 500, whiteSpace: 'nowrap', zIndex: 1,
      }}>© 2026 DriveGuardAI — Fleet Intelligence Platform</p>
    </ErrorLayout>
  );
}

// ── 500 Page ──────────────────────────────────────────────────────────────
export function ServerErrorPage({ onRetry }) {
  const navigate = useNavigate();
  const handleRetry = () => {
    if (onRetry) onRetry();
    else window.location.reload();
  };

  return (
    <ErrorLayout>
      {/* Orbs */}
      <div className="dg-orb" style={{ width: 400, height: 400, background: 'rgba(220,38,38,0.07)', top: -120, right: -80 }} />
      <div className="dg-orb" style={{ width: 300, height: 300, background: 'rgba(125,200,50,0.08)', bottom: -80, left: -60 }} />

      {/* Logo */}
      <div className="dg-fade-up" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48, zIndex: 1 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 14,
          background: 'linear-gradient(135deg,#7dc832 0%,#5fa820 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', boxShadow: '0 4px 18px rgba(95,168,32,0.35)',
        }}><ShieldIcon size={22} /></div>
        <span style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
          DriveGuard<span style={{ color: '#5fa820' }}>AI</span>
        </span>
      </div>

      {/* Big 500 Number */}
      <div className="dg-float" style={{ zIndex: 1, marginBottom: 8 }}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <span style={{
            position: 'absolute', inset: 0, fontSize: 'clamp(140px, 22vw, 220px)', fontWeight: 800,
            color: 'transparent', WebkitTextStroke: '1.5px rgba(220,38,38,0.15)',
            userSelect: 'none', lineHeight: 1, letterSpacing: '-4px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>500</span>
          <span style={{
            fontSize: 'clamp(140px, 22vw, 220px)', fontWeight: 800, lineHeight: 1,
            letterSpacing: '-4px', color: '#ef4444', display: 'block', position: 'relative',
            textShadow: '0 0 40px rgba(239,68,68,0.25), 0 0 80px rgba(239,68,68,0.10)',
          }}>500</span>
        </div>
      </div>

      {/* Message */}
      <div className="dg-fade-up-2" style={{ textAlign: 'center', zIndex: 1, maxWidth: 500 }}>
        <h2 style={{ fontSize: 'clamp(22px,4vw,32px)', fontWeight: 800, color: '#0f172a', marginBottom: 14 }}>
          Internal Server Error
        </h2>
        <p style={{ fontSize: 15.5, color: 'rgba(15,23,42,0.50)', lineHeight: 1.7, marginBottom: 10 }}>
          Something went wrong on our end. Our team has been notified and is
          working to resolve the issue as quickly as possible.
        </p>
        <p style={{ fontSize: 13.5, color: 'rgba(15,23,42,0.35)', marginBottom: 36, fontWeight: 500 }}>
          Please try again in a moment or contact your system administrator.
        </p>

        {/* Status indicator */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.20)',
          borderRadius: 100, padding: '7px 16px', marginBottom: 32,
        }}>
          <span style={{
            width: 8, height: 8, borderRadius: '50%', background: '#ef4444',
            boxShadow: '0 0 8px rgba(239,68,68,0.5)',
            animation: 'pulse 1.5s ease-in-out infinite',
          }} />
          <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#dc2626' }}>System Unavailable</span>
        </div>

        {/* Actions */}
        <div className="dg-fade-up-3" style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="dg-btn-primary" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            onClick={handleRetry}>
            <RefreshIcon /> Try Again
          </button>
          <button className="dg-btn-ghost" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            onClick={() => navigate('/')}>
            <HomeIcon /> Go to Dashboard
          </button>
        </div>
      </div>

      {/* Decorative line */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, zIndex: 1,
        background: 'linear-gradient(90deg, transparent, #ef4444 30%, #dc2626 70%, transparent)',
        opacity: 0.35,
      }} />

      {/* Footer */}
      <p style={{
        position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
        fontSize: 12, color: 'rgba(15,23,42,0.25)', fontWeight: 500, whiteSpace: 'nowrap', zIndex: 1,
      }}>© 2026 DriveGuardAI — Fleet Intelligence Platform</p>
    </ErrorLayout>
  );
}
