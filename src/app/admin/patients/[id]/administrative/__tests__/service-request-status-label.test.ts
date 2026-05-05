import { describe, expect, it } from "vitest";

import {
  getServiceRequestCardPresentation,
  getServiceRequestStatusLabel,
} from "@/app/admin/patients/[id]/administrative/service-request-status-label";

describe("getServiceRequestStatusLabel", () => {
  it("maps all known statuses to non-technical labels", () => {
    expect(getServiceRequestStatusLabel("in_review")).toBe("En evaluación");
    expect(getServiceRequestStatusLabel("accepted")).toBe("Aceptada");
    expect(getServiceRequestStatusLabel("closed_without_treatment")).toBe("No inició");
    expect(getServiceRequestStatusLabel("cancelled")).toBe("Cancelada");
    expect(getServiceRequestStatusLabel("entered_in_error")).toBe("Error de carga");
  });
});

describe("getServiceRequestCardPresentation", () => {
  it("uses amber (not emerald) for accepted requests linked to finished treatment", () => {
    const result = getServiceRequestCardPresentation("accepted_linked_finished_treatment", "accepted");

    expect(result.requestStatus.label).toBe("Aceptada");
    expect(result.clinicalStatus?.label).toBe("Tratamiento finalizado");
    expect(result.clinicalStatus?.className).toContain("bg-amber-50");
    expect(result.clinicalStatus?.className).not.toContain("bg-emerald-50");
    expect(result.isActionable).toBe(false);
  });

  it("uses emerald for accepted requests linked to active treatment", () => {
    const result = getServiceRequestCardPresentation("accepted_linked_active_treatment", "accepted");

    expect(result.requestStatus.className).toContain("bg-emerald-50");
    expect(result.clinicalStatus?.className).toContain("bg-emerald-50");
    expect(result.isActionable).toBe(false);
  });

  it("renders historical statuses as non-actionable slate", () => {
    const closed = getServiceRequestCardPresentation("closed_without_treatment", "closed_without_treatment");
    const cancelled = getServiceRequestCardPresentation("cancelled", "cancelled");

    expect(closed.requestStatus.className).toContain("bg-slate-100");
    expect(cancelled.requestStatus.className).toContain("bg-slate-100");
    expect(closed.isActionable).toBe(false);
    expect(cancelled.isActionable).toBe(false);
  });
});
