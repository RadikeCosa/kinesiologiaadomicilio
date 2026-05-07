import type { FunctionalObservationInput } from "@/domain/functional-observation/functional-observation.types";
import { buildPatientReference } from "@/lib/fhir/references";
import { FUNCTIONAL_OBSERVATION_CODE_SYSTEM, FUNCTIONAL_OBSERVATION_DEFINITIONS } from "@/infrastructure/mappers/functional-observation/functional-observation.constants";
import { type FhirObservation } from "@/infrastructure/mappers/functional-observation/functional-observation-fhir.types";

const buildEncounterReference = (encounterId: string) => `Encounter/${encounterId}`;

export function mapFunctionalObservationInputToFhir(input: FunctionalObservationInput): FhirObservation {
  const definition = FUNCTIONAL_OBSERVATION_DEFINITIONS[input.code];

  return {
    resourceType: "Observation",
    status: input.status ?? "final",
    subject: { reference: buildPatientReference(input.patientId) },
    encounter: { reference: buildEncounterReference(input.encounterId) },
    effectiveDateTime: input.effectiveDateTime,
    code: { coding: [{ system: FUNCTIONAL_OBSERVATION_CODE_SYSTEM, code: definition.fhirCode, display: definition.display }], text: definition.display },
    valueQuantity: { value: input.value, unit: definition.unit, system: definition.quantitySystem, code: definition.quantityCode },
  };
}
