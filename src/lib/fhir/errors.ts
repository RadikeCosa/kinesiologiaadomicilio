import { type FhirOperationOutcome } from "@/lib/fhir/types";

interface FhirClientErrorParams {
  message: string;
  method: string;
  url: string;
  status?: number;
  body?: unknown;
  operationOutcome?: FhirOperationOutcome;
}

export class FhirClientError extends Error {
  readonly method: string;
  readonly url: string;
  readonly status?: number;
  readonly body?: unknown;
  readonly operationOutcome?: FhirOperationOutcome;

  constructor(params: FhirClientErrorParams) {
    super(params.message);
    this.name = "FhirClientError";
    this.method = params.method;
    this.url = params.url;
    this.status = params.status;
    this.body = params.body;
    this.operationOutcome = params.operationOutcome;
  }
}

export function extractOperationOutcome(body: unknown): FhirOperationOutcome | undefined {
  if (!body || typeof body !== "object") {
    return undefined;
  }

  const maybeOutcome = body as { resourceType?: unknown };

  if (maybeOutcome.resourceType !== "OperationOutcome") {
    return undefined;
  }

  return body as FhirOperationOutcome;
}

export function buildHttpErrorMessage(params: {
  method: string;
  url: string;
  status: number;
  operationOutcome?: FhirOperationOutcome;
}): string {
  const diagnostic = params.operationOutcome?.issue?.[0]?.diagnostics;

  if (diagnostic) {
    return `FHIR ${params.method} ${params.url} failed with status ${params.status}: ${diagnostic}`;
  }

  return `FHIR ${params.method} ${params.url} failed with status ${params.status}`;
}
