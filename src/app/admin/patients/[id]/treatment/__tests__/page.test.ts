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
    expect(foundHtml).not.toContain("← Volver a visitas");
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
});
