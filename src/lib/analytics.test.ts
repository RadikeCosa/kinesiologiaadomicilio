import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { sendGAEvent } from "@next/third-parties/google";
import { trackGenerateLead } from "@/lib/analytics";

vi.mock("@next/third-parties/google", () => ({
  sendGAEvent: vi.fn(),
}));

describe("trackGenerateLead", () => {
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

  it("keeps the generate_lead event contract for WhatsApp CTAs", () => {
    trackGenerateLead({
      ctaLocation: "services",
      ctaLabel: "Consultar por WhatsApp",
      destination: "https://wa.me/5492995217189?text=Hola%20Ramiro",
    });

    expect(sendGAEvent).toHaveBeenCalledWith("event", "generate_lead", {
      channel: "whatsapp",
      cta_location: "services",
      cta_label: "Consultar por WhatsApp",
      destination: "https://wa.me/5492995217189?text=Hola%20Ramiro",
      page_path: "/services",
    });
  });
});
