import { describe, expect, it } from "vitest";

import { normalizeMainContactRelationship } from "@/domain/patient/contact-relationship";

describe("contact-relationship", () => {
  it("maps known aliases to transitional relationship catalog", () => {
    expect(normalizeMainContactRelationship("Madre")).toBe("parent");
    expect(normalizeMainContactRelationship("esposa")).toBe("spouse");
    expect(normalizeMainContactRelationship("hijo")).toBe("child");
    expect(normalizeMainContactRelationship("hermana")).toBe("sibling");
    expect(normalizeMainContactRelationship("cuidador")).toBe("caregiver");
  });

  it("falls back to other for unknown non-empty values", () => {
    expect(normalizeMainContactRelationship("Vecino")).toBe("other");
  });

  it("returns undefined for empty values", () => {
    expect(normalizeMainContactRelationship(undefined)).toBeUndefined();
    expect(normalizeMainContactRelationship("   ")).toBeUndefined();
  });
});
