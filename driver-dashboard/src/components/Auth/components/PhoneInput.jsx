import { useState, useRef, useEffect } from "react";
import { countries, getCountryByCode } from "../../../utils/countries";

export function PhoneInput({ value, onChange, hasError }) {
  const [selected, setSelected] = useState(getCountryByCode("RW"));
  const [open,     setOpen]     = useState(false);
  const [search,   setSearch]   = useState("");
  const dropRef                 = useRef(null);

  const localNumber =
    value && value.startsWith(selected.dialCode)
      ? value.slice(selected.dialCode.length)
      : value || "";

  const filtered = countries.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.dialCode.includes(search)
  );

  /* Close dropdown on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectCountry = (c) => {
    setSelected(c);
    setOpen(false);
    setSearch("");
    onChange({ target: { name: "phone", value: c.dialCode + localNumber } });
  };

  const handleNumberChange = (e) => {
    onChange({ target: { name: "phone", value: selected.dialCode + e.target.value } });
  };

  return (
    <div className="flex gap-2 w-full" ref={dropRef}>
      {/* Country selector */}
      <div className="relative flex-shrink-0">
        <button
          type="button"
          aria-label="Select country code"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          style={{
            height: "100%", minHeight: 44, padding: "0 10px",
            border: `1.5px solid ${hasError ? "#ef4444" : "#e5e7eb"}`,
            borderRadius: 12, background: "#f9fafb", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6,
            fontSize: 14, fontFamily: "'Outfit',sans-serif",
            color: "#374151", whiteSpace: "nowrap", transition: "border-color 0.2s",
          }}
        >
          <span style={{ fontSize: 20 }}>{selected.flag}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{selected.dialCode}</span>
          <svg
            viewBox="0 0 12 8" fill="none"
            style={{ width: 10, height: 10, marginLeft: 2,
              transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
          >
            <path d="M1 1l5 5 5-5" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        {open && (
          <div
            role="listbox"
            aria-label="Country list"
            style={{
              position: "absolute", top: "calc(100% + 6px)", left: 0,
              width: 240, maxHeight: 260, overflowY: "auto",
              background: "#fff", border: "1.5px solid #e5e7eb",
              borderRadius: 14, zIndex: 100, boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
            }}
          >
            {/* Search */}
            <div style={{ padding: "8px 10px", borderBottom: "1px solid #f3f4f6", position: "sticky", top: 0, background: "#fff" }}>
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search country…"
                aria-label="Search country"
                style={{
                  width: "100%", padding: "7px 10px",
                  border: "1.5px solid #e5e7eb", borderRadius: 8,
                  fontSize: 13, fontFamily: "'Outfit',sans-serif",
                  outline: "none", color: "#111827",
                }}
              />
            </div>

            {filtered.map((c) => (
              <button
                key={c.code}
                type="button"
                role="option"
                aria-selected={selected.code === c.code}
                onClick={() => selectCountry(c)}
                style={{
                  width: "100%", padding: "9px 14px",
                  display: "flex", alignItems: "center", gap: 10,
                  background: selected.code === c.code ? "#f0fdf4" : "transparent",
                  border: "none", cursor: "pointer", textAlign: "left",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f0fdf4")}
                onMouseLeave={(e) => (e.currentTarget.style.background = selected.code === c.code ? "#f0fdf4" : "transparent")}
              >
                <span style={{ fontSize: 18 }}>{c.flag}</span>
                <span style={{ fontSize: 13, color: "#374151", fontWeight: 500, flex: 1 }}>{c.name}</span>
                <span style={{ fontSize: 12, color: "#9ca3af", fontWeight: 600 }}>{c.dialCode}</span>
              </button>
            ))}

            {filtered.length === 0 && (
              <div style={{ padding: 14, textAlign: "center", fontSize: 13, color: "#9ca3af" }}>
                No results
              </div>
            )}
          </div>
        )}
      </div>

      {/* Number input */}
      <input
        className={`dg-input${hasError ? " error" : ""}`}
        name="phone"
        type="tel"
        placeholder="Enter your phone number"
        value={localNumber}
        onChange={handleNumberChange}
        aria-label="Phone number"
        style={{ flex: 1 }}
      />
    </div>
  );
}
