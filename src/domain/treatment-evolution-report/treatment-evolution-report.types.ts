export type TreatmentEvolutionReportType = "progress" | "stage_closure";

export const TREATMENT_EVOLUTION_REPORT_TYPE_LABELS: Record<TreatmentEvolutionReportType, string> = {
  progress: "Informe de progreso",
  stage_closure: "Cierre de etapa",
};

export type TreatmentEvolutionReportTreatmentStatus = "active" | "finished";

export interface TreatmentEvolutionReport {
  id: string;
  patientId: string;
  episodeId: string;
  createdAt: string;
  reportType: TreatmentEvolutionReportType;
  treatmentStatusAtReport: TreatmentEvolutionReportTreatmentStatus;
  episodeStartDate: string;
  encounterCount: number;
  firstEncounterStartedAt?: string;
  lastEncounterStartedAt?: string;
  medicalDiagnosisSnapshot?: string;
  kinesiologicDiagnosisSnapshot?: string;
  initialFunctionalStatusSnapshot?: string;
  therapeuticGoalsSnapshot?: string;
  frameworkPlanSnapshot?: string;
  functionalMetricsSummarySnapshot?: string;
  finalText: string;
}

export interface CreateTreatmentEvolutionReportInput {
  patientId: string;
  episodeId: string;
  createdAt: string;
  reportType: TreatmentEvolutionReportType;
  treatmentStatusAtReport: TreatmentEvolutionReportTreatmentStatus;
  episodeStartDate: string;
  encounterCount: number;
  firstEncounterStartedAt?: string;
  lastEncounterStartedAt?: string;
  medicalDiagnosisSnapshot?: string;
  kinesiologicDiagnosisSnapshot?: string;
  initialFunctionalStatusSnapshot?: string;
  therapeuticGoalsSnapshot?: string;
  frameworkPlanSnapshot?: string;
  functionalMetricsSummarySnapshot?: string;
  finalText: string;
}
