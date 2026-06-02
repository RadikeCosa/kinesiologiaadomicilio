import type {
  EncounterShareableReportContext,
  VisitShareReportCompletenessResult,
} from "./visit-share-report.types";

function hasText(value: string | undefined): boolean {
  return Boolean(value?.trim());
}

function hasUsableSigningProfessional(context: EncounterShareableReportContext): boolean {
  const professional = context.signingProfessional;

  return professional.status === "ready" || (
    hasText(professional.fullName)
    && hasText(professional.roleTitle)
  );
}

export function evaluateVisitShareReportCompleteness(
  context: EncounterShareableReportContext,
): VisitShareReportCompletenessResult {
  const missing: string[] = [];
  const warnings: string[] = [];
  const note = context.visit.clinicalNote;
  const hasVisitDate = hasText(context.visit.startedAt);
  const hasIntervention = hasText(note?.intervention);
  const hasHomeInstructions = hasText(note?.homeInstructions);
  const hasNextPlan = hasText(note?.nextPlan);
  const hasMetrics = context.visit.functionalMetrics.length > 0;
  const hasShareableClinicalText = [
    note?.intervention,
    note?.assessment,
    note?.tolerance,
    note?.homeInstructions,
    note?.nextPlan,
  ].some(hasText);
  const professionalIsUsable = hasUsableSigningProfessional(context);

  if (!hasVisitDate) {
    missing.push("visit_date");
    warnings.push("Falta la fecha de la visita.");
  }

  if (!hasIntervention) {
    missing.push("intervention");
    warnings.push("Falta registrar la intervencion/trabajo realizado.");
  }

  if (!hasHomeInstructions) {
    missing.push("home_instructions");
    warnings.push("No hay indicaciones domiciliarias registradas.");
  }

  if (!hasNextPlan) {
    missing.push("next_plan");
    warnings.push("No hay proximo plan registrado.");
  }

  if (!professionalIsUsable) {
    missing.push("signing_professional");
    warnings.push("El profesional firmante no esta listo o no tiene datos minimos.");
  } else if (context.signingProfessional.status !== "ready") {
    warnings.push("El profesional firmante tiene datos minimos, pero falta completar la matricula.");
  }

  if (hasMetrics && !hasShareableClinicalText) {
    warnings.push("Hay metricas registradas, pero falta texto clinico compartible.");
  }

  if (!hasVisitDate || (!hasShareableClinicalText && !hasMetrics)) {
    return { status: "insufficient", missing, warnings };
  }

  if (
    hasIntervention
    && (hasHomeInstructions || hasNextPlan)
    && professionalIsUsable
  ) {
    return {
      status: context.signingProfessional.status === "ready" ? "ready" : "usable_with_warnings",
      missing,
      warnings,
    };
  }

  return { status: "usable_with_warnings", missing, warnings };
}
