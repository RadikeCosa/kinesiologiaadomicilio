import { describe, expect, it } from "vitest";
import { WHATSAPP_GLOBAL_PREQUALIFIED_MESSAGE } from "@/lib/whatsapp-messages";

describe("WHATSAPP_GLOBAL_PREQUALIFIED_MESSAGE", () => {
  it("includes the soft pre-qualification fields without exact pricing", () => {
    expect(WHATSAPP_GLOBAL_PREQUALIFIED_MESSAGE).toContain("Zona/barrio:");
    expect(WHATSAPP_GLOBAL_PREQUALIFIED_MESSAGE).toContain("Motivo de consulta:");
    expect(WHATSAPP_GLOBAL_PREQUALIFIED_MESSAGE).toContain("Edad aproximada del paciente:");
    expect(WHATSAPP_GLOBAL_PREQUALIFIED_MESSAGE).toContain(
      "Quisiera conocer disponibilidad, modalidad de atención particular y valor.",
    );
    expect(WHATSAPP_GLOBAL_PREQUALIFIED_MESSAGE.toLowerCase()).not.toContain("precio exacto");
  });
});
