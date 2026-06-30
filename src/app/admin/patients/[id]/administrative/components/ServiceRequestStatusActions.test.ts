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
const updatePatientServiceRequestRequestedAtActionMock = vi.hoisted(() => vi.fn());
const markPatientServiceRequestAsEnteredInErrorActionMock = vi.hoisted(() => vi.fn());
vi.mock("@/app/admin/patients/[id]/administrative/actions", () => ({
  updatePatientServiceRequestStatusAction: updatePatientServiceRequestStatusActionMock,
  acceptAndStartTreatmentFromServiceRequestAction: acceptAndStartTreatmentFromServiceRequestActionMock,
  updatePatientServiceRequestRequestedAtAction: updatePatientServiceRequestRequestedAtActionMock,
  markPatientServiceRequestAsEnteredInErrorAction: markPatientServiceRequestAsEnteredInErrorActionMock,
}));

import {
  canEditServiceRequestRequestedAt,
  canMarkServiceRequestEnteredInError,
  getCloseLikeStatusFromAction,
  getServiceRequestStatusActions,
  ServiceRequestStatusActions,
  buildAcceptAndStartTreatmentFormData,
  resolveInitialTreatmentStartDate,
  submitMarkServiceRequestEnteredInErrorAction,
  submitServiceRequestRequestedAtAction,
  submitServiceRequestStatusAction,
} from "@/app/admin/patients/[id]/administrative/components/ServiceRequestStatusActions";
import { formatLocalDateInputValue } from "@/lib/date-input";

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
        defaultTreatmentStartDate: "2026-04-28",
      }),
    );

    expect(html).toContain("Aceptar e iniciar tratamiento");
    expect(html).toContain("Fecha para iniciar tratamiento");
    expect(html).toContain("value=\"2026-04-28\"");
    expect(html).toContain("No inició");
    expect(html).toContain("Cancelar");
    expect(html).toContain("Editar fecha");
    expect(html).toContain("Eliminar carga errónea");
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
    expect(html).toContain("Editar fecha");
    expect(html).toContain("Eliminar carga errónea");
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

  it("helper returns visibility for requestedAt edit and logical deletion", () => {
    expect(canEditServiceRequestRequestedAt("in_review")).toBe(true);
    expect(canEditServiceRequestRequestedAt("accepted_pending_treatment")).toBe(true);
    expect(canEditServiceRequestRequestedAt("accepted_linked_active_treatment")).toBe(false);
    expect(canMarkServiceRequestEnteredInError("in_review")).toBe(true);
    expect(canMarkServiceRequestEnteredInError("accepted_pending_treatment")).toBe(true);
    expect(canMarkServiceRequestEnteredInError("closed_without_treatment")).toBe(false);
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
      message: "La solicitud se cerró como No inició.",
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
      message: "La solicitud fue cancelada.",
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

  it("submit helper sends requestedAt payload", async () => {
    updatePatientServiceRequestRequestedAtActionMock.mockResolvedValueOnce({
      ok: true,
      message: "Fecha actualizada correctamente.",
    });

    await submitServiceRequestRequestedAtAction({
      patientId: "pat-1",
      serviceRequestId: "sr-date",
      requestedAt: "2026-06-29",
    });

    const [, formData] = updatePatientServiceRequestRequestedAtActionMock.mock.calls[0] as [string, FormData];
    expect(formData.get("id")).toBe("sr-date");
    expect(formData.get("requestedAt")).toBe("2026-06-29");
  });

  it("submit helper sends entered_in_error logical deletion payload", async () => {
    markPatientServiceRequestAsEnteredInErrorActionMock.mockResolvedValueOnce({
      ok: true,
      message: "Solicitud marcada como carga errónea.",
    });

    await submitMarkServiceRequestEnteredInErrorAction({
      patientId: "pat-1",
      serviceRequestId: "sr-delete",
    });

    const [, formData] = markPatientServiceRequestAsEnteredInErrorActionMock.mock.calls[0] as [string, FormData];
    expect(formData.get("id")).toBe("sr-delete");
  });

  it("builds accept/start form data with the chosen treatmentStartDate", () => {
    const formData = buildAcceptAndStartTreatmentFormData({
      serviceRequestId: "sr-33",
      treatmentStartDate: "2026-05-03",
    });

    expect(formData.get("id")).toBe("sr-33");
    expect(formData.get("treatmentStartDate")).toBe("2026-05-03");
  });

  it("uses local calendar default when defaultTreatmentStartDate is missing or invalid", () => {
    const localToday = formatLocalDateInputValue();

    expect(resolveInitialTreatmentStartDate()).toBe(localToday);
    expect(resolveInitialTreatmentStartDate("invalid")).toBe(localToday);
  });

  it("preserves requestedAt default when it is a valid yyyy-mm-dd", () => {
    expect(resolveInitialTreatmentStartDate("2026-05-10")).toBe("2026-05-10");
  });

  it("uses request-specific copy for requestedAt editing without the old treatment-start label", () => {
    const html = renderToStaticMarkup(
      createElement(ServiceRequestStatusActions, {
        patientId: "pat-1",
        serviceRequestId: "sr-20",
        currentStatus: "accepted",
        displayStatus: "accepted_pending_treatment",
        defaultTreatmentStartDate: "2026-05-10",
      }),
    );

    expect(html).toContain("Editar fecha");
    expect(html).not.toContain("Fecha de inicio del tratamiento");
  });
});
