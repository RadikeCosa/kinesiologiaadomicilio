import React, { createElement } from "react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import AdminPatientTreatmentPage from "@/app/admin/patients/[id]/treatment/page";

const loadPatientDetailMock = vi.hoisted(() => vi.fn());
(globalThis as { React?: typeof React }).React = React;

vi.mock("next/link", () => ({
  default: ({ children, href, ...rest }: { children: ReactNode; href: string }) =>
    createElement("a", { href, ...rest }, children),
}));

vi.mock("@/app/admin/patients/[id]/data", () => ({
  loadPatientDetail: loadPatientDetailMock,
}));

vi.mock("@/app/admin/patients/[id]/components/StartEpisodeOfCareForm", () => ({
  StartEpisodeOfCareForm: () => createElement("div", null, "StartEpisodeOfCareForm"),
}));

vi.mock("@/app/admin/patients/[id]/components/FinishEpisodeOfCareForm", () => ({
  FinishEpisodeOfCareForm: () => createElement("div", null, "FinishEpisodeOfCareForm"),
}));

describe("/admin/patients/[id]/treatment page", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders consistent back links and compact patient metadata", async () => {
    loadPatientDetailMock.mockResolvedValueOnce(null);

    const notFoundElement = await AdminPatientTreatmentPage({
      params: Promise.resolve({ id: "missing" }),
    });
    const notFoundHtml = renderToStaticMarkup(notFoundElement);

    expect(notFoundHtml).toContain("← Volver a pacientes");
    expect(notFoundHtml).toContain("href=\"/admin/patients\"");

    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-24T12:00:00Z"));

    loadPatientDetailMock.mockResolvedValueOnce({
      id: "pat-1",
      firstName: "Ana",
      lastName: "Pérez",
      fullName: "Ana Pérez",
      dni: "30111222",
      birthDate: "1958-04-24",
      operationalStatus: "active_treatment",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
      activeEpisode: null,
      latestEpisode: null,
    });

    const foundElement = await AdminPatientTreatmentPage({
      params: Promise.resolve({ id: "pat-1" }),
    });
    const foundHtml = renderToStaticMarkup(foundElement);

    expect(foundHtml).toContain("← Volver al paciente");
    expect(foundHtml).toContain("href=\"/admin/patients/pat-1\"");
    expect(foundHtml).toContain("Ver visitas");
    expect(foundHtml).toContain("href=\"/admin/patients/pat-1/encounters\"");
    expect(foundHtml).toContain("Ana Pérez");
    expect(foundHtml).toContain("Inicio y cierre del tratamiento del paciente.");
    expect(foundHtml).toContain("DNI: 30.111.222");
    expect(foundHtml).toContain("Edad: 68 años");
    expect(foundHtml).toContain("En tratamiento");
  });

  it("does not render age when birthDate is invalid", async () => {
    loadPatientDetailMock.mockResolvedValueOnce({
      id: "pat-1",
      firstName: "Ana",
      lastName: "Pérez",
      fullName: "Ana Pérez",
      dni: "30111222",
      birthDate: "invalid-date",
      operationalStatus: "ready_to_start",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
      activeEpisode: null,
      latestEpisode: null,
    });

    const element = await AdminPatientTreatmentPage({
      params: Promise.resolve({ id: "pat-1" }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("DNI: 30.111.222");
    expect(html).not.toContain("Edad:");
  });

  it("shows start treatment as main action when there is no treatment started", async () => {
    loadPatientDetailMock.mockResolvedValueOnce({
      id: "pat-1",
      firstName: "Ana",
      lastName: "Pérez",
      fullName: "Ana Pérez",
      dni: "30111222",
      birthDate: "1958-04-24",
      operationalStatus: "ready_to_start",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
      activeEpisode: null,
      latestEpisode: null,
    });

    const element = await AdminPatientTreatmentPage({
      params: Promise.resolve({ id: "pat-1" }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("Sin tratamiento activo");
    expect(html).toContain("Iniciá un tratamiento para habilitar el registro de visitas.");
    expect(html).toContain("StartEpisodeOfCareForm");
    expect(html).not.toContain("FinishEpisodeOfCareForm");
    expect(html).toContain("href=\"/admin/patients/pat-1/encounters\"");
  });

  it("shows finish treatment as main action when treatment is active", async () => {
    loadPatientDetailMock.mockResolvedValueOnce({
      id: "pat-1",
      firstName: "Ana",
      lastName: "Pérez",
      fullName: "Ana Pérez",
      dni: "30111222",
      birthDate: "1958-04-24",
      operationalStatus: "active_treatment",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
      activeEpisode: {
        id: "epi-1",
        patientId: "pat-1",
        status: "active",
        startDate: "2026-04-01",
      },
      latestEpisode: {
        id: "epi-1",
        patientId: "pat-1",
        status: "active",
        startDate: "2026-04-01",
      },
    });

    const element = await AdminPatientTreatmentPage({
      params: Promise.resolve({ id: "pat-1" }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("Tratamiento activo");
    expect(html).toContain("FinishEpisodeOfCareForm");
    expect(html).not.toContain("Sin tratamiento activo");
    expect(html).toContain("href=\"/admin/patients/pat-1/encounters\"");
  });

  it("shows explicit finished state and keeps start flow secondary", async () => {
    loadPatientDetailMock.mockResolvedValueOnce({
      id: "pat-1",
      firstName: "Ana",
      lastName: "Pérez",
      fullName: "Ana Pérez",
      dni: "30111222",
      birthDate: "1958-04-24",
      operationalStatus: "finished_treatment",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
      activeEpisode: null,
      latestEpisode: {
        id: "epi-1",
        patientId: "pat-1",
        status: "finished",
        startDate: "2026-03-01",
        endDate: "2026-03-30",
      },
    });

    const element = await AdminPatientTreatmentPage({
      params: Promise.resolve({ id: "pat-1" }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("Tratamiento finalizado");
    expect(html).toContain("Finalización: 30/03/2026");
    expect(html).toContain("Este tratamiento ya está cerrado.");
    expect(html).toContain("StartEpisodeOfCareForm");
    expect(html).toContain("href=\"/admin/patients/pat-1/encounters\"");
    expect(html).not.toContain("Sin tratamiento activo");
  });
});
