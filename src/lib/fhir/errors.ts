import { type FhirOperationOutcome } from "@/lib/fhir/types";

export type FhirErrorKind = "http" | "network" | "timeout" | "config";

interface FhirClientErrorParams {
  message: string;
  method: string;
  url: string;
  status?: number;
  body?: unknown;
  operationOutcome?: FhirOperationOutcome;
  kind?: FhirErrorKind;
  safeMessage?: string;
  isOperational?: boolean;
  cause?: unknown;
}

export class FhirClientError extends Error {
  readonly method: string;
  readonly url: string;
  readonly status?: number;
  readonly body?: unknown;
  readonly operationOutcome?: FhirOperationOutcome;
  readonly kind?: FhirErrorKind;
  readonly safeMessage?: string;
  readonly isOperational: boolean;

  constructor(params: FhirClientErrorParams) {
    super(params.message);
    this.name = "FhirClientError";
    this.method = params.method;
    this.url = params.url;
    this.status = params.status;
    this.body = params.body;
    this.operationOutcome = params.operationOutcome;
    this.kind = params.kind;
    this.safeMessage = params.safeMessage;
    this.isOperational = params.isOperational ?? false;
    if (params.cause !== undefined) {
      this.cause = params.cause;
    }
  }
}

export function isOperationalFhirError(error: unknown): error is FhirClientError {
  return error instanceof FhirClientError && error.isOperational;
}

export function buildSafeOperationalMessage(kind: FhirErrorKind): string {
  switch (kind) {
    case "config":
      return "La integración clínica no está configurada correctamente.";
    case "timeout":
    case "network":
    case "http":
    default:
      return "No se pudo acceder al servidor clínico en este momento.";
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

export function createFhirHttpError(params: {
  method: string;
  url: string;
  status: number;
  body?: unknown;
  operationOutcome?: FhirOperationOutcome;
}): FhirClientError {
  return new FhirClientError({
    message: buildHttpErrorMessage(params),
    method: params.method,
    url: params.url,
    status: params.status,
    body: params.body,
    operationOutcome: params.operationOutcome,
    kind: "http",
    safeMessage: buildSafeOperationalMessage("http"),
    isOperational: params.status >= 500,
  });
}

export function createFhirConfigError(params: {
  message: string;
  details?: string;
}): FhirClientError {
  return new FhirClientError({
    message: params.details ? `${params.message}: ${params.details}` : params.message,
    method: "CONFIG",
    url: "env:FHIR_BASE_URL",
    kind: "config",
    safeMessage: buildSafeOperationalMessage("config"),
    isOperational: true,
  });
}

export function createFhirNetworkError(params: {
  method: string;
  url: string;
  cause: unknown;
  kind: "network" | "timeout";
}): FhirClientError {
  const suffix = params.kind === "timeout" ? "timed out" : "failed before receiving a response";

  return new FhirClientError({
    message: `FHIR ${params.method} ${params.url} ${suffix}`,
    method: params.method,
    url: params.url,
    kind: params.kind,
    safeMessage: buildSafeOperationalMessage(params.kind),
    isOperational: true,
    cause: params.cause,
  });
}
