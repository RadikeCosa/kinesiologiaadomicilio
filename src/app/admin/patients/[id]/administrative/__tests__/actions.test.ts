import { describe, expect, it, vi } from "vitest";

import { createPatientServiceRequestAction } from "@/app/admin/patients/[id]/administrative/actions";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/infrastructure/repositories/service-request.repository", () => ({
  createServiceRequest: vi.fn(),
}));

vi.mock("@/infrastructure/repositories/episode-of-care.repository", () => ({
  createEpisodeOfCare: vi.fn(),
  getActiveEpisodeByPatientId: vi.fn(),
}));

vi.mock("@/infrastructure/repositories/encounter.repository", () => ({
  createEncounter: vi.fn(),
}));

import { createEncounter } from "@/infrastructure/repositories/encounter.repository";
import { createEpisodeOfCare } from "@/infrastructure/repositories/episode-of-care.repository";
import { createServiceRequest } from "@/infrastructure/repositories/service-request.repository";
import { revalidatePath } from "next/cache";

function buildFormData(values: Record<string, string>): FormData {
  const formData = new FormData();

  for (const [key, value] of Object.entries(values)) {
    formData.set(key, value);
  }

  return formData;
}

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
      requesterContact: undefined,
      reportedDiagnosisText: undefined,
      notes: undefined,
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
});
