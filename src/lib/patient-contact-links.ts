function cleanText(value?: string): string | undefined {
  const trimmed = value?.trim();

  if (!trimmed) {
    return undefined;
  }

  return trimmed;
}

export function formatPhoneDisplay(phone?: string): string {
  return cleanText(phone) ?? "Sin teléfono";
}

export function buildWhatsAppHref(phone?: string): string | null {
  const normalizedPhone = cleanText(phone)?.replace(/[^\d+]/g, "");

  if (!normalizedPhone) {
    return null;
  }

  const phoneForWa = normalizedPhone.startsWith("+") ? normalizedPhone.slice(1) : normalizedPhone;

  if (!phoneForWa || !/^\d+$/.test(phoneForWa)) {
    return null;
  }

  return `https://wa.me/${phoneForWa}`;
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
