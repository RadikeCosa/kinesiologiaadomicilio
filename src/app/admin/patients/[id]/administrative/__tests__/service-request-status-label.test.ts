import { describe, expect, it } from "vitest";

import { getServiceRequestStatusLabel } from "@/app/admin/patients/[id]/administrative/service-request-status-label";

describe("getServiceRequestStatusLabel", () => {
  it("maps all known statuses to non-technical labels", () => {
    expect(getServiceRequestStatusLabel("in_review")).toBe("En evaluación");
    expect(getServiceRequestStatusLabel("accepted")).toBe("Aceptada");
    expect(getServiceRequestStatusLabel("closed_without_treatment")).toBe("No inició");
    expect(getServiceRequestStatusLabel("cancelled")).toBe("Cancelada");
    expect(getServiceRequestStatusLabel("entered_in_error")).toBe("Error de carga");
  });
});
