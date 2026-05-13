import { mapEpisodeOfCareRead } from "@/infrastructure/mappers/episode-of-care/episode-of-care-read.mapper";
import { mapPatientToListItemReadModel } from "@/infrastructure/mappers/patient/patient-read.mapper";
import {
  getMostRecentEpisode,
  listEpisodesByPatientIds,
} from "@/infrastructure/repositories/episode-of-care.repository";
import { listPatients } from "@/infrastructure/repositories/patient.repository";
import type { PatientListItemReadModel } from "@/features/patients/read-models/patient-list-item.read-model";

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

  return patients.map((patient) => {
    const patientEpisodes = episodesByPatientId.get(patient.id) ?? [];
    const activeEpisode = patientEpisodes.find((episode) => episode.status === "active") ?? null;
    const latestEpisode = activeEpisode ?? getMostRecentEpisode(patientEpisodes);

    return mapPatientToListItemReadModel(patient, {
      activeEpisode: activeEpisode ? mapEpisodeOfCareRead(activeEpisode) : null,
      latestEpisode: latestEpisode ? mapEpisodeOfCareRead(latestEpisode) : null,
    });
  });
}
