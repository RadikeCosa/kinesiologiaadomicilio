import type { PatientOperationalStatus } from "@/domain/patient/patient.types";

export interface PatientListItemReadModel {
  id: string;
  fullName: string;
  dni?: string;
  phone?: string;
  address?: string;
  operationalStatus: PatientOperationalStatus;
  createdAt: string;
  updatedAt: string;
}
