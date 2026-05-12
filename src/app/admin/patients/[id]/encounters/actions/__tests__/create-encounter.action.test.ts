import { describe, expect, it, vi } from "vitest";

import { createEncounterAction } from "@/app/admin/patients/[id]/encounters/actions/create-encounter.action";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/infrastructure/repositories/episode-of-care.repository", () => ({
  getActiveEpisodeByPatientId: vi.fn(),
}));

vi.mock("@/infrastructure/repositories/encounter.repository", () => ({
  createEncounter: vi.fn(),
}));
vi.mock("@/infrastructure/repositories/observation.repository", () => ({
  createFunctionalObservation: vi.fn(),
}));

import { createEncounter } from "@/infrastructure/repositories/encounter.repository";
import { createFunctionalObservation } from "@/infrastructure/repositories/observation.repository";
import { getActiveEpisodeByPatientId } from "@/infrastructure/repositories/episode-of-care.repository";
import { revalidatePath } from "next/cache";

describe("createEncounterAction", () => {
  it("returns ok:false and does not create observations when encounter creation fails", async () => {
    vi.mocked(getActiveEpisodeByPatientId).mockResolvedValue({ id: "epi-1", patientId: "pat-1", status: "active", startDate: "2026-04-01" });
    vi.mocked(createEncounter).mockRejectedValue(new Error("FHIR post Encounter failed"));

    const result = await createEncounterAction({
      patientId: "pat-1",
      episodeOfCareId: "epi-1",
      startedAt: "2026-04-17T10:30",
      endedAt: "2026-04-17T11:00",
      tugSeconds: 18.5,
    });

    expect(result).toEqual({
      ok: false,
      message: "FHIR post Encounter failed",
    });
    expect(createFunctionalObservation).not.toHaveBeenCalled();
  });

  it("fails when endedAt is missing in new create payload", async () => {
    const result = await createEncounterAction({
      patientId: "pat-1",
      episodeOfCareId: "epi-1",
      startedAt: "2026-04-17T10:30",
    });

    expect(result).toEqual({
      ok: false,
      message: "endedAt: es obligatorio.",
    });
    expect(getActiveEpisodeByPatientId).not.toHaveBeenCalled();
    expect(createEncounter).not.toHaveBeenCalled();
  });

  it("fails when endedAt is before startedAt", async () => {
    const result = await createEncounterAction({
      patientId: "pat-1",
      episodeOfCareId: "epi-1",
      startedAt: "2026-04-17T10:30",
      endedAt: "2026-04-17T10:00",
    });

    expect(result).toEqual({
      ok: false,
      message: "endedAt: debe ser igual o posterior al inicio.",
    });
    expect(getActiveEpisodeByPatientId).not.toHaveBeenCalled();
    expect(createEncounter).not.toHaveBeenCalled();
  });

  it("fails when there is no active episode", async () => {
    vi.mocked(getActiveEpisodeByPatientId).mockResolvedValue(null);

    const result = await createEncounterAction({
      patientId: "pat-1",
      episodeOfCareId: "epi-1",
      startedAt: "2026-04-17T10:30",
      endedAt: "2026-04-17T11:00",
    });

    expect(result).toEqual({
      ok: false,
      message: "No se puede registrar visita sin un tratamiento activo.",
    });
  });

  it("fails when active episode differs from submitted episode", async () => {
    vi.mocked(getActiveEpisodeByPatientId).mockResolvedValue({
      id: "epi-2",
      patientId: "pat-1",
      status: "active",
      startDate: "2026-04-01",
    });

    const result = await createEncounterAction({
      patientId: "pat-1",
      episodeOfCareId: "epi-1",
      startedAt: "2026-04-17T10:30:00Z",
      endedAt: "2026-04-17T11:00:00Z",
    });

    expect(result).toEqual({
      ok: false,
      message: "El tratamiento activo cambió. Reintentá desde la pantalla actualizada.",
    });
    expect(createEncounter).not.toHaveBeenCalled();
  });

  it("creates encounter when validation passes", async () => {
    vi.mocked(getActiveEpisodeByPatientId).mockResolvedValue({
      id: "epi-1",
      patientId: "pat-1",
      status: "active",
      startDate: "2026-04-01",
    });
    vi.mocked(createEncounter).mockResolvedValue({
      id: "enc-1",
      patientId: "pat-1",
      episodeOfCareId: "epi-1",
      startedAt: "2026-04-17T10:30:00Z",
      endedAt: "2026-04-17T11:00:00Z",
      status: "finished",
    });

    const result = await createEncounterAction({
      patientId: "pat-1",
      episodeOfCareId: "epi-1",
      startedAt: "2026-04-17T10:30",
      endedAt: "2026-04-17T11:00",
    });

    expect(createEncounter).toHaveBeenCalledWith({
      patientId: "pat-1",
      episodeOfCareId: "epi-1",
      startedAt: expect.stringMatching(/^2026-04-17T10:30:00(?:Z|[+-]\d{2}:\d{2})$/),
      endedAt: expect.stringMatching(/^2026-04-17T11:00:00(?:Z|[+-]\d{2}:\d{2})$/),
    });

    expect(result).toEqual({
      ok: true,
      partial: false,
      message: "Visita registrada correctamente.",
    });
    expect(revalidatePath).toHaveBeenCalledWith("/admin/patients/pat-1/encounters");
  });

  it("fails when visit is before treatment start", async () => {
    vi.mocked(getActiveEpisodeByPatientId).mockResolvedValue({
      id: "epi-1",
      patientId: "pat-1",
      status: "active",
      startDate: "2026-04-20",
    });

    const result = await createEncounterAction({
      patientId: "pat-1",
      episodeOfCareId: "epi-1",
      startedAt: "2026-04-17T10:30",
      endedAt: "2026-04-17T11:00",
    });

    expect(result).toEqual({
      ok: false,
      message: "El inicio de la visita no puede ser anterior al inicio del tratamiento.",
    });
    expect(createEncounter).not.toHaveBeenCalled();
  });

  it("accepts partial clinical note and normalizes whitespace", async () => {
    vi.mocked(getActiveEpisodeByPatientId).mockResolvedValue({
      id: "epi-1",
      patientId: "pat-1",
      status: "active",
      startDate: "2026-04-01",
    });
    vi.mocked(createEncounter).mockResolvedValue({
      id: "enc-1",
      patientId: "pat-1",
      episodeOfCareId: "epi-1",
      startedAt: "2026-04-17T10:30:00Z",
      endedAt: "2026-04-17T11:00:00Z",
      status: "finished",
      clinicalNote: { subjective: "Refiere dolor leve" },
    });

    await createEncounterAction({
      patientId: "pat-1",
      episodeOfCareId: "epi-1",
      startedAt: "2026-04-17T10:30",
      endedAt: "2026-04-17T11:00",
      clinicalNote: {
        subjective: "  Refiere dolor leve  ",
        objective: "   ",
      },
    });

    expect(createEncounter).toHaveBeenCalledWith(expect.objectContaining({
      clinicalNote: {
        subjective: "Refiere dolor leve",
      },
    }));
  });

  it("creates 4 functional observations when all metrics are sent", async () => {
    vi.mocked(getActiveEpisodeByPatientId).mockResolvedValue({ id: "epi-1", patientId: "pat-1", status: "active", startDate: "2026-04-01" });
    vi.mocked(createEncounter).mockResolvedValue({ id: "enc-1", patientId: "pat-1", episodeOfCareId: "epi-1", startedAt: "2026-04-17T10:30:00Z", endedAt: "2026-04-17T11:00:00Z", status: "finished" });
    vi.mocked(createFunctionalObservation).mockResolvedValue({ id: "obs-1", patientId: "pat-1", encounterId: "enc-1", effectiveDateTime: "2026-04-17T10:30:00Z", code: "tug_seconds", value: 18.5, unit: "s", status: "final" });
    const result = await createEncounterAction({ patientId: "pat-1", episodeOfCareId: "epi-1", startedAt: "2026-04-17T10:30", endedAt: "2026-04-17T11:00", tugSeconds: 18.5, painNrs010: 4, standingToleranceMinutes: 6, gaitDurationMinutes: 5 });
    expect(result.ok).toBe(true);
    expect(createFunctionalObservation).toHaveBeenCalledTimes(4);
  });

  it("keeps pain 0 and creates one observation", async () => {
    vi.mocked(getActiveEpisodeByPatientId).mockResolvedValue({ id: "epi-1", patientId: "pat-1", status: "active", startDate: "2026-04-01" });
    vi.mocked(createEncounter).mockResolvedValue({ id: "enc-1", patientId: "pat-1", episodeOfCareId: "epi-1", startedAt: "2026-04-17T10:30:00Z", endedAt: "2026-04-17T11:00:00Z", status: "finished" });
    vi.mocked(createFunctionalObservation).mockResolvedValue({ id: "obs-1", patientId: "pat-1", encounterId: "enc-1", effectiveDateTime: "2026-04-17T10:30:00Z", code: "pain_nrs_0_10", value: 0, unit: "/10", status: "final" });
    await createEncounterAction({ patientId: "pat-1", episodeOfCareId: "epi-1", startedAt: "2026-04-17T10:30", endedAt: "2026-04-17T11:00", painNrs010: 0 });
    expect(createFunctionalObservation).toHaveBeenCalledWith(expect.objectContaining({ value: 0, code: "pain_nrs_0_10" }));
  });

  it("returns partial success when one functional observation fails and others pass", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.mocked(getActiveEpisodeByPatientId).mockResolvedValue({ id: "epi-1", patientId: "pat-1", status: "active", startDate: "2026-04-01" });
    vi.mocked(createEncounter).mockResolvedValue({ id: "enc-1", patientId: "pat-1", episodeOfCareId: "epi-1", startedAt: "2026-04-17T10:30:00Z", endedAt: "2026-04-17T11:00:00Z", status: "finished" });
    vi.mocked(createFunctionalObservation)
      .mockResolvedValueOnce({ id: "obs-1", patientId: "pat-1", encounterId: "enc-1", effectiveDateTime: "2026-04-17T10:30:00Z", code: "tug_seconds", value: 18.5, unit: "s", status: "final" })
      .mockRejectedValueOnce(new Error("obs write failed"));

    const result = await createEncounterAction({
      patientId: "pat-1",
      episodeOfCareId: "epi-1",
      startedAt: "2026-04-17T10:30",
      endedAt: "2026-04-17T11:00",
      tugSeconds: 18.5,
      painNrs010: 4,
    });

    expect(result).toEqual({
      ok: true,
      partial: true,
      message: "La visita se registró, pero algunas métricas funcionales no pudieron guardarse.",
      failedObservationCodes: ["pain_nrs_0_10"],
    });
    expect(errorSpy).toHaveBeenCalledWith(
      "createEncounterAction partial functional observation failure",
      expect.objectContaining({ patientId: "pat-1", encounterId: "enc-1", failedObservationCodes: ["pain_nrs_0_10"] }),
    );
    expect(revalidatePath).toHaveBeenCalledWith("/admin/patients/pat-1/encounters");
  });

  it("returns partial success when all functional observations fail", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.mocked(getActiveEpisodeByPatientId).mockResolvedValue({ id: "epi-1", patientId: "pat-1", status: "active", startDate: "2026-04-01" });
    vi.mocked(createEncounter).mockResolvedValue({ id: "enc-1", patientId: "pat-1", episodeOfCareId: "epi-1", startedAt: "2026-04-17T10:30:00Z", endedAt: "2026-04-17T11:00:00Z", status: "finished" });
    vi.mocked(createFunctionalObservation).mockRejectedValue(new Error("obs write failed"));

    const result = await createEncounterAction({
      patientId: "pat-1",
      episodeOfCareId: "epi-1",
      startedAt: "2026-04-17T10:30",
      endedAt: "2026-04-17T11:00",
      tugSeconds: 18.5,
      painNrs010: 4,
    });

    expect(result).toEqual({
      ok: true,
      partial: true,
      message: "La visita se registró, pero algunas métricas funcionales no pudieron guardarse.",
      failedObservationCodes: ["tug_seconds", "pain_nrs_0_10"],
    });
    expect(revalidatePath).toHaveBeenCalledWith("/admin/patients/pat-1/encounters");
  });
});
