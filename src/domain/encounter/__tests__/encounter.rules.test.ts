import { describe, expect, it } from "vitest";

import { canCreateEncounter } from "@/domain/encounter/encounter.rules";

describe("encounter.rules", () => {
  it("fails when there is no active episode", () => {
    const result = canCreateEncounter({ hasActiveEpisode: false });

    expect(result).toMatchObject({
      ok: false,
      reason: "missing_active_episode",
    });
  });

  it("passes when there is an active episode", () => {
    const result = canCreateEncounter({ hasActiveEpisode: true });

    expect(result).toEqual({ ok: true });
  });
});
