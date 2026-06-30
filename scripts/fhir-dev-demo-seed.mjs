#!/usr/bin/env node

import { buildDemoFhirResourcesFlat } from "./fhir-dev-demo-seed.data.mjs";
import {
  assertSafeFhirBaseUrl,
  buildSeedManifest,
  formatSeedManifest,
} from "./fhir-dev-demo-seed.shared.mjs";

const REQUEST_TIMEOUT_MS = 15_000;
const FHIR_JSON_HEADERS = {
  Accept: "application/fhir+json",
  "Content-Type": "application/fhir+json",
};

function printHelp() {
  console.log(`Usage:
  FHIR_BASE_URL=http://localhost:8081/fhir node scripts/fhir-dev-demo-seed.mjs
  FHIR_BASE_URL=http://localhost:8081/fhir node scripts/fhir-dev-demo-seed.mjs --plan

Behavior:
  - Aborts unless FHIR_BASE_URL is exactly http://localhost:8081/fhir
  - Never resets or deletes resources
  - Uses controlled demo ids and idempotent PUT requests
  - Intended only for the disposable local dev/test HAPI FHIR server
`);
}

async function parseResponseBody(response) {
  const text = await response.text();

  if (!text) {
    return undefined;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function putResource(baseUrl, resource) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const url = `${baseUrl}/${resource.resourceType}/${resource.id}`;

  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: FHIR_JSON_HEADERS,
      body: JSON.stringify(resource),
      signal: controller.signal,
    });

    const parsedBody = await parseResponseBody(response);

    if (!response.ok) {
      const errorDetails =
        typeof parsedBody === "string"
          ? parsedBody
          : parsedBody?.issue?.[0]?.diagnostics
            ?? parsedBody?.issue?.[0]?.details?.text
            ?? JSON.stringify(parsedBody);

      throw new Error(
        `FHIR PUT failed for ${resource.resourceType}/${resource.id} (${response.status} ${response.statusText})${errorDetails ? `: ${errorDetails}` : ""}`,
      );
    }

    return parsedBody;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function main() {
  const args = new Set(process.argv.slice(2));

  if (args.has("--help") || args.has("-h")) {
    printHelp();
    return;
  }

  const baseUrl = assertSafeFhirBaseUrl(process.env.FHIR_BASE_URL);
  const manifest = buildSeedManifest();

  console.log(formatSeedManifest(manifest, baseUrl));

  if (args.has("--plan")) {
    return;
  }

  const resources = buildDemoFhirResourcesFlat();

  for (const resource of resources) {
    await putResource(baseUrl, resource);
    console.log(`PUT ${resource.resourceType}/${resource.id}`);
  }

  console.log("Demo seed complete.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
