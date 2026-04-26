export type EncounterStatus = "finished";

export interface Encounter {
  id: string;
  patientId: string;
  episodeOfCareId: string;
  startedAt: string;
  endedAt?: string;
  status: EncounterStatus;
}

export interface CreateEncounterInput {
  patientId: string;
  episodeOfCareId: string;
  startedAt: string;
  endedAt: string;
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
