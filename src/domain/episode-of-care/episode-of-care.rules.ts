import type { Patient } from "@/domain/patient/patient.types";
import { hasMinimumOperationalDataForTreatment } from "@/domain/patient/patient.rules";

export type StartEpisodeOfCareFailureReason =
  | "missing_patient_name"
  | "missing_patient_address"
  | "missing_contact_phone"
  | "patient_already_has_active_episode"
  | "duplicate_patient_by_dni";

export type StartEpisodeOfCareResult =
  | { ok: true }
  | {
      ok: false;
      reason: StartEpisodeOfCareFailureReason;
      message: string;
    };

export interface CanStartEpisodeOfCareOptions {
  hasActiveEpisode: boolean;
  duplicatePatientByDni: boolean;
}

export function canStartEpisodeOfCare(
  patient: Pick<Patient, "firstName" | "lastName" | "address" | "phone" | "mainContact">,
  options: CanStartEpisodeOfCareOptions,
): StartEpisodeOfCareResult {
  const minimumOperationalDataValidation = hasMinimumOperationalDataForTreatment(patient);
  if (!minimumOperationalDataValidation.ok) {
    return minimumOperationalDataValidation;
  }

  if (options.hasActiveEpisode) {
    return {
      ok: false,
      reason: "patient_already_has_active_episode",
      message: "El paciente ya tiene un episodio activo.",
    };
  }

  if (options.duplicatePatientByDni) {
    return {
      ok: false,
      reason: "duplicate_patient_by_dni",
      message: "Ya existe otro paciente con ese DNI.",
    };
  }

  return { ok: true };
}

export type FinishEpisodeOfCareResult =
  | { ok: true }
  | {
      ok: false;
      reason: "missing_active_episode";
      message: string;
    };

export function canFinishEpisodeOfCare(options: { hasActiveEpisode: boolean }): FinishEpisodeOfCareResult {
  if (!options.hasActiveEpisode) {
    return {
      ok: false,
      reason: "missing_active_episode",
      message: "No hay un episodio activo para finalizar.",
    };
  }

  return { ok: true };
}
