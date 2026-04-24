import { describe, expect, it } from "vitest";

import {
  cancelEncounterInlineEdit,
  canSubmitEncounterInlineEdit,
  changeEncounterInlineDraft,
  createInitialEncountersInlineEditState,
  startEncounterInlineEdit,
} from "@/app/admin/patients/[id]/encounters/components/encounters-inline-edit.state";

const encounter = {
  id: "enc-1",
  patientId: "pat-1",
  episodeOfCareId: "epi-1",
  startedAt: "2026-04-24T10:30:00Z",
  status: "finished" as const,
};

describe("encounters-inline-edit state", () => {
  it("starts inline edit when user clicks pencil", () => {
    const state = startEncounterInlineEdit(encounter);

    expect(state.editingEncounterId).toBe("enc-1");
    expect(state.draftStartedAt).toMatch(/^2026-04-24T\d{2}:\d{2}$/);
  });

  it("updates draft while user edits datetime-local", () => {
    const initial = startEncounterInlineEdit(encounter);
    const updated = changeEncounterInlineDraft(initial, "2026-04-25T08:45");

    expect(updated.draftStartedAt).toBe("2026-04-25T08:45");
  });

  it("cancels edit and restores read mode with previous value", () => {
    const cancelled = cancelEncounterInlineEdit(encounter);

    expect(cancelled.editingEncounterId).toBeNull();
    expect(cancelled.draftStartedAt).toMatch(/^2026-04-24T\d{2}:\d{2}$/);
  });

  it("disables save while pending or draft is empty", () => {
    expect(canSubmitEncounterInlineEdit({ isPending: true, draftStartedAt: "2026-04-25T08:45" })).toBe(false);
    expect(canSubmitEncounterInlineEdit({ isPending: false, draftStartedAt: "" })).toBe(false);
    expect(canSubmitEncounterInlineEdit({ isPending: false, draftStartedAt: "2026-04-25T08:45" })).toBe(true);
  });

  it("creates empty initial state", () => {
    expect(createInitialEncountersInlineEditState()).toEqual({
      editingEncounterId: null,
      draftStartedAt: "",
    });
  });
});
