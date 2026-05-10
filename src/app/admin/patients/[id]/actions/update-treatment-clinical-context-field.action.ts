"use server";

import { revalidatePath } from "next/cache";

import { createConditionFromDiagnosis } from "@/infrastructure/repositories/condition.repository";
import { getEpisodeById, updateEpisodeOfCareClinicalContext } from "@/infrastructure/repositories/episode-of-care.repository";

type ClinicalField =
  | "medicalReferenceDiagnosis"
  | "kinesiologicDiagnosis"
  | "initialFunctionalStatus"
  | "therapeuticGoals"
  | "frameworkPlan";

export interface UpdateTreatmentClinicalContextFieldActionInput {
  patientId: string;
  episodeOfCareId: string;
  field: ClinicalField;
  value: string;
}

export interface UpdateTreatmentClinicalContextFieldActionResult { ok: boolean; message?: string }

function normalizeText(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

export async function updateTreatmentClinicalContextFieldAction(
  input: UpdateTreatmentClinicalContextFieldActionInput,
): Promise<UpdateTreatmentClinicalContextFieldActionResult> {
  try {
    if (!input.patientId?.trim() || !input.episodeOfCareId?.trim() || !input.field) {
      return { ok: false, message: "Datos incompletos para actualizar el campo clínico." };
    }

    const episode = await getEpisodeById(input.episodeOfCareId);
    if (!episode || episode.patientId !== input.patientId) {
      return { ok: false, message: "No se encontró el tratamiento indicado para este paciente." };
    }

    const normalizedValue = normalizeText(input.value ?? "");
    const diagnosisReferences = [...(episode.diagnosisReferences ?? [])];
    const context = {
      initialFunctionalStatus: episode.clinicalContext?.initialFunctionalStatus,
      therapeuticGoals: episode.clinicalContext?.therapeuticGoals,
      frameworkPlan: episode.clinicalContext?.frameworkPlan,
    };

    switch (input.field) {
      case "medicalReferenceDiagnosis": {
        const filtered = diagnosisReferences.filter((item) => item.kind !== "medical_reference");
        if (normalizedValue) {
          const created = await createConditionFromDiagnosis({
            patientId: input.patientId,
            diagnosis: { kind: "medical_reference", text: normalizedValue },
          });
          if (created.conditionId) filtered.push({ kind: "medical_reference", conditionId: created.conditionId });
        }
        await updateEpisodeOfCareClinicalContext({ episodeId: episode.id, diagnosisReferences: filtered, clinicalContext: context });
        break;
      }
      case "kinesiologicDiagnosis": {
        const filtered = diagnosisReferences.filter((item) => item.kind !== "kinesiologic_diagnosis");
        if (normalizedValue) {
          const created = await createConditionFromDiagnosis({
            patientId: input.patientId,
            diagnosis: { kind: "kinesiologic_diagnosis", text: normalizedValue },
          });
          if (created.conditionId) filtered.push({ kind: "kinesiologic_diagnosis", conditionId: created.conditionId });
        }
        await updateEpisodeOfCareClinicalContext({ episodeId: episode.id, diagnosisReferences: filtered, clinicalContext: context });
        break;
      }
      case "initialFunctionalStatus":
        context.initialFunctionalStatus = normalizedValue;
        await updateEpisodeOfCareClinicalContext({ episodeId: episode.id, diagnosisReferences, clinicalContext: context });
        break;
      case "therapeuticGoals":
        context.therapeuticGoals = normalizedValue;
        await updateEpisodeOfCareClinicalContext({ episodeId: episode.id, diagnosisReferences, clinicalContext: context });
        break;
      case "frameworkPlan":
        context.frameworkPlan = normalizedValue;
        await updateEpisodeOfCareClinicalContext({ episodeId: episode.id, diagnosisReferences, clinicalContext: context });
        break;
      default:
        return { ok: false, message: "Campo clínico inválido." };
    }

    revalidatePath(`/admin/patients/${input.patientId}/treatment`);
    revalidatePath(`/admin/patients/${input.patientId}/encounters`);
    return { ok: true, message: "Campo clínico actualizado." };
  } catch {
    return { ok: false, message: "No se pudo actualizar el campo clínico del tratamiento." };
  }
}
