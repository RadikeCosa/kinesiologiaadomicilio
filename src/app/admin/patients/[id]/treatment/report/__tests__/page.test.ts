import React, { createElement } from "react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

const mocks = vi.hoisted(() => ({
  loadPatientDetail: vi.fn(),
  loadTreatmentReportContext: vi.fn(),
  composeTreatmentReport: vi.fn(),
}));

vi.mock("next/link", () => ({
  default: ({ children, href, ...rest }: { children: ReactNode; href: string }) =>
    createElement("a", { href, ...rest }, children),
}));

vi.mock("@/app/admin/patients/[id]/data", () => ({
  loadPatientDetail: mocks.loadPatientDetail,
}));

vi.mock("@/features/treatment-report/treatment-report.read-model", () => ({
  loadTreatmentReportContext: mocks.loadTreatmentReportContext,
}));

vi.mock("@/features/treatment-report/treatment-report.composer", () => ({
  composeTreatmentReport: mocks.composeTreatmentReport,
}));

import AdminPatientTreatmentReportPage from "@/app/admin/patients/[id]/treatment/report/page";

(globalThis as { React?: typeof React }).React = React;

describe("/admin/patients/[id]/treatment/report page", () => {
  it("renders the report route with source data and editable text area", async () => {
    mocks.loadPatientDetail.mockResolvedValue({
      id: "pat-1",
      fullName: "Ana Perez",
    });
    mocks.loadTreatmentReportContext.mockResolvedValue({
      ok: true,
      context: {
        mode: "progress",
        patient: {
          id: "pat-1",
          displayName: "Ana Perez",
        },
        episode: {
          id: "epi-1",
          status: "active",
          startDate: "2026-05-01",
        },
        clinicalContext: {
          medicalReferenceDiagnosisText: "Lumbalgia",
          kinesiologicDiagnosisText: "Dolor lumbar mecanico",
          initialFunctionalStatus: "Dolor al caminar.",
          therapeuticGoals: "Mejorar tolerancia.",
          frameworkPlan: "Trabajo progresivo.",
          hasAnyContent: true,
        },
        encounters: [],
        encounterSummary: {
          count: 2,
          firstVisitStartedAt: "2026-05-10T10:00:00.000Z",
          lastVisitStartedAt: "2026-05-17T10:00:00.000Z",
          averageDurationMinutes: 60,
          totalDurationMinutes: 120,
          averageDaysBetweenVisits: 7,
        },
        functionalTrend: [],
        signingProfessional: {
          status: "ready",
          fullName: "Lic. Ramiro Gomez",
          roleTitle: "Kinesiologo",
          licenseNumber: "12345",
          signatureDisplay: "Lic. Ramiro Gomez",
        },
      },
    });
    mocks.composeTreatmentReport.mockReturnValue({
      initialText: "Texto derivado",
      warnings: ["No hay metricas funcionales registradas para resumir cambios observables."],
      includedSections: ["header", "continuity", "professional_summary"],
      omittedSections: ["functional_metrics"],
      completeness: {
        status: "usable_with_warnings",
        missing: ["functional_metrics"],
        warnings: ["No hay metricas funcionales registradas para resumir cambios observables."],
      },
    });

    const element = await AdminPatientTreatmentReportPage({
      params: Promise.resolve({ id: "pat-1" }),
      searchParams: Promise.resolve({ mode: "progress", episodeId: "epi-1" }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("Informe derivado de progreso del episodio activo.");
    expect(html).toContain("Datos fuente del episodio");
    expect(html).toContain("Texto final editable");
    expect(html).toContain("Regenerar desde datos");
    expect(html).toContain("Copiar");
    expect(html).toContain("Datos a revisar");
  });

  it("shows a safe error when mode or episode id is missing", async () => {
    mocks.loadPatientDetail.mockResolvedValue({
      id: "pat-1",
      fullName: "Ana Perez",
    });

    const element = await AdminPatientTreatmentReportPage({
      params: Promise.resolve({ id: "pat-1" }),
      searchParams: Promise.resolve({}),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("No se indico el tipo de informe que queres preparar.");
    expect(html).toContain('href="/admin/patients/pat-1/treatment"');
  });
});
