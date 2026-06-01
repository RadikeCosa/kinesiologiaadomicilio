import { mapEpisodeOfCareRead } from "@/infrastructure/mappers/episode-of-care/episode-of-care-read.mapper";
import { mapPatientToListItemReadModel } from "@/infrastructure/mappers/patient/patient-read.mapper";
import {
  getMostRecentEpisode,
  listEpisodesByPatientIds,
} from "@/infrastructure/repositories/episode-of-care.repository";
import { listPatients } from "@/infrastructure/repositories/patient.repository";
import type { PatientListItemReadModel } from "@/features/patients/read-models/patient-list-item.read-model";
import type { PatientOperationalStatus } from "@/domain/patient/patient.types";

const OPERATIONAL_STATUS_PRIORITY: Record<PatientOperationalStatus, number> = {
  active_treatment: 0,
  ready_to_start: 1,
  preliminary: 2,
  finished_treatment: 3,
};

function sortPatientsList(
  patients: PatientListItemReadModel[],
): PatientListItemReadModel[] {
  return [...patients].sort((first, second) => {
    const statusOrder =
      OPERATIONAL_STATUS_PRIORITY[first.operationalStatus] -
      OPERATIONAL_STATUS_PRIORITY[second.operationalStatus];

    if (statusOrder !== 0) {
      return statusOrder;
    }

    return first.fullName.localeCompare(second.fullName, "es", {
      sensitivity: "base",
    });
  });
}

export async function loadPatientsList(): Promise<PatientListItemReadModel[]> {
  const patients = await listPatients();
  const episodes = await listEpisodesByPatientIds(patients.map((patient) => patient.id));

  const episodesByPatientId = new Map<string, typeof episodes>();
  for (const episode of episodes) {
    const patientId = episode.patientId.trim();
    if (!patientId) continue;

    const existing = episodesByPatientId.get(patientId);
    if (existing) {
      existing.push(episode);
      continue;
    }

    episodesByPatientId.set(patientId, [episode]);
  }

  const patientList = patients.map((patient) => {
    const patientEpisodes = episodesByPatientId.get(patient.id) ?? [];
    const activeEpisode = patientEpisodes.find((episode) => episode.status === "active") ?? null;
    const latestEpisode = activeEpisode ?? getMostRecentEpisode(patientEpisodes);

    return mapPatientToListItemReadModel(patient, {
      activeEpisode: activeEpisode ? mapEpisodeOfCareRead(activeEpisode) : null,
      latestEpisode: latestEpisode ? mapEpisodeOfCareRead(latestEpisode) : null,
    });
  });

  return sortPatientsList(patientList);
}
