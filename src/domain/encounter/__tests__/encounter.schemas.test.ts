import { describe, expect, it } from "vitest";

import { createEncounterSchema, updateEncounterPeriodSchema } from "@/domain/encounter/encounter.schemas";

describe("encounter.schemas", () => {
  it("requires patientId, episodeOfCareId and startedAt", () => {
    expect(() => createEncounterSchema.parse({ episodeOfCareId: "epi-1", startedAt: "2026-04-17T10:30" })).toThrow(
      "patientId: debe ser un string.",
    );

    expect(() => createEncounterSchema.parse({ patientId: "pat-1", startedAt: "2026-04-17T10:30" })).toThrow(
      "episodeOfCareId: debe ser un string.",
    );

    expect(() => createEncounterSchema.parse({ patientId: "pat-1", episodeOfCareId: "epi-1" })).toThrow(
      "startedAt: es obligatorio.",
    );
  });

  it("requires endedAt for new create payloads using startedAt", () => {
    expect(() =>
      createEncounterSchema.parse({
        patientId: "pat-1",
        episodeOfCareId: "epi-1",
        startedAt: "2026-04-17T10:30",
      })).toThrow("endedAt: es obligatorio.");
  });

  it("normalizes startedAt/endedAt datetime-local input to FHIR dateTime with seconds and offset", () => {
    const parsed = createEncounterSchema.parse({
      patientId: " pat-1 ",
      episodeOfCareId: " epi-1 ",
      startedAt: " 2026-04-17T10:30 ",
      endedAt: " 2026-04-17T10:45 ",
    });

    expect(parsed.patientId).toBe("pat-1");
    expect(parsed.episodeOfCareId).toBe("epi-1");
    expect(parsed.startedAt).toMatch(/^2026-04-17T10:30:00(?:Z|[+-]\d{2}:\d{2})$/);
    expect(parsed.endedAt).toMatch(/^2026-04-17T10:45:00(?:Z|[+-]\d{2}:\d{2})$/);
  });

  it("accepts endedAt when endedAt is equal or after startedAt", () => {
    const parsed = createEncounterSchema.parse({
      patientId: "pat-1",
      episodeOfCareId: "epi-1",
      startedAt: "2026-04-17T10:30",
      endedAt: "2026-04-17T11:15",
    });

    expect(parsed.startedAt).toMatch(/^2026-04-17T10:30:00(?:Z|[+-]\d{2}:\d{2})$/);
    expect(parsed.endedAt).toMatch(/^2026-04-17T11:15:00(?:Z|[+-]\d{2}:\d{2})$/);
  });

  it("fails when endedAt is before startedAt", () => {
    expect(() =>
      createEncounterSchema.parse({
        patientId: "pat-1",
        episodeOfCareId: "epi-1",
        startedAt: "2026-04-17T12:00",
        endedAt: "2026-04-17T10:30",
      }),
    ).toThrow("endedAt: debe ser igual o posterior al inicio.");
  });

  it("keeps compatibility with occurrenceDate transitional payload", () => {
    expect(() =>
      createEncounterSchema.parse({
        patientId: "pat-1",
        episodeOfCareId: "epi-1",
        occurrenceDate: "2026-04-17T10:30:00Z",
      }),
    ).toThrow("endedAt: es obligatorio.");
  });

  it("validates update start/end payload", () => {
    const parsed = updateEncounterPeriodSchema.parse({
      encounterId: " enc-1 ",
      patientId: " pat-1 ",
      startedAt: " 2026-04-17T10:30 ",
      endedAt: " 2026-04-17T11:10 ",
    });

    expect(parsed.encounterId).toBe("enc-1");
    expect(parsed.patientId).toBe("pat-1");
    expect(parsed.startedAt).toMatch(/^2026-04-17T10:30:00(?:Z|[+-]\d{2}:\d{2})$/);
    expect(parsed.endedAt).toMatch(/^2026-04-17T11:10:00(?:Z|[+-]\d{2}:\d{2})$/);
  });
});
