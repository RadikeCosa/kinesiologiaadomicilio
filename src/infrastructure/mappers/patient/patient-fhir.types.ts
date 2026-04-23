import { type FhirResource } from "@/lib/fhir/types";

export type FhirAdministrativeGender = "male" | "female" | "other" | "unknown";

export interface FhirPatientContact {
  name?: {
    text?: string;
  };
  relationship?: Array<{
    text?: string;
  }>;
  telecom?: Array<{
    system?: string;
    value?: string;
    use?: string;
  }>;
}

export interface FhirPatient extends FhirResource {
  resourceType: "Patient";
  meta?: {
    lastUpdated?: string;
  };
  identifier?: Array<{
    system?: string;
    value?: string;
    type?: {
      coding?: Array<{
        system?: string;
        code?: string;
        display?: string;
      }>;
      text?: string;
    };
  }>;
  name?: Array<{
    family?: string;
    given?: string[];
    text?: string;
  }>;
  telecom?: Array<{
    system?: string;
    value?: string;
    use?: string;
  }>;
  gender?: FhirAdministrativeGender;
  birthDate?: string;
  address?: Array<{
    text?: string;
  }>;
  note?: Array<{
    text?: string;
  }>;
  contact?: FhirPatientContact[];
}
