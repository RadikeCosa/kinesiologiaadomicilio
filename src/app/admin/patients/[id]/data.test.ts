import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  loadPatientAdministrativeContext,
  loadPatientHubServiceRequestContext,
  loadPatientServiceRequestContext,
  sortServiceRequestsByRequestedAtDesc,
} from "@/app/admin/patients/[id]/data";

vi.mock("@/infrastructure/repositories/service-request.repository", () => ({
  listServiceRequestsByPatientId: vi.fn(),
}));

vi.mock("@/infrastructure/repositories/patient.repository", () => ({
  getPatientById: vi.fn(),
}));

vi.mock("@/infrastructure/repositories/episode-of-care.repository", () => ({
  getActiveEpisodeByPatientId: vi.fn(),
  getMostRecentEpisodeByPatientId: vi.fn(),
  listEpisodeOfCareByIncomingReferral: vi.fn(),
}));

vi.mock("@/infrastructure/mappers/episode-of-care/episode-of-care-read.mapper", () => ({
  mapEpisodeOfCareRead: vi.fn((episode) => episode),
}));

vi.mock("@/infrastructure/mappers/patient/patient-read.mapper", () => ({
  mapPatientToDetailReadModel: vi.fn((patient) => ({
    id: patient.id,
    fullName: "Ana Pérez",
    firstName: "Ana",
    lastName: "Pérez",
    dni: "30111222",
    operationalStatus: "active_treatment",
    activeEpisode: { id: "ep-1", status: "active", patientId: patient.id },
    latestEpisode: { id: "ep-1", status: "active", patientId: patient.id },
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  })),
}));

import { getActiveEpisodeByPatientId, getMostRecentEpisodeByPatientId, listEpisodeOfCareByIncomingReferral } from "@/infrastructure/repositories/episode-of-care.repository";
import { getPatientById } from "@/infrastructure/repositories/patient.repository";
import { listServiceRequestsByPatientId } from "@/infrastructure/repositories/service-request.repository";

describe("patient detail service-request technical composition", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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


  it("builds hub SR context with accepted pending and in_review", async () => {
    vi.mocked(listServiceRequestsByPatientId).mockResolvedValueOnce([
      { id: "sr-accepted", patientId: "pat-1", requestedAt: "2026-04-22", reasonText: "Motivo", status: "accepted" },
      { id: "sr-review", patientId: "pat-1", requestedAt: "2026-04-21", reasonText: "Otro", status: "in_review" },
    ] as never);
    vi.mocked(listEpisodeOfCareByIncomingReferral).mockResolvedValueOnce([]);

    const context = await loadPatientHubServiceRequestContext("pat-1");

    expect(context).toEqual({
      hasServiceRequests: true,
      hasInReview: true,
      pendingAcceptedServiceRequestId: "sr-accepted",
      latestClosedRequestStatus: undefined,
      latestClosedRequestReason: undefined,
    });
  });

  it("builds hub SR context without pending accepted when all accepted are used", async () => {
    vi.mocked(listServiceRequestsByPatientId).mockResolvedValueOnce([
      { id: "sr-used", patientId: "pat-1", requestedAt: "2026-04-22", reasonText: "Motivo", status: "accepted" },
    ] as never);
    vi.mocked(listEpisodeOfCareByIncomingReferral).mockResolvedValueOnce([{ id: "ep-1" }] as never);

    const context = await loadPatientHubServiceRequestContext("pat-1");

    expect(context).toEqual({
      hasServiceRequests: true,
      hasInReview: false,
      pendingAcceptedServiceRequestId: undefined,
      latestClosedRequestStatus: undefined,
      latestClosedRequestReason: undefined,
    });
  });
  it("loads administrative context with patient + serviceRequests without changing operationalStatus", async () => {
    vi.mocked(getPatientById).mockResolvedValueOnce({ id: "pat-1" } as never);
    vi.mocked(getActiveEpisodeByPatientId).mockResolvedValueOnce({ id: "ep-1", status: "active" } as never);
    vi.mocked(getMostRecentEpisodeByPatientId).mockResolvedValueOnce(null);
    vi.mocked(listServiceRequestsByPatientId).mockResolvedValueOnce([
      {
        id: "sr-9",
        patientId: "pat-1",
        requestedAt: "2026-04-22",
        reasonText: "Motivo",
        status: "accepted",
      },
    ]);

    const context = await loadPatientAdministrativeContext("pat-1");

    expect(context.patient?.id).toBe("pat-1");
    expect(context.patient?.operationalStatus).toBe("active_treatment");
    expect(context.serviceRequests).toHaveLength(1);
    expect(context.latestServiceRequest?.id).toBe("sr-9");
  });

  it("returns null patient and empty serviceRequests for missing patient", async () => {
    vi.mocked(getPatientById).mockResolvedValueOnce(null);

    const context = await loadPatientAdministrativeContext("pat-missing");

    expect(context).toEqual({
      patient: null,
      serviceRequests: [],
      latestServiceRequest: null,
    });
    expect(listServiceRequestsByPatientId).not.toHaveBeenCalled();
  });


  it("includes latest closed request reason when available", async () => {
    vi.mocked(listServiceRequestsByPatientId).mockResolvedValueOnce([
      { id: "sr-closed", patientId: "pat-1", requestedAt: "2026-04-22", reasonText: "Motivo", status: "closed_without_treatment", closedReasonText: "Motivos económicos" },
      { id: "sr-review", patientId: "pat-1", requestedAt: "2026-04-21", reasonText: "Otro", status: "in_review" },
    ] as never);

    const context = await loadPatientHubServiceRequestContext("pat-1");

    expect(context.latestClosedRequestStatus).toBe("closed_without_treatment");
    expect(context.latestClosedRequestReason).toBe("Motivos económicos");
  });

});
