import { afterEach, describe, expect, it, vi } from "vitest";

import { upsertSigningProfessionalAction } from "@/app/admin/configuracion/profesional/actions";
import { revalidatePath } from "next/cache";
import {
  SigningProfessionalAmbiguousError,
  upsertSigningProfessionalConfig,
} from "@/infrastructure/repositories/practitioner.repository";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/infrastructure/repositories/practitioner.repository", () => ({
  SigningProfessionalAmbiguousError: class SigningProfessionalAmbiguousError extends Error {},
  upsertSigningProfessionalConfig: vi.fn(),
}));

describe("upsertSigningProfessionalAction", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("upserts config and revalidates the professional settings route", async () => {
    vi.mocked(upsertSigningProfessionalConfig).mockResolvedValue({
      id: "prac-1",
      fullName: "Nombre",
      roleTitle: "Kinesiologo",
      licenseNumber: "MP-1",
      status: "ready",
    });

    const result = await upsertSigningProfessionalAction({
      fullName: "Nombre",
      roleTitle: "Kinesiologo",
      licenseNumber: "MP-1",
    });

    expect(result).toEqual({
      ok: true,
      message: "Profesional firmante guardado correctamente.",
    });
    expect(upsertSigningProfessionalConfig).toHaveBeenCalledWith({
      fullName: "Nombre",
      roleTitle: "Kinesiologo",
      licenseNumber: "MP-1",
    });
    expect(revalidatePath).toHaveBeenCalledWith("/admin/configuracion/profesional");
  });

  it("returns specific message for ambiguous Practitioner singleton", async () => {
    vi.mocked(upsertSigningProfessionalConfig).mockRejectedValue(new SigningProfessionalAmbiguousError(2));

    const result = await upsertSigningProfessionalAction({
      fullName: "Nombre",
      roleTitle: "Kinesiologo",
    });

    expect(result.ok).toBe(false);
    expect(result.message).toContain("más de un profesional");
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("returns repository error message", async () => {
    vi.mocked(upsertSigningProfessionalConfig).mockRejectedValue(new Error("fullName: es obligatorio."));

    await expect(upsertSigningProfessionalAction({ fullName: "", roleTitle: "Kinesiologo" })).resolves.toEqual({
      ok: false,
      message: "fullName: es obligatorio.",
    });
  });
});
