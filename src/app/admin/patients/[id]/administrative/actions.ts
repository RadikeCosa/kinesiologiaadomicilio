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
import {
  createEpisodeOfCare,
  getActiveEpisodeByPatientId,
  listEpisodeOfCareByIncomingReferral,
} from "@/infrastructure/repositories/episode-of-care.repository";
import { getPatientById } from "@/infrastructure/repositories/patient.repository";
import { canStartEpisodeOfCare } from "@/domain/episode-of-care/episode-of-care.rules";
import { existsAnotherPatientWithDni } from "@/infrastructure/repositories/patient.repository";
import { formatLocalDateInputValue } from "@/lib/date-input";


export interface CreatePatientServiceRequestActionResult {
  ok: boolean;
  message: string;
}

export interface UpdatePatientServiceRequestStatusActionResult {
  ok: boolean;
  message: string;
}
export interface AcceptAndStartTreatmentFromServiceRequestActionResult {
  ok: boolean;
  message: string;
  redirectTo?: string;
}

function getOptionalFormValue(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return undefined;
  }

  return value;
}

export async function acceptAndStartTreatmentFromServiceRequestAction(
  patientId: string,
  formData: FormData,
): Promise<AcceptAndStartTreatmentFromServiceRequestActionResult> {
  const serviceRequestId = getOptionalFormValue(formData, "id") ?? getOptionalFormValue(formData, "serviceRequestId");
  if (!serviceRequestId?.trim()) {
    return { ok: false, message: "No se pudo iniciar tratamiento desde esta solicitud." };
  }

  try {
    const serviceRequest = await getServiceRequestById(serviceRequestId);
    if (!serviceRequest || serviceRequest.patientId !== patientId || serviceRequest.status !== "in_review") {
      return { ok: false, message: "No se pudo iniciar tratamiento desde esta solicitud." };
    }

    const patient = await getPatientById(patientId);
    if (!patient) {
      return { ok: false, message: "No se pudo iniciar tratamiento desde esta solicitud." };
    }

    const existingActiveEpisode = await getActiveEpisodeByPatientId(patient.id);
    const duplicatePatientByDni = patient.dni?.trim()
      ? await existsAnotherPatientWithDni({ dni: patient.dni, excludePatientId: patient.id })
      : false;
    const validation = canStartEpisodeOfCare(patient, {
      hasActiveEpisode: Boolean(existingActiveEpisode),
      duplicatePatientByDni,
    });
    if (!validation.ok) {
      return { ok: false, message: validation.message };
    }

    const linkedEpisodes = await listEpisodeOfCareByIncomingReferral(serviceRequestId);
    if (linkedEpisodes.length > 0) {
      return { ok: false, message: "No se pudo iniciar tratamiento desde esta solicitud." };
    }

    await updateServiceRequestStatus({ id: serviceRequestId, status: "accepted" });
    try {
      await createEpisodeOfCare({
        patientId,
        serviceRequestId,
        startDate: formatLocalDateInputValue(),
      });
    } catch (error) {
      await updateServiceRequestStatus({ id: serviceRequestId, status: "in_review" });
      throw error;
    }

    revalidatePath(`/admin/patients/${patientId}/administrative`);
    revalidatePath(`/admin/patients/${patientId}/encounters`);

    return {
      ok: true,
      message: "Solicitud aceptada y tratamiento iniciado correctamente.",
      redirectTo: `/admin/patients/${patientId}/encounters`,
    };
  } catch {
    return { ok: false, message: "No se pudo iniciar tratamiento desde esta solicitud." };
  }
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
      requesterDisplay: getOptionalFormValue(formData, "requesterDisplay"),
      requesterType: getOptionalFormValue(formData, "requesterType"),
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
