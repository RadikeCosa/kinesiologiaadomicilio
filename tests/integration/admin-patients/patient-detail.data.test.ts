import "./test-setup";

import { describe, expect, it } from "vitest";

import { loadPatientDetail } from "@/app/admin/patients/[id]/data";

describe("loadPatientDetail", () => {
  it("returns null when patient does not exist", async () => {
    const detail = await loadPatientDetail("pat-999");

    expect(detail).toBeNull();
  });

  it("returns activeEpisode null when patient has no active episode", async () => {
    const detail = await loadPatientDetail("pat-002");

    expect(detail).not.toBeNull();
    expect(detail?.activeEpisode).toBeNull();
  });

  it("returns detail with active episode when patient has one", async () => {
    const detail = await loadPatientDetail("pat-003");

    expect(detail).not.toBeNull();
    expect(detail?.activeEpisode).toMatchObject({
      patientId: "pat-003",
      status: "active",
    });
  });

  it("preserves operationalStatus derivation without service request side effects", async () => {
    const detail = await loadPatientDetail("pat-003");

    expect(detail?.operationalStatus).toBe("active_treatment");
  });
});
