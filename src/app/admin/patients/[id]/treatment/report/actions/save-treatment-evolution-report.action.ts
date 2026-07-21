"use server";

import { revalidatePath } from "next/cache";

import type { TreatmentEvolutionReportType } from "@/domain/treatment-evolution-report/treatment-evolution-report.types";
import { TREATMENT_EVOLUTION_REPORT_TYPE_LABELS } from "@/domain/treatment-evolution-report/treatment-evolution-report.types";
import {
  formatFunctionalDelta,
  formatFunctionalValue,
  type FunctionalObservationTrendSummary,
} from "@/app/admin/patients/[id]/encounters/functional-trend";
import { createTreatmentEvolutionReport } from "@/infrastructure/repositories/document-reference.repository";
import { loadTreatmentReportContext } from "@/features/treatment-report/treatment-report.read-model";

export interface SaveTreatmentEvolutionReportActionResult {
  ok: boolean;
  message?: string;
  reportId?: string;
}

interface SaveTreatmentEvolutionReportActionInput {
  patientId: string;
  episodeId: string;
  mode: "progress" | "closure";
  reportType: TreatmentEvolutionReportType;
  finalText: string;
}

function isValidReportType(value: string): value is TreatmentEvolutionReportType {
  return value === "progress" || value === "stage_closure";
}

function normalizeText(value: string): string {
  return value.trim();
}

function buildFunctionalMetricsSummarySnapshot(
  trend: FunctionalObservationTrendSummary[],
): string | undefined {
  if (trend.length === 0) {
    return undefined;
  }

  return trend
    .map((metric) => {
      const latestValue = formatFunctionalValue(metric.code, metric.latestValue);

      if (typeof metric.delta !== "number") {
        return `${metric.label}: ${latestValue}`;
      }

      return `${metric.label}: ${latestValue} (cambio vs previo: ${formatFunctionalDelta(metric.code, metric.delta)})`;
    })
    .join("\n");
}

export async function saveTreatmentEvolutionReportAction(
  input: SaveTreatmentEvolutionReportActionInput,
): Promise<SaveTreatmentEvolutionReportActionResult> {
  const patientId = normalizeText(input.patientId);
  const episodeId = normalizeText(input.episodeId);
  const finalText = normalizeText(input.finalText);

  if (!patientId || !episodeId || !finalText) {
    return {
      ok: false,
      message: "Completá los datos mínimos para guardar el informe.",
    };
  }

  if (!isValidReportType(input.reportType)) {
    return {
      ok: false,
      message: "Seleccioná un tipo de informe válido.",
    };
  }

  const contextResult = await loadTreatmentReportContext({
    patientId,
    episodeId,
    mode: input.mode,
  });

  if (!contextResult.ok) {
    return {
      ok: false,
      message: "No se pudo guardar el informe con el episodio indicado.",
    };
  }

  const { context } = contextResult;

  const created = await createTreatmentEvolutionReport({
    patientId,
    episodeId,
    createdAt: new Date().toISOString(),
    reportType: input.reportType,
    treatmentStatusAtReport: context.episode.status,
    episodeStartDate: context.episode.startDate,
    encounterCount: context.encounterSummary.count,
    firstEncounterStartedAt: context.encounterSummary.firstVisitStartedAt,
    lastEncounterStartedAt: context.encounterSummary.lastVisitStartedAt,
    medicalDiagnosisSnapshot: context.clinicalContext?.medicalReferenceDiagnosisText,
    kinesiologicDiagnosisSnapshot: context.clinicalContext?.kinesiologicDiagnosisText,
    initialFunctionalStatusSnapshot: context.clinicalContext?.initialFunctionalStatus,
    therapeuticGoalsSnapshot: context.clinicalContext?.therapeuticGoals,
    frameworkPlanSnapshot: context.clinicalContext?.frameworkPlan,
    functionalMetricsSummarySnapshot: buildFunctionalMetricsSummarySnapshot(context.functionalTrend),
    finalText,
  });

  revalidatePath(`/admin/patients/${patientId}/treatment/report`);
  revalidatePath(`/admin/patients/${patientId}/encounters`);

  return {
    ok: true,
    message: `${TREATMENT_EVOLUTION_REPORT_TYPE_LABELS[input.reportType]} guardado.`,
    reportId: created.id,
  };
}
