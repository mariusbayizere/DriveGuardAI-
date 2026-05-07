import { useState } from 'react';
import { AUTH_ENDPOINTS, INITIAL_FORM_STATE } from '../constants/authConfig';

/**
 * Encapsulates all auth form state, validation, and API calls.
 *
 * @param {Function} onAuthSuccess - called with (jwt, userMeta) after a
 *   successful sign-in.
 */
export function useAuthForm(onAuthSuccess) {
  const [isLogin,            setIsLogin]            = useState(true);
  const [showPass,           setShowPass]           = useState(false);
  const [showConfirm,        setShowConfirm]        = useState(false);
  const [loading,            setLoading]            = useState(false);
  const [message,            setMessage]            = useState(null);
  const [showUpdatePassword, setShowUpdatePassword] = useState(false);
  const [form,               setForm]               = useState(INITIAL_FORM_STATE);

  // ── Field change handler ──────────────────────────────────────────────────
  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // ── Switch between login / register ──────────────────────────────────────
  const switchMode = (toLogin) => {
    setIsLogin(toLogin);
    setMessage(null);
    setForm(INITIAL_FORM_STATE);
  };

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    if (!form.email || !form.password) {
      setMessage({ type: 'error', text: 'Please fill in all required fields.' });
      return false;
    }
    if (!isLogin && form.password !== form.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      return false;
    }
    return true;
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const submit = async () => {
    if (!validate()) return;

    setLoading(true);
    setMessage(null);

    try {
      const url  = isLogin ? AUTH_ENDPOINTS.SIGN_IN : AUTH_ENDPOINTS.SIGN_UP;
      const body = isLogin
        ? { email: form.email, password: form.password }
        : {
            firstName:       form.firstName,
            lastName:        form.lastName,
            email:           form.email,
            phoneNumber:     form.phone,
            userRole:        form.role,
            password:        form.password,
            confirmPassword: form.confirmPassword,
          };

      const res  = await fetch(url, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      });
      const data = await res.json();

      if (data.status === true) {
        setLoading(false);

        if (isLogin) {
          setMessage({ type: 'success', text: '✓ Sign in successful! Redirecting…' });
          setTimeout(() => {
            onAuthSuccess?.(data.jwt, { email: form.email, role: data.role, ...form });
          }, 800);
        } else {
          setMessage({ type: 'success', text: '✓ Account created! Please sign in.' });
          setTimeout(() => {
            setForm(INITIAL_FORM_STATE);
            setIsLogin(true);
            setMessage({ type: 'success', text: '✓ Account created! Sign in with your new credentials.' });
          }, 1200);
        }
      } else {
        setLoading(false);
        setMessage({ type: 'error', text: data.message || 'Something went wrong.' });
      }
    } catch {
      setLoading(false);
      setMessage({
        type: 'error',
        text: 'Cannot connect to server. Make sure Spring Boot is running on port 8080.',
      });
    }
  };

  return {
    // state
    isLogin,
    showPass,
    showConfirm,
    loading,
    message,
    showUpdatePassword,
    form,
    // setters / actions
    setShowPass,
    setShowConfirm,
    setShowUpdatePassword,
    handleChange,
    switchMode,
    submit,
  };
}
