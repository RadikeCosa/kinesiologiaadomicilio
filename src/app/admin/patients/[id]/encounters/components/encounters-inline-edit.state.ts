import type { Encounter } from "@/domain/encounter/encounter.types";
import { formatLocalDateTimeInputValue } from "@/lib/date-input";

export interface EncountersInlineEditState {
  editingEncounterId: string | null;
  draftStartedAt: string;
  draftEndedAt: string;
  hasUserEditedEndedAt: boolean;
}

export function createInitialEncountersInlineEditState(): EncountersInlineEditState {
  return {
    editingEncounterId: null,
    draftStartedAt: "",
    draftEndedAt: "",
    hasUserEditedEndedAt: false,
  };
}

export function startEncounterInlineEdit(encounter: Encounter): EncountersInlineEditState {
  return {
    editingEncounterId: encounter.id,
    draftStartedAt: formatLocalDateTimeInputValue(encounter.startedAt),
    draftEndedAt: formatLocalDateTimeInputValue(encounter.endedAt ?? encounter.startedAt),
    hasUserEditedEndedAt: false,
  };
}

export function changeEncounterInlineDraft(
  state: EncountersInlineEditState,
  nextDraft: { startedAt?: string; endedAt?: string; hasUserEditedEndedAt?: boolean },
): EncountersInlineEditState {
  return {
    ...state,
    draftStartedAt: nextDraft.startedAt ?? state.draftStartedAt,
    draftEndedAt: nextDraft.endedAt ?? state.draftEndedAt,
    hasUserEditedEndedAt: nextDraft.hasUserEditedEndedAt ?? state.hasUserEditedEndedAt,
  };
}

export function cancelEncounterInlineEdit(encounter: Encounter): EncountersInlineEditState {
  return {
    editingEncounterId: null,
    draftStartedAt: formatLocalDateTimeInputValue(encounter.startedAt),
    draftEndedAt: formatLocalDateTimeInputValue(encounter.endedAt ?? encounter.startedAt),
    hasUserEditedEndedAt: false,
  };
}

export function canSubmitEncounterInlineEdit(params: {
  isPending: boolean;
  draftStartedAt: string;
  draftEndedAt: string;
}): boolean {
  return !params.isPending && Boolean(params.draftStartedAt) && Boolean(params.draftEndedAt);
}
