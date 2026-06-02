import type { SigningProfessionalConfig, SigningProfessionalStatus } from "@/domain/signing-professional/signing-professional.types";

function hasText(value: string | undefined): boolean {
  return Boolean(value?.trim());
}

export function getSigningProfessionalStatus(
  config: Pick<SigningProfessionalConfig, "fullName" | "roleTitle" | "licenseNumber"> | null,
): SigningProfessionalStatus {
  if (!config) {
    return "missing";
  }

  if (!hasText(config.fullName) || !hasText(config.roleTitle) || !hasText(config.licenseNumber)) {
    return "incomplete";
  }

  return "ready";
}

export function applySigningProfessionalStatus(
  config: Omit<SigningProfessionalConfig, "status"> | null,
): SigningProfessionalConfig | null {
  if (!config) {
    return null;
  }

  return {
    ...config,
    status: getSigningProfessionalStatus(config),
  };
}
