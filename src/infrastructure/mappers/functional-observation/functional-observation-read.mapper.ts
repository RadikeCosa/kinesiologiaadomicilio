import type { FunctionalObservation, FunctionalObservationCode } from "@/domain/functional-observation/functional-observation.types";
import { extractIdFromReference } from "@/lib/fhir/references";
import { FUNCTIONAL_OBSERVATION_CODE_SYSTEM, FUNCTIONAL_OBSERVATION_DEFINITIONS } from "@/infrastructure/mappers/functional-observation/functional-observation.constants";
import { type FhirObservation } from "@/infrastructure/mappers/functional-observation/functional-observation-fhir.types";

const FHIR_CODE_TO_DOMAIN = new Map<
string,
FunctionalObservationCode
>(Object.entries(FUNCTIONAL_OBSERVATION_DEFINITIONS).map(([domainCode, def]) => [def.fhirCode, domainCode as FunctionalObservationCode]));

export function mapFhirObservationToFunctionalObservation(resource: FhirObservation): FunctionalObservation | null {
  const coding = resource.code?.coding?.find((item) => item.system === FUNCTIONAL_OBSERVATION_CODE_SYSTEM);
  const domainCode = coding?.code ? FHIR_CODE_TO_DOMAIN.get(coding.code) : undefined;
  if (!domainCode) return null;

  const patientId = extractIdFromReference(resource.subject?.reference);
  const encounterId = extractIdFromReference(resource.encounter?.reference);
  const value = resource.valueQuantity?.value;
  const effectiveDateTime = resource.effectiveDateTime?.trim();
  if (!patientId || !encounterId || typeof value !== "number" || !effectiveDateTime) throw new Error("Observation funcional inválida: faltan campos requeridos.");

  return {
    id: resource.id?.trim() ?? "",
    patientId,
    encounterId,
    effectiveDateTime,
    code: domainCode,
    value,
    unit: resource.valueQuantity?.unit?.trim() || FUNCTIONAL_OBSERVATION_DEFINITIONS[domainCode].unit,
    status: "final",
  };
}
