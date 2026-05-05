import React, { createElement } from "react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import AdminPatientEncounterCreatePage from "@/app/admin/patients/[id]/encounters/new/page";

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
  EncounterCreateForm: ({ activeEpisodeId, successRedirectPath, treatmentHref }: {
    activeEpisodeId: string | null;
    successRedirectPath?: string;
    treatmentHref?: string;
  }) => createElement(
    "div",
    {
      "data-active-episode": activeEpisodeId ?? "",
      "data-success-redirect": successRedirectPath ?? "",
      "data-treatment-href": treatmentHref ?? "",
    },
    "EncounterCreateForm",
  ),
}));

describe("/admin/patients/[id]/encounters/new page", () => {
  it("renders not-found state with standardized back label", async () => {
    loadPatientEncountersPageDataMock.mockResolvedValueOnce(null);

    const element = await AdminPatientEncounterCreatePage({
      params: Promise.resolve({ id: "missing" }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("← Volver a pacientes");
    expect(html).toContain("No se encontró el paciente solicitado.");
  });

  it("renders create form and back navigation to encounters", async () => {
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
      birthDate: "1990-04-24",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });

    const element = await AdminPatientEncounterCreatePage({
      params: Promise.resolve({ id: "pat-1" }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("← Volver a gestión clínica");
    expect(html).toContain("href=\"/admin/patients/pat-1/encounters\"");
    expect(html).toContain("Cargá el inicio y cierre de la visita realizada.");
    expect(html).toContain("EncounterCreateForm");
    expect(html).toContain("data-active-episode=\"epi-1\"");
    expect(html).toContain("data-success-redirect=\"/admin/patients/pat-1/encounters?status=encounter-created\"");
    expect(html).toContain("data-treatment-href=\"/admin/patients/pat-1/treatment\"");
  });

  it("keeps create form mounted without active treatment to preserve blocking state", async () => {
    loadPatientEncountersPageDataMock.mockResolvedValueOnce({
      patient: { id: "pat-1", fullName: "Ana Pérez" },
      activeEpisode: null,
      mostRecentEpisode: {
        id: "epi-9",
        patientId: "pat-1",
        status: "finished",
        startDate: "2026-04-01",
        endDate: "2026-04-10",
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

    const element = await AdminPatientEncounterCreatePage({
      params: Promise.resolve({ id: "pat-1" }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("EncounterCreateForm");
    expect(html).toContain("data-active-episode=\"\"");
    expect(html).toContain("data-treatment-href=\"/admin/patients/pat-1/treatment\"");
  });
});
