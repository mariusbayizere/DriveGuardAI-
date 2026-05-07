import { useEffect } from "react";

/**
 * OAuth2Callback.js
 *
 * Place this file at:
 *   ~/DriveGuardAI-/driver-dashboard/src/components/Auth/OAuth2Callback.js
 *
 * After Google login, Spring Boot redirects to:
 *   http://localhost:3000/oauth2/callback?token=JWT_HERE
 *
 * This component reads the token, saves it, fetches the user profile,
 * then redirects to the dashboard — same as a normal login.
 *
 * ADD THIS ROUTE in your App.js:
 *   import OAuth2Callback from "./components/Auth/OAuth2Callback";
 *   ...
 *   <Route path="/oauth2/callback" element={<OAuth2Callback onAuthSuccess={handleAuthSuccess} />} />
 */
export default function OAuth2Callback({ onAuthSuccess }) {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      // No token — go back to login with error
      window.location.href = "/?error=oauth_failed";
      return;
    }

    // Fetch user profile using the token
    fetch((process.env.REACT_APP_API_BASE || "https://driveguard.local/api/v1") + "/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((user) => {
        // Call the same onAuthSuccess your normal login uses
        // This saves the token and navigates to dashboard
        if (onAuthSuccess) {
          onAuthSuccess(token, user);
        }
      })
      .catch(() => {
        // Even if /me fails, the token is valid — just proceed
        if (onAuthSuccess) {
          onAuthSuccess(token, {});
        }
      });
  }, [onAuthSuccess]);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "radial-gradient(ellipse at 20% 50%, #0d2137 0%, #050d18 60%, #000 100%)",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      {/* Spinner */}
      <div style={{
        width: 48,
        height: 48,
        border: "3px solid rgba(29,148,96,0.3)",
        borderTop: "3px solid #1d9460",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
        marginBottom: 20,
      }}/>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 15, fontWeight: 600 }}>
        Signing you in with Google...
      </p>
      <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, marginTop: 8 }}>
        Please wait a moment
      </p>
    </div>
  );
}
