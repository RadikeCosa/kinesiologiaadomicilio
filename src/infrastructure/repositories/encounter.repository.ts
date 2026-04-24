import type {
  CreateEncounterInput,
  Encounter,
  UpdateEncounterOccurrenceInput,
} from "@/domain/encounter/encounter.types";
import { extractResourcesByType } from "@/lib/fhir/bundle-utils";
import { fhirClient } from "@/lib/fhir/client";
import { FhirClientError } from "@/lib/fhir/errors";
import { buildEncounterByPatientQuery } from "@/lib/fhir/search-params";
import type { FhirBundle } from "@/lib/fhir/types";

import { type FhirEncounter } from "@/infrastructure/mappers/encounter/encounter-fhir.types";
import { mapFhirEncounterToDomain } from "@/infrastructure/mappers/encounter/encounter-read.mapper";
import {
  mapCreateEncounterInputToFhir,
  mapEncounterOccurrenceDateTimeUpdate,
} from "@/infrastructure/mappers/encounter/encounter-write.mapper";

function buildSearchPath(resourceType: string, query: string): string {
  return query ? `${resourceType}?${query}` : resourceType;
}

export async function createEncounter(input: CreateEncounterInput): Promise<Encounter> {
  const payload = mapCreateEncounterInputToFhir(input);
  const created = await fhirClient.post<FhirEncounter>("Encounter", payload);

  return mapFhirEncounterToDomain(created);
}

export async function getEncounterById(encounterId: string): Promise<Encounter | null> {
  if (!encounterId.trim()) {
    return null;
  }

  try {
    const encounter = await fhirClient.get<FhirEncounter>(`Encounter/${encounterId}`);
    return mapFhirEncounterToDomain(encounter);
  } catch (error) {
    if (error instanceof FhirClientError && error.status === 404) {
      return null;
    }

    throw error;
  }
}

export async function updateEncounterOccurrenceDateTime(
  input: UpdateEncounterOccurrenceInput,
): Promise<Encounter> {
  const existing = await fhirClient.get<FhirEncounter>(`Encounter/${input.encounterId}`);
  const updatedPayload = mapEncounterOccurrenceDateTimeUpdate(existing, input.occurrenceDate);
  const updated = await fhirClient.put<FhirEncounter>(`Encounter/${input.encounterId}`, updatedPayload);

  return mapFhirEncounterToDomain(updated);
}

export async function listEncountersByPatientId(patientId: string): Promise<Encounter[]> {
  if (!patientId.trim()) {
    return [];
  }

  const query = buildEncounterByPatientQuery(patientId);
  const bundle = await fhirClient.get<FhirBundle<FhirEncounter>>(buildSearchPath("Encounter", query));
  const encounters = extractResourcesByType<FhirEncounter>(bundle, "Encounter");

  return encounters.map(mapFhirEncounterToDomain);
}
