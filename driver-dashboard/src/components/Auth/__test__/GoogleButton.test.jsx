/**
 * Component tests — GoogleButton.jsx
 * Run: npx jest GoogleButton.test.jsx
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { GoogleButton } from "../components/GoogleButton";

const originalLocation = window.location;

beforeEach(() => {
  delete window.location;
  window.location = { href: "" };
});

afterEach(() => {
  window.location = originalLocation;
});

describe("GoogleButton", () => {
  test("renders the button with correct accessible label", () => {
    render(<GoogleButton />);
    expect(screen.getByRole("button", { name: /continue with google/i })).toBeInTheDocument();
  });

  test("displays the Google logo SVG", () => {
    render(<GoogleButton />);
    const btn = screen.getByRole("button", { name: /continue with google/i });
    expect(btn.querySelector("svg")).toBeInTheDocument();
  });

  test("redirects to Google OAuth endpoint on click", () => {
    render(<GoogleButton />);
    fireEvent.click(screen.getByRole("button", { name: /continue with google/i }));
    expect(window.location.href).toMatch(/oauth2\/authorization\/google/);
  });

  test("includes prompt=select_account in the redirect URL", () => {
    render(<GoogleButton />);
    fireEvent.click(screen.getByRole("button", { name: /continue with google/i }));
    expect(window.location.href).toMatch(/select_account/);
  });
});
