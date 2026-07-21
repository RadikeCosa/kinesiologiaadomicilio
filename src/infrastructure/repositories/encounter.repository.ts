import type {
  CreateEncounterInput,
  Encounter,
  UpdateEncounterClinicalNoteInput,
  UpdateEncounterPeriodInput,
} from "@/domain/encounter/encounter.types";
import { extractNextBundlePageUrl, extractResourcesByType } from "@/lib/fhir/bundle-utils";
import { fhirClient } from "@/lib/fhir/client";
import { FhirClientError } from "@/lib/fhir/errors";
import { buildEncounterByPatientQuery } from "@/lib/fhir/search-params";
import type { FhirBundle } from "@/lib/fhir/types";

import { type FhirEncounter } from "@/infrastructure/mappers/encounter/encounter-fhir.types";
import { mapFhirEncounterToDomain } from "@/infrastructure/mappers/encounter/encounter-read.mapper";
import {
  mapEncounterClinicalNoteUpdate,
  mapCreateEncounterInputToFhir,
  mapEncounterTimeRangeUpdate,
} from "@/infrastructure/mappers/encounter/encounter-write.mapper";

function buildSearchPath(resourceType: string, query: string): string {
  return query ? `${resourceType}?${query}` : resourceType;
}

async function listAllEncounterResourcesBySearchPath(initialSearchPath: string): Promise<FhirEncounter[]> {
  const resources: FhirEncounter[] = [];
  const visitedSearchPaths = new Set<string>();
  let nextSearchPath: string | null = initialSearchPath;

  while (nextSearchPath && !visitedSearchPaths.has(nextSearchPath)) {
    visitedSearchPaths.add(nextSearchPath);

    const bundle = await fhirClient.get<FhirBundle<FhirEncounter>>(nextSearchPath);
    resources.push(...extractResourcesByType<FhirEncounter>(bundle, "Encounter"));

    nextSearchPath = extractNextBundlePageUrl(bundle);
  }

  return resources;
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

export async function updateEncounterTimeRange(
  input: UpdateEncounterPeriodInput,
): Promise<Encounter> {
  const existing = await fhirClient.get<FhirEncounter>(`Encounter/${input.encounterId}`);
  const updatedPayload = mapEncounterTimeRangeUpdate(existing, input.startedAt, input.endedAt);
  const updated = await fhirClient.put<FhirEncounter>(`Encounter/${input.encounterId}`, updatedPayload);

  return mapFhirEncounterToDomain(updated);
}

export async function updateEncounterClinicalNote(
  input: UpdateEncounterClinicalNoteInput,
): Promise<Encounter> {
  const existing = await fhirClient.get<FhirEncounter>(`Encounter/${input.encounterId}`);
  const payload = mapEncounterClinicalNoteUpdate(existing, input.clinicalNote);
  const updated = await fhirClient.put<FhirEncounter>(`Encounter/${input.encounterId}`, payload);

  return mapFhirEncounterToDomain(updated);
}

export async function listEncountersByPatientId(patientId: string): Promise<Encounter[]> {
  if (!patientId.trim()) {
    return [];
  }

  const query = buildEncounterByPatientQuery(patientId, { count: 100 });
  const encounters = await listAllEncounterResourcesBySearchPath(buildSearchPath("Encounter", query));

  return encounters.map(mapFhirEncounterToDomain);
}
