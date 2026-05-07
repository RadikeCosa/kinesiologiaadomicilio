import { describe, expect, it, vi } from "vitest";

vi.mock("@/infrastructure/repositories/patient.repository", () => ({ getPatientById: vi.fn() }));
vi.mock("@/infrastructure/repositories/episode-of-care.repository", () => ({ getActiveEpisodeByPatientId: vi.fn(), getMostRecentEpisodeByPatientId: vi.fn() }));
vi.mock("@/infrastructure/repositories/encounter.repository", () => ({ listEncountersByPatientId: vi.fn() }));
vi.mock("@/infrastructure/repositories/observation.repository", () => ({ listFunctionalObservationsByEncounterId: vi.fn() }));
vi.mock("@/app/admin/patients/[id]/clinical-context", () => ({ loadEpisodeClinicalContextReadModel: vi.fn() }));

import { loadPatientEncountersPageData } from "@/app/admin/patients/[id]/encounters/data";
import { listFunctionalObservationsByEncounterId } from "@/infrastructure/repositories/observation.repository";
import { listEncountersByPatientId } from "@/infrastructure/repositories/encounter.repository";
import { getActiveEpisodeByPatientId, getMostRecentEpisodeByPatientId } from "@/infrastructure/repositories/episode-of-care.repository";
import { getPatientById } from "@/infrastructure/repositories/patient.repository";


describe("encounters data loader", () => {
  it("attaches functional observations by encounter id", async () => {
    vi.mocked(getPatientById).mockResolvedValue({ id: "pat-1", firstName: "A", lastName: "B", operationalStatus: "active" } as never);
    vi.mocked(getActiveEpisodeByPatientId).mockResolvedValue({ id: "ep-1", patientId: "pat-1", status: "active", startDate: "2026-01-01" } as never);
    vi.mocked(getMostRecentEpisodeByPatientId).mockResolvedValue(null);
    vi.mocked(listEncountersByPatientId).mockResolvedValue([{ id: "enc-1", patientId: "pat-1", episodeOfCareId: "ep-1", startedAt: "2026-02-01T10:00:00Z", endedAt: "2026-02-01T11:00:00Z", status: "finished" }]);
    vi.mocked(listFunctionalObservationsByEncounterId).mockResolvedValue([{ id: "obs-1", patientId: "pat-1", encounterId: "enc-1", effectiveDateTime: "2026-02-01T10:00:00Z", code: "tug_seconds", value: 18.5, unit: "s", status: "final" }]);

    const data = await loadPatientEncountersPageData("pat-1");
    expect(data?.encounters[0].functionalObservations).toHaveLength(1);
  });
});
