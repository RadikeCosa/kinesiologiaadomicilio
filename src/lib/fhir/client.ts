export interface FhirClient {
  request<TResponse>(_resourceType: string, _operation: string, _payload?: unknown): Promise<TResponse>;
}

export const fhirClientPlaceholder: FhirClient = {
  async request<TResponse>(): Promise<TResponse> {
    throw new Error("TODO(slice-1/fase-2): cliente FHIR aún no implementado.");
  },
};
