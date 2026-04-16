import { beforeEach } from "vitest";

import { __resetEpisodeOfCareRepositoryForTests } from "@/infrastructure/repositories/episode-of-care.repository";
import { __resetPatientRepositoryForTests } from "@/infrastructure/repositories/patient.repository";

beforeEach(() => {
  __resetPatientRepositoryForTests();
  __resetEpisodeOfCareRepositoryForTests();
});
