import { getPatientOperationalStatus } from "@/domain/patient/patient.rules";
import type { EpisodeOfCare } from "@/domain/episode-of-care/episode-of-care.types";
import type { MainContact, Patient } from "@/domain/patient/patient.types";
import { DNI_IDENTIFIER_SYSTEM } from "@/lib/fhir/identifiers";
import type { PatientDetailReadModel } from "@/features/patients/read-models/patient-detail.read-model";
import type { PatientListItemReadModel } from "@/features/patients/read-models/patient-list-item.read-model";

import { type FhirPatient } from "@/infrastructure/mappers/patient/patient-fhir.types";

function buildFullName(patient: Pick<Patient, "firstName" | "lastName">): string {
  return `${patient.firstName} ${patient.lastName}`.trim();
}

function extractMainContact(contact?: FhirPatient["contact"]): MainContact | undefined {
  const primaryContact = contact?.[0];

  if (!primaryContact) {
    return undefined;
  }

  const mappedContact: MainContact = {
    name: primaryContact.name?.text?.trim() || undefined,
    relationship: primaryContact.relationship?.[0]?.text?.trim() || undefined,
    phone: primaryContact.telecom?.find((telecom) => telecom.system === "phone")?.value?.trim() || undefined,
  };

  if (!mappedContact.name && !mappedContact.relationship && !mappedContact.phone) {
    return undefined;
  }

  return mappedContact;
}

function resolveSlice1Timestamps(meta?: FhirPatient["meta"]): Pick<Patient, "createdAt" | "updatedAt"> {
  const lastUpdated = meta?.lastUpdated ?? new Date(0).toISOString();

  return {
    createdAt: lastUpdated,
    updatedAt: lastUpdated,
  };
}

export function mapFhirPatientToDomain(patient: FhirPatient): Patient {
  const firstName = patient.name?.[0]?.given?.[0]?.trim() ?? "";
  const lastName = patient.name?.[0]?.family?.trim() ?? "";
  const timestamps = resolveSlice1Timestamps(patient.meta);

  return {
    id: patient.id ?? "",
    firstName,
    lastName,
    dni:
      patient.identifier?.find((identifier) => identifier.system === DNI_IDENTIFIER_SYSTEM)?.value?.trim() ||
      undefined,
    phone: patient.telecom?.find((telecom) => telecom.system === "phone")?.value?.trim() || undefined,
    birthDate: patient.birthDate,
    address: patient.address?.[0]?.text?.trim() || undefined,
    mainContact: extractMainContact(patient.contact),
    createdAt: timestamps.createdAt,
    updatedAt: timestamps.updatedAt,
  };
}

export function mapPatientToListItemReadModel(
  patient: Patient,
  options?: { activeEpisode: EpisodeOfCare | null; latestEpisode?: EpisodeOfCare | null },
): PatientListItemReadModel {
  const activeEpisode = options?.activeEpisode ?? null;
  const latestEpisode = options?.latestEpisode ?? activeEpisode;

  return {
    id: patient.id,
    fullName: buildFullName(patient),
    dni: patient.dni,
    phone: patient.phone,
    address: patient.address,
    operationalStatus: getPatientOperationalStatus({
      patient,
      hasActiveEpisode: Boolean(activeEpisode),
      hasFinishedEpisode: latestEpisode?.status === "finished",
    }),
    createdAt: patient.createdAt,
    updatedAt: patient.updatedAt,
  };
}

export function mapPatientToDetailReadModel(
  patient: Patient,
  options?: { activeEpisode: EpisodeOfCare | null; latestEpisode?: EpisodeOfCare | null },
): PatientDetailReadModel {
  const activeEpisode = options?.activeEpisode ?? null;
  const latestEpisode = options?.latestEpisode ?? activeEpisode;

  return {
    id: patient.id,
    firstName: patient.firstName,
    lastName: patient.lastName,
    fullName: buildFullName(patient),
    dni: patient.dni,
    phone: patient.phone,
    birthDate: patient.birthDate,
    address: patient.address,
    mainContact: patient.mainContact,
    activeEpisode,
    latestEpisode,
    operationalStatus: getPatientOperationalStatus({
      patient,
      hasActiveEpisode: Boolean(activeEpisode),
      hasFinishedEpisode: latestEpisode?.status === "finished",
    }),
    createdAt: patient.createdAt,
    updatedAt: patient.updatedAt,
  };
}
