import { describe, expect, it } from "vitest";

import {
  buildAdminDashboardReadModel,
  buildOperationalSummary,
  buildPatientAgeSummary,
} from "@/app/admin/dashboard-metrics";

describe("dashboard-metrics", () => {
  it("builds operational summary and keeps withoutStartedTreatment as preliminary + ready_to_start", () => {
    const summary = buildOperationalSummary([
      { operationalStatus: "active_treatment" },
      { operationalStatus: "finished_treatment" },
      { operationalStatus: "preliminary" },
      { operationalStatus: "ready_to_start" },
      { operationalStatus: "ready_to_start" },
    ]);

    expect(summary).toEqual({
      totalPatients: 5,
      activeTreatment: 1,
      finishedTreatment: 1,
      withoutStartedTreatment: 3,
      preliminary: 1,
      readyToStart: 2,
    });
  });

  it("builds age summary using only valid birthDate values", () => {
    const summary = buildPatientAgeSummary([
      { operationalStatus: "ready_to_start", birthDate: "2000-01-01" },
      { operationalStatus: "ready_to_start", birthDate: "1990-01-01" },
      { operationalStatus: "preliminary" },
      { operationalStatus: "preliminary", birthDate: "invalid-date" },
    ], new Date("2026-04-26T12:00:00.000Z"));

    expect(summary.youngest).toBe(26);
    expect(summary.oldest).toBe(36);
    expect(summary.average).toBe(31);
    expect(summary.withValidBirthDate).toBe(2);
    expect(summary.withoutValidBirthDate).toBe(2);
    expect(summary.coverage).toEqual({
      numerator: 2,
      denominator: 4,
      percentage: 50,
    });
    expect(summary.note).toContain("fecha de nacimiento válida");
  });

  it("returns null age metrics when there are no valid birthDate values", () => {
    const summary = buildPatientAgeSummary([
      { operationalStatus: "preliminary" },
      { operationalStatus: "ready_to_start", birthDate: "invalid-date" },
    ], new Date("2026-04-26T12:00:00.000Z"));

    expect(summary.youngest).toBeNull();
    expect(summary.oldest).toBeNull();
    expect(summary.average).toBeNull();
    expect(summary.withValidBirthDate).toBe(0);
    expect(summary.withoutValidBirthDate).toBe(2);
    expect(summary.coverage).toEqual({
      numerator: 0,
      denominator: 2,
      percentage: 0,
    });
  });

  it("returns null coverage percentage when there are no patients", () => {
    const summary = buildPatientAgeSummary([], new Date("2026-04-26T12:00:00.000Z"));

    expect(summary.coverage).toEqual({
      numerator: 0,
      denominator: 0,
      percentage: null,
    });
  });

  it("builds read model with generatedAt from reference date", () => {
    const dashboard = buildAdminDashboardReadModel([
      { operationalStatus: "active_treatment", birthDate: "1990-01-01" },
    ], new Date("2026-04-26T12:00:00.000Z"));

    expect(dashboard.generatedAt).toBe("2026-04-26T12:00:00.000Z");
    expect(dashboard.operationalSummary.totalPatients).toBe(1);
    expect(dashboard.ageSummary.withValidBirthDate).toBe(1);
  });
});
