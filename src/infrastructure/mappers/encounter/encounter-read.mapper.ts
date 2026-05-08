import type { Encounter } from "@/domain/encounter/encounter.types";
import { extractIdFromReference } from "@/lib/fhir/references";

import {
  ENCOUNTER_CLINICAL_NOTE_EXTENSION_URLS,
  ENCOUNTER_CLINICAL_NOTE_LEGACY_NOTE_PREFIXES,
} from "@/infrastructure/mappers/encounter/encounter-clinical-note.constants";
import {
  ENCOUNTER_OPERATIONAL_PUNCTUALITY_EXTENSION_URL,
  isEncounterVisitStartPunctuality,
} from "@/infrastructure/mappers/encounter/encounter-operational-punctuality.constants";
import { type FhirEncounter } from "@/infrastructure/mappers/encounter/encounter-fhir.types";

function extractClinicalNoteFromExtensions(resource: FhirEncounter): Encounter["clinicalNote"] {
  const extensionMap = new Map((resource.extension ?? []).map((item) => [item.url ?? "", item.valueString ?? ""]));
  const clinicalNote = {
    subjective: extensionMap.get(ENCOUNTER_CLINICAL_NOTE_EXTENSION_URLS.subjective) || undefined,
    objective: extensionMap.get(ENCOUNTER_CLINICAL_NOTE_EXTENSION_URLS.objective) || undefined,
    intervention: extensionMap.get(ENCOUNTER_CLINICAL_NOTE_EXTENSION_URLS.intervention) || undefined,
    assessment: extensionMap.get(ENCOUNTER_CLINICAL_NOTE_EXTENSION_URLS.assessment) || undefined,
    tolerance: extensionMap.get(ENCOUNTER_CLINICAL_NOTE_EXTENSION_URLS.tolerance) || undefined,
    homeInstructions: extensionMap.get(ENCOUNTER_CLINICAL_NOTE_EXTENSION_URLS.homeInstructions) || undefined,
    nextPlan: extensionMap.get(ENCOUNTER_CLINICAL_NOTE_EXTENSION_URLS.nextPlan) || undefined,
  };

  return Object.values(clinicalNote).some(Boolean) ? clinicalNote : undefined;
}

function extractClinicalNoteFromLegacyNotes(resource: FhirEncounter): Encounter["clinicalNote"] {
  const noteTexts = (resource.note ?? []).map((item) => item.text ?? "");
  const clinicalNote = {
    subjective: noteTexts.find((text) => text.startsWith(ENCOUNTER_CLINICAL_NOTE_LEGACY_NOTE_PREFIXES.subjective))
      ?.slice(ENCOUNTER_CLINICAL_NOTE_LEGACY_NOTE_PREFIXES.subjective.length),
    objective: noteTexts.find((text) => text.startsWith(ENCOUNTER_CLINICAL_NOTE_LEGACY_NOTE_PREFIXES.objective))
      ?.slice(ENCOUNTER_CLINICAL_NOTE_LEGACY_NOTE_PREFIXES.objective.length),
    intervention: noteTexts.find((text) => text.startsWith(ENCOUNTER_CLINICAL_NOTE_LEGACY_NOTE_PREFIXES.intervention))
      ?.slice(ENCOUNTER_CLINICAL_NOTE_LEGACY_NOTE_PREFIXES.intervention.length),
    assessment: noteTexts.find((text) => text.startsWith(ENCOUNTER_CLINICAL_NOTE_LEGACY_NOTE_PREFIXES.assessment))
      ?.slice(ENCOUNTER_CLINICAL_NOTE_LEGACY_NOTE_PREFIXES.assessment.length),
    tolerance: noteTexts.find((text) => text.startsWith(ENCOUNTER_CLINICAL_NOTE_LEGACY_NOTE_PREFIXES.tolerance))
      ?.slice(ENCOUNTER_CLINICAL_NOTE_LEGACY_NOTE_PREFIXES.tolerance.length),
    homeInstructions: noteTexts.find((text) => text.startsWith(ENCOUNTER_CLINICAL_NOTE_LEGACY_NOTE_PREFIXES.homeInstructions))
      ?.slice(ENCOUNTER_CLINICAL_NOTE_LEGACY_NOTE_PREFIXES.homeInstructions.length),
    nextPlan: noteTexts.find((text) => text.startsWith(ENCOUNTER_CLINICAL_NOTE_LEGACY_NOTE_PREFIXES.nextPlan))
      ?.slice(ENCOUNTER_CLINICAL_NOTE_LEGACY_NOTE_PREFIXES.nextPlan.length),
  };

  return Object.values(clinicalNote).some(Boolean) ? clinicalNote : undefined;
}

function extractVisitStartPunctuality(resource: FhirEncounter): Encounter["visitStartPunctuality"] {
  const matchingExtension = (resource.extension ?? []).find((item) => item.url === ENCOUNTER_OPERATIONAL_PUNCTUALITY_EXTENSION_URL);
  if (!matchingExtension || !isEncounterVisitStartPunctuality(matchingExtension.valueCode)) {
    return undefined;
  }
  return matchingExtension.valueCode;
}

export function mapFhirEncounterToDomain(resource: FhirEncounter): Encounter {
  const startedAt = resource.period?.start ?? resource.period?.end ?? "";
  const endedAt = resource.period?.end;
  const startedAtTimestamp = new Date(startedAt).getTime();
  const endedAtTimestamp = new Date(endedAt ?? "").getTime();

  const hasStartedAt = Boolean(resource.period?.start);
  const hasEndedAt = Boolean(endedAt);
  const hasValidChronologicalPeriod =
    !Number.isNaN(startedAtTimestamp)
    && !Number.isNaN(endedAtTimestamp)
    && endedAtTimestamp >= startedAtTimestamp;
  const shouldExposeEndedAt =
    hasStartedAt
    && hasEndedAt
    && startedAt !== endedAt
    // Tolerant read for external invalid data: if end < start we keep startedAt and hide endedAt.
    && hasValidChronologicalPeriod;
  const clinicalNote = extractClinicalNoteFromExtensions(resource) ?? extractClinicalNoteFromLegacyNotes(resource);
  const visitStartPunctuality = extractVisitStartPunctuality(resource);

  return {
    id: resource.id ?? "",
    patientId: extractIdFromReference(resource.subject?.reference) ?? "",
    episodeOfCareId: extractIdFromReference(resource.episodeOfCare?.[0]?.reference) ?? "",
    startedAt,
    ...(shouldExposeEndedAt ? { endedAt } : {}),
    status: "finished",
    ...(visitStartPunctuality ? { visitStartPunctuality } : {}),
    ...(clinicalNote ? { clinicalNote } : {}),
  };
}
