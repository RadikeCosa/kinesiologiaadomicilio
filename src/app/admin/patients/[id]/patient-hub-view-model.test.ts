import { describe, expect, it } from "vitest";

import { buildPatientHubViewModel } from "@/app/admin/patients/[id]/patient-hub-view-model";
import type { PatientDetailReadModel } from "@/features/patients/read-models/patient-detail.read-model";
import type {
  PatientClinicalRecentSummary,
  PatientHubServiceRequestContext,
} from "@/app/admin/patients/[id]/data";

function buildPatient(overrides: Partial<PatientDetailReadModel> = {}): PatientDetailReadModel {
  return {
    id: "pat-1",
    firstName: "Ana",
    lastName: "Pérez",
    fullName: "Ana Pérez",
    operationalStatus: "preliminary",
    createdAt: "2026-04-17T00:00:00.000Z",
    updatedAt: "2026-04-17T00:00:00.000Z",
    ...overrides,
  };
}

function buildSummary(overrides: Partial<PatientClinicalRecentSummary> = {}): PatientClinicalRecentSummary {
  return {
    treatmentStatusLabel: "Sin tratamiento activo",
    latestEncounterLabel: "No disponible",
    encountersCount: 0,
    metrics: [],
    metricsEmptyLabel: "Sin registros funcionales",
    ctaLabel: "Ver gestión clínica",
    ...overrides,
  };
}

function buildServiceRequestContext(
  overrides: Partial<PatientHubServiceRequestContext> = {},
): PatientHubServiceRequestContext {
  return {
    hasServiceRequests: false,
    hasInReview: false,
    pendingAcceptedServiceRequestId: undefined,
    latestClosedRequestStatus: undefined,
    latestClosedRequestReason: undefined,
    ...overrides,
  };
}

describe("buildPatientHubViewModel primary action matrix", () => {
  it("uses Gestión administrativa for preliminary", () => {
    const viewModel = buildPatientHubViewModel({
      patient: buildPatient({
        operationalStatus: "preliminary",
      }),
      clinicalRecentSummary: buildSummary(),
      serviceRequestContext: buildServiceRequestContext(),
    });

    expect(viewModel.primaryAction.label).toBe("Gestión administrativa");
    expect(viewModel.primaryAction.href).toBe("/admin/patients/pat-1/administrative");
  });

  it("uses Gestión administrativa for ready_to_start without accepted pending request", () => {
    const viewModel = buildPatientHubViewModel({
      patient: buildPatient({
        operationalStatus: "ready_to_start",
        address: "Belgrano 123",
        phone: "+54 299 555 0101",
      }),
      clinicalRecentSummary: buildSummary(),
      serviceRequestContext: buildServiceRequestContext({
        hasServiceRequests: true,
      }),
    });

    expect(viewModel.primaryAction.label).toBe("Gestión administrativa");
    expect(viewModel.primaryAction.href).toBe("/admin/patients/pat-1/administrative");
  });

  it("uses Tratamiento for ready_to_start with accepted pending request", () => {
    const viewModel = buildPatientHubViewModel({
      patient: buildPatient({
        operationalStatus: "ready_to_start",
        address: "Belgrano 123",
        phone: "+54 299 555 0101",
      }),
      clinicalRecentSummary: buildSummary(),
      serviceRequestContext: buildServiceRequestContext({
        hasServiceRequests: true,
        pendingAcceptedServiceRequestId: "sr-1",
      }),
    });

    expect(viewModel.primaryAction.label).toBe("Tratamiento");
    expect(viewModel.primaryAction.href).toBe("/admin/patients/pat-1/treatment");
  });

  it("uses Registrar visita for active treatment", () => {
    const viewModel = buildPatientHubViewModel({
      patient: buildPatient({
        operationalStatus: "active_treatment",
        activeEpisode: {
          id: "ep-1",
          patientId: "pat-1",
          status: "active",
          startDate: "2026-04-17",
        },
      }),
      clinicalRecentSummary: buildSummary({
        treatmentStatusLabel: "Tratamiento activo",
      }),
      serviceRequestContext: buildServiceRequestContext(),
    });

    expect(viewModel.primaryAction.label).toBe("Registrar visita");
    expect(viewModel.primaryAction.href).toBe("/admin/patients/pat-1/encounters/new");
  });

  it("uses Gestión administrativa for finished_treatment without accepted pending request", () => {
    const viewModel = buildPatientHubViewModel({
      patient: buildPatient({
        operationalStatus: "finished_treatment",
        latestEpisode: {
          id: "ep-1",
          patientId: "pat-1",
          status: "finished",
          startDate: "2026-01-01",
          endDate: "2026-02-01",
        },
      }),
      clinicalRecentSummary: buildSummary({
        treatmentStatusLabel: "Tratamiento finalizado",
      }),
      serviceRequestContext: buildServiceRequestContext({
        hasServiceRequests: true,
      }),
    });

    expect(viewModel.primaryAction.label).toBe("Gestión administrativa");
    expect(viewModel.primaryAction.href).toBe("/admin/patients/pat-1/administrative");
  });

  it("uses Tratamiento for finished_treatment with accepted pending request", () => {
    const viewModel = buildPatientHubViewModel({
      patient: buildPatient({
        operationalStatus: "finished_treatment",
        latestEpisode: {
          id: "ep-1",
          patientId: "pat-1",
          status: "finished",
          startDate: "2026-01-01",
          endDate: "2026-02-01",
        },
      }),
      clinicalRecentSummary: buildSummary({
        treatmentStatusLabel: "Tratamiento finalizado",
      }),
      serviceRequestContext: buildServiceRequestContext({
        hasServiceRequests: true,
        pendingAcceptedServiceRequestId: "sr-1",
      }),
    });

    expect(viewModel.primaryAction.label).toBe("Tratamiento");
    expect(viewModel.primaryAction.href).toBe("/admin/patients/pat-1/treatment");
  });
});
