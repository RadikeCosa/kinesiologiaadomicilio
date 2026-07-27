import { describe, expect, it } from "vitest";
import { servicesData } from "@/lib/servicesData";

describe("servicesData", () => {
  it("keeps the current services with scannable clinical context", () => {
    expect(servicesData.map((service) => service.title)).toEqual([
      "Rehabilitación postoperatoria",
      "Adultos Mayores",
      "Cuidados Paliativos",
      "Recuperación Funcional",
    ]);

    for (const service of servicesData) {
      expect(service.description).toBeTruthy();
      expect(service.whenToConsult.length).toBeGreaterThanOrEqual(1);
      expect(service.evaluates.length).toBeGreaterThanOrEqual(1);
      expect(service.goal).toBeTruthy();
      expect(service.whatsappMessage).toContain("Hola Ramiro");
    }
  });

  it("keeps sensitive services clinically prudent", () => {
    const palliativeCare = servicesData.find(
      (service) => service.title === "Cuidados Paliativos",
    );

    expect(palliativeCare?.goal).toContain("sin reemplazar al equipo médico");
    expect(palliativeCare?.goal).not.toMatch(/garant|cura|calidad de vida/i);
  });
});
