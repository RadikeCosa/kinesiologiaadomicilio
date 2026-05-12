import { describe, expect, it } from "vitest";

import {
  buildTelHref,
  buildGoogleMapsSearchHref,
  buildWhatsAppHref,
  formatAddressDisplay,
  formatPhoneDisplay,
  resolvePatientWhatsAppTarget,
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
      "https://www.google.com/maps/search/?api=1&query=Belgrano%20123%2C%20Neuqu%C3%A9n%2C%20Argentina",
    );
    expect(buildGoogleMapsSearchHref("")).toBeNull();
  });

  it("does not duplicate local context when address already includes Neuquén or Argentina", () => {
    expect(buildGoogleMapsSearchHref("Belgrano 123, Neuquén")).toBe(
      "https://www.google.com/maps/search/?api=1&query=Belgrano%20123%2C%20Neuqu%C3%A9n",
    );
    expect(buildGoogleMapsSearchHref("Belgrano 123, Argentina")).toBe(
      "https://www.google.com/maps/search/?api=1&query=Belgrano%20123%2C%20Argentina",
    );
  });

  it("encodes query values correctly for Google Maps search URL", () => {
    expect(buildGoogleMapsSearchHref("Sarmiento 10 #A")).toBe(
      "https://www.google.com/maps/search/?api=1&query=Sarmiento%2010%20%23A%2C%20Neuqu%C3%A9n%2C%20Argentina",
    );
  });

  it("resolves WhatsApp target prioritizing patient phone over main contact", () => {
    expect(resolvePatientWhatsAppTarget({
      phone: "+54 299 555 0101",
      mainContact: { phone: "+54 299 555 0202" },
    })).toEqual({
      href: "https://wa.me/542995550101",
      visibleLabel: "WhatsApp paciente",
      accessibleLabel: "Enviar WhatsApp al paciente",
      displayPhone: "+54 299 555-0101",
      targetKind: "patient",
    });
  });

  it("resolves WhatsApp target using main contact phone when patient phone is missing", () => {
    expect(resolvePatientWhatsAppTarget({
      phone: undefined,
      mainContact: { phone: "+54 299 555 0202" },
    })).toEqual({
      href: "https://wa.me/542995550202",
      visibleLabel: "WhatsApp contacto principal",
      accessibleLabel: "Enviar WhatsApp al contacto principal",
      displayPhone: "+54 299 555-0202",
      targetKind: "mainContact",
    });
  });

  it("returns null when neither patient nor main contact has an operative phone", () => {
    expect(resolvePatientWhatsAppTarget({
      phone: "abc",
      mainContact: { phone: "123" },
    })).toBeNull();
  });
});
