import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock("@/app/admin/patients/[id]/encounters/actions/update-encounter-period.action", () => ({
  updateEncounterPeriodAction: vi.fn(),
}));

import { EncountersList } from "@/app/admin/patients/[id]/encounters/components/EncountersList";

describe("EncountersList", () => {
  it("renders temporal metadata first and shows duration only with valid start/end", () => {
    const html = renderToStaticMarkup(
      createElement(EncountersList, {
        patientId: "pat-1",
        hasActiveTreatment: true,
        hasFinishedTreatment: false,
        encounters: [
          {
            id: "enc-1",
            patientId: "pat-1",
            episodeOfCareId: "ep-1",
            status: "finished",
            startedAt: "2026-04-17T10:30:00Z",
            endedAt: "2026-04-17T11:00:00Z",
            clinicalNote: {
              subjective: "Refiere menor dolor",
            },
          },
          {
            id: "enc-2",
            patientId: "pat-1",
            episodeOfCareId: "ep-1",
            status: "finished",
            startedAt: "2026-04-16T10:30:00Z",
          },
          {
            id: "enc-3",
            patientId: "pat-1",
            episodeOfCareId: "ep-1",
            status: "finished",
            startedAt: "2026-04-15T10:30:00Z",
            endedAt: "2026-04-15T10:30:00Z",
          },
        ],
      }),
    );

    expect(html).toContain("Fecha: 17/04/2026");
    expect(html).toContain("16/04/2026");
    expect(html).toMatch(/\d{2}:\d{2}/);
    expect((html.match(/Cierre:/g) ?? []).length).toBe(2);
    expect((html.match(/Duración:/g) ?? []).length).toBe(1);
    expect(html).toContain("Estado: Registrada");
    expect(html).toContain("Registro clínico");
    expect(html).toContain("Refiere menor dolor");
    expect(html).toContain("aria-label=\"Editar horario\"");
    expect(html).not.toContain("Estado: finished");
    expect(html).not.toContain("AM");
    expect(html).not.toContain("PM");
  });

  it("does not render clinical block when encounter has no clinical note", () => {
    const html = renderToStaticMarkup(
      createElement(EncountersList, {
        patientId: "pat-1",
        hasActiveTreatment: true,
        hasFinishedTreatment: false,
        encounters: [
          {
            id: "enc-1",
            patientId: "pat-1",
            episodeOfCareId: "ep-1",
            status: "finished",
            startedAt: "2026-04-17T10:30:00Z",
            endedAt: "2026-04-17T11:00:00Z",
          },
        ],
      }),
    );

    expect(html).not.toContain("Registro clínico");
  });

  it("renders updated empty-state copy for active, finished and no-treatment contexts", () => {
    const activeHtml = renderToStaticMarkup(
      createElement(EncountersList, {
        patientId: "pat-1",
        hasActiveTreatment: true,
        hasFinishedTreatment: false,
        encounters: [],
      }),
    );
    expect(activeHtml).toContain("Todavía no hay visitas registradas para este tratamiento.");

    const finishedHtml = renderToStaticMarkup(
      createElement(EncountersList, {
        patientId: "pat-1",
        hasActiveTreatment: false,
        hasFinishedTreatment: true,
        encounters: [],
      }),
    );
    expect(finishedHtml).toContain("Tratamiento finalizado. Las visitas quedan disponibles como historial.");

    const noTreatmentHtml = renderToStaticMarkup(
      createElement(EncountersList, {
        patientId: "pat-1",
        hasActiveTreatment: false,
        hasFinishedTreatment: false,
        encounters: [],
      }),
    );
    expect(noTreatmentHtml).toContain("No hay visitas registradas por el momento.");
  });
});
