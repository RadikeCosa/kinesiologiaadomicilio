import { type FhirResource } from "@/lib/fhir/types";

export interface FhirObservation extends FhirResource {
  resourceType: "Observation";
  status?: "final" | (string & {});
  subject?: { reference?: string };
  encounter?: { reference?: string };
  effectiveDateTime?: string;
  code?: {
    coding?: Array<{ system?: string; code?: string; display?: string }>;
    text?: string;
  };
  valueQuantity?: { value?: number; unit?: string; system?: string; code?: string };
  valueString?: string;
}
