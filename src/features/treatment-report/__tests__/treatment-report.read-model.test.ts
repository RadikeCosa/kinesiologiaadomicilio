import type { Encounter } from "@/domain/encounter/encounter.types";
import type { EpisodeOfCare } from "@/domain/episode-of-care/episode-of-care.types";
import type { FunctionalObservation } from "@/domain/functional-observation/functional-observation.types";
import type { Patient } from "@/domain/patient/patient.types";
import type { SigningProfessionalConfig } from "@/domain/signing-professional/signing-professional.types";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getPatientById: vi.fn(),
  getEpisodeById: vi.fn(),
  listEncountersByPatientId: vi.fn(),
  listFunctionalObservationsByEncounterIds: vi.fn(),
  loadSigningProfessionalConfig: vi.fn(),
  loadEpisodeClinicalContextReadModel: vi.fn(),
}));

vi.mock("@/infrastructure/repositories/patient.repository", () => ({
  getPatientById: mocks.getPatientById,
}));

vi.mock("@/infrastructure/repositories/episode-of-care.repository", () => ({
  getEpisodeById: mocks.getEpisodeById,
}));

vi.mock("@/infrastructure/repositories/encounter.repository", () => ({
  listEncountersByPatientId: mocks.listEncountersByPatientId,
}));

vi.mock("@/infrastructure/repositories/observation.repository", () => ({
  listFunctionalObservationsByEncounterIds: mocks.listFunctionalObservationsByEncounterIds,
}));

vi.mock("@/features/signing-professional/read-models/signing-professional-config.read-model", () => ({
  loadSigningProfessionalConfig: mocks.loadSigningProfessionalConfig,
}));

vi.mock("@/app/admin/patients/[id]/clinical-context", () => ({
  loadEpisodeClinicalContextReadModel: mocks.loadEpisodeClinicalContextReadModel,
}));

import { loadTreatmentReportContext } from "@/features/treatment-report/treatment-report.read-model";

