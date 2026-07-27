import { describe, expect, it } from "vitest";
import { SERVICES_PAGE_CONTENT } from "@/app/(public)/services/servicesPageContent";

describe("SERVICES_PAGE_CONTENT", () => {
  it("positions /services around situations and evaluation", () => {
    expect(SERVICES_PAGE_CONTENT.intro.title).toBe(
      "Servicios y situaciones atendidas a domicilio",
    );
    expect(SERVICES_PAGE_CONTENT.situations.items.length).toBeGreaterThanOrEqual(4);
    expect(SERVICES_PAGE_CONTENT.evaluation.description).toContain(
      "diagnóstico o indicación médica si existe",
    );
  });

  it("keeps FAQ operational without publishing unconfirmed details", () => {
    const faqText = SERVICES_PAGE_CONTENT.faq.items
      .map((item) => `${item.question} ${item.answer}`)
      .join(" ");

    expect(faqText).toContain("particular");
    expect(faqText).toContain("Neuquén Capital");
    expect(faqText).toContain("orden médica");
    expect(faqText.toLowerCase()).not.toContain("pami");
    expect(faqText).not.toMatch(/\$\s*\d/);
  });
});
