import { describe, expect, it } from "vitest";

import { formatLocalDateInputValue } from "@/lib/date-input";

describe("date-input", () => {
  it("formats date input using local calendar fields", () => {
    const date = new Date(2026, 3, 24, 23, 59, 0);

    expect(formatLocalDateInputValue(date)).toBe("2026-04-24");
  });

  it("throws when date is invalid", () => {
    expect(() => formatLocalDateInputValue(new Date("invalid-date"))).toThrow(
      "date: inválida.",
    );
  });
});
