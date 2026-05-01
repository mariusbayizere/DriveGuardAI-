/**
 * Unit tests — auth.validation.js
 * Pure functions: no React, no DOM, no fetch.
 * Run: npx jest auth.validation.test.js
 */

import { validateSignIn, validateSignUp } from "../validation/auth.validation";

/* ─────────────────────────────────────────────────────────────────────────
   validateSignIn
───────────────────────────────────────────────────────────────────────── */
describe("validateSignIn", () => {
  const VALID = { email: "user@example.com", password: "secret123" };

  test("returns no errors for valid credentials", () => {
    expect(validateSignIn(VALID)).toEqual({});
  });

  test("requires email field", () => {
    const { email } = validateSignIn({ ...VALID, email: "" });
    expect(email).toMatch(/enter your email/i);
  });

  test("whitespace-only email is treated as empty", () => {
    const { email } = validateSignIn({ ...VALID, email: "   " });
    expect(email).toMatch(/enter your email/i);
  });

  test("rejects malformed email — missing domain", () => {
    const { email } = validateSignIn({ ...VALID, email: "user@" });
    expect(email).toMatch(/valid email/i);
  });

  test("rejects malformed email — missing @", () => {
    const { email } = validateSignIn({ ...VALID, email: "userexample.com" });
    expect(email).toMatch(/valid email/i);
  });

  test("requires password field", () => {
    const { password } = validateSignIn({ ...VALID, password: "" });
    expect(password).toMatch(/enter your password/i);
  });

  test("reports only the affected field — email missing", () => {
    const errors = validateSignIn({ email: "", password: "pass123" });
    expect(errors.email).toBeDefined();
    expect(errors.password).toBeUndefined();
  });

  test("reports only the affected field — password missing", () => {
    const errors = validateSignIn({ email: "a@b.com", password: "" });
    expect(errors.email).toBeUndefined();
    expect(errors.password).toBeDefined();
  });
});

/* ─────────────────────────────────────────────────────────────────────────
   validateSignUp
───────────────────────────────────────────────────────────────────────── */
describe("validateSignUp", () => {
  const VALID = {
    firstName:       "Aime",
    lastName:        "Roger",
    email:           "aime@company.com",
    phone:           "+250788000000",
    password:        "Secure123",
    confirmPassword: "Secure123",
  };

  test("returns no errors for fully valid form", () => {
    expect(validateSignUp(VALID)).toEqual({});
  });

  // ── Name fields ──
  test("requires first name", () => {
    const { firstName } = validateSignUp({ ...VALID, firstName: "" });
    expect(firstName).toMatch(/first name/i);
  });

  test("whitespace-only first name is treated as empty", () => {
    const { firstName } = validateSignUp({ ...VALID, firstName: "   " });
    expect(firstName).toMatch(/first name/i);
  });

  test("requires last name", () => {
    const { lastName } = validateSignUp({ ...VALID, lastName: "" });
    expect(lastName).toMatch(/last name/i);
  });

  // ── Email ──
  test("requires email", () => {
    const { email } = validateSignUp({ ...VALID, email: "" });
    expect(email).toMatch(/email/i);
  });

  test("rejects invalid email format", () => {
    const { email } = validateSignUp({ ...VALID, email: "bad@" });
    expect(email).toMatch(/valid email/i);
  });

  // ── Phone ──
  test("requires phone number", () => {
    const { phone } = validateSignUp({ ...VALID, phone: "" });
    expect(phone).toMatch(/phone/i);
  });

  test("rejects phone with fewer than 7 digits", () => {
    const { phone } = validateSignUp({ ...VALID, phone: "+250123" });
    expect(phone).toMatch(/phone/i);
  });

  test("accepts phone with exactly 7 digits", () => {
    const errors = validateSignUp({ ...VALID, phone: "+2507777777" });
    expect(errors.phone).toBeUndefined();
  });

  // ── Password ──
  test("requires password", () => {
    const { password } = validateSignUp({ ...VALID, password: "", confirmPassword: "" });
    expect(password).toMatch(/password/i);
  });

  test("enforces minimum 8-character password", () => {
    const { password } = validateSignUp({ ...VALID, password: "abc1234", confirmPassword: "abc1234" });
    expect(password).toMatch(/8 characters/i);
  });

  test("accepts password of exactly 8 characters", () => {
    const errors = validateSignUp({ ...VALID, password: "Abcd1234", confirmPassword: "Abcd1234" });
    expect(errors.password).toBeUndefined();
  });

  // ── Confirm password ──
  test("requires confirmPassword", () => {
    const { confirmPassword } = validateSignUp({ ...VALID, confirmPassword: "" });
    expect(confirmPassword).toMatch(/confirm/i);
  });

  test("detects password mismatch", () => {
    const { confirmPassword } = validateSignUp({ ...VALID, confirmPassword: "Different!" });
    expect(confirmPassword).toMatch(/do not match/i);
  });

  // ── Independence ──
  test("reports all fields independently on completely empty form", () => {
    const errors = validateSignUp({
      firstName: "", lastName: "", email: "",
      phone: "", password: "", confirmPassword: "",
    });
    expect(Object.keys(errors).length).toBeGreaterThanOrEqual(6);
  });

  test("fixing one field does not affect errors in other fields", () => {
    const errors = validateSignUp({ ...VALID, firstName: "Aime", email: "" });
    expect(errors.firstName).toBeUndefined();
    expect(errors.email).toBeDefined();
  });
});
