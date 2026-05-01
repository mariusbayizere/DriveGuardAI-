import { ShieldLogo }      from "../icons/ShieldLogo";
import { CarIllustration } from "../icons/CarIllustration";
import { GreenBg }         from "./ui";
import { FEATURES }        from "../constants/auth.constants";

/**
 * The green sliding overlay shown on tablet/desktop.
 * Renders marketing copy, feature pills, and the mode-switch CTA.
 *
 * @param {{ isLogin: boolean, onSwitch: () => void, compact?: boolean }} props
 */
export function OverlayContent({ isLogin, onSwitch, compact = false }) {
  return (
    <div className="relative z-10 flex flex-col items-center text-center">
      <GreenBg />

      <div style={{ marginBottom: compact ? 8 : 16 }}>
        <ShieldLogo />
      </div>

      {/* Brand badge */}
      <div style={{
        background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)",
        borderRadius: 50, padding: compact ? "4px 14px" : "6px 20px",
        fontSize: 10, fontWeight: 700, color: "white",
        letterSpacing: 2.5, textTransform: "uppercase",
        marginBottom: compact ? 8 : 20,
      }}>
        DriveGuard AI
      </div>

      {/* Headline */}
      <div style={{
        fontFamily: "'Outfit',sans-serif",
        fontSize:   compact ? 20 : 30,
        fontWeight: 800, color: "white",
        lineHeight: 1.25, marginBottom: compact ? 6 : 12,
      }}>
        {isLogin ? "New Here?" : "Welcome Back!"}
      </div>

      {/* Sub-copy */}
      <div style={{
        fontSize: compact ? 12 : 13.5,
        color: "rgba(255,255,255,0.72)",
        lineHeight: 1.65,
        marginBottom: compact ? 12 : 24,
        maxWidth: compact ? 200 : 230,
      }}>
        {isLogin
          ? "Join thousands of drivers using AI-powered real-time safety monitoring"
          : "Sign back in to monitor your fleet and drive with confidence"}
      </div>

      {!compact && <CarIllustration />}

      {/* Feature pills */}
      <div style={{
        marginTop: compact ? 0 : 12,
        display: "flex",
        flexDirection: compact ? "row" : "column",
        flexWrap: "wrap",
        gap: compact ? 5 : 0,
        justifyContent: "center",
      }}>
        {FEATURES.map((f) => (
          <div key={f} style={{
            display: "flex", alignItems: "center",
            gap: compact ? 5 : 10,
            background: "rgba(255,255,255,0.09)",
            borderRadius: 50,
            padding: compact ? "4px 9px" : "7px 16px",
            margin: compact ? 0 : "4px 0",
          }}>
            <div style={{
              width: compact ? 5 : 7, height: compact ? 5 : 7,
              borderRadius: "50%", background: "#a3e635", flexShrink: 0,
            }} />
            <span style={{
              fontSize: compact ? 10.5 : 12.5,
              color: "rgba(255,255,255,0.88)",
              fontWeight: 600,
            }}>
              {f}
            </span>
          </div>
        ))}
      </div>

      {/* CTA button */}
      <button
        className="dg-ov-btn"
        onClick={onSwitch}
        style={{
          marginTop: compact ? 14 : 24,
          background: "transparent",
          border: "2px solid rgba(255,255,255,0.85)",
          color: "white",
          padding: compact ? "9px 26px" : "12px 38px",
          borderRadius: 50, fontSize: 13, fontWeight: 700,
          letterSpacing: 1, cursor: "pointer",
          fontFamily: "'Outfit',sans-serif",
        }}
      >
        {isLogin ? "CREATE ACCOUNT" : "SIGN IN"}
      </button>
    </div>
  );
}
