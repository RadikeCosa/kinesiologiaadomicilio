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

  it("accepts encounter creation without clinical note", () => {
    const parsed = createEncounterSchema.parse({
      patientId: "pat-1",
      episodeOfCareId: "epi-1",
      startedAt: "2026-04-17T10:30",
      endedAt: "2026-04-17T11:15",
    });

    expect(parsed.clinicalNote).toBeUndefined();
  });

  it("normalizes and keeps partial clinical note", () => {
    const parsed = createEncounterSchema.parse({
      patientId: "pat-1",
      episodeOfCareId: "epi-1",
      startedAt: "2026-04-17T10:30",
      endedAt: "2026-04-17T11:15",
      clinicalNote: {
        subjective: "  Refiere dolor  ",
        objective: "   ",
      },
    });

    expect(parsed.clinicalNote).toEqual({
      subjective: "Refiere dolor",
    });
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

  it("accepts visitStartPunctuality undefined", () => {
    const parsed = createEncounterSchema.parse({
      patientId: "pat-1",
      episodeOfCareId: "epi-1",
      startedAt: "2026-04-17T10:30",
      endedAt: "2026-04-17T11:15",
    });
    expect(parsed.visitStartPunctuality).toBeUndefined();
  });

  it("accepts visitStartPunctuality valid values", () => {
    const validValues = ["on_time_or_minor_delay", "delayed", "severely_delayed"] as const;
    for (const value of validValues) {
      const parsed = createEncounterSchema.parse({
        patientId: "pat-1",
        episodeOfCareId: "epi-1",
        startedAt: "2026-04-17T10:30",
        endedAt: "2026-04-17T11:15",
        visitStartPunctuality: value,
      });
      expect(parsed.visitStartPunctuality).toBe(value);
    }
  });

  it("rejects invalid visitStartPunctuality", () => {
    expect(() => createEncounterSchema.parse({
      patientId: "pat-1",
      episodeOfCareId: "epi-1",
      startedAt: "2026-04-17T10:30",
      endedAt: "2026-04-17T11:15",
      visitStartPunctuality: "late",
    })).toThrow("visitStartPunctuality: valor inválido.");
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

  it("trims only outer spaces and preserves case/new lines in clinical note", () => {
    const parsed = createEncounterSchema.parse({
      patientId: "pat-1",
      episodeOfCareId: "epi-1",
      startedAt: "2026-04-17T10:30",
      endedAt: "2026-04-17T11:15",
      clinicalNote: {
        assessment: `  Primera Línea
segunda línea MIXTA  `,
      },
    });

    expect(parsed.clinicalNote).toEqual({
      assessment: `Primera Línea
segunda línea MIXTA`,
    });
  });

  it("parses optional functional metrics and keeps pain 0", () => {
    const parsed = createEncounterSchema.parse({
      patientId: "pat-1",
      episodeOfCareId: "epi-1",
      startedAt: "2026-04-17T10:30",
      endedAt: "2026-04-17T11:15",
      tugSeconds: 18.5,
      painNrs010: 0,
      standingToleranceMinutes: 6,
    });
    expect(parsed.functionalObservations).toHaveLength(3);
    expect(parsed.functionalObservations?.find((item) => item.code === "pain_nrs_0_10")?.value).toBe(0);
  });

  it("rejects invalid functional metrics before create", () => {
    expect(() => createEncounterSchema.parse({
      patientId: "pat-1",
      episodeOfCareId: "epi-1",
      startedAt: "2026-04-17T10:30",
      endedAt: "2026-04-17T11:15",
      tugSeconds: 0,
    })).toThrow();
  });

});
