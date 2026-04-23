import type { EpisodeOfCare } from "@/domain/episode-of-care/episode-of-care.types";
import type { MainContact, PatientGender, PatientOperationalStatus } from "@/domain/patient/patient.types";

export interface PatientDetailReadModel {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  dni?: string;
  phone?: string;
  gender?: PatientGender;
  birthDate?: string;
  address?: string;
  mainContact?: MainContact;
  activeEpisode?: EpisodeOfCare | null;
  latestEpisode?: EpisodeOfCare | null;
  operationalStatus: PatientOperationalStatus;
  createdAt: string;
  updatedAt: string;
}
