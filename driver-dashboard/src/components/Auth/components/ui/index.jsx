/* ─────────────────────────────────────────────────────────────────────────
   Shared UI primitives for the DriveGuard Auth module.
   Each component is intentionally tiny — one responsibility only.
───────────────────────────────────────────────────────────────────────── */

export function Label({ htmlFor, children }) {
  return (
    <label
      htmlFor={htmlFor}
      style={{
        display: "block", fontSize: 11, fontWeight: 700,
        color: "#374151", letterSpacing: 1,
        textTransform: "uppercase", marginBottom: 5,
      }}
    >
      {children}
    </label>
  );
}

export function FieldWrap({ children }) {
  return (
    <div style={{ position: "relative", marginBottom: 13, width: "100%" }}>
      {children}
    </div>
  );
}

export function FieldError({ message }) {
  if (!message) return null;
  return (
    <p className="dg-field-error" role="alert">
      {message}
    </p>
  );
}

export function HRule({ text }) {
  return (
    <div className="flex items-center gap-3 w-full my-3">
      <div className="flex-1 h-px bg-gray-200" />
      {text && (
        <span style={{ fontSize: 12, color: "#9ca3af", fontWeight: 600 }}>
          {text}
        </span>
      )}
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  );
}

export function LogoBox() {
  return (
    <div style={{
      width: 40, height: 40, borderRadius: 12, flexShrink: 0, marginBottom: 12,
      background: "linear-gradient(135deg,#7dc832,#5fa820)",
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: "0 4px 15px rgba(125,200,50,0.4)",
    }}>
      <svg viewBox="0 0 24 24" fill="white" style={{ width: 20, height: 20 }} aria-hidden="true">
        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
      </svg>
    </div>
  );
}

export function GreenBg() {
  return (
    <>
      <div style={{ position: "absolute", width: 320, height: 320, borderRadius: "50%", background: "rgba(255,255,255,0.03)", top: -80, left: -80 }} />
      <div style={{ position: "absolute", width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.04)", bottom: -50, right: -50 }} />
      <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.06)", top: -120, left: -120 }} />
    </>
  );
}

export function ServerMessage({ message }) {
  if (!message) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        padding: "10px 14px", borderRadius: 10, fontSize: 13,
        fontWeight: 600, marginBottom: 12, width: "100%",
        background: message.type === "success" ? "#d1fae5" : "#fee2e2",
        color:       message.type === "success" ? "#3a6e10"  : "#991b1b",
      }}
    >
      {message.text}
    </div>
  );
}

export function SubmitBtn({ onClick, loading, label, loadingLabel }) {
  return (
    <button
      type="button"
      className="dg-submit"
      onClick={onClick}
      disabled={loading}
      aria-busy={loading}
      aria-label={loading ? loadingLabel : label}
      style={{
        width: "100%",
        padding: 13,
        border: "none",
        borderRadius: 12,
        marginTop: 6,
        cursor: loading ? "not-allowed" : "pointer",
        background: "linear-gradient(135deg,#7dc832,#5fa820)",
        color: "white",
        fontSize: 14.5,
        fontWeight: 800,
        fontFamily: "'Outfit',sans-serif",
        letterSpacing: 0.3,
        display: "block",   /* ← changed from flex to block */
        width: "100%",
        textAlign: "center",
        pointerEvents: loading ? "none" : "auto",  /* ← prevents dead zones */
        position: "relative",  /* ← ensures click area is the full button */
        zIndex: 1,
      }}
    >
      {loading ? (
        <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <div className="dg-spinner" />
          {loadingLabel}
        </span>
      ) : (
        <span
          style={{
            display: "block",   /* ← block instead of flex */
            width: "100%",
            pointerEvents: "none",  /* ← span won't steal clicks from button */
          }}
        >
          → {label}
        </span>
      )}
    </button>
  );
}
