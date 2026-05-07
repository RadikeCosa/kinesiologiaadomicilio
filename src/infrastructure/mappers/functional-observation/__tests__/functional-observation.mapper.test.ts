import { describe, expect, it } from "vitest";

import { FUNCTIONAL_OBSERVATION_CODE_SYSTEM } from "@/infrastructure/mappers/functional-observation/functional-observation.constants";
import { mapFhirObservationToFunctionalObservation } from "@/infrastructure/mappers/functional-observation/functional-observation-read.mapper";
import { mapFunctionalObservationInputToFhir } from "@/infrastructure/mappers/functional-observation/functional-observation-write.mapper";

describe("functional-observation mappers", () => {
  it("write mapper builds final Observation with subject and encounter", () => {
    const mapped = mapFunctionalObservationInputToFhir({
      patientId: "pat-1",
      encounterId: "enc-1",
      effectiveDateTime: "2026-05-07T10:30:00-03:00",
      code: "tug_seconds",
      value: 18.2,
    });

    expect(mapped.resourceType).toBe("Observation");
    expect(mapped.status).toBe("final");
    expect(mapped.subject?.reference).toBe("Patient/pat-1");
    expect(mapped.encounter?.reference).toBe("Encounter/enc-1");
    expect(mapped.code?.coding?.[0]?.system).toBe(FUNCTIONAL_OBSERVATION_CODE_SYSTEM);
    expect(mapped.valueQuantity?.value).toBe(18.2);
    expect(mapped.valueString).toBeUndefined();
  });

  it("read mapper reconstructs supported metrics", () => {
    const tug = mapFhirObservationToFunctionalObservation({
      resourceType: "Observation",
      id: "obs-1",
      status: "final",
      subject: { reference: "Patient/pat-1" },
      encounter: { reference: "Encounter/enc-1" },
      effectiveDateTime: "2026-05-07T10:30:00-03:00",
      code: { coding: [{ system: FUNCTIONAL_OBSERVATION_CODE_SYSTEM, code: "tug-seconds" }] },
      valueQuantity: { value: 15, unit: "s" },
    });

    expect(tug?.code).toBe("tug_seconds");

    const pain = mapFhirObservationToFunctionalObservation({
      resourceType: "Observation",
      id: "obs-2",
      status: "final",
      subject: { reference: "Patient/pat-1" },
      encounter: { reference: "Encounter/enc-1" },
      effectiveDateTime: "2026-05-07T10:30:00-03:00",
      code: { coding: [{ system: FUNCTIONAL_OBSERVATION_CODE_SYSTEM, code: "pain-nrs-0-10" }] },
      valueQuantity: { value: 4, unit: "score" },
    });

    expect(pain?.code).toBe("pain_nrs_0_10");
  });

  it("read mapper ignores unknown local codes", () => {
    const mapped = mapFhirObservationToFunctionalObservation({
      resourceType: "Observation",
      id: "obs-unknown",
      code: { coding: [{ system: FUNCTIONAL_OBSERVATION_CODE_SYSTEM, code: "other-code" }] },
    });

    expect(mapped).toBeNull();
  });
});
