import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  isOperationalPendingServiceRequest,
  loadPatientClinicalRecentSummary,
  loadPatientAdministrativeContext,
  loadPatientHubServiceRequestContext,
  loadPatientServiceRequestHistoryContext,
  loadPatientServiceRequestContext,
  loadTreatmentServiceRequestContext,
  sortServiceRequestsByRequestedAtDesc,
} from "@/app/admin/patients/[id]/data";

vi.mock("@/infrastructure/repositories/service-request.repository", () => ({
  listServiceRequestsByPatientId: vi.fn(),
}));

vi.mock("@/infrastructure/repositories/encounter.repository", () => ({
  listEncountersByPatientId: vi.fn(),
}));

vi.mock("@/infrastructure/repositories/observation.repository", () => ({
  listFunctionalObservationsByEncounterId: vi.fn(),
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

vi.mock("@/app/admin/patients/[id]/clinical-context", () => ({
  loadEpisodeClinicalContextReadModel: vi.fn(),
}));

import { getActiveEpisodeByPatientId, getMostRecentEpisodeByPatientId, listEpisodeOfCareByIncomingReferral } from "@/infrastructure/repositories/episode-of-care.repository";
import { listEncountersByPatientId } from "@/infrastructure/repositories/encounter.repository";
import { listFunctionalObservationsByEncounterId } from "@/infrastructure/repositories/observation.repository";
import { getPatientById } from "@/infrastructure/repositories/patient.repository";
import { listServiceRequestsByPatientId } from "@/infrastructure/repositories/service-request.repository";
import { loadEpisodeClinicalContextReadModel } from "@/app/admin/patients/[id]/clinical-context";

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

  it("marks accepted with linked active episode as started treatment and accepted_linked_active_treatment", async () => {
    vi.mocked(listServiceRequestsByPatientId).mockResolvedValueOnce([
      { id: "sr-linked", patientId: "pat-1", requestedAt: "2026-04-22", reasonText: "Motivo", status: "accepted" },
    ] as never);
    vi.mocked(listEpisodeOfCareByIncomingReferral).mockResolvedValueOnce([{ id: "ep-1", status: "active", startDate: "2026-04-23" }] as never);

    const context = await loadPatientServiceRequestHistoryContext("pat-1");

    expect(context.activeServiceRequest).toBeNull();
    expect(context.historicalServiceRequests).toHaveLength(1);
    expect(context.historicalServiceRequests[0]).toMatchObject({
      displayStatus: "accepted_linked_active_treatment",
      startedTreatment: true,
      linkedEpisodeOfCareId: "ep-1",
      isPendingOperational: false,
    });
  });

  it("marks accepted with linked finished episode as accepted_linked_finished_treatment", async () => {
    vi.mocked(listServiceRequestsByPatientId).mockResolvedValueOnce([
      { id: "sr-finished", patientId: "pat-1", requestedAt: "2026-04-22", reasonText: "Motivo", status: "accepted" },
    ] as never);
    vi.mocked(listEpisodeOfCareByIncomingReferral).mockResolvedValueOnce([{
      id: "ep-2",
      status: "finished",
      startDate: "2026-04-20",
      endDate: "2026-04-29",
      closureReason: "clinical_discharge",
      closureDetail: "Alta",
    }] as never);

    const context = await loadPatientServiceRequestHistoryContext("pat-1");
    expect(context.historicalServiceRequests[0]).toMatchObject({
      displayStatus: "accepted_linked_finished_treatment",
      linkedEpisode: {
        id: "ep-2",
        status: "finished",
        closureReason: "clinical_discharge",
        closureDetail: "Alta",
      },
    });
  });

  it("auto-resolves treatment context when there is exactly one accepted pending request", async () => {
    vi.mocked(listServiceRequestsByPatientId).mockResolvedValueOnce([
      { id: "sr-auto", patientId: "pat-1", requestedAt: "2026-04-22", reasonText: "Motivo", status: "accepted" },
    ] as never);
    vi.mocked(listEpisodeOfCareByIncomingReferral).mockResolvedValueOnce([]);

    const context = await loadTreatmentServiceRequestContext({
      patientId: "pat-1",
    });

    expect(context).toEqual({
      serviceRequestId: "sr-auto",
      isValid: true,
      serviceRequest: expect.objectContaining({ id: "sr-auto", status: "accepted" }),
      state: "valid",
      message: undefined,
    });
  });

  it("returns multiple_pending treatment context when more than one accepted pending request exists", async () => {
    vi.mocked(listServiceRequestsByPatientId).mockResolvedValueOnce([
      { id: "sr-1", patientId: "pat-1", requestedAt: "2026-04-22", reasonText: "Motivo 1", status: "accepted" },
      { id: "sr-2", patientId: "pat-1", requestedAt: "2026-04-21", reasonText: "Motivo 2", status: "accepted" },
    ] as never);
    vi.mocked(listEpisodeOfCareByIncomingReferral)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    const context = await loadTreatmentServiceRequestContext({
      patientId: "pat-1",
    });

    expect(context).toEqual({
      serviceRequestId: undefined,
      isValid: false,
      serviceRequest: undefined,
      state: "multiple_pending",
      message: "Hay más de una solicitud aceptada pendiente. Elegí cuál usar desde Gestión administrativa antes de iniciar tratamiento.",
    });
  });

  it("classifies mixed accepted requests by their linked treatment cycle", async () => {
    const closedEpisodeOld = {
      id: "episode-closed-old",
      patientId: "pat-1",
      status: "finished",
      startDate: "2026-01-01",
      endDate: "2026-01-31",
      closureReason: "treatment_completed",
    };
    const activeEpisode = {
      id: "episode-active",
      patientId: "pat-1",
      status: "active",
      startDate: "2026-05-01",
    };

    vi.mocked(listServiceRequestsByPatientId).mockResolvedValueOnce([
      { id: "sr-pending", patientId: "pat-1", requestedAt: "2026-05-10", reasonText: "Nuevo pedido", status: "accepted" },
      { id: "sr-active", patientId: "pat-1", requestedAt: "2026-05-01", reasonText: "Pedido activo", status: "accepted" },
      { id: "sr-finished", patientId: "pat-1", requestedAt: "2026-01-01", reasonText: "Pedido cerrado", status: "accepted" },
    ] as never);
    vi.mocked(listEpisodeOfCareByIncomingReferral)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([activeEpisode] as never)
      .mockResolvedValueOnce([closedEpisodeOld] as never);

    const context = await loadPatientServiceRequestHistoryContext("pat-1");

    expect(context.activeServiceRequest?.serviceRequest.id).toBe("sr-pending");
    expect(context.activeServiceRequest?.displayStatus).toBe("accepted_pending_treatment");
    expect(context.activeServiceRequest?.isPendingOperational).toBe(true);
    expect(context.historicalServiceRequests).toEqual([
      expect.objectContaining({
        serviceRequest: expect.objectContaining({ id: "sr-active" }),
        displayStatus: "accepted_linked_active_treatment",
        startedTreatment: true,
        isPendingOperational: false,
        linkedEpisode: expect.objectContaining({ id: "episode-active", status: "active" }),
      }),
      expect.objectContaining({
        serviceRequest: expect.objectContaining({ id: "sr-finished" }),
        displayStatus: "accepted_linked_finished_treatment",
        startedTreatment: true,
        isPendingOperational: false,
        linkedEpisode: expect.objectContaining({ id: "episode-closed-old", status: "finished" }),
      }),
    ]);
  });

});

describe("loadPatientClinicalRecentSummary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses active episode as effective cycle and ignores previous finished visits and metrics", async () => {
    const closedEpisodeOld = {
      id: "episode-closed-old",
      patientId: "pat-1",
      status: "finished",
      startDate: "2026-01-01",
      endDate: "2026-01-31",
    };
    const closedEpisodeRecent = {
      id: "episode-closed-recent",
      patientId: "pat-1",
      status: "finished",
      startDate: "2026-03-01",
      endDate: "2026-03-31",
    };
    const activeEpisode = {
      id: "episode-active",
      patientId: "pat-1",
      status: "active",
      startDate: "2026-05-01",
    };

    vi.mocked(getActiveEpisodeByPatientId).mockResolvedValueOnce(activeEpisode as never);
    vi.mocked(getMostRecentEpisodeByPatientId).mockResolvedValueOnce(closedEpisodeRecent as never);
    vi.mocked(listEncountersByPatientId).mockResolvedValueOnce([
      { id: "enc-old", patientId: "pat-1", episodeOfCareId: closedEpisodeOld.id, startedAt: "2026-01-15T10:00:00Z", status: "finished" },
      { id: "enc-recent", patientId: "pat-1", episodeOfCareId: closedEpisodeRecent.id, startedAt: "2026-03-15T10:00:00Z", status: "finished" },
    ] as never);
    vi.mocked(listFunctionalObservationsByEncounterId).mockResolvedValue([
      { id: "obs-recent", patientId: "pat-1", encounterId: "enc-recent", effectiveDateTime: "2026-03-15T10:00:00Z", code: "pain_nrs_0_10", value: 8, unit: "/10", status: "final" },
    ] as never);
    vi.mocked(loadEpisodeClinicalContextReadModel).mockResolvedValueOnce({
      hasAnyContent: true,
      medicalReferenceDiagnosisText: "Diagnóstico del activo",
    } as never);

    const summary = await loadPatientClinicalRecentSummary("pat-1");

    expect(summary).toMatchObject({
      treatmentStatusLabel: "Nuevo tratamiento activo",
      latestEncounterLabel: "Aún no registrada",
      encountersCount: 0,
      metrics: [],
      metricsEmptyLabel: "Sin registros funcionales todavía",
      medicalReferenceDiagnosisText: "Diagnóstico del activo",
      ctaLabel: "Registrar primera visita",
    });
    expect(listFunctionalObservationsByEncounterId).not.toHaveBeenCalled();
    expect(loadEpisodeClinicalContextReadModel).toHaveBeenCalledWith(activeEpisode);
  });
});

describe("isOperationalPendingServiceRequest", () => {
  it("returns true for in_review", () => {
    expect(isOperationalPendingServiceRequest({ status: "in_review", hasIncomingReferralLink: false })).toBe(true);
  });

  it("returns true for accepted without incoming-referral", () => {
    expect(isOperationalPendingServiceRequest({ status: "accepted", hasIncomingReferralLink: false })).toBe(true);
  });

  it("returns false for accepted with incoming-referral and terminal statuses", () => {
    expect(isOperationalPendingServiceRequest({ status: "accepted", hasIncomingReferralLink: true })).toBe(false);
    expect(isOperationalPendingServiceRequest({ status: "closed_without_treatment", hasIncomingReferralLink: false })).toBe(false);
    expect(isOperationalPendingServiceRequest({ status: "cancelled", hasIncomingReferralLink: false })).toBe(false);
    expect(isOperationalPendingServiceRequest({ status: "entered_in_error", hasIncomingReferralLink: false })).toBe(false);
  });
});
