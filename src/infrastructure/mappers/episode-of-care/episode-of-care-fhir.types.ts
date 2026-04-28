import { type FhirResource } from "@/lib/fhir/types";

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
  referralRequest?: Array<{
    reference?: string;
  }>;
}
