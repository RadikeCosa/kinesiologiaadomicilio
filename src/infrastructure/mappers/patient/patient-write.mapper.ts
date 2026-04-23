import type { CreatePatientInput, MainContact, PatientGender, UpdatePatientInput } from "@/domain/patient/patient.types";
import { normalizeMainContactRelationship } from "@/domain/patient/contact-relationship";
import { DNI_IDENTIFIER_SYSTEM, buildDniIdentifier } from "@/lib/fhir/identifiers";

import { type FhirPatient, type FhirPatientContact } from "@/infrastructure/mappers/patient/patient-fhir.types";

function extractPrimaryPhoneValue(telecom?: FhirPatient["telecom"]): string | undefined {
  return telecom?.find((entry) => entry.system === "phone")?.value?.trim() || undefined;
}

function buildSinglePhoneTelecom(phone?: string): FhirPatient["telecom"] {
  const normalizedPhone = phone?.trim();

  if (!normalizedPhone) {
    return undefined;
  }

  return [{ system: "phone", value: normalizedPhone }];
}

function buildSimpleHumanName(firstName?: string, lastName?: string): FhirPatient["name"] {
  const normalizedFirstName = firstName?.trim();
  const normalizedLastName = lastName?.trim();

  if (!normalizedFirstName && !normalizedLastName) {
    return undefined;
  }

  const given = normalizedFirstName?.split(/\s+/).filter(Boolean);
  const text = [normalizedFirstName, normalizedLastName].filter(Boolean).join(" ");

  return [
    {
      family: normalizedLastName || undefined,
      given: given?.length ? given : undefined,
      text: text || undefined,
    },
  ];
}

function mapMainContactToFhirContact(mainContact?: MainContact): FhirPatientContact[] | undefined {
  if (!mainContact) {
    return undefined;
  }

  const contactName = mainContact.name?.trim();
  const contactRelationship = normalizeMainContactRelationship(mainContact.relationship?.trim());
  const contactPhone = mainContact.phone?.trim();

  if (!contactName && !contactRelationship && !contactPhone) {
    return undefined;
  }

  return [
    {
      name: contactName ? { text: contactName } : undefined,
      relationship: contactRelationship ? [{ text: contactRelationship }] : undefined,
      telecom: contactPhone
        ? [
          {
            system: "phone",
            value: contactPhone,
          },
        ]
        : undefined,
    },
  ];
}

function mapInputToPatientShape(input: CreatePatientInput | UpdatePatientInput): Pick<
  FhirPatient,
  "identifier" | "name" | "telecom" | "gender" | "birthDate" | "address" | "contact"
> {
  const dni = input.dni?.trim();
  const phone = input.phone?.trim();
  const firstName = input.firstName?.trim();
  const lastName = input.lastName?.trim();
  const gender = input.gender?.trim() as PatientGender | undefined;
  const birthDate = input.birthDate?.trim();
  const addressText = input.address?.trim();

  return {
    identifier: dni ? [buildDniIdentifier(dni)] : undefined,
    name: buildSimpleHumanName(firstName, lastName),
    telecom: buildSinglePhoneTelecom(phone),
    gender: gender || undefined,
    birthDate: birthDate || undefined,
    address: addressText ? [{ text: addressText }] : undefined,
    contact: mapMainContactToFhirContact(input.mainContact),
  };
}

function normalizeIdentifiers(identifier?: FhirPatient["identifier"]): FhirPatient["identifier"] {
  if (!identifier) {
    return undefined;
  }

  return identifier.filter((item) => item.system !== DNI_IDENTIFIER_SYSTEM || Boolean(item.value));
}

function preferDefined<T>(nextValue: T | undefined, existingValue: T | undefined): T | undefined {
  return nextValue === undefined ? existingValue : nextValue;
}

export function mapCreatePatientInputToFhir(input: CreatePatientInput): FhirPatient {
  return {
    resourceType: "Patient",
    ...mapInputToPatientShape(input),
  };
}

export function mapUpdatePatientInputToFhir(options: {
  existing: FhirPatient;
  update: UpdatePatientInput;
}): FhirPatient {
  const mappedUpdate = mapInputToPatientShape(options.update);
  const nextPhone = extractPrimaryPhoneValue(mappedUpdate.telecom) ?? extractPrimaryPhoneValue(options.existing.telecom);

  const merged: FhirPatient = {
    ...options.existing,
    resourceType: "Patient",
    identifier: preferDefined(mappedUpdate.identifier, options.existing.identifier),
    name: preferDefined(mappedUpdate.name, options.existing.name),
    telecom: buildSinglePhoneTelecom(nextPhone),
    gender: preferDefined(mappedUpdate.gender, options.existing.gender),
    birthDate: preferDefined(mappedUpdate.birthDate, options.existing.birthDate),
    address: preferDefined(mappedUpdate.address, options.existing.address),
    contact: preferDefined(mappedUpdate.contact, options.existing.contact),
  };

  merged.identifier = normalizeIdentifiers(merged.identifier);

  return merged;
}
