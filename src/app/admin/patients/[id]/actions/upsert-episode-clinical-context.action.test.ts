import { describe, expect, it, vi } from "vitest";


vi.mock("@/domain/treatment-context/treatment-context.schemas", () => ({
  treatmentContextSchemas: {
    upsertEpisodeClinicalContextSchema: {
      parse: (input: any) => {
        if (!input?.patientId || !input?.episodeOfCareId) throw new Error("invalid");
        const hasPayload = Boolean(input.medicalReferenceDiagnosis || input.kinesiologicImpression || input.initialFunctionalStatus?.trim?.() || input.therapeuticGoals?.trim?.() || input.frameworkPlan?.trim?.());
        if (!hasPayload) throw new Error("empty");
        return input;
      },
    },
  },
}));

import { upsertEpisodeClinicalContextAction } from "@/app/admin/patients/[id]/actions/upsert-episode-clinical-context.action";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/infrastructure/repositories/episode-of-care.repository", () => ({
  getEpisodeById: vi.fn(),
  updateEpisodeOfCareClinicalContext: vi.fn(),
}));
vi.mock("@/infrastructure/repositories/condition.repository", () => ({
  createConditionFromDiagnosis: vi.fn(),
}));

import { revalidatePath } from "next/cache";
import { createConditionFromDiagnosis } from "@/infrastructure/repositories/condition.repository";
import { getEpisodeById, updateEpisodeOfCareClinicalContext } from "@/infrastructure/repositories/episode-of-care.repository";

describe("upsertEpisodeClinicalContextAction", () => {
  it("saves full context and diagnoses", async () => {
    vi.mocked(getEpisodeById).mockResolvedValue({ id: "epi-1", patientId: "pat-1", status: "active", startDate: "2026-01-01", diagnosisReferences: [] });
    vi.mocked(createConditionFromDiagnosis)
      .mockResolvedValueOnce({ conditionId: "cond-m" })
      .mockResolvedValueOnce({ conditionId: "cond-k" });
    vi.mocked(updateEpisodeOfCareClinicalContext).mockResolvedValue({ id: "epi-1", patientId: "pat-1", status: "active", startDate: "2026-01-01" });

    const result = await upsertEpisodeClinicalContextAction({
      patientId: "pat-1",
      episodeOfCareId: "epi-1",
      medicalReferenceDiagnosisText: "Dx médica",
      kinesiologicImpressionText: "Dx kinésica",
      initialFunctionalStatus: "Base",
      therapeuticGoals: "Metas",
      frameworkPlan: "Plan",
    });

    expect(result.ok).toBe(true);
    expect(updateEpisodeOfCareClinicalContext).toHaveBeenCalledWith(expect.objectContaining({
      diagnosisReferences: [
        { kind: "medical_reference", conditionId: "cond-m" },
        { kind: "kinesiologic_impression", conditionId: "cond-k" },
      ],
    }));
    expect(revalidatePath).toHaveBeenCalledWith("/admin/patients/pat-1/treatment");
    expect(revalidatePath).toHaveBeenCalledWith("/admin/patients/pat-1/encounters");
  });

  it("rejects empty payload", async () => {
    const result = await upsertEpisodeClinicalContextAction({ patientId: "pat-1", episodeOfCareId: "epi-1" });
    expect(result.ok).toBe(false);
  });

  it("rejects episode from another patient", async () => {
    vi.mocked(getEpisodeById).mockResolvedValue({ id: "epi-1", patientId: "pat-2", status: "active", startDate: "2026-01-01" });
    const result = await upsertEpisodeClinicalContextAction({ patientId: "pat-1", episodeOfCareId: "epi-1", initialFunctionalStatus: "Base" });
    expect(result).toEqual({ ok: false, message: "No se encontró el tratamiento indicado para este paciente." });
  });

  it("replaces known diagnosis kinds without duplicating and preserves unknown roles", async () => {
    vi.mocked(getEpisodeById).mockResolvedValue({
      id: "epi-1", patientId: "pat-1", status: "active", startDate: "2026-01-01",
      diagnosisReferences: [
        { kind: "medical_reference", conditionId: "old-m" },
        { kind: "kinesiologic_impression", conditionId: "old-k" },
        { kind: "other" as never, conditionId: "keep-me" },
      ],
    });
    vi.mocked(createConditionFromDiagnosis).mockResolvedValueOnce({ conditionId: "new-m" });
    vi.mocked(updateEpisodeOfCareClinicalContext).mockResolvedValue({ id: "epi-1", patientId: "pat-1", status: "active", startDate: "2026-01-01" });

    await upsertEpisodeClinicalContextAction({ patientId: "pat-1", episodeOfCareId: "epi-1", medicalReferenceDiagnosisText: "Nuevo" });

    expect(updateEpisodeOfCareClinicalContext).toHaveBeenCalledWith(expect.objectContaining({ diagnosisReferences: [
      { kind: "other", conditionId: "keep-me" },
      { kind: "medical_reference", conditionId: "new-m" },
      { kind: "kinesiologic_impression", conditionId: "old-k" },
    ] }));
  });

  it("cleans diagnosis by removing episode reference when empty string is sent", async () => {
    vi.mocked(getEpisodeById).mockResolvedValue({
      id: "epi-1", patientId: "pat-1", status: "active", startDate: "2026-01-01",
      diagnosisReferences: [
        { kind: "medical_reference", conditionId: "old-m" },
        { kind: "kinesiologic_impression", conditionId: "old-k" },
      ],
    });
    vi.mocked(updateEpisodeOfCareClinicalContext).mockResolvedValue({ id: "epi-1", patientId: "pat-1", status: "active", startDate: "2026-01-01" });

    await upsertEpisodeClinicalContextAction({ patientId: "pat-1", episodeOfCareId: "epi-1", medicalReferenceDiagnosisText: "" , therapeuticGoals: "Goal"});

    expect(updateEpisodeOfCareClinicalContext).toHaveBeenCalledWith(expect.objectContaining({ diagnosisReferences: [
      { kind: "kinesiologic_impression", conditionId: "old-k" },
    ] }));
  });
});
