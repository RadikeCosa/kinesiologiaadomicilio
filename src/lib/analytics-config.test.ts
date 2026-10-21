import { describe, expect, it } from "vitest";
import { getPublicAnalyticsId } from "./analytics-config";

describe("production analytics isolation", () => {
  it.each(["development", "test"])("does not load GA in %s", (nodeEnv) => {
    expect(getPublicAnalyticsId({ gaId: "G-TEST", nodeEnv })).toBeUndefined();
  });
  it.each(["preview", "development"])("does not load GA in a Vercel %s build", (vercelEnv) => {
    expect(getPublicAnalyticsId({ gaId: "G-TEST", nodeEnv: "production", vercelEnv })).toBeUndefined();
  });
  it("requires a configured ID in production", () => {
    expect(getPublicAnalyticsId({ nodeEnv: "production", vercelEnv: "production" })).toBeUndefined();
    expect(getPublicAnalyticsId({ gaId: "G-TEST", nodeEnv: "production", vercelEnv: "production" })).toBe("G-TEST");
  });
  it("supports an explicitly configured production build outside Vercel", () => {
    expect(getPublicAnalyticsId({ gaId: "G-TEST", nodeEnv: "production" })).toBe("G-TEST");
  });
});
