import { type FhirResource } from "@/lib/fhir/types";

export interface FhirDocumentReferenceExtension {
  url: string;
  valueCode?: string;
  valueString?: string;
  valueDate?: string;
  valueDateTime?: string;
  valueInteger?: number;
}

export interface FhirDocumentReference extends FhirResource {
  resourceType: "DocumentReference";
  status?: "current" | "superseded" | "entered-in-error" | (string & {});
  subject?: {
    reference?: string;
  };
  type?: {
    coding?: Array<{
      system?: string;
      code?: string;
      display?: string;
    }>;
    text?: string;
  };
  date?: string;
  description?: string;
  extension?: FhirDocumentReferenceExtension[];
  context?: {
    related?: Array<{
      reference?: string;
    }>;
  };
  content?: Array<{
    attachment?: {
      contentType?: string;
      data?: string;
      title?: string;
      creation?: string;
    };
  }>;
}
