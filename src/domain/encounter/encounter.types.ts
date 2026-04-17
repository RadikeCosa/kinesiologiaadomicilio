export type EncounterStatus = "finished";

export interface Encounter {
  id: string;
  patientId: string;
  episodeOfCareId: string;
  occurrenceDate: string;
  status: EncounterStatus;
}

export interface CreateEncounterInput {
  patientId: string;
  episodeOfCareId: string;
  occurrenceDate: string;
}
