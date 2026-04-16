export type PatientOperationalStatus = "preliminary" | "ready_to_start" | "active_treatment";

export interface PatientListItemReadModel {
  id: string;
  fullName: string;
  dni?: string;
  phone?: string;
  operationalStatus: PatientOperationalStatus;
  createdAt: string;
  updatedAt: string;
}
