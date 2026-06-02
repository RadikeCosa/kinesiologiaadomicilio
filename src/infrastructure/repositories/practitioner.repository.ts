import type { SigningProfessionalConfig, UpsertSigningProfessionalInput } from "@/domain/signing-professional/signing-professional.types";
import { upsertSigningProfessionalSchema } from "@/domain/signing-professional/signing-professional.schemas";
import { extractResourcesByType } from "@/lib/fhir/bundle-utils";
import { fhirClient } from "@/lib/fhir/client";
import { FhirClientError } from "@/lib/fhir/errors";
import { buildPractitionerByIdentifierQuery } from "@/lib/fhir/search-params";
import type { FhirBundle } from "@/lib/fhir/types";

import {
  SIGNING_PRACTITIONER_SINGLETON_IDENTIFIER_SYSTEM,
  SIGNING_PRACTITIONER_SINGLETON_IDENTIFIER_VALUE,
} from "@/infrastructure/mappers/practitioner/practitioner.constants";
import type { FhirPractitioner } from "@/infrastructure/mappers/practitioner/practitioner-fhir.types";
import { mapFhirPractitionerToSigningProfessionalConfig } from "@/infrastructure/mappers/practitioner/practitioner-read.mapper";
import {
  applySigningProfessionalUpdateToFhirPractitioner,
  mapUpsertSigningProfessionalInputToFhirPractitioner,
} from "@/infrastructure/mappers/practitioner/practitioner-write.mapper";

function buildSearchPath(resourceType: string, query: string): string {
  return query ? `${resourceType}?${query}` : resourceType;
}

export class SigningProfessionalAmbiguousError extends Error {
  constructor(count: number) {
    super(`Signing professional configuration is ambiguous: ${count} Practitioner resources match the singleton identifier.`);
    this.name = "SigningProfessionalAmbiguousError";
  }
}

function assertMappedSigningProfessional(
  resource: SigningProfessionalConfig,
  context: string,
): SigningProfessionalConfig {
  if (!resource.id?.trim()) {
    throw new Error(`practitioner.repository (${context}): id ausente en Practitioner mapeado.`);
  }

  return resource;
}

function buildSigningProfessionalQuery(): string {
  return buildPractitionerByIdentifierQuery({
    system: SIGNING_PRACTITIONER_SINGLETON_IDENTIFIER_SYSTEM,
    value: SIGNING_PRACTITIONER_SINGLETON_IDENTIFIER_VALUE,
  });
}

async function listSigningProfessionalPractitioners(): Promise<FhirPractitioner[]> {
  const query = buildSigningProfessionalQuery();
  const bundle = await fhirClient.get<FhirBundle<FhirPractitioner>>(buildSearchPath("Practitioner", query));
  return extractResourcesByType<FhirPractitioner>(bundle, "Practitioner")
    .filter((resource) => resource.id?.trim());
}

async function getSingleSigningProfessionalPractitioner(): Promise<FhirPractitioner | null> {
  const resources = await listSigningProfessionalPractitioners();

  if (resources.length === 0) {
    return null;
  }

  if (resources.length > 1) {
    throw new SigningProfessionalAmbiguousError(resources.length);
  }

  return resources[0] ?? null;
}

export async function getSigningProfessionalConfig(): Promise<SigningProfessionalConfig | null> {
  const resource = await getSingleSigningProfessionalPractitioner();

  if (!resource) {
    return null;
  }

  return assertMappedSigningProfessional(mapFhirPractitionerToSigningProfessionalConfig(resource), "get");
}

async function getPractitionerById(id: string): Promise<FhirPractitioner | null> {
  if (!id.trim()) {
    return null;
  }

  try {
    return await fhirClient.get<FhirPractitioner>(`Practitioner/${id}`);
  } catch (error) {
    if (error instanceof FhirClientError && error.status === 404) {
      return null;
    }

    throw error;
  }
}

export async function upsertSigningProfessionalConfig(input: UpsertSigningProfessionalInput): Promise<SigningProfessionalConfig> {
  const parsedInput = upsertSigningProfessionalSchema.parse(input);
  const existingSearchResult = await getSingleSigningProfessionalPractitioner();

  if (!existingSearchResult) {
    const payload = mapUpsertSigningProfessionalInputToFhirPractitioner(parsedInput);
    const created = await fhirClient.post<FhirPractitioner>("Practitioner", payload);

    return assertMappedSigningProfessional(mapFhirPractitionerToSigningProfessionalConfig(created), "create");
  }

  const existing = await getPractitionerById(existingSearchResult.id ?? "");

  if (!existing?.id) {
    throw new Error(`Practitioner not found: ${existingSearchResult.id ?? ""}`);
  }

  const payload = applySigningProfessionalUpdateToFhirPractitioner({
    existing,
    input: parsedInput,
  });
  const updated = await fhirClient.put<FhirPractitioner>(`Practitioner/${existing.id}`, payload);

  return assertMappedSigningProfessional(mapFhirPractitionerToSigningProfessionalConfig(updated), "update");
}
