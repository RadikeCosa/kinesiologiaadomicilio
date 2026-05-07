import { describe, expect, it } from "vitest";

import { functionalObservationInputSchema } from "@/domain/functional-observation/functional-observation.schemas";

describe("functional-observation.schemas", () => {
  const base = {
    patientId: "pat-1",
    encounterId: "enc-1",
    effectiveDateTime: "2026-05-07T10:30:00-03:00",
  };

  it("accepts valid TUG", () => {
    expect(functionalObservationInputSchema.parse({ ...base, code: "tug_seconds", value: 22.5 }).value).toBe(22.5);
  });

  it("rejects TUG <=0 and >300", () => {
    expect(() => functionalObservationInputSchema.parse({ ...base, code: "tug_seconds", value: 0 })).toThrow();
    expect(() => functionalObservationInputSchema.parse({ ...base, code: "tug_seconds", value: 301 })).toThrow();
  });

  it("accepts pain 0 and 10", () => {
    expect(functionalObservationInputSchema.parse({ ...base, code: "pain_nrs_0_10", value: 0 }).value).toBe(0);
    expect(functionalObservationInputSchema.parse({ ...base, code: "pain_nrs_0_10", value: 10 }).value).toBe(10);
  });

  it("rejects pain decimal or out of range", () => {
    expect(() => functionalObservationInputSchema.parse({ ...base, code: "pain_nrs_0_10", value: 3.5 })).toThrow();
    expect(() => functionalObservationInputSchema.parse({ ...base, code: "pain_nrs_0_10", value: 11 })).toThrow();
  });

  it("accepts standing tolerance 0 and 240", () => {
    expect(functionalObservationInputSchema.parse({ ...base, code: "standing_tolerance_minutes", value: 0 }).value).toBe(0);
    expect(functionalObservationInputSchema.parse({ ...base, code: "standing_tolerance_minutes", value: 240 }).value).toBe(240);
  });

  it("rejects standing tolerance >240", () => {
    expect(() => functionalObservationInputSchema.parse({ ...base, code: "standing_tolerance_minutes", value: 241 })).toThrow();
  });
});
