import { describe, expect, it } from "vitest";

import { canStartEpisodeOfCare } from "@/domain/episode-of-care/episode-of-care.rules";

describe("episode-of-care.rules", () => {
  it("fails when patient has no DNI", () => {
    const result = canStartEpisodeOfCare(
      { dni: undefined },
      { hasActiveEpisode: false, duplicatePatientByDni: false },
    );

    expect(result).toMatchObject({ ok: false, reason: "missing_patient_dni" });
  });

  it("fails when patient already has active episode", () => {
    const result = canStartEpisodeOfCare(
      { dni: "32123456" },
      { hasActiveEpisode: true, duplicatePatientByDni: false },
    );

    expect(result).toMatchObject({ ok: false, reason: "patient_already_has_active_episode" });
  });

  it("fails when there is a duplicate DNI", () => {
    const result = canStartEpisodeOfCare(
      { dni: "32123456" },
      { hasActiveEpisode: false, duplicatePatientByDni: true },
    );

    expect(result).toMatchObject({ ok: false, reason: "duplicate_patient_by_dni" });
  });

  it("passes when all conditions are met", () => {
    const result = canStartEpisodeOfCare(
      { dni: "32123456" },
      { hasActiveEpisode: false, duplicatePatientByDni: false },
    );

    expect(result).toEqual({ ok: true });
  });
});
