import { beforeEach, describe, expect, it, vi } from "vitest";

import { startEpisodeOfCareAction } from "@/app/admin/patients/[id]/actions/start-episode-of-care.action";

const getPatientByIdMock = vi.hoisted(() => vi.fn());
const getActiveEpisodeByPatientIdMock = vi.hoisted(() => vi.fn());
const createEpisodeOfCareMock = vi.hoisted(() => vi.fn());
const existsAnotherPatientWithDniMock = vi.hoisted(() => vi.fn());
const getServiceRequestByIdMock = vi.hoisted(() => vi.fn());
const listEpisodeOfCareByIncomingReferralMock = vi.hoisted(() => vi.fn());

vi.mock("@/infrastructure/repositories/patient.repository", () => ({
  getPatientById: getPatientByIdMock,
  existsAnotherPatientWithDni: existsAnotherPatientWithDniMock,
}));

vi.mock("@/infrastructure/repositories/episode-of-care.repository", () => ({
  getActiveEpisodeByPatientId: getActiveEpisodeByPatientIdMock,
  createEpisodeOfCare: createEpisodeOfCareMock,
  listEpisodeOfCareByIncomingReferral: listEpisodeOfCareByIncomingReferralMock,
}));

vi.mock("@/infrastructure/repositories/service-request.repository", () => ({
  getServiceRequestById: getServiceRequestByIdMock,
}));

