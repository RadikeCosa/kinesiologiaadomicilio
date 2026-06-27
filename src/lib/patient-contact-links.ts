import {
  buildTelHref as buildTelHrefFromAdminDisplay,
  buildWhatsAppHref as buildWhatsAppHrefFromAdminDisplay,
  formatPhoneDisplay as formatPhoneDisplayFromAdminDisplay,
} from "@/lib/patient-admin-display";

function cleanText(value?: string): string | undefined {
  const trimmed = value?.trim();

  if (!trimmed) {
    return undefined;
  }

  return trimmed;
}

function normalizeForSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

function hasLocalContext(address: string): boolean {
  const normalized = normalizeForSearch(address);
  return normalized.includes("neuquen") || normalized.includes("argentina");
}

export function formatPhoneDisplay(phone?: string): string {
  return formatPhoneDisplayFromAdminDisplay(phone);
}

export function buildWhatsAppHref(phone?: string): string | null {
  return buildWhatsAppHrefFromAdminDisplay(phone);
}

export function buildTelHref(phone?: string): string | null {
  return buildTelHrefFromAdminDisplay(phone);
}

export type WhatsAppContactTarget = {
  href: string;
  visibleLabel: "Mensaje";
  accessibleLabel: "Enviar WhatsApp al paciente" | "Enviar WhatsApp al contacto principal";
  displayPhone: string;
  targetKind: "patient" | "mainContact";
};

type PatientWhatsAppContactSource = {
  phone?: string | null;
  mainContact?: {
    phone?: string | null;
  } | null;
};

export function resolvePatientWhatsAppTarget(patient: PatientWhatsAppContactSource): WhatsAppContactTarget | null {
  const patientWhatsappHref = buildWhatsAppHref(patient.phone ?? undefined);

  if (patientWhatsappHref) {
    return {
      href: patientWhatsappHref,
      visibleLabel: "Mensaje",
      accessibleLabel: "Enviar WhatsApp al paciente",
      displayPhone: formatPhoneDisplay(patient.phone ?? undefined),
      targetKind: "patient",
    };
  }

  const mainContactWhatsappHref = buildWhatsAppHref(patient.mainContact?.phone ?? undefined);

  if (mainContactWhatsappHref) {
    return {
      href: mainContactWhatsappHref,
      visibleLabel: "Mensaje",
      accessibleLabel: "Enviar WhatsApp al contacto principal",
      displayPhone: formatPhoneDisplay(patient.mainContact?.phone ?? undefined),
      targetKind: "mainContact",
    };
  }

  return null;
}

export function formatAddressDisplay(address?: string): string {
  return cleanText(address) ?? "Sin dirección";
}

export function buildGoogleMapsSearchHref(address?: string): string | null {
  const normalizedAddress = cleanText(address);

  if (!normalizedAddress) {
    return null;
  }

  const query = hasLocalContext(normalizedAddress)
    ? normalizedAddress
    : `${normalizedAddress}, Neuquén, Argentina`;

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
