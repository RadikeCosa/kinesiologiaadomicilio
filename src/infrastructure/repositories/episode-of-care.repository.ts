import type { EpisodeOfCare, StartEpisodeOfCareInput } from "@/domain/episode-of-care/episode-of-care.types";
import { extractSingleResource } from "@/lib/fhir/bundle-utils";
import { fhirClient } from "@/lib/fhir/client";
import { buildActiveEpisodeOfCareByPatientQuery } from "@/lib/fhir/search-params";
import type { FhirBundle } from "@/lib/fhir/types";

import { type FhirEpisodeOfCare } from "@/infrastructure/mappers/episode-of-care/episode-of-care-fhir.types";
import { mapFhirEpisodeOfCareToDomain } from "@/infrastructure/mappers/episode-of-care/episode-of-care-read.mapper";
import { mapStartEpisodeOfCareInputToFhir } from "@/infrastructure/mappers/episode-of-care/episode-of-care-write.mapper";

function buildSearchPath(resourceType: string, query: string): string {
  return query ? `${resourceType}?${query}` : resourceType;
}

export async function getActiveEpisodeByPatientId(patientId: string): Promise<EpisodeOfCare | null> {
  if (!patientId.trim()) {
    return null;
  }

  // Convención vigente (pre-Encounter):
  // query simple por paciente + status activo, sin paginación/orden sofisticados.
  const query = buildActiveEpisodeOfCareByPatientQuery(patientId);
  const bundle = await fhirClient.get<FhirBundle<FhirEpisodeOfCare>>(buildSearchPath("EpisodeOfCare", query));
  const episode = extractSingleResource<FhirEpisodeOfCare>(bundle, "EpisodeOfCare");

  return episode ? mapFhirEpisodeOfCareToDomain(episode) : null;
}

export async function createEpisodeOfCare(input: StartEpisodeOfCareInput): Promise<EpisodeOfCare> {
  // Convención vigente: alta directa de EpisodeOfCare activo.
  // Aún sin concurrencia optimista ni semánticas avanzadas de cierre/historización.
  const payload = mapStartEpisodeOfCareInputToFhir(input);
  const created = await fhirClient.post<FhirEpisodeOfCare>("EpisodeOfCare", payload);

  return mapFhirEpisodeOfCareToDomain(created);
}
