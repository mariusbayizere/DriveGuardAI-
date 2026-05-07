import { useState } from "react";

const EyeIcon = ({ open }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
    {open
      ? (<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>)
      : (<><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>)
    }
  </svg>
);

const StepDot = ({ active, done }) => (
  <div style={{
    width: done ? 28 : active ? 28 : 20,
    height: done ? 28 : active ? 28 : 20,
    borderRadius: "50%",
    background: done ? "#7dc832" : active ? "white" : "rgba(255,255,255,0.25)",
    border: active ? "3px solid rgba(255,255,255,0.6)" : "none",
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: "all 0.35s",
    flexShrink: 0,
  }}>
    {done && (
      <svg viewBox="0 0 12 10" fill="none" style={{ width: 12, height: 10 }}>
        <path d="M1 5l3 3 7-7" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )}
    {active && !done && (
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#7dc832" }}/>
    )}
  </div>
);

export default function UpdatePassword({ onBackToLogin }) {
  const [form, setForm]               = useState({ email: "", newPassword: "", confirmPassword: "" });
  const [showNew, setShowNew]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [message, setMessage]         = useState(null);
  const [success, setSuccess]         = useState(false);
  const [countdown, setCountdown]     = useState(5);

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const step = !form.email ? 0 : !form.newPassword ? 1 : 2;

  const submit = async () => {
    // ── Client-side validation ──────────────────────────────────────────
    if (!form.email || !form.email.includes("@")) {
      setMessage({ type: "error", text: "Please enter a valid email address." });
      return;
    }
    if (!form.newPassword) {
      setMessage({ type: "error", text: "New password is required." });
      return;
    }
    if (form.newPassword.length < 8) {
      setMessage({ type: "error", text: "Password must be at least 8 characters." });
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match." });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch((process.env.REACT_APP_API_BASE || "https://driveguard.local/api/v1") + "/auth/update-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email:           form.email,
          newPassword:     form.newPassword,
          confirmPassword: form.confirmPassword,
        }),
      });

      // ── Parse response safely ──────────────────────────────────────────
      let data = {};
      try {
        data = await res.json();
      } catch {
        // Response body was not valid JSON
        setLoading(false);
        setMessage({ type: "error", text: `Server returned an unexpected response (HTTP ${res.status}).` });
        return;
      }

      console.log("Update password response:", data); // helpful for debugging

      // ── Check success — handles both "status" and "success" field names ──
      const isSuccess = data.status === true || data.success === true || res.ok && res.status === 200 && !data.message?.toLowerCase().includes("error");

      if (isSuccess && (data.status === true || data.success === true)) {
        setLoading(false);
        setSuccess(true);

        let secs = 5;
        setCountdown(secs);
        const timer = setInterval(() => {
          secs -= 1;
          setCountdown(secs);
          if (secs <= 0) {
            clearInterval(timer);
            if (onBackToLogin) onBackToLogin();
          }
        }, 1000);
      } else {
        setLoading(false);
        // Show the server's message, or a fallback based on HTTP status
        const errorText =
          data.message ||
          data.error ||
          (res.status === 404 ? "No account found with that email address." :
           res.status === 400 ? "Invalid request. Please check your inputs." :
           "Something went wrong. Please try again.");
        setMessage({ type: "error", text: errorText });
      }

    } catch (err) {
      setLoading(false);
      console.error("Update password network error:", err);
      // Distinguish between network failure and other errors
      if (err instanceof TypeError && err.message.includes("fetch")) {
        setMessage({ type: "error", text: "Cannot connect to server. Make sure Spring Boot is running on port 8080." });
      } else {
        setMessage({ type: "error", text: `Unexpected error: ${err.message}` });
      }
    }
  };

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Outfit', sans-serif; }

    .up-wrap {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: radial-gradient(ellipse at 20% 50%, #e8f5f0 0%, #f0f9f5 60%, #ffffff 100%);
      padding: 20px;
    }

    .up-card {
      position: relative;
      width: 720px;
      min-height: 660px;
      border-radius: 28px;
      display: flex;
      overflow: hidden;
      box-shadow: 0 50px 120px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06);
    }

    .up-panel-left {
      flex: 0 0 50%;
      background: linear-gradient(150deg, #5fa820 0%, #7dc832 35%, #6db82a 65%, #4a8f18 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 50px 40px;
      position: relative;
      overflow: hidden;
    }
    .up-blob1 { position:absolute; width:320px; height:320px; border-radius:50%; background:rgba(255,255,255,0.04); top:-80px; left:-80px; }
    .up-blob2 { position:absolute; width:200px; height:200px; border-radius:50%; background:rgba(255,255,255,0.05); bottom:-50px; right:-50px; }
    .up-ring  { position:absolute; width:420px; height:420px; border-radius:50%; border:1px solid rgba(255,255,255,0.07); top:-130px; left:-130px; }

    .up-lock-icon {
      width: 72px; height: 72px;
      background: rgba(255,255,255,0.15);
      border: 2px solid rgba(255,255,255,0.3);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 20px;
      animation: up-pulse 2.8s ease-in-out infinite;
    }
    @keyframes up-pulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(255,255,255,0.25); }
      50%       { box-shadow: 0 0 0 14px rgba(255,255,255,0); }
    }

    .up-badge {
      background: rgba(255,255,255,0.15);
      border: 1px solid rgba(255,255,255,0.25);
      border-radius: 50px;
      padding: 5px 18px;
      font-size: 10px; font-weight: 700;
      color: white; letter-spacing: 2.5px; text-transform: uppercase;
      margin-bottom: 16px;
    }
    .up-panel-title {
      font-size: 26px; font-weight: 800; color: white;
      text-align: center; line-height: 1.3; margin-bottom: 10px;
    }
    .up-panel-sub {
      font-size: 13px; color: rgba(255,255,255,0.72);
      text-align: center; line-height: 1.65; max-width: 210px; margin-bottom: 32px;
    }

    .up-steps { display: flex; flex-direction: column; gap: 0; width: 100%; max-width: 200px; }
    .up-step-row { display: flex; align-items: center; gap: 12px; }
    .up-step-connector {
      width: 2px; height: 28px; margin-left: 13px;
      background: rgba(255,255,255,0.2);
      border-radius: 2px;
      position: relative;
      overflow: hidden;
    }
    .up-step-connector-fill {
      position: absolute; top: 0; left: 0; width: 100%;
      background: rgba(255,255,255,0.7);
      border-radius: 2px;
      transition: height 0.4s ease;
    }
    .up-step-label {
      font-size: 12px; font-weight: 600;
      color: rgba(255,255,255,0.85);
    }
    .up-step-label.done { color: white; }

    .up-panel-right {
      flex: 0 0 50%;
      background: #ffffff;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 44px;
      overflow-y: auto;
    }

    .up-logo-box {
      width: 44px; height: 44px;
      background: linear-gradient(135deg, #7dc832, #5fa820);
      border-radius: 13px;
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 14px;
      box-shadow: 0 4px 18px rgba(125,200,50,0.38);
    }

    .up-title { font-size: 26px; font-weight: 800; color: #0a1628; margin-bottom: 4px; text-align: center; }
    .up-sub   { font-size: 13px; color: #6b7280; margin-bottom: 26px; text-align: center; }

    .up-label {
      display: block; font-size: 11px; font-weight: 700;
      color: #374151; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 5px;
    }
    .up-input {
      width: 100%; padding: 12px 16px;
      border: 1.5px solid #e5e7eb; border-radius: 12px;
      font-size: 14px; font-family: 'Outfit', sans-serif;
      color: #111827; background: #fff; outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .up-input:focus { border-color: #7dc832; box-shadow: 0 0 0 3px rgba(125,200,50,0.13); }
    .up-igroup { position: relative; margin-bottom: 15px; width: 100%; }

    .up-eye {
      position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
      background: none; border: none; cursor: pointer; color: #9ca3af;
      padding: 4px; display: flex; align-items: center;
    }

    .up-strength { display: flex; gap: 4px; margin-top: 6px; }
    .up-strength-bar { flex: 1; height: 3px; border-radius: 2px; transition: background 0.3s; }
    .up-strength-label { font-size: 11px; margin-top: 3px; font-weight: 600; }

    .up-submit {
      width: 100%; padding: 13px;
      background: linear-gradient(135deg, #7dc832, #5fa820);
      color: white; border: none; border-radius: 12px;
      font-size: 14.5px; font-weight: 800;
      font-family: 'Outfit', sans-serif;
      cursor: pointer; letter-spacing: 0.3px;
      transition: all 0.25s; margin-top: 4px;
      display: flex; align-items: center; justify-content: center; gap: 8px;
    }
    .up-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(125,200,50,0.45); }
    .up-submit:disabled { opacity: 0.65; cursor: not-allowed; transform: none; }

    .up-back-btn {
      background: none; border: none; color: #7dc832;
      font-weight: 700; font-size: 13px; cursor: pointer;
      font-family: 'Outfit', sans-serif;
      display: flex; align-items: center; gap: 5px;
      margin-top: 16px; transition: opacity 0.2s;
    }
    .up-back-btn:hover { opacity: 0.75; }

    .up-msg {
      padding: 10px 14px; border-radius: 10px;
      font-size: 13px; font-weight: 600;
      margin-bottom: 14px; width: 100%;
    }
    .up-ok  { background: #d1fae5; color: #3a6e10; }
    .up-err { background: #fee2e2; color: #991b1b; }

    .up-success-wrap {
      display: flex; flex-direction: column; align-items: center; gap: 14px;
      animation: up-fadein 0.5s ease forwards;
    }
    @keyframes up-fadein { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:none; } }

    .up-success-icon {
      width: 72px; height: 72px; border-radius: 50%;
      background: linear-gradient(135deg, #7dc832, #5fa820);
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 8px 28px rgba(125,200,50,0.4);
      animation: up-pop 0.45s cubic-bezier(0.34,1.56,0.64,1) forwards;
    }
    @keyframes up-pop { from { transform: scale(0.5); opacity:0; } to { transform: scale(1); opacity:1; } }

    .up-countdown-ring { width: 40px; height: 40px; position: relative; }
    .up-countdown-ring svg { transform: rotate(-90deg); }
    .up-countdown-ring circle { fill: none; stroke: #e5e7eb; stroke-width: 3; }
    .up-countdown-ring circle.progress {
      stroke: #7dc832; stroke-width: 3;
      stroke-dasharray: 100;
      transition: stroke-dashoffset 1s linear;
    }
    .up-countdown-num {
      position: absolute; inset: 0;
      display: flex; align-items: center; justify-content: center;
      font-size: 13px; font-weight: 800; color: #5fa820;
    }

    .up-spinner {
      width: 18px; height: 18px;
      border: 2.5px solid rgba(255,255,255,0.3);
      border-top-color: white; border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `;

  const getStrength = (pw) => {
    if (!pw) return { score: 0, label: "", color: "#e5e7eb" };
    let score = 0;
    if (pw.length >= 8)  score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 1) return { score, label: "Weak",   color: "#ef4444" };
    if (score <= 3) return { score, label: "Fair",   color: "#f59e0b" };
    if (score <= 4) return { score, label: "Good",   color: "#7dc832" };
    return              { score, label: "Strong", color: "#5fa820" };
  };

  const strength    = getStrength(form.newPassword);
  const dashOffset  = 100 - (countdown / 5) * 100;
  const steps       = ["Enter Email", "Set Password", "Confirm"];

  return (
    <div className="up-wrap">
      <style>{css}</style>
      <div className="up-card">

        {/* ── Left decorative panel ── */}
        <div className="up-panel-left">
          <div className="up-blob1"/><div className="up-blob2"/><div className="up-ring"/>
          <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>

            <div className="up-lock-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" style={{ width: 32, height: 32 }}>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>

            <div className="up-badge">DriveGuard AI</div>
            <div className="up-panel-title">Reset Your Password</div>
            <div className="up-panel-sub">
              Secure your account with a strong new password in just a few steps.
            </div>

            <div className="up-steps">
              {steps.map((label, i) => {
                const isDone   = i < step;
                const isActive = i === step;
                return (
                  <div key={i}>
                    <div className="up-step-row">
                      <StepDot active={isActive} done={isDone} />
                      <span className={`up-step-label${isDone ? " done" : ""}`}>{label}</span>
                    </div>
                    {i < steps.length - 1 && (
                      <div className="up-step-connector">
                        <div className="up-step-connector-fill" style={{ height: isDone ? "100%" : "0%" }}/>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        </div>

        {/* ── Right form panel ── */}
        <div className="up-panel-right">

          {success ? (
            <div className="up-success-wrap">
              <div className="up-success-icon">
                <svg viewBox="0 0 24 20" fill="none" style={{ width: 36, height: 30 }}>
                  <path d="M2 10l7 7L22 2" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#0a1628", textAlign: "center" }}>
                Password Updated!
              </div>
              <div style={{ fontSize: 13.5, color: "#6b7280", textAlign: "center", maxWidth: 280, lineHeight: 1.6 }}>
                Your password has been changed successfully. A confirmation email has been sent to{" "}
                <strong style={{ color: "#5fa820" }}>{form.email}</strong>.
              </div>

              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, marginTop: 8 }}>
                <div className="up-countdown-ring">
                  <svg viewBox="0 0 36 36" width="40" height="40">
                    <circle cx="18" cy="18" r="15.9"/>
                    <circle
                      className="progress"
                      cx="18" cy="18" r="15.9"
                      style={{ strokeDashoffset: dashOffset }}
                    />
                  </svg>
                  <div className="up-countdown-num">{countdown}</div>
                </div>
                <div style={{ fontSize: 12, color: "#9ca3af", fontWeight: 600 }}>
                  Redirecting to Sign In…
                </div>
              </div>

              <button className="up-back-btn" onClick={() => onBackToLogin && onBackToLogin()}>
                ← Go to Sign In now
              </button>
            </div>

          ) : (
            <>
              <div className="up-logo-box">
                <svg viewBox="0 0 24 24" fill="white" style={{ width: 22, height: 22 }}>
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                </svg>
              </div>

              <div className="up-title">Update Password</div>
              <div className="up-sub">Enter your email and choose a new password</div>

              {message && (
                <div className={`up-msg ${message.type === "success" ? "up-ok" : "up-err"}`}>
                  {message.text}
                </div>
              )}

              {/* Email */}
              <div className="up-igroup">
                <label className="up-label">Email Address</label>
                <input
                  className="up-input"
                  name="email"
                  type="email"
                  placeholder="Enter your email address "
                  value={form.email}
                  onChange={handle}
                  autoComplete="email"
                />
              </div>

              {/* New Password */}
              <div className="up-igroup">
                <label className="up-label">New Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    className="up-input"
                    name="newPassword"
                    type={showNew ? "text" : "password"}
                    placeholder="Enter Min. 8 characters"
                    value={form.newPassword}
                    onChange={handle}
                    style={{ paddingRight: 44 }}
                  />
                  <button className="up-eye" type="button" onClick={() => setShowNew(v => !v)}>
                    <EyeIcon open={showNew}/>
                  </button>
                </div>
                {form.newPassword && (
                  <>
                    <div className="up-strength">
                      {[1,2,3,4,5].map(i => (
                        <div key={i} className="up-strength-bar"
                          style={{ background: i <= strength.score ? strength.color : "#e5e7eb" }}
                        />
                      ))}
                    </div>
                    <div className="up-strength-label" style={{ color: strength.color }}>
                      {strength.label}
                    </div>
                  </>
                )}
              </div>

              {/* Confirm Password */}
              <div className="up-igroup">
                <label className="up-label">Confirm Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    className="up-input"
                    name="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Repeat new password"
                    value={form.confirmPassword}
                    onChange={handle}
                    style={{
                      paddingRight: 44,
                      borderColor: form.confirmPassword
                        ? form.confirmPassword === form.newPassword ? "#7dc832" : "#ef4444"
                        : undefined,
                    }}
                  />
                  <button className="up-eye" type="button" onClick={() => setShowConfirm(v => !v)}>
                    <EyeIcon open={showConfirm}/>
                  </button>
                </div>
                {form.confirmPassword && form.confirmPassword !== form.newPassword && (
                  <div style={{ fontSize: 11, color: "#ef4444", marginTop: 4, fontWeight: 600 }}>
                    Passwords do not match
                  </div>
                )}
                {form.confirmPassword && form.confirmPassword === form.newPassword && (
                  <div style={{ fontSize: 11, color: "#7dc832", marginTop: 4, fontWeight: 600 }}>
                    ✓ Passwords match
                  </div>
                )}
              </div>

              <button className="up-submit" onClick={submit} disabled={loading}>
                {loading
                  ? <><div className="up-spinner"/><span>Updating password...</span></>
                  : <span>→  UPDATE PASSWORD</span>
                }
              </button>

              <button className="up-back-btn" onClick={() => onBackToLogin && onBackToLogin()}>
                ← Back to Sign In
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
