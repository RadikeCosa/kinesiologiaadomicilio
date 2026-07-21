import { describe, expect, it } from "vitest";

import { extractEntries, extractNextBundlePageUrl, extractResourcesByType, extractSingleResource } from "@/lib/fhir/bundle-utils";
import { type FhirBundle } from "@/lib/fhir/types";

describe("bundle-utils", () => {
  it("returns an empty array when bundle has no entries", () => {
    const bundle: FhirBundle = { resourceType: "Bundle" };

    expect(extractEntries(bundle)).toEqual([]);
  });

  it("filters resources by resourceType", () => {
    const bundle: FhirBundle = {
      resourceType: "Bundle",
      entry: [
        { resource: { resourceType: "Patient", id: "p-1" } },
        { resource: { resourceType: "EpisodeOfCare", id: "e-1" } },
        { resource: { resourceType: "Patient", id: "p-2" } },
      ],
    };

    const patients = extractResourcesByType<{ resourceType: "Patient"; id: string }>(bundle, "Patient");

    expect(patients).toEqual([
      { resourceType: "Patient", id: "p-1" },
      { resourceType: "Patient", id: "p-2" },
    ]);
  });

  it("extracts a single resource by type when available", () => {
    const bundle: FhirBundle = {
      resourceType: "Bundle",
      entry: [{ resource: { resourceType: "Patient", id: "p-1" } }],
    };

    const patient = extractSingleResource<{ resourceType: "Patient"; id: string }>(bundle, "Patient");

    expect(patient).toEqual({ resourceType: "Patient", id: "p-1" });
  });

  it("extracts the next page URL from bundle links", () => {
    const bundle: FhirBundle = {
      resourceType: "Bundle",
      link: [
        { relation: "self", url: "http://fhir.test/Encounter?subject=Patient%2Fpat-1" },
        { relation: "next", url: "http://fhir.test/Encounter?_getpages=abc" },
      ],
    };

    expect(extractNextBundlePageUrl(bundle)).toBe("http://fhir.test/Encounter?_getpages=abc");
  });

  it("returns null when bundle has no next page URL", () => {
    expect(extractNextBundlePageUrl({ resourceType: "Bundle" })).toBeNull();
    expect(extractNextBundlePageUrl({
      resourceType: "Bundle",
      link: [{ relation: "next", url: "   " }],
    })).toBeNull();
  });
});
