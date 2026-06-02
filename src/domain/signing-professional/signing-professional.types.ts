export type SigningProfessionalStatus = "missing" | "incomplete" | "ready";

export interface SigningProfessionalConfig {
  id?: string;
  fullName?: string;
  roleTitle?: string;
  licenseNumber?: string;
  licenseJurisdiction?: string;
  signatureDisplay?: string;
  professionalPhone?: string;
  status: SigningProfessionalStatus;
}

export interface UpsertSigningProfessionalInput {
  fullName: string;
  roleTitle: string;
  licenseNumber?: string;
  licenseJurisdiction?: string;
  signatureDisplay?: string;
  professionalPhone?: string;
}
