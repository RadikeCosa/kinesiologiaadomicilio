"use server";

import { revalidatePath } from "next/cache";

import {
  createServiceRequestSchema,
  updateServiceRequestStatusSchema,
} from "@/domain/service-request/service-request.schemas";
import {
  createServiceRequest,
  getServiceRequestById,
  updateServiceRequestStatus,
} from "@/infrastructure/repositories/service-request.repository";

export interface CreatePatientServiceRequestActionResult {
  ok: boolean;
  message: string;
}

export interface UpdatePatientServiceRequestStatusActionResult {
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

function buildUpdateServiceRequestStatusSuccessMessage(status: string): string {
  switch (status) {
    case "accepted":
      return "Solicitud aceptada correctamente.";
    case "closed_without_treatment":
      return "Solicitud cerrada sin iniciar tratamiento.";
    case "cancelled":
      return "Solicitud cancelada correctamente.";
    default:
      return "Solicitud actualizada correctamente.";
  }
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

export async function updatePatientServiceRequestStatusAction(
  patientId: string,
  formData: FormData,
): Promise<UpdatePatientServiceRequestStatusActionResult> {
  try {
    const parsedInput = updateServiceRequestStatusSchema.parse({
      id: getOptionalFormValue(formData, "id") ?? getOptionalFormValue(formData, "serviceRequestId"),
      status: getOptionalFormValue(formData, "status"),
      closedReasonText: getOptionalFormValue(formData, "closedReasonText"),
    });

    const existingServiceRequest = await getServiceRequestById(parsedInput.id);

    if (!existingServiceRequest || existingServiceRequest.patientId !== patientId) {
      return {
        ok: false,
        message: "No se pudo actualizar la solicitud de atención.",
      };
    }

    await updateServiceRequestStatus(parsedInput);
    revalidatePath(`/admin/patients/${patientId}/administrative`);

    return {
      ok: true,
      message: buildUpdateServiceRequestStatusSuccessMessage(parsedInput.status),
    };
  } catch {
    return {
      ok: false,
      message: "No se pudo actualizar la solicitud de atención.",
    };
  }
}
