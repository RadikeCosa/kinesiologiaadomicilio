import { describe, expect, it } from "vitest";

import {
  extractServiceRequestNoteFields,
  mapFhirServiceRequestStatusToDomainStatus,
  mapFhirServiceRequestToDomain,
} from "@/infrastructure/mappers/service-request/service-request-read.mapper";
import {
  buildServiceRequestNotes,
  mapCreateServiceRequestInputToFhir,
  mapServiceRequestStatusToFhirStatus,
} from "@/infrastructure/mappers/service-request/service-request-write.mapper";

describe("service-request mappers", () => {
  it("maps create input to minimal FHIR payload with defaults", () => {
    const mapped = mapCreateServiceRequestInputToFhir({
      patientId: "pat-1",
      requestedAt: "2026-04-28",
      reasonText: "Dolor lumbar",
    });

    expect(mapped).toEqual({
      resourceType: "ServiceRequest",
      status: "active",
      intent: "order",
      subject: { reference: "Patient/pat-1" },
      authoredOn: "2026-04-28",
      reasonCode: [{ text: "Dolor lumbar" }],
      requester: undefined,
      note: undefined,
    });
  });

  it("does not include optional empty fields in create payload", () => {
    const mapped = mapCreateServiceRequestInputToFhir({
      patientId: "pat-1",
      requestedAt: "2026-04-28",
      reasonText: "Dolor lumbar",
      requesterDisplay: "   ",
      reportedDiagnosisText: " ",
      requesterContact: "",
      notes: "   ",
    });

    expect(mapped.requester).toBeUndefined();
    expect(mapped.note).toBeUndefined();
  });

  it("maps requesterDisplay and tagged notes", () => {
    const mapped = mapCreateServiceRequestInputToFhir({
      patientId: "pat-1",
      requestedAt: "2026-04-28",
      reasonText: "Dolor lumbar",
      requesterDisplay: " Dra. Pérez ",
      reportedDiagnosisText: " Gonalgia ",
      requesterContact: " +54 9 299 123 4567 ",
      notes: " Control en 7 días ",
    });

    expect(mapped.requester).toEqual({ display: "Dra. Pérez" });
    expect(mapped.note).toEqual([
      { text: "reported-diagnosis:v1:Gonalgia" },
      { text: "requester-contact:v1:+54 9 299 123 4567" },
      { text: "general-note:v1:Control en 7 días" },
    ]);
  });

  it("maps domain status to FHIR status", () => {
    expect(mapServiceRequestStatusToFhirStatus("in_review")).toBe("active");
    expect(mapServiceRequestStatusToFhirStatus("accepted")).toBe("active");
    expect(mapServiceRequestStatusToFhirStatus("closed_without_treatment")).toBe("revoked");
    expect(mapServiceRequestStatusToFhirStatus("cancelled")).toBe("revoked");
    expect(mapServiceRequestStatusToFhirStatus("entered_in_error")).toBe("entered-in-error");
  });

  it("buildServiceRequestNotes returns only tagged known entries", () => {
    const notes = buildServiceRequestNotes({
      reportedDiagnosisText: " Dx informado ",
      requesterContact: undefined,
      notes: " Nota general ",
    });

    expect(notes).toEqual([
      { text: "reported-diagnosis:v1:Dx informado" },
      { text: "general-note:v1:Nota general" },
    ]);
  });

  it("maps minimal FHIR payload to domain using active -> in_review policy", () => {
    const mapped = mapFhirServiceRequestToDomain({
      resourceType: "ServiceRequest",
      id: "sr-1",
      status: "active",
      subject: { reference: "Patient/pat-1" },
      authoredOn: "2026-04-28",
      reasonCode: [{ text: "Dolor lumbar" }],
    });

    expect(mapped).toEqual({
      id: "sr-1",
      patientId: "pat-1",
      requestedAt: "2026-04-28",
      requesterDisplay: undefined,
      reasonText: "Dolor lumbar",
      status: "in_review",
      closedReasonText: undefined,
      reportedDiagnosisText: undefined,
      requesterContact: undefined,
      notes: undefined,
    });
  });

  it("extracts requesterDisplay, statusReason and tagged notes", () => {
    const mapped = mapFhirServiceRequestToDomain({
      resourceType: "ServiceRequest",
      id: "sr-2",
      status: "revoked",
      subject: { reference: "Patient/pat-2" },
      authoredOn: "2026-04-28",
      reasonCode: [{ text: "Dolor de rodilla" }],
      requester: { display: "Dr. House" },
      statusReason: { text: "Paciente cancela turno" },
      note: [
        { text: "reported-diagnosis:v1:Gonalgia" },
        { text: "requester-contact:v1:+54 9 299 111111" },
        { text: "general-note:v1:Reprogramar" },
        { text: "unknown-tag:v1:ignore" },
      ],
    });

    expect(mapped.requesterDisplay).toBe("Dr. House");
    expect(mapped.closedReasonText).toBe("Paciente cancela turno");
    expect(mapped.reportedDiagnosisText).toBe("Gonalgia");
    expect(mapped.requesterContact).toBe("+54 9 299 111111");
    expect(mapped.notes).toBe("Reprogramar");
    expect(mapped.status).toBe("cancelled");
    expect(mapped.requesterType).toBeUndefined();
  });

  it("maps entered-in-error to entered_in_error", () => {
    expect(
      mapFhirServiceRequestStatusToDomainStatus({
        status: "entered-in-error",
      }),
    ).toBe("entered_in_error");
  });

  it("maps revoked without signal to closed_without_treatment by default policy", () => {
    expect(
      mapFhirServiceRequestStatusToDomainStatus({
        status: "revoked",
      }),
    ).toBe("closed_without_treatment");
  });

  it("extractServiceRequestNoteFields is tolerant to unknown/empty notes", () => {
    const fields = extractServiceRequestNoteFields([
      { text: undefined },
      { text: "" },
      { text: "unknown:v1:value" },
      { text: "reported-diagnosis:v1:  " },
      { text: "requester-contact:v1:+54 9" },
    ]);

    expect(fields).toEqual({
      reportedDiagnosisText: undefined,
      requesterContact: "+54 9",
      notes: undefined,
    });
  });

  it("extracts patientId from versioned reference", () => {
    const mapped = mapFhirServiceRequestToDomain({
      resourceType: "ServiceRequest",
      id: "sr-3",
      status: "active",
      subject: { reference: "Patient/pat-3/_history/7" },
      authoredOn: "2026-04-28",
      reasonCode: [{ text: "Consulta" }],
    });

    expect(mapped.patientId).toBe("pat-3");
  });
});
