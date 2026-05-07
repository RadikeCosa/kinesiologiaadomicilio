import { describe, expect, it, vi } from "vitest";

import { loadEpisodeClinicalContextReadModel } from "@/app/admin/patients/[id]/clinical-context";

vi.mock("@/infrastructure/repositories/condition.repository", () => ({ getConditionDiagnosisById: vi.fn() }));
import { getConditionDiagnosisById } from "@/infrastructure/repositories/condition.repository";

describe("loadEpisodeClinicalContextReadModel", () => {
  it("returns partial model when one condition is missing", async () => {
    vi.mocked(getConditionDiagnosisById)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ kind: "kinesiologic_impression", text: "Kin text" });

    const data = await loadEpisodeClinicalContextReadModel({
      id: "epi-1",
      patientId: "pat-1",
      status: "active",
      startDate: "2026-01-01",
      diagnosisReferences: [
        { kind: "medical_reference", conditionId: "missing" },
        { kind: "kinesiologic_impression", conditionId: "present" },
      ],
      clinicalContext: { therapeuticGoals: "Goal" },
    });

    expect(data?.medicalReferenceDiagnosisText).toBeUndefined();
    expect(data?.kinesiologicImpressionText).toBe("Kin text");
    expect(data?.therapeuticGoals).toBe("Goal");
    expect(data?.hasAnyContent).toBe(true);
  });
});
