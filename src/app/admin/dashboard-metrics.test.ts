import { describe, expect, it } from "vitest";

import {
  buildAdminDashboardReadModel,
  buildOperationalSummary,
  buildPatientAgeSummary,
  buildServiceRequestSummary,
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

  it("builds age summary using only active_treatment patients with valid birthDate", () => {
    const summary = buildPatientAgeSummary([
      { operationalStatus: "active_treatment", birthDate: "2000-01-01" },
      { operationalStatus: "active_treatment", birthDate: "1990-01-01" },
      { operationalStatus: "active_treatment", birthDate: "invalid-date" },
      { operationalStatus: "ready_to_start", birthDate: "1980-01-01" },
    ], new Date("2026-04-26T12:00:00.000Z"));

    expect(summary.youngest).toBe(26);
    expect(summary.oldest).toBe(36);
    expect(summary.average).toBe(31);
    expect(summary.withValidBirthDate).toBe(2);
    expect(summary.withoutValidBirthDate).toBe(1);
    expect(summary.coverage).toEqual({ numerator: 2, denominator: 3, percentage: 67 });
  });

  it("builds service request summary from in_review and accepted-not-used rules", () => {
    const summary = buildServiceRequestSummary([
      { id: "sr-1", status: "in_review" },
      { id: "sr-2", status: "accepted" },
      { id: "sr-3", status: "accepted" },
      { id: "sr-4", status: "closed_without_treatment" },
      { id: "sr-5", status: "cancelled" },
    ], new Set(["sr-3"]));

    expect(summary).toEqual({
      inReview: 1,
      acceptedPendingTreatment: 1,
    });
  });

  it("returns null age metrics when there are no active_treatment patients", () => {
    const summary = buildPatientAgeSummary([
      { operationalStatus: "preliminary", birthDate: "2000-01-01" },
      { operationalStatus: "ready_to_start", birthDate: "1990-01-01" },
    ], new Date("2026-04-26T12:00:00.000Z"));

    expect(summary.youngest).toBeNull();
    expect(summary.coverage).toEqual({ numerator: 0, denominator: 0, percentage: null });
  });

  it("builds read model with operational/age/service-request summaries", () => {
    const dashboard = buildAdminDashboardReadModel(
      [{ operationalStatus: "active_treatment", birthDate: "1990-01-01" }],
      { inReview: 3, acceptedPendingTreatment: 2 },
      new Date("2026-04-26T12:00:00.000Z"),
    );

    expect(dashboard.generatedAt).toBe("2026-04-26T12:00:00.000Z");
    expect(dashboard.operationalSummary.totalPatients).toBe(1);
    expect(dashboard.ageSummary.withValidBirthDate).toBe(1);
    expect(dashboard.serviceRequestSummary).toEqual({ inReview: 3, acceptedPendingTreatment: 2 });
  });
});
