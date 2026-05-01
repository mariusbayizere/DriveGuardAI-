/**
 * Component tests — PhoneInput.jsx
 * Run: npx jest PhoneInput.test.jsx
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { PhoneInput } from "../components/PhoneInput";

jest.mock("../../../utils/countries", () => ({
  countries: [
    { code: "RW", name: "Rwanda",         dialCode: "+250", flag: "🇷🇼" },
    { code: "US", name: "United States",  dialCode: "+1",   flag: "🇺🇸" },
    { code: "GB", name: "United Kingdom", dialCode: "+44",  flag: "🇬🇧" },
  ],
  getCountryByCode: (code) =>
    ({ RW: { code: "RW", name: "Rwanda", dialCode: "+250", flag: "🇷🇼" } }[code] ??
     { code: "RW", name: "Rwanda", dialCode: "+250", flag: "🇷🇼" }),
}));

const setup = (props = {}) => {
  const onChange = jest.fn();
  render(<PhoneInput value="" onChange={onChange} {...props} />);
  return { onChange };
};

describe("PhoneInput", () => {
  test("renders with the default Rwanda dial code", () => {
    setup();
    expect(screen.getByText("+250")).toBeInTheDocument();
    expect(screen.getByText("🇷🇼")).toBeInTheDocument();
  });

  test("renders the phone number input with correct placeholder", () => {
    setup();
    expect(screen.getByPlaceholderText("Enter your phone number")).toBeInTheDocument();
  });

  test("opens dropdown on country selector button click", async () => {
    setup();
    fireEvent.click(screen.getByLabelText("Select country code"));
    expect(await screen.findByRole("listbox")).toBeInTheDocument();
  });

  test("dropdown contains a search input when open", async () => {
    setup();
    fireEvent.click(screen.getByLabelText("Select country code"));
    expect(await screen.findByLabelText("Search country")).toBeInTheDocument();
  });

  test("filters countries by name", async () => {
    setup();
    fireEvent.click(screen.getByLabelText("Select country code"));
    const search = await screen.findByLabelText("Search country");
    fireEvent.change(search, { target: { value: "United" } });
    expect(screen.getByText("United States")).toBeInTheDocument();
    expect(screen.queryByText("Rwanda")).not.toBeInTheDocument();
  });

  test("filters countries by dial code", async () => {
    setup();
    fireEvent.click(screen.getByLabelText("Select country code"));
    const search = await screen.findByLabelText("Search country");
    fireEvent.change(search, { target: { value: "+44" } });
    expect(screen.getByText("United Kingdom")).toBeInTheDocument();
  });

  test("shows 'No results' when search matches nothing", async () => {
    setup();
    fireEvent.click(screen.getByLabelText("Select country code"));
    const search = await screen.findByLabelText("Search country");
    fireEvent.change(search, { target: { value: "ZZZZZZ" } });
    expect(screen.getByText("No results")).toBeInTheDocument();
  });

  test("updates dial code when a country is selected", async () => {
    setup();
    fireEvent.click(screen.getByLabelText("Select country code"));
    await screen.findByRole("listbox");
    fireEvent.click(screen.getByText("United States"));
    expect(screen.getByText("+1")).toBeInTheDocument();
  });

  test("closes dropdown after selecting a country", async () => {
    setup();
    fireEvent.click(screen.getByLabelText("Select country code"));
    await screen.findByRole("listbox");
    fireEvent.click(screen.getByText("United States"));
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  test("calls onChange with formatted phone on number input", () => {
    const { onChange } = setup({ value: "+250" });
    fireEvent.change(screen.getByPlaceholderText("Enter your phone number"), {
      target: { value: "788123456" },
    });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({ name: "phone", value: "+250788123456" }),
      })
    );
  });

  test("applies error CSS class when hasError is true", () => {
    setup({ hasError: true });
    expect(screen.getByPlaceholderText("Enter your phone number").className).toMatch(/error/);
  });

  test("does not apply error CSS class when hasError is false", () => {
    setup({ hasError: false });
    expect(screen.getByPlaceholderText("Enter your phone number").className).not.toMatch(/error/);
  });
});
