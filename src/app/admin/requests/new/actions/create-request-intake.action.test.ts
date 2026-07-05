import { beforeEach, describe, expect, it, vi } from "vitest";

import { createRequestIntakeAction } from "@/app/admin/requests/new/actions/create-request-intake.action";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/infrastructure/repositories/patient.repository", () => ({
  createPatient: vi.fn(),
  findPatientByDni: vi.fn(),
}));

vi.mock("@/infrastructure/repositories/service-request.repository", () => ({
  createServiceRequest: vi.fn(),
}));

import { revalidatePath } from "next/cache";
import { createPatient, findPatientByDni } from "@/infrastructure/repositories/patient.repository";
import { createServiceRequest } from "@/infrastructure/repositories/service-request.repository";

describe("createRequestIntakeAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(findPatientByDni).mockResolvedValue(null);
  });

  it("creates patient, creates in_review service request and redirects to the hub with post-intake indicator", async () => {
    vi.mocked(createPatient).mockResolvedValueOnce({
      id: "pat-1",
      firstName: "Ana",
      lastName: "Pérez",
      phone: "+54 299 555 0101",
      createdAt: "2026-07-04T00:00:00.000Z",
      updatedAt: "2026-07-04T00:00:00.000Z",
    });
    vi.mocked(createServiceRequest).mockResolvedValueOnce({
      id: "sr-1",
      patientId: "pat-1",
      requestedAt: "2026-07-04",
      reasonText: "Dolor lumbar",
      status: "in_review",
    });

    const result = await createRequestIntakeAction({
      requestedAt: "2026-07-04",
      firstName: "Ana",
      lastName: "Pérez",
      contactPhone: "+54 299 555 0101",
      reasonText: "Dolor lumbar",
      requesterDisplay: "Hija",
      requesterType: "family",
    });

    expect(result).toEqual({
      ok: true,
      message: "Solicitud registrada correctamente.",
      patientId: "pat-1",
      redirectTo: "/admin/patients/pat-1?requestCreated=1",
    });
    expect(createPatient).toHaveBeenCalledWith(expect.objectContaining({
      firstName: "Ana",
      lastName: "Pérez",
      phone: undefined,
      mainContact: expect.objectContaining({
        name: "Hija",
        relationship: "other",
        phone: "+54 299 555 0101",
      }),
    }));
    expect(createServiceRequest).toHaveBeenCalledWith({
      patientId: "pat-1",
      requestedAt: "2026-07-04",
      reasonText: "Dolor lumbar",
      requesterDisplay: "Hija",
      requesterType: "family",
    });
    expect(revalidatePath).toHaveBeenCalledWith("/admin");
    expect(revalidatePath).toHaveBeenCalledWith("/admin/patients");
    expect(revalidatePath).toHaveBeenCalledWith("/admin/patients/pat-1");
    expect(revalidatePath).toHaveBeenCalledWith("/admin/patients/pat-1/administrative");
  });

  it("keeps patient phone when the patient is the requester", async () => {
    vi.mocked(createPatient).mockResolvedValueOnce({
      id: "pat-2",
      firstName: "Luis",
      lastName: "Paz",
      phone: "+54 299 555 0202",
      createdAt: "2026-07-04T00:00:00.000Z",
      updatedAt: "2026-07-04T00:00:00.000Z",
    });
    vi.mocked(createServiceRequest).mockResolvedValueOnce({
      id: "sr-2",
      patientId: "pat-2",
      requestedAt: "2026-07-04",
      reasonText: "Control",
      status: "in_review",
    });

    await createRequestIntakeAction({
      requestedAt: "2026-07-04",
      firstName: "Luis",
      lastName: "Paz",
      contactPhone: "+54 299 555 0202",
      reasonText: "Control",
      requesterType: "patient",
    });

    expect(createPatient).toHaveBeenCalledWith(expect.objectContaining({
      phone: "+542995550202",
      mainContact: undefined,
    }));
  });

  it("returns validation error when a required field is missing", async () => {
    const result = await createRequestIntakeAction({
      requestedAt: "2026-07-04",
      firstName: "Ana",
      lastName: "Pérez",
      contactPhone: "",
      reasonText: "Dolor lumbar",
    });

    expect(result).toEqual({
      ok: false,
      message: "El teléfono de contacto es obligatorio.",
    });
    expect(createPatient).not.toHaveBeenCalled();
    expect(createServiceRequest).not.toHaveBeenCalled();
  });

  it("does not create service request when patient creation fails", async () => {
    vi.mocked(createPatient).mockRejectedValueOnce(new Error("FHIR Patient failed"));

    const result = await createRequestIntakeAction({
      requestedAt: "2026-07-04",
      firstName: "Ana",
      lastName: "Pérez",
      contactPhone: "+54 299 555 0101",
      reasonText: "Dolor lumbar",
    });

    expect(result).toEqual({
      ok: false,
      message: "FHIR Patient failed",
    });
    expect(createServiceRequest).not.toHaveBeenCalled();
  });

  it("returns recoverable redirect when service request creation fails after patient creation", async () => {
    vi.mocked(createPatient).mockResolvedValueOnce({
      id: "pat-3",
      firstName: "Ana",
      lastName: "Pérez",
      createdAt: "2026-07-04T00:00:00.000Z",
      updatedAt: "2026-07-04T00:00:00.000Z",
    });
    vi.mocked(createServiceRequest).mockRejectedValueOnce(new Error("FHIR ServiceRequest failed"));

    const result = await createRequestIntakeAction({
      requestedAt: "2026-07-04",
      firstName: "Ana",
      lastName: "Pérez",
      contactPhone: "+54 299 555 0101",
      reasonText: "Dolor lumbar",
    });

    expect(result).toEqual({
      ok: false,
      message: "Se creó el paciente, pero no se pudo registrar la solicitud. Podés completarla manualmente desde Gestión administrativa.",
      patientId: "pat-3",
      redirectTo: "/admin/patients/pat-3/administrative?newServiceRequest=1&status=intake-partial#service-requests",
    });
    expect(createPatient).toHaveBeenCalledTimes(1);
    expect(createServiceRequest).toHaveBeenCalledTimes(1);
  });

  it("blocks duplicate DNI with a low-risk redirect to the existing patient", async () => {
    vi.mocked(findPatientByDni).mockResolvedValueOnce({
      id: "pat-existing",
      firstName: "Ana",
      lastName: "Pérez",
      dni: "30111222",
      createdAt: "2026-07-04T00:00:00.000Z",
      updatedAt: "2026-07-04T00:00:00.000Z",
    });

    const result = await createRequestIntakeAction({
      requestedAt: "2026-07-04",
      firstName: "Ana",
      lastName: "Pérez",
      contactPhone: "+54 299 555 0101",
      reasonText: "Dolor lumbar",
      dni: "30111222",
    });

    expect(result).toEqual({
      ok: false,
      message: "Ya existe un paciente con ese DNI. En esta fase usá la ficha existente y registrá la solicitud desde Gestión administrativa.",
      patientId: "pat-existing",
      redirectTo: "/admin/patients/pat-existing/administrative?newServiceRequest=1#service-requests",
    });
    expect(createPatient).not.toHaveBeenCalled();
    expect(createServiceRequest).not.toHaveBeenCalled();
  });
});
