import React, { type ReactElement } from "react";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { sendGAEvent } from "@next/third-parties/google";
import { WhatsAppButton } from "./WhatsAppButton";
import { PhoneLink } from "./PhoneLink";
import { ServiceCard } from "@/app/(public)/services/components/ServiceCard";
import { servicesData } from "@/lib/servicesData";

vi.mock("@next/third-parties/google", () => ({ sendGAEvent: vi.fn() }));

describe("contact handlers", () => {
  beforeEach(() => {
    vi.stubGlobal("React", React);
    vi.stubGlobal("window", { location: { pathname: "/" } });
  });
  afterEach(() => vi.unstubAllGlobals());

  it.each(["header", "hero", "how_it_works", "services", "evaluar", "footer"] as const)("sends exactly one intent for a click in %s without the message", (ctaLocation) => {
    const button = WhatsAppButton({ message: "Fictional private message", ctaLocation, ctaLabel: "Consultar", children: "Consultar" });
    expect(button.props.href).toContain("text=");
    button.props.onClick();
    expect(sendGAEvent).toHaveBeenCalledTimes(1);
    expect(sendGAEvent).toHaveBeenCalledWith("event", "whatsapp_intent", expect.objectContaining({ cta_location: ctaLocation, cta_label: "Consultar", channel: "whatsapp", page_path: "/" }));
    expect(JSON.stringify(vi.mocked(sendGAEvent).mock.calls)).not.toContain("Fictional");
  });

  it("keeps the footer phone destination and sends one click", () => {
    const link = PhoneLink({ destination: "tel:+10000000000", ctaLocation: "footer", ctaLabel: "Teléfono footer", children: "Llamar" });
    expect(link.props.href).toBe("tel:+10000000000");
    link.props.onClick();
    expect(sendGAEvent).toHaveBeenCalledExactlyOnceWith("event", "phone_click", expect.objectContaining({ channel: "phone", cta_location: "footer" }));
  });

  it("uses the same analytics label across services while preserving the visible service text", () => {
    for (const service of servicesData) {
      const card = ServiceCard({ service });
      const children = React.Children.toArray(card.props.children) as ReactElement<{ ctaLabel?: string; children?: string }>[];
      const button = children.find(child => child.type === WhatsAppButton);
      expect(button?.props.ctaLabel).toBe("Consultar servicio por WhatsApp");
      expect(button?.props.children).toContain(service.title);
    }
  });
});
