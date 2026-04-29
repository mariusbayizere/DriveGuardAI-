import React from 'react';
import { useNavigate } from 'react-router-dom';

// ── Keyframe animations (injected once via <style>) ───────────────────────
const ANIMATIONS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  @keyframes gridPan {
    from { background-position: 0 0; }
    to   { background-position: 48px 48px; }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(30px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50%       { transform: translateY(-14px); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.4; }
  }

  .dg-grid-bg {
    background-image:
      linear-gradient(rgba(95,168,32,0.06) 1px, transparent 1px),
      linear-gradient(90deg, rgba(95,168,32,0.06) 1px, transparent 1px);
    background-size: 48px 48px;
    animation: gridPan 20s linear infinite;
  }

  .dg-fade-up   { animation: fadeUp 0.65s cubic-bezier(0.22,1,0.36,1) both; }
  .dg-fade-up-2 { animation: fadeUp 0.65s 0.12s cubic-bezier(0.22,1,0.36,1) both; }
  .dg-fade-up-3 { animation: fadeUp 0.65s 0.24s cubic-bezier(0.22,1,0.36,1) both; }
  .dg-float     { animation: float 3.5s ease-in-out infinite; }
  .dg-pulse     { animation: pulse 1.5s ease-in-out infinite; }

  .dg-glow {
    text-shadow:
      0 0 40px rgba(95,168,32,0.25),
      0 0 80px rgba(95,168,32,0.10);
  }
  .dg-glow-red {
    text-shadow:
      0 0 40px rgba(239,68,68,0.25),
      0 0 80px rgba(239,68,68,0.10);
  }

  /* Smooth button transitions */
  .dg-btn-primary, .dg-btn-ghost {
    transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s, color 0.15s, background 0.15s;
  }
  .dg-btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(95,168,32,0.45);
  }
  .dg-btn-ghost:hover {
    border-color: rgba(95,168,32,0.5);
    color: #5fa820;
    background: rgba(95,168,32,0.06);
  }
