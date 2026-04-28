export type EpisodeOfCareStatus = "active" | "finished";

export interface EpisodeOfCare {
  id: string;
  patientId: string;
  status: EpisodeOfCareStatus;
  startDate: string;
  endDate?: string;
  serviceRequestId?: string;
}

export interface StartEpisodeOfCareInput {
  patientId: string;
  startDate: string;
  serviceRequestId?: string;
}

export interface FinishEpisodeOfCareInput {
  patientId: string;
  endDate: string;
}
