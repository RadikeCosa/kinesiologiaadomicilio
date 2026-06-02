import { createFhirConfigError } from "@/lib/fhir/errors";

const FHIR_BASE_URL_ENV = "FHIR_BASE_URL";

export function getFhirBaseUrl(): string {
  if (typeof window !== "undefined") {
    throw new Error("FHIR config is server-only.");
  }

  const configuredBaseUrl = process.env[FHIR_BASE_URL_ENV]?.trim();

  if (!configuredBaseUrl) {
    throw createFhirConfigError({
      message: `Missing required server env var: ${FHIR_BASE_URL_ENV}`,
    });
  }

  try {
    const parsedUrl = new URL(configuredBaseUrl);
    return parsedUrl.toString().replace(/\/$/, "");
  } catch {
    throw createFhirConfigError({
      message: `Invalid ${FHIR_BASE_URL_ENV} value`,
      details: configuredBaseUrl,
    });
  }
}
