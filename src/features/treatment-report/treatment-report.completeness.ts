import type {
  TreatmentReportCompletenessResult,
  TreatmentReportContext,
} from "@/features/treatment-report/treatment-report.types";

function hasText(value: string | undefined): boolean {
  return Boolean(value?.trim());
}

function hasUsableSigningProfessional(context: TreatmentReportContext): boolean {
  const professional = context.signingProfessional;

  return professional.status === "ready" || (
    hasText(professional.fullName)
    && hasText(professional.roleTitle)
  );
}

export function evaluateTreatmentReportCompleteness(
  context: TreatmentReportContext,
): TreatmentReportCompletenessResult {
  const warnings: string[] = [];
  const missing: string[] = [];
  const clinicalContext = context.clinicalContext;
  const hasDiagnoses = Boolean(
    clinicalContext?.medicalReferenceDiagnosisText?.trim()
    || clinicalContext?.kinesiologicDiagnosisText?.trim(),
  );
  const hasLongitudinalContext = Boolean(
    clinicalContext?.initialFunctionalStatus?.trim()
    || clinicalContext?.therapeuticGoals?.trim()
    || clinicalContext?.frameworkPlan?.trim(),
  );
  const hasEncounters = context.encounterSummary.count > 0;
  const hasFunctionalMetrics = context.functionalTrend.length > 0;
  const hasProfessional = hasUsableSigningProfessional(context);

  if (!hasDiagnoses) {
    missing.push("diagnoses");
    warnings.push("Faltan diagnosticos clinicos de referencia para contextualizar el informe.");
  }

  if (!hasLongitudinalContext) {
    missing.push("clinical_context");
    warnings.push("Falta contexto longitudinal del tratamiento (situacion inicial, objetivos o plan).");
  }

  if (!hasEncounters) {
    missing.push("encounters");
    warnings.push("Todavia no hay sesiones registradas para este episodio.");
  }

  if (!hasFunctionalMetrics) {
    warnings.push("No hay metricas funcionales registradas para resumir cambios observables.");
  }

  if (!hasProfessional) {
    missing.push("signing_professional");
    warnings.push("El profesional firmante no tiene datos minimos listos para firma.");
  } else if (context.signingProfessional.status !== "ready") {
    warnings.push("El profesional firmante tiene datos minimos, pero aun falta completar la matricula.");
  }

  if (context.mode === "closure" && !hasText(context.episode.closureReasonLabel)) {
    missing.push("closure_reason");
    warnings.push("El episodio finalizado no tiene motivo de cierre registrado.");
  }

  if (!hasDiagnoses && !hasLongitudinalContext && !hasEncounters) {
    return {
      status: "insufficient",
      missing,
      warnings,
    };
  }

  if (hasProfessional && (hasDiagnoses || hasLongitudinalContext) && hasEncounters) {
    return {
      status: context.signingProfessional.status === "ready" ? "ready" : "usable_with_warnings",
      missing,
      warnings,
    };
  }

  return {
    status: "usable_with_warnings",
    missing,
    warnings,
  };
}
