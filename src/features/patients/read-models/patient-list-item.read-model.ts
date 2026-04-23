import type { PatientGender, PatientOperationalStatus } from "@/domain/patient/patient.types";

export interface PatientListItemReadModel {
  id: string;
  fullName: string;
  dni?: string;
  phone?: string;
  gender?: PatientGender;
  address?: string;
  operationalStatus: PatientOperationalStatus;
  createdAt: string;
  updatedAt: string;
}
