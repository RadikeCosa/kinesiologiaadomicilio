import { describe, expect, it } from "vitest";

import { canFinishEpisodeOfCare, canStartEpisodeOfCare } from "@/domain/episode-of-care/episode-of-care.rules";

describe("episode-of-care.rules", () => {
  const basePatient = {
    firstName: "Ana",
    lastName: "Pérez",
    address: "Calle 123",
    phone: "2995550101",
    mainContact: undefined,
  };

  it("allows start without DNI when minimum operational data exists with patient phone", () => {
    const result = canStartEpisodeOfCare(
      basePatient,
      { hasActiveEpisode: false, duplicatePatientByDni: false },
    );

    expect(result).toEqual({ ok: true });
  });

  it("fails when patient already has active episode", () => {
    const result = canStartEpisodeOfCare(
      basePatient,
      { hasActiveEpisode: true, duplicatePatientByDni: false },
    );

    expect(result).toMatchObject({ ok: false, reason: "patient_already_has_active_episode" });
  });

  it("fails when there is a duplicate DNI", () => {
    const result = canStartEpisodeOfCare(
      basePatient,
      { hasActiveEpisode: false, duplicatePatientByDni: true },
    );

    expect(result).toMatchObject({ ok: false, reason: "duplicate_patient_by_dni" });
  });

  it("passes when all conditions are met", () => {
    const result = canStartEpisodeOfCare(
      basePatient,
      { hasActiveEpisode: false, duplicatePatientByDni: false },
    );

    expect(result).toEqual({ ok: true });
  });

  it("allows start without patient phone when main contact phone exists", () => {
    const result = canStartEpisodeOfCare(
      { ...basePatient, phone: undefined, mainContact: { phone: "2994445566" } },
      { hasActiveEpisode: false, duplicatePatientByDni: false },
    );

    expect(result).toEqual({ ok: true });
  });

  it("fails when missing first name", () => {
    const result = canStartEpisodeOfCare(
      { ...basePatient, firstName: " " },
      { hasActiveEpisode: false, duplicatePatientByDni: false },
    );
    expect(result).toMatchObject({ ok: false, reason: "missing_patient_name" });
  });

  it("fails when missing last name", () => {
    const result = canStartEpisodeOfCare(
      { ...basePatient, lastName: " " },
      { hasActiveEpisode: false, duplicatePatientByDni: false },
    );
    expect(result).toMatchObject({ ok: false, reason: "missing_patient_name" });
  });

  it("fails when missing address", () => {
    const result = canStartEpisodeOfCare(
      { ...basePatient, address: " " },
      { hasActiveEpisode: false, duplicatePatientByDni: false },
    );
    expect(result).toMatchObject({ ok: false, reason: "missing_patient_address" });
  });

  it("fails when missing patient and main contact phones", () => {
    const result = canStartEpisodeOfCare(
      { ...basePatient, phone: undefined, mainContact: { phone: " " } },
      { hasActiveEpisode: false, duplicatePatientByDni: false },
    );
    expect(result).toMatchObject({ ok: false, reason: "missing_contact_phone" });
  });

  it("fails finish when there is no active episode", () => {
    const result = canFinishEpisodeOfCare({ hasActiveEpisode: false });

    expect(result).toMatchObject({ ok: false, reason: "missing_active_episode" });
  });

  it("passes finish when there is an active episode", () => {
    const result = canFinishEpisodeOfCare({ hasActiveEpisode: true });

    expect(result).toEqual({ ok: true });
  });
});
