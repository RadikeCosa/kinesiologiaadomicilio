import type { FunctionalObservation, FunctionalObservationInput } from "@/domain/functional-observation/functional-observation.types";
import { extractResourcesByType } from "@/lib/fhir/bundle-utils";
import { fhirClient } from "@/lib/fhir/client";
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
