import type { Encounter } from "@/domain/encounter/encounter.types";
import type { EpisodeOfCare } from "@/domain/episode-of-care/episode-of-care.types";
import type { FunctionalObservation } from "@/domain/functional-observation/functional-observation.types";
import type { Patient } from "@/domain/patient/patient.types";
import type { SigningProfessionalConfig } from "@/domain/signing-professional/signing-professional.types";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getPatientById: vi.fn(),
  getEncounterById: vi.fn(),
  getActiveEpisodeByPatientId: vi.fn(),
  getMostRecentEpisodeByPatientId: vi.fn(),
  listFunctionalObservationsByEncounterId: vi.fn(),
  loadSigningProfessionalConfig: vi.fn(),
}));

vi.mock("@/infrastructure/repositories/patient.repository", () => ({
  getPatientById: mocks.getPatientById,
}));

vi.mock("@/infrastructure/repositories/encounter.repository", () => ({
  getEncounterById: mocks.getEncounterById,
}));

vi.mock("@/infrastructure/repositories/episode-of-care.repository", () => ({
  getActiveEpisodeByPatientId: mocks.getActiveEpisodeByPatientId,
  getMostRecentEpisodeByPatientId: mocks.getMostRecentEpisodeByPatientId,
}));

vi.mock("@/infrastructure/repositories/observation.repository", () => ({
  listFunctionalObservationsByEncounterId: mocks.listFunctionalObservationsByEncounterId,
}));

vi.mock("../../signing-professional/read-models/signing-professional-config.read-model", () => ({
  loadSigningProfessionalConfig: mocks.loadSigningProfessionalConfig,
}));

import { loadEncounterShareableReportContext } from "../visit-share-report.read-model";

const patient: Patient = {
  id: "pat-1",
  firstName: "Ana",
  lastName: "Perez",
  dni: "12345678",
  phone: "+54 9 299 123-4567",
  birthDate: "1952-02-01",
  address: "Calle interna 123",
  mainContact: {
    name: "Marta Perez",
    relationship: "child",
    phone: "+54 9 299 765-4321",
  },
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const activeEpisode: EpisodeOfCare = {
  id: "epi-active",
  patientId: "pat-1",
  status: "active",
  startDate: "2026-05-01",
  clinicalContext: {
    frameworkPlan: "Plan marco interno.",
  },
};

const selectedEncounter: Encounter = {
  id: "enc-2",
  patientId: "pat-1",
  episodeOfCareId: "epi-active",
  status: "finished",
  startedAt: "2026-06-02T13:00:00.000Z",
  endedAt: "2026-06-02T14:00:00.000Z",
  visitStartPunctuality: "delayed",
  clinicalNote: {
    intervention: "Entrenamiento de transferencias.",
    homeInstructions: "Continuar ejercicios indicados.",
    nextPlan: "Progresar marcha asistida.",
  },
};

const observations: FunctionalObservation[] = [
  {
    id: "obs-1",
    patientId: "pat-1",
    encounterId: "enc-2",
    effectiveDateTime: "2026-06-02T13:30:00.000Z",
    code: "pain_nrs_0_10",
    value: 4,
    unit: "score",
    status: "final",
  },
  {
    id: "obs-other",
    patientId: "pat-1",
    encounterId: "enc-other",
    effectiveDateTime: "2026-06-02T13:30:00.000Z",
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

describe("loadEncounterShareableReportContext", () => {
  beforeEach(() => {
    mocks.getPatientById.mockResolvedValue(patient);
    mocks.getEncounterById.mockResolvedValue(selectedEncounter);
    mocks.getActiveEpisodeByPatientId.mockResolvedValue(activeEpisode);
    mocks.getMostRecentEpisodeByPatientId.mockResolvedValue(null);
    mocks.listFunctionalObservationsByEncounterId.mockResolvedValue(observations);
    mocks.loadSigningProfessionalConfig.mockResolvedValue(signingProfessional);
  });

  it("returns a sanitized context without raw FHIR/admin fields", async () => {
    const result = await loadEncounterShareableReportContext({
      patientId: "pat-1",
      encounterId: "enc-2",
    });

    expect(result).toMatchObject({
      patient: {
        displayName: "Ana Perez",
        firstName: "Ana",
        ageYears: 74,
      },
      visit: {
        startedAt: "2026-06-02T13:00:00.000Z",
        startedAtDisplay: expect.stringMatching(/\d{2}:\d{2}/),
        endedAtDisplay: expect.stringMatching(/\d{2}:\d{2}/),
        durationMinutes: 60,
        punctualityLabel: "Con demora",
      },
    });
    expect(result).not.toHaveProperty("id");
    expect(result?.patient).not.toHaveProperty("dni");
    expect(result?.patient).not.toHaveProperty("address");
    expect(result?.visit).not.toHaveProperty("id");
    expect(result?.visit).not.toHaveProperty("visitStartPunctuality");
  });

  it("loads only the requested encounter and its observations", async () => {
    const result = await loadEncounterShareableReportContext({
      patientId: "pat-1",
      encounterId: "enc-2",
    });

    expect(mocks.getEncounterById).toHaveBeenCalledWith("enc-2");
    expect(mocks.listFunctionalObservationsByEncounterId).toHaveBeenCalledWith("enc-2");
    expect(result?.visit.functionalMetrics).toEqual([
      { code: "pain_nrs_0_10", label: "Dolor", value: 4, unit: "/10" },
    ]);
  });

  it("does not return context when the encounter belongs to another cycle", async () => {
    mocks.getEncounterById.mockResolvedValue({
      ...selectedEncounter,
      episodeOfCareId: "epi-old",
    });

    const result = await loadEncounterShareableReportContext({
      patientId: "pat-1",
      encounterId: "enc-2",
    });

    expect(result).toBeNull();
    expect(mocks.listFunctionalObservationsByEncounterId).not.toHaveBeenCalled();
  });

  it("includes signing professional data without exposing FHIR raw shape", async () => {
    const result = await loadEncounterShareableReportContext({
      patientId: "pat-1",
      encounterId: "enc-2",
    });

    expect(result?.signingProfessional).toEqual({
      status: "ready",
      fullName: "Lic. Ramiro Gomez",
      roleTitle: "Kinesiologo",
      licenseNumber: "12345",
      licenseJurisdiction: undefined,
      signatureDisplay: "Lic. Ramiro Gomez",
    });
    expect(result?.signingProfessional).not.toHaveProperty("resourceType");
  });

  it("keeps the report text separated from the clinical note source", async () => {
    const result = await loadEncounterShareableReportContext({
      patientId: "pat-1",
      encounterId: "enc-2",
    });

    expect(result?.visit.clinicalNote?.intervention).toBe("Entrenamiento de transferencias.");
    expect(result).not.toHaveProperty("initialText");
  });
});
