import type { PatientDetailReadModel } from "@/features/patients/read-models/patient-detail.read-model";
import { mapEpisodeOfCareRead } from "@/infrastructure/mappers/episode-of-care/episode-of-care-read.mapper";
import { mapPatientToDetailReadModel } from "@/infrastructure/mappers/patient/patient-read.mapper";
import {
  getActiveEpisodeByPatientId,
  getMostRecentEpisodeByPatientId,
} from "@/infrastructure/repositories/episode-of-care.repository";
import { getPatientById } from "@/infrastructure/repositories/patient.repository";

export async function loadPatientDetail(id: string): Promise<PatientDetailReadModel | null> {
  const patient = await getPatientById(id);

  if (!patient) {
    return null;
  }

  const activeEpisode = await getActiveEpisodeByPatientId(patient.id);
  const latestEpisode = activeEpisode ?? (await getMostRecentEpisodeByPatientId(patient.id));

  return mapPatientToDetailReadModel(patient, {
    activeEpisode: activeEpisode ? mapEpisodeOfCareRead(activeEpisode) : null,
    latestEpisode: latestEpisode ? mapEpisodeOfCareRead(latestEpisode) : null,
  });
}
