import { describe, expect, it } from "vitest";

import { evaluateVisitShareReportCompleteness } from "../visit-share-report.completeness";
import type { EncounterShareableReportContext } from "../visit-share-report.types";

function buildContext(
  overrides: Partial<EncounterShareableReportContext> = {},
): EncounterShareableReportContext {
  return {
    patient: {
      displayName: "Ana Perez",
      ageYears: 74,
      recipientOptions: [],
    },
    visit: {
      startedAt: "2026-06-02T13:00:00.000Z",
      endedAt: "2026-06-02T14:00:00.000Z",
      durationMinutes: 60,
      clinicalNote: {
        intervention: "Movilidad activa asistida y entrenamiento de transferencias.",
        homeInstructions: "Realizar ejercicios respiratorios indicados.",
        nextPlan: "Continuar con marcha asistida en proxima visita.",
      },
      functionalMetrics: [],
    },
    signingProfessional: {
      status: "ready",
      fullName: "Lic. Ramiro Gomez",
      roleTitle: "Kinesiologo",
      licenseNumber: "12345",
    },
    ...overrides,
  };
}

describe("evaluateVisitShareReportCompleteness", () => {
  it("returns ready with intervention and instructions or plan plus signing professional", () => {
    const result = evaluateVisitShareReportCompleteness(buildContext());

    expect(result.status).toBe("ready");
    expect(result.missing).toEqual([]);
  });

  it("returns usable with warnings when indications and next plan are missing", () => {
    const result = evaluateVisitShareReportCompleteness(buildContext({
      visit: {
        ...buildContext().visit,
        clinicalNote: {
          intervention: "Entrenamiento de marcha con asistencia.",
        },
      },
    }));

    expect(result.status).toBe("usable_with_warnings");
    expect(result.warnings).toContain("No hay indicaciones domiciliarias registradas.");
    expect(result.warnings).toContain("No hay proximo plan registrado.");
  });

  it("returns usable with warnings when there are metrics but limited narrative", () => {
    const context = buildContext({
      visit: {
        startedAt: "2026-06-02T13:00:00.000Z",
        functionalMetrics: [
          { code: "pain_nrs_0_10", label: "Dolor", value: 4, unit: "/10" },
        ],
      },
    });

    const result = evaluateVisitShareReportCompleteness(context);

    expect(result.status).toBe("usable_with_warnings");
    expect(result.warnings).toContain("Hay metricas registradas, pero falta texto clinico compartible.");
  });

  it("returns insufficient when the visit only has date and duration", () => {
    const result = evaluateVisitShareReportCompleteness(buildContext({
      visit: {
        startedAt: "2026-06-02T13:00:00.000Z",
        endedAt: "2026-06-02T14:00:00.000Z",
        durationMinutes: 60,
        functionalMetrics: [],
      },
    }));

    expect(result.status).toBe("insufficient");
  });

  it("warns when signing professional is not ready", () => {
    const result = evaluateVisitShareReportCompleteness(buildContext({
      signingProfessional: {
        status: "missing",
      },
    }));

    expect(result.status).toBe("usable_with_warnings");
    expect(result.missing).toContain("signing_professional");
  });
});
