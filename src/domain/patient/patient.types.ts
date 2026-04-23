import type { MainContactRelationship } from "@/domain/patient/contact-relationship";

export type PatientOperationalStatus =
  | "preliminary"
  | "ready_to_start"
  | "active_treatment"
  | "finished_treatment";

export type PatientGender = "male" | "female" | "other" | "unknown";

export interface MainContact {
  name?: string;
  relationship?: MainContactRelationship;
  phone?: string;
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dni?: string;
  phone?: string;
  gender?: PatientGender;
  birthDate?: string;
  address?: string;
  mainContact?: MainContact;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePatientInput {
  firstName: string;
  lastName: string;
  dni?: string;
  phone?: string;
  gender?: PatientGender;
  birthDate?: string;
  address?: string;
  mainContact?: MainContact;
}

export interface UpdatePatientInput {
  id: string;
  firstName?: string;
  lastName?: string;
  dni?: string;
  phone?: string;
  gender?: PatientGender;
  birthDate?: string;
  address?: string;
  mainContact?: MainContact;
}
