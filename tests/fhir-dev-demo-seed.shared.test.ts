import { describe, expect, it } from "vitest";

import {
  SAFE_FHIR_DEV_BASE_URL,
  assertSafeFhirBaseUrl,
  buildSeedManifest,
} from "../scripts/fhir-dev-demo-seed.shared.mjs";
import { buildDemoFhirResourcesFlat } from "../scripts/fhir-dev-demo-seed.data.mjs";

describe("fhir-dev-demo seed guards", () => {
  it("accepts only the exact disposable dev endpoint", () => {
    expect(assertSafeFhirBaseUrl(SAFE_FHIR_DEV_BASE_URL)).toBe(SAFE_FHIR_DEV_BASE_URL);
  });

  it("rejects empty, local-real, and remote endpoints", () => {
    expect(() => assertSafeFhirBaseUrl("")).toThrow(/FHIR_BASE_URL is required/i);
    expect(() => assertSafeFhirBaseUrl("http://localhost:8080/fhir")).toThrow(/localhost:8080/i);
    expect(() => assertSafeFhirBaseUrl("https://example.com/fhir")).toThrow(/Allowed endpoint/i);
  });
});

describe("fhir-dev-demo seed manifest", () => {
  it("describes the expected resource counts and scenarios", () => {
    const manifest = buildSeedManifest();

    expect(manifest.resourceCounts).toEqual({
      practitioner: 1,
      patients: 6,
      serviceRequests: 6,
      conditions: 6,
      episodes: 3,
      encounters: 6,
      observations: 24,
      total: 52,
    });

    expect(manifest.scenarioSummaries.map((scenario) => scenario.code)).toEqual([
      "active_treatment",
      "ready_to_start",
      "preliminary",
      "finished_treatment",
      "closed_without_treatment",
      "active_light",
    ]);
  });

  it("builds a flat resource list with unique type/id pairs", () => {
    const resources = buildDemoFhirResourcesFlat();
    const uniqueKeys = new Set(resources.map((resource) => `${resource.resourceType}/${resource.id}`));

    expect(uniqueKeys.size).toBe(resources.length);
  });
});
