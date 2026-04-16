import type { CreatePatientInput, Patient, UpdatePatientInput } from "@/domain/patient/patient.types";

export async function createPatient(input: CreatePatientInput): Promise<Patient> {
  void input;
  throw new Error("TODO(slice-1/fase-2): createPatient aún no implementado.");
}

export async function getPatientById(id: string): Promise<Patient | null> {
  // TODO(slice-1/fase-2): conectar repositorio real.
  void id;
  return null;
}

export async function listPatients(): Promise<Patient[]> {
  // TODO(slice-1/fase-2): conectar repositorio real.
  return [];
}

export async function updatePatient(input: UpdatePatientInput): Promise<Patient> {
  void input;
  throw new Error("TODO(slice-1/fase-2): updatePatient aún no implementado.");
}

export async function findPatientByDni(dni: string): Promise<Patient | null> {
  // TODO(slice-1/fase-2): conectar repositorio real.
  void dni;
  return null;
}
