export type EpisodeOfCareStatus = "active" | "finished";

export type EpisodeDiagnosisKind = "medical_reference" | "kinesiologic_impression";

export interface EpisodeDiagnosisReference {
  kind: EpisodeDiagnosisKind;
  conditionId: string;
}

export interface EpisodeClinicalContext {
  initialFunctionalStatus?: string;
  therapeuticGoals?: string;
  frameworkPlan?: string;
}

export type EpisodeOfCareClosureReason =
  | "treatment_completed"
  | "goals_reached"
  | "medical_indication"
  | "patient_or_family_decision"
  | "economic_reasons"
  | "referred_elsewhere"
  | "scheduling_or_coordination"
  | "lost_to_follow_up"
  | "death"
  | "other";

export const EPISODE_OF_CARE_CLOSURE_REASONS: EpisodeOfCareClosureReason[] = [
  "treatment_completed",
  "goals_reached",
  "medical_indication",
  "patient_or_family_decision",
  "economic_reasons",
  "referred_elsewhere",
  "scheduling_or_coordination",
  "lost_to_follow_up",
  "death",
  "other",
];

export const EPISODE_OF_CARE_CLOSURE_REASON_LABELS: Record<EpisodeOfCareClosureReason, string> = {
  treatment_completed: "Tratamiento completado",
  goals_reached: "Objetivos alcanzados",
  medical_indication: "Suspendido por indicación médica",
  patient_or_family_decision: "Suspendido por decisión del paciente/familia",
  economic_reasons: "Motivos económicos",
  referred_elsewhere: "Derivado a otro profesional/servicio",
  scheduling_or_coordination: "Dificultad de coordinación o agenda",
  lost_to_follow_up: "Sin continuidad / no responde",
  death: "Fallecimiento",
  other: "Otro",
};

export interface EpisodeOfCare {
  id: string;
  patientId: string;
  status: EpisodeOfCareStatus;
  startDate: string;
  endDate?: string;
  serviceRequestId?: string;
  closureReason?: EpisodeOfCareClosureReason;
  closureDetail?: string;
  diagnosisReferences?: EpisodeDiagnosisReference[];
  clinicalContext?: EpisodeClinicalContext;
}

export interface UpdateEpisodeClinicalContextInput {
  episodeId: string;
  diagnosisReferences?: EpisodeDiagnosisReference[];
  clinicalContext?: EpisodeClinicalContext;
}

export interface StartEpisodeOfCareInput {
  patientId: string;
  startDate: string;
  serviceRequestId?: string;
}

export interface FinishEpisodeOfCareInput {
  patientId: string;
  endDate: string;
  closureReason: EpisodeOfCareClosureReason;
  closureDetail?: string;
}
