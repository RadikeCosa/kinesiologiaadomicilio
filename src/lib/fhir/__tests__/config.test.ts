import { afterEach, describe, expect, it, vi } from "vitest";

import { getFhirEnvironmentInfo } from "@/lib/fhir/config";

afterEach(() => {
    vi.unstubAllEnvs();
});

describe("getFhirEnvironmentInfo", () => {
    it("returns a missing state when FHIR_BASE_URL is absent", () => {
        vi.unstubAllEnvs();

        expect(getFhirEnvironmentInfo()).toMatchObject({
            kind: "missing",
            label: "FHIR no configurado",
            tone: "danger",
        });
    });

    it("classifies the dev endpoint", () => {
        vi.stubEnv("FHIR_BASE_URL", "http://localhost:8081/fhir");

        expect(getFhirEnvironmentInfo()).toMatchObject({
            kind: "dev",
            label: "FHIR dev/test",
            tone: "info",
            endpointLabel: "localhost:8081",
        });
    });

    it("classifies the local-real endpoint", () => {
        vi.stubEnv("FHIR_BASE_URL", "http://localhost:8080/fhir");

        expect(getFhirEnvironmentInfo()).toMatchObject({
            kind: "local_real",
            label: "FHIR local-real",
            tone: "warning",
            endpointLabel: "localhost:8080",
        });
    });

    it("classifies other endpoints as custom", () => {
        vi.stubEnv("FHIR_BASE_URL", "https://example.com/fhir");

        expect(getFhirEnvironmentInfo()).toMatchObject({
            kind: "custom",
            label: "FHIR custom",
            tone: "neutral",
            endpointLabel: "example.com",
        });
    });
});
