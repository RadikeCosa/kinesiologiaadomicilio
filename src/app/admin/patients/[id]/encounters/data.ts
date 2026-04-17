import type { Encounter } from "@/domain/encounter/encounter.types";
import type { EpisodeOfCare } from "@/domain/episode-of-care/episode-of-care.types";
import { listEncountersByPatientId } from "@/infrastructure/repositories/encounter.repository";
import { getActiveEpisodeByPatientId } from "@/infrastructure/repositories/episode-of-care.repository";
import { getPatientById } from "@/infrastructure/repositories/patient.repository";

export interface PatientEncountersPageData {
  patient: {
    id: string;
    fullName: string;
  };
  activeEpisode: EpisodeOfCare | null;
  encounters: Encounter[];
}

function buildFullName(patient: { firstName: string; lastName: string }): string {
  return `${patient.firstName} ${patient.lastName}`.trim();
}

function sortByMostRecentEncounter(encounters: Encounter[]): Encounter[] {
  return [...encounters].sort((a, b) => b.occurrenceDate.localeCompare(a.occurrenceDate));
}

export async function loadPatientEncountersPageData(patientId: string): Promise<PatientEncountersPageData | null> {
  const patient = await getPatientById(patientId);

  if (!patient) {
    return null;
  }

  const [activeEpisode, encounters] = await Promise.all([
    getActiveEpisodeByPatientId(patient.id),
    listEncountersByPatientId(patient.id),
  ]);

  return {
    patient: {
      id: patient.id,
      fullName: buildFullName(patient),
    },
    activeEpisode,
    encounters: sortByMostRecentEncounter(encounters),
  };
}
