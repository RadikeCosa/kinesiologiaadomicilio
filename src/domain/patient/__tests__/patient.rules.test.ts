import { describe, expect, it } from "vitest";

import {
  canCreatePatient,
  getPatientOperationalStatus,
  hasRequiredIdentityForEpisode,
} from "@/domain/patient/patient.rules";

describe("patient.rules", () => {
  it("accepts patient creation when firstName and lastName are provided", () => {
    const result = canCreatePatient({ firstName: "Ana", lastName: "Pérez" });

    expect(result).toEqual({ ok: true });
  });

  it("fails patient creation when required fields are missing", () => {
    const missingFirstName = canCreatePatient({ firstName: "   ", lastName: "Pérez" });
    const missingLastName = canCreatePatient({ firstName: "Ana", lastName: "  " });

    expect(missingFirstName).toMatchObject({ ok: false, reason: "missing_first_name" });
    expect(missingLastName).toMatchObject({ ok: false, reason: "missing_last_name" });
  });

  it("requires DNI to start treatment episode", () => {
    const withoutDni = hasRequiredIdentityForEpisode({ dni: "  " });
    const withDni = hasRequiredIdentityForEpisode({ dni: "32123456" });

    expect(withoutDni).toMatchObject({ ok: false, reason: "missing_dni" });
    expect(withDni).toEqual({ ok: true });
  });

  it("resolves operational status as preliminary", () => {
    const status = getPatientOperationalStatus({
      patient: { dni: undefined },
      hasActiveEpisode: false,
    });

    expect(status).toBe("preliminary");
  });

  it("resolves operational status as ready_to_start", () => {
    const status = getPatientOperationalStatus({
      patient: { dni: "32123456" },
      hasActiveEpisode: false,
    });

    expect(status).toBe("ready_to_start");
  });

  it("resolves operational status as active_treatment", () => {
    const status = getPatientOperationalStatus({
      patient: { dni: "32123456" },
      hasActiveEpisode: true,
    });

    expect(status).toBe("active_treatment");
  });
});
