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

  it("loads patient context, stats and encounters sorted by date desc", async () => {
    vi.mocked(getPatientById).mockResolvedValue({
      id: "pat-1",
      firstName: "Ana",
      lastName: "Pérez",
      dni: "30111222",
      birthDate: "1990-01-01",
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
        startedAt: "2026-04-15T10:30:00Z",
        endedAt: "2026-04-15T11:00:00Z",
        status: "finished",
      },
      {
        id: "enc-2",
        patientId: "pat-1",
        episodeOfCareId: "epi-2",
        startedAt: "2026-04-17T08:00:00Z",
        status: "finished",
      },
    ]);

    const data = await loadPatientEncountersPageData("pat-1");

    expect(getActiveEpisodeByPatientId).toHaveBeenCalledWith("pat-1");
    expect(getMostRecentEpisodeByPatientId).toHaveBeenCalledWith("pat-1");
    expect(listEncountersByPatientId).toHaveBeenCalledWith("pat-1");
    expect(data).not.toBeNull();
    expect(data?.patient.fullName).toBe("Ana Pérez");
    expect(data?.patient.operationalStatus).toBe("active_treatment");
    expect(data?.activeEpisode?.id).toBe("epi-1");
    expect(data?.mostRecentEpisode?.id).toBe("epi-1");
    expect(data?.encounters.map((item) => item.id)).toEqual(["enc-2", "enc-1"]);
    expect(data?.encounterStats.totalCount).toBe(2);
    expect(data?.encounterStats.treatmentCount).toBe(1);
  });

  it("sorts encounters by real time when offsets differ", async () => {
    vi.mocked(getPatientById).mockResolvedValue({
      id: "pat-1",
      firstName: "Ana",
      lastName: "Pérez",
      createdAt: "2026-04-17T12:00:00.000Z",
      updatedAt: "2026-04-17T12:00:00.000Z",
    });
    vi.mocked(getActiveEpisodeByPatientId).mockResolvedValue(null);
    vi.mocked(getMostRecentEpisodeByPatientId).mockResolvedValue(null);

    vi.mocked(listEncountersByPatientId).mockResolvedValue([
      {
        id: "enc-z",
        patientId: "pat-1",
        episodeOfCareId: "epi-1",
        startedAt: "2026-04-24T10:00:00Z",
        status: "finished",
      },
      {
        id: "enc-minus-03",
        patientId: "pat-1",
        episodeOfCareId: "epi-1",
        startedAt: "2026-04-24T07:30:00-03:00",
        status: "finished",
      },
      {
        id: "enc-plus-00",
        patientId: "pat-1",
        episodeOfCareId: "epi-1",
        startedAt: "2026-04-24T11:00:00+00:00",
        status: "finished",
      },
    ]);

    const data = await loadPatientEncountersPageData("pat-1");

    expect(data?.encounters.map((item) => item.id)).toEqual([
      "enc-plus-00",
      "enc-minus-03",
      "enc-z",
    ]);
  });

  it("keeps rendering order stable with invalid or missing startedAt values", async () => {
    vi.mocked(getPatientById).mockResolvedValue({
      id: "pat-1",
      firstName: "Ana",
      lastName: "Pérez",
      createdAt: "2026-04-17T12:00:00.000Z",
      updatedAt: "2026-04-17T12:00:00.000Z",
    });
    vi.mocked(getActiveEpisodeByPatientId).mockResolvedValue(null);
    vi.mocked(getMostRecentEpisodeByPatientId).mockResolvedValue(null);

    vi.mocked(listEncountersByPatientId).mockResolvedValue([
      {
        id: "enc-valid",
        patientId: "pat-1",
        episodeOfCareId: "epi-1",
        startedAt: "2026-04-24T11:00:00+00:00",
        status: "finished",
      },
      {
        id: "enc-missing",
        patientId: "pat-1",
        episodeOfCareId: "epi-1",
        startedAt: "",
        status: "finished",
      },
      {
        id: "enc-invalid",
        patientId: "pat-1",
        episodeOfCareId: "epi-1",
        startedAt: "invalid-date",
        status: "finished",
      },
    ]);

    const data = await loadPatientEncountersPageData("pat-1");

    expect(data?.encounters.map((item) => item.id)).toEqual([
      "enc-valid",
      "enc-missing",
      "enc-invalid",
    ]);
  });

  it("prioritizes active episode over most recent episode for treatmentCount", async () => {
    vi.mocked(getPatientById).mockResolvedValue({
      id: "pat-1",
      firstName: "Ana",
      lastName: "Pérez",
      createdAt: "2026-04-17T12:00:00.000Z",
      updatedAt: "2026-04-17T12:00:00.000Z",
    });
    vi.mocked(getActiveEpisodeByPatientId).mockResolvedValue({
      id: "epi-active",
      patientId: "pat-1",
      status: "active",
      startDate: "2026-04-10",
    });
    vi.mocked(getMostRecentEpisodeByPatientId).mockResolvedValue({
      id: "epi-recent",
      patientId: "pat-1",
      status: "finished",
      startDate: "2026-04-01",
      endDate: "2026-04-09",
    });
    vi.mocked(listEncountersByPatientId).mockResolvedValue([
      {
        id: "enc-active",
        patientId: "pat-1",
        episodeOfCareId: "epi-active",
        startedAt: "2026-04-12T10:00:00Z",
        status: "finished",
      },
      {
        id: "enc-recent",
        patientId: "pat-1",
        episodeOfCareId: "epi-recent",
        startedAt: "2026-04-08T10:00:00Z",
        status: "finished",
      },
    ]);

    const data = await loadPatientEncountersPageData("pat-1");

    expect(data?.activeEpisode?.id).toBe("epi-active");
    expect(data?.mostRecentEpisode?.id).toBe("epi-recent");
    expect(data?.encounterStats.treatmentCount).toBe(1);
  });

  it("uses most recent finished episode for treatmentCount when there is no active episode", async () => {
    vi.mocked(getPatientById).mockResolvedValue({
      id: "pat-1",
      firstName: "Ana",
      lastName: "Pérez",
      createdAt: "2026-04-17T12:00:00.000Z",
      updatedAt: "2026-04-17T12:00:00.000Z",
    });
    vi.mocked(getActiveEpisodeByPatientId).mockResolvedValue(null);
    vi.mocked(getMostRecentEpisodeByPatientId).mockResolvedValue({
      id: "epi-finished",
      patientId: "pat-1",
      status: "finished",
      startDate: "2026-03-01",
      endDate: "2026-03-30",
    });
    vi.mocked(listEncountersByPatientId).mockResolvedValue([
      {
        id: "enc-1",
        patientId: "pat-1",
        episodeOfCareId: "epi-finished",
        startedAt: "2026-03-20T10:00:00Z",
        status: "finished",
      },
      {
        id: "enc-2",
        patientId: "pat-1",
        episodeOfCareId: "epi-other",
        startedAt: "2026-03-22T10:00:00Z",
        status: "finished",
      },
    ]);

    const data = await loadPatientEncountersPageData("pat-1");

    expect(data?.activeEpisode).toBeNull();
    expect(data?.mostRecentEpisode?.status).toBe("finished");
    expect(data?.encounterStats.treatmentCount).toBe(1);
  });

  it("returns treatmentCount 0 when patient has no treatment", async () => {
    vi.mocked(getPatientById).mockResolvedValue({
      id: "pat-1",
      firstName: "Ana",
      lastName: "Pérez",
      createdAt: "2026-04-17T12:00:00.000Z",
      updatedAt: "2026-04-17T12:00:00.000Z",
    });
    vi.mocked(getActiveEpisodeByPatientId).mockResolvedValue(null);
    vi.mocked(getMostRecentEpisodeByPatientId).mockResolvedValue(null);
    vi.mocked(listEncountersByPatientId).mockResolvedValue([
      {
        id: "enc-1",
        patientId: "pat-1",
        episodeOfCareId: "epi-orphan",
        startedAt: "2026-04-17T08:00:00Z",
        status: "finished",
      },
    ]);

    const data = await loadPatientEncountersPageData("pat-1");

    expect(data?.encounterStats.treatmentCount).toBe(0);
  });
});
