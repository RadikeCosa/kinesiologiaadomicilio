import type { CreatePatientInput, MainContact, PatientGender, UpdatePatientInput } from "@/domain/patient/patient.types";
import { DNI_IDENTIFIER_SYSTEM, buildDniIdentifier } from "@/lib/fhir/identifiers";

import { type FhirPatient, type FhirPatientContact } from "@/infrastructure/mappers/patient/patient-fhir.types";

function mapMainContactToFhirContact(mainContact?: MainContact): FhirPatientContact[] | undefined {
  if (!mainContact) {
    return undefined;
  }

  const contactName = mainContact.name?.trim();
  const contactRelationship = mainContact.relationship?.trim();
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
    name: firstName || lastName ? [{ family: lastName, given: firstName ? [firstName] : undefined }] : undefined,
    telecom: phone ? [{ system: "phone", value: phone }] : undefined,
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

  const merged: FhirPatient = {
    ...options.existing,
    resourceType: "Patient",
    identifier: preferDefined(mappedUpdate.identifier, options.existing.identifier),
    name: preferDefined(mappedUpdate.name, options.existing.name),
    telecom: preferDefined(mappedUpdate.telecom, options.existing.telecom),
    gender: preferDefined(mappedUpdate.gender, options.existing.gender),
    birthDate: preferDefined(mappedUpdate.birthDate, options.existing.birthDate),
    address: preferDefined(mappedUpdate.address, options.existing.address),
    contact: preferDefined(mappedUpdate.contact, options.existing.contact),
  };

  merged.identifier = normalizeIdentifiers(merged.identifier);

  return merged;
}
