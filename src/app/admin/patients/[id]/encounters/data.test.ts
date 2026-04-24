import { describe, expect, it, vi } from "vitest";

import { loadPatientEncountersPageData } from "@/app/admin/patients/[id]/encounters/data";

vi.mock("@/infrastructure/repositories/patient.repository", () => ({
  getPatientById: vi.fn(),
}));

vi.mock("@/infrastructure/repositories/episode-of-care.repository", () => ({
  getActiveEpisodeByPatientId: vi.fn(),
  getMostRecentEpisodeByPatientId: vi.fn(),
}));

vi.mock("@/infrastructure/repositories/encounter.repository", () => ({
  listEncountersByPatientId: vi.fn(),
}));

import { listEncountersByPatientId } from "@/infrastructure/repositories/encounter.repository";
import {
  getActiveEpisodeByPatientId,
  getMostRecentEpisodeByPatientId,
} from "@/infrastructure/repositories/episode-of-care.repository";
import { getPatientById } from "@/infrastructure/repositories/patient.repository";

describe("loadPatientEncountersPageData", () => {
  it("returns null when patient does not exist", async () => {
    vi.mocked(getPatientById).mockResolvedValue(null);

    const data = await loadPatientEncountersPageData("pat-999");

    expect(data).toBeNull();
  });

  it("loads patient context, active episode and encounters sorted by date desc", async () => {
    vi.mocked(getPatientById).mockResolvedValue({
      id: "pat-1",
      firstName: "Ana",
      lastName: "Pérez",
      createdAt: "2026-04-17T12:00:00.000Z",
      updatedAt: "2026-04-17T12:00:00.000Z",
    });

    vi.mocked(getActiveEpisodeByPatientId).mockResolvedValue({
      id: "epi-1",
      patientId: "pat-1",
      status: "active",
      startDate: "2026-04-01",
    });
    vi.mocked(getMostRecentEpisodeByPatientId).mockResolvedValue({
      id: "epi-1",
      patientId: "pat-1",
      status: "active",
      startDate: "2026-04-01",
    });

    vi.mocked(listEncountersByPatientId).mockResolvedValue([
      {
        id: "enc-1",
        patientId: "pat-1",
        episodeOfCareId: "epi-1",
        occurrenceDate: "2026-04-15T10:30:00Z",
        status: "finished",
      },
      {
        id: "enc-2",
        patientId: "pat-1",
        episodeOfCareId: "epi-1",
        occurrenceDate: "2026-04-17T08:00:00Z",
        status: "finished",
      },
    ]);

    const data = await loadPatientEncountersPageData("pat-1");

    expect(getActiveEpisodeByPatientId).toHaveBeenCalledWith("pat-1");
    expect(getMostRecentEpisodeByPatientId).toHaveBeenCalledWith("pat-1");
    expect(listEncountersByPatientId).toHaveBeenCalledWith("pat-1");
    expect(data).not.toBeNull();
    expect(data?.patient.fullName).toBe("Ana Pérez");
    expect(data?.activeEpisode?.id).toBe("epi-1");
    expect(data?.mostRecentEpisode?.id).toBe("epi-1");
    expect(data?.encounters.map((item) => item.id)).toEqual(["enc-2", "enc-1"]);
  });
});
