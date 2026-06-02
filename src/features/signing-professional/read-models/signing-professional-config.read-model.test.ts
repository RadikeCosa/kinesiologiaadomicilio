import { afterEach, describe, expect, it, vi } from "vitest";

import { getSigningProfessionalConfig } from "@/infrastructure/repositories/practitioner.repository";
import { loadSigningProfessionalConfig } from "@/features/signing-professional/read-models/signing-professional-config.read-model";

vi.mock("@/infrastructure/repositories/practitioner.repository", () => ({
  getSigningProfessionalConfig: vi.fn(),
}));

describe("loadSigningProfessionalConfig", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns missing read model when repository returns null", async () => {
    vi.mocked(getSigningProfessionalConfig).mockResolvedValue(null);

    await expect(loadSigningProfessionalConfig()).resolves.toEqual({ status: "missing" });
  });

  it("returns repository config without exposing FHIR", async () => {
    vi.mocked(getSigningProfessionalConfig).mockResolvedValue({
      id: "prac-1",
      fullName: "Nombre",
      roleTitle: "Kinesiologo",
      status: "incomplete",
    });

    await expect(loadSigningProfessionalConfig()).resolves.toEqual({
      id: "prac-1",
      fullName: "Nombre",
      roleTitle: "Kinesiologo",
      status: "incomplete",
    });
  });
});
