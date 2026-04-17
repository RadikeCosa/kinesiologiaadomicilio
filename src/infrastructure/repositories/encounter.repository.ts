import type { CreateEncounterInput, Encounter } from "@/domain/encounter/encounter.types";
import { extractResourcesByType } from "@/lib/fhir/bundle-utils";
import { fhirClient } from "@/lib/fhir/client";
import { buildEncounterByPatientQuery } from "@/lib/fhir/search-params";
import type { FhirBundle } from "@/lib/fhir/types";

import { type FhirEncounter } from "@/infrastructure/mappers/encounter/encounter-fhir.types";
import { mapFhirEncounterToDomain } from "@/infrastructure/mappers/encounter/encounter-read.mapper";
import { mapCreateEncounterInputToFhir } from "@/infrastructure/mappers/encounter/encounter-write.mapper";

function buildSearchPath(resourceType: string, query: string): string {
  return query ? `${resourceType}?${query}` : resourceType;
}

export async function createEncounter(input: CreateEncounterInput): Promise<Encounter> {
  const payload = mapCreateEncounterInputToFhir(input);
  const created = await fhirClient.post<FhirEncounter>("Encounter", payload);

  return mapFhirEncounterToDomain(created);
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
