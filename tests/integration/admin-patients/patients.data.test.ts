import "./test-setup";

import { describe, expect, it } from "vitest";

import { loadPatientsList } from "@/app/admin/patients/data";

describe("loadPatientsList", () => {
  it("returns coherent read models", async () => {
    const list = await loadPatientsList();

    expect(list.length).toBeGreaterThanOrEqual(3);

    for (const item of list) {
      expect(item.id).toEqual(expect.any(String));
      expect(item.fullName).toEqual(expect.any(String));
      expect(item.createdAt).toEqual(expect.any(String));
      expect(item.updatedAt).toEqual(expect.any(String));
    }
  });

  it("derives expected operational statuses", async () => {
    const list = await loadPatientsList();

    const byId = new Map(list.map((item) => [item.id, item]));

    expect(byId.get("pat-001")?.operationalStatus).toBe("preliminary");
    expect(byId.get("pat-002")?.operationalStatus).toBe("ready_to_start");
    expect(byId.get("pat-003")?.operationalStatus).toBe("active_treatment");
  });
});
