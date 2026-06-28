import type { FunctionalObservationTrendSummary } from "@/app/admin/patients/[id]/encounters/functional-trend";
import type { SigningProfessionalStatus } from "@/domain/signing-professional/signing-professional.types";

export type TreatmentReportMode = "progress" | "closure";

export type TreatmentReportCompletenessStatus =
  | "ready"
  | "usable_with_warnings"
  | "insufficient";

export type TreatmentReportSection =
  | "header"
  | "treatment_status"
  | "clinical_context"
  | "encounter_summary"
  | "functional_metrics"
  | "professional_summary"
  | "continuity"
  | "signature";

export type TreatmentReportLoadFailureReason =
  | "missing_patient"
  | "missing_episode"
  | "episode_belongs_to_another_patient"
  | "mode_requires_active_episode"
  | "mode_requires_finished_episode";

export interface TreatmentReportPatient {
  id: string;
  displayName: string;
}

export interface TreatmentReportEpisode {
  id: string;
  status: "active" | "finished";
  startDate: string;
  endDate?: string;
  closureReason?: string;
  closureReasonLabel?: string;
  closureDetail?: string;
}

export interface TreatmentReportClinicalContext {
  medicalReferenceDiagnosisText?: string;
  kinesiologicDiagnosisText?: string;
  initialFunctionalStatus?: string;
  therapeuticGoals?: string;
  frameworkPlan?: string;
  hasAnyContent: boolean;
}

export interface TreatmentReportEncounterItem {
  id: string;
  startedAt: string;
  endedAt?: string;
  hasClinicalNote: boolean;
  functionalObservationCount: number;
}

export interface TreatmentReportEncounterSummary {
  count: number;
  firstVisitStartedAt?: string;
  lastVisitStartedAt?: string;
  averageDurationMinutes: number | null;
  totalDurationMinutes: number | null;
  averageDaysBetweenVisits: number | null;
}

export interface TreatmentReportSigningProfessional {
  status: SigningProfessionalStatus;
  fullName?: string;
  roleTitle?: string;
  licenseNumber?: string;
  licenseJurisdiction?: string;
  signatureDisplay?: string;
}

export interface TreatmentReportContext {
  mode: TreatmentReportMode;
  patient: TreatmentReportPatient;
  episode: TreatmentReportEpisode;
  clinicalContext: TreatmentReportClinicalContext | null;
  encounters: TreatmentReportEncounterItem[];
  encounterSummary: TreatmentReportEncounterSummary;
  functionalTrend: FunctionalObservationTrendSummary[];
  signingProfessional: TreatmentReportSigningProfessional;
}

export interface TreatmentReportCompletenessResult {
  status: TreatmentReportCompletenessStatus;
  missing: string[];
  warnings: string[];
}

export interface TreatmentReportCompositionResult {
  initialText: string;
  warnings: string[];
  includedSections: TreatmentReportSection[];
  omittedSections: TreatmentReportSection[];
  completeness: TreatmentReportCompletenessResult;
}

export type TreatmentReportLoadResult =
  | {
    ok: true;
    context: TreatmentReportContext;
  }
  | {
    ok: false;
    reason: TreatmentReportLoadFailureReason;
  };
