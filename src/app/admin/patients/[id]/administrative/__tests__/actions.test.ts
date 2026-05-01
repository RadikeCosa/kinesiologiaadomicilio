import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  acceptAndStartTreatmentFromServiceRequestAction,
  createPatientServiceRequestAction,
  updatePatientServiceRequestStatusAction,
} from "@/app/admin/patients/[id]/administrative/actions";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/infrastructure/repositories/service-request.repository", () => ({
  createServiceRequest: vi.fn(),
  getServiceRequestById: vi.fn(),
  updateServiceRequestStatus: vi.fn(),
}));

vi.mock("@/infrastructure/repositories/episode-of-care.repository", () => ({
  createEpisodeOfCare: vi.fn(),
  getActiveEpisodeByPatientId: vi.fn(),
  listEpisodeOfCareByIncomingReferral: vi.fn(),
}));
vi.mock("@/infrastructure/repositories/patient.repository", () => ({
  getPatientById: vi.fn(),
  existsAnotherPatientWithDni: vi.fn(),
  updatePatient: vi.fn(),
}));

vi.mock("@/infrastructure/repositories/encounter.repository", () => ({
  createEncounter: vi.fn(),
}));

import { createEncounter } from "@/infrastructure/repositories/encounter.repository";
import { createEpisodeOfCare, getActiveEpisodeByPatientId, listEpisodeOfCareByIncomingReferral } from "@/infrastructure/repositories/episode-of-care.repository";
import { existsAnotherPatientWithDni, getPatientById, updatePatient } from "@/infrastructure/repositories/patient.repository";
import {
  createServiceRequest,
  getServiceRequestById,
  updateServiceRequestStatus,
} from "@/infrastructure/repositories/service-request.repository";
import { revalidatePath } from "next/cache";

function buildFormData(values: Record<string, string>): FormData {
  const formData = new FormData();

  for (const [key, value] of Object.entries(values)) {
    formData.set(key, value);
  }

  return formData;
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getPatientById).mockResolvedValue({
    id: "pat-1",
    firstName: "Ana",
    lastName: "Pérez",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  } as never);
});

describe("createPatientServiceRequestAction", () => {
  it("creates service request, keeps initial in_review policy and revalidates administrative route", async () => {
    vi.mocked(createServiceRequest).mockResolvedValueOnce({
      id: "sr-1",
      patientId: "pat-1",
      requestedAt: "2026-04-28",
      reasonText: "Dolor lumbar",
      status: "in_review",
    });

    const result = await createPatientServiceRequestAction(
      "pat-1",
      buildFormData({
        requestedAt: "2026-04-28",
        reasonText: "Dolor lumbar",
        requesterType: "physician",
      }),
    );

    expect(result).toEqual({
      ok: true,
      message: "Solicitud de atención registrada correctamente.",
    });
    expect(createServiceRequest).toHaveBeenCalledWith({
      patientId: "pat-1",
      requestedAt: "2026-04-28",
      reasonText: "Dolor lumbar",
      requesterDisplay: undefined,
      requesterType: "physician",
    });
    expect(revalidatePath).toHaveBeenCalledWith("/admin/patients/pat-1/administrative");
  });

  it("fails when requestedAt is missing", async () => {
    const result = await createPatientServiceRequestAction(
      "pat-1",
      buildFormData({ reasonText: "Dolor lumbar" }),
    );

    expect(result).toEqual({
      ok: false,
      message: "requestedAt: debe ser un string.",
    });
    expect(createServiceRequest).not.toHaveBeenCalled();
  });

  it("fails when reasonText is missing", async () => {
    const result = await createPatientServiceRequestAction(
      "pat-1",
      buildFormData({ requestedAt: "2026-04-28" }),
    );

    expect(result).toEqual({
      ok: false,
      message: "reasonText: debe ser un string.",
    });
    expect(createServiceRequest).not.toHaveBeenCalled();
  });

  it("fails with invalid requesterType", async () => {
    const result = await createPatientServiceRequestAction(
      "pat-1",
      buildFormData({
        requestedAt: "2026-04-28",
        reasonText: "Dolor lumbar",
        requesterType: "invalid",
      }),
    );

    expect(result).toEqual({
      ok: false,
      message: "requesterType: valor inválido.",
    });
    expect(createServiceRequest).not.toHaveBeenCalled();
  });

  it("does not call EpisodeOfCare or Encounter repositories", async () => {
    await createPatientServiceRequestAction(
      "pat-1",
      buildFormData({ requestedAt: "2026-04-28", reasonText: "Control" }),
    );

    expect(createEpisodeOfCare).not.toHaveBeenCalled();
    expect(createEncounter).not.toHaveBeenCalled();
  });

  it("updates patient administrative fields before creating request when contextual data is provided", async () => {
    vi.mocked(createServiceRequest).mockResolvedValueOnce({
      id: "sr-1",
      patientId: "pat-1",
      requestedAt: "2026-04-28",
      reasonText: "Dolor lumbar",
      status: "in_review",
    });

    await createPatientServiceRequestAction(
      "pat-1",
      buildFormData({
        requestedAt: "2026-04-28",
        reasonText: "Dolor lumbar",
        administrativeAddress: "Calle 123",
        administrativePhone: "+54 11 5555 1111",
      }),
    );

    expect(updatePatient).toHaveBeenCalledWith(expect.objectContaining({
      id: "pat-1",
      address: "Calle 123",
      phone: "+54 11 5555 1111",
    }));
  });
});

