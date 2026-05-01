/**
 * Integration tests — DriveGuardAI_Auth.jsx
 * Tests the full auth page: mode switching, form visibility, and flow.
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import DriveGuardAuth from "../DriveGuardAI_Auth";

jest.mock("../../../utils/countries", () => ({
  countries: [],
  getCountryByCode: () => ({ code: "RW", name: "Rwanda", dialCode: "+250", flag: "🇷🇼" }),
}));

jest.mock("../UpdatePassword", () => ({
  __esModule: true,
  default: ({ onBackToLogin }) => (
    <div>
      <span>Update Password Screen</span>
      <button onClick={onBackToLogin}>Back to Login</button>
    </div>
  ),
}));

const setup = (overrides = {}) => {
  const props = { onAuthSuccess: jest.fn(), ...overrides };
  render(<DriveGuardAuth {...props} />);
  return props;
};

// ─── Initial render ───────────────────────────────────────────────────────────

describe("DriveGuardAuth — initial render", () => {
  test("renders without crashing", () => {
    setup();
    expect(document.body).toBeTruthy();
  });

  test("renders email input on load", () => {
    setup();
    expect(screen.getAllByPlaceholderText("Enter your email address").length).toBeGreaterThan(0);
  });

  test("renders Sign In button on load", () => {
    setup();
    expect(screen.getAllByRole("button", { name: /sign in/i }).length).toBeGreaterThan(0);
  });

  test("renders Google OAuth button", () => {
    setup();
    expect(screen.getAllByRole("button", { name: /continue with google/i }).length).toBeGreaterThan(0);
  });
});

// ─── Mode switching ───────────────────────────────────────────────────────────

describe("DriveGuardAuth — mode switching", () => {
  test("shows Create Account button after switching to sign-up", () => {
    setup();
    const signUpBtn = screen.getAllByRole("button", { name: /sign up/i })[0];
    fireEvent.click(signUpBtn);
    expect(screen.getAllByRole("button", { name: /create account/i }).length).toBeGreaterThan(0);
  });

  test("shows Sign In button after switching back to sign-in", () => {
    setup();
    const signUpBtn = screen.getAllByRole("button", { name: /sign up/i })[0];
    fireEvent.click(signUpBtn);
    const signInBtn = screen.getAllByRole("button", { name: /← sign in/i })[0];
    fireEvent.click(signInBtn);
    expect(screen.getAllByRole("button", { name: /sign in/i }).length).toBeGreaterThan(0);
  });
});

// ─── Forgot password flow ─────────────────────────────────────────────────────

describe("DriveGuardAuth — forgot password flow", () => {
  test("shows UpdatePassword screen when Forgot password is clicked", () => {
    setup();
    fireEvent.click(screen.getAllByText("Forgot password?")[0]);
    expect(screen.getByText("Update Password Screen")).toBeInTheDocument();
  });

  test("returns to login when Back to Login is clicked from UpdatePassword", () => {
    setup();
    fireEvent.click(screen.getAllByText("Forgot password?")[0]);
    fireEvent.click(screen.getByText("Back to Login"));
    expect(screen.getAllByRole("button", { name: /sign in/i }).length).toBeGreaterThan(0);
  });
});
