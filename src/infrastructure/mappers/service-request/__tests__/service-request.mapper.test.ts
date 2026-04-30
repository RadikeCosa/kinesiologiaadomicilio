import { describe, expect, it } from "vitest";

import {
  extractServiceRequestNoteFields,
  mapFhirServiceRequestStatusToDomainStatus,
  mapFhirServiceRequestToDomain,
} from "@/infrastructure/mappers/service-request/service-request-read.mapper";
import {
  applyServiceRequestStatusUpdateToFhir,
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

  it("create minimal does not add workflow-status note", () => {
    const mapped = mapCreateServiceRequestInputToFhir({
      patientId: "pat-1",
      requestedAt: "2026-04-28",
      reasonText: "Dolor lumbar",
    });

    expect(mapped.note).toBeUndefined();
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

  it("applies accepted update as active and clears statusReason", () => {
    const updated = applyServiceRequestStatusUpdateToFhir(
      {
        resourceType: "ServiceRequest",
        id: "sr-1",
        status: "revoked",
        statusReason: { text: "Motivo previo" },
        note: [{ text: "general-note:v1:Nota previa" }],
      },
      {
        id: "sr-1",
        status: "accepted",
      },
    );

    expect(updated.status).toBe("active");
    expect(updated.statusReason).toBeUndefined();
    expect(updated.note).toEqual([
      { text: "general-note:v1:Nota previa" },
      { text: "workflow-status:v1:accepted" },
    ]);
  });

  it("applies closed_without_treatment update as revoked with statusReason", () => {
    const updated = applyServiceRequestStatusUpdateToFhir(
      {
        resourceType: "ServiceRequest",
        id: "sr-2",
        status: "active",
      },
      {
        id: "sr-2",
        status: "closed_without_treatment",
        closedReasonText: "No requiere tratamiento en este momento",
      },
    );

    expect(updated.status).toBe("revoked");
    expect(updated.statusReason).toEqual({ text: "No requiere tratamiento en este momento" });
  });

  it("applies cancelled update as revoked with statusReason", () => {
    const updated = applyServiceRequestStatusUpdateToFhir(
      {
        resourceType: "ServiceRequest",
        id: "sr-3",
        status: "active",
      },
      {
        id: "sr-3",
        status: "cancelled",
        closedReasonText: "Paciente cancela",
      },
    );

    expect(updated.status).toBe("revoked");
    expect(updated.statusReason).toEqual({ text: "Paciente cancela" });
  });

  it("applies entered_in_error update as entered-in-error", () => {
    const updated = applyServiceRequestStatusUpdateToFhir(
      {
        resourceType: "ServiceRequest",
        id: "sr-4",
        status: "active",
      },
      {
        id: "sr-4",
        status: "entered_in_error",
      },
    );

    expect(updated.status).toBe("entered-in-error");
    expect(updated.statusReason).toBeUndefined();
  });

  it("removes workflow-status when moving back to in_review", () => {
    const updated = applyServiceRequestStatusUpdateToFhir(
      {
        resourceType: "ServiceRequest",
        id: "sr-4b",
        status: "active",
        note: [
          { text: "workflow-status:v1:accepted" },
          { text: "general-note:v1:Seguimiento" },
        ],
      },
      {
        id: "sr-4b",
        status: "in_review",
      },
    );

    expect(updated.status).toBe("active");
    expect(updated.note).toEqual([{ text: "general-note:v1:Seguimiento" }]);
  });

  it("removes workflow-status when closing or cancelling and preserves unrelated notes", () => {
    const closed = applyServiceRequestStatusUpdateToFhir(
      {
        resourceType: "ServiceRequest",
        id: "sr-4c",
        status: "active",
        note: [
          { text: "workflow-status:v1:accepted" },
          { text: "general-note:v1:Seguimiento" },
        ],
      },
      {
        id: "sr-4c",
        status: "closed_without_treatment",
        closedReasonText: "No corresponde",
      },
    );

    const cancelled = applyServiceRequestStatusUpdateToFhir(
      {
        resourceType: "ServiceRequest",
        id: "sr-4d",
        status: "active",
        note: [
          { text: "workflow-status:v1:accepted" },
          { text: "general-note:v1:Seguimiento" },
        ],
      },
      {
        id: "sr-4d",
        status: "cancelled",
        closedReasonText: "Paciente cancela",
      },
    );

    expect(closed.note).toEqual([{ text: "general-note:v1:Seguimiento" }]);
    expect(cancelled.note).toEqual([{ text: "general-note:v1:Seguimiento" }]);
    expect(closed.statusReason).toEqual({ text: "No corresponde" });
    expect(cancelled.statusReason).toEqual({ text: "Paciente cancela" });
  });

  it("does not duplicate workflow-status when accepted multiple times", () => {
    const updated = applyServiceRequestStatusUpdateToFhir(
      {
        resourceType: "ServiceRequest",
        id: "sr-4e",
        status: "active",
        note: [
          { text: "workflow-status:v1:accepted" },
          { text: "general-note:v1:Seguimiento" },
        ],
      },
      {
        id: "sr-4e",
        status: "accepted",
      },
    );

    expect(updated.note).toEqual([
      { text: "general-note:v1:Seguimiento" },
      { text: "workflow-status:v1:accepted" },
    ]);
  });

  it("preserves existing fields and keeps unrelated note/requester/subject/reasonCode on accepted", () => {
    const resource = {
      resourceType: "ServiceRequest" as const,
      id: "sr-5",
      status: "active" as const,
      intent: "order" as const,
      subject: { reference: "Patient/pat-1" },
      authoredOn: "2026-04-28",
      reasonCode: [{ text: "Dolor lumbar" }],
      requester: { display: "Dra. Pérez" },
      note: [{ text: "general-note:v1:Nota" }],
    };

    const updated = applyServiceRequestStatusUpdateToFhir(resource, {
      id: "sr-5",
      status: "accepted",
    });

    expect(updated).toMatchObject({
      id: "sr-5",
      status: "active",
      intent: "order",
      subject: { reference: "Patient/pat-1" },
      authoredOn: "2026-04-28",
      reasonCode: [{ text: "Dolor lumbar" }],
      requester: { display: "Dra. Pérez" },
      note: [
        { text: "general-note:v1:Nota" },
        { text: "workflow-status:v1:accepted" },
      ],
    });
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

  it("maps minimal FHIR active payload without workflow note as in_review", () => {
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

  it("maps active + workflow-status:v1:accepted as accepted", () => {
    const mapped = mapFhirServiceRequestToDomain({
      resourceType: "ServiceRequest",
      id: "sr-accepted",
      status: "active",
      subject: { reference: "Patient/pat-2" },
      authoredOn: "2026-04-28",
      reasonCode: [{ text: "Dolor de rodilla" }],
      note: [{ text: "workflow-status:v1:accepted" }],
    });

    expect(mapped.status).toBe("accepted");
  });

  it("maps active + unknown workflow-status as in_review", () => {
    const mapped = mapFhirServiceRequestToDomain({
      resourceType: "ServiceRequest",
      id: "sr-unknown-workflow",
      status: "active",
      subject: { reference: "Patient/pat-2" },
      authoredOn: "2026-04-28",
      reasonCode: [{ text: "Dolor de rodilla" }],
      note: [{ text: "workflow-status:v1:pending" }],
    });

    expect(mapped.status).toBe("in_review");
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

  it("falls back to statusReason.coding display/text when statusReason.text is missing", () => {
    const mappedFromDisplay = mapFhirServiceRequestToDomain({
      resourceType: "ServiceRequest",
      id: "sr-coding-display",
      status: "revoked",
      subject: { reference: "Patient/pat-2" },
      authoredOn: "2026-04-28",
      reasonCode: [{ text: "Dolor de rodilla" }],
      statusReason: { coding: [{ display: "Paciente derivado a otra cobertura" }] },
    });
    const mappedFromText = mapFhirServiceRequestToDomain({
      resourceType: "ServiceRequest",
      id: "sr-coding-text",
      status: "revoked",
      subject: { reference: "Patient/pat-2" },
      authoredOn: "2026-04-28",
      reasonCode: [{ text: "Dolor de rodilla" }],
      statusReason: { coding: [{ text: "Motivo alternativo" }] },
    });

    expect(mappedFromDisplay.closedReasonText).toBe("Paciente derivado a otra cobertura");
    expect(mappedFromText.closedReasonText).toBe("Motivo alternativo");
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
