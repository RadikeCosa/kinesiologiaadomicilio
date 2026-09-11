import { describe, expect, it } from "vitest";
import { EVALUAR_CONTENT } from "@/app/(public)/evaluar/evaluar-content";

const FORBIDDEN_EVALUAR_MESSAGE_PATTERNS = [
  /te cuento/i,
  /indic[aá]/i,
  /decime/i,
  /edad/i,
  /barrio/i,
  /zona/i,
  /diagn[oó]stico/i,
  /antecedentes/i,
  /disponibilidad/i,
  /adecuad[oa]/i,
  /evaluaci[oó]n cl[ií]nica/i,
];

describe("EVALUAR_CONTENT WhatsApp messages", () => {
  it("keeps every branch as a short conversational opening with brief context", () => {
    const messages = EVALUAR_CONTENT.branches.map((branch) => branch.whatsappMessage);

    expect(new Set(messages).size).toBe(EVALUAR_CONTENT.branches.length);

    for (const message of messages) {
      expect(message).toContain("Hola Ramiro");
      expect(message.split(".").filter(Boolean).length).toBeLessThanOrEqual(2);
      expect(message.length).toBeLessThanOrEqual(150);

      for (const pattern of FORBIDDEN_EVALUAR_MESSAGE_PATTERNS) {
        expect(message).not.toMatch(pattern);
      }
    }
  });

  it("preserves useful branch context without turning the CTA into a form", () => {
    expect(
      EVALUAR_CONTENT.branches.find((branch) => branch.id === "movilidad-autonomia")
        ?.whatsappMessage,
    ).toContain("dificultad para caminar o moverme");

    expect(
      EVALUAR_CONTENT.branches.find((branch) => branch.id === "no-estoy-seguro")
        ?.whatsappMessage,
    ).toContain("No estoy seguro");
  });
});
