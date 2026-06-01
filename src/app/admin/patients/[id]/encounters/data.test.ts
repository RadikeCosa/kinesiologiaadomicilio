import { describe, expect, it, vi } from "vitest";

vi.mock("@/infrastructure/repositories/patient.repository", () => ({ getPatientById: vi.fn() }));
vi.mock("@/infrastructure/repositories/episode-of-care.repository", () => ({ getActiveEpisodeByPatientId: vi.fn(), getMostRecentEpisodeByPatientId: vi.fn() }));
vi.mock("@/infrastructure/repositories/encounter.repository", () => ({ listEncountersByPatientId: vi.fn() }));
vi.mock("@/infrastructure/repositories/observation.repository", () => ({ listFunctionalObservationsByEncounterIds: vi.fn() }));
vi.mock("@/app/admin/patients/[id]/clinical-context", () => ({ loadEpisodeClinicalContextReadModel: vi.fn() }));

import { loadPatientEncountersPageData } from "@/app/admin/patients/[id]/encounters/data";
import { listFunctionalObservationsByEncounterIds } from "@/infrastructure/repositories/observation.repository";
import { listEncountersByPatientId } from "@/infrastructure/repositories/encounter.repository";
import { getActiveEpisodeByPatientId, getMostRecentEpisodeByPatientId } from "@/infrastructure/repositories/episode-of-care.repository";
import { getPatientById } from "@/infrastructure/repositories/patient.repository";


