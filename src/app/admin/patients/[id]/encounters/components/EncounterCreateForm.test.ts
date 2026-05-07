import React, { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}));

vi.mock("@/app/admin/patients/[id]/encounters/actions/create-encounter.action", () => ({
  createEncounterAction: vi.fn(),
}));

import {
  EncounterCreateForm,
  getNextEndedAtOnStartChange,
  isEncounterEndBeforeStart,
} from "@/app/admin/patients/[id]/encounters/components/EncounterCreateForm";
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

  it("renders startedAt and endedAt as required and grouped in one responsive row", () => {
    const html = renderToStaticMarkup(
      createElement(EncounterCreateForm, {
        patientId: "pat-1",
        activeEpisodeId: "epi-1",
      }),
    );

    expect(html).toContain("Inicio de la visita *");
    expect(html).toContain("Cierre de la visita *");
    expect(html).not.toContain("(opcional)");
    expect(html).toContain("name=\"startedAt\"");
    expect(html).toContain("name=\"endedAt\"");
    expect((html.match(/required=\"\"/g) ?? []).length).toBeGreaterThanOrEqual(2);
    expect(html).toContain("grid gap-4 md:grid-cols-2");
    expect(html).toContain("Registro clínico de la visita");
    expect(html).toContain("Opcional");
    expect(html).toContain("Ayuda a dejar trazabilidad clínica de la sesión y preparar futuros informes.");
    expect(html).toContain("Observación clínica");
    expect(html).toContain("Intervención y respuesta");
    expect(html).toContain("Continuidad del tratamiento");
    expect(html).toContain("Qué refiere el paciente o familia");
    expect(html).toContain("Plan para próxima sesión");
    expect(html).toContain("Métricas funcionales");
    expect(html).toContain("name=\"tugSeconds\"");
    expect(html).toContain("name=\"painNrs010\"");
    expect(html).toContain("name=\"standingToleranceMinutes\"");
  });

  it("syncs endedAt with startedAt when user has not edited endedAt", () => {
    const nextEndedAt = getNextEndedAtOnStartChange({
      nextStartedAt: "2026-04-26T10:00",
      currentEndedAt: "2026-04-26T09:00",
      hasUserEditedEndedAt: false,
    });

    expect(nextEndedAt).toBe("2026-04-26T10:00");
  });

  it("does not overwrite endedAt when user already edited it", () => {
    const nextEndedAt = getNextEndedAtOnStartChange({
      nextStartedAt: "2026-04-26T10:00",
      currentEndedAt: "2026-04-26T11:30",
      hasUserEditedEndedAt: true,
    });

    expect(nextEndedAt).toBe("2026-04-26T11:30");
  });

  it("detects invalid time range when endedAt is before startedAt", () => {
    expect(isEncounterEndBeforeStart("2026-04-26T11:00", "2026-04-26T10:30")).toBe(true);
    expect(isEncounterEndBeforeStart("2026-04-26T11:00", "2026-04-26T11:00")).toBe(false);
  });
});
