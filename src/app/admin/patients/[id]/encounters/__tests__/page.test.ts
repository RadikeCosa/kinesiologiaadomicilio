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

vi.mock("@/app/admin/patients/[id]/encounters/components/EncounterCreateForm", () => ({
  EncounterCreateForm: () => createElement("div", null, "EncounterCreateForm"),
}));

vi.mock("@/app/admin/patients/[id]/encounters/components/EncountersList", () => ({
  EncountersList: () => createElement("div", null, "EncountersList"),
}));

describe("/admin/patients/[id]/encounters page", () => {
  it("uses standardized back labels and renders compact patient metadata", async () => {
    loadPatientEncountersPageDataMock.mockResolvedValueOnce(null);

    const notFoundElement = await AdminPatientEncountersPage({
      params: Promise.resolve({ id: "missing" }),
    });
    const notFoundHtml = renderToStaticMarkup(notFoundElement);

    expect(notFoundHtml).toContain("← Volver a pacientes");
    expect(notFoundHtml).toContain("href=\"/admin/patients\"");

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
      operationalStatus: "finished_treatment",
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
    expect(foundHtml).toContain("Tratamiento finalizado");
    expect(foundHtml).not.toContain("Edad:");
  });
});
