"use server";

import { revalidatePath } from "next/cache";

import { treatmentContextSchemas } from "@/domain/treatment-context/treatment-context.schemas";
import { createConditionFromDiagnosis } from "@/infrastructure/repositories/condition.repository";
import { getEpisodeById, updateEpisodeOfCareClinicalContext } from "@/infrastructure/repositories/episode-of-care.repository";

export interface UpsertEpisodeClinicalContextActionResult { ok: boolean; message?: string }

function normalizeText(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

export async function upsertEpisodeClinicalContextAction(input: unknown): Promise<UpsertEpisodeClinicalContextActionResult> {
  try {
    const payload = (typeof input === "object" && input) ? (input as Record<string, unknown>) : {};
    const medicalText = normalizeText(payload.medicalReferenceDiagnosisText);
    const kinesiologicText = normalizeText(payload.kinesiologicImpressionText);
    const clearMedical = typeof payload.medicalReferenceDiagnosisText === "string" && !medicalText;
    const clearKinesiologic = typeof payload.kinesiologicImpressionText === "string" && !kinesiologicText;

    const parsed = treatmentContextSchemas.upsertEpisodeClinicalContextSchema.parse({
      patientId: payload.patientId,
      episodeOfCareId: payload.episodeOfCareId,
      medicalReferenceDiagnosis: medicalText ? { kind: "medical_reference", text: medicalText } : undefined,
      kinesiologicImpression: kinesiologicText ? { kind: "kinesiologic_impression", text: kinesiologicText } : undefined,
      initialFunctionalStatus: payload.initialFunctionalStatus,
      therapeuticGoals: payload.therapeuticGoals,
      frameworkPlan: payload.frameworkPlan,
    });

    const episode = await getEpisodeById(parsed.episodeOfCareId);
    if (!episode || episode.patientId !== parsed.patientId) {
      return { ok: false, message: "No se encontró el tratamiento indicado para este paciente." };
    }

    const diagnosisReferences = (episode.diagnosisReferences ?? []).filter((item) => item.kind !== "medical_reference" && item.kind !== "kinesiologic_impression");

    if (parsed.medicalReferenceDiagnosis?.text) {
      const created = await createConditionFromDiagnosis({ patientId: parsed.patientId, diagnosis: parsed.medicalReferenceDiagnosis });
      if (created.conditionId) diagnosisReferences.push({ kind: "medical_reference", conditionId: created.conditionId });
    } else if (!clearMedical) {
      const previous = episode.diagnosisReferences?.find((item) => item.kind === "medical_reference");
      if (previous?.conditionId) diagnosisReferences.push({ kind: "medical_reference", conditionId: previous.conditionId });
    }

    if (parsed.kinesiologicImpression?.text) {
      const created = await createConditionFromDiagnosis({ patientId: parsed.patientId, diagnosis: parsed.kinesiologicImpression });
      if (created.conditionId) diagnosisReferences.push({ kind: "kinesiologic_impression", conditionId: created.conditionId });
    } else if (!clearKinesiologic) {
      const previous = episode.diagnosisReferences?.find((item) => item.kind === "kinesiologic_impression");
      if (previous?.conditionId) diagnosisReferences.push({ kind: "kinesiologic_impression", conditionId: previous.conditionId });
    }

    await updateEpisodeOfCareClinicalContext({
      episodeId: episode.id,
      diagnosisReferences,
      clinicalContext: {
        initialFunctionalStatus: parsed.initialFunctionalStatus,
        therapeuticGoals: parsed.therapeuticGoals,
        frameworkPlan: parsed.frameworkPlan,
      },
    });

    revalidatePath(`/admin/patients/${parsed.patientId}/treatment`);
    revalidatePath(`/admin/patients/${parsed.patientId}/encounters`);
    return { ok: true, message: "Contexto clínico actualizado." };
  } catch {
    return { ok: false, message: "No se pudo actualizar el contexto clínico del tratamiento." };
  }
}
