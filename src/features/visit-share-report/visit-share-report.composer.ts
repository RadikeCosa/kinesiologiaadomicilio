import { formatDateDisplay } from "@/lib/patient-admin-display";

import { evaluateVisitShareReportCompleteness } from "./visit-share-report.completeness";
import type {
  EncounterShareableReportContext,
  VisitShareReportCompositionResult,
  VisitShareReportSection,
} from "./visit-share-report.types";

function normalizeText(value: string | undefined): string {
  return value?.trim() ?? "";
}

function hasText(value: string | undefined): boolean {
  return Boolean(normalizeText(value));
}

function formatMetricLine(metric: EncounterShareableReportContext["visit"]["functionalMetrics"][number]): string {
  if (metric.unit === "/10") {
    return `- ${metric.label}: ${metric.value}/10`;
  }

  return `- ${metric.label}: ${metric.value} ${metric.unit}`;
}

function buildSignature(context: EncounterShareableReportContext): string {
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

export function composeVisitShareReport(
  context: EncounterShareableReportContext,
): VisitShareReportCompositionResult {
  const completeness = evaluateVisitShareReportCompleteness(context);
  const note = context.visit.clinicalNote;
  const includedSections: VisitShareReportSection[] = ["header"];
  const omittedSections: VisitShareReportSection[] = [];
  const blocks: string[] = [];
  const patientDisplayName = normalizeText(context.patient.firstName) || context.patient.displayName;
  const visitDate = formatDateDisplay(context.visit.startedAt);

  blocks.push(`Resumen compartible de visita - ${patientDisplayName}`);
  blocks.push(`Fecha de la visita: ${visitDate}`);

  if (hasText(context.visit.startedAtDisplay)) {
    blocks.push(`Inicio registrado: ${normalizeText(context.visit.startedAtDisplay)}`);
  }

  if (hasText(context.visit.endedAtDisplay)) {
    blocks.push(`Cierre registrado: ${normalizeText(context.visit.endedAtDisplay)}`);
  }

  if (typeof context.visit.durationMinutes === "number") {
    blocks.push(`Duracion registrada: ${context.visit.durationMinutes} minutos`);
  }

  if (hasText(context.visit.punctualityLabel)) {
    blocks.push(`Puntualidad registrada: ${normalizeText(context.visit.punctualityLabel)}`);
  }

  if (hasText(note?.subjective)) {
    includedSections.push("subjective");
    blocks.push(`Refiere paciente/familia:\n${normalizeText(note?.subjective)}`);
  } else {
    omittedSections.push("subjective");
  }

  if (hasText(note?.objective)) {
    includedSections.push("objective");
    blocks.push(`Observado en la visita:\n${normalizeText(note?.objective)}`);
  } else {
    omittedSections.push("objective");
  }

  if (hasText(note?.intervention)) {
    includedSections.push("intervention");
    blocks.push(`Trabajo realizado:\n${normalizeText(note?.intervention)}`);
  } else {
    omittedSections.push("intervention");
  }

  const responseLines = [
    hasText(note?.assessment) ? `Evolucion/observacion registrada: ${normalizeText(note?.assessment)}` : "",
    hasText(note?.tolerance) ? `Tolerancia registrada: ${normalizeText(note?.tolerance)}` : "",
  ].filter(Boolean);

  if (responseLines.length > 0) {
    includedSections.push("response");
    blocks.push(`Respuesta durante la sesion:\n${responseLines.join("\n")}`);
  } else {
    omittedSections.push("response");
  }

  if (context.visit.functionalMetrics.length > 0) {
    includedSections.push("metrics");
    blocks.push(`Metricas registradas:\n${context.visit.functionalMetrics.map(formatMetricLine).join("\n")}`);
  } else {
    omittedSections.push("metrics");
  }

  if (hasText(note?.homeInstructions)) {
    includedSections.push("home_instructions");
    blocks.push(`Indicaciones para casa:\n${normalizeText(note?.homeInstructions)}`);
  } else {
    omittedSections.push("home_instructions");
  }

  if (hasText(note?.nextPlan)) {
    includedSections.push("next_plan");
    blocks.push(`Proximo plan:\n${normalizeText(note?.nextPlan)}`);
  } else {
    omittedSections.push("next_plan");
  }

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
