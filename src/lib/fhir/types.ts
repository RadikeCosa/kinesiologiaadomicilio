export interface FhirResource {
  resourceType: string;
  id?: string;
  [key: string]: unknown;
}

export interface FhirBundleEntry<TResource extends FhirResource = FhirResource> {
  fullUrl?: string;
  resource?: TResource;
}

export interface FhirBundle<TResource extends FhirResource = FhirResource> {
  resourceType: "Bundle";
  type?: string;
  total?: number;
  entry?: Array<FhirBundleEntry<TResource>>;
}

export interface FhirOperationOutcomeIssue {
  severity?: string;
  code?: string;
  diagnostics?: string;
  details?: {
    text?: string;
  };
}

export interface FhirOperationOutcome extends FhirResource {
  resourceType: "OperationOutcome";
  issue?: FhirOperationOutcomeIssue[];
}

export interface FhirIdentifier {
  system: string;
  value: string;
}
