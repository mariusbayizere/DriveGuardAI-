import { useState, useCallback } from "react";
import { INITIAL_FORM, AUTH_ENDPOINTS } from "../constants/auth.constants";
import { validateSignIn, validateSignUp } from "../validation/auth.validation";

/**
 * Encapsulates all DriveGuard auth form state, field handling,
 * mode switching, and API submission logic.
 *
 * @param {{ onAuthSuccess?: (jwt: string, user: object) => void }} options
 */
export function useAuthForm({ onAuthSuccess } = {}) {
  const [isLogin,             setIsLogin]             = useState(true);
  const [loading,             setLoading]             = useState(false);
  const [serverMsg,           setServerMsg]           = useState(null);
  const [showUpdatePassword,  setShowUpdatePassword]  = useState(false);
  const [form,                setForm]                = useState(INITIAL_FORM);
  const [fieldErrors,         setFieldErrors]         = useState({});

  /** Generic field change handler — also clears that field's error. */
  const handle = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  }, []);

  /** Phone-specific handler (PhoneInput fires synthetic events). */
  const handlePhone = useCallback((e) => {
    setForm((prev) => ({ ...prev, phone: e.target.value }));
    setFieldErrors((prev) => ({ ...prev, phone: undefined }));
  }, []);

  /** Switch between sign-in and sign-up, resetting all state. */
  const switchMode = useCallback((toLogin) => {
    setIsLogin(toLogin);
    setServerMsg(null);
    setFieldErrors({});
    setForm(INITIAL_FORM);
  }, []);

  /** Run validation then POST to the appropriate endpoint. */
  const submit = useCallback(async () => {
    const errors = isLogin ? validateSignIn(form) : validateSignUp(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    setServerMsg(null);
    setFieldErrors({});

    const url  = isLogin ? AUTH_ENDPOINTS.signIn : AUTH_ENDPOINTS.signUp;
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

    try {
      const res  = await fetch(url, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });
      const data = await res.json();

      setLoading(false);

      if (data.status === true) {
        if (isLogin) {
          setServerMsg({ type: "success", text: "✓ Sign in successful! Redirecting…" });
          setTimeout(() => {
            onAuthSuccess?.(data.jwt, { email: form.email, role: data.role, ...form });
          }, 800);
        } else {
          setServerMsg({ type: "success", text: "✓ Account created! Please sign in to continue." });
          setTimeout(() => {
            setForm(INITIAL_FORM);
            setIsLogin(true);
            setServerMsg({ type: "success", text: "✓ Account created! Sign in with your new credentials." });
          }, 1200);
        }
      } else {
        setServerMsg({ type: "error", text: data.message || "Something went wrong. Please try again." });
      }
    } catch {
      setLoading(false);
      setServerMsg({ type: "error", text: "Cannot connect to server. Make sure the backend is running." });
    }
  }, [isLogin, form, onAuthSuccess]);

  return {
    /* state */
    isLogin, loading, serverMsg, showUpdatePassword, form, fieldErrors,
    /* actions */
    handle, handlePhone, switchMode, submit,
    setShowUpdatePassword,
  };
}
