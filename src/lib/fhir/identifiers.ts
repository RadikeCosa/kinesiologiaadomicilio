import { type FhirIdentifier } from "@/lib/fhir/types";

export const DNI_IDENTIFIER_SYSTEM = "https://kinesiologiaadomicilio.ar/fhir/sid/dni";
export const DNI_IDENTIFIER_TYPE_CODING_SYSTEM = "http://terminology.hl7.org/CodeSystem/v2-0203";
export const DNI_IDENTIFIER_TYPE_CODING_CODE = "NI";
export const DNI_IDENTIFIER_TYPE_TEXT = "DNI";

export function buildDniIdentifier(dni: string): FhirIdentifier {
  return {
    system: DNI_IDENTIFIER_SYSTEM,
    value: dni.trim(),
    type: {
      coding: [
        {
          system: DNI_IDENTIFIER_TYPE_CODING_SYSTEM,
          code: DNI_IDENTIFIER_TYPE_CODING_CODE,
          display: DNI_IDENTIFIER_TYPE_TEXT,
        },
      ],
      text: DNI_IDENTIFIER_TYPE_TEXT,
    },
  };
}

export function formatIdentifierSearchValue(identifier: FhirIdentifier): string {
  return `${identifier.system}|${identifier.value}`;
}
