import { afterEach, describe, expect, it, vi } from "vitest";

import { fhirClient } from "@/lib/fhir/client";
import { buildPractitionerByIdentifierQuery } from "@/lib/fhir/search-params";
import {
  SIGNING_PRACTITIONER_SINGLETON_IDENTIFIER_SYSTEM,
  SIGNING_PRACTITIONER_SINGLETON_IDENTIFIER_VALUE,
  PRACTITIONER_PROFESSIONAL_LICENSE_IDENTIFIER_SYSTEM,
} from "@/infrastructure/mappers/practitioner/practitioner.constants";
import {
  getSigningProfessionalConfig,
  SigningProfessionalAmbiguousError,
  upsertSigningProfessionalConfig,
} from "@/infrastructure/repositories/practitioner.repository";

describe("practitioner.repository (FHIR)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const query = buildPractitionerByIdentifierQuery({
    system: SIGNING_PRACTITIONER_SINGLETON_IDENTIFIER_SYSTEM,
    value: SIGNING_PRACTITIONER_SINGLETON_IDENTIFIER_VALUE,
  });

  it("returns null when no signing Practitioner exists", async () => {
    const getSpy = vi.spyOn(fhirClient, "get").mockResolvedValue({
      resourceType: "Bundle",
      entry: [],
    });

    await expect(getSigningProfessionalConfig()).resolves.toBeNull();
    expect(getSpy).toHaveBeenCalledWith(`Practitioner?${query}`);
  });

  it("returns mapped config when one signing Practitioner exists", async () => {
    vi.spyOn(fhirClient, "get").mockResolvedValue({
      resourceType: "Bundle",
      entry: [{
        resource: {
          resourceType: "Practitioner",
          id: "prac-1",
          identifier: [
            { system: SIGNING_PRACTITIONER_SINGLETON_IDENTIFIER_SYSTEM, value: SIGNING_PRACTITIONER_SINGLETON_IDENTIFIER_VALUE },
            { system: PRACTITIONER_PROFESSIONAL_LICENSE_IDENTIFIER_SYSTEM, value: "MP-123" },
          ],
          name: [{ text: "Nombre Apellido" }],
          qualification: [{ code: { text: "Kinesiologo" } }],
        },
      }],
    });

    await expect(getSigningProfessionalConfig()).resolves.toMatchObject({
      id: "prac-1",
      fullName: "Nombre Apellido",
      roleTitle: "Kinesiologo",
      licenseNumber: "MP-123",
      status: "ready",
    });
  });

  it("throws ambiguity error when more than one signing Practitioner exists", async () => {
    vi.spyOn(fhirClient, "get").mockResolvedValue({
      resourceType: "Bundle",
      entry: [
        { resource: { resourceType: "Practitioner", id: "prac-1" } },
        { resource: { resourceType: "Practitioner", id: "prac-2" } },
      ],
    });

    await expect(getSigningProfessionalConfig()).rejects.toBeInstanceOf(SigningProfessionalAmbiguousError);
  });

  it("creates Practitioner when config is missing", async () => {
    const getSpy = vi.spyOn(fhirClient, "get").mockResolvedValue({
      resourceType: "Bundle",
      entry: [],
    });
    const postSpy = vi.spyOn(fhirClient, "post").mockResolvedValue({
      resourceType: "Practitioner",
      id: "prac-new",
      identifier: [
        { system: SIGNING_PRACTITIONER_SINGLETON_IDENTIFIER_SYSTEM, value: SIGNING_PRACTITIONER_SINGLETON_IDENTIFIER_VALUE },
        { system: PRACTITIONER_PROFESSIONAL_LICENSE_IDENTIFIER_SYSTEM, value: "MP-123" },
      ],
      name: [{ text: "Nombre Apellido" }],
      qualification: [{ code: { text: "Kinesiologo" } }],
    });

    const created = await upsertSigningProfessionalConfig({
      fullName: " Nombre Apellido ",
      roleTitle: " Kinesiologo ",
      licenseNumber: " MP-123 ",
    });

    expect(getSpy).toHaveBeenCalledWith(`Practitioner?${query}`);
    expect(postSpy).toHaveBeenCalledWith(
      "Practitioner",
      expect.objectContaining({
        resourceType: "Practitioner",
        active: true,
        identifier: expect.arrayContaining([
          { system: SIGNING_PRACTITIONER_SINGLETON_IDENTIFIER_SYSTEM, value: SIGNING_PRACTITIONER_SINGLETON_IDENTIFIER_VALUE },
          expect.objectContaining({ system: PRACTITIONER_PROFESSIONAL_LICENSE_IDENTIFIER_SYSTEM, value: "MP-123" }),
        ]),
      }),
    );
    expect(created).toMatchObject({ id: "prac-new", status: "ready" });
  });

  it("updates existing Practitioner with GET merge PUT", async () => {
    const getSpy = vi.spyOn(fhirClient, "get")
      .mockResolvedValueOnce({
        resourceType: "Bundle",
        entry: [{
          resource: {
            resourceType: "Practitioner",
            id: "prac-existing",
          },
        }],
      })
      .mockResolvedValueOnce({
        resourceType: "Practitioner",
        id: "prac-existing",
        identifier: [{ system: "external", value: "keep" }],
        extension: [{ url: "external-extension", valueString: "keep" }],
      });
    const putSpy = vi.spyOn(fhirClient, "put").mockResolvedValue({
      resourceType: "Practitioner",
      id: "prac-existing",
      identifier: [
        { system: "external", value: "keep" },
        { system: SIGNING_PRACTITIONER_SINGLETON_IDENTIFIER_SYSTEM, value: SIGNING_PRACTITIONER_SINGLETON_IDENTIFIER_VALUE },
        { system: PRACTITIONER_PROFESSIONAL_LICENSE_IDENTIFIER_SYSTEM, value: "MP-999" },
      ],
      name: [{ text: "Nombre Nuevo" }],
      qualification: [{ code: { text: "Lic. en Kinesiologia" } }],
      extension: [{ url: "external-extension", valueString: "keep" }],
    });

    const updated = await upsertSigningProfessionalConfig({
      fullName: "Nombre Nuevo",
      roleTitle: "Lic. en Kinesiologia",
      licenseNumber: "MP-999",
    });

    expect(getSpy).toHaveBeenNthCalledWith(1, `Practitioner?${query}`);
    expect(getSpy).toHaveBeenNthCalledWith(2, "Practitioner/prac-existing");
    expect(putSpy).toHaveBeenCalledWith(
      "Practitioner/prac-existing",
      expect.objectContaining({
        id: "prac-existing",
        identifier: expect.arrayContaining([
          { system: "external", value: "keep" },
          expect.objectContaining({ system: SIGNING_PRACTITIONER_SINGLETON_IDENTIFIER_SYSTEM }),
        ]),
      }),
    );
    expect(updated).toMatchObject({ id: "prac-existing", fullName: "Nombre Nuevo", status: "ready" });
  });

  it("does not write when duplicate signing Practitioners exist", async () => {
    vi.spyOn(fhirClient, "get").mockResolvedValue({
      resourceType: "Bundle",
      entry: [
        { resource: { resourceType: "Practitioner", id: "prac-1" } },
        { resource: { resourceType: "Practitioner", id: "prac-2" } },
      ],
    });
    const postSpy = vi.spyOn(fhirClient, "post");
    const putSpy = vi.spyOn(fhirClient, "put");

    await expect(upsertSigningProfessionalConfig({
      fullName: "Nombre",
      roleTitle: "Kinesiologo",
    })).rejects.toBeInstanceOf(SigningProfessionalAmbiguousError);

    expect(postSpy).not.toHaveBeenCalled();
    expect(putSpy).not.toHaveBeenCalled();
  });
});
