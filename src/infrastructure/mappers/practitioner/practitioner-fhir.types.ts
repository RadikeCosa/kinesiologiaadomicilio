import type { FhirIdentifier, FhirResource } from "@/lib/fhir/types";

export interface FhirPractitioner extends FhirResource {
  resourceType: "Practitioner";
  active?: boolean;
  identifier?: FhirIdentifier[];
  name?: Array<{
    use?: string;
    text?: string;
    family?: string;
    given?: string[];
  }>;
  telecom?: Array<{
    system?: string;
    value?: string;
    use?: string;
  }>;
  qualification?: Array<{
    code?: {
      text?: string;
      coding?: Array<{
        system?: string;
        code?: string;
        display?: string;
      }>;
    };
    issuer?: {
      display?: string;
      reference?: string;
    };
  }>;
  extension?: Array<{
    url?: string;
    valueString?: string;
    valueCode?: string;
    valueBoolean?: boolean;
  }>;
}
