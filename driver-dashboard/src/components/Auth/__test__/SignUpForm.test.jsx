/**
 * Component tests — SignUpForm.jsx
 * Tests the form UI in isolation, with all handlers mocked.
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { SignUpForm } from "../forms/SignUpForm";

jest.mock("../../../utils/countries", () => ({
  countries: [],
  getCountryByCode: () => ({ code: "RW", name: "Rwanda", dialCode: "+250", flag: "🇷🇼" }),
}));

const DEFAULT_PROPS = {
  form: {
    firstName: "", lastName: "", email: "",
    phone: "", role: "driver", password: "", confirmPassword: "",
  },
  fieldErrors:   {},
  serverMsg:     null,
  loading:       false,
  onHandle:      jest.fn(),
  onHandlePhone: jest.fn(),
  onSubmit:      jest.fn(),
  onSwitchMode:  jest.fn(),
};

const setup = (overrides = {}) => {
  const props = {
    ...DEFAULT_PROPS,
    onHandle:      jest.fn(),
    onHandlePhone: jest.fn(),
    onSubmit:      jest.fn(),
    onSwitchMode:  jest.fn(),
    ...overrides,
  };
  render(<SignUpForm {...props} />);
  return props;
};

// ─── Rendering ───────────────────────────────────────────────────────────────

describe("SignUpForm — rendering", () => {
  test("renders first name input", () => {
    setup();
    expect(screen.getByPlaceholderText("Enter your first name")).toBeInTheDocument();
  });

  test("renders last name input", () => {
    setup();
    expect(screen.getByPlaceholderText("Enter your last name")).toBeInTheDocument();
  });

  test("renders email input", () => {
    setup();
    expect(screen.getByPlaceholderText("Enter your email address")).toBeInTheDocument();
  });

  test("renders password input", () => {
    setup();
    expect(screen.getByPlaceholderText("At least 8 characters")).toBeInTheDocument();
  });

  test("renders confirm password input", () => {
    setup();
    expect(screen.getByPlaceholderText("Re-enter your password")).toBeInTheDocument();
  });

  test("renders role select", () => {
    setup();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  test("renders Create Account submit button", () => {
    setup();
    expect(screen.getByRole("button", { name: /create account/i })).toBeInTheDocument();
  });

  test("renders Google OAuth button", () => {
    setup();
    expect(screen.getByRole("button", { name: /continue with google/i })).toBeInTheDocument();
  });

  test("renders sign in switch link", () => {
    setup();
    expect(screen.getByText(/sign in/i)).toBeInTheDocument();
  });
});

// ─── Field errors ─────────────────────────────────────────────────────────────

describe("SignUpForm — field errors", () => {
  test("displays first name error", () => {
    setup({ fieldErrors: { firstName: "First name is required." } });
    expect(screen.getByText("First name is required.")).toBeInTheDocument();
  });

  test("displays last name error", () => {
    setup({ fieldErrors: { lastName: "Last name is required." } });
    expect(screen.getByText("Last name is required.")).toBeInTheDocument();
  });

  test("displays email error", () => {
    setup({ fieldErrors: { email: "Please enter your email address." } });
    expect(screen.getByText("Please enter your email address.")).toBeInTheDocument();
  });

  test("displays password error", () => {
    setup({ fieldErrors: { password: "Password must be at least 8 characters." } });
    expect(screen.getByText("Password must be at least 8 characters.")).toBeInTheDocument();
  });

  test("displays confirm password error", () => {
    setup({ fieldErrors: { confirmPassword: "Passwords do not match." } });
    expect(screen.getByText("Passwords do not match.")).toBeInTheDocument();
  });
});

// ─── Server messages ──────────────────────────────────────────────────────────

describe("SignUpForm — server messages", () => {
  test("displays success server message", () => {
    setup({ serverMsg: { type: "success", text: "Account created!" } });
    expect(screen.getByText("Account created!")).toBeInTheDocument();
  });

  test("displays error server message", () => {
    setup({ serverMsg: { type: "error", text: "Email already in use." } });
    expect(screen.getByText("Email already in use.")).toBeInTheDocument();
  });
});

// ─── Loading state ────────────────────────────────────────────────────────────

describe("SignUpForm — loading state", () => {
  test("shows loading label when loading", () => {
    setup({ loading: true });
    expect(screen.getByText("Creating account…")).toBeInTheDocument();
  });

  test("disables submit button when loading", () => {
    setup({ loading: true });
    expect(screen.getByRole("button", { name: /creating account/i })).toBeDisabled();
  });
});

// ─── Interactions ─────────────────────────────────────────────────────────────

describe("SignUpForm — interactions", () => {
  test("calls onSubmit when Create Account button is clicked", () => {
    const props = setup();
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));
    expect(props.onSubmit).toHaveBeenCalledTimes(1);
  });

  test("calls onSwitchMode when Sign in link is clicked", () => {
    const props = setup();
    fireEvent.click(screen.getByText(/sign in →/i));
    expect(props.onSwitchMode).toHaveBeenCalledTimes(1);
  });

  test("calls onHandle when email input changes", () => {
    const props = setup();
    fireEvent.change(screen.getByPlaceholderText("Enter your email address"), {
      target: { name: "email", value: "user@test.com" },
    });
    expect(props.onHandle).toHaveBeenCalled();
  });

  test("calls onHandle when first name input changes", () => {
    const props = setup();
    fireEvent.change(screen.getByPlaceholderText("Enter your first name"), {
      target: { name: "firstName", value: "John" },
    });
    expect(props.onHandle).toHaveBeenCalled();
  });
});