describe("encounters data loader", () => {
  it("attaches functional observations by encounter id", async () => {
    vi.mocked(getPatientById).mockResolvedValue({ id: "pat-1", firstName: "A", lastName: "B", operationalStatus: "active" } as never);
    vi.mocked(getActiveEpisodeByPatientId).mockResolvedValue({ id: "ep-1", patientId: "pat-1", status: "active", startDate: "2026-01-01" } as never);
    vi.mocked(getMostRecentEpisodeByPatientId).mockResolvedValue(null);
    vi.mocked(listEncountersByPatientId).mockResolvedValue([{ id: "enc-1", patientId: "pat-1", episodeOfCareId: "ep-1", startedAt: "2026-02-01T10:00:00Z", endedAt: "2026-02-01T11:00:00Z", status: "finished" }]);
    vi.mocked(listFunctionalObservationsByEncounterIds).mockResolvedValue([{ id: "obs-1", patientId: "pat-1", encounterId: "enc-1", effectiveDateTime: "2026-02-01T10:00:00Z", code: "tug_seconds", value: 18.5, unit: "s", status: "final" }]);

    const data = await loadPatientEncountersPageData("pat-1");
    expect(data?.encounters[0].functionalObservations).toHaveLength(1);
  });

  it("uses EpisodeOfCare.startDate as baseline for first-visit stats", async () => {
    vi.mocked(getPatientById).mockResolvedValue({ id: "pat-1", firstName: "A", lastName: "B", operationalStatus: "active" } as never);
    vi.mocked(getActiveEpisodeByPatientId).mockResolvedValue({
      id: "ep-1",
      patientId: "pat-1",
      status: "active",
      startDate: "2026-05-03",
      serviceRequestId: "sr-1",
    } as never);
    vi.mocked(getMostRecentEpisodeByPatientId).mockResolvedValue(null);
    vi.mocked(listEncountersByPatientId).mockResolvedValue([
      {
        id: "enc-1",
        patientId: "pat-1",
        episodeOfCareId: "ep-1",
        startedAt: "2026-05-04T10:00:00Z",
        endedAt: "2026-05-04T11:00:00Z",
        status: "finished",
      },
    ]);
    vi.mocked(listFunctionalObservationsByEncounterIds).mockResolvedValue([]);

    const data = await loadPatientEncountersPageData("pat-1");

    expect(data?.activeEpisode?.startDate).toBe("2026-05-03");
    expect(data?.encounterStats.daysToFirstVisitFromEpisodeStart).toBe(1);
    expect(data?.encounterStats.isFirstVisitBeforeEpisodeStart).toBe(false);
  });


  it("does not mix previous finished episode metrics when active episode has no encounters", async () => {
    const closedEpisodeOld = { id: "episode-closed-old", patientId: "pat-1", status: "finished", startDate: "2026-01-01", endDate: "2026-01-31" };
    const closedEpisodeRecent = { id: "episode-closed-recent", patientId: "pat-1", status: "finished", startDate: "2026-02-01", endDate: "2026-02-28" };
    const activeEpisode = { id: "episode-active", patientId: "pat-1", status: "active", startDate: "2026-03-01" };

    vi.mocked(getPatientById).mockResolvedValue({ id: "pat-1", firstName: "A", lastName: "B", operationalStatus: "active" } as never);
    vi.mocked(getActiveEpisodeByPatientId).mockResolvedValue(activeEpisode as never);
    vi.mocked(getMostRecentEpisodeByPatientId).mockResolvedValue(closedEpisodeRecent as never);
    vi.mocked(listEncountersByPatientId).mockResolvedValue([
      { id: "enc-old", patientId: "pat-1", episodeOfCareId: closedEpisodeOld.id, startedAt: "2026-01-15T10:00:00Z", status: "finished" },
      { id: "enc-recent", patientId: "pat-1", episodeOfCareId: closedEpisodeRecent.id, startedAt: "2026-02-15T10:00:00Z", status: "finished" },
    ] as never);
    vi.mocked(listFunctionalObservationsByEncounterIds).mockResolvedValue([
      { id: "obs-old", patientId: "pat-1", encounterId: "enc-old", effectiveDateTime: "2026-01-15T10:00:00Z", code: "tug_seconds", value: 10, unit: "s", status: "final" },
      { id: "obs-recent", patientId: "pat-1", encounterId: "enc-recent", effectiveDateTime: "2026-02-15T10:00:00Z", code: "pain_nrs_0_10", value: 8, unit: "/10", status: "final" },
    ] as never);

    const data = await loadPatientEncountersPageData("pat-1");
    expect(data?.activeEpisode?.id).toBe(activeEpisode.id);
    expect(data?.mostRecentEpisode?.id).toBe(closedEpisodeRecent.id);
    expect(data?.encounters).toHaveLength(0);
    expect(data?.encounterStats.treatmentCount).toBe(0);
    expect(data?.functionalTrend).toEqual([]);
    expect(listFunctionalObservationsByEncounterIds).toHaveBeenCalledWith([]);
  });

  it("uses the selected active episode only when another active cycle also has encounters", async () => {
    const activeEpisodeOld = { id: "episode-active-old", patientId: "pat-1", status: "active", startDate: "2026-04-01" };
    const activeEpisodeRecent = { id: "episode-active-recent", patientId: "pat-1", status: "active", startDate: "2026-05-01" };

    vi.mocked(getPatientById).mockResolvedValue({ id: "pat-1", firstName: "A", lastName: "B", operationalStatus: "active" } as never);
    vi.mocked(getActiveEpisodeByPatientId).mockResolvedValue(activeEpisodeRecent as never);
    vi.mocked(getMostRecentEpisodeByPatientId).mockResolvedValue(activeEpisodeRecent as never);
    vi.mocked(listEncountersByPatientId).mockResolvedValue([
      { id: "enc-old-active", patientId: "pat-1", episodeOfCareId: activeEpisodeOld.id, startedAt: "2026-04-15T10:00:00Z", status: "finished" },
      { id: "enc-recent-active", patientId: "pat-1", episodeOfCareId: activeEpisodeRecent.id, startedAt: "2026-05-15T10:00:00Z", status: "finished" },
    ] as never);
    vi.mocked(listFunctionalObservationsByEncounterIds).mockResolvedValue([
      { id: "obs-old-active", patientId: "pat-1", encounterId: "enc-old-active", effectiveDateTime: "2026-04-15T10:00:00Z", code: "tug_seconds", value: 14, unit: "s", status: "final" },
      { id: "obs-recent-active", patientId: "pat-1", encounterId: "enc-recent-active", effectiveDateTime: "2026-05-15T10:00:00Z", code: "pain_nrs_0_10", value: 3, unit: "/10", status: "final" },
    ] as never);

    const data = await loadPatientEncountersPageData("pat-1");

    expect(data?.activeEpisode?.id).toBe(activeEpisodeRecent.id);
    expect(data?.encounters.map((encounter) => encounter.id)).toEqual(["enc-recent-active"]);
    expect(data?.encounters[0]?.functionalObservations).toEqual([
      expect.objectContaining({ id: "obs-recent-active" }),
    ]);
    expect(listFunctionalObservationsByEncounterIds).toHaveBeenCalledWith(["enc-recent-active"]);
  });

  it("filters out observations from another patient and outside effective encounter set", async () => {
    vi.mocked(getPatientById).mockResolvedValue({ id: "pat-1", firstName: "A", lastName: "B", operationalStatus: "active" } as never);
    vi.mocked(getActiveEpisodeByPatientId).mockResolvedValue({ id: "ep-1", patientId: "pat-1", status: "active", startDate: "2026-01-01" } as never);
    vi.mocked(getMostRecentEpisodeByPatientId).mockResolvedValue(null);
    vi.mocked(listEncountersByPatientId).mockResolvedValue([
      { id: "enc-1", patientId: "pat-1", episodeOfCareId: "ep-1", startedAt: "2026-02-01T10:00:00Z", status: "finished" } as never,
    ]);
    vi.mocked(listFunctionalObservationsByEncounterIds).mockResolvedValue([
      { id: "obs-1", patientId: "pat-1", encounterId: "enc-1", effectiveDateTime: "2026-02-01T10:00:00Z", code: "tug_seconds", value: 12, unit: "s", status: "final" },
      { id: "obs-2", patientId: "pat-2", encounterId: "enc-1", effectiveDateTime: "2026-02-01T10:00:00Z", code: "pain_nrs_0_10", value: 8, unit: "/10", status: "final" },
      { id: "obs-3", patientId: "pat-1", encounterId: "enc-out", effectiveDateTime: "2026-02-01T10:00:00Z", code: "standing_tolerance_minutes", value: 15, unit: "min", status: "final" },
    ] as never);

    const data = await loadPatientEncountersPageData("pat-1");

    expect(data?.encounters[0]?.functionalObservations).toEqual([
      expect.objectContaining({ id: "obs-1" }),
    ]);
    expect(listFunctionalObservationsByEncounterIds).toHaveBeenCalledTimes(1);
    expect(listFunctionalObservationsByEncounterIds).toHaveBeenCalledWith(["enc-1"]);
  });

  it("keeps latest per code by effectiveDateTime and handles partial data", async () => {
    vi.mocked(getPatientById).mockResolvedValue({ id: "pat-1", firstName: "A", lastName: "B", operationalStatus: "active" } as never);
    vi.mocked(getActiveEpisodeByPatientId).mockResolvedValue({ id: "ep-1", patientId: "pat-1", status: "active", startDate: "2026-01-01" } as never);
    vi.mocked(getMostRecentEpisodeByPatientId).mockResolvedValue(null);
    vi.mocked(listEncountersByPatientId).mockResolvedValue([{ id: "enc-1", patientId: "pat-1", episodeOfCareId: "ep-1", startedAt: "2026-02-01T10:00:00Z", status: "finished" } as never]);
    vi.mocked(listFunctionalObservationsByEncounterIds).mockResolvedValue([
      { id: "obs-old", patientId: "pat-1", encounterId: "enc-1", effectiveDateTime: "2026-02-01T10:00:00Z", code: "tug_seconds", value: 15, unit: "s", status: "final" },
      { id: "obs-new", patientId: "pat-1", encounterId: "enc-1", effectiveDateTime: "2026-02-01T11:00:00Z", code: "tug_seconds", value: 11, unit: "s", status: "final" },
      { id: "obs-pain", patientId: "pat-1", encounterId: "enc-1", effectiveDateTime: "2026-02-01T11:00:00Z", code: "pain_nrs_0_10", value: 4, unit: "/10", status: "final" },
    ] as never);

    const data = await loadPatientEncountersPageData("pat-1");
    expect(data?.encounters[0]?.functionalObservations).toHaveLength(2);
    expect(data?.encounters[0]?.functionalObservations.find((item) => item.code === "tug_seconds")?.value).toBe(11);
  });

});