describe("startEpisodeOfCareAction (serviceRequestId backend guards)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("keeps legacy flow without serviceRequestId", async () => {
    getPatientByIdMock.mockResolvedValueOnce({ id: "pat-1", dni: "30111222" });
    getActiveEpisodeByPatientIdMock.mockResolvedValueOnce(null);
    existsAnotherPatientWithDniMock.mockResolvedValueOnce(false);
    createEpisodeOfCareMock.mockResolvedValueOnce({ id: "ep-1" });

    const result = await startEpisodeOfCareAction({ patientId: "pat-1", startDate: "2026-04-16" });

    expect(getServiceRequestByIdMock).not.toHaveBeenCalled();
    expect(listEpisodeOfCareByIncomingReferralMock).not.toHaveBeenCalled();
    expect(createEpisodeOfCareMock).toHaveBeenCalledWith({
      patientId: "pat-1",
      startDate: "2026-04-16",
      serviceRequestId: undefined,
    });
    expect(result).toEqual({ ok: true, message: "Tratamiento iniciado correctamente." });
  });

  it("creates episode when serviceRequestId is accepted, belongs to patient and has no prior links", async () => {
    getPatientByIdMock.mockResolvedValueOnce({ id: "pat-1", dni: "30111222" });
    getActiveEpisodeByPatientIdMock.mockResolvedValueOnce(null);
    existsAnotherPatientWithDniMock.mockResolvedValueOnce(false);
    getServiceRequestByIdMock.mockResolvedValueOnce({ id: "sr-1", patientId: "pat-1", status: "accepted" });
    listEpisodeOfCareByIncomingReferralMock.mockResolvedValueOnce([]);
    createEpisodeOfCareMock.mockResolvedValueOnce({ id: "ep-1" });

    const result = await startEpisodeOfCareAction({
      patientId: "pat-1",
      startDate: "2026-04-16",
      serviceRequestId: "sr-1",
    });

    expect(getServiceRequestByIdMock).toHaveBeenCalledWith("sr-1");
    expect(listEpisodeOfCareByIncomingReferralMock).toHaveBeenCalledWith("sr-1");
    expect(createEpisodeOfCareMock).toHaveBeenCalledWith({
      patientId: "pat-1",
      startDate: "2026-04-16",
      serviceRequestId: "sr-1",
    });
    expect(result).toEqual({ ok: true, message: "Tratamiento iniciado correctamente." });
  });

  it("blocks creation when serviceRequestId does not exist", async () => {
    getPatientByIdMock.mockResolvedValueOnce({ id: "pat-1", dni: "30111222" });
    getActiveEpisodeByPatientIdMock.mockResolvedValueOnce(null);
    existsAnotherPatientWithDniMock.mockResolvedValueOnce(false);
    getServiceRequestByIdMock.mockResolvedValueOnce(null);

    const result = await startEpisodeOfCareAction({
      patientId: "pat-1",
      startDate: "2026-04-16",
      serviceRequestId: "sr-missing",
    });

    expect(listEpisodeOfCareByIncomingReferralMock).not.toHaveBeenCalled();
    expect(createEpisodeOfCareMock).not.toHaveBeenCalled();
    expect(result).toEqual({ ok: false, message: "No se pudo iniciar el tratamiento con la solicitud indicada." });
  });

  it("blocks creation when serviceRequest belongs to another patient", async () => {
    getPatientByIdMock.mockResolvedValueOnce({ id: "pat-1", dni: "30111222" });
    getActiveEpisodeByPatientIdMock.mockResolvedValueOnce(null);
    existsAnotherPatientWithDniMock.mockResolvedValueOnce(false);
    getServiceRequestByIdMock.mockResolvedValueOnce({ id: "sr-2", patientId: "pat-2", status: "accepted" });

    const result = await startEpisodeOfCareAction({
      patientId: "pat-1",
      startDate: "2026-04-16",
      serviceRequestId: "sr-2",
    });

    expect(listEpisodeOfCareByIncomingReferralMock).not.toHaveBeenCalled();
    expect(createEpisodeOfCareMock).not.toHaveBeenCalled();
    expect(result).toEqual({ ok: false, message: "No se pudo iniciar el tratamiento con la solicitud indicada." });
  });

  it.each(["in_review", "closed_without_treatment", "cancelled"])(
    "blocks creation when serviceRequest status is %s",
    async (status) => {
      getPatientByIdMock.mockResolvedValueOnce({ id: "pat-1", dni: "30111222" });
      getActiveEpisodeByPatientIdMock.mockResolvedValueOnce(null);
      existsAnotherPatientWithDniMock.mockResolvedValueOnce(false);
      getServiceRequestByIdMock.mockResolvedValueOnce({ id: "sr-3", patientId: "pat-1", status });

      const result = await startEpisodeOfCareAction({
        patientId: "pat-1",
        startDate: "2026-04-16",
        serviceRequestId: "sr-3",
      });

      expect(listEpisodeOfCareByIncomingReferralMock).not.toHaveBeenCalled();
      expect(createEpisodeOfCareMock).not.toHaveBeenCalled();
      expect(result).toEqual({ ok: false, message: "Solo una solicitud aceptada puede iniciar tratamiento." });
    },
  );

  it("blocks creation when serviceRequest is already linked to a finished episode", async () => {
    getPatientByIdMock.mockResolvedValueOnce({ id: "pat-1", dni: "30111222" });
    getActiveEpisodeByPatientIdMock.mockResolvedValueOnce(null);
    existsAnotherPatientWithDniMock.mockResolvedValueOnce(false);
    getServiceRequestByIdMock.mockResolvedValueOnce({ id: "sr-4", patientId: "pat-1", status: "accepted" });
    listEpisodeOfCareByIncomingReferralMock.mockResolvedValueOnce([
      { id: "epi-finished", patientId: "pat-1", status: "finished", startDate: "2026-01-01", endDate: "2026-02-01" },
    ]);

    const result = await startEpisodeOfCareAction({
      patientId: "pat-1",
      startDate: "2026-04-16",
      serviceRequestId: "sr-4",
    });

    expect(createEpisodeOfCareMock).not.toHaveBeenCalled();
    expect(result).toEqual({
      ok: false,
      message: "Esta solicitud ya fue utilizada para iniciar un tratamiento. Para un nuevo ciclo, registrá una nueva solicitud.",
    });
  });

  it("blocks creation when serviceRequest is already linked to an active episode", async () => {
    getPatientByIdMock.mockResolvedValueOnce({ id: "pat-1", dni: "30111222" });
    getActiveEpisodeByPatientIdMock.mockResolvedValueOnce(null);
    existsAnotherPatientWithDniMock.mockResolvedValueOnce(false);
    getServiceRequestByIdMock.mockResolvedValueOnce({ id: "sr-5", patientId: "pat-1", status: "accepted" });
    listEpisodeOfCareByIncomingReferralMock.mockResolvedValueOnce([
      { id: "epi-active", patientId: "pat-1", status: "active", startDate: "2026-04-01" },
    ]);

    const result = await startEpisodeOfCareAction({
      patientId: "pat-1",
      startDate: "2026-04-16",
      serviceRequestId: "sr-5",
    });

    expect(createEpisodeOfCareMock).not.toHaveBeenCalled();
    expect(result).toEqual({
      ok: false,
      message: "Esta solicitud ya fue utilizada para iniciar un tratamiento. Para un nuevo ciclo, registrá una nueva solicitud.",
    });
  });

  it("returns error when incoming-referral lookup fails", async () => {
    getPatientByIdMock.mockResolvedValueOnce({ id: "pat-1", dni: "30111222" });
    getActiveEpisodeByPatientIdMock.mockResolvedValueOnce(null);
    existsAnotherPatientWithDniMock.mockResolvedValueOnce(false);
    getServiceRequestByIdMock.mockResolvedValueOnce({ id: "sr-6", patientId: "pat-1", status: "accepted" });
    listEpisodeOfCareByIncomingReferralMock.mockRejectedValueOnce(new Error("FHIR unavailable"));

    const result = await startEpisodeOfCareAction({
      patientId: "pat-1",
      startDate: "2026-04-16",
      serviceRequestId: "sr-6",
    });

    expect(createEpisodeOfCareMock).not.toHaveBeenCalled();
    expect(result).toEqual({ ok: false, message: "FHIR unavailable" });
  });
});
