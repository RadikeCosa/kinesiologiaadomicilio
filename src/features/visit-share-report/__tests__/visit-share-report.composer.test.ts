import { describe, expect, it } from "vitest";

import { composeVisitShareReport } from "../visit-share-report.composer";
import type { EncounterShareableReportContext } from "../visit-share-report.types";

function buildContext(
  overrides: Partial<EncounterShareableReportContext> = {},
): EncounterShareableReportContext {
  return {
    patient: {
      displayName: "Ana Perez",
      firstName: "Ana",
      ageYears: 74,
      recipientOptions: [
        {
          kind: "patient",
          displayName: "Ana Perez",
          phone: "+5492991234567",
          hasWhatsAppCandidate: true,
        },
      ],
    },
    visit: {
      startedAt: "2026-06-02T13:00:00.000Z",
      endedAt: "2026-06-02T14:00:00.000Z",
      startedAtDisplay: "10:00",
      endedAtDisplay: "11:00",
      durationMinutes: 60,
      punctualityLabel: "En horario o demora leve",
      clinicalNote: {
        subjective: "Dolor referido por la paciente.",
        objective: "Se observa mejor control postural en sedestacion.",
        intervention: "Movilidad activa asistida, ejercicios respiratorios y entrenamiento de transferencias.",
        assessment: "Se registro buena participacion durante la visita.",
        tolerance: "Tolero la sesion sin eventos adversos registrados.",
        homeInstructions: "Realizar ejercicios respiratorios suaves dos veces al dia.",
        nextPlan: "Continuar con marcha asistida y reevaluar tolerancia.",
      },
      functionalMetrics: [
        { code: "pain_nrs_0_10", label: "Dolor", value: 4, unit: "/10" },
        { code: "tug_seconds", label: "TUG", value: 18, unit: "s" },
      ],
    },
    signingProfessional: {
      status: "ready",
      fullName: "Lic. Ramiro Gomez",
      roleTitle: "Kinesiologo",
      licenseNumber: "12345",
      signatureDisplay: "Lic. Ramiro Gomez - Kinesiologo",
    },
    ...overrides,
  };
}

describe("composeVisitShareReport", () => {
  it("composes registered clinical fields, punctuality, continuity plan and signature", () => {
    const result = composeVisitShareReport(buildContext());

    expect(result.initialText).toContain("Puntualidad registrada: En horario o demora leve");
    expect(result.initialText).toContain("Resumen compartible de visita - Ana");
    expect(result.initialText).not.toContain("Resumen compartible de visita - Ana Perez");
    expect(result.initialText).not.toContain("74 anos");
    expect(result.initialText).toContain("Inicio registrado: 10:00");
    expect(result.initialText).toContain("Cierre registrado: 11:00");
    expect(result.initialText).toContain("Duracion registrada: 60 minutos");
    expect(result.initialText).toContain("Refiere paciente/familia:");
    expect(result.initialText).toContain("Dolor referido por la paciente.");
    expect(result.initialText).toContain("Observado en la visita:");
    expect(result.initialText).toContain("Se observa mejor control postural en sedestacion.");
    expect(result.initialText).toContain("Trabajo realizado:");
    expect(result.initialText).toContain("Movilidad activa asistida");
    expect(result.initialText).toContain("Indicaciones para casa:");
    expect(result.initialText).toContain("Proximo plan:");
    expect(result.initialText).toContain("Lic. Ramiro Gomez - Kinesiologo");
    expect(result.initialText).toContain("Matricula: 12345");
    expect(result.includedSections).toContain("subjective");
    expect(result.includedSections).toContain("objective");
    expect(result.includedSections).toContain("intervention");
    expect(result.includedSections).toContain("signature");
  });

  it("omits empty blocks instead of rendering placeholders", () => {
    const result = composeVisitShareReport(buildContext({
      visit: {
        startedAt: "2026-06-02T13:00:00.000Z",
        clinicalNote: {
          intervention: "Ejercicios activos asistidos.",
        },
        functionalMetrics: [],
      },
    }));

    expect(result.initialText).not.toContain("Metricas registradas:");
    expect(result.initialText).not.toContain("Puntualidad registrada:");
    expect(result.initialText).not.toContain("Refiere paciente/familia:");
    expect(result.initialText).not.toContain("Observado en la visita:");
    expect(result.initialText).not.toContain("Indicaciones para casa:");
    expect(result.initialText).not.toContain("Proximo plan:");
    expect(result.omittedSections).toContain("subjective");
    expect(result.omittedSections).toContain("objective");
    expect(result.omittedSections).toContain("metrics");
    expect(result.omittedSections).toContain("home_instructions");
    expect(result.omittedSections).toContain("next_plan");
  });

  it("includes metrics only when present and does not interpret them", () => {
    const result = composeVisitShareReport(buildContext());
    const metricBlock = result.initialText.split("Metricas registradas:\n")[1]?.split("\n\n")[0] ?? "";

    expect(result.initialText).toContain("Dolor: 4/10");
    expect(result.initialText).toContain("TUG: 18 s");
    expect(metricBlock).not.toMatch(/mejor|empeor|normal|alto|bajo/i);
  });

  it("does not include internal or contact data in the body", () => {
    const result = composeVisitShareReport(buildContext());

    expect(result.initialText).not.toContain("+5492991234567");
    expect(result.initialText).not.toContain("12345678");
    expect(result.initialText).not.toMatch(/domicilio/i);
    expect(result.initialText).not.toMatch(/diagnost/i);
  });

  it("does not inject administrative data when subjective and objective are absent", () => {
    const result = composeVisitShareReport(buildContext({
      visit: {
        startedAt: "2026-06-02T13:00:00.000Z",
        clinicalNote: {
          intervention: "Ejercicios activos asistidos.",
        },
        functionalMetrics: [],
      },
    }));

    expect(result.initialText).not.toContain("+5492991234567");
    expect(result.initialText).not.toContain("12345678");
    expect(result.initialText).not.toMatch(/domicilio/i);
  });
});
