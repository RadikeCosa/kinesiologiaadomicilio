export type PatientOperationalStatus =
  | "preliminary"
  | "ready_to_start"
  | "active_treatment"
  | "finished_treatment";

export interface MainContact {
  name?: string;
  relationship?: string;
  phone?: string;
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dni?: string;
  phone?: string;
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
  birthDate?: string;
  address?: string;
  mainContact?: MainContact;
}
