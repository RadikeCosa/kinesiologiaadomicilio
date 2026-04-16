import type { CreatePatientInput, Patient, UpdatePatientInput } from "@/domain/patient/patient.types";

/**
 * Implementación transicional del Slice 1.
 *
 * Nota: estos datos en memoria existen solo para cablear lectura
 * (repository -> mapper -> read model -> data.ts -> page.tsx)
 * mientras se integra persistencia real/FHIR.
 */
const initialTransitionalPatients: Patient[] = [
  {
    id: "pat-001",
    firstName: "Ana",
    lastName: "Pérez",
    phone: "+54 299 555 0101",
    notes: "Primera consulta por dolor lumbar.",
    createdAt: "2026-04-10T09:00:00.000Z",
    updatedAt: "2026-04-10T09:00:00.000Z",
  },
  {
    id: "pat-002",
    firstName: "Bruno",
    lastName: "Gómez",
    dni: "32123456",
    phone: "+54 299 555 0102",
    mainContact: {
      name: "María Gómez",
      relationship: "Madre",
      phone: "+54 299 555 0199",
    },
    initialContext: {
      reasonForConsultation: "Rehabilitación post esguince de tobillo.",
      requestedBy: "Traumatología",
    },
    createdAt: "2026-04-11T12:30:00.000Z",
    updatedAt: "2026-04-13T08:15:00.000Z",
  },
  {
    id: "pat-003",
    firstName: "Carla",
    lastName: "Ruiz",
    dni: "28999888",
    phone: "+54 299 555 0103",
    birthDate: "1989-07-22",
    address: "Neuquén Capital",
    notes: "Con movilidad reducida temporal.",
    createdAt: "2026-04-09T15:45:00.000Z",
    updatedAt: "2026-04-14T10:20:00.000Z",
  },
];

function clonePatient(patient: Patient): Patient {
  return {
    ...patient,
    mainContact: patient.mainContact ? { ...patient.mainContact } : undefined,
    initialContext: patient.initialContext ? { ...patient.initialContext } : undefined,
  };
}

const transitionalPatients: Patient[] = initialTransitionalPatients.map(clonePatient);

export function __resetPatientRepositoryForTests(): void {
  transitionalPatients.splice(0, transitionalPatients.length);
  transitionalPatients.push(...initialTransitionalPatients.map(clonePatient));
}

export async function createPatient(input: CreatePatientInput): Promise<Patient> {
  const nowIso = new Date().toISOString();

  const createdPatient: Patient = {
    id: `pat-${Date.now()}`,
    ...input,
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  transitionalPatients.unshift(createdPatient);
  return createdPatient;
}

export async function getPatientById(id: string): Promise<Patient | null> {
  const patient = transitionalPatients.find((item) => item.id === id);
  return patient ?? null;
}

export async function listPatients(): Promise<Patient[]> {
  return [...transitionalPatients];
}

export async function updatePatient(input: UpdatePatientInput): Promise<Patient> {
  const index = transitionalPatients.findIndex((item) => item.id === input.id);

  if (index < 0) {
    throw new Error(`No se encontró paciente con id '${input.id}'.`);
  }

  const current = transitionalPatients[index];
  const updatedPatient: Patient = {
    ...current,
    ...input,
    updatedAt: new Date().toISOString(),
  };

  transitionalPatients[index] = updatedPatient;
  return updatedPatient;
}

export async function findPatientByDni(dni: string): Promise<Patient | null> {
  const normalizedDni = dni.trim();
  const patient = transitionalPatients.find((item) => item.dni?.trim() === normalizedDni);

  return patient ?? null;
}

export async function existsAnotherPatientWithDni(options: {
  dni: string;
  excludePatientId: string;
}): Promise<boolean> {
  const normalizedDni = options.dni.trim();

  return transitionalPatients.some(
    (item) => item.id !== options.excludePatientId && item.dni?.trim() === normalizedDni,
  );
}
