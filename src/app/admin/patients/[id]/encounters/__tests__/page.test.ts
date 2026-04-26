import React, { createElement } from "react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import AdminPatientEncountersPage from "@/app/admin/patients/[id]/encounters/page";

const loadPatientEncountersPageDataMock = vi.hoisted(() => vi.fn());
const loadPatientDetailMock = vi.hoisted(() => vi.fn());
(globalThis as { React?: typeof React }).React = React;

vi.mock("next/link", () => ({
  default: ({ children, href, ...rest }: { children: ReactNode; href: string }) =>
    createElement("a", { href, ...rest }, children),
}));

vi.mock("@/app/admin/patients/[id]/encounters/data", () => ({
  loadPatientEncountersPageData: loadPatientEncountersPageDataMock,
}));

vi.mock("@/app/admin/patients/[id]/data", () => ({
  loadPatientDetail: loadPatientDetailMock,
}));

vi.mock("@/app/admin/patients/[id]/encounters/components/EncountersList", () => ({
  EncountersList: () => createElement("div", null, "EncountersList"),
}));

describe("/admin/patients/[id]/encounters page", () => {
  it("uses standardized back labels, renders primary encounter CTA once and secondary treatment navigation", async () => {
    loadPatientEncountersPageDataMock.mockResolvedValueOnce(null);

    const notFoundElement = await AdminPatientEncountersPage({
      params: Promise.resolve({ id: "missing" }),
    });
    const notFoundHtml = renderToStaticMarkup(notFoundElement);

    expect(notFoundHtml).toContain("← Volver a pacientes");
    expect(notFoundHtml).toContain("href=\"/admin/patients\"");

    loadPatientEncountersPageDataMock.mockResolvedValueOnce({
      patient: { id: "pat-1", fullName: "Ana Pérez" },
      activeEpisode: {
        id: "epi-1",
        patientId: "pat-1",
        status: "active",
        startDate: "2026-04-01",
      },
      mostRecentEpisode: null,
      encounters: [],
    });
    loadPatientDetailMock.mockResolvedValueOnce({
      id: "pat-1",
      fullName: "Ana Pérez",
      firstName: "Ana",
      lastName: "Pérez",
      dni: "30111222",
      operationalStatus: "active_treatment",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });

    const foundElement = await AdminPatientEncountersPage({
      params: Promise.resolve({ id: "pat-1" }),
    });
    const foundHtml = renderToStaticMarkup(foundElement);

    expect(foundHtml).toContain("← Volver al paciente");
    expect(foundHtml).toContain("href=\"/admin/patients/pat-1\"");
    expect(foundHtml).toContain("Ana Pérez");
    expect(foundHtml).toContain("Registro y seguimiento de visitas del paciente.");
    expect(foundHtml).toContain("DNI: 30.111.222");
    expect(foundHtml).toContain("Tratamiento activo");
    expect(foundHtml).toContain("Inicio: 01/04/2026");
    expect(foundHtml).toContain("href=\"/admin/patients/pat-1/encounters/new\"");
    expect(foundHtml).toContain("Registrar visita");
    expect(foundHtml.match(/href=\"\/admin\/patients\/pat-1\/encounters\/new\"/g)?.length).toBe(1);
    expect(foundHtml).toContain("Gestionar tratamiento");
    expect(foundHtml).toContain("href=\"/admin/patients/pat-1/treatment\"");
    expect(foundHtml).toContain("EncountersList");
  });

  it("shows a single blocking signal and treatment navigation when there is no active treatment", async () => {
    loadPatientEncountersPageDataMock.mockResolvedValueOnce({
      patient: { id: "pat-1", fullName: "Ana Pérez" },
      activeEpisode: null,
      mostRecentEpisode: null,
      encounters: [],
    });
    loadPatientDetailMock.mockResolvedValueOnce({
      id: "pat-1",
      fullName: "Ana Pérez",
      firstName: "Ana",
      lastName: "Pérez",
      dni: "30111222",
      operationalStatus: "ready_to_start",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });

    const foundElement = await AdminPatientEncountersPage({
      params: Promise.resolve({ id: "pat-1" }),
    });
    const foundHtml = renderToStaticMarkup(foundElement);

    expect(foundHtml).toContain("Sin tratamiento iniciado");
    expect(foundHtml).toContain("No hay un tratamiento iniciado para este paciente.");
    expect(foundHtml).toContain("Necesitás un tratamiento activo para registrar visitas.");
    expect(foundHtml).toContain("Ir a gestión de tratamiento");
    expect(foundHtml).toContain("href=\"/admin/patients/pat-1/treatment\"");
    expect(foundHtml).not.toContain("href=\"/admin/patients/pat-1/encounters/new\"");
    expect(foundHtml).not.toContain("Tratamiento finalizado");
    expect(foundHtml).toContain("EncountersList");
  });

  it("differentiates finished treatment state without suggesting immediate new start", async () => {
    loadPatientEncountersPageDataMock.mockResolvedValueOnce({
      patient: { id: "pat-1", fullName: "Ana Pérez" },
      activeEpisode: null,
      mostRecentEpisode: {
        id: "epi-1",
        patientId: "pat-1",
        status: "finished",
        startDate: "2026-03-01",
        endDate: "2026-03-30",
      },
      encounters: [],
    });
    loadPatientDetailMock.mockResolvedValueOnce({
      id: "pat-1",
      fullName: "Ana Pérez",
      firstName: "Ana",
      lastName: "Pérez",
      dni: "30111222",
      operationalStatus: "finished_treatment",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });

    const element = await AdminPatientEncountersPage({
      params: Promise.resolve({ id: "pat-1" }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("Tratamiento finalizado");
    expect(html).toContain("Finalización: 30/03/2026");
    expect(html).toContain("El tratamiento está finalizado. Revisá la gestión de tratamiento para continuar.");
    expect(html).toContain("href=\"/admin/patients/pat-1/treatment\"");
    expect(html).not.toContain("href=\"/admin/patients/pat-1/encounters/new\"");
    expect(html).not.toContain("Iniciá un tratamiento para habilitar el registro de visitas.");
  });
});
