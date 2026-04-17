import { describe, expect, it } from "vitest";

import { FhirClientError, buildHttpErrorMessage, extractOperationOutcome } from "@/lib/fhir/errors";

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
});
