export type EpisodeDiagnosisKind = "medical_reference" | "kinesiologic_impression";
export type EpisodeDiagnosisClinicalStatus = "active" | "recurrence" | "relapse" | "inactive" | "remission" | "resolved";

export interface EpisodeDiagnosisInput {
  kind: EpisodeDiagnosisKind;
  text: string;
  conditionId?: string;
  recordedAt?: string;
  clinicalStatus?: EpisodeDiagnosisClinicalStatus;
}

export interface EpisodeClinicalContext {
  medicalReferenceDiagnosis?: EpisodeDiagnosisInput;
  kinesiologicImpression?: EpisodeDiagnosisInput;
  initialFunctionalStatus?: string;
  therapeuticGoals?: string;
  frameworkPlan?: string;
}

export interface UpsertEpisodeClinicalContextInput extends EpisodeClinicalContext {
  patientId: string;
  episodeOfCareId: string;
}

export interface EpisodeDiagnosis {
  conditionId?: string;
  kind: EpisodeDiagnosisKind;
  text: string;
  recordedAt?: string;
  clinicalStatus?: EpisodeDiagnosisClinicalStatus;
}
