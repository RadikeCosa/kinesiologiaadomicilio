import { describe, expect, it } from "vitest";

import { mapFhirConditionToEpisodeDiagnosis } from "@/infrastructure/mappers/condition/condition-read.mapper";
import { mapDiagnosisInputToFhirCondition } from "@/infrastructure/mappers/condition/condition-write.mapper";

describe("condition mappers", () => {
  it("write mapper creates Condition with Patient reference and code.text", () => {
    const mapped = mapDiagnosisInputToFhirCondition({
      patientId: "pat-1",
      diagnosis: {
        kind: "medical_reference",
        text: "  Tendinopatía del supraespinoso  ",
      },
    });

    expect(mapped.resourceType).toBe("Condition");
    expect(mapped.subject?.reference).toBe("Patient/pat-1");
    expect(mapped.code?.text).toBe("Tendinopatía del supraespinoso");
  });

  it("read mapper reconstructs diagnosis text from Condition.code.text", () => {
    const mapped = mapFhirConditionToEpisodeDiagnosis({
      resourceType: "Condition",
      id: "cond-1",
      code: { text: "Cervicobraquialgia" },
      subject: { reference: "Patient/pat-1" },
    }, "kinesiologic_impression");

    expect(mapped.conditionId).toBe("cond-1");
    expect(mapped.kind).toBe("kinesiologic_impression");
    expect(mapped.text).toBe("Cervicobraquialgia");
  });

  it("does not write Condition.note", () => {
    const mapped = mapDiagnosisInputToFhirCondition({
      patientId: "pat-1",
      diagnosis: {
        kind: "kinesiologic_impression",
        text: "Déficit de estabilidad escapular",
      },
    });

    expect(mapped.note).toBeUndefined();
  });
});
