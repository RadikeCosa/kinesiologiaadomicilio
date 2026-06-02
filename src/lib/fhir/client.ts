import { getFhirBaseUrl } from "@/lib/fhir/config";
import {
  createFhirHttpError,
  createFhirNetworkError,
  extractOperationOutcome,
} from "@/lib/fhir/errors";

type FhirHttpMethod = "GET" | "POST" | "PUT";
const FHIR_REQUEST_TIMEOUT_MS = 10000;

const FHIR_JSON_HEADERS = {
  Accept: "application/fhir+json",
  "Content-Type": "application/fhir+json",
};

async function parseJsonResponse(response: Response): Promise<unknown> {
  const rawBody = await response.text();

  if (!rawBody) {
    return undefined;
  }

  try {
    return JSON.parse(rawBody) as unknown;
  } catch {
    return rawBody;
  }
}

async function request<TResponse>(method: FhirHttpMethod, path: string, body?: unknown): Promise<TResponse> {
  const baseUrl = getFhirBaseUrl();
  const url = new URL(path.replace(/^\//, ""), `${baseUrl}/`).toString();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FHIR_REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method,
      headers: FHIR_JSON_HEADERS,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache: "no-store",
      signal: controller.signal,
    });

    const parsedBody = await parseJsonResponse(response);

    if (!response.ok) {
      const operationOutcome = extractOperationOutcome(parsedBody);

      throw createFhirHttpError({
        method,
        url,
        status: response.status,
        body: parsedBody,
        operationOutcome,
      });
    }

    return parsedBody as TResponse;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw createFhirNetworkError({
        method,
        url,
        cause: error,
        kind: "timeout",
      });
    }

    if (error instanceof TypeError) {
      throw createFhirNetworkError({
        method,
        url,
        cause: error,
        kind: "network",
      });
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export const fhirClient = {
  get: <TResponse>(path: string) => request<TResponse>("GET", path),
  post: <TResponse>(path: string, body: unknown) => request<TResponse>("POST", path, body),
  put: <TResponse>(path: string, body: unknown) => request<TResponse>("PUT", path, body),
};
