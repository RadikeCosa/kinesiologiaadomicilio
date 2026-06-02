import { describe, expect, it } from "vitest";

import { applySigningProfessionalStatus, getSigningProfessionalStatus } from "@/domain/signing-professional/signing-professional.rules";

describe("signing professional rules", () => {
  it("returns missing for absent config", () => {
    expect(getSigningProfessionalStatus(null)).toBe("missing");
  });

  it("returns incomplete when required signing fields are missing", () => {
    expect(getSigningProfessionalStatus({ fullName: "Nombre", roleTitle: "Kinesiologo" })).toBe("incomplete");
    expect(getSigningProfessionalStatus({ fullName: "", roleTitle: "Kinesiologo", licenseNumber: "MP-1" })).toBe("incomplete");
    expect(getSigningProfessionalStatus({ fullName: "Nombre", roleTitle: "", licenseNumber: "MP-1" })).toBe("incomplete");
  });

  it("returns ready when fullName, roleTitle and licenseNumber exist", () => {
    expect(getSigningProfessionalStatus({ fullName: "Nombre", roleTitle: "Kinesiologo", licenseNumber: "MP-1" })).toBe("ready");
  });

  it("applies status to mapped config", () => {
    expect(applySigningProfessionalStatus({ id: "prac-1", fullName: "Nombre", roleTitle: "Kinesiologo" }))
      .toMatchObject({ id: "prac-1", status: "incomplete" });
  });
});
