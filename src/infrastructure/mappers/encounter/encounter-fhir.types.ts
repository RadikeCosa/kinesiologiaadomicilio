import { type FhirResource } from "@/lib/fhir/types";

export interface FhirEncounter extends FhirResource {
  resourceType: "Encounter";
  status: "finished";
  subject?: {
    reference?: string;
  };
  episodeOfCare?: Array<{
    reference?: string;
  }>;
  period?: {
    start?: string;
    end?: string;
  };
}
