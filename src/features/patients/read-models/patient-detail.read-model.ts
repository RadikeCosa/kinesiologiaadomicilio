import type { EpisodeOfCare } from "@/domain/episode-of-care/episode-of-care.types";
import type { MainContact, PatientOperationalStatus } from "@/domain/patient/patient.types";

export interface PatientDetailReadModel {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  dni?: string;
  phone?: string;
  birthDate?: string;
  address?: string;
  patientNotes?: string;
  mainContact?: MainContact;
  initialContext?: {
    reasonForConsultation?: string;
    requestedBy?: string;
    initialNotes?: string;
  };
  activeEpisode: EpisodeOfCare | null;
  operationalStatus: PatientOperationalStatus;
  createdAt: string;
  updatedAt: string;
}
