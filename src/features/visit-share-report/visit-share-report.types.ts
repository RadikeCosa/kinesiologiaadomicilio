import type { EncounterClinicalNote } from "@/domain/encounter/encounter.types";
import type { FunctionalObservationCode } from "@/domain/functional-observation/functional-observation.types";
import type { SigningProfessionalStatus } from "@/domain/signing-professional/signing-professional.types";

export type VisitShareReportRecipientKind = "patient" | "main_contact";

export interface VisitShareReportRecipientOption {
  kind: VisitShareReportRecipientKind;
  displayName: string;
  relationshipLabel?: string;
  phone?: string;
  hasWhatsAppCandidate: boolean;
}

export interface VisitShareReportPatient {
  displayName: string;
  firstName?: string;
  ageYears?: number;
  recipientOptions: VisitShareReportRecipientOption[];
}

export interface VisitShareReportClinicalNote {
  subjective?: string;
  objective?: string;
  intervention?: string;
  assessment?: string;
  tolerance?: string;
  homeInstructions?: string;
  nextPlan?: string;
}

export interface VisitShareReportFunctionalMetric {
  code: FunctionalObservationCode;
  label: string;
  value: number;
  unit: string;
}

export interface VisitShareReportVisit {
  startedAt: string;
  endedAt?: string;
  startedAtDisplay?: string;
  endedAtDisplay?: string;
  durationMinutes?: number;
  punctualityLabel?: string;
  clinicalNote?: VisitShareReportClinicalNote;
  functionalMetrics: VisitShareReportFunctionalMetric[];
}

export interface VisitShareReportSigningProfessional {
  status: SigningProfessionalStatus;
  fullName?: string;
  roleTitle?: string;
  licenseNumber?: string;
  licenseJurisdiction?: string;
  signatureDisplay?: string;
}

export interface EncounterShareableReportContext {
  patient: VisitShareReportPatient;
  visit: VisitShareReportVisit;
  signingProfessional: VisitShareReportSigningProfessional;
  treatmentContext?: {
    hasClinicalContext: boolean;
  };
}

export type VisitShareReportCompletenessStatus =
  | "ready"
  | "usable_with_warnings"
  | "insufficient";

export interface VisitShareReportCompletenessResult {
  status: VisitShareReportCompletenessStatus;
  missing: string[];
  warnings: string[];
}

export type VisitShareReportSection =
  | "header"
  | "subjective"
  | "objective"
  | "intervention"
  | "response"
  | "metrics"
  | "home_instructions"
  | "next_plan"
  | "signature";

export interface VisitShareReportCompositionResult {
  initialText: string;
  warnings: string[];
  includedSections: VisitShareReportSection[];
  omittedSections: VisitShareReportSection[];
  completeness: VisitShareReportCompletenessResult;
}

export type ShareableClinicalNoteSource = EncounterClinicalNote;
