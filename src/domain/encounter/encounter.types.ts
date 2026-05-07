import type { FunctionalObservation, FunctionalObservationInput } from "@/domain/functional-observation/functional-observation.types";
export type EncounterStatus = "finished";

export interface EncounterClinicalNote {
  subjective?: string;
  objective?: string;
  intervention?: string;
  assessment?: string;
  tolerance?: string;
  homeInstructions?: string;
  nextPlan?: string;
}

export interface Encounter {
  id: string;
  patientId: string;
  episodeOfCareId: string;
  startedAt: string;
  endedAt?: string;
  status: EncounterStatus;
  clinicalNote?: EncounterClinicalNote;
  functionalObservations?: FunctionalObservation[];
}

export interface CreateEncounterInput {
  patientId: string;
  episodeOfCareId: string;
  startedAt: string;
  endedAt: string;
  clinicalNote?: EncounterClinicalNote;
  functionalObservations?: FunctionalObservationInput[];
  /**
   * @deprecated transitional alias while migrating from occurrenceDate to startedAt.
   */
  occurrenceDate?: string;
}

export interface UpdateEncounterPeriodInput {
  encounterId: string;
  patientId: string;
  startedAt: string;
  endedAt: string;
}
