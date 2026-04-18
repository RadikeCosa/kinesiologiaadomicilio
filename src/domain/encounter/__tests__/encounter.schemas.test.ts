import { describe, expect, it } from "vitest";

import { createEncounterSchema } from "@/domain/encounter/encounter.schemas";

describe("encounter.schemas", () => {
  it("requires patientId, episodeOfCareId and occurrenceDate", () => {
    expect(() => createEncounterSchema.parse({ episodeOfCareId: "epi-1", occurrenceDate: "2026-04-17" })).toThrow(
      "patientId: debe ser un string.",
    );

    expect(() => createEncounterSchema.parse({ patientId: "pat-1", occurrenceDate: "2026-04-17" })).toThrow(
      "episodeOfCareId: debe ser un string.",
    );

    expect(() => createEncounterSchema.parse({ patientId: "pat-1", episodeOfCareId: "epi-1" })).toThrow(
      "occurrenceDate: debe ser un string.",
    );
  });

  it("normalizes datetime-local input to FHIR dateTime with seconds and offset", () => {
    const parsed = createEncounterSchema.parse({
      patientId: " pat-1 ",
      episodeOfCareId: " epi-1 ",
      occurrenceDate: " 2026-04-17T10:30 ",
    });

    expect(parsed.patientId).toBe("pat-1");
    expect(parsed.episodeOfCareId).toBe("epi-1");
    expect(parsed.occurrenceDate).toMatch(/^2026-04-17T10:30:00(?:Z|[+-]\d{2}:\d{2})$/);
  });

  it("keeps a valid FHIR dateTime unchanged", () => {
    const parsed = createEncounterSchema.parse({
      patientId: "pat-1",
      episodeOfCareId: "epi-1",
      occurrenceDate: "2026-04-17T10:30:00Z",
    });

    expect(parsed).toEqual({
      patientId: "pat-1",
      episodeOfCareId: "epi-1",
      occurrenceDate: "2026-04-17T10:30:00Z",
    });
  });

  it("fails with invalid occurrenceDate format", () => {
    expect(() =>
      createEncounterSchema.parse({
        patientId: "pat-1",
        episodeOfCareId: "epi-1",
        occurrenceDate: "2026-04-17",
      }),
    ).toThrow("occurrenceDate: formato dateTime inválido.");
  });

  it("fails with invalid shape", () => {
    expect(() => createEncounterSchema.parse("invalid")).toThrow("createEncounterSchema: se esperaba un objeto.");
  });
});
