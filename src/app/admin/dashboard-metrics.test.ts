import { describe, expect, it } from "vitest";

import {
  buildAdminDashboardSections,
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

  it("builds age summary using only patients with active or finished treatment and valid birthDate", () => {
    const summary = buildPatientAgeSummary([
      { operationalStatus: "active_treatment", birthDate: "2000-01-01" },
      { operationalStatus: "active_treatment", birthDate: "1990-01-01" },
      { operationalStatus: "active_treatment", birthDate: "invalid-date" },
      { operationalStatus: "finished_treatment", birthDate: "1980-01-01" },
      { operationalStatus: "ready_to_start", birthDate: "1970-01-01" },
    ], new Date("2026-04-26T12:00:00.000Z"));

    expect(summary.youngest).toBe(26);
    expect(summary.oldest).toBe(46);
    expect(summary.average).toBe(36);
    expect(summary.withValidBirthDate).toBe(3);
    expect(summary.withoutValidBirthDate).toBe(1);
    expect(summary.coverage).toEqual({ numerator: 3, denominator: 4, percentage: 75 });
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

  it("returns null age metrics when there are no patients with active or finished treatment", () => {
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

  it("builds dashboard sections for action, tracking, and context", () => {
    const sections = buildAdminDashboardSections({
      generatedAt: "2026-04-26T12:00:00.000Z",
      operationalSummary: {
        totalPatients: 10,
        activeTreatment: 3,
        finishedTreatment: 2,
        withoutStartedTreatment: 5,
        preliminary: 2,
        readyToStart: 3,
      },
      serviceRequestSummary: {
        inReview: 4,
        acceptedPendingTreatment: 1,
      },
      ageSummary: {
        youngest: 18,
        oldest: 87,
        average: 46,
        withValidBirthDate: 8,
        withoutValidBirthDate: 2,
        coverage: { numerator: 8, denominator: 10, percentage: 80 },
        note: "Calculada sobre pacientes con tratamiento iniciado o finalizado.",
      },
    });

    expect(sections).toEqual([
      {
        title: "Requiere acción",
        description: "Pendientes que destraban la operación o requieren decisión.",
        emptyMessage: "No hay pendientes críticos en este momento.",
        metrics: [
          { label: "Solicitudes en evaluación", value: 4, tone: "sky" },
          { label: "Aceptadas pendientes de iniciar tratamiento", value: 1, tone: "indigo" },
          {
            label: "Datos operativos incompletos",
            value: 2,
            tone: "amber",
            helper: "Falta completar información mínima para avanzar con el inicio.",
          },
        ],
      },
      {
        title: "En seguimiento",
        description: "Casos en curso que conviene monitorear.",
        emptyMessage: "No hay tratamientos activos para seguir hoy.",
        metrics: [
          { label: "Pacientes en tratamiento", value: 3, tone: "emerald" },
          {
            label: "Listos para iniciar tratamiento",
            value: 3,
            tone: "slate",
            helper: "Pacientes sin tratamiento activo con base operativa suficiente.",
          },
        ],
      },
      {
        title: "Contexto / histórico",
        description: "Indicadores generales para lectura global.",
        metrics: [
          { label: "Pacientes totales", value: 10, tone: "slate" },
          { label: "Tratamientos finalizados", value: 2, tone: "slate" },
        ],
      },
    ]);
  });
});
