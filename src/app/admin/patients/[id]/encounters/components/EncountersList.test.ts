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
  it("renders temporal metadata first and handles missing/invalid closure copy", () => {
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
            functionalObservations: [
              { id: "o1", patientId: "pat-1", encounterId: "enc-1", effectiveDateTime: "2026-04-17T10:30:00Z", code: "tug_seconds", value: 18.5, unit: "s", status: "final" },
              { id: "o2", patientId: "pat-1", encounterId: "enc-1", effectiveDateTime: "2026-04-17T10:30:00Z", code: "pain_nrs_0_10", value: 4, unit: "/10", status: "final" },
            ],
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
    expect((html.match(/Cierre:/g) ?? []).length).toBe(3);
    expect(html).toContain("Cierre: Sin cierre registrado");
    expect((html.match(/Duración:/g) ?? []).length).toBe(3);
    expect((html.match(/Duración: No calculable/g) ?? []).length).toBe(2);
    expect(html).toContain("Estado: Registrada");
    expect(html).toContain("Registro clínico");
    expect(html).toContain("Métricas funcionales");
    expect(html).toContain("Valores registrados en esta visita. No representan tendencia.");
    expect(html).toContain("TUG:");
    expect(html).toContain("18.5 s");
    expect(html).toContain("Dolor:");
    expect(html).toContain("4/10");
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
    expect(html).not.toContain("Métricas funcionales");
  });

  it("renders functional metrics in canonical order even when input is unordered", () => {
    const html = renderToStaticMarkup(
      createElement(EncountersList, {
        patientId: "pat-1",
        hasActiveTreatment: true,
        hasFinishedTreatment: false,
        encounters: [{
          id: "enc-1",
          patientId: "pat-1",
          episodeOfCareId: "ep-1",
          status: "finished",
          startedAt: "2026-04-17T10:30:00Z",
          endedAt: "2026-04-17T11:00:00Z",
          functionalObservations: [
            { id: "o2", patientId: "pat-1", encounterId: "enc-1", effectiveDateTime: "2026-04-17T10:30:00Z", code: "pain_nrs_0_10", value: 4, unit: "/10", status: "final" },
            { id: "o3", patientId: "pat-1", encounterId: "enc-1", effectiveDateTime: "2026-04-17T10:30:00Z", code: "standing_tolerance_minutes", value: 6, unit: "min", status: "final" },
            { id: "o1", patientId: "pat-1", encounterId: "enc-1", effectiveDateTime: "2026-04-17T10:30:00Z", code: "tug_seconds", value: 18.5, unit: "s", status: "final" },
          ],
        }],
      }),
    );
    expect(html.indexOf("TUG:")).toBeLessThan(html.indexOf("Dolor:"));
    expect(html.indexOf("Dolor:")).toBeLessThan(html.indexOf("Bipedestación:"));
  });

  it("keeps calculated duration for valid start/end without legacy fallback copy", () => {
    const html = renderToStaticMarkup(
      createElement(EncountersList, {
        patientId: "pat-1",
        hasActiveTreatment: true,
        hasFinishedTreatment: false,
        encounters: [{
          id: "enc-valid",
          patientId: "pat-1",
          episodeOfCareId: "ep-1",
          status: "finished",
          startedAt: "2026-04-17T10:30:00Z",
          endedAt: "2026-04-17T11:00:00Z",
        }],
      }),
    );

    expect(html).toContain("Duración: 30 min");
    expect(html).not.toContain("Duración: No calculable");
    expect(html).not.toContain("Cierre: Sin cierre registrado");
  });

  it("renders only present functional metrics and does not render empty metrics block", () => {
    const partialHtml = renderToStaticMarkup(
      createElement(EncountersList, {
        patientId: "pat-1",
        hasActiveTreatment: true,
        hasFinishedTreatment: false,
        encounters: [{
          id: "enc-1",
          patientId: "pat-1",
          episodeOfCareId: "ep-1",
          status: "finished",
          startedAt: "2026-04-17T10:30:00Z",
          endedAt: "2026-04-17T11:00:00Z",
          functionalObservations: [
            { id: "o1", patientId: "pat-1", encounterId: "enc-1", effectiveDateTime: "2026-04-17T10:30:00Z", code: "tug_seconds", value: 18.5, unit: "s", status: "final" },
          ],
        }],
      }),
    );
    expect(partialHtml).toContain("Métricas funcionales");
    expect(partialHtml).toContain("TUG:");
    expect(partialHtml).not.toContain("Dolor:");
    expect(partialHtml).not.toContain("Bipedestación:");

    const emptyHtml = renderToStaticMarkup(
      createElement(EncountersList, {
        patientId: "pat-1",
        hasActiveTreatment: true,
        hasFinishedTreatment: false,
        encounters: [{
          id: "enc-2",
          patientId: "pat-1",
          episodeOfCareId: "ep-1",
          status: "finished",
          startedAt: "2026-04-17T10:30:00Z",
          endedAt: "2026-04-17T11:00:00Z",
        }],
      }),
    );
    expect(emptyHtml).not.toContain("Métricas funcionales");
    expect(emptyHtml).not.toContain("Valores registrados en esta visita. No representan tendencia.");
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

  it("renders only clinical fields with content", () => {
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
              objective: "",
            },
          },
        ],
      }),
    );

    expect(html).toContain("Registro clínico");
    expect(html).toContain("Refiere:");
    expect(html).toContain("Refiere menor dolor");
    expect(html).not.toContain("Se observa:");
  });

  it("renders compact clinical toggle when note is long", () => {
    const html = renderToStaticMarkup(
      createElement(EncountersList, {
        patientId: "pat-1",
        hasActiveTreatment: true,
        hasFinishedTreatment: false,
        encounters: [
          {
            id: "enc-long",
            patientId: "pat-1",
            episodeOfCareId: "ep-1",
            status: "finished",
            startedAt: "2026-04-17T10:30:00Z",
            endedAt: "2026-04-17T11:00:00Z",
            clinicalNote: {
              subjective:
                "Texto largo ".repeat(30),
            },
          },
        ],
      }),
    );

    expect(html).toContain("Ver detalle clínico");
  });

});
