import { type FhirResource } from "@/lib/fhir/types";

export interface FhirServiceRequest extends FhirResource {
  resourceType: "ServiceRequest";
  status?: "active" | "revoked" | "entered-in-error" | (string & {});
  intent?: "order" | (string & {});
  subject?: {
    reference?: string;
  };
  authoredOn?: string;
  reasonCode?: Array<{
    text?: string;
  }>;
  statusReason?: {
    text?: string;
  };
  requester?: {
    display?: string;
  };
  note?: Array<{
    text?: string;
  }>;
}
