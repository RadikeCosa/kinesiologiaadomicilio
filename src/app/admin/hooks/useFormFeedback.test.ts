import { describe, expect, it, vi } from "vitest";

import { getFeedbackAutoDismissMs } from "@/app/admin/hooks/useFormFeedback";

describe("useFormFeedback helpers", () => {
  it("returns 2500ms for success messages", () => {
    expect(getFeedbackAutoDismissMs({ text: "ok", tone: "success" })).toBe(2500);
  });

  it("keeps blocking errors visible", () => {
    expect(getFeedbackAutoDismissMs({ text: "error", tone: "error" })).toBeNull();
  });

  it("allows auto-dismiss for non-blocking errors", () => {
    expect(getFeedbackAutoDismissMs({ text: "warning", tone: "error", dismissibleError: true })).toBe(5000);
  });

  it("supports fake timers for success feedback lifecycle", () => {
    vi.useFakeTimers();
    const dismissSpy = vi.fn();

    const timeoutMs = getFeedbackAutoDismissMs({ text: "ok", tone: "success" });
    expect(timeoutMs).toBe(2500);

    if (timeoutMs) {
      setTimeout(dismissSpy, timeoutMs);
      vi.advanceTimersByTime(2499);
      expect(dismissSpy).not.toHaveBeenCalled();
      vi.advanceTimersByTime(1);
      expect(dismissSpy).toHaveBeenCalledTimes(1);
    }

    vi.useRealTimers();
  });
});
