import { describe, expect, it } from "vitest";

import { treatmentContextSchemas } from "@/domain/treatment-context/treatment-context.schemas";

describe("treatment context schemas", () => {
  it("accepts valid medical reference diagnosis", () => {
    const parsed = treatmentContextSchemas.episodeDiagnosisSchema.parse({
      kind: "medical_reference",
      text: "Lumbalgia mecánica",
    });

    expect(parsed.kind).toBe("medical_reference");
  });

  it("accepts valid kinesiologic impression", () => {
    const parsed = treatmentContextSchemas.episodeDiagnosisSchema.parse({
      kind: "kinesiologic_impression",
      text: "Disfunción de control lumbo-pélvico",
    });

    expect(parsed.kind).toBe("kinesiologic_impression");
  });

  it("rejects invalid diagnosis kind", () => {
    expect(() => treatmentContextSchemas.episodeDiagnosisSchema.parse({
      kind: "otro",
      text: "Texto",
    })).toThrow();
  });

  it("rejects diagnosis with empty text", () => {
    expect(() => treatmentContextSchemas.episodeDiagnosisSchema.parse({
      kind: "medical_reference",
      text: "   ",
    })).toThrow();
  });

  it("rejects completely empty upsert payload", () => {
    expect(() => treatmentContextSchemas.upsertEpisodeClinicalContextSchema.parse({
      patientId: "pat-1",
      episodeOfCareId: "epi-1",
    })).toThrow();
  });

  it("preserves case and internal line breaks", () => {
    const parsed = treatmentContextSchemas.episodeDiagnosisSchema.parse({
      kind: "medical_reference",
      text: "Dolor EN hombro\nDesde hace 2 semanas",
    });

    expect(parsed.text).toBe("Dolor EN hombro\nDesde hace 2 semanas");
  });
});
