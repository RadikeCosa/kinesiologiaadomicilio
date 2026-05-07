import { type FhirResource } from "@/lib/fhir/types";

export type FhirExtension = {
  url: string;
  valueCode?: string;
  valueString?: string;
  valueMarkdown?: string;
};

export type FhirEpisodeDiagnosisRoleCoding = {
  system?: string;
  code?: string;
  display?: string;
};

export type FhirEpisodeDiagnosis = {
  condition?: { reference?: string };
  role?: {
    coding?: FhirEpisodeDiagnosisRoleCoding[];
    text?: string;
  };
  rank?: number;
};

export interface FhirEpisodeOfCare extends FhirResource {
  resourceType: "EpisodeOfCare";
  status: "active" | "finished";
  patient?: {
    reference?: string;
  };
  period?: {
    start?: string;
    end?: string;
  };
  note?: Array<{
    text?: string;
  }>;
  extension?: FhirExtension[];
  referralRequest?: Array<{
    reference?: string;
  }>;
  diagnosis?: FhirEpisodeDiagnosis[];
}
