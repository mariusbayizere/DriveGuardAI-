/**
 * hooks/useAuth.js
 * Owns all authentication state and logic.
 * Components consume this hook — they never touch localStorage directly.
 */
import { useState, useEffect } from 'react';
import { getToken, getUser, clearSession } from '../utils/auth';

const API_BASE = process.env.REACT_APP_API_BASE;

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!getToken());
  const [userRole,         setUserRole]        = useState('');
  const [roleLoading,      setRoleLoading]     = useState(!!getToken());

  // On mount: resolve role from localStorage or API
  useEffect(() => {
    const token = getToken();
    if (!token) { setRoleLoading(false); return; }

    const savedUser = getUser();
    const savedRole = savedUser?.role || savedUser?.userRole || '';

    if (savedRole) {
      setUserRole(savedRole.toUpperCase());
      setRoleLoading(false);
      return;
    }

    fetch(`${API_BASE}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (data?.role) {
          const role = String(data.role).toUpperCase();
          setUserRole(role);
          localStorage.setItem('dg_user', JSON.stringify({ ...(savedUser || {}), ...data, role }));
        }
      })
      .catch(() => {})
      .finally(() => setRoleLoading(false));
  }, []);

  /**
   * Called after a successful login (normal or OAuth2).
   * Fetches the user profile, persists everything, and — critically —
   * RETURNS the resolved role synchronously so callers can navigate
   * immediately without waiting for a React state re-render.
   */
  const login = async (token) => {
    localStorage.setItem('dg_token', token);
    let resolvedRole = '';

    try {
      const controller = new AbortController();
      const timeout    = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (res.ok) {
        const userData = await res.json();
        resolvedRole   = String(userData.role || userData.userRole || '').toUpperCase();
        localStorage.setItem('dg_user', JSON.stringify({ ...userData, role: resolvedRole }));
        setUserRole(resolvedRole); // keep state in sync for the rest of the app
      }
    } catch (err) {
      console.warn('Could not fetch user profile:', err.message);
    }

    setIsAuthenticated(true);
    setRoleLoading(false);
    return resolvedRole; // ← callers use THIS, not the stale state value
  };

  const logout = () => {
    clearSession();
    setIsAuthenticated(false);
    setUserRole('');
  };

  const isDriver  = userRole === 'DRIVER';
  const homeRoute = isDriver ? '/driver-portal' : '/';

  return { isAuthenticated, userRole, isDriver, homeRoute, roleLoading, login, logout };
};
