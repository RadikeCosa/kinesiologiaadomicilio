import React, { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}));

vi.mock("@/app/admin/patients/[id]/encounters/actions/create-encounter.action", () => ({
  createEncounterAction: vi.fn(),
}));

import { EncounterCreateForm } from "@/app/admin/patients/[id]/encounters/components/EncounterCreateForm";
(globalThis as { React?: typeof React }).React = React;

describe("EncounterCreateForm", () => {
  it("renders blocking state with CTA to treatment when patient has no active treatment", () => {
    const html = renderToStaticMarkup(
      createElement(EncounterCreateForm, {
        patientId: "pat-1",
        activeEpisodeId: null,
        treatmentHref: "/admin/patients/pat-1/treatment",
      }),
    );

    expect(html).toContain("No se puede registrar una visita porque el paciente no tiene tratamiento activo.");
    expect(html).toContain("Ir a gestión de tratamiento");
    expect(html).toContain("href=\"/admin/patients/pat-1/treatment\"");
  });

  it("renders startedAt and endedAt fields when active treatment exists", () => {
    const html = renderToStaticMarkup(
      createElement(EncounterCreateForm, {
        patientId: "pat-1",
        activeEpisodeId: "epi-1",
      }),
    );

    expect(html).toContain("Inicio de la visita *");
    expect(html).toContain("name=\"startedAt\"");
    expect(html).toContain("Finalización de la visita (opcional)");
    expect(html).toContain("name=\"endedAt\"");
  });
});
