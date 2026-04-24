import type { Encounter } from "@/domain/encounter/encounter.types";
import type { EpisodeOfCare } from "@/domain/episode-of-care/episode-of-care.types";
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
  };
  activeEpisode: EpisodeOfCare | null;
  mostRecentEpisode: EpisodeOfCare | null;
  encounters: Encounter[];
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
    const diff = getOccurrenceTimestamp(b.occurrenceDate) - getOccurrenceTimestamp(a.occurrenceDate);

    if (diff !== 0) {
      return diff;
    }

    return b.occurrenceDate.localeCompare(a.occurrenceDate);
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

  return {
    patient: {
      id: patient.id,
      fullName: buildFullName(patient),
    },
    activeEpisode,
    mostRecentEpisode,
    encounters: sortByMostRecentEncounter(encounters),
  };
}
