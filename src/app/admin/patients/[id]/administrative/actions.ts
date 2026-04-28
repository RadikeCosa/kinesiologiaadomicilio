"use server";

import { revalidatePath } from "next/cache";

import { createServiceRequestSchema } from "@/domain/service-request/service-request.schemas";
import { createServiceRequest } from "@/infrastructure/repositories/service-request.repository";

export interface CreatePatientServiceRequestActionResult {
  ok: boolean;
  message: string;
}

function getOptionalFormValue(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return undefined;
  }

  return value;
}

export async function createPatientServiceRequestAction(
  patientId: string,
  formData: FormData,
): Promise<CreatePatientServiceRequestActionResult> {
  try {
    const parsedInput = createServiceRequestSchema.parse({
      patientId,
      requestedAt: getOptionalFormValue(formData, "requestedAt"),
      reasonText: getOptionalFormValue(formData, "reasonText"),
      reportedDiagnosisText: getOptionalFormValue(formData, "reportedDiagnosisText"),
      requesterDisplay: getOptionalFormValue(formData, "requesterDisplay"),
      requesterType: getOptionalFormValue(formData, "requesterType"),
      requesterContact: getOptionalFormValue(formData, "requesterContact"),
      notes: getOptionalFormValue(formData, "notes"),
    });

    await createServiceRequest(parsedInput);
    revalidatePath(`/admin/patients/${parsedInput.patientId}/administrative`);

    return {
      ok: true,
      message: "Solicitud de atención registrada correctamente.",
    };
  } catch (error) {
    const message = error instanceof Error
      ? error.message
      : "No se pudo registrar la solicitud de atención.";

    return {
      ok: false,
      message,
    };
  }
}
