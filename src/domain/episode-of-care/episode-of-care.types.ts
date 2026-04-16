export type EpisodeOfCareStatus = "active";

export interface EpisodeOfCare {
  id: string;
  patientId: string;
  status: EpisodeOfCareStatus;
  startDate: string;
  description?: string;
}

export interface StartEpisodeOfCareInput {
  patientId: string;
  startDate: string;
  description?: string;
}