`;

// ── SVG Icons ─────────────────────────────────────────────────────────────
const ShieldIcon = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const HomeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const BackIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const RefreshIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

// ── Shared Layout ─────────────────────────────────────────────────────────
const ErrorLayout = ({ children, gradient }) => (
  <div
    className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden px-4 py-10 sm:px-6 sm:py-14 md:px-8 md:py-16"
    style={{
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      background: gradient,
    }}
  >
    <style>{ANIMATIONS}</style>

    {/* Animated grid background */}
    <div className="dg-grid-bg absolute inset-0 pointer-events-none" />

    {children}
  </div>
);

// ── Shared Logo ───────────────────────────────────────────────────────────
const Logo = () => (
  <div className="dg-fade-up relative z-10 flex items-center gap-3 mb-10 sm:mb-12 md:mb-14">
    <div
      className="flex items-center justify-center text-white rounded-xl"
      style={{
        width: 44, height: 44,
        background: 'linear-gradient(135deg,#7dc832 0%,#5fa820 100%)',
        boxShadow: '0 4px 18px rgba(95,168,32,0.35)',
        borderRadius: 14,
        flexShrink: 0,
      }}
    >
      <ShieldIcon size={22} />
    </div>
    <span className="text-lg font-extrabold" style={{ color: '#0f172a' }}>
      DriveGuard<span style={{ color: '#5fa820' }}>AI</span>
    </span>
  </div>
);

// ── Shared Footer ─────────────────────────────────────────────────────────
const Footer = () => (
  <p
    className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs font-medium whitespace-nowrap z-10 text-center"
    style={{ color: 'rgba(15,23,42,0.25)' }}
  >
    © 2026 DriveGuardAI — Fleet Intelligence Platform
  </p>
);

// ── Decorative bottom line ────────────────────────────────────────────────
const BottomLine = ({ color }) => (
  <div
    className="absolute bottom-0 left-0 right-0 z-10"
    style={{
      height: 4,
      background: `linear-gradient(90deg, transparent, ${color[0]} 30%, ${color[1]} 70%, transparent)`,
      opacity: color[2] ?? 0.45,
    }}
  />
);

// ── 404 Page ──────────────────────────────────────────────────────────────
export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <ErrorLayout gradient="radial-gradient(ellipse at 20% 50%, #e8f5f0 0%, #f0f9f5 60%, #ffffff 100%)">

      {/* Decorative orbs */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 'clamp(220px, 40vw, 400px)', height: 'clamp(220px, 40vw, 400px)',
          background: 'rgba(125,200,50,0.10)', filter: 'blur(90px)',
          top: -120, left: -120,
        }}
      />
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 'clamp(160px, 28vw, 280px)', height: 'clamp(160px, 28vw, 280px)',
          background: 'rgba(95,168,32,0.08)', filter: 'blur(90px)',
          bottom: -60, right: -60,
        }}
      />

      <Logo />

      {/* Big 404 */}
      <div className="dg-float relative z-10 mb-2 select-none">
        <div className="relative inline-block">
          {/* Ghost outline */}
          <span
            className="absolute inset-0 flex items-center justify-center font-extrabold"
            style={{
              fontSize: 'clamp(90px, 18vw, 220px)',
              color: 'transparent',
              WebkitTextStroke: '1.5px rgba(95,168,32,0.15)',
              lineHeight: 1,
              letterSpacing: '-4px',
            }}
          >
            404
          </span>
          {/* Visible number */}
          <span
            className="dg-glow relative block font-extrabold"
            style={{
              fontSize: 'clamp(90px, 18vw, 220px)',
              lineHeight: 1,
              letterSpacing: '-4px',
              color: '#7dc832',
            }}
          >
            404
          </span>
        </div>
      </div>

      {/* Message block */}
      <div className="dg-fade-up-2 relative z-10 text-center w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl px-2">
        <h2
          className="font-extrabold mb-3"
          style={{ fontSize: 'clamp(20px, 4vw, 32px)', color: '#0f172a' }}
        >
          Page Not Found
        </h2>
        <p
          className="leading-relaxed mb-8"
          style={{ fontSize: 'clamp(14px, 1.8vw, 15.5px)', color: 'rgba(15,23,42,0.50)' }}
        >
          Oops! The page you're looking for doesn't exist or may have been moved.
          Let's get you back on the right route.
        </p>

        {/* Action buttons */}
        <div className="dg-fade-up-3 flex flex-col sm:flex-row gap-3 justify-center items-center">
          <button
            className="dg-btn-primary w-full sm:w-auto inline-flex items-center justify-center gap-2 font-bold text-white rounded-xl border-none cursor-pointer"
            style={{
              padding: '13px 28px',
              background: 'linear-gradient(135deg,#7dc832 0%,#5fa820 100%)',
              boxShadow: '0 4px 20px rgba(95,168,32,0.30)',
              fontSize: 15,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
            onClick={() => navigate('/')}
          >
            <HomeIcon /> Back to Dashboard
          </button>
          <button
            className="dg-btn-ghost w-full sm:w-auto inline-flex items-center justify-center gap-2 font-semibold rounded-xl cursor-pointer"
            style={{
              padding: '12px 24px',
              background: 'transparent',
              border: '1.5px solid rgba(0,0,0,0.12)',
              color: 'rgba(0,0,0,0.50)',
              fontSize: 15,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
            onClick={() => navigate(-1)}
          >
            <BackIcon /> Go Back
          </button>
        </div>
      </div>

      <BottomLine color={['#7dc832', '#5fa820', 0.45]} />
      <Footer />
    </ErrorLayout>
  );
}

// ── 500 Page ──────────────────────────────────────────────────────────────
export function ServerErrorPage({ onRetry }) {
  const navigate = useNavigate();
  const handleRetry = () => (onRetry ? onRetry() : window.location.reload());

  return (
    <ErrorLayout gradient="radial-gradient(ellipse at 80% 20%, #fff0f0 0%, #fff5f5 60%, #ffffff 100%)">

      {/* Decorative orbs */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 'clamp(220px, 40vw, 400px)', height: 'clamp(220px, 40vw, 400px)',
          background: 'rgba(220,38,38,0.07)', filter: 'blur(90px)',
          top: -120, right: -80,
        }}
      />
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 'clamp(160px, 28vw, 300px)', height: 'clamp(160px, 28vw, 300px)',
          background: 'rgba(125,200,50,0.08)', filter: 'blur(90px)',
          bottom: -80, left: -60,
        }}
      />

      <Logo />

      {/* Big 500 */}
      <div className="dg-float relative z-10 mb-2 select-none">
        <div className="relative inline-block">
          {/* Ghost outline */}
          <span
            className="absolute inset-0 flex items-center justify-center font-extrabold"
            style={{
              fontSize: 'clamp(90px, 18vw, 220px)',
              color: 'transparent',
              WebkitTextStroke: '1.5px rgba(220,38,38,0.15)',
              lineHeight: 1,
              letterSpacing: '-4px',
            }}
          >
            500
          </span>
          {/* Visible number */}
          <span
            className="dg-glow-red relative block font-extrabold"
            style={{
              fontSize: 'clamp(90px, 18vw, 220px)',
              lineHeight: 1,
              letterSpacing: '-4px',
              color: '#ef4444',
            }}
          >
            500
          </span>
        </div>
      </div>

      {/* Message block */}
      <div className="dg-fade-up-2 relative z-10 text-center w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl px-2">
        <h2
          className="font-extrabold mb-3"
          style={{ fontSize: 'clamp(20px, 4vw, 32px)', color: '#0f172a' }}
        >
          Internal Server Error
        </h2>
        <p
          className="leading-relaxed mb-2"
          style={{ fontSize: 'clamp(14px, 1.8vw, 15.5px)', color: 'rgba(15,23,42,0.50)' }}
        >
          Something went wrong on our end. Our team has been notified and is
          working to resolve the issue as quickly as possible.
        </p>
        <p
          className="font-medium mb-8"
          style={{ fontSize: 'clamp(12px, 1.5vw, 13.5px)', color: 'rgba(15,23,42,0.35)' }}
        >
          Please try again in a moment or contact your system administrator.
        </p>

        {/* Status badge */}
        <div className="inline-flex items-center gap-2 rounded-full mb-8 mx-auto"
          style={{
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.20)',
            padding: '7px 16px',
          }}
        >
          <span
            className="dg-pulse rounded-full flex-shrink-0"
            style={{
              width: 8, height: 8,
              background: '#ef4444',
              boxShadow: '0 0 8px rgba(239,68,68,0.5)',
            }}
          />
          <span className="text-sm font-semibold" style={{ color: '#dc2626' }}>
            System Unavailable
          </span>
        </div>

        {/* Action buttons */}
        <div className="dg-fade-up-3 flex flex-col sm:flex-row gap-3 justify-center items-center">
          <button
            className="dg-btn-primary w-full sm:w-auto inline-flex items-center justify-center gap-2 font-bold text-white rounded-xl border-none cursor-pointer"
            style={{
              padding: '13px 28px',
              background: 'linear-gradient(135deg,#7dc832 0%,#5fa820 100%)',
              boxShadow: '0 4px 20px rgba(95,168,32,0.30)',
              fontSize: 15,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
            onClick={handleRetry}
          >
            <RefreshIcon /> Try Again
          </button>
          <button
            className="dg-btn-ghost w-full sm:w-auto inline-flex items-center justify-center gap-2 font-semibold rounded-xl cursor-pointer"
            style={{
              padding: '12px 24px',
              background: 'transparent',
              border: '1.5px solid rgba(0,0,0,0.12)',
              color: 'rgba(0,0,0,0.50)',
              fontSize: 15,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
            onClick={() => navigate('/')}
          >
            <HomeIcon /> Go to Dashboard
          </button>
        </div>
      </div>

      <BottomLine color={['#ef4444', '#dc2626', 0.35]} />
      <Footer />
    </ErrorLayout>
  );
}
