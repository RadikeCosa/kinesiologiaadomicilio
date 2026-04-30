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
      serviceRequestId: " sr-001 ",
    });

    expect(parsed).toEqual({
      patientId: "pat-001",
      startDate: "2026-04-16",
      serviceRequestId: "sr-001",
    });
  });

  it("keeps start input valid without optional serviceRequestId", () => {
    const parsed = startEpisodeOfCareSchema.parse({
      patientId: "pat-002",
      startDate: "2026-05-01",
    });

    expect(parsed).toEqual({
      patientId: "pat-002",
      startDate: "2026-05-01",
      serviceRequestId: undefined,
    });
  });

  it("parses finish input", () => {
    const parsed = finishEpisodeOfCareSchema.parse({
      patientId: " pat-001 ",
      endDate: " 2026-04-20 ",
      closureReason: " treatment_completed ",
      closureDetail: "  Alta funcional  ",
    });

    expect(parsed).toEqual({
      patientId: "pat-001",
      endDate: "2026-04-20",
      closureReason: "treatment_completed",
      closureDetail: "Alta funcional",
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
        closureReason: "treatment_completed",
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
        closureReason: "treatment_completed",
      }),
    ).toThrow("endDate: es obligatorio.");
  });

  it("fails with invalid shape", () => {
    expect(() => startEpisodeOfCareSchema.parse("invalid-shape")).toThrow(
      "startEpisodeOfCareSchema: se esperaba un objeto.",
    );
  });
});


it("requires closureDetail for other", () => {
  expect(() => finishEpisodeOfCareSchema.parse({
    patientId: "pat-001",
    endDate: "2026-04-20",
    closureReason: "other",
  })).toThrow('closureDetail: indicá un detalle para el motivo "Otro".');
});

it("rejects invalid closureReason", () => {
  expect(() => finishEpisodeOfCareSchema.parse({
    patientId: "pat-001",
    endDate: "2026-04-20",
    closureReason: "invalid",
  })).toThrow("closureReason: seleccioná un motivo de finalización.");
});