describe("updatePatientServiceRequestStatusAction", () => {
  it("updates to accepted, revalidates route and returns success message", async () => {
    vi.mocked(getServiceRequestById).mockResolvedValueOnce({
      id: "sr-1",
      patientId: "pat-1",
      requestedAt: "2026-04-28",
      reasonText: "Dolor lumbar",
      status: "in_review",
    });
    vi.mocked(updateServiceRequestStatus).mockResolvedValueOnce({
      id: "sr-1",
      patientId: "pat-1",
      requestedAt: "2026-04-28",
      reasonText: "Dolor lumbar",
      status: "in_review",
    });

    const result = await updatePatientServiceRequestStatusAction(
      "pat-1",
      buildFormData({
        id: "sr-1",
        status: "accepted",
      }),
    );

    expect(result).toEqual({
      ok: true,
      message: "Solicitud aceptada correctamente.",
    });
    expect(getServiceRequestById).toHaveBeenCalledWith("sr-1");
    expect(updateServiceRequestStatus).toHaveBeenCalledWith({
      id: "sr-1",
      status: "accepted",
      closedReasonText: undefined,
    });
    expect(revalidatePath).toHaveBeenCalledWith("/admin/patients");
    expect(revalidatePath).toHaveBeenCalledWith("/admin/patients/pat-1");
    expect(revalidatePath).toHaveBeenCalledWith("/admin/patients/pat-1/administrative");
    expect(revalidatePath).toHaveBeenCalledWith("/admin/patients/pat-1/treatment");
  });

  it("updates to closed_without_treatment with reason and revalidates route", async () => {
    vi.mocked(getServiceRequestById).mockResolvedValueOnce({
      id: "sr-2",
      patientId: "pat-1",
      requestedAt: "2026-04-28",
      reasonText: "Dolor lumbar",
      status: "accepted",
    });
    vi.mocked(updateServiceRequestStatus).mockResolvedValueOnce({
      id: "sr-2",
      patientId: "pat-1",
      requestedAt: "2026-04-28",
      reasonText: "Dolor lumbar",
      status: "closed_without_treatment",
      closedReasonText: "No requiere tratamiento",
    });

    const result = await updatePatientServiceRequestStatusAction(
      "pat-1",
      buildFormData({
        serviceRequestId: "sr-2",
        status: "closed_without_treatment",
        closedReasonText: "No requiere tratamiento",
      }),
    );

    expect(result).toEqual({
      ok: true,
      message: "La solicitud se cerró como No inició.",
    });
    expect(updateServiceRequestStatus).toHaveBeenCalledWith({
      id: "sr-2",
      status: "closed_without_treatment",
      closedReasonText: "No requiere tratamiento",
    });
    expect(revalidatePath).toHaveBeenCalledWith("/admin/patients/pat-1/administrative");
  });

  it("updates to cancelled with reason and revalidates route", async () => {
    vi.mocked(getServiceRequestById).mockResolvedValueOnce({
      id: "sr-3",
      patientId: "pat-1",
      requestedAt: "2026-04-28",
      reasonText: "Dolor lumbar",
      status: "accepted",
    });
    vi.mocked(updateServiceRequestStatus).mockResolvedValueOnce({
      id: "sr-3",
      patientId: "pat-1",
      requestedAt: "2026-04-28",
      reasonText: "Dolor lumbar",
      status: "cancelled",
      closedReasonText: "Paciente cancela",
    });

    const result = await updatePatientServiceRequestStatusAction(
      "pat-1",
      buildFormData({
        id: "sr-3",
        status: "cancelled",
        closedReasonText: "Paciente cancela",
      }),
    );

    expect(result).toEqual({
      ok: true,
      message: "La solicitud fue cancelada.",
    });
    expect(updateServiceRequestStatus).toHaveBeenCalledWith({
      id: "sr-3",
      status: "cancelled",
      closedReasonText: "Paciente cancela",
    });
    expect(revalidatePath).toHaveBeenCalledWith("/admin/patients/pat-1/administrative");
  });

  it("fails for closed_without_treatment without reason and does not revalidate", async () => {
    const result = await updatePatientServiceRequestStatusAction(
      "pat-1",
      buildFormData({
        id: "sr-4",
        status: "closed_without_treatment",
      }),
    );

    expect(result).toEqual({ ok: false, message: "closedReasonText: es obligatorio para closed_without_treatment/cancelled." });
    expect(getServiceRequestById).not.toHaveBeenCalled();
    expect(updateServiceRequestStatus).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("fails for cancelled without reason and does not revalidate", async () => {
    const result = await updatePatientServiceRequestStatusAction(
      "pat-1",
      buildFormData({
        id: "sr-5",
        status: "cancelled",
      }),
    );

    expect(result).toEqual({ ok: false, message: "closedReasonText: es obligatorio para closed_without_treatment/cancelled." });
    expect(getServiceRequestById).not.toHaveBeenCalled();
    expect(updateServiceRequestStatus).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("fails for invalid status and does not call repository", async () => {
    const result = await updatePatientServiceRequestStatusAction(
      "pat-1",
      buildFormData({
        id: "sr-6",
        status: "invalid-status",
      }),
    );

    expect(result).toEqual({ ok: false, message: "status: valor inválido." });
    expect(getServiceRequestById).not.toHaveBeenCalled();
    expect(updateServiceRequestStatus).not.toHaveBeenCalled();
  });

  it("returns generic error when getServiceRequestById fails and does not revalidate", async () => {
    vi.mocked(getServiceRequestById).mockRejectedValueOnce(new Error("boom"));

    const result = await updatePatientServiceRequestStatusAction(
      "pat-1",
      buildFormData({
        id: "sr-7",
        status: "accepted",
      }),
    );

    expect(result).toEqual({
      ok: false,
      message: "boom",
    });
    expect(updateServiceRequestStatus).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("returns generic error when service request does not exist", async () => {
    vi.mocked(getServiceRequestById).mockResolvedValueOnce(null);

    const result = await updatePatientServiceRequestStatusAction(
      "pat-1",
      buildFormData({
        id: "sr-missing",
        status: "accepted",
      }),
    );

    expect(result).toEqual({
      ok: false,
      message: "No se pudo actualizar la solicitud de atención.",
    });
    expect(updateServiceRequestStatus).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("returns generic error when service request belongs to another patient", async () => {
    vi.mocked(getServiceRequestById).mockResolvedValueOnce({
      id: "sr-foreign",
      patientId: "pat-2",
      requestedAt: "2026-04-28",
      reasonText: "Control",
      status: "in_review",
    });

    const result = await updatePatientServiceRequestStatusAction(
      "pat-1",
      buildFormData({
        id: "sr-foreign",
        status: "accepted",
      }),
    );

    expect(result).toEqual({
      ok: false,
      message: "No se pudo actualizar la solicitud de atención.",
    });
    expect(updateServiceRequestStatus).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("returns generic error when update repository fails and does not revalidate", async () => {
    vi.mocked(getServiceRequestById).mockResolvedValueOnce({
      id: "sr-7",
      patientId: "pat-1",
      requestedAt: "2026-04-28",
      reasonText: "Control",
      status: "in_review",
    });
    vi.mocked(updateServiceRequestStatus).mockRejectedValueOnce(new Error("boom"));

    const result = await updatePatientServiceRequestStatusAction(
      "pat-1",
      buildFormData({
        id: "sr-7",
        status: "accepted",
      }),
    );

    expect(result).toEqual({
      ok: false,
      message: "boom",
    });
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("does not call EpisodeOfCare or Encounter repositories", async () => {
    vi.mocked(getServiceRequestById).mockResolvedValueOnce({
      id: "sr-8",
      patientId: "pat-1",
      requestedAt: "2026-04-28",
      reasonText: "Control",
      status: "in_review",
    });
    await updatePatientServiceRequestStatusAction(
      "pat-1",
      buildFormData({
        id: "sr-8",
        status: "accepted",
      }),
    );

    expect(createEpisodeOfCare).not.toHaveBeenCalled();
    expect(createEncounter).not.toHaveBeenCalled();
  });
});

describe("acceptAndStartTreatmentFromServiceRequestAction", () => {
  it("accepts in_review request, creates episode and returns encounters redirect", async () => {
    vi.mocked(getServiceRequestById).mockResolvedValueOnce({
      id: "sr-1", patientId: "pat-1", requestedAt: "2026-04-28", reasonText: "Dolor", status: "in_review",
    });
    vi.mocked(getPatientById).mockResolvedValueOnce({
      id: "pat-1", firstName: "Ana", lastName: "Pérez", address: "Calle 123", phone: "299-1111111",
    } as never);
    vi.mocked(getActiveEpisodeByPatientId).mockResolvedValueOnce(null);
    vi.mocked(existsAnotherPatientWithDni).mockResolvedValueOnce(false);
    vi.mocked(listEpisodeOfCareByIncomingReferral).mockResolvedValueOnce([]);
    vi.mocked(updateServiceRequestStatus).mockResolvedValueOnce({} as never);
    vi.mocked(createEpisodeOfCare).mockResolvedValueOnce({ id: "ep-1" } as never);

    const result = await acceptAndStartTreatmentFromServiceRequestAction("pat-1", buildFormData({ id: "sr-1" }));
    expect(result).toEqual({
      ok: true,
      message: "Solicitud aceptada y tratamiento iniciado correctamente.",
      redirectTo: "/admin/patients/pat-1/encounters?status=treatment-started",
    });
  });

  it("fails when patient is missing operational address/phone", async () => {
    vi.mocked(getServiceRequestById).mockResolvedValueOnce({
      id: "sr-2", patientId: "pat-1", requestedAt: "2026-04-28", reasonText: "Dolor", status: "in_review",
    });
    vi.mocked(getPatientById).mockResolvedValueOnce({
      id: "pat-1", firstName: "Ana", lastName: "Pérez", address: "", phone: "",
    } as never);
    vi.mocked(getActiveEpisodeByPatientId).mockResolvedValueOnce(null);
    vi.mocked(existsAnotherPatientWithDni).mockResolvedValueOnce(false);

    const result = await acceptAndStartTreatmentFromServiceRequestAction("pat-1", buildFormData({ id: "sr-2" }));
    expect(result.ok).toBe(false);
  });
});
