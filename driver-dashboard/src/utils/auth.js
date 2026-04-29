/**
 * auth.js
 * Pure auth helpers — no React, no side-effects.
 * Safe to import anywhere in the codebase.
 */

export const getToken = () => {
  const token = localStorage.getItem('dg_token');
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const isExpired = payload.exp && Date.now() / 1000 > payload.exp;
    if (isExpired) {
      localStorage.removeItem('dg_token');
      localStorage.removeItem('dg_user');
      return null;
    }
    return token;
  } catch {
    return token; // non-JWT token — return as-is
  }
};

export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem('dg_user'));
  } catch {
    return null;
  }
};

export const clearSession = () => {
  localStorage.removeItem('dg_token');
  localStorage.removeItem('dg_user');
};
