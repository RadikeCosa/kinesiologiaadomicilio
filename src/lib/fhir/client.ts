import { getFhirBaseUrl } from "@/lib/fhir/config";
import { FhirClientError, buildHttpErrorMessage, extractOperationOutcome } from "@/lib/fhir/errors";

type FhirHttpMethod = "GET" | "POST" | "PUT";

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

  const response = await fetch(url, {
    method,
    headers: FHIR_JSON_HEADERS,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  const parsedBody = await parseJsonResponse(response);

  if (!response.ok) {
    const operationOutcome = extractOperationOutcome(parsedBody);

    throw new FhirClientError({
      message: buildHttpErrorMessage({ method, url, status: response.status, operationOutcome }),
      method,
      url,
      status: response.status,
      body: parsedBody,
      operationOutcome,
    });
  }

  return parsedBody as TResponse;
}

export const fhirClient = {
  get: <TResponse>(path: string) => request<TResponse>("GET", path),
  post: <TResponse>(path: string, body: unknown) => request<TResponse>("POST", path, body),
  put: <TResponse>(path: string, body: unknown) => request<TResponse>("PUT", path, body),
};
