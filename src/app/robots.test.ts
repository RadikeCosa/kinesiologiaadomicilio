import { describe, expect, it } from "vitest";

import robots from "@/app/robots";

describe("robots", () => {
  it("blocks admin crawling", () => {
    const metadata = robots();
    const rules = Array.isArray(metadata.rules) ? metadata.rules : [metadata.rules];
    const globalRule = rules.find((rule) => rule?.userAgent === "*");

    expect(globalRule).toBeDefined();
    const disallow = Array.isArray(globalRule?.disallow)
      ? globalRule.disallow
      : [globalRule?.disallow].filter(Boolean);

    expect(disallow).toContain("/admin");
    expect(disallow).toContain("/admin/");
  });
});
