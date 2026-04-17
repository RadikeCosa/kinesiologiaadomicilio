import type { Patient } from "@/domain/patient/patient.types";

export type StartEpisodeOfCareFailureReason =
  | "missing_patient_dni"
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
  patient: Pick<Patient, "dni">,
  options: CanStartEpisodeOfCareOptions,
): StartEpisodeOfCareResult {
  const normalizedDni = patient.dni?.trim();

  if (!normalizedDni) {
    return {
      ok: false,
      reason: "missing_patient_dni",
      message: "No se puede iniciar tratamiento sin DNI.",
    };
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
