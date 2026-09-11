import { describe, expect, it } from "vitest";
import { getWhatsAppUrl } from "@/lib/config";
import {
  WHATSAPP_FAMILY_MESSAGE,
  WHATSAPP_GLOBAL_PREQUALIFIED_MESSAGE,
  WHATSAPP_SERVICES_GENERAL_MESSAGE,
} from "@/lib/whatsapp-messages";

const FORBIDDEN_PREQUALIFICATION_PHRASES = [
  "Te cuento",
  "Indicá",
  "Decime",
  "Zona/barrio:",
  "Motivo de consulta:",
  "Edad aproximada",
  "edad aproximada",
  "motivo principal",
  "barrio o zona",
  "diagnóstico",
];

function expectConversationalMessage(message: string) {
  expect(message).toContain("Hola Ramiro");
  expect(message.length).toBeLessThanOrEqual(160);

  for (const phrase of FORBIDDEN_PREQUALIFICATION_PHRASES) {
    expect(message).not.toContain(phrase);
  }
}

describe("WHATSAPP_GLOBAL_PREQUALIFIED_MESSAGE", () => {
  it("keeps the initial WhatsApp message lightweight", () => {
    expect(WHATSAPP_GLOBAL_PREQUALIFIED_MESSAGE).toBe(
      "Hola Ramiro, quería consultar por kinesiología a domicilio.",
    );
    expectConversationalMessage(WHATSAPP_GLOBAL_PREQUALIFIED_MESSAGE);
    expect(WHATSAPP_GLOBAL_PREQUALIFIED_MESSAGE.toLowerCase()).not.toContain("valor");
  });
});

describe("WHATSAPP_FAMILY_MESSAGE", () => {
  it("opens a family consultation without asking for form-like details", () => {
    expect(WHATSAPP_FAMILY_MESSAGE).toBe(
      "Hola Ramiro, quería consultar por kinesiología a domicilio para un familiar.",
    );
    expectConversationalMessage(WHATSAPP_FAMILY_MESSAGE);
    expect(WHATSAPP_FAMILY_MESSAGE.toLowerCase()).not.toContain("valor");
  });
});

describe("WHATSAPP_SERVICES_GENERAL_MESSAGE", () => {
  it("uses the general conversational opening without prequalification fields", () => {
    expect(WHATSAPP_SERVICES_GENERAL_MESSAGE).toBe(
      "Hola Ramiro, quería consultar por kinesiología a domicilio.",
    );
    expectConversationalMessage(WHATSAPP_SERVICES_GENERAL_MESSAGE);
    expect(WHATSAPP_SERVICES_GENERAL_MESSAGE.toLowerCase()).not.toContain("valor");
  });
});

describe("getWhatsAppUrl", () => {
  it("keeps WhatsApp URLs encoded with the simplified text", () => {
    expect(getWhatsAppUrl(WHATSAPP_FAMILY_MESSAGE)).toBe(
      "https://wa.me/5492995217189?text=Hola%20Ramiro%2C%20quer%C3%ADa%20consultar%20por%20kinesiolog%C3%ADa%20a%20domicilio%20para%20un%20familiar.",
    );
  });
});
