import { describe, expect, it } from "vitest";

import {
  buildTelHref,
  buildWhatsAppHref,
  CONTACT_RELATIONSHIP_OPTIONS,
  formatContactRelationshipLabel,
  formatDateDisplay,
  formatDateTimeDisplay,
  formatDniDisplay,
  formatEncounterStatusLabel,
  formatGenderLabel,
  formatPhoneDisplay,
  formatTimeDisplay,
  normalizeDni,
  normalizePhone,
} from "@/lib/patient-admin-display";

describe("patient-admin-display", () => {
  it("formats supported gender values to spanish labels", () => {
    expect(formatGenderLabel("male")).toBe("Hombre");
    expect(formatGenderLabel("female")).toBe("Mujer");
    expect(formatGenderLabel("other")).toBe("Otro");
    expect(formatGenderLabel("unknown")).toBe("Desconocido");
  });

  it("returns fallback when gender is missing", () => {
    expect(formatGenderLabel(undefined)).toBe("No informado");
  });

  it("formats supported contact relationship values to spanish labels", () => {
    expect(formatContactRelationshipLabel("parent")).toBe("Madre/padre");
    expect(formatContactRelationshipLabel("spouse")).toBe("Pareja/cónyuge");
    expect(formatContactRelationshipLabel("child")).toBe("Hijo/a");
    expect(formatContactRelationshipLabel("sibling")).toBe("Hermano/a");
    expect(formatContactRelationshipLabel("caregiver")).toBe("Cuidador/a");
    expect(formatContactRelationshipLabel("other")).toBe("Otro");
  });

  it("returns fallback when contact relationship is missing", () => {
    expect(formatContactRelationshipLabel(undefined)).toBe("No informado");
    expect(formatContactRelationshipLabel(null)).toBe("No informado");
  });

  it("exposes relationship options with stable internal values", () => {
    expect(CONTACT_RELATIONSHIP_OPTIONS).toEqual([
      { value: "parent", label: "Madre/padre" },
      { value: "spouse", label: "Pareja/cónyuge" },
      { value: "child", label: "Hijo/a" },
      { value: "sibling", label: "Hermano/a" },
      { value: "caregiver", label: "Cuidador/a" },
      { value: "other", label: "Otro" },
    ]);
  });

  it("normalizes dni values to digits only", () => {
    expect(normalizeDni("12.345.678")).toBe("12345678");
    expect(normalizeDni(" 12 345 678 ")).toBe("12345678");
    expect(normalizeDni("12-345-678")).toBe("12345678");
    expect(normalizeDni("")).toBe("");
    expect(normalizeDni(null)).toBe("");
    expect(normalizeDni(undefined)).toBe("");
  });

  it("formats dni values with separators and fallback", () => {
    expect(formatDniDisplay("12345678")).toBe("12.345.678");
    expect(formatDniDisplay("12.345.678")).toBe("12.345.678");
    expect(formatDniDisplay("   ")).toBe("No informado");
    expect(formatDniDisplay(undefined)).toBe("No informado");
  });

  it("normalizes phone preserving a leading +", () => {
    expect(normalizePhone(" +54 (299) 555-0101 ")).toBe("+542995550101");
    expect(normalizePhone("0054 299 555 0101")).toBe("+542995550101");
    expect(normalizePhone("(299) 555-0101")).toBe("2995550101");
    expect(normalizePhone("")).toBe("");
  });

  it("formats phone display with fallback", () => {
    expect(formatPhoneDisplay("+542995550101")).toBe("+54 299 555-0101");
    expect(formatPhoneDisplay("2995550101")).toBe("2995550101");
    expect(formatPhoneDisplay(undefined)).toBe("No informado");
  });

  it("builds tel and whatsapp links from normalized phone values", () => {
    expect(buildTelHref(" +54 (299) 555-0101 ")).toBe("tel:+542995550101");
    expect(buildWhatsAppHref(" +54 (299) 555-0101 ")).toBe("https://wa.me/542995550101");
    expect(buildTelHref("123")).toBeNull();
    expect(buildWhatsAppHref("abc")).toBeNull();
  });

  it("formats date display in dd/mm/aaaa with fallback", () => {
    expect(formatDateDisplay("1990-10-03")).toBe("03/10/1990");
    expect(formatDateDisplay(new Date("1990-10-03T00:00:00Z"))).toContain("1990");
    expect(formatDateDisplay(undefined)).toBe("No informado");
  });

  it("formats time display in 24h with fallback", () => {
    const formatted = formatTimeDisplay("2026-04-17T10:30:00Z");
    expect(formatted).toMatch(/^\d{2}:\d{2}$/);
    expect(formatTimeDisplay(undefined)).toBe("No informado");
  });

  it("formats date-time display with fallback", () => {
    const formatted = formatDateTimeDisplay("2026-04-17T10:30:00Z");
    expect(formatted).toContain("17/04/2026");
    expect(formatted).toMatch(/\d{2}:\d{2}/);
    expect(formatDateTimeDisplay(undefined)).toBe("No informado");
  });

  it("formats encounter statuses to human-friendly labels", () => {
    expect(formatEncounterStatusLabel("finished")).toBe("Registrada");
    expect(formatEncounterStatusLabel("in-progress")).toBe("En curso");
    expect(formatEncounterStatusLabel("planned")).toBe("Planificada");
    expect(formatEncounterStatusLabel("unknown")).toBe("No informado");
    expect(formatEncounterStatusLabel(undefined)).toBe("No informado");
  });
});
