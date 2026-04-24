import { describe, expect, it } from "vitest";

import { formatLocalDateInputValue, formatLocalDateTimeInputValue } from "@/lib/date-input";

describe("date-input", () => {
  it("formats date input using local calendar fields", () => {
    const date = new Date(2026, 3, 24, 23, 59, 0);

    expect(formatLocalDateInputValue(date)).toBe("2026-04-24");
  });

  it("formats date-time input with local calendar and clock fields", () => {
    const date = new Date(2026, 3, 24, 8, 5, 0);

    expect(formatLocalDateTimeInputValue(date)).toBe("2026-04-24T08:05");
  });

  it("returns empty string for invalid date-time values", () => {
    expect(formatLocalDateTimeInputValue("invalid-date")).toBe("");
  });

  it("throws when date is invalid", () => {
    expect(() => formatLocalDateInputValue(new Date("invalid-date"))).toThrow(
      "date: inválida.",
    );
  });
});
