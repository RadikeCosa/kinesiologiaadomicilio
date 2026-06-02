export type VisitShareReportFeedbackTone = "success" | "error";

export interface VisitShareReportFeedback {
  tone: VisitShareReportFeedbackTone;
  text: string;
}

export interface VisitShareReportPanelState {
  text: string;
  lastGeneratedText: string;
  isEdited: boolean;
  feedback: VisitShareReportFeedback | null;
}

export function createInitialVisitShareReportPanelState(): VisitShareReportPanelState {
  return {
    text: "",
    lastGeneratedText: "",
    isEdited: false,
    feedback: null,
  };
}

export function loadGeneratedVisitShareReportText(
  state: VisitShareReportPanelState,
  generatedText: string,
): VisitShareReportPanelState {
  return {
    ...state,
    text: generatedText,
    lastGeneratedText: generatedText,
    isEdited: false,
    feedback: null,
  };
}

export function editVisitShareReportText(
  state: VisitShareReportPanelState,
  nextText: string,
): VisitShareReportPanelState {
  return {
    ...state,
    text: nextText,
    isEdited: nextText !== state.lastGeneratedText,
    feedback: null,
  };
}

export function applyVisitShareReportCopyFeedback(
  state: VisitShareReportPanelState,
  ok: boolean,
): VisitShareReportPanelState {
  return {
    ...state,
    feedback: {
      tone: ok ? "success" : "error",
      text: ok ? "Texto copiado." : "No se pudo copiar el texto.",
    },
  };
}

export async function copyVisitShareReportText(
  writeText: (text: string) => Promise<unknown>,
  text: string,
): Promise<boolean> {
  try {
    await writeText(text);
    return true;
  } catch {
    return false;
  }
}
