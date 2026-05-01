import { Label, FieldWrap, FieldError, HRule, ServerMessage, SubmitBtn } from "../components/ui";
import { PasswordField } from "../components/PasswordField";
import { GoogleButton }  from "../components/GoogleButton";

/**
 * Sign-in form fields + submit button.
 * Receives all state and handlers from the parent via props (no local state).
 *
 * @param {{
 *   form:          object,
 *   fieldErrors:   object,
 *   serverMsg:     object|null,
 *   loading:       boolean,
 *   onHandle:      Function,
 *   onSubmit:      Function,
 *   onSwitchMode:  () => void,
 *   onForgotPass:  () => void,
 *   idPrefix:      string,   // unique prefix per breakpoint to avoid duplicate IDs
 * }} props
 */
export function SignInForm({
  form, fieldErrors, serverMsg, loading,
  onHandle, onSubmit, onSwitchMode, onForgotPass,
  idPrefix = "si",
}) {
  return (
    <>
      <ServerMessage message={serverMsg} />

      <FieldWrap>
        <Label htmlFor={`${idPrefix}-email`}>Email Address</Label>
        <input
          id={`${idPrefix}-email`}
          className={`dg-input${fieldErrors.email ? " error" : ""}`}
          name="email"
          type="email"
          placeholder="Enter your email address"
          value={form.email}
          onChange={onHandle}
          aria-invalid={!!fieldErrors.email}
        />
        <FieldError message={fieldErrors.email} />
      </FieldWrap>

      <PasswordField
        id={`${idPrefix}-password`}
        name="password"
        label="Password"
        placeholder="Enter your password"
        value={form.password}
        onChange={onHandle}
        error={fieldErrors.password}
      />

      <div className="w-full text-right" style={{ marginTop: -6, marginBottom: 14 }}>
        <button
          type="button"
          onClick={onForgotPass}
          style={{
            fontSize: 13, color: "#7dc832", fontWeight: 700,
            background: "none", border: "none", cursor: "pointer",
            fontFamily: "'Outfit',sans-serif",
          }}
        >
          Forgot password?
        </button>
      </div>

      <SubmitBtn
        onClick={onSubmit}
        loading={loading}
        label="SIGN IN"
        loadingLabel="Signing in…"
      />

      <HRule text="OR" />
      <GoogleButton />
      <HRule />

      <p style={{ fontSize: 13, color: "#6b7280", textAlign: "center" }}>
        No account?{" "}
        <button
          type="button"
          onClick={onSwitchMode}
          style={{
            background: "none", border: "none", color: "#7dc832",
            fontWeight: 800, cursor: "pointer", fontSize: 13,
            fontFamily: "'Outfit',sans-serif",
          }}
        >
          Create one →
        </button>
      </p>
    </>
  );
}
