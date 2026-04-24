import type { Encounter } from "@/domain/encounter/encounter.types";
import { formatLocalDateTimeInputValue } from "@/lib/date-input";

export interface EncountersInlineEditState {
  editingEncounterId: string | null;
  draftOccurrenceDate: string;
}

export function createInitialEncountersInlineEditState(): EncountersInlineEditState {
  return {
    editingEncounterId: null,
    draftOccurrenceDate: "",
  };
}

export function startEncounterInlineEdit(encounter: Encounter): EncountersInlineEditState {
  return {
    editingEncounterId: encounter.id,
    draftOccurrenceDate: formatLocalDateTimeInputValue(encounter.occurrenceDate),
  };
}

export function changeEncounterInlineDraft(
  state: EncountersInlineEditState,
  nextDraft: string,
): EncountersInlineEditState {
  return {
    ...state,
    draftOccurrenceDate: nextDraft,
  };
}

export function cancelEncounterInlineEdit(encounter: Encounter): EncountersInlineEditState {
  return {
    editingEncounterId: null,
    draftOccurrenceDate: formatLocalDateTimeInputValue(encounter.occurrenceDate),
  };
}

export function canSubmitEncounterInlineEdit(params: {
  isPending: boolean;
  draftOccurrenceDate: string;
}): boolean {
  return !params.isPending && Boolean(params.draftOccurrenceDate);
}
