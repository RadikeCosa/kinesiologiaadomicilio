import { formatDateDisplay } from "@/lib/patient-admin-display";
import {
  formatEncounterAverageVisitFrequency,
  formatEncounterMinutesAsDuration,
} from "@/lib/encounter-stats-display";
import {
  formatFunctionalDelta,
  formatFunctionalValue,
} from "@/app/admin/patients/[id]/encounters/functional-trend";

import { evaluateTreatmentReportCompleteness } from "@/features/treatment-report/treatment-report.completeness";
import type {
  TreatmentReportCompositionResult,
  TreatmentReportContext,
  TreatmentReportSection,
} from "@/features/treatment-report/treatment-report.types";

function normalizeText(value: string | undefined): string {
  return value?.trim() ?? "";
}

function hasText(value: string | undefined): boolean {
  return Boolean(normalizeText(value));
}

function formatFunctionalMetricLine(metric: TreatmentReportContext["functionalTrend"][number]): string {
  const latestUnit = formatFunctionalValue(metric.code, metric.latestValue);

  if (typeof metric.delta !== "number") {
    return `- ${metric.label}: ${latestUnit}`;
  }

  const deltaValue = formatFunctionalDelta(metric.code, metric.delta);

  return `- ${metric.label}: ${latestUnit} (cambio vs previo: ${deltaValue})`;
}

function buildSignature(context: TreatmentReportContext): string {
  const professional = context.signingProfessional;
  const lines: string[] = [];

  if (hasText(professional.signatureDisplay)) {
    lines.push(normalizeText(professional.signatureDisplay));
  } else if (hasText(professional.fullName) || hasText(professional.roleTitle)) {
    lines.push([professional.roleTitle, professional.fullName].map(normalizeText).filter(Boolean).join(" "));
  }

  if (hasText(professional.licenseNumber)) {
    const jurisdiction = hasText(professional.licenseJurisdiction)
      ? ` (${normalizeText(professional.licenseJurisdiction)})`
      : "";
    lines.push(`Matricula: ${normalizeText(professional.licenseNumber)}${jurisdiction}`);
  }

  return lines.join("\n");
}

export function composeTreatmentReport(
  context: TreatmentReportContext,
): TreatmentReportCompositionResult {
  const completeness = evaluateTreatmentReportCompleteness(context);
  const includedSections: TreatmentReportSection[] = ["header"];
  const omittedSections: TreatmentReportSection[] = [];
  const blocks: string[] = [];
  const reportTitle = context.mode === "closure"
    ? "Informe de cierre del tratamiento"
    : "Informe de progreso del tratamiento";

  blocks.push(`${reportTitle} - ${context.patient.displayName}`);

  if (context.episode.endDate) {
    blocks.push(`Periodo del tratamiento: ${formatDateDisplay(context.episode.startDate)} al ${formatDateDisplay(context.episode.endDate)}`);
  } else {
    blocks.push(`Periodo del tratamiento: desde ${formatDateDisplay(context.episode.startDate)}`);
  }

  includedSections.push("treatment_status");
  blocks.push([
    `Estado del tratamiento: ${context.episode.status === "active" ? "Activo" : "Finalizado"}`,
    `Inicio del tratamiento: ${formatDateDisplay(context.episode.startDate)}`,
    context.episode.endDate ? `Cierre registrado: ${formatDateDisplay(context.episode.endDate)}` : "",
    context.episode.closureReasonLabel ? `Motivo de cierre: ${context.episode.closureReasonLabel}` : "",
    hasText(context.episode.closureDetail) ? `Detalle de cierre: ${normalizeText(context.episode.closureDetail)}` : "",
  ].filter(Boolean).join("\n"));

  const clinicalLines = [
    hasText(context.clinicalContext?.medicalReferenceDiagnosisText)
      ? `Diagnostico medico de referencia: ${normalizeText(context.clinicalContext?.medicalReferenceDiagnosisText)}`
      : "",
    hasText(context.clinicalContext?.kinesiologicDiagnosisText)
      ? `Diagnostico kinesico: ${normalizeText(context.clinicalContext?.kinesiologicDiagnosisText)}`
      : "",
    hasText(context.clinicalContext?.initialFunctionalStatus)
      ? `Situacion funcional inicial: ${normalizeText(context.clinicalContext?.initialFunctionalStatus)}`
      : "",
    hasText(context.clinicalContext?.therapeuticGoals)
      ? `Objetivos terapeuticos: ${normalizeText(context.clinicalContext?.therapeuticGoals)}`
      : "",
    hasText(context.clinicalContext?.frameworkPlan)
      ? `Plan marco: ${normalizeText(context.clinicalContext?.frameworkPlan)}`
      : "",
  ].filter(Boolean);

  if (clinicalLines.length > 0) {
    includedSections.push("clinical_context");
    blocks.push(`Contexto clinico del tratamiento:\n${clinicalLines.join("\n")}`);
  } else {
    omittedSections.push("clinical_context");
  }

  const encounterLines = [
    `Sesiones registradas: ${context.encounterSummary.count}`,
    context.encounterSummary.firstVisitStartedAt
      ? `Primera sesion: ${formatDateDisplay(context.encounterSummary.firstVisitStartedAt)}`
      : "",
    context.encounterSummary.lastVisitStartedAt
      ? `Ultima sesion: ${formatDateDisplay(context.encounterSummary.lastVisitStartedAt)}`
      : "",
    context.encounterSummary.averageDurationMinutes !== null
      ? `Duracion promedio registrada: ${formatEncounterMinutesAsDuration(context.encounterSummary.averageDurationMinutes)}`
      : "",
    context.encounterSummary.totalDurationMinutes !== null
      ? `Tiempo total registrado: ${formatEncounterMinutesAsDuration(context.encounterSummary.totalDurationMinutes)}`
      : "",
    typeof context.encounterSummary.averageDaysBetweenVisits === "number"
      ? `Frecuencia promedio: ${formatEncounterAverageVisitFrequency({
        averageDaysBetweenEpisodeVisits: context.encounterSummary.averageDaysBetweenVisits,
      }).toLowerCase()}`
      : "",
  ].filter(Boolean);

  if (encounterLines.length > 1 || context.encounterSummary.count > 0) {
    includedSections.push("encounter_summary");
    blocks.push(`Resumen de sesiones:\n${encounterLines.join("\n")}`);
  } else {
    omittedSections.push("encounter_summary");
  }

  if (context.functionalTrend.length > 0) {
    includedSections.push("functional_metrics");
    blocks.push(`Metricas funcionales:\n${context.functionalTrend.map(formatFunctionalMetricLine).join("\n")}`);
  } else {
    omittedSections.push("functional_metrics");
  }

  includedSections.push("professional_summary");
  blocks.push("Sintesis profesional:\n[Completar sintesis profesional]");

  includedSections.push("continuity");
  blocks.push(context.mode === "closure"
    ? "Sintesis final y recomendaciones:\n[Completar sintesis final y recomendaciones]"
    : "Proximos pasos:\n[Completar proximos pasos]");

  const signature = buildSignature(context);

  if (signature) {
    includedSections.push("signature");
    blocks.push(signature);
  } else {
    omittedSections.push("signature");
  }

  return {
    initialText: blocks.join("\n\n"),
    warnings: completeness.warnings,
    includedSections,
    omittedSections,
    completeness,
  };
}
