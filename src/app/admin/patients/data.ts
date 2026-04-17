import { mapEpisodeOfCareRead } from "@/infrastructure/mappers/episode-of-care/episode-of-care-read.mapper";
import { mapPatientToListItemReadModel } from "@/infrastructure/mappers/patient/patient-read.mapper";
import {
  getActiveEpisodeByPatientId,
  getMostRecentEpisodeByPatientId,
} from "@/infrastructure/repositories/episode-of-care.repository";
import { listPatients } from "@/infrastructure/repositories/patient.repository";
import type { PatientListItemReadModel } from "@/features/patients/read-models/patient-list-item.read-model";

export async function loadPatientsList(): Promise<PatientListItemReadModel[]> {
  const patients = await listPatients();

  const patientList = await Promise.all(
    patients.map(async (patient) => {
      const activeEpisode = await getActiveEpisodeByPatientId(patient.id);
      const latestEpisode = activeEpisode ?? (await getMostRecentEpisodeByPatientId(patient.id));

      return mapPatientToListItemReadModel(patient, {
        activeEpisode: activeEpisode ? mapEpisodeOfCareRead(activeEpisode) : null,
        latestEpisode: latestEpisode ? mapEpisodeOfCareRead(latestEpisode) : null,
      });
    }),
  );

  return patientList;
}
