import type { CreateEncounterInput } from "@/domain/encounter/encounter.types";
import { buildEpisodeOfCareReference, buildPatientReference } from "@/lib/fhir/references";

import { ENCOUNTER_CLINICAL_NOTE_EXTENSION_URLS } from "@/infrastructure/mappers/encounter/encounter-clinical-note.constants";
import { type FhirEncounter } from "@/infrastructure/mappers/encounter/encounter-fhir.types";

const CLINICAL_NOTE_EXTENSION_URL_SET = new Set(Object.values(ENCOUNTER_CLINICAL_NOTE_EXTENSION_URLS));

function buildClinicalNoteExtensions(input: CreateEncounterInput): NonNullable<FhirEncounter["extension"]> {
  const fields = input.clinicalNote;

  if (!fields) {
    return [];
  }

  return Object.entries(ENCOUNTER_CLINICAL_NOTE_EXTENSION_URLS).flatMap(([field, url]) => {
    const value = fields[field as keyof typeof fields];

    if (!value) {
      return [];
    }

    return [{ url, valueString: value }];
  });
}

export function mapCreateEncounterInputToFhir(input: CreateEncounterInput): FhirEncounter {
  const startedAt = input.startedAt || input.occurrenceDate || "";
  const clinicalExtensions = buildClinicalNoteExtensions(input);

  return {
    resourceType: "Encounter",
    status: "finished",
    subject: {
      reference: buildPatientReference(input.patientId),
    },
    episodeOfCare: [
      {
        reference: buildEpisodeOfCareReference(input.episodeOfCareId),
      },
    ],
    period: {
      start: startedAt,
      end: input.endedAt,
    },
    ...(clinicalExtensions.length > 0 ? { extension: clinicalExtensions } : {}),
  };
}

export function mapEncounterTimeRangeUpdate(existing: FhirEncounter, startedAt: string, endedAt: string): FhirEncounter {
  const preservedExtensions = (existing.extension ?? []).filter((extension) =>
    !CLINICAL_NOTE_EXTENSION_URL_SET.has(extension.url ?? ""));

  const existingClinicalExtensions = (existing.extension ?? []).filter((extension) =>
    CLINICAL_NOTE_EXTENSION_URL_SET.has(extension.url ?? ""));
  const nextExtensions = [...preservedExtensions, ...existingClinicalExtensions];

  return {
    ...existing,
    ...(nextExtensions.length > 0 ? { extension: nextExtensions } : {}),
    period: {
      ...existing.period,
      start: startedAt,
      end: endedAt,
    },
  };
}
