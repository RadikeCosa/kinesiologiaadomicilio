import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { sendGAEvent } from "@next/third-parties/google";
import { trackWhatsAppIntent, trackPhoneClick, trackScroll50, trackScroll90 } from "@/lib/analytics";

vi.mock("@next/third-parties/google", () => ({
  sendGAEvent: vi.fn(),
}));

describe("trackWhatsAppIntent", () => {
  beforeEach(() => {
    vi.stubGlobal("window", {
      location: {
        pathname: "/services",
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("omits prefilled WhatsApp message content from analytics", () => {
    trackWhatsAppIntent({
      ctaLocation: "services",
      ctaLabel: "Consultar por WhatsApp",
      destination:
        "https://wa.me/5492995217189?text=Hola%20Ramiro%2C%20consulta%20por%20cuidados%20paliativos",
    });

    expect(sendGAEvent).toHaveBeenCalledWith("event", "whatsapp_intent", {
      channel: "whatsapp",
      cta_location: "services",
      cta_label: "Consultar por WhatsApp",
      destination: "https://wa.me/5492995217189",
      page_path: "/services",
    });
  });
});

describe("public contact and scroll event contract", () => {
  beforeEach(() => {
    vi.stubGlobal("window", { location: { pathname: "/" } });
    vi.stubGlobal("document", { title: "Página pública" });
  });
  afterEach(() => vi.unstubAllGlobals());

  it("emits one WhatsApp intent and never generate_lead per invocation", () => {
    trackWhatsAppIntent({ ctaLocation: "hero", ctaLabel: "Consultar", destination: "https://wa.me/10000000000?text=private#fragment" });
    expect(sendGAEvent).toHaveBeenCalledTimes(1);
    expect(sendGAEvent).toHaveBeenCalledWith("event", "whatsapp_intent", expect.objectContaining({ channel: "whatsapp", cta_location: "hero", page_path: "/", destination: "https://wa.me/10000000000" }));
  });

  it("strips queries and fragments from phone destinations and explicit paths", () => {
    trackPhoneClick({ ctaLocation: "footer", ctaLabel: "Teléfono footer", destination: "tel:+10000000000?body=private#private", pagePath: "/services?name=private#private" });
    expect(sendGAEvent).toHaveBeenCalledExactlyOnceWith("event", "phone_click", { channel: "phone", cta_location: "footer", cta_label: "Teléfono footer", destination: "tel:+10000000000", page_path: "/services" });
  });

  it.each(["/admin", "/admin/patients/private-id", "/unknown"])("does not send custom events for %s", (pagePath) => {
    trackWhatsAppIntent({ ctaLocation: "other", destination: "https://wa.me/10000000000", pagePath });
    trackPhoneClick({ ctaLocation: "footer", destination: "tel:+10000000000", pagePath });
    trackScroll50({ pagePath });
    trackScroll90({ pagePath });
    expect(sendGAEvent).not.toHaveBeenCalled();
  });

  it("preserves the public scroll event names and thresholds", () => {
    trackScroll50({ pagePath: "/evaluar" });
    trackScroll90({ pagePath: "/evaluar" });
    expect(sendGAEvent).toHaveBeenCalledTimes(2);
    expect(sendGAEvent).toHaveBeenNthCalledWith(1, "event", "scroll_50", { scroll_threshold: 50, page_path: "/evaluar", page_title: "Página pública" });
    expect(sendGAEvent).toHaveBeenNthCalledWith(2, "event", "scroll_90", { scroll_threshold: 90, page_path: "/evaluar", page_title: "Página pública" });
  });
});
