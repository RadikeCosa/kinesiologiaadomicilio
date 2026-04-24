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

export function formatPhoneDisplay(phone?: string): string {
  return formatPhoneDisplayFromAdminDisplay(phone);
}

export function buildWhatsAppHref(phone?: string): string | null {
  return buildWhatsAppHrefFromAdminDisplay(phone);
}

export function buildTelHref(phone?: string): string | null {
  return buildTelHrefFromAdminDisplay(phone);
}

export function formatAddressDisplay(address?: string): string {
  return cleanText(address) ?? "Sin dirección";
}

export function buildGoogleMapsSearchHref(address?: string): string | null {
  const normalizedAddress = cleanText(address);

  if (!normalizedAddress) {
    return null;
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(normalizedAddress)}`;
}
