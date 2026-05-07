import type {
  EpisodeOfCare,
  FinishEpisodeOfCareInput,
  StartEpisodeOfCareInput,
  UpdateEpisodeClinicalContextInput,
} from "@/domain/episode-of-care/episode-of-care.types";
import { extractResourcesByType, extractSingleResource } from "@/lib/fhir/bundle-utils";
import { fhirClient } from "@/lib/fhir/client";
import { FhirClientError } from "@/lib/fhir/errors";
import {
  buildActiveEpisodeOfCareByPatientQuery,
  buildEpisodeOfCareByIncomingReferralQuery,
  buildEpisodeOfCareByPatientQuery,
} from "@/lib/fhir/search-params";
import type { FhirBundle } from "@/lib/fhir/types";

import { type FhirEpisodeOfCare } from "@/infrastructure/mappers/episode-of-care/episode-of-care-fhir.types";
import { mapFhirEpisodeOfCareToDomain } from "@/infrastructure/mappers/episode-of-care/episode-of-care-read.mapper";
import {
  applyFinishEpisodeOfCareToFhir,
  applyEpisodeClinicalContextToFhir,
  mapStartEpisodeOfCareInputToFhir,
} from "@/infrastructure/mappers/episode-of-care/episode-of-care-write.mapper";

function buildSearchPath(resourceType: string, query: string): string {
  return query ? `${resourceType}?${query}` : resourceType;
}

function getMostRecentEpisode(episodes: FhirEpisodeOfCare[]): FhirEpisodeOfCare | null {
  if (!episodes.length) {
    return null;
  }

  return episodes.reduce((latest, current) => {
    const latestStart = latest.period?.start ?? "";
    const currentStart = current.period?.start ?? "";

    return currentStart > latestStart ? current : latest;
  });
}

export async function getActiveEpisodeByPatientId(patientId: string): Promise<EpisodeOfCare | null> {
  if (!patientId.trim()) {
    return null;
  }

  const query = buildActiveEpisodeOfCareByPatientQuery(patientId);
  const bundle = await fhirClient.get<FhirBundle<FhirEpisodeOfCare>>(buildSearchPath("EpisodeOfCare", query));
  const episode = extractSingleResource<FhirEpisodeOfCare>(bundle, "EpisodeOfCare");

  return episode ? mapFhirEpisodeOfCareToDomain(episode) : null;
}

export async function getMostRecentEpisodeByPatientId(patientId: string): Promise<EpisodeOfCare | null> {
  if (!patientId.trim()) {
    return null;
  }

  const query = buildEpisodeOfCareByPatientQuery(patientId);
  const bundle = await fhirClient.get<FhirBundle<FhirEpisodeOfCare>>(buildSearchPath("EpisodeOfCare", query));
  const episodes = extractResourcesByType<FhirEpisodeOfCare>(bundle, "EpisodeOfCare");
  const mostRecent = getMostRecentEpisode(episodes);

  return mostRecent ? mapFhirEpisodeOfCareToDomain(mostRecent) : null;
}

export async function listEpisodeOfCareByPatientId(patientId: string): Promise<EpisodeOfCare[]> {
  if (!patientId.trim()) {
    return [];
  }

  const query = buildEpisodeOfCareByPatientQuery(patientId);
  const bundle = await fhirClient.get<FhirBundle<FhirEpisodeOfCare>>(buildSearchPath("EpisodeOfCare", query));
  const episodes = extractResourcesByType<FhirEpisodeOfCare>(bundle, "EpisodeOfCare");

  return episodes.map(mapFhirEpisodeOfCareToDomain);
}


export async function listEpisodeOfCareByIncomingReferral(serviceRequestId: string): Promise<EpisodeOfCare[]> {
  if (!serviceRequestId.trim()) {
    return [];
  }

  const query = buildEpisodeOfCareByIncomingReferralQuery(serviceRequestId);
  const bundle = await fhirClient.get<FhirBundle<FhirEpisodeOfCare>>(buildSearchPath("EpisodeOfCare", query));
  const episodes = extractResourcesByType<FhirEpisodeOfCare>(bundle, "EpisodeOfCare");

  return episodes.map(mapFhirEpisodeOfCareToDomain);
}

export async function getEpisodeById(episodeId: string): Promise<EpisodeOfCare | null> {
  if (!episodeId.trim()) {
    return null;
  }

  try {
    const episode = await fhirClient.get<FhirEpisodeOfCare>(`EpisodeOfCare/${episodeId}`);
    return mapFhirEpisodeOfCareToDomain(episode);
  } catch (error) {
    if (error instanceof FhirClientError && error.status === 404) {
      return null;
    }

    throw error;
  }
}

export async function createEpisodeOfCare(input: StartEpisodeOfCareInput): Promise<EpisodeOfCare> {
  const payload = mapStartEpisodeOfCareInputToFhir(input);
  const created = await fhirClient.post<FhirEpisodeOfCare>("EpisodeOfCare", payload);

  return mapFhirEpisodeOfCareToDomain(created);
}

export async function finishActiveEpisodeOfCare(input: FinishEpisodeOfCareInput): Promise<EpisodeOfCare | null> {
  const activeEpisode = await getActiveEpisodeByPatientId(input.patientId);

  if (!activeEpisode?.id) {
    return null;
  }

  const existing = await fhirClient.get<FhirEpisodeOfCare>(`EpisodeOfCare/${activeEpisode.id}`);
  const payload = applyFinishEpisodeOfCareToFhir(existing, {
    endDate: input.endDate,
    closureReason: input.closureReason,
    closureDetail: input.closureDetail,
  });
  const updated = await fhirClient.put<FhirEpisodeOfCare>(`EpisodeOfCare/${activeEpisode.id}`, payload);

  return mapFhirEpisodeOfCareToDomain(updated);
}

export async function updateEpisodeOfCareClinicalContext(
  input: UpdateEpisodeClinicalContextInput,
): Promise<EpisodeOfCare | null> {
  const episodeId = input.episodeId.trim();
  if (!episodeId) return null;

  const existing = await fhirClient.get<FhirEpisodeOfCare>(`EpisodeOfCare/${episodeId}`);
  const payload = applyEpisodeClinicalContextToFhir(existing, {
    diagnosisReferences: input.diagnosisReferences,
    clinicalContext: input.clinicalContext,
  });
  const updated = await fhirClient.put<FhirEpisodeOfCare>(`EpisodeOfCare/${episodeId}`, payload);
  return mapFhirEpisodeOfCareToDomain(updated);
}
