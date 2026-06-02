import type { SigningProfessionalConfig } from "@/domain/signing-professional/signing-professional.types";
import { getSigningProfessionalConfig } from "@/infrastructure/repositories/practitioner.repository";

export async function loadSigningProfessionalConfig(): Promise<SigningProfessionalConfig> {
  const config = await getSigningProfessionalConfig();

  return config ?? { status: "missing" };
}
