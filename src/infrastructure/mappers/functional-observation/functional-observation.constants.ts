import type { FunctionalObservationCode } from "@/domain/functional-observation/functional-observation.types";

export const FUNCTIONAL_OBSERVATION_CODE_SYSTEM = "https://kinesiologiaadomicilio.ar/fhir/CodeSystem/functional-observations";
export const FUNCTIONAL_OBSERVATION_CODE_SYSTEM_VERSION = "0.1.0";

export const FUNCTIONAL_OBSERVATION_DEFINITIONS: Record<FunctionalObservationCode, { fhirCode: string; display: string; unit: string; quantitySystem?: string; quantityCode?: string }> = {
  tug_seconds: { fhirCode: "tug-seconds", display: "Timed Up and Go (segundos)", unit: "s", quantitySystem: "http://unitsofmeasure.org", quantityCode: "s" },
  pain_nrs_0_10: { fhirCode: "pain-nrs-0-10", display: "Dolor NRS 0-10", unit: "score", quantityCode: "{score}" },
  standing_tolerance_minutes: { fhirCode: "standing-tolerance-minutes", display: "Tolerancia a bipedestación (minutos)", unit: "min", quantitySystem: "http://unitsofmeasure.org", quantityCode: "min" },
};
