import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { sendGAEvent } from "@next/third-parties/google";
import { trackWhatsAppIntent } from "@/lib/analytics";

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
