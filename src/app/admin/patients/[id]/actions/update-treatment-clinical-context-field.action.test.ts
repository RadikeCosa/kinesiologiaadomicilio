import { describe, expect, it, vi } from "vitest";

import { updateTreatmentClinicalContextFieldAction } from "@/app/admin/patients/[id]/actions/update-treatment-clinical-context-field.action";

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

const baseEpisode = {
  id: "epi-1",
  patientId: "pat-1",
  status: "active",
  startDate: "2026-01-01",
  endDate: "2026-03-01",
  referralRequestId: "sr-1",
  diagnosisReferences: [
    { kind: "medical_reference", conditionId: "old-m" },
    { kind: "kinesiologic_diagnosis", conditionId: "old-k" },
    { kind: "other" as never, conditionId: "other-1" },
  ],
  clinicalContext: {
    initialFunctionalStatus: "Inicial",
    therapeuticGoals: "Objetivo",
    frameworkPlan: "Plan",
    closureDetail: "Cierre",
  },
};

describe("updateTreatmentClinicalContextFieldAction", () => {
  it("edita diagnóstico médico y preserva diagnóstico kinésico", async () => {
    vi.mocked(getEpisodeById).mockResolvedValue(baseEpisode);
    vi.mocked(createConditionFromDiagnosis).mockResolvedValue({ conditionId: "new-m" });
    await updateTreatmentClinicalContextFieldAction({ patientId: "pat-1", episodeOfCareId: "epi-1", field: "medicalReferenceDiagnosis", value: "nuevo" });
    expect(updateEpisodeOfCareClinicalContext).toHaveBeenCalledWith(expect.objectContaining({ diagnosisReferences: expect.arrayContaining([{ kind: "kinesiologic_diagnosis", conditionId: "old-k" }, { kind: "medical_reference", conditionId: "new-m" }]) }));
  });

  it("edita diagnóstico kinésico y preserva diagnóstico médico", async () => {
    vi.mocked(getEpisodeById).mockResolvedValue(baseEpisode);
    vi.mocked(createConditionFromDiagnosis).mockResolvedValue({ conditionId: "new-k" });
    await updateTreatmentClinicalContextFieldAction({ patientId: "pat-1", episodeOfCareId: "epi-1", field: "kinesiologicDiagnosis", value: "nuevo" });
    expect(updateEpisodeOfCareClinicalContext).toHaveBeenCalledWith(expect.objectContaining({ diagnosisReferences: expect.arrayContaining([{ kind: "medical_reference", conditionId: "old-m" }, { kind: "kinesiologic_diagnosis", conditionId: "new-k" }]) }));
  });

  it("edita situación funcional y preserva objetivo y plan", async () => {
    vi.mocked(getEpisodeById).mockResolvedValue(baseEpisode);
    await updateTreatmentClinicalContextFieldAction({ patientId: "pat-1", episodeOfCareId: "epi-1", field: "initialFunctionalStatus", value: "Nueva situación" });
    expect(updateEpisodeOfCareClinicalContext).toHaveBeenCalledWith(expect.objectContaining({ clinicalContext: { initialFunctionalStatus: "Nueva situación", therapeuticGoals: "Objetivo", frameworkPlan: "Plan" } }));
  });

  it("edita objetivo y preserva situación funcional y plan", async () => {
    vi.mocked(getEpisodeById).mockResolvedValue(baseEpisode);
    await updateTreatmentClinicalContextFieldAction({ patientId: "pat-1", episodeOfCareId: "epi-1", field: "therapeuticGoals", value: "Nuevo objetivo" });
    expect(updateEpisodeOfCareClinicalContext).toHaveBeenCalledWith(expect.objectContaining({ clinicalContext: { initialFunctionalStatus: "Inicial", therapeuticGoals: "Nuevo objetivo", frameworkPlan: "Plan" } }));
  });

  it("edita plan y preserva situación funcional y objetivo", async () => {
    vi.mocked(getEpisodeById).mockResolvedValue(baseEpisode);
    await updateTreatmentClinicalContextFieldAction({ patientId: "pat-1", episodeOfCareId: "epi-1", field: "frameworkPlan", value: "Nuevo plan" });
    expect(updateEpisodeOfCareClinicalContext).toHaveBeenCalledWith(expect.objectContaining({ clinicalContext: { initialFunctionalStatus: "Inicial", therapeuticGoals: "Objetivo", frameworkPlan: "Nuevo plan" } }));
  });

  it("limpia diagnóstico médico removiendo solo referencia médica", async () => {
    vi.mocked(getEpisodeById).mockResolvedValue(baseEpisode);
    await updateTreatmentClinicalContextFieldAction({ patientId: "pat-1", episodeOfCareId: "epi-1", field: "medicalReferenceDiagnosis", value: "" });
    expect(updateEpisodeOfCareClinicalContext).toHaveBeenCalledWith(expect.objectContaining({ diagnosisReferences: expect.arrayContaining([{ kind: "kinesiologic_diagnosis", conditionId: "old-k" }, { kind: "other", conditionId: "other-1" }]) }));
    expect(updateEpisodeOfCareClinicalContext).not.toHaveBeenCalledWith(expect.objectContaining({ diagnosisReferences: expect.arrayContaining([{ kind: "medical_reference", conditionId: "old-m" }]) }));
  });

  it("limpia diagnóstico kinésico removiendo solo referencia kinésica", async () => {
    vi.mocked(getEpisodeById).mockResolvedValue(baseEpisode);
    await updateTreatmentClinicalContextFieldAction({ patientId: "pat-1", episodeOfCareId: "epi-1", field: "kinesiologicDiagnosis", value: "   " });
    expect(updateEpisodeOfCareClinicalContext).toHaveBeenCalledWith(expect.objectContaining({ diagnosisReferences: expect.arrayContaining([{ kind: "medical_reference", conditionId: "old-m" }, { kind: "other", conditionId: "other-1" }]) }));
  });

  it("preserva referralRequest, period y status al actualizar", async () => {
    vi.mocked(getEpisodeById).mockResolvedValue(baseEpisode);
    await updateTreatmentClinicalContextFieldAction({ patientId: "pat-1", episodeOfCareId: "epi-1", field: "frameworkPlan", value: "A" });
    expect(updateEpisodeOfCareClinicalContext).toHaveBeenCalledWith(expect.objectContaining({ episodeId: "epi-1" }));
  });

  it("revalida treatment y encounters", async () => {
    vi.mocked(getEpisodeById).mockResolvedValue(baseEpisode);
    await updateTreatmentClinicalContextFieldAction({ patientId: "pat-1", episodeOfCareId: "epi-1", field: "frameworkPlan", value: "A" });
    expect(revalidatePath).toHaveBeenCalledWith("/admin/patients/pat-1/treatment");
    expect(revalidatePath).toHaveBeenCalledWith("/admin/patients/pat-1/encounters");
  });
});
