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
  it("renders simplified age metrics and main CTAs", async () => {
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
        coverage: { numerator: 8, denominator: 10, percentage: 80 },
        note: "Calculada sobre pacientes con tratamiento iniciado o finalizado.",
      },
    });

    const element = await AdminHomePage();
    const html = renderToStaticMarkup(element);

    expect(html).toContain("Edad de pacientes");
    expect(html).toContain("Paciente más joven");
    expect(html).toContain("Paciente más viejo");
    expect(html).toContain("Promedio de edad");
    expect(html).toContain("Calculada sobre pacientes con tratamiento iniciado o finalizado.");
    expect(html).not.toContain("Cobertura fecha de nacimiento");
    expect(html).not.toContain("Con fecha válida");
    expect(html).not.toContain("Sin fecha válida");
    expect(html).toContain("href=\"/admin/patients\"");
    expect(html).toContain("href=\"/admin/patients/new\"");
  });

  it("renders fallback for age metrics when there are no calculable ages", async () => {
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
        coverage: { numerator: 0, denominator: 0, percentage: null },
        note: "Calculada sobre pacientes con tratamiento iniciado o finalizado.",
      },
    });

    const element = await AdminHomePage();
    const html = renderToStaticMarkup(element);

    expect(html).toContain("Paciente más joven");
    expect(html).toContain("Paciente más viejo");
    expect(html).toContain("Promedio de edad");
    expect(html).toContain(">—<");
  });
});