const patient: Patient = {
  id: "pat-1",
  firstName: "Ana",
  lastName: "Perez",
  dni: "12345678",
  phone: "+54 9 299 123 4567",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const activeEpisode: EpisodeOfCare = {
  id: "epi-1",
  patientId: "pat-1",
  status: "active",
  startDate: "2026-05-01",
};

const finishedEpisode: EpisodeOfCare = {
  id: "epi-2",
  patientId: "pat-1",
  status: "finished",
  startDate: "2026-03-01",
  endDate: "2026-04-01",
  closureReason: "treatment_completed",
  closureDetail: "Alta funcional.",
};

const encounters: Encounter[] = [
  {
    id: "enc-current-1",
    patientId: "pat-1",
    episodeOfCareId: "epi-1",
    status: "finished",
    startedAt: "2026-05-10T10:00:00.000Z",
    endedAt: "2026-05-10T11:00:00.000Z",
    clinicalNote: {
      intervention: "Trabajo activo asistido.",
    },
  },
  {
    id: "enc-other-episode",
    patientId: "pat-1",
    episodeOfCareId: "epi-old",
    status: "finished",
    startedAt: "2026-04-10T10:00:00.000Z",
  },
];

const observations: FunctionalObservation[] = [
  {
    id: "obs-1",
    patientId: "pat-1",
    encounterId: "enc-current-1",
    effectiveDateTime: "2026-05-10T10:30:00.000Z",
    code: "pain_nrs_0_10",
    value: 4,
    unit: "/10",
    status: "final",
  },
  {
    id: "obs-wrong-episode",
    patientId: "pat-1",
    encounterId: "enc-other-episode",
    effectiveDateTime: "2026-04-10T10:30:00.000Z",
    code: "tug_seconds",
    value: 20,
    unit: "s",
    status: "final",
  },
];

const signingProfessional: SigningProfessionalConfig = {
  status: "ready",
  fullName: "Lic. Ramiro Gomez",
  roleTitle: "Kinesiologo",
  licenseNumber: "12345",
  signatureDisplay: "Lic. Ramiro Gomez",
};

describe("loadTreatmentReportContext", () => {
  beforeEach(() => {
    mocks.getPatientById.mockResolvedValue(patient);
    mocks.getEpisodeById.mockResolvedValue(activeEpisode);
    mocks.listEncountersByPatientId.mockResolvedValue(encounters);
    mocks.listFunctionalObservationsByEncounterIds.mockResolvedValue(observations);
    mocks.loadSigningProfessionalConfig.mockResolvedValue(signingProfessional);
    mocks.loadEpisodeClinicalContextReadModel.mockResolvedValue({
      medicalReferenceDiagnosisText: "Lumbalgia",
      kinesiologicDiagnosisText: "Dolor lumbar mecanico",
      initialFunctionalStatus: "Dolor y limitacion para marcha.",
      therapeuticGoals: "Mejorar tolerancia de marcha.",
      frameworkPlan: "Trabajo progresivo.",
      hasAnyContent: true,
    });
  });

  it("loads the explicit episode id and does not mix encounters from other episodes", async () => {
    const result = await loadTreatmentReportContext({
      patientId: "pat-1",
      episodeId: "epi-1",
      mode: "progress",
    });

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect(mocks.getEpisodeById).toHaveBeenCalledWith("epi-1");
    expect(result.context.episode.id).toBe("epi-1");
    expect(result.context.encounters).toHaveLength(1);
    expect(result.context.encounters[0]?.id).toBe("enc-current-1");
    expect(result.context.encounterSummary.count).toBe(1);
    expect(mocks.listFunctionalObservationsByEncounterIds).toHaveBeenCalledWith(["enc-current-1"]);
  });

  it("fails when the episode does not belong to the patient", async () => {
    mocks.getEpisodeById.mockResolvedValue({
      ...activeEpisode,
      patientId: "pat-2",
    });

    const result = await loadTreatmentReportContext({
      patientId: "pat-1",
      episodeId: "epi-1",
      mode: "progress",
    });

    expect(result).toEqual({
      ok: false,
      reason: "episode_belongs_to_another_patient",
    });
  });

  it("attaches clinical context, metrics and signing professional when available", async () => {
    const result = await loadTreatmentReportContext({
      patientId: "pat-1",
      episodeId: "epi-1",
      mode: "progress",
    });

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect(result.context.clinicalContext?.medicalReferenceDiagnosisText).toBe("Lumbalgia");
    expect(result.context.functionalTrend).toEqual([
      expect.objectContaining({ code: "pain_nrs_0_10", latestValue: 4 }),
    ]);
    expect(result.context.signingProfessional).toEqual({
      status: "ready",
      fullName: "Lic. Ramiro Gomez",
      roleTitle: "Kinesiologo",
      licenseNumber: "12345",
      licenseJurisdiction: undefined,
      signatureDisplay: "Lic. Ramiro Gomez",
    });
  });

  it("requires a finished episode for closure mode", async () => {
    mocks.getEpisodeById.mockResolvedValue(activeEpisode);

    const result = await loadTreatmentReportContext({
      patientId: "pat-1",
      episodeId: "epi-1",
      mode: "closure",
    });

    expect(result).toEqual({
      ok: false,
      reason: "mode_requires_finished_episode",
    });
  });

  it("supports closure mode when the selected episode is finished", async () => {
    mocks.getEpisodeById.mockResolvedValue(finishedEpisode);
    mocks.listEncountersByPatientId.mockResolvedValue([
      {
        id: "enc-finished-1",
        patientId: "pat-1",
        episodeOfCareId: "epi-2",
        status: "finished",
        startedAt: "2026-03-10T10:00:00.000Z",
      },
    ]);
    mocks.listFunctionalObservationsByEncounterIds.mockResolvedValue([]);

    const result = await loadTreatmentReportContext({
      patientId: "pat-1",
      episodeId: "epi-2",
      mode: "closure",
    });

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect(result.context.episode.status).toBe("finished");
    expect(result.context.episode.closureDetail).toBe("Alta funcional.");
  });
});
