import { FhirClientError } from "@/lib/fhir/errors";

export class AdminOperationalError extends Error {
  readonly reason: "fhir_unavailable" | "fhir_config";

  constructor(params: {
    message: string;
    reason: "fhir_unavailable" | "fhir_config";
    cause?: unknown;
  }) {
    super(params.message);
    this.name = "AdminOperationalError";
    this.reason = params.reason;
    if (params.cause !== undefined) {
      this.cause = params.cause;
    }
  }
}

export function toAdminOperationalError(error: FhirClientError): AdminOperationalError {
  return new AdminOperationalError({
    message: error.safeMessage ?? "No se pudo cargar la información clínica.",
    reason: error.kind === "config" ? "fhir_config" : "fhir_unavailable",
    cause: error,
  });
}
