import type { Encounter } from "@/domain/encounter/encounter.types";
import { formatLocalDateTimeInputValue } from "@/lib/date-input";

export interface EncountersInlineEditState {
  editingEncounterId: string | null;
  draftStartedAt: string;
}

export function createInitialEncountersInlineEditState(): EncountersInlineEditState {
  return {
    editingEncounterId: null,
    draftStartedAt: "",
  };
}

export function startEncounterInlineEdit(encounter: Encounter): EncountersInlineEditState {
  return {
    editingEncounterId: encounter.id,
    draftStartedAt: formatLocalDateTimeInputValue(encounter.startedAt),
  };
}

export function changeEncounterInlineDraft(
  state: EncountersInlineEditState,
  nextDraft: string,
): EncountersInlineEditState {
  return {
    ...state,
    draftStartedAt: nextDraft,
  };
}

export function cancelEncounterInlineEdit(encounter: Encounter): EncountersInlineEditState {
  return {
    editingEncounterId: null,
    draftStartedAt: formatLocalDateTimeInputValue(encounter.startedAt),
  };
}

export function canSubmitEncounterInlineEdit(params: {
  isPending: boolean;
  draftStartedAt: string;
}): boolean {
  return !params.isPending && Boolean(params.draftStartedAt);
}
