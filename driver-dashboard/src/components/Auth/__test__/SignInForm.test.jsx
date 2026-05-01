/**
 * Component tests — SignInForm.jsx
 * Tests the form UI in isolation, with all handlers mocked.
 * Run: npx jest SignInForm.test.jsx
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { SignInForm } from "../forms/SignInForm";

jest.mock("../../../utils/countries", () => ({
  countries: [],
  getCountryByCode: () => ({ code: "RW", name: "Rwanda", dialCode: "+250", flag: "🇷🇼" }),
}));

const DEFAULT_PROPS = {
  form:         { email: "", password: "" },
  fieldErrors:  {},
  serverMsg:    null,
  loading:      false,
  onHandle:     jest.fn(),
  onSubmit:     jest.fn(),
  onSwitchMode: jest.fn(),
  onForgotPass: jest.fn(),
};

const setup = (overrides = {}) => {
  const props = { ...DEFAULT_PROPS, ...overrides,
    onHandle:     jest.fn(),
    onSubmit:     jest.fn(),
    onSwitchMode: jest.fn(),
    onForgotPass: jest.fn(),
    ...overrides,
  };
  render(<SignInForm {...props} />);
  return props;
};

describe("SignInForm — rendering", () => {
  test("renders email input with correct placeholder", () => {
    setup();
    expect(screen.getByPlaceholderText("Enter your email address")).toBeInTheDocument();
  });

  test("renders password input with correct placeholder", () => {
    setup();
    expect(screen.getByPlaceholderText("Enter your password")).toBeInTheDocument();
  });

  test("renders Sign In submit button", () => {
    setup();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  test("renders Forgot password link", () => {
    setup();
    expect(screen.getByText("Forgot password?")).toBeInTheDocument();
  });

  test("renders Google OAuth button", () => {
    setup();
    expect(screen.getByRole("button", { name: /continue with google/i })).toBeInTheDocument();
  });

  test("renders mode switch link", () => {
    setup();
    expect(screen.getByText(/create one/i)).toBeInTheDocument();
  });
});

describe("SignInForm — field errors", () => {
  test("displays email error message when provided", () => {
    setup({ fieldErrors: { email: "Please enter your email address." } });
    expect(screen.getByText("Please enter your email address.")).toBeInTheDocument();
  });

  test("displays password error message when provided", () => {
    setup({ fieldErrors: { password: "Please enter your password." } });
    expect(screen.getByText("Please enter your password.")).toBeInTheDocument();
  });

  test("applies error CSS class to email input on error", () => {
    setup({ fieldErrors: { email: "Some error" } });
    expect(screen.getByPlaceholderText("Enter your email address").className).toMatch(/error/);
  });

  test("does not show error when fieldErrors is empty", () => {
    setup();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});

describe("SignInForm — server messages", () => {
  test("displays success server message", () => {
    setup({ serverMsg: { type: "success", text: "✓ Sign in successful!" } });
    expect(screen.getByText("✓ Sign in successful!")).toBeInTheDocument();
  });

  test("displays error server message", () => {
    setup({ serverMsg: { type: "error", text: "Invalid credentials." } });
    expect(screen.getByText("Invalid credentials.")).toBeInTheDocument();
  });
});

describe("SignInForm — loading state", () => {
  test("shows loading spinner and label when loading", () => {
    setup({ loading: true });
    expect(screen.getByText("Signing in…")).toBeInTheDocument();
    expect(document.querySelector(".dg-spinner")).toBeInTheDocument();
  });

  test("disables submit button when loading", () => {
    setup({ loading: true });
    expect(screen.getByRole("button", { name: /signing in/i })).toBeDisabled();
  });
});

describe("SignInForm — interactions", () => {
  test("calls onSubmit when Sign In button is clicked", () => {
    const props = setup();
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
	expect(props.onSubmit).toHaveBeenCalledTimes(1);
  });

  test("calls onForgotPass when Forgot password is clicked", () => {
    const props = setup();
    fireEvent.click(screen.getByText("Forgot password?"));
    expect(props.onForgotPass).toHaveBeenCalledTimes(1);
  });

  test("calls onSwitchMode when Create one link is clicked", () => {
    const props = setup();
    fireEvent.click(screen.getByText(/create one/i));
    expect(props.onSwitchMode).toHaveBeenCalledTimes(1);
  });

  test("calls onHandle when email input changes", () => {
    const props = setup();
    fireEvent.change(screen.getByPlaceholderText("Enter your email address"), {
      target: { name: "email", value: "test@test.com" },
    });
    expect(props.onHandle).toHaveBeenCalled();
  });
});
