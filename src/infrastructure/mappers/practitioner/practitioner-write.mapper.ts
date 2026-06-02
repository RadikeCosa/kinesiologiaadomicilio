import type { UpsertSigningProfessionalInput } from "@/domain/signing-professional/signing-professional.types";
import type { FhirIdentifier } from "@/lib/fhir/types";

import {
  PRACTITIONER_LICENSE_IDENTIFIER_TYPE_TEXT,
  PRACTITIONER_PROFESSIONAL_LICENSE_IDENTIFIER_SYSTEM,
  PRACTITIONER_SIGNATURE_DISPLAY_EXTENSION_URL,
  SIGNING_PRACTITIONER_SINGLETON_IDENTIFIER_SYSTEM,
  SIGNING_PRACTITIONER_SINGLETON_IDENTIFIER_VALUE,
} from "@/infrastructure/mappers/practitioner/practitioner.constants";
import type { FhirPractitioner } from "@/infrastructure/mappers/practitioner/practitioner-fhir.types";

function normalizeOptionalString(value?: string): string | undefined {
  const normalized = value?.trim();
  return normalized || undefined;
}

function buildSingletonIdentifier(): FhirIdentifier {
  return {
    system: SIGNING_PRACTITIONER_SINGLETON_IDENTIFIER_SYSTEM,
    value: SIGNING_PRACTITIONER_SINGLETON_IDENTIFIER_VALUE,
  };
}

function buildLicenseIdentifier(licenseNumber?: string): FhirIdentifier | undefined {
  const normalizedLicense = normalizeOptionalString(licenseNumber);

  if (!normalizedLicense) {
    return undefined;
  }

  return {
    system: PRACTITIONER_PROFESSIONAL_LICENSE_IDENTIFIER_SYSTEM,
    value: normalizedLicense,
    type: {
      text: PRACTITIONER_LICENSE_IDENTIFIER_TYPE_TEXT,
    },
  };
}

function buildIdentifiers(input: UpsertSigningProfessionalInput): FhirIdentifier[] {
  return [buildSingletonIdentifier(), buildLicenseIdentifier(input.licenseNumber)].filter(
    (identifier): identifier is FhirIdentifier => Boolean(identifier),
  );
}

function mergeIdentifiersPreservingExternal(
  existing: FhirPractitioner["identifier"] | undefined,
  next: FhirIdentifier[],
): FhirPractitioner["identifier"] {
  const external = (existing ?? []).filter((identifier) => (
    identifier.system !== SIGNING_PRACTITIONER_SINGLETON_IDENTIFIER_SYSTEM
    && identifier.system !== PRACTITIONER_PROFESSIONAL_LICENSE_IDENTIFIER_SYSTEM
  ));

  return [...external, ...next];
}

function buildName(input: UpsertSigningProfessionalInput): FhirPractitioner["name"] {
  return [{
    text: input.fullName,
  }];
}

function mergeNamesPreservingExternal(existing: FhirPractitioner["name"] | undefined, next: FhirPractitioner["name"]): FhirPractitioner["name"] {
  const external = (existing ?? []).filter((name) => name.use && name.use !== "official" && name.use !== "usual");
  return [...(next ?? []), ...external];
}

function buildTelecom(input: UpsertSigningProfessionalInput): FhirPractitioner["telecom"] {
  const phone = normalizeOptionalString(input.professionalPhone);

  if (!phone) {
    return undefined;
  }

  return [{
    system: "phone",
    value: phone,
    use: "work",
  }];
}

function mergeTelecomPreservingExternal(
  existing: FhirPractitioner["telecom"] | undefined,
  next: FhirPractitioner["telecom"],
): FhirPractitioner["telecom"] {
  const external = (existing ?? []).filter((telecom) => !(telecom.system === "phone" && telecom.use === "work"));
  const merged = [...external, ...(next ?? [])];
  return merged.length ? merged : undefined;
}

function buildQualification(input: UpsertSigningProfessionalInput): FhirPractitioner["qualification"] {
  return [{
    code: {
      text: input.roleTitle,
    },
    issuer: normalizeOptionalString(input.licenseJurisdiction)
      ? { display: normalizeOptionalString(input.licenseJurisdiction) }
      : undefined,
  }];
}

function mergeQualificationsPreservingExternal(
  existing: FhirPractitioner["qualification"] | undefined,
  next: FhirPractitioner["qualification"],
): FhirPractitioner["qualification"] {
  const external = (existing ?? []).slice(1);
  return [...(next ?? []), ...external];
}

function buildSignatureExtension(input: UpsertSigningProfessionalInput): NonNullable<FhirPractitioner["extension"]>[number] | undefined {
  const signatureDisplay = normalizeOptionalString(input.signatureDisplay);

  if (!signatureDisplay) {
    return undefined;
  }

  return {
    url: PRACTITIONER_SIGNATURE_DISPLAY_EXTENSION_URL,
    valueString: signatureDisplay,
  };
}

function mergeExtensionsPreservingExternal(
  existing: FhirPractitioner["extension"] | undefined,
  nextSignatureExtension: NonNullable<FhirPractitioner["extension"]>[number] | undefined,
): FhirPractitioner["extension"] {
  const external = (existing ?? []).filter((extension) => extension.url !== PRACTITIONER_SIGNATURE_DISPLAY_EXTENSION_URL);
  const merged = [...external, nextSignatureExtension].filter(
    (extension): extension is NonNullable<FhirPractitioner["extension"]>[number] => Boolean(extension),
  );

  return merged.length ? merged : undefined;
}

export function mapUpsertSigningProfessionalInputToFhirPractitioner(input: UpsertSigningProfessionalInput): FhirPractitioner {
  return {
    resourceType: "Practitioner",
    active: true,
    identifier: buildIdentifiers(input),
    name: buildName(input),
    telecom: buildTelecom(input),
    qualification: buildQualification(input),
    extension: mergeExtensionsPreservingExternal(undefined, buildSignatureExtension(input)),
  };
}

export function applySigningProfessionalUpdateToFhirPractitioner(options: {
  existing: FhirPractitioner;
  input: UpsertSigningProfessionalInput;
}): FhirPractitioner {
  const next = mapUpsertSigningProfessionalInputToFhirPractitioner(options.input);

  return {
    ...options.existing,
    resourceType: "Practitioner",
    active: true,
    identifier: mergeIdentifiersPreservingExternal(options.existing.identifier, next.identifier ?? []),
    name: mergeNamesPreservingExternal(options.existing.name, next.name),
    telecom: mergeTelecomPreservingExternal(options.existing.telecom, next.telecom),
    qualification: mergeQualificationsPreservingExternal(options.existing.qualification, next.qualification),
    extension: mergeExtensionsPreservingExternal(options.existing.extension, buildSignatureExtension(options.input)),
  };
}
