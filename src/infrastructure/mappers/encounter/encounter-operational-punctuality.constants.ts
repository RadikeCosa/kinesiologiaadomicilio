import type { EncounterVisitStartPunctuality } from "@/domain/encounter/encounter.types";

export const ENCOUNTER_OPERATIONAL_PUNCTUALITY_EXTENSION_URL = "https://kinesiologiaadomicilio.local/fhir/StructureDefinition/encounter-operational-punctuality-status-v1";

export const ENCOUNTER_OPERATIONAL_PUNCTUALITY_LABEL: Record<EncounterVisitStartPunctuality, string> = {
  on_time_or_minor_delay: "En horario o demora leve",
  delayed: "Con demora",
  severely_delayed: "Muy demorada",
};

export function isEncounterVisitStartPunctuality(value: string | undefined): value is EncounterVisitStartPunctuality {
  return value === "on_time_or_minor_delay" || value === "delayed" || value === "severely_delayed";
}
