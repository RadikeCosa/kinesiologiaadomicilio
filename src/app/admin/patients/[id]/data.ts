import type { PatientDetailReadModel } from "@/features/patients/read-models/patient-detail.read-model";

export async function loadPatientDetail(id: string): Promise<PatientDetailReadModel | null> {
  // TODO(slice-1/fase-2): implementar carga real desde repositorio.
  void id;
  return null;
}
