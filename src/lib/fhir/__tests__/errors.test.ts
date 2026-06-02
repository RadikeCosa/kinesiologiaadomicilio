import { describe, expect, it } from "vitest";

import {
  FhirClientError,
  buildHttpErrorMessage,
  createFhirConfigError,
  createFhirHttpError,
  createFhirNetworkError,
  extractOperationOutcome,
  isOperationalFhirError,
} from "@/lib/fhir/errors";

describe("fhir errors", () => {
  it("extracts OperationOutcome from response body", () => {
    const outcome = {
      resourceType: "OperationOutcome",
      issue: [{ diagnostics: "Invalid identifier" }],
    };

    expect(extractOperationOutcome(outcome)).toEqual(outcome);
    expect(extractOperationOutcome({ resourceType: "Patient" })).toBeUndefined();
  });

  it("builds readable HTTP message with diagnostics when available", () => {
    const message = buildHttpErrorMessage({
      method: "GET",
      url: "http://localhost:8080/fhir/Patient",
      status: 400,
      operationOutcome: {
        resourceType: "OperationOutcome",
        issue: [{ diagnostics: "Identifier malformed" }],
      },
    });

    expect(message).toContain("status 400");
    expect(message).toContain("Identifier malformed");
  });

  it("creates typed error with debugging fields", () => {
    const error = new FhirClientError({
      message: "request failed",
      method: "POST",
      url: "http://localhost:8080/fhir/Patient",
      status: 500,
      body: { error: "server_error" },
    });

    expect(error.name).toBe("FhirClientError");
    expect(error.status).toBe(500);
    expect(error.body).toEqual({ error: "server_error" });
  });

  it("marks 5xx HTTP failures as operational", () => {
    const error = createFhirHttpError({
      method: "GET",
      url: "http://localhost:8080/fhir/Patient",
      status: 503,
    });

    expect(error.kind).toBe("http");
    expect(error.isOperational).toBe(true);
    expect(isOperationalFhirError(error)).toBe(true);
    expect(error.safeMessage).toContain("servidor clínico");
  });

  it("keeps 404 resource misses out of operational fallback flow", () => {
    const error = createFhirHttpError({
      method: "GET",
      url: "http://localhost:8080/fhir/Patient/pat-1",
      status: 404,
    });

    expect(error.isOperational).toBe(false);
    expect(isOperationalFhirError(error)).toBe(false);
  });

  it("creates operational config and network errors with safe messages", () => {
    const configError = createFhirConfigError({
      message: "Missing required server env var: FHIR_BASE_URL",
    });
    const networkError = createFhirNetworkError({
      method: "GET",
      url: "http://localhost:8080/fhir/Patient",
      cause: new TypeError("fetch failed"),
      kind: "network",
    });

    expect(configError.kind).toBe("config");
    expect(configError.isOperational).toBe(true);
    expect(configError.safeMessage).toContain("configurada");
    expect(networkError.kind).toBe("network");
    expect(networkError.isOperational).toBe(true);
    expect(networkError.safeMessage).toContain("servidor clínico");
  });
});
