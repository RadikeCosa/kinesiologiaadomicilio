import type { CreateServiceRequestInput, ServiceRequest } from "@/domain/service-request/service-request.types";
import { createServiceRequestSchema } from "@/domain/service-request/service-request.schemas";
import { extractResourcesByType } from "@/lib/fhir/bundle-utils";
import { fhirClient } from "@/lib/fhir/client";
import { FhirClientError } from "@/lib/fhir/errors";
import { buildServiceRequestBySubjectQuery } from "@/lib/fhir/search-params";
import type { FhirBundle } from "@/lib/fhir/types";

import { type FhirServiceRequest } from "@/infrastructure/mappers/service-request/service-request-fhir.types";
import { mapFhirServiceRequestToDomain } from "@/infrastructure/mappers/service-request/service-request-read.mapper";
import { mapCreateServiceRequestInputToFhir } from "@/infrastructure/mappers/service-request/service-request-write.mapper";

function buildSearchPath(resourceType: string, query: string): string {
  return query ? `${resourceType}?${query}` : resourceType;
}

function assertMappedServiceRequest(resource: ServiceRequest, context: string): ServiceRequest {
  if (!resource.id.trim()) {
    throw new Error(`service-request.repository (${context}): id ausente en ServiceRequest mapeado.`);
  }

  return resource;
}

export async function createServiceRequest(input: CreateServiceRequestInput): Promise<ServiceRequest> {
  const parsedInput = createServiceRequestSchema.parse(input);
  const payload = mapCreateServiceRequestInputToFhir(parsedInput);
  const created = await fhirClient.post<FhirServiceRequest>("ServiceRequest", payload);
  const mapped = mapFhirServiceRequestToDomain(created);

  return assertMappedServiceRequest(mapped, "create");
}

export async function listServiceRequestsByPatientId(patientId: string): Promise<ServiceRequest[]> {
  if (!patientId.trim()) {
    return [];
  }

  const query = buildServiceRequestBySubjectQuery(patientId);
  const bundle = await fhirClient.get<FhirBundle<FhirServiceRequest>>(buildSearchPath("ServiceRequest", query));
  const resources = extractResourcesByType<FhirServiceRequest>(bundle, "ServiceRequest");

  return resources
    .map((resource) => mapFhirServiceRequestToDomain(resource))
    .filter((resource) => resource.id.trim().length > 0);
}

export async function getServiceRequestById(id: string): Promise<ServiceRequest | null> {
  if (!id.trim()) {
    return null;
  }

  try {
    const resource = await fhirClient.get<FhirServiceRequest>(`ServiceRequest/${id}`);
    const mapped = mapFhirServiceRequestToDomain(resource);

    return assertMappedServiceRequest(mapped, "getById");
  } catch (error) {
    if (error instanceof FhirClientError && error.status === 404) {
      return null;
    }

    throw error;
  }
}
