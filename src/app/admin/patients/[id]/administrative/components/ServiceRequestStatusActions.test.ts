import React, { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const routerPushMock = vi.hoisted(() => vi.fn());
const routerRefreshMock = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: routerPushMock, refresh: routerRefreshMock }),
}));

const updatePatientServiceRequestStatusActionMock = vi.hoisted(() => vi.fn());
const acceptAndStartTreatmentFromServiceRequestActionMock = vi.hoisted(() => vi.fn());
vi.mock("@/app/admin/patients/[id]/administrative/actions", () => ({
  updatePatientServiceRequestStatusAction: updatePatientServiceRequestStatusActionMock,
  acceptAndStartTreatmentFromServiceRequestAction: acceptAndStartTreatmentFromServiceRequestActionMock,
}));

import {
  getCloseLikeStatusFromAction,
  getServiceRequestStatusActions,
  ServiceRequestStatusActions,
  submitServiceRequestStatusAction,
} from "@/app/admin/patients/[id]/administrative/components/ServiceRequestStatusActions";

(globalThis as { React?: typeof React }).React = React;

describe("ServiceRequestStatusActions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("in_review exposes Aceptar, No inició y Cancelar", () => {
    const html = renderToStaticMarkup(
      createElement(ServiceRequestStatusActions, {
        patientId: "pat-1",
        serviceRequestId: "sr-1",
        currentStatus: "in_review",
        displayStatus: "in_review",
      }),
    );

    expect(html).toContain("Aceptar e iniciar tratamiento");
    expect(html).toContain("No inició");
    expect(html).toContain("Cancelar");
    expect(html).not.toContain("Registrar visita");
    expect(html).not.toContain("Iniciar tratamiento");
  });

  it("accepted pending shows legacy start action and no resolution", () => {
    const html = renderToStaticMarkup(
      createElement(ServiceRequestStatusActions, {
        patientId: "pat-1",
        serviceRequestId: "sr-2",
        currentStatus: "accepted",
        displayStatus: "accepted_pending_treatment",
      }),
    );

    expect(html).not.toContain("Aceptar e iniciar tratamiento");
    expect(html).toContain("Iniciar tratamiento");
    expect(html).not.toContain("No inició");
  });

  it("terminal statuses and entered_in_error do not render standard actions", () => {
    const closedHtml = renderToStaticMarkup(
      createElement(ServiceRequestStatusActions, {
        patientId: "pat-1",
        serviceRequestId: "sr-3",
        currentStatus: "closed_without_treatment",
        displayStatus: "closed_without_treatment",
      }),
    );
    const cancelledHtml = renderToStaticMarkup(
      createElement(ServiceRequestStatusActions, {
        patientId: "pat-1",
        serviceRequestId: "sr-4",
        currentStatus: "cancelled",
        displayStatus: "cancelled",
      }),
    );
    const enteredInErrorHtml = renderToStaticMarkup(
      createElement(ServiceRequestStatusActions, {
        patientId: "pat-1",
        serviceRequestId: "sr-5",
        currentStatus: "entered_in_error",
        displayStatus: "entered_in_error",
      }),
    );

    expect(closedHtml).toBe("");
    expect(cancelledHtml).toBe("");
    expect(enteredInErrorHtml).toBe("");
  });

  it("helper returns expected actions by status", () => {
    expect(getServiceRequestStatusActions("in_review")).toEqual([
      "accept_and_start_treatment",
      "close_without_treatment",
      "cancel",
    ]);
    expect(getServiceRequestStatusActions("accepted_pending_treatment")).toEqual(["start_treatment_legacy"]);
    expect(getServiceRequestStatusActions("accepted_linked_active_treatment")).toEqual([]);
    expect(getServiceRequestStatusActions("accepted_linked_finished_treatment")).toEqual([]);
    expect(getServiceRequestStatusActions("closed_without_treatment")).toEqual([]);
    expect(getServiceRequestStatusActions("cancelled")).toEqual([]);
    expect(getServiceRequestStatusActions("entered_in_error")).toEqual([]);
  });

  it("maps close actions to close-like statuses", () => {
    expect(getCloseLikeStatusFromAction("close_without_treatment")).toBe("closed_without_treatment");
    expect(getCloseLikeStatusFromAction("cancel")).toBe("cancelled");
    expect(getCloseLikeStatusFromAction("accept_and_start_treatment")).toBeNull();
    expect(getCloseLikeStatusFromAction(null)).toBeNull();
  });

  it("submit helper sends accepted payload", async () => {
    updatePatientServiceRequestStatusActionMock.mockResolvedValueOnce({
      ok: true,
      message: "Solicitud aceptada correctamente.",
    });

    await submitServiceRequestStatusAction({
      patientId: "pat-1",
      serviceRequestId: "sr-10",
      status: "accepted",
    });

    const [, formData] = updatePatientServiceRequestStatusActionMock.mock.calls[0] as [string, FormData];
    expect(updatePatientServiceRequestStatusActionMock).toHaveBeenCalledWith("pat-1", expect.any(FormData));
    expect(formData.get("id")).toBe("sr-10");
    expect(formData.get("status")).toBe("accepted");
    expect(formData.get("closedReasonText")).toBeNull();
  });

  it("submit helper sends closed_without_treatment + reason payload", async () => {
    updatePatientServiceRequestStatusActionMock.mockResolvedValueOnce({
      ok: true,
      message: "Solicitud cerrada sin iniciar tratamiento.",
    });

    await submitServiceRequestStatusAction({
      patientId: "pat-1",
      serviceRequestId: "sr-11",
      status: "closed_without_treatment",
      closedReasonText: "No requiere tratamiento",
    });

    const [, formData] = updatePatientServiceRequestStatusActionMock.mock.calls[0] as [string, FormData];
    expect(formData.get("id")).toBe("sr-11");
    expect(formData.get("status")).toBe("closed_without_treatment");
    expect(formData.get("closedReasonText")).toBe("No requiere tratamiento");
  });

  it("submit helper sends cancelled + reason payload", async () => {
    updatePatientServiceRequestStatusActionMock.mockResolvedValueOnce({
      ok: true,
      message: "Solicitud cancelada correctamente.",
    });

    await submitServiceRequestStatusAction({
      patientId: "pat-1",
      serviceRequestId: "sr-12",
      status: "cancelled",
      closedReasonText: "Paciente cancela",
    });

    const [, formData] = updatePatientServiceRequestStatusActionMock.mock.calls[0] as [string, FormData];
    expect(formData.get("id")).toBe("sr-12");
    expect(formData.get("status")).toBe("cancelled");
    expect(formData.get("closedReasonText")).toBe("Paciente cancela");
  });
});
