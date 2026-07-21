import { describe, expect, it, vi } from "vitest";

vi.mock("@/features/treatment-report/treatment-report.read-model", () => ({
  loadTreatmentReportContext: vi.fn(),
}));

vi.mock("@/infrastructure/repositories/document-reference.repository", () => ({
  createTreatmentEvolutionReport: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { saveTreatmentEvolutionReportAction } from "@/app/admin/patients/[id]/treatment/report/actions/save-treatment-evolution-report.action";
import { loadTreatmentReportContext } from "@/features/treatment-report/treatment-report.read-model";
import { createTreatmentEvolutionReport } from "@/infrastructure/repositories/document-reference.repository";

describe("saveTreatmentEvolutionReportAction", () => {
  it("persists patient, episode, type, final text and snapshots", async () => {
    vi.mocked(loadTreatmentReportContext).mockResolvedValue({
      ok: true,
      context: {
        mode: "progress",
        patient: { id: "pat-1", displayName: "Ana Perez" },
        episode: { id: "epi-1", status: "active", startDate: "2026-05-01" },
        clinicalContext: {
          medicalReferenceDiagnosisText: "Lumbalgia",
          kinesiologicDiagnosisText: "Dolor lumbar mecanico",
          initialFunctionalStatus: "Dolor al caminar",
          therapeuticGoals: "Mejorar tolerancia",
          frameworkPlan: "Plan progresivo",
          hasAnyContent: true,
        },
        encounters: [],
        encounterSummary: {
          count: 2,
          firstVisitStartedAt: "2026-05-03T10:00:00Z",
          lastVisitStartedAt: "2026-05-10T10:00:00Z",
          averageDurationMinutes: 60,
          totalDurationMinutes: 120,
          averageDaysBetweenVisits: 7,
        },
        functionalTrend: [{
          code: "pain_nrs_0_10",
          label: "Dolor",
          unit: "/10",
          latestValue: 4,
          latestDate: "2026-05-10T10:00:00Z",
          previousValue: 6,
          previousDate: "2026-05-03T10:00:00Z",
          delta: -2,
        }],
        signingProfessional: { status: "missing" },
      },
    });
    vi.mocked(createTreatmentEvolutionReport).mockResolvedValue({
      id: "doc-1",
      patientId: "pat-1",
      episodeId: "epi-1",
      createdAt: "2026-07-08T12:00:00Z",
      reportType: "stage_closure",
      treatmentStatusAtReport: "active",
      episodeStartDate: "2026-05-01",
      encounterCount: 2,
      finalText: "Texto final editado",
    });

    const result = await saveTreatmentEvolutionReportAction({
      patientId: "pat-1",
      episodeId: "epi-1",
      mode: "progress",
      reportType: "stage_closure",
      finalText: "Texto final editado",
    });

    expect(createTreatmentEvolutionReport).toHaveBeenCalledWith(expect.objectContaining({
      patientId: "pat-1",
      episodeId: "epi-1",
      reportType: "stage_closure",
      treatmentStatusAtReport: "active",
      episodeStartDate: "2026-05-01",
      encounterCount: 2,
      medicalDiagnosisSnapshot: "Lumbalgia",
      therapeuticGoalsSnapshot: "Mejorar tolerancia",
      finalText: "Texto final editado",
    }));
    expect(result).toEqual({
      ok: true,
      message: "Cierre de etapa guardado.",
      reportId: "doc-1",
    });
  });

  it("validates ownership through treatment report context", async () => {
    vi.mocked(loadTreatmentReportContext).mockResolvedValue({
      ok: false,
      reason: "episode_belongs_to_another_patient",
    });

    const result = await saveTreatmentEvolutionReportAction({
      patientId: "pat-1",
      episodeId: "epi-1",
      mode: "progress",
      reportType: "progress",
      finalText: "Texto final",
    });

    expect(createTreatmentEvolutionReport).not.toHaveBeenCalled();
    expect(result).toEqual({
      ok: false,
      message: "No se pudo guardar el informe con el episodio indicado.",
    });
  });
});
