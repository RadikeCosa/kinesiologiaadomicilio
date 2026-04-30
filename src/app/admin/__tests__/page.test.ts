import React, { createElement } from "react";
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import AdminHomePage from "@/app/admin/page";

const loadAdminDashboardMock = vi.hoisted(() => vi.fn());
(globalThis as { React?: typeof React }).React = React;

vi.mock("next/link", () => ({
  default: ({ children, href, ...rest }: { children: ReactNode; href: string }) =>
    createElement("a", { href, ...rest }, children),
}));

vi.mock("@/app/admin/data", () => ({
  loadAdminDashboard: loadAdminDashboardMock,
}));

describe("/admin page", () => {
  it("renders dashboard cards and main CTAs", async () => {
    loadAdminDashboardMock.mockResolvedValueOnce({
      generatedAt: "2026-04-26T12:00:00.000Z",
      operationalSummary: {
        totalPatients: 10,
        activeTreatment: 3,
        finishedTreatment: 2,
        withoutStartedTreatment: 5,
        preliminary: 2,
        readyToStart: 3,
      },
      serviceRequestSummary: { inReview: 4, acceptedPendingTreatment: 2 },
      ageSummary: {
        youngest: 18,
        oldest: 87,
        average: 46,
        withValidBirthDate: 8,
        withoutValidBirthDate: 2,
        coverage: {
          numerator: 8,
          denominator: 10,
          percentage: 80,
        },
        note: "La edad se calcula sobre pacientes con tratamiento activo y fecha de nacimiento válida.",
      },
    });

    const element = await AdminHomePage();
    const html = renderToStaticMarkup(element);

    expect(html).toContain("Panel operativo");
    expect(html).toContain("Resumen operativo");
    expect(html).toContain("Edad de pacientes en tratamiento");
    expect(html).toContain("Pacientes totales");
    expect(html).toContain("Sin tratamiento iniciado");
    expect(html).toContain("Solicitudes en evaluación");
    expect(html).toContain("Aceptadas pendientes de tratamiento");
    expect(html).toContain("Con fecha válida");
    expect(html).toContain("Sin fecha válida");
    expect(html).toContain("8/10 (80%)");
    expect(html).toContain("La edad se calcula sobre pacientes con tratamiento activo y fecha de nacimiento válida.");
    expect(html).toContain("href=\"/admin/patients\"");
    expect(html).toContain("href=\"/admin/patients/new\"");
  });

  it("renders age summary coverage from mixed valid, invalid and missing birthDate inputs", async () => {
    loadAdminDashboardMock.mockResolvedValueOnce({
      generatedAt: "2026-04-26T12:00:00.000Z",
      operationalSummary: {
        totalPatients: 3,
        activeTreatment: 1,
        finishedTreatment: 0,
        withoutStartedTreatment: 2,
        preliminary: 1,
        readyToStart: 1,
      },
      serviceRequestSummary: { inReview: 1, acceptedPendingTreatment: 0 },
      ageSummary: {
        youngest: 36,
        oldest: 36,
        average: 36,
        withValidBirthDate: 1,
        withoutValidBirthDate: 2,
        coverage: {
          numerator: 1,
          denominator: 3,
          percentage: 33,
        },
        note: "La edad se calcula sobre pacientes con tratamiento activo y fecha de nacimiento válida.",
      },
    });

    const element = await AdminHomePage();
    const html = renderToStaticMarkup(element);

    expect(html).toContain("Menor edad");
    expect(html).toContain("Mayor edad");
    expect(html).toContain("Edad promedio");
    expect(html).toContain(">36<");
    expect(html).toContain("Con fecha válida");
    expect(html).toContain("Sin fecha válida");
    expect(html).toContain("1/3 (33%)");
  });

  it("renders fallback for coverage when percentage is null", async () => {
    loadAdminDashboardMock.mockResolvedValueOnce({
      generatedAt: "2026-04-26T12:00:00.000Z",
      operationalSummary: {
        totalPatients: 0,
        activeTreatment: 0,
        finishedTreatment: 0,
        withoutStartedTreatment: 0,
        preliminary: 0,
        readyToStart: 0,
      },
      serviceRequestSummary: { inReview: 0, acceptedPendingTreatment: 0 },
      ageSummary: {
        youngest: null,
        oldest: null,
        average: null,
        withValidBirthDate: 0,
        withoutValidBirthDate: 0,
        coverage: {
          numerator: 0,
          denominator: 0,
          percentage: null,
        },
        note: "La edad se calcula sobre pacientes con tratamiento activo y fecha de nacimiento válida.",
      },
    });

    const element = await AdminHomePage();
    const html = renderToStaticMarkup(element);

    expect(html).toContain("Menor edad");
    expect(html).toContain("Mayor edad");
    expect(html).toContain("Edad promedio");
    expect(html).toContain("Cobertura fecha de nacimiento");
    expect(html).toContain(">—<");
    expect(html).not.toContain("0/0 (0%)");
  });
});
