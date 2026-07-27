import { describe, expect, it } from "vitest";
import { WHATSAPP_GLOBAL_PREQUALIFIED_MESSAGE } from "@/lib/whatsapp-messages";

describe("WHATSAPP_GLOBAL_PREQUALIFIED_MESSAGE", () => {
  it("keeps the initial WhatsApp message lightweight", () => {
    expect(WHATSAPP_GLOBAL_PREQUALIFIED_MESSAGE).toContain("Hola Ramiro");
    expect(WHATSAPP_GLOBAL_PREQUALIFIED_MESSAGE).not.toContain("Zona/barrio:");
    expect(WHATSAPP_GLOBAL_PREQUALIFIED_MESSAGE).not.toContain("Motivo de consulta:");
    expect(WHATSAPP_GLOBAL_PREQUALIFIED_MESSAGE).not.toContain("Edad aproximada");
    expect(WHATSAPP_GLOBAL_PREQUALIFIED_MESSAGE.toLowerCase()).not.toContain("valor");
  });
});

describe("WHATSAPP_FAMILY_MESSAGE", () => {
  it("invites useful context without becoming a form", async () => {
    const { WHATSAPP_FAMILY_MESSAGE } = await import("@/lib/whatsapp-messages");

    expect(WHATSAPP_FAMILY_MESSAGE).toContain("Hola Ramiro");
    expect(WHATSAPP_FAMILY_MESSAGE).toContain("edad aproximada");
    expect(WHATSAPP_FAMILY_MESSAGE).toContain("motivo principal");
    expect(WHATSAPP_FAMILY_MESSAGE).toContain("barrio o zona de Neuquén Capital");
    expect(WHATSAPP_FAMILY_MESSAGE).not.toContain("Zona/barrio:");
    expect(WHATSAPP_FAMILY_MESSAGE).not.toContain("Motivo de consulta:");
    expect(WHATSAPP_FAMILY_MESSAGE.toLowerCase()).not.toContain("valor");
  });
});

describe("WHATSAPP_SERVICES_GENERAL_MESSAGE", () => {
  it("asks for useful service context without publishing price details", async () => {
    const { WHATSAPP_SERVICES_GENERAL_MESSAGE } = await import("@/lib/whatsapp-messages");

    expect(WHATSAPP_SERVICES_GENERAL_MESSAGE).toContain("Hola Ramiro");
    expect(WHATSAPP_SERVICES_GENERAL_MESSAGE).toContain("edad aproximada");
    expect(WHATSAPP_SERVICES_GENERAL_MESSAGE).toContain("motivo");
    expect(WHATSAPP_SERVICES_GENERAL_MESSAGE).toContain("situación funcional");
    expect(WHATSAPP_SERVICES_GENERAL_MESSAGE).toContain("barrio o zona de Neuquén Capital");
    expect(WHATSAPP_SERVICES_GENERAL_MESSAGE.toLowerCase()).not.toContain("valor");
  });
});
