/**
 * components/screens/OAuth2Callback.jsx
 * Handles the redirect from Google OAuth2.
 * Extracts the token from the URL, resolves the user role, then navigates.
 */
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const OAuth2Callback = ({ onLogin }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token  = params.get('token');

    if (!token) {
      navigate('/login?error=oauth_failed', { replace: true });
      return;
    }

    // onLogin returns the resolved role — use it directly, never rely on stale state
    onLogin(token)
      .then((resolvedRole) => {
        navigate(resolvedRole === 'DRIVER' ? '/driver-portal' : '/', { replace: true });
      })
      .catch(() => navigate('/', { replace: true }));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{
      height: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at 20% 50%, #0d2137 0%, #050d18 60%, #000 100%)',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      <div style={{
        width: 48, height: 48, marginBottom: 20,
        border: '3px solid rgba(29,148,96,0.3)', borderTop: '3px solid #1d9460',
        borderRadius: '50%', animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, fontWeight: 600 }}>
        Signing you in with Google...
      </p>
      <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, marginTop: 8 }}>
        Please wait a moment
      </p>
    </div>
  );
};

export default OAuth2Callback;
