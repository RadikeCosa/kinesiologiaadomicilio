import { createFhirConfigError } from "@/lib/fhir/errors";

const FHIR_BASE_URL_ENV = "FHIR_BASE_URL";

export type FhirEnvironmentKind = "dev" | "local_real" | "custom" | "missing";

export interface FhirEnvironmentInfo {
  kind: FhirEnvironmentKind;
  label: string;
  tone: "info" | "warning" | "neutral" | "danger";
  endpointLabel: string;
  endpoint: string | null;
}

function normalizeConfiguredBaseUrl(value: string | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const parsedUrl = new URL(trimmed);
    return parsedUrl.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

export function getFhirEnvironmentInfo(): FhirEnvironmentInfo {
  if (typeof window !== "undefined") {
    return {
      kind: "missing",
      label: "FHIR no configurado",
      tone: "danger",
      endpointLabel: "sin endpoint",
      endpoint: null,
    };
  }

  const configuredBaseUrl = process.env[FHIR_BASE_URL_ENV]?.trim();
  const normalizedBaseUrl = normalizeConfiguredBaseUrl(configuredBaseUrl);

  if (!normalizedBaseUrl) {
    return {
      kind: "missing",
      label: "FHIR no configurado",
      tone: "danger",
      endpointLabel: "sin endpoint",
      endpoint: null,
    };
  }

  try {
    const parsedUrl = new URL(normalizedBaseUrl);
    const host = parsedUrl.hostname;
    const port = parsedUrl.port;
    const endpointLabel = port ? `${host}:${port}` : host;

    if (normalizedBaseUrl === "http://localhost:8081/fhir") {
      return {
        kind: "dev",
        label: "FHIR dev/test",
        tone: "info",
        endpointLabel,
        endpoint: normalizedBaseUrl,
      };
    }

    if (normalizedBaseUrl === "http://localhost:8080/fhir") {
      return {
        kind: "local_real",
        label: "FHIR local-real",
        tone: "warning",
        endpointLabel,
        endpoint: normalizedBaseUrl,
      };
    }

    return {
      kind: "custom",
      label: "FHIR custom",
      tone: "neutral",
      endpointLabel,
      endpoint: normalizedBaseUrl,
    };
  } catch {
    return {
      kind: "custom",
      label: "FHIR custom",
      tone: "neutral",
      endpointLabel: "endpoint inválido",
      endpoint: null,
    };
  }
}

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

  const normalizedBaseUrl = normalizeConfiguredBaseUrl(configuredBaseUrl);

  if (!normalizedBaseUrl) {
    throw createFhirConfigError({
      message: `Invalid ${FHIR_BASE_URL_ENV} value`,
      details: configuredBaseUrl,
    });
  }

  return normalizedBaseUrl;
}
