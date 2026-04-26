import { getPatientOperationalStatus } from "@/domain/patient/patient.rules";
import type { EpisodeOfCare } from "@/domain/episode-of-care/episode-of-care.types";
import type { MainContact, Patient } from "@/domain/patient/patient.types";
import { normalizeMainContactRelationship } from "@/domain/patient/contact-relationship";
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
    relationship: normalizeMainContactRelationship(primaryContact.relationship?.[0]?.text),
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

function extractPatientNames(name?: FhirPatient["name"]): Pick<Patient, "firstName" | "lastName"> {
  const primaryName = name?.[0];
  const givenName = primaryName?.given?.map((item) => item.trim()).filter(Boolean).join(" ") || undefined;
  const familyName = primaryName?.family?.trim() || undefined;
  const textName = primaryName?.text?.trim() || undefined;

  if (givenName || familyName) {
    return {
      firstName: givenName ?? "",
      lastName: familyName ?? "",
    };
  }

  if (textName) {
    return {
      firstName: textName,
      lastName: "",
    };
  }

  return {
    firstName: "",
    lastName: "",
  };
}

export function mapFhirPatientToDomain(patient: FhirPatient): Patient {
  const names = extractPatientNames(patient.name);
  const timestamps = resolveSlice1Timestamps(patient.meta);

  return {
    id: patient.id ?? "",
    firstName: names.firstName,
    lastName: names.lastName,
    dni:
      patient.identifier?.find((identifier) => identifier.system === DNI_IDENTIFIER_SYSTEM)?.value?.trim() ||
      undefined,
    phone: patient.telecom?.find((telecom) => telecom.system === "phone")?.value?.trim() || undefined,
    gender: patient.gender,
    birthDate: patient.birthDate?.trim() || undefined,
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
    gender: patient.gender,
    birthDate: patient.birthDate,
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
    gender: patient.gender,
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
