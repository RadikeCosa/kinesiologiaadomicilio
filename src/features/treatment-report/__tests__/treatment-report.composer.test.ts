import { describe, expect, it } from "vitest";

import { composeTreatmentReport } from "@/features/treatment-report/treatment-report.composer";
import type { TreatmentReportContext } from "@/features/treatment-report/treatment-report.types";

function buildContext(overrides: Partial<TreatmentReportContext> = {}): TreatmentReportContext {
  return {
    mode: "progress",
    patient: {
      id: "pat-1",
      displayName: "Ana Perez",
    },
    episode: {
      id: "epi-1",
      status: "active",
      startDate: "2026-05-01",
    },
    clinicalContext: {
      medicalReferenceDiagnosisText: "Lumbalgia",
      kinesiologicDiagnosisText: "Dolor lumbar mecanico",
      initialFunctionalStatus: "Dolor al caminar.",
      therapeuticGoals: "Mejorar tolerancia de marcha.",
      frameworkPlan: "Trabajo progresivo de fuerza.",
      hasAnyContent: true,
    },
    encounters: [
      {
        id: "enc-1",
        startedAt: "2026-05-10T10:00:00.000Z",
        hasClinicalNote: true,
        functionalObservationCount: 1,
      },
    ],
    encounterSummary: {
      count: 1,
      firstVisitStartedAt: "2026-05-10T10:00:00.000Z",
      lastVisitStartedAt: "2026-05-10T10:00:00.000Z",
      averageDurationMinutes: 60,
      totalDurationMinutes: 60,
      averageDaysBetweenVisits: null,
    },
    functionalTrend: [
      {
        code: "pain_nrs_0_10",
        label: "Dolor",
        unit: "/10",
        latestValue: 4,
        latestDate: "2026-05-10T10:30:00.000Z",
        previousValue: 6,
        previousDate: "2026-05-03T10:30:00.000Z",
        delta: -2,
      },
    ],
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

describe("composeTreatmentReport", () => {
  it("generates different text for progress and closure modes", () => {
    const progress = composeTreatmentReport(buildContext({ mode: "progress" }));
    const closure = composeTreatmentReport(buildContext({
      mode: "closure",
      episode: {
        id: "epi-2",
        status: "finished",
        startDate: "2026-03-01",
        endDate: "2026-04-01",
        closureReason: "treatment_completed",
        closureReasonLabel: "Tratamiento completado",
        closureDetail: "Alta funcional.",
      },
    }));

    expect(progress.initialText).toContain("Informe de progreso del tratamiento - Ana Perez");
    expect(progress.initialText).toContain("Proximos pasos:");
    expect(closure.initialText).toContain("Informe de cierre del tratamiento - Ana Perez");
    expect(closure.initialText).toContain("Motivo de cierre: Tratamiento completado");
    expect(closure.initialText).toContain("Sintesis final y recomendaciones:");
  });

  it("formats encounter statistics with the same human-readable convention as clinical management", () => {
    const result = composeTreatmentReport(buildContext({
      encounterSummary: {
        count: 3,
        firstVisitStartedAt: "2026-05-10T10:00:00.000Z",
        lastVisitStartedAt: "2026-05-17T10:00:00.000Z",
        averageDurationMinutes: 48,
        totalDurationMinutes: 143,
        averageDaysBetweenVisits: 0.75,
      },
    }));

    expect(result.initialText).toContain("Duracion promedio registrada: 48 min");
    expect(result.initialText).toContain("Tiempo total registrado: 2 h 23 min");
    expect(result.initialText).toContain("Frecuencia promedio: menos de 1 día");
    expect(result.initialText).not.toContain("0.75");
  });

  it("formats functional metrics and deltas with the same presentation helpers as clinical management", () => {
    const result = composeTreatmentReport(buildContext({
      functionalTrend: [
        {
          code: "tug_seconds",
          label: "TUG",
          unit: "s",
          latestValue: 8.2,
          latestDate: "2026-05-10T10:30:00.000Z",
          previousValue: 8,
          previousDate: "2026-05-03T10:30:00.000Z",
          delta: 0.1999999999999993,
        },
        {
          code: "standing_tolerance_minutes",
          label: "Bipedestación",
          unit: "min",
          latestValue: 2.5,
          latestDate: "2026-05-10T10:30:00.000Z",
          previousValue: 8.2,
          previousDate: "2026-05-03T10:30:00.000Z",
          delta: -5.699999999999999,
        },
      ],
    }));

    expect(result.initialText).toContain("TUG: 8.2 s (cambio vs previo: +0.2 s)");
    expect(result.initialText).toContain("Bipedestación: 2.5 min (cambio vs previo: -5.7 min)");
    expect(result.initialText).not.toContain("0.1999999999999993");
    expect(result.initialText).not.toContain("-5.699999999999999");
  });

  it("omits empty sections and warns when important data is missing", () => {
    const result = composeTreatmentReport(buildContext({
      clinicalContext: {
        hasAnyContent: false,
      },
      encounterSummary: {
        count: 0,
        averageDurationMinutes: null,
        totalDurationMinutes: null,
        averageDaysBetweenVisits: null,
      },
      encounters: [],
      functionalTrend: [],
      signingProfessional: {
        status: "missing",
      },
    }));

    expect(result.omittedSections).toContain("clinical_context");
    expect(result.omittedSections).toContain("functional_metrics");
    expect(result.warnings).toContain("Faltan diagnosticos clinicos de referencia para contextualizar el informe.");
    expect(result.warnings).toContain("Todavia no hay sesiones registradas para este episodio.");
    expect(result.completeness.status).toBe("insufficient");
  });

  it("does not include DNI, phone, address or main contact data by default", () => {
    const context = buildContext() as TreatmentReportContext & {
      patient: TreatmentReportContext["patient"] & {
        dni?: string;
        phone?: string;
        address?: string;
        mainContactName?: string;
      };
    };
    context.patient.dni = "12345678";
    context.patient.phone = "+5492991234567";
    context.patient.address = "Calle interna 123";
    context.patient.mainContactName = "Marta Perez";

    const result = composeTreatmentReport(context);

    expect(result.initialText).not.toContain("12345678");
    expect(result.initialText).not.toContain("+5492991234567");
    expect(result.initialText).not.toContain("Calle interna 123");
    expect(result.initialText).not.toContain("Marta Perez");
  });
});
