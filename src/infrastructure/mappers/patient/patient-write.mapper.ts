import type { CreatePatientInput, MainContact, UpdatePatientInput } from "@/domain/patient/patient.types";
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

function buildNotes(noteText?: string): Array<{ text: string }> | undefined {
  const normalizedNote = noteText?.trim();
  return normalizedNote ? [{ text: normalizedNote }] : undefined;
}

function mapInputToPatientShape(input: CreatePatientInput | UpdatePatientInput): Pick<
  FhirPatient,
  "identifier" | "name" | "telecom" | "birthDate" | "address" | "note" | "contact"
> {
  const dni = input.dni?.trim();
  const phone = input.phone?.trim();
  const firstName = input.firstName?.trim();
  const lastName = input.lastName?.trim();
  const addressText = input.address?.trim();

  return {
    identifier: dni ? [buildDniIdentifier(dni)] : undefined,
    name: firstName || lastName ? [{ family: lastName, given: firstName ? [firstName] : undefined }] : undefined,
    telecom: phone ? [{ system: "phone", value: phone }] : undefined,
    birthDate: input.birthDate,
    address: addressText ? [{ text: addressText }] : undefined,
    note: buildNotes(input.notes),
    contact: mapMainContactToFhirContact(input.mainContact),
  };
}

function normalizeIdentifiers(identifier?: FhirPatient["identifier"]): FhirPatient["identifier"] {
  if (!identifier) {
    return undefined;
  }

  return identifier.filter((item) => item.system !== DNI_IDENTIFIER_SYSTEM || Boolean(item.value));
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
    ...mappedUpdate,
  };

  if (options.update.notes === undefined) {
    merged.note = options.existing.note;
  }

  merged.identifier = normalizeIdentifiers(merged.identifier);

  return merged;
}
