import type { EncounterStats } from "@/domain/encounter/encounter-stats";
import { calculateEncounterStats } from "@/domain/encounter/encounter-stats";
import type { Encounter } from "@/domain/encounter/encounter.types";
import type { EpisodeOfCare } from "@/domain/episode-of-care/episode-of-care.types";
import { selectPatientEpisodes } from "@/domain/episode-of-care/episode-of-care.selectors";
import { getPatientOperationalStatus } from "@/domain/patient/patient.rules";
import type { PatientOperationalStatus } from "@/domain/patient/patient.types";
import { listEncountersByPatientId } from "@/infrastructure/repositories/encounter.repository";
import { listFunctionalObservationsByEncounterIds } from "@/infrastructure/repositories/observation.repository";
import {
  getActiveEpisodeByPatientId,
  getMostRecentEpisodeByPatientId,
} from "@/infrastructure/repositories/episode-of-care.repository";
import { getPatientById } from "@/infrastructure/repositories/patient.repository";
import { loadEpisodeClinicalContextReadModel, type EpisodeClinicalContextReadModel } from "@/app/admin/patients/[id]/clinical-context";
import { buildFunctionalTrendSummary, type FunctionalObservationTrendSummary } from "@/app/admin/patients/[id]/encounters/functional-trend";

export interface PatientEncountersPageData {
  patient: {
    id: string;
    fullName: string;
    dni?: string;
    birthDate?: string;
    operationalStatus: PatientOperationalStatus;
  };
  activeEpisode: EpisodeOfCare | null;
  mostRecentEpisode: EpisodeOfCare | null;
  encounters: Encounter[];
  encounterStats: EncounterStats;
  clinicalContext: EpisodeClinicalContextReadModel | null;
  functionalTrend: FunctionalObservationTrendSummary[];
}

function buildFullName(patient: { firstName: string; lastName: string }): string {
  return `${patient.firstName} ${patient.lastName}`.trim();
}

function getOccurrenceTimestamp(value: string | undefined): number {
  if (!value) {
    return Number.NEGATIVE_INFINITY;
  }

  const timestamp = new Date(value).getTime();

  if (Number.isNaN(timestamp)) {
    return Number.NEGATIVE_INFINITY;
  }

  return timestamp;
}

function sortByMostRecentEncounter(encounters: Encounter[]): Encounter[] {
  return [...encounters].sort((a, b) => {
    const diff = getOccurrenceTimestamp(b.startedAt) - getOccurrenceTimestamp(a.startedAt);

    if (diff !== 0) {
      return diff;
    }

    return b.startedAt.localeCompare(a.startedAt);
  });
}

export async function loadPatientEncountersPageData(patientId: string): Promise<PatientEncountersPageData | null> {
  const patient = await getPatientById(patientId);

  if (!patient) {
    return null;
  }

  const [activeEpisode, mostRecentEpisode, encounters] = await Promise.all([
    getActiveEpisodeByPatientId(patient.id),
    getMostRecentEpisodeByPatientId(patient.id),
    listEncountersByPatientId(patient.id),
  ]);

  const { effectiveEpisode } = selectPatientEpisodes(
    [activeEpisode, mostRecentEpisode].filter((episode): episode is EpisodeOfCare => Boolean(episode)),
  );
  const scopedEncounters = effectiveEpisode
    ? encounters.filter((encounter) => encounter.episodeOfCareId === effectiveEpisode.id)
    : [];
  const sortedEncounters = sortByMostRecentEncounter(scopedEncounters);
  const effectiveEncounterIds = new Set(sortedEncounters.map((encounter) => encounter.id));
  const scopedObservations = (await listFunctionalObservationsByEncounterIds(Array.from(effectiveEncounterIds))).filter((observation) => (
    observation.patientId === patient.id
    && effectiveEncounterIds.has(observation.encounterId)
  ));
  const functionalObservationsByEncounterId = new Map<string, Encounter["functionalObservations"]>();

  scopedObservations.forEach((observation) => {
    const encounterObservations = functionalObservationsByEncounterId.get(observation.encounterId) ?? [];
    const deduped = new Map<string, (typeof encounterObservations)[number]>();

    encounterObservations.forEach((existing) => {
      deduped.set(existing.code, existing);
    });

    {
      const existing = deduped.get(observation.code);
      if (!existing || new Date(observation.effectiveDateTime).getTime() >= new Date(existing.effectiveDateTime).getTime()) {
        deduped.set(observation.code, observation);
      }
    }

    functionalObservationsByEncounterId.set(observation.encounterId, Array.from(deduped.values()));
  });
  const encountersWithFunctional = sortedEncounters.map((encounter) => ({
    ...encounter,
    functionalObservations: functionalObservationsByEncounterId.get(encounter.id) ?? [],
  }));

  const clinicalContext = await loadEpisodeClinicalContextReadModel(effectiveEpisode);

  return {
    patient: {
      id: patient.id,
      fullName: buildFullName(patient),
      dni: patient.dni,
      birthDate: patient.birthDate,
      operationalStatus: getPatientOperationalStatus({
        patient,
        hasActiveEpisode: Boolean(activeEpisode),
        hasFinishedEpisode: mostRecentEpisode?.status === "finished",
      }),
    },
    activeEpisode,
    mostRecentEpisode,
    encounters: encountersWithFunctional,
    encounterStats: calculateEncounterStats({
      encounters: encountersWithFunctional,
      episodeOfCareId: effectiveEpisode?.id,
      episodeStartDate: effectiveEpisode?.startDate,
    }),
    clinicalContext,
    functionalTrend: buildFunctionalTrendSummary(encountersWithFunctional),
  };
}
