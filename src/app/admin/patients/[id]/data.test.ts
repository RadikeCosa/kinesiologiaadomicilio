import { describe, expect, it, vi } from "vitest";

import {
  loadPatientServiceRequestContext,
  sortServiceRequestsByRequestedAtDesc,
} from "@/app/admin/patients/[id]/data";

vi.mock("@/infrastructure/repositories/service-request.repository", () => ({
  listServiceRequestsByPatientId: vi.fn(),
}));

import { listServiceRequestsByPatientId } from "@/infrastructure/repositories/service-request.repository";

describe("patient detail service-request technical composition", () => {
  it("loads empty context when repository returns empty list", async () => {
    vi.mocked(listServiceRequestsByPatientId).mockResolvedValueOnce([]);

    const context = await loadPatientServiceRequestContext("pat-1");

    expect(context).toEqual({
      serviceRequests: [],
      latestServiceRequest: null,
    });
  });

  it("orders by requestedAt desc and resolves latestServiceRequest", async () => {
    vi.mocked(listServiceRequestsByPatientId).mockResolvedValueOnce([
      {
        id: "sr-1",
        patientId: "pat-1",
        requestedAt: "2026-04-01",
        reasonText: "Dolor",
        status: "in_review",
      },
      {
        id: "sr-3",
        patientId: "pat-1",
        requestedAt: "2026-04-21",
        reasonText: "Control",
        status: "accepted",
      },
      {
        id: "sr-2",
        patientId: "pat-1",
        requestedAt: "2026-04-21",
        reasonText: "Seguimiento",
        status: "in_review",
      },
    ]);

    const context = await loadPatientServiceRequestContext("pat-1");

    expect(context.serviceRequests.map((item) => item.id)).toEqual(["sr-3", "sr-2", "sr-1"]);
    expect(context.latestServiceRequest?.id).toBe("sr-3");
  });

  it("returns empty context when patientId is blank", async () => {
    const context = await loadPatientServiceRequestContext("   ");

    expect(context).toEqual({
      serviceRequests: [],
      latestServiceRequest: null,
    });
    expect(listServiceRequestsByPatientId).not.toHaveBeenCalled();
  });

  it("sort helper keeps deterministic order for same requestedAt", () => {
    const sorted = sortServiceRequestsByRequestedAtDesc([
      {
        id: "sr-10",
        patientId: "pat-1",
        requestedAt: "2026-04-10",
        reasonText: "a",
        status: "in_review",
      },
      {
        id: "sr-11",
        patientId: "pat-1",
        requestedAt: "2026-04-10",
        reasonText: "b",
        status: "in_review",
      },
    ]);

    expect(sorted.map((item) => item.id)).toEqual(["sr-11", "sr-10"]);
  });
});
