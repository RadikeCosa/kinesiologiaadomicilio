import type { Patient } from "@/domain/patient/patient.types";

export function hasRequiredIdentityForEpisode(patient: Pick<Patient, "dni">): boolean {
  // TODO(slice-1/fase-2): implementar regla real de identidad mínima para iniciar tratamiento.
  void patient;
  return false;
}
