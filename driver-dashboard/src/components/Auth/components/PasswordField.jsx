import { useState } from "react";
import { EyeIcon } from "../icons/EyeIcon";
import { Label, FieldWrap, FieldError } from "./ui";

/**
 * A labelled password input with show/hide toggle and inline field error.
 *
 * @param {{ id: string, name: string, label: string, placeholder: string,
 *           value: string, onChange: Function, error?: string }} props
 */
export function PasswordField({ id, name, label, placeholder, value, onChange, error }) {
  const [show, setShow] = useState(false);

  return (
    <FieldWrap>
      <Label htmlFor={id}>{label}</Label>
      <div style={{ position: "relative" }}>
        <input
          id={id}
          className={`dg-input${error ? " error" : ""}`}
          name={name}
          type={show ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          style={{ paddingRight: 44 }}
          aria-describedby={error ? `${id}-error` : undefined}
          aria-invalid={!!error}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          style={{
            position: "absolute", right: 12, top: "50%",
            transform: "translateY(-50%)",
            background: "none", border: "none", cursor: "pointer",
            color: "#9ca3af", padding: 4,
            display: "flex", alignItems: "center",
          }}
        >
          <EyeIcon open={show} />
        </button>
      </div>
      <FieldError message={error} />
    </FieldWrap>
  );
}
