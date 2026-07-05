"use server";

import { revalidatePath } from "next/cache";

import { createPatientSchema } from "@/domain/patient/patient.schemas";
import { canCreatePatient } from "@/domain/patient/patient.rules";
import type { CreatePatientInput, MainContact } from "@/domain/patient/patient.types";
import { createServiceRequestSchema } from "@/domain/service-request/service-request.schemas";
import type { CreateServiceRequestInput, ServiceRequestRequesterType } from "@/domain/service-request/service-request.types";
import { createPatient, findPatientByDni } from "@/infrastructure/repositories/patient.repository";
import { createServiceRequest } from "@/infrastructure/repositories/service-request.repository";

export interface CreateRequestIntakeActionInput {
  requestedAt: string;
  firstName: string;
  lastName: string;
  contactPhone: string;
  reasonText: string;
  dni?: string;
  address?: string;
  requesterDisplay?: string;
  requesterType?: string;
}

export interface CreateRequestIntakeActionResult {
  ok: boolean;
  message: string;
  redirectTo?: string;
  patientId?: string;
}

function assertObject(input: unknown): Record<string, unknown> {
  if (typeof input !== "object" || input === null) {
    throw new Error("Se esperaba un objeto.");
  }

  return input as Record<string, unknown>;
}

function getOptionalString(record: Record<string, unknown>, key: string): string | undefined {
  const value = record[key];

  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new Error(`${key}: debe ser un string.`);
  }

  const normalized = value.trim();
  return normalized || undefined;
}

function getRequiredString(record: Record<string, unknown>, key: string, message?: string): string {
  const value = record[key];

  if (typeof value !== "string") {
    throw new Error(message ?? `${key}: debe ser un string.`);
  }

  const normalized = value.trim();

  if (!normalized) {
    throw new Error(message ?? `${key}: es obligatorio.`);
  }

  return normalized;
}

function mapRequesterTypeToMainContact(requesterType?: ServiceRequestRequesterType, requesterDisplay?: string, contactPhone?: string): MainContact | undefined {
  if (!requesterType || requesterType === "patient") {
    return undefined;
  }

  return {
    name: requesterDisplay,
    relationship: requesterType === "caregiver" ? "caregiver" : "other",
    phone: contactPhone,
  };
}

function buildPatientInput(input: {
  firstName: string;
  lastName: string;
  dni?: string;
  address?: string;
  contactPhone: string;
  requesterDisplay?: string;
  requesterType?: ServiceRequestRequesterType;
}): CreatePatientInput {
  const mainContact = mapRequesterTypeToMainContact(
    input.requesterType,
    input.requesterDisplay,
    input.contactPhone,
  );

  return createPatientSchema.parse({
    firstName: input.firstName,
    lastName: input.lastName,
    dni: input.dni,
    address: input.address,
    phone: input.requesterType && input.requesterType !== "patient"
      ? undefined
      : input.contactPhone,
    mainContact,
  });
}

function buildServiceRequestInput(input: {
  patientId: string;
  requestedAt: string;
  reasonText: string;
  requesterDisplay?: string;
  requesterType?: ServiceRequestRequesterType;
}): CreateServiceRequestInput {
  return createServiceRequestSchema.parse({
    patientId: input.patientId,
    requestedAt: input.requestedAt,
    reasonText: input.reasonText,
    requesterDisplay: input.requesterDisplay,
    requesterType: input.requesterType,
  });
}

function parseCreateRequestIntakeInput(input: unknown): {
  requestedAt: string;
  reasonText: string;
  requesterDisplay?: string;
  requesterType?: ServiceRequestRequesterType;
  patientInput: CreatePatientInput;
} {
  const record = assertObject(input);
  const requestedAt = getRequiredString(record, "requestedAt", "La fecha de solicitud es obligatoria.");
  const firstName = getRequiredString(record, "firstName", "El nombre del paciente es obligatorio.");
  const lastName = getRequiredString(record, "lastName", "El apellido del paciente es obligatorio.");
  const contactPhone = getRequiredString(record, "contactPhone", "El teléfono de contacto es obligatorio.");
  const reasonText = getRequiredString(record, "reasonText", "El motivo de consulta es obligatorio.");
  const dni = getOptionalString(record, "dni");
  const address = getOptionalString(record, "address");
  const requesterDisplay = getOptionalString(record, "requesterDisplay");
  const requesterType = getOptionalString(record, "requesterType") as ServiceRequestRequesterType | undefined;

  const patientInput = buildPatientInput({
    firstName,
    lastName,
    dni,
    address,
    contactPhone,
    requesterDisplay,
    requesterType,
  });

  const createValidation = canCreatePatient(patientInput);
  if (!createValidation.ok) {
    throw new Error(createValidation.message);
  }

  buildServiceRequestInput({
    patientId: "patient-placeholder",
    requestedAt,
    reasonText,
    requesterDisplay,
    requesterType,
  });

  return {
    requestedAt,
    reasonText,
    requesterDisplay,
    requesterType,
    patientInput,
  };
}

export async function createRequestIntakeAction(
  input: unknown,
): Promise<CreateRequestIntakeActionResult> {
  try {
    const parsedInput = parseCreateRequestIntakeInput(input);

    if (parsedInput.patientInput.dni) {
      const existingPatient = await findPatientByDni(parsedInput.patientInput.dni);

      if (existingPatient) {
        return {
          ok: false,
          message: "Ya existe un paciente con ese DNI. En esta fase usá la ficha existente y registrá la solicitud desde Gestión administrativa.",
          patientId: existingPatient.id,
          redirectTo: `/admin/patients/${existingPatient.id}/administrative?newServiceRequest=1#service-requests`,
        };
      }
    }

    const patient = await createPatient(parsedInput.patientInput);

    revalidatePath("/admin");
    revalidatePath("/admin/patients");
    revalidatePath(`/admin/patients/${patient.id}`);
    revalidatePath(`/admin/patients/${patient.id}/administrative`);

    try {
      const serviceRequestInput = buildServiceRequestInput({
        patientId: patient.id,
        requestedAt: parsedInput.requestedAt,
        reasonText: parsedInput.reasonText,
        requesterDisplay: parsedInput.requesterDisplay,
        requesterType: parsedInput.requesterType,
      });

      await createServiceRequest(serviceRequestInput);
    } catch {
      return {
        ok: false,
        message: "Se creó el paciente, pero no se pudo registrar la solicitud. Podés completarla manualmente desde Gestión administrativa.",
        patientId: patient.id,
        redirectTo: `/admin/patients/${patient.id}/administrative?newServiceRequest=1&status=intake-partial#service-requests`,
      };
    }

    return {
      ok: true,
      message: "Solicitud registrada correctamente.",
      patientId: patient.id,
      redirectTo: `/admin/patients/${patient.id}?requestCreated=1`,
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "No se pudo registrar la solicitud de atención.",
    };
  }
}
