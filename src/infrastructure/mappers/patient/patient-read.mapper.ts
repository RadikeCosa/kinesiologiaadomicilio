import { getPatientOperationalStatus } from "@/domain/patient/patient.rules";
import type { EpisodeOfCare } from "@/domain/episode-of-care/episode-of-care.types";
import type { Patient } from "@/domain/patient/patient.types";
import type { PatientDetailReadModel } from "@/features/patients/read-models/patient-detail.read-model";
import type { PatientListItemReadModel } from "@/features/patients/read-models/patient-list-item.read-model";

function buildFullName(patient: Pick<Patient, "firstName" | "lastName">): string {
  return `${patient.firstName} ${patient.lastName}`.trim();
}

export function mapPatientToListItemReadModel(
  patient: Patient,
  options?: { activeEpisode: EpisodeOfCare | null },
): PatientListItemReadModel {
  const hasActiveEpisode = Boolean(options?.activeEpisode);

  return {
    id: patient.id,
    fullName: buildFullName(patient),
    dni: patient.dni,
    phone: patient.phone,
    operationalStatus: getPatientOperationalStatus({
      patient,
      hasActiveEpisode,
    }),
    createdAt: patient.createdAt,
    updatedAt: patient.updatedAt,
  };
}

export function mapPatientToDetailReadModel(
  patient: Patient,
  options?: { activeEpisode: EpisodeOfCare | null },
): PatientDetailReadModel {
  const activeEpisode = options?.activeEpisode ?? null;

  return {
    id: patient.id,
    firstName: patient.firstName,
    lastName: patient.lastName,
    fullName: buildFullName(patient),
    dni: patient.dni,
    phone: patient.phone,
    birthDate: patient.birthDate,
    address: patient.address,
    patientNotes: patient.notes,
    mainContact: patient.mainContact,
    initialContext: patient.initialContext,
    activeEpisode,
    operationalStatus: getPatientOperationalStatus({
      patient,
      hasActiveEpisode: Boolean(activeEpisode),
    }),
    createdAt: patient.createdAt,
    updatedAt: patient.updatedAt,
  };
}
