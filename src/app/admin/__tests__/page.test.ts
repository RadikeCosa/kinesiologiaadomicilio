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

function getMetricArticle(html: string, slug: string): string {
  const match = html.match(new RegExp(`<article[^>]*data-metric-card="${slug}"[\\s\\S]*?<\\/article>`));

  if (!match) {
    throw new Error(`Metric article not found for ${slug}`);
  }

  return match[0];
}

function getSectionMarkup(html: string, slug: string): string {
  const match = html.match(new RegExp(`<section[^>]*data-dashboard-section="${slug}"[\\s\\S]*?<\\/section>`));

  if (!match) {
    throw new Error(`Section markup not found for ${slug}`);
  }

  return match[0];
}

describe("/admin page", () => {
  it("renders a wide operational console with hero, decision zones, and secondary context", async () => {
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

    const html = renderToStaticMarkup(await AdminHomePage());

    expect(html).toContain("Administración clínica");
    expect(html).toContain("Consola operativa privada");
    expect(html).toContain("Acciones principales");
    expect(html).toContain("href=\"/admin/requests/new\"");
    expect(html).toContain("href=\"/admin/patients\"");
    expect(html).toContain("href=\"/admin/patients/new\"");
    expect(html).toContain("data-dashboard-section=\"prioridad-operativa\"");
    expect(html).toContain("data-dashboard-section=\"en-seguimiento\"");
    expect(html).toContain("data-dashboard-section=\"contexto-historico\"");
    expect(html).toContain("data-metric-card=\"en-tratamiento\"");
    expect(html).toContain("data-metric-card=\"preparar-inicio\"");
    expect(html).toContain("data-metric-card=\"sin-tratamiento-iniciado\"");
    expect(html).toContain("href=\"/admin/patients?status=preliminary\"");
    expect(html).toContain("href=\"/admin/patients?status=ready_to_start\"");
    expect(html).toContain("href=\"/admin/patients?status=pending\"");
    expect(html).toContain("Edad de pacientes");
    expect(html).toContain("Paciente más joven");
    expect(html).toContain("Paciente más viejo");
    expect(html).toContain("Promedio de edad");
  });

  it("keeps request-backed cards visible without attaching unsupported filter links", async () => {
    loadAdminDashboardMock.mockResolvedValueOnce({
      generatedAt: "2026-04-26T12:00:00.000Z",
      operationalSummary: {
        totalPatients: 5,
        activeTreatment: 1,
        finishedTreatment: 1,
        withoutStartedTreatment: 3,
        preliminary: 1,
        readyToStart: 2,
      },
      serviceRequestSummary: { inReview: 2, acceptedPendingTreatment: 1 },
      ageSummary: {
        youngest: 20,
        oldest: 60,
        average: 40,
        withValidBirthDate: 2,
        withoutValidBirthDate: 0,
        coverage: { numerator: 2, denominator: 2, percentage: 100 },
        note: "Calculada sobre pacientes con tratamiento iniciado o finalizado.",
      },
    });

    const html = renderToStaticMarkup(await AdminHomePage());
    const inReviewCard = getMetricArticle(html, "solicitudes-en-evaluacion");
    const acceptedPendingCard = getMetricArticle(html, "pendientes-de-iniciar-tratamiento");

    expect(html).toContain("data-metric-card=\"solicitudes-en-evaluacion\"");
    expect(html).toContain("data-metric-card=\"pendientes-de-iniciar-tratamiento\"");
    expect(inReviewCard).not.toContain("<a ");
    expect(acceptedPendingCard).not.toContain("<a ");
  });

  it("hides zero-value cards inside populated decision sections", async () => {
    loadAdminDashboardMock.mockResolvedValueOnce({
      generatedAt: "2026-04-26T12:00:00.000Z",
      operationalSummary: {
        totalPatients: 4,
        activeTreatment: 2,
        finishedTreatment: 1,
        withoutStartedTreatment: 1,
        preliminary: 0,
        readyToStart: 1,
      },
      serviceRequestSummary: { inReview: 0, acceptedPendingTreatment: 1 },
      ageSummary: {
        youngest: 20,
        oldest: 50,
        average: 35,
        withValidBirthDate: 3,
        withoutValidBirthDate: 0,
        coverage: { numerator: 3, denominator: 3, percentage: 100 },
        note: "Calculada sobre pacientes con tratamiento iniciado o finalizado.",
      },
    });

    const html = renderToStaticMarkup(await AdminHomePage());
    const prioritySection = getSectionMarkup(html, "prioridad-operativa");

    expect(prioritySection).toContain("data-metric-card=\"pendientes-de-iniciar-tratamiento\"");
    expect(prioritySection).not.toContain("data-metric-card=\"solicitudes-en-evaluacion\"");
    expect(prioritySection).not.toContain("data-metric-card=\"faltan-datos\"");
  });

  it("shows clear empty states when priority and tracking sections have no active metrics", async () => {
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

    const html = renderToStaticMarkup(await AdminHomePage());

    expect(html).toContain("No hay pendientes críticos en este momento.");
    expect(html).toContain("No hay tratamientos activos para seguir hoy.");
    expect(html).toContain("Todavía no hay contexto histórico suficiente para mostrar en esta vista.");
    expect(html).toContain(">—<");
  });
});
