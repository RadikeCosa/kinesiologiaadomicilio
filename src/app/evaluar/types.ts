export interface EvaluarBranch {
  id: string;
  optionLabel: string;
  resultTitle: string;
  resultText: string;
  ctaLabel: string;
  whatsappMessage: string;
}

export interface EvaluarContent {
  headline: string;
  subtitle: string;
  backLabel: string;
  branches: EvaluarBranch[];
}

export type EvaluarFlowState = "selection" | "result";
