import type { CreatePatientInput, Patient, UpdatePatientInput } from "@/domain/patient/patient.types";
import { extractResourcesByType, extractSingleResource } from "@/lib/fhir/bundle-utils";
import { fhirClient } from "@/lib/fhir/client";
import { FhirClientError } from "@/lib/fhir/errors";
import { buildPatientListQuery, buildPatientSearchByDniQuery } from "@/lib/fhir/search-params";
import type { FhirBundle } from "@/lib/fhir/types";
import { normalizeDni } from "@/lib/patient-admin-display";

import { type FhirPatient } from "@/infrastructure/mappers/patient/patient-fhir.types";
import { mapFhirPatientToDomain } from "@/infrastructure/mappers/patient/patient-read.mapper";
import { mapCreatePatientInputToFhir, mapUpdatePatientInputToFhir } from "@/infrastructure/mappers/patient/patient-write.mapper";

function buildSearchPath(resourceType: string, query: string): string {
  return query ? `${resourceType}?${query}` : resourceType;
}

function resolveNotFoundToNull(error: unknown): null {
  if (error instanceof FhirClientError && error.status === 404) {
    return null;
  }

  throw error;
}

export async function createPatient(input: CreatePatientInput): Promise<Patient> {
  const created = await fhirClient.post<FhirPatient>("Patient", mapCreatePatientInputToFhir(input));
  return mapFhirPatientToDomain(created);
}

export async function getPatientById(id: string): Promise<Patient | null> {
  try {
    const patient = await fhirClient.get<FhirPatient>(`Patient/${id}`);
    return mapFhirPatientToDomain(patient);
  } catch (error) {
    return resolveNotFoundToNull(error);
  }
}

export async function listPatients(): Promise<Patient[]> {
  // Convención vigente (Bloque B):
  // listado con query básica, sin paginación avanzada ni estrategia sofisticada de orden.
  const query = buildPatientListQuery();
  const bundle = await fhirClient.get<FhirBundle<FhirPatient>>(buildSearchPath("Patient", query));

  return extractResourcesByType<FhirPatient>(bundle, "Patient").map(mapFhirPatientToDomain);
}

export async function updatePatient(input: UpdatePatientInput): Promise<Patient> {
  // Convención vigente (Bloque B): update por GET -> merge controlado -> PUT.
  // Aún no hay concurrencia optimista (If-Match/versionado).
  const existing = await fhirClient.get<FhirPatient>(`Patient/${input.id}`);
  const payload = mapUpdatePatientInputToFhir({ existing, update: input });
  const updated = await fhirClient.put<FhirPatient>(`Patient/${input.id}`, payload);

  return mapFhirPatientToDomain(updated);
}

export async function findPatientByDni(dni: string): Promise<Patient | null> {
  const normalizedDni = normalizeDni(dni);

  if (!normalizedDni) {
    return null;
  }

  const query = buildPatientSearchByDniQuery(normalizedDni);
  const bundle = await fhirClient.get<FhirBundle<FhirPatient>>(buildSearchPath("Patient", query));
  const patient = extractSingleResource<FhirPatient>(bundle, "Patient");

  return patient ? mapFhirPatientToDomain(patient) : null;
}

export async function existsAnotherPatientWithDni(options: {
  dni: string;
  excludePatientId: string;
}): Promise<boolean> {
  const normalizedDni = normalizeDni(options.dni);

  if (!normalizedDni) {
    return false;
  }

  const query = buildPatientSearchByDniQuery(normalizedDni);
  const bundle = await fhirClient.get<FhirBundle<FhirPatient>>(buildSearchPath("Patient", query));
  const matches = extractResourcesByType<FhirPatient>(bundle, "Patient");

  return matches.some((patient) => patient.id !== options.excludePatientId);
}
