import { describe, expect, it } from "vitest";

import {
  buildGoogleMapsSearchHref,
  buildWhatsAppHref,
  formatAddressDisplay,
  formatPhoneDisplay,
} from "@/lib/patient-contact-links";

describe("patient-contact-links", () => {
  it("formats phone display with fallback", () => {
    expect(formatPhoneDisplay("  +54 299 555 0101 ")).toBe("+54 299 555 0101");
    expect(formatPhoneDisplay("")).toBe("Sin teléfono");
    expect(formatPhoneDisplay(undefined)).toBe("Sin teléfono");
  });

  it("builds whatsapp href only for valid phone values", () => {
    expect(buildWhatsAppHref("+54 299 555 0101")).toBe("https://wa.me/542995550101");
    expect(buildWhatsAppHref("   ")).toBeNull();
    expect(buildWhatsAppHref("abc")).toBeNull();
  });

  it("formats address display and maps href with fallback", () => {
    expect(formatAddressDisplay("  Belgrano 123, Neuquén ")).toBe("Belgrano 123, Neuquén");
    expect(formatAddressDisplay(undefined)).toBe("Sin dirección");
    expect(buildGoogleMapsSearchHref("Belgrano 123")).toBe(
      "https://www.google.com/maps/search/?api=1&query=Belgrano%20123",
    );
    expect(buildGoogleMapsSearchHref("")).toBeNull();
  });
});
