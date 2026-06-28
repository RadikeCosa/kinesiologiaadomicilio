export type TreatmentReportFeedbackTone = "success" | "error";

export interface TreatmentReportFeedback {
  tone: TreatmentReportFeedbackTone;
  text: string;
}

export interface TreatmentReportEditorState {
  text: string;
  lastGeneratedText: string;
  isEdited: boolean;
  feedback: TreatmentReportFeedback | null;
}

export function createInitialTreatmentReportEditorState(
  generatedText = "",
): TreatmentReportEditorState {
  return {
    text: generatedText,
    lastGeneratedText: generatedText,
    isEdited: false,
    feedback: null,
  };
}

export function resetGeneratedTreatmentReportText(
  state: TreatmentReportEditorState,
): TreatmentReportEditorState {
  return {
    ...state,
    text: state.lastGeneratedText,
    isEdited: false,
    feedback: null,
  };
}

export function editTreatmentReportText(
  state: TreatmentReportEditorState,
  nextText: string,
): TreatmentReportEditorState {
  return {
    ...state,
    text: nextText,
    isEdited: nextText !== state.lastGeneratedText,
    feedback: null,
  };
}

export function applyTreatmentReportCopyFeedback(
  state: TreatmentReportEditorState,
  ok: boolean,
): TreatmentReportEditorState {
  return {
    ...state,
    feedback: {
      tone: ok ? "success" : "error",
      text: ok ? "Texto copiado." : "No se pudo copiar el texto.",
    },
  };
}

export async function copyTreatmentReportText(
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
