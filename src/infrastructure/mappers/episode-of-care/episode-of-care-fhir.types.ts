import { type FhirResource } from "@/lib/fhir/types";

export interface FhirEpisodeOfCare extends FhirResource {
  resourceType: "EpisodeOfCare";
  status: "active";
  patient?: {
    reference?: string;
  };
  period?: {
    start?: string;
  };
  note?: Array<{
    text?: string;
  }>;
}
