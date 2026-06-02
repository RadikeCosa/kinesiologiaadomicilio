import { describe, expect, it, vi } from "vitest";

import {
  applyVisitShareReportCopyFeedback,
  copyVisitShareReportText,
  createInitialVisitShareReportPanelState,
  editVisitShareReportText,
  loadGeneratedVisitShareReportText,
} from "./visit-share-report-panel.state";

describe("visit share report panel state", () => {
  it("loads generated text as the editable baseline", () => {
    const state = loadGeneratedVisitShareReportText(
      createInitialVisitShareReportPanelState(),
      "Texto generado",
    );

    expect(state.text).toBe("Texto generado");
    expect(state.lastGeneratedText).toBe("Texto generado");
    expect(state.isEdited).toBe(false);
  });

  it("tracks local textarea edits without persisting them", () => {
    const loaded = loadGeneratedVisitShareReportText(
      createInitialVisitShareReportPanelState(),
      "Texto generado",
    );
    const edited = editVisitShareReportText(loaded, "Texto editado por profesional");

    expect(edited.text).toBe("Texto editado por profesional");
    expect(edited.lastGeneratedText).toBe("Texto generado");
    expect(edited.isEdited).toBe(true);
  });

  it("regenerates by replacing local edits with the latest generated text", () => {
    const loaded = loadGeneratedVisitShareReportText(
      createInitialVisitShareReportPanelState(),
      "Texto generado",
    );
    const edited = editVisitShareReportText(loaded, "Texto editado");
    const regenerated = loadGeneratedVisitShareReportText(edited, "Texto regenerado desde datos");

    expect(regenerated.text).toBe("Texto regenerado desde datos");
    expect(regenerated.lastGeneratedText).toBe("Texto regenerado desde datos");
    expect(regenerated.isEdited).toBe(false);
  });

  it("sets copy success and error feedback messages", () => {
    const state = createInitialVisitShareReportPanelState();

    expect(applyVisitShareReportCopyFeedback(state, true).feedback).toEqual({
      tone: "success",
      text: "Texto copiado.",
    });
    expect(applyVisitShareReportCopyFeedback(state, false).feedback).toEqual({
      tone: "error",
      text: "No se pudo copiar el texto.",
    });
  });

  it("copies text using an injected clipboard writer", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);

    await expect(copyVisitShareReportText(writeText, "Texto actual del textarea")).resolves.toBe(true);

    expect(writeText).toHaveBeenCalledWith("Texto actual del textarea");
  });

  it("returns false when clipboard writer fails", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("clipboard unavailable"));

    await expect(copyVisitShareReportText(writeText, "Texto actual")).resolves.toBe(false);
  });
});
