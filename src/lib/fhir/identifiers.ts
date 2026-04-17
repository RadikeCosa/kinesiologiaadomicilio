import { type FhirIdentifier } from "@/lib/fhir/types";

export const DNI_IDENTIFIER_SYSTEM = "https://kinesiologiaadomicilio.ar/fhir/sid/dni";

export function buildDniIdentifier(dni: string): FhirIdentifier {
  return {
    system: DNI_IDENTIFIER_SYSTEM,
    value: dni.trim(),
  };
}

export function formatIdentifierSearchValue(identifier: FhirIdentifier): string {
  return `${identifier.system}|${identifier.value}`;
}
