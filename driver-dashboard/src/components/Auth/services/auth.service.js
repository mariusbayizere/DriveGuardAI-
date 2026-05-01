import { AUTH_ENDPOINTS } from '../constants/auth.constants';

/**
 * Signs an existing user in.
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<{ status: boolean, jwt?: string, role?: string, message?: string }>}
 */
export async function signIn({ email, password }) {
  const res = await fetch(AUTH_ENDPOINTS.SIGN_IN, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ email, password }),
  });
  return res.json();
}

/**
 * Registers a new user account.
 * @param {object} formData
 * @returns {Promise<{ status: boolean, message?: string }>}
 */
export async function signUp({ firstName, lastName, email, phone, role, password, confirmPassword }) {
  const res = await fetch(AUTH_ENDPOINTS.SIGN_UP, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({
      firstName,
      lastName,
      email,
      phoneNumber:     phone,
      userRole:        role,
      password,
      confirmPassword,
    }),
  });
  return res.json();
}

/**
 * Redirects the browser to the Google OAuth2 flow.
 */
export function initiateGoogleLogin() {
  window.location.href = AUTH_ENDPOINTS.GOOGLE;
}
