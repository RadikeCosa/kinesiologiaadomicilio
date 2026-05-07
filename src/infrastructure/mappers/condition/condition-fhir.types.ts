import { type FhirResource } from "@/lib/fhir/types";

export interface FhirCondition extends FhirResource {
  resourceType: "Condition";
  subject?: { reference?: string };
  code?: { text?: string };
  clinicalStatus?: {
    coding?: Array<{ system?: string; code?: string; display?: string }>;
  };
  recordedDate?: string;
  note?: Array<{ text?: string }>;
}
