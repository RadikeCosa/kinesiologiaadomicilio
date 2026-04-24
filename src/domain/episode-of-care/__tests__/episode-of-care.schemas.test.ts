import { describe, expect, it } from "vitest";

import {
  finishEpisodeOfCareSchema,
  startEpisodeOfCareSchema,
} from "@/domain/episode-of-care/episode-of-care.schemas";

describe("episode-of-care.schemas", () => {
  it("requires patientId and startDate", () => {
    expect(() => startEpisodeOfCareSchema.parse({ startDate: "2026-04-16" })).toThrow(
      "patientId: debe ser un string.",
    );
    expect(() => startEpisodeOfCareSchema.parse({ patientId: "pat-001" })).toThrow(
      "startDate: debe ser un string.",
    );
  });

  it("parses start input", () => {
    const parsed = startEpisodeOfCareSchema.parse({
      patientId: " pat-001 ",
      startDate: " 2026-04-16 ",
    });

    expect(parsed).toEqual({
      patientId: "pat-001",
      startDate: "2026-04-16",
    });
  });

  it("parses finish input", () => {
    const parsed = finishEpisodeOfCareSchema.parse({
      patientId: " pat-001 ",
      endDate: " 2026-04-20 ",
    });

    expect(parsed).toEqual({
      patientId: "pat-001",
      endDate: "2026-04-20",
    });
  });

  it("rejects invalid calendar and format values for startDate/endDate", () => {
    expect(() =>
      startEpisodeOfCareSchema.parse({
        patientId: "pat-001",
        startDate: "2026-13-01",
      }),
    ).toThrow("startDate: formato inválido (YYYY-MM-DD).");

    expect(() =>
      finishEpisodeOfCareSchema.parse({
        patientId: "pat-001",
        endDate: "2026-02-31",
      }),
    ).toThrow("endDate: formato inválido (YYYY-MM-DD).");

    expect(() =>
      startEpisodeOfCareSchema.parse({
        patientId: "pat-001",
        startDate: "17-04-2026",
      }),
    ).toThrow("startDate: formato inválido (YYYY-MM-DD).");
  });

  it("rejects empty startDate/endDate strings", () => {
    expect(() =>
      startEpisodeOfCareSchema.parse({
        patientId: "pat-001",
        startDate: "   ",
      }),
    ).toThrow("startDate: es obligatorio.");

    expect(() =>
      finishEpisodeOfCareSchema.parse({
        patientId: "pat-001",
        endDate: "",
      }),
    ).toThrow("endDate: es obligatorio.");
  });

  it("fails with invalid shape", () => {
    expect(() => startEpisodeOfCareSchema.parse("invalid-shape")).toThrow(
      "startEpisodeOfCareSchema: se esperaba un objeto.",
    );
  });
});
