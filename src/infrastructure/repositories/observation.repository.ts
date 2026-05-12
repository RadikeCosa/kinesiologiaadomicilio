import type { FunctionalObservation, FunctionalObservationInput } from "@/domain/functional-observation/functional-observation.types";
import { extractResourcesByType } from "@/lib/fhir/bundle-utils";
import { fhirClient } from "@/lib/fhir/client";
import { FhirClientError } from "@/lib/fhir/errors";
import { type FhirBundle } from "@/lib/fhir/types";
import { mapFhirObservationToFunctionalObservation } from "@/infrastructure/mappers/functional-observation/functional-observation-read.mapper";
import { type FhirObservation } from "@/infrastructure/mappers/functional-observation/functional-observation-fhir.types";
import { mapFunctionalObservationInputToFhir } from "@/infrastructure/mappers/functional-observation/functional-observation-write.mapper";

export async function createFunctionalObservation(input: FunctionalObservationInput): Promise<FunctionalObservation> {
  const created = await fhirClient.post<FhirObservation>("Observation", mapFunctionalObservationInputToFhir(input));
  const mapped = mapFhirObservationToFunctionalObservation(created);
  if (!mapped) throw new Error("No se pudo mapear la observación funcional creada.");
  return mapped;
}

export async function listFunctionalObservationsByEncounterId(encounterId: string): Promise<FunctionalObservation[]> {
  if (!encounterId.trim()) return [];
  const query = new URLSearchParams({ encounter: `Encounter/${encounterId}` }).toString();
  const bundle = await fhirClient.get<FhirBundle<FhirObservation>>(`Observation?${query}`);
  return extractResourcesByType<FhirObservation>(bundle, "Observation")
    .map((resource) => mapFhirObservationToFunctionalObservation(resource))
    .filter((item): item is FunctionalObservation => item !== null);
}

export async function listFunctionalObservationsByEncounterIds(encounterIds: string[]): Promise<FunctionalObservation[]> {
  const normalizedEncounterIds = Array.from(new Set(encounterIds.map((id) => id.trim()).filter(Boolean)));
  if (normalizedEncounterIds.length === 0) return [];

  const encounterRefs = normalizedEncounterIds.map((id) => `Encounter/${id}`).join(",");
  const query = new URLSearchParams({ encounter: encounterRefs }).toString();
  try {
    const bundle = await fhirClient.get<FhirBundle<FhirObservation>>(`Observation?${query}`);

    return extractResourcesByType<FhirObservation>(bundle, "Observation")
      .map((resource) => mapFhirObservationToFunctionalObservation(resource))
      .filter((item): item is FunctionalObservation => item !== null);
  } catch (error) {
    if (!(error instanceof FhirClientError) || normalizedEncounterIds.length <= 1 || !isBatchEncounterQueryUnsupported(error)) {
      throw error;
    }

    const bundles = await Promise.all(normalizedEncounterIds.map(async (encounterId) => {
      const singleQuery = new URLSearchParams({ encounter: `Encounter/${encounterId}` }).toString();
      return fhirClient.get<FhirBundle<FhirObservation>>(`Observation?${singleQuery}`);
    }));

    return bundles
      .flatMap((bundle) => extractResourcesByType<FhirObservation>(bundle, "Observation"))
      .map((resource) => mapFhirObservationToFunctionalObservation(resource))
      .filter((item): item is FunctionalObservation => item !== null);
  }
}

function isBatchEncounterQueryUnsupported(error: FhirClientError): boolean {
  if (error.status !== 400 && error.status !== 422) {
    return false;
  }

  const diagnostic = error.operationOutcome?.issue?.[0]?.diagnostics?.toLowerCase() ?? "";
  return diagnostic.includes("unknown search parameter") || diagnostic.includes("invalid") || diagnostic.includes("encounter");
}
