import { describe, expect, it } from "vitest";

import {
  canCreatePatient,
  getPatientOperationalStatus,
  hasMinimumOperationalDataForTreatment,
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

  it("validates minimum operational data for treatment start", () => {
    const withoutAddress = hasMinimumOperationalDataForTreatment({
      firstName: "Ana",
      lastName: "Pérez",
      address: " ",
      phone: "2995550101",
    });
    const withMainContactPhone = hasMinimumOperationalDataForTreatment({
      firstName: "Ana",
      lastName: "Pérez",
      address: "Calle 123",
      phone: undefined,
      mainContact: { phone: "2995550102" },
    });

    expect(withoutAddress).toMatchObject({ ok: false, reason: "missing_patient_address" });
    expect(withMainContactPhone).toEqual({ ok: true });
  });

  it("resolves operational status as preliminary", () => {
    const status = getPatientOperationalStatus({
      patient: { firstName: "", lastName: "", address: undefined, phone: undefined, mainContact: undefined },
      hasActiveEpisode: false,
    });

    expect(status).toBe("preliminary");
  });

  it("resolves operational status as ready_to_start", () => {
    const status = getPatientOperationalStatus({
      patient: { firstName: "Ana", lastName: "Pérez", address: "Calle 123", phone: "2995550101" },
      hasActiveEpisode: false,
    });

    expect(status).toBe("ready_to_start");
  });


  it("resolves operational status as finished_treatment", () => {
    const status = getPatientOperationalStatus({
      patient: { firstName: "Ana", lastName: "Pérez", address: "Calle 123", phone: "2995550101" },
      hasActiveEpisode: false,
      hasFinishedEpisode: true,
    });

    expect(status).toBe("finished_treatment");
  });

  it("resolves operational status as active_treatment", () => {
    const status = getPatientOperationalStatus({
      patient: { firstName: "Ana", lastName: "Pérez", address: "Calle 123", phone: "2995550101" },
      hasActiveEpisode: true,
    });

    expect(status).toBe("active_treatment");
  });
});
