import { describe, expect, it } from "vitest";

import {
  applyTreatmentReportCopyFeedback,
  copyTreatmentReportText,
  createInitialTreatmentReportEditorState,
  editTreatmentReportText,
  resetGeneratedTreatmentReportText,
} from "@/app/admin/patients/[id]/treatment/report/components/treatment-report-editor.state";

describe("treatment-report-editor.state", () => {
  it("marks local edits and restores generated text on regenerate", () => {
    const initial = createInitialTreatmentReportEditorState("Texto derivado inicial");
    const edited = editTreatmentReportText(initial, "Texto editado localmente");
    const reset = resetGeneratedTreatmentReportText(edited);

    expect(edited.isEdited).toBe(true);
    expect(reset.text).toBe("Texto derivado inicial");
    expect(reset.isEdited).toBe(false);
  });

  it("sets copy feedback after copy attempts", () => {
    const state = createInitialTreatmentReportEditorState("Texto derivado");

    expect(applyTreatmentReportCopyFeedback(state, true).feedback).toEqual({
      tone: "success",
      text: "Texto copiado.",
    });
    expect(applyTreatmentReportCopyFeedback(state, false).feedback).toEqual({
      tone: "error",
      text: "No se pudo copiar el texto.",
    });
  });

  it("returns true/false depending on clipboard result", async () => {
    await expect(copyTreatmentReportText(async () => undefined, "Texto")).resolves.toBe(true);
    await expect(copyTreatmentReportText(async () => {
      throw new Error("clipboard failed");
    }, "Texto")).resolves.toBe(false);
  });
});
