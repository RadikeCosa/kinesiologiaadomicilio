import { describe, expect, it } from "vitest";

import {
  buildTelHref,
  buildGoogleMapsSearchHref,
  buildWhatsAppHref,
  formatAddressDisplay,
  formatPhoneDisplay,
} from "@/lib/patient-contact-links";

describe("patient-contact-links", () => {
  it("formats phone display with fallback", () => {
    expect(formatPhoneDisplay("  +54 299 555 0101 ")).toBe("+54 299 555-0101");
    expect(formatPhoneDisplay("")).toBe("No informado");
    expect(formatPhoneDisplay(undefined)).toBe("No informado");
  });

  it("builds whatsapp href only for valid phone values", () => {
    expect(buildWhatsAppHref("+54 299 555 0101")).toBe("https://wa.me/542995550101");
    expect(buildWhatsAppHref("   ")).toBeNull();
    expect(buildWhatsAppHref("abc")).toBeNull();
  });

  it("builds tel href only for valid phone values", () => {
    expect(buildTelHref("+54 299 555 0101")).toBe("tel:+542995550101");
    expect(buildTelHref("123")).toBeNull();
    expect(buildTelHref(undefined)).toBeNull();
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
