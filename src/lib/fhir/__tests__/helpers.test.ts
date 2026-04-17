import { describe, expect, it } from "vitest";

import { DNI_IDENTIFIER_SYSTEM, buildDniIdentifier, formatIdentifierSearchValue } from "@/lib/fhir/identifiers";
import { buildPatientReference, extractIdFromReference } from "@/lib/fhir/references";
import {
  buildActiveEpisodeOfCareByPatientQuery,
  buildPatientListQuery,
  buildPatientSearchByDniQuery,
} from "@/lib/fhir/search-params";

describe("fhir helpers", () => {
  it("builds DNI identifier with fixed system", () => {
    expect(buildDniIdentifier(" 32123456 ")).toEqual({
      system: DNI_IDENTIFIER_SYSTEM,
      value: "32123456",
    });
  });

  it("formats identifier search value as system|value", () => {
    const identifier = buildDniIdentifier("32123456");
    expect(formatIdentifierSearchValue(identifier)).toBe(`${DNI_IDENTIFIER_SYSTEM}|32123456`);
  });

  it("builds patient references", () => {
    expect(buildPatientReference("patient-1")).toBe("Patient/patient-1");
  });

  it("extracts id from standard and historical references", () => {
    expect(extractIdFromReference("Patient/patient-1")).toBe("patient-1");
    expect(extractIdFromReference("http://localhost:8080/fhir/Patient/patient-2/_history/1")).toBe("patient-2");
    expect(extractIdFromReference(undefined)).toBeUndefined();
  });

  it("builds search query for patient by DNI", () => {
    expect(buildPatientSearchByDniQuery("32123456")).toBe(
      `identifier=${encodeURIComponent(`${DNI_IDENTIFIER_SYSTEM}|32123456`)}`,
    );
  });

  it("builds basic patient list query", () => {
    expect(buildPatientListQuery()).toBe("");
    expect(buildPatientListQuery({ count: 20 })).toBe("_count=20");
  });

  it("builds active episode search by patient", () => {
    expect(buildActiveEpisodeOfCareByPatientQuery("patient-1")).toBe("patient=Patient%2Fpatient-1&status=active");
  });
});
