import type { EncounterStats } from "@/domain/encounter/encounter-stats";
import { calculateEncounterStats } from "@/domain/encounter/encounter-stats";
import type { Encounter } from "@/domain/encounter/encounter.types";
import type { EpisodeOfCare } from "@/domain/episode-of-care/episode-of-care.types";
import { getPatientOperationalStatus } from "@/domain/patient/patient.rules";
import type { PatientOperationalStatus } from "@/domain/patient/patient.types";
import { listEncountersByPatientId } from "@/infrastructure/repositories/encounter.repository";
import {
  getActiveEpisodeByPatientId,
  getMostRecentEpisodeByPatientId,
} from "@/infrastructure/repositories/episode-of-care.repository";
import { getPatientById } from "@/infrastructure/repositories/patient.repository";

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

function resolveEffectiveEpisode(params: {
  activeEpisode: EpisodeOfCare | null;
  mostRecentEpisode: EpisodeOfCare | null;
}): EpisodeOfCare | null {
  return params.activeEpisode ?? params.mostRecentEpisode;
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

  const sortedEncounters = sortByMostRecentEncounter(encounters);
  const effectiveEpisode = resolveEffectiveEpisode({ activeEpisode, mostRecentEpisode });

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
    encounters: sortedEncounters,
    encounterStats: calculateEncounterStats({
      encounters: sortedEncounters,
      episodeOfCareId: effectiveEpisode?.id,
      episodeStartDate: effectiveEpisode?.startDate,
    }),
  };
}
