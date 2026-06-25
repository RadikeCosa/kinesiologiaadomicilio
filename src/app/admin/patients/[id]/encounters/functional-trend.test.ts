import { describe, expect, it } from "vitest";
import {
  buildFunctionalTrendSummary,
  formatFunctionalDelta,
  formatFunctionalValue,
} from "@/app/admin/patients/[id]/encounters/functional-trend";

const base = { id: "e1", patientId: "p1", episodeOfCareId: "ep1", status: "finished" as const, startedAt: "2026-01-01T10:00:00Z" };

describe("functional trend summary", () => {
  it("returns empty without observations", () => {
    expect(buildFunctionalTrendSummary([{ ...base }])).toEqual([]);
  });

  it("returns latest only for single measurement", () => {
    const res = buildFunctionalTrendSummary([{ ...base, functionalObservations: [{ id: "o1", patientId: "p1", encounterId: "e1", effectiveDateTime: "2026-01-01T10:00:00Z", code: "tug_seconds", value: 4.3, unit: "s", status: "final" }] } as never]);
    expect(res[0].latestValue).toBe(4.3);
    expect(res[0].previousValue).toBeUndefined();
    expect(res[0].delta).toBeUndefined();
  });

  it("uses two most recent measurements and canonical order", () => {
    const res = buildFunctionalTrendSummary([
      { ...base, functionalObservations: [{ id: "o1", patientId: "p1", encounterId: "e1", effectiveDateTime: "2026-01-01T10:00:00Z", code: "pain_nrs_0_10", value: 6, unit: "/10", status: "final" }] } as never,
      { ...base, id: "e2", startedAt: "2026-01-02T10:00:00Z", functionalObservations: [
        { id: "o2", patientId: "p1", encounterId: "e2", effectiveDateTime: "2026-01-03T10:00:00Z", code: "pain_nrs_0_10", value: 8, unit: "/10", status: "final" },
        { id: "o3", patientId: "p1", encounterId: "e2", effectiveDateTime: "2026-01-03T10:00:00Z", code: "tug_seconds", value: 5, unit: "s", status: "final" },
      ] } as never,
    ]);
    expect(res[0].code).toBe("tug_seconds");
    expect(res[1].code).toBe("pain_nrs_0_10");
    expect(res[1].latestValue).toBe(8);
    expect(res[1].previousValue).toBe(6);
    expect(res[1].delta).toBe(2);
  });

  it("formats delta with signs", () => {
    expect(formatFunctionalDelta("standing_tolerance_minutes", 2)).toBe("+2 min");
    expect(formatFunctionalDelta("tug_seconds", -1.3333)).toBe("-1.3 s");
    expect(formatFunctionalDelta("pain_nrs_0_10", 2)).toBe("+2");
    expect(formatFunctionalDelta("gait_duration_minutes", 2.4)).toBe("+2 min");
  });

  it("formats values by metric display rules", () => {
    expect(formatFunctionalValue("tug_seconds", 18.555)).toBe("18.6 s");
    expect(formatFunctionalValue("standing_tolerance_minutes", 6.0)).toBe("6 min");
    expect(formatFunctionalValue("standing_tolerance_minutes", 6.25)).toBe("6.3 min");
    expect(formatFunctionalValue("pain_nrs_0_10", 4.4)).toBe("4/10");
    expect(formatFunctionalValue("gait_duration_minutes", 5.6)).toBe("6 min");
  });
});
