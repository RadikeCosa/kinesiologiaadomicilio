import { describe, expect, it } from "vitest";

import robots from "@/app/robots";
import { BUSINESS_CONFIG } from "@/lib/config";

describe("robots", () => {
  it("includes the public sitemap URL", () => {
    const metadata = robots();

    expect(metadata.sitemap).toBe(`${BUSINESS_CONFIG.url}/sitemap.xml`);
  });

  it("keeps allow root and blocks admin routes", () => {
    const metadata = robots();
    const rules = Array.isArray(metadata.rules) ? metadata.rules : [metadata.rules];
    const globalRule = rules.find((rule) => rule?.userAgent === "*");

    expect(globalRule).toBeDefined();
    expect(globalRule?.allow).toBe("/");

    const disallow = Array.isArray(globalRule?.disallow)
      ? globalRule.disallow
      : [globalRule?.disallow].filter(Boolean);

    expect(disallow).toContain("/admin");
    expect(disallow).toContain("/admin/");
  });

  it("does not block sitemap.xml", () => {
    const metadata = robots();
    const rules = Array.isArray(metadata.rules) ? metadata.rules : [metadata.rules];
    const disallow = rules.flatMap((rule) =>
      Array.isArray(rule?.disallow)
        ? rule.disallow
        : [rule?.disallow].filter((value): value is string => Boolean(value)),
    );

    expect(disallow).not.toContain("/sitemap.xml");
  });

  it("has no contradictory public blocking rules", () => {
    const metadata = robots();
    const rules = Array.isArray(metadata.rules) ? metadata.rules : [metadata.rules];
    const globalRule = rules.find((rule) => rule?.userAgent === "*");

    expect(globalRule).toBeDefined();
    expect(globalRule?.allow).toBe("/");

    const disallow = Array.isArray(globalRule?.disallow)
      ? globalRule.disallow
      : [globalRule?.disallow].filter(Boolean);

    expect(disallow).not.toContain("/");
  });
});
