import type {
  FinishEpisodeOfCareInput,
  StartEpisodeOfCareInput,
} from "@/domain/episode-of-care/episode-of-care.types";
import { buildPatientReference } from "@/lib/fhir/references";

import { type FhirEpisodeOfCare } from "@/infrastructure/mappers/episode-of-care/episode-of-care-fhir.types";

const CLOSURE_REASON_PREFIX = "closure-reason:v1:";
const CLOSURE_DETAIL_PREFIX = "closure-detail:v1:";

function normalizeOptionalString(value?: string): string | undefined {
  const normalized = value?.trim();
  return normalized || undefined;
}

function buildClosureNotes(input: Pick<FinishEpisodeOfCareInput, "closureReason" | "closureDetail">): Array<{ text: string }> {
  if (!input.closureReason) {
    return [];
  }

  const notes: Array<{ text: string }> = [{ text: `${CLOSURE_REASON_PREFIX}${input.closureReason}` }];
  const detail = normalizeOptionalString(input.closureDetail);

  if (detail) {
    notes.push({ text: `${CLOSURE_DETAIL_PREFIX}${detail}` });
  }

  return notes;
}

function removeClosureNotes(note?: FhirEpisodeOfCare["note"]): Array<{ text?: string }> {
  if (!note?.length) {
    return [];
  }

  return note.filter((entry) => {
    const text = normalizeOptionalString(entry.text);

    return !(text && (text.startsWith(CLOSURE_REASON_PREFIX) || text.startsWith(CLOSURE_DETAIL_PREFIX)));
  });
}

export function mapStartEpisodeOfCareInputToFhir(input: StartEpisodeOfCareInput): FhirEpisodeOfCare {
  const serviceRequestId = input.serviceRequestId?.trim();

  return {
    resourceType: "EpisodeOfCare",
    status: "active",
    patient: {
      reference: buildPatientReference(input.patientId),
    },
    period: {
      start: input.startDate,
    },
    referralRequest: serviceRequestId
      ? [{ reference: `ServiceRequest/${serviceRequestId}` }]
      : undefined,
  };
}

export function applyFinishEpisodeOfCareToFhir(
  existing: FhirEpisodeOfCare,
  input: Pick<FinishEpisodeOfCareInput, "endDate" | "closureReason" | "closureDetail">,
): FhirEpisodeOfCare {
  const notesWithoutClosure = removeClosureNotes(existing.note);
  const closureNotes = buildClosureNotes(input);

  const nextNote = [...notesWithoutClosure, ...closureNotes];

  return {
    ...existing,
    status: "finished",
    period: {
      ...existing.period,
      end: input.endDate,
    },
    note: nextNote.length ? nextNote : undefined,
  };
}
