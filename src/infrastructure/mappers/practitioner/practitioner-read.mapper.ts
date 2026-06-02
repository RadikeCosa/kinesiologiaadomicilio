import { applySigningProfessionalStatus } from "@/domain/signing-professional/signing-professional.rules";
import type { SigningProfessionalConfig } from "@/domain/signing-professional/signing-professional.types";

import {
  PRACTITIONER_PROFESSIONAL_LICENSE_IDENTIFIER_SYSTEM,
  PRACTITIONER_SIGNATURE_DISPLAY_EXTENSION_URL,
} from "@/infrastructure/mappers/practitioner/practitioner.constants";
import type { FhirPractitioner } from "@/infrastructure/mappers/practitioner/practitioner-fhir.types";

function normalizeOptionalString(value?: string): string | undefined {
  const normalized = value?.trim();
  return normalized || undefined;
}

function extractFullName(name?: FhirPractitioner["name"]): string | undefined {
  const primaryName = name?.find((item) => item.text?.trim()) ?? name?.[0];
  const text = normalizeOptionalString(primaryName?.text);

  if (text) {
    return text;
  }

  const given = primaryName?.given?.map((item) => item.trim()).filter(Boolean).join(" ");
  const family = normalizeOptionalString(primaryName?.family);
  return normalizeOptionalString([given, family].filter(Boolean).join(" "));
}

export function mapFhirPractitionerToSigningProfessionalConfig(
  resource: FhirPractitioner,
): SigningProfessionalConfig {
  const config = applySigningProfessionalStatus({
    id: normalizeOptionalString(resource.id),
    fullName: extractFullName(resource.name),
    roleTitle: normalizeOptionalString(resource.qualification?.[0]?.code?.text),
    licenseNumber: normalizeOptionalString(
      resource.identifier?.find((identifier) => identifier.system === PRACTITIONER_PROFESSIONAL_LICENSE_IDENTIFIER_SYSTEM)?.value,
    ),
    licenseJurisdiction: normalizeOptionalString(resource.qualification?.[0]?.issuer?.display),
    signatureDisplay: normalizeOptionalString(
      resource.extension?.find((extension) => extension.url === PRACTITIONER_SIGNATURE_DISPLAY_EXTENSION_URL)?.valueString,
    ),
    professionalPhone: normalizeOptionalString(
      resource.telecom?.find((telecom) => telecom.system === "phone" && telecom.use === "work")?.value
        ?? resource.telecom?.find((telecom) => telecom.system === "phone")?.value,
    ),
  });

  if (!config) {
    return { status: "missing" };
  }

  return config;
}
