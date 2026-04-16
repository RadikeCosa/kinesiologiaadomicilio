import type { Patient } from "@/domain/patient/patient.types";
import type { PatientDetailReadModel } from "@/features/patients/read-models/patient-detail.read-model";
import type { PatientListItemReadModel } from "@/features/patients/read-models/patient-list-item.read-model";

export function mapPatientToListItemReadModel(patient: Patient): PatientListItemReadModel {
  // TODO(slice-1/fase-2): definir mapeo real de listado desde infraestructura.
  void patient;

  return {
    id: "",
    fullName: "",
    dni: undefined,
    phone: undefined,
    operationalStatus: "preliminary",
    createdAt: "",
    updatedAt: "",
  };
}

export function mapPatientToDetailReadModel(patient: Patient): PatientDetailReadModel {
  // TODO(slice-1/fase-2): definir mapeo real de detalle desde infraestructura.
  void patient;

  return {
    id: "",
    firstName: "",
    lastName: "",
    fullName: "",
    dni: undefined,
    phone: undefined,
    birthDate: undefined,
    address: undefined,
    patientNotes: undefined,
    mainContact: undefined,
    initialContext: undefined,
    activeEpisode: undefined,
    operationalStatus: "preliminary",
    createdAt: "",
    updatedAt: "",
  };
}
