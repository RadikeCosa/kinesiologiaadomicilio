export type EpisodeOfCareStatus = "active" | "finished";

export interface EpisodeOfCare {
  id: string;
  patientId: string;
  status: EpisodeOfCareStatus;
  startDate: string;
  endDate?: string;
  description?: string;
}

export interface StartEpisodeOfCareInput {
  patientId: string;
  startDate: string;
  description?: string;
}

export interface FinishEpisodeOfCareInput {
  patientId: string;
  endDate: string;
}
