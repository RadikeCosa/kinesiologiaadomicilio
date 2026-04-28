import { describe, expect, it } from "vitest";

import {
  createServiceRequestSchema,
  updateServiceRequestStatusSchema,
} from "@/domain/service-request/service-request.schemas";

describe("service-request.schemas", () => {
  it("parses create input with required fields", () => {
    const parsed = createServiceRequestSchema.parse({
      patientId: " pat-001 ",
      requestedAt: " 2026-04-28 ",
      reasonText: " Dolor lumbar ",
    });

    expect(parsed).toEqual({
      patientId: "pat-001",
      requestedAt: "2026-04-28",
      reasonText: "Dolor lumbar",
      requesterDisplay: undefined,
      requesterType: undefined,
      requesterContact: undefined,
      reportedDiagnosisText: undefined,
      notes: undefined,
    });
  });

  it("parses create input with optional fields", () => {
    const parsed = createServiceRequestSchema.parse({
      patientId: "pat-001",
      requestedAt: "2026-04-28",
      reasonText: "Dolor de rodilla",
      requesterDisplay: " Dra. Pérez ",
      requesterType: "physician",
      requesterContact: " +54 9 299 123 4567 ",
      reportedDiagnosisText: " Gonalgia ",
      notes: " Derivación externa ",
    });

    expect(parsed).toEqual({
      patientId: "pat-001",
      requestedAt: "2026-04-28",
      reasonText: "Dolor de rodilla",
      requesterDisplay: "Dra. Pérez",
      requesterType: "physician",
      requesterContact: "+54 9 299 123 4567",
      reportedDiagnosisText: "Gonalgia",
      notes: "Derivación externa",
    });
  });

  it("fails without patientId", () => {
    expect(() =>
      createServiceRequestSchema.parse({
        requestedAt: "2026-04-28",
        reasonText: "Dolor",
      }),
    ).toThrow("patientId: debe ser un string.");
  });

  it("fails without requestedAt", () => {
    expect(() =>
      createServiceRequestSchema.parse({
        patientId: "pat-001",
        reasonText: "Dolor",
      }),
    ).toThrow("requestedAt: debe ser un string.");
  });

  it("fails with invalid requestedAt", () => {
    expect(() =>
      createServiceRequestSchema.parse({
        patientId: "pat-001",
        requestedAt: "2026-13-28",
        reasonText: "Dolor",
      }),
    ).toThrow("requestedAt: formato inválido (YYYY-MM-DD).");
  });

  it("fails without reasonText", () => {
    expect(() =>
      createServiceRequestSchema.parse({
        patientId: "pat-001",
        requestedAt: "2026-04-28",
      }),
    ).toThrow("reasonText: debe ser un string.");
  });

  it("fails with invalid requesterType", () => {
    expect(() =>
      createServiceRequestSchema.parse({
        patientId: "pat-001",
        requestedAt: "2026-04-28",
        reasonText: "Dolor",
        requesterType: "nurse",
      }),
    ).toThrow("requesterType: valor inválido.");
  });

  it("parses status update and trims strings", () => {
    const parsed = updateServiceRequestStatusSchema.parse({
      id: " sr-001 ",
      status: " accepted ",
      closedReasonText: "   ",
    });

    expect(parsed).toEqual({
      id: "sr-001",
      status: "accepted",
      closedReasonText: undefined,
    });
  });

  it("fails with invalid status", () => {
    expect(() =>
      updateServiceRequestStatusSchema.parse({
        id: "sr-001",
        status: "completed",
      }),
    ).toThrow("status: valor inválido.");
  });

  it("requires closedReasonText for closed_without_treatment", () => {
    expect(() =>
      updateServiceRequestStatusSchema.parse({
        id: "sr-001",
        status: "closed_without_treatment",
      }),
    ).toThrow("closedReasonText: es obligatorio para closed_without_treatment/cancelled.");
  });

  it("requires closedReasonText for cancelled", () => {
    expect(() =>
      updateServiceRequestStatusSchema.parse({
        id: "sr-001",
        status: "cancelled",
      }),
    ).toThrow("closedReasonText: es obligatorio para closed_without_treatment/cancelled.");
  });

  it("accepts closedReasonText for cancelled", () => {
    const parsed = updateServiceRequestStatusSchema.parse({
      id: "sr-001",
      status: "cancelled",
      closedReasonText: " No responde ",
    });

    expect(parsed).toEqual({
      id: "sr-001",
      status: "cancelled",
      closedReasonText: "No responde",
    });
  });

  it("fails with invalid shape", () => {
    expect(() => createServiceRequestSchema.parse("invalid-shape")).toThrow(
      "createServiceRequestSchema: se esperaba un objeto.",
    );
  });
});
