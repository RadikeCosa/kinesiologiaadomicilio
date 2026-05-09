import type { PatientGender, PatientOperationalStatus } from "@/domain/patient/patient.types";
import type { MainContact } from "@/domain/patient/patient.types";

export interface PatientListItemReadModel {
  id: string;
  fullName: string;
  dni?: string;
  phone?: string;
  mainContact?: MainContact;
  gender?: PatientGender;
  birthDate?: string;
  address?: string;
  operationalStatus: PatientOperationalStatus;
  createdAt: string;
  updatedAt: string;
}
