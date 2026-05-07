import { z } from "zod";

import type { EpisodeDiagnosisInput, UpsertEpisodeClinicalContextInput } from "@/domain/treatment-context/treatment-context.types";

const DIAGNOSIS_MAX_LENGTH = 2000;
const CONTEXT_TEXT_MAX_LENGTH = 4000;

function normalizeOptionalClinicalText(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  return normalized || undefined;
}

const diagnosisTextSchema = z.string().max(DIAGNOSIS_MAX_LENGTH).transform((value) => value.trim()).refine((value) => value.length > 0, "es obligatorio.");
const optionalContextTextSchema = z.string().max(CONTEXT_TEXT_MAX_LENGTH).transform((value) => value.trim()).refine((value) => value.length > 0, "es obligatorio.").optional();

export const episodeDiagnosisSchema = z.object({
  kind: z.enum(["medical_reference", "kinesiologic_impression"]),
  text: diagnosisTextSchema,
  conditionId: z.string().trim().min(1).optional(),
  recordedAt: z.string().trim().min(1).optional(),
  clinicalStatus: z.enum(["active", "recurrence", "relapse", "inactive", "remission", "resolved"]).optional(),
});

export const upsertEpisodeClinicalContextSchema = z.object({
  patientId: z.string().trim().min(1),
  episodeOfCareId: z.string().trim().min(1),
  medicalReferenceDiagnosis: episodeDiagnosisSchema.extend({ kind: z.literal("medical_reference") }).optional(),
  kinesiologicImpression: episodeDiagnosisSchema.extend({ kind: z.literal("kinesiologic_impression") }).optional(),
  initialFunctionalStatus: optionalContextTextSchema,
  therapeuticGoals: optionalContextTextSchema,
  frameworkPlan: optionalContextTextSchema,
}).superRefine((input, context) => {
  const hasAnyPayload = Boolean(
    input.medicalReferenceDiagnosis
    || input.kinesiologicImpression
    || normalizeOptionalClinicalText(input.initialFunctionalStatus)
    || normalizeOptionalClinicalText(input.therapeuticGoals)
    || normalizeOptionalClinicalText(input.frameworkPlan),
  );

  if (!hasAnyPayload) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: "payload: debe incluir al menos un campo clínico para actualizar." });
  }
});

export const treatmentContextSchemas = {
  episodeDiagnosisSchema: {
    parse(input: unknown): EpisodeDiagnosisInput {
      return episodeDiagnosisSchema.parse(input);
    },
  },
  upsertEpisodeClinicalContextSchema: {
    parse(input: unknown): UpsertEpisodeClinicalContextInput {
      return upsertEpisodeClinicalContextSchema.parse(input);
    },
  },
};
