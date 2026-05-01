import { Label, FieldWrap, FieldError, HRule, ServerMessage, SubmitBtn } from "../components/ui";
import { PasswordField } from "../components/PasswordField";
import { PhoneInput }    from "../components/PhoneInput";
import { GoogleButton }  from "../components/GoogleButton";
import { USER_ROLES }    from "../constants/auth.constants";

/**
 * Sign-up form fields + submit button.
 * Receives all state and handlers from the parent via props (no local state).
 *
 * @param {{
 *   form:          object,
 *   fieldErrors:   object,
 *   serverMsg:     object|null,
 *   loading:       boolean,
 *   onHandle:      Function,
 *   onHandlePhone: Function,
 *   onSubmit:      Function,
 *   onSwitchMode:  () => void,
 *   idPrefix:      string,   // unique prefix per breakpoint to avoid duplicate IDs
 * }} props
 */
export function SignUpForm({
  form, fieldErrors, serverMsg, loading,
  onHandle, onHandlePhone, onSubmit, onSwitchMode,
  idPrefix = "su",
}) {
  return (
    <>
      <ServerMessage message={serverMsg} />

      {/* Name row */}
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <FieldWrap>
          <Label htmlFor={`${idPrefix}-firstName`}>First Name</Label>
          <input
            id={`${idPrefix}-firstName`}
            className={`dg-input${fieldErrors.firstName ? " error" : ""}`}
            name="firstName"
            placeholder="Enter your first name"
            value={form.firstName}
            onChange={onHandle}
            aria-invalid={!!fieldErrors.firstName}
          />
          <FieldError message={fieldErrors.firstName} />
        </FieldWrap>

        <FieldWrap>
          <Label htmlFor={`${idPrefix}-lastName`}>Last Name</Label>
          <input
            id={`${idPrefix}-lastName`}
            className={`dg-input${fieldErrors.lastName ? " error" : ""}`}
            name="lastName"
            placeholder="Enter your last name"
            value={form.lastName}
            onChange={onHandle}
            aria-invalid={!!fieldErrors.lastName}
          />
          <FieldError message={fieldErrors.lastName} />
        </FieldWrap>
      </div>

      {/* Email */}
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

      {/* Phone */}
      <FieldWrap>
        <Label>Phone Number</Label>
        <PhoneInput
          value={form.phone}
          onChange={onHandlePhone}
          hasError={!!fieldErrors.phone}
        />
        {form.phone && !fieldErrors.phone && (
          <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4, paddingLeft: 2 }}>
            Will be saved as: <strong style={{ color: "#7dc832" }}>{form.phone}</strong>
          </div>
        )}
        <FieldError message={fieldErrors.phone} />
      </FieldWrap>

      {/* Role */}
      <FieldWrap>
        <Label htmlFor={`${idPrefix}-role`}>Role</Label>
        <select
          id={`${idPrefix}-role`}
          className="dg-select"
          name="role"
          value={form.role}
          onChange={onHandle}
        >
          {USER_ROLES.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </FieldWrap>

      {/* Passwords */}
      <PasswordField
        id={`${idPrefix}-password`}
        name="password"
        label="Password"
        placeholder="At least 8 characters"
        value={form.password}
        onChange={onHandle}
        error={fieldErrors.password}
      />
      <PasswordField
        id={`${idPrefix}-confirmPassword`}
        name="confirmPassword"
        label="Confirm Password"
        placeholder="Re-enter your password"
        value={form.confirmPassword}
        onChange={onHandle}
        error={fieldErrors.confirmPassword}
      />

      <SubmitBtn
        onClick={onSubmit}
        loading={loading}
        label="CREATE ACCOUNT"
        loadingLabel="Creating account…"
      />

      <HRule text="OR" />
      <GoogleButton />

      <p style={{ fontSize: 13, color: "#6b7280", textAlign: "center", marginTop: 12 }}>
        Already have an account?{" "}
        <button
          type="button"
          onClick={onSwitchMode}
          style={{
            background: "none", border: "none", color: "#7dc832",
            fontWeight: 800, cursor: "pointer", fontSize: 13,
            fontFamily: "'Outfit',sans-serif",
          }}
        >
          Sign in →
        </button>
      </p>
    </>
  );
}
