import { afterEach, describe, expect, it, vi } from "vitest";

import { fhirClient } from "@/lib/fhir/client";
import { FhirClientError } from "@/lib/fhir/errors";
import { buildServiceRequestBySubjectQuery } from "@/lib/fhir/search-params";
import {
  createServiceRequest,
  getServiceRequestById,
  listServiceRequestsByPatientId,
  updateServiceRequestStatus,
} from "@/infrastructure/repositories/service-request.repository";

describe("service-request.repository (FHIR)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates and maps service request", async () => {
    const postSpy = vi.spyOn(fhirClient, "post").mockResolvedValue({
      resourceType: "ServiceRequest",
      id: "sr-1",
      status: "active",
      intent: "order",
      subject: { reference: "Patient/pat-1" },
      authoredOn: "2026-04-28",
      reasonCode: [{ text: "Dolor lumbar" }],
    });

    const created = await createServiceRequest({
      patientId: " pat-1 ",
      requestedAt: " 2026-04-28 ",
      reasonText: " Dolor lumbar ",
    });

    expect(postSpy).toHaveBeenCalledWith(
      "ServiceRequest",
      expect.objectContaining({
        resourceType: "ServiceRequest",
        status: "active",
        intent: "order",
        subject: { reference: "Patient/pat-1" },
        authoredOn: "2026-04-28",
        reasonCode: [{ text: "Dolor lumbar" }],
      }),
    );
    expect(created).toMatchObject({
      id: "sr-1",
      patientId: "pat-1",
      status: "in_review",
      reasonText: "Dolor lumbar",
    });
  });

  it("validates input on create", async () => {
    const postSpy = vi.spyOn(fhirClient, "post");

    await expect(
      createServiceRequest({
        patientId: "pat-1",
        requestedAt: "invalid-date",
        reasonText: "Dolor",
      }),
    ).rejects.toThrow("requestedAt: formato inválido (YYYY-MM-DD).");

    expect(postSpy).not.toHaveBeenCalled();
  });

  it("lists by subject=Patient/{id} and maps resources", async () => {
    const getSpy = vi.spyOn(fhirClient, "get").mockResolvedValue({
      resourceType: "Bundle",
      entry: [
        {
          resource: {
            resourceType: "ServiceRequest",
            id: "sr-1",
            status: "active",
            subject: { reference: "Patient/pat-1" },
            authoredOn: "2026-04-28",
            reasonCode: [{ text: "Dolor lumbar" }],
          },
        },
        {
          resource: {
            resourceType: "Patient",
            id: "pat-1",
          },
        },
      ],
    });

    const results = await listServiceRequestsByPatientId("pat-1");

    expect(getSpy).toHaveBeenCalledWith("ServiceRequest?subject=Patient%2Fpat-1");
    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({ id: "sr-1", patientId: "pat-1" });
  });

  it("returns [] for empty bundle", async () => {
    vi.spyOn(fhirClient, "get").mockResolvedValue({
      resourceType: "Bundle",
      entry: [],
    });

    const results = await listServiceRequestsByPatientId("pat-1");

    expect(results).toEqual([]);
  });

  it("returns [] when patientId is empty in list", async () => {
    const getSpy = vi.spyOn(fhirClient, "get");
    const results = await listServiceRequestsByPatientId("   ");

    expect(results).toEqual([]);
    expect(getSpy).not.toHaveBeenCalled();
  });

  it("gets service request by id", async () => {
    const getSpy = vi.spyOn(fhirClient, "get").mockResolvedValue({
      resourceType: "ServiceRequest",
      id: "sr-9",
      status: "entered-in-error",
      subject: { reference: "Patient/pat-1" },
      authoredOn: "2026-04-28",
      reasonCode: [{ text: "Motivo" }],
    });

    const found = await getServiceRequestById("sr-9");

    expect(getSpy).toHaveBeenCalledWith("ServiceRequest/sr-9");
    expect(found).toMatchObject({ id: "sr-9", status: "entered_in_error" });
  });

  it("returns null on get by id 404", async () => {
    vi.spyOn(fhirClient, "get").mockRejectedValue(
      new FhirClientError({
        message: "not found",
        method: "GET",
        url: "http://localhost:8080/fhir/ServiceRequest/missing",
        status: 404,
      }),
    );

    const found = await getServiceRequestById("missing");

    expect(found).toBeNull();
  });

  it("propagates non-404 errors on get by id", async () => {
    vi.spyOn(fhirClient, "get").mockRejectedValue(
      new FhirClientError({
        message: "boom",
        method: "GET",
        url: "http://localhost:8080/fhir/ServiceRequest/sr-1",
        status: 500,
      }),
    );

    await expect(getServiceRequestById("sr-1")).rejects.toBeInstanceOf(FhirClientError);
  });

  it("builds service request subject query", () => {
    expect(buildServiceRequestBySubjectQuery("pat-1")).toBe("subject=Patient%2Fpat-1");
  });

  it("updates status: GET + PUT + mapped domain response", async () => {
    const getSpy = vi.spyOn(fhirClient, "get").mockResolvedValue({
      resourceType: "ServiceRequest",
      id: "sr-11",
      status: "active",
      intent: "order",
      subject: { reference: "Patient/pat-1" },
      authoredOn: "2026-04-20",
      reasonCode: [{ text: "Motivo original" }],
      note: [{ text: "general-note:v1:Nota original" }],
    });
    const putSpy = vi.spyOn(fhirClient, "put").mockResolvedValue({
      resourceType: "ServiceRequest",
      id: "sr-11",
      status: "active",
      intent: "order",
      subject: { reference: "Patient/pat-1" },
      authoredOn: "2026-04-20",
      reasonCode: [{ text: "Motivo original" }],
      note: [{ text: "general-note:v1:Nota original" }],
    });

    const updated = await updateServiceRequestStatus({
      id: " sr-11 ",
      status: " accepted ",
    });

    expect(getSpy).toHaveBeenCalledWith("ServiceRequest/sr-11");
    expect(putSpy).toHaveBeenCalledWith(
      "ServiceRequest/sr-11",
      expect.objectContaining({
        resourceType: "ServiceRequest",
        id: "sr-11",
        status: "active",
      }),
    );
    expect(updated).toMatchObject({
      id: "sr-11",
      patientId: "pat-1",
      status: "in_review",
      reasonText: "Motivo original",
    });
  });

  it("updates closed_without_treatment with revoked + statusReason.text + resolution note", async () => {
    vi.spyOn(fhirClient, "get").mockResolvedValue({
      resourceType: "ServiceRequest",
      id: "sr-12",
      status: "active",
      subject: { reference: "Patient/pat-1" },
      authoredOn: "2026-04-20",
      reasonCode: [{ text: "Motivo original" }],
    });
    const putSpy = vi.spyOn(fhirClient, "put").mockResolvedValue({
      resourceType: "ServiceRequest",
      id: "sr-12",
      status: "revoked",
      statusReason: { text: "No requiere tratamiento" },
      subject: { reference: "Patient/pat-1" },
      authoredOn: "2026-04-20",
      reasonCode: [{ text: "Motivo original" }],
    });

    await updateServiceRequestStatus({
      id: "sr-12",
      status: "closed_without_treatment",
      closedReasonText: "No requiere tratamiento",
    });

    expect(putSpy).toHaveBeenCalledWith(
      "ServiceRequest/sr-12",
      expect.objectContaining({
        status: "revoked",
        statusReason: { text: "No requiere tratamiento" },
        note: [{ text: "resolution-reason:v1:No requiere tratamiento" }],
      }),
    );
  });

  it("updates cancelled with revoked + statusReason.text + resolution note", async () => {
    vi.spyOn(fhirClient, "get").mockResolvedValue({
      resourceType: "ServiceRequest",
      id: "sr-13",
      status: "active",
      subject: { reference: "Patient/pat-1" },
      authoredOn: "2026-04-20",
      reasonCode: [{ text: "Motivo original" }],
    });
    const putSpy = vi.spyOn(fhirClient, "put").mockResolvedValue({
      resourceType: "ServiceRequest",
      id: "sr-13",
      status: "revoked",
      statusReason: { text: "Paciente cancela" },
      subject: { reference: "Patient/pat-1" },
      authoredOn: "2026-04-20",
      reasonCode: [{ text: "Motivo original" }],
    });

    await updateServiceRequestStatus({
      id: "sr-13",
      status: "cancelled",
      closedReasonText: "Paciente cancela",
    });

    expect(putSpy).toHaveBeenCalledWith(
      "ServiceRequest/sr-13",
      expect.objectContaining({
        status: "revoked",
        statusReason: { text: "Paciente cancela" },
        note: [{ text: "resolution-reason:v1:Paciente cancela" }],
      }),
    );
  });

  it("does not call GET/PUT when update input is invalid", async () => {
    const getSpy = vi.spyOn(fhirClient, "get");
    const putSpy = vi.spyOn(fhirClient, "put");

    await expect(
      updateServiceRequestStatus({
        id: "sr-14",
        status: "cancelled",
      }),
    ).rejects.toThrow("closedReasonText: es obligatorio para closed_without_treatment/cancelled.");

    expect(getSpy).not.toHaveBeenCalled();
    expect(putSpy).not.toHaveBeenCalled();
  });

  it("throws clear error on GET 404", async () => {
    vi.spyOn(fhirClient, "get").mockRejectedValue(
      new FhirClientError({
        message: "not found",
        method: "GET",
        url: "http://localhost:8080/fhir/ServiceRequest/sr-missing",
        status: 404,
      }),
    );

    await expect(
      updateServiceRequestStatus({
        id: "sr-missing",
        status: "accepted",
      }),
    ).rejects.toThrow("ServiceRequest not found: sr-missing");
  });

  it("propagates non-404 GET errors during update", async () => {
    vi.spyOn(fhirClient, "get").mockRejectedValue(
      new FhirClientError({
        message: "boom",
        method: "GET",
        url: "http://localhost:8080/fhir/ServiceRequest/sr-15",
        status: 500,
      }),
    );

    await expect(
      updateServiceRequestStatus({
        id: "sr-15",
        status: "accepted",
      }),
    ).rejects.toBeInstanceOf(FhirClientError);
  });
});
