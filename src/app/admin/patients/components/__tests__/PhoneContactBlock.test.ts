import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { PhoneContactActions } from "@/app/admin/patients/components/PhoneContactActions";

describe("PhoneContactActions", () => {
  it("shows patient WhatsApp action when patient phone exists", () => {
    const html = renderToStaticMarkup(createElement(PhoneContactActions, {
      phone: "+54 299 555 0101",
      mainContactPhone: "+54 299 555 0202",
      entity: "patient",
    }));

    expect(html).toContain(">Mensaje<");
    expect(html).toContain('aria-label="Enviar WhatsApp al paciente"');
    expect(html).toContain('title="Enviar WhatsApp al paciente"');
    expect(html).toContain("https://wa.me/542995550101");
  });

  it("shows main contact WhatsApp action when patient phone is missing", () => {
    const html = renderToStaticMarkup(createElement(PhoneContactActions, {
      phone: undefined,
      mainContactPhone: "+54 299 555 0202",
      entity: "patient",
    }));

    expect(html).toContain(">Mensaje<");
    expect(html).toContain('aria-label="Enviar WhatsApp al contacto principal"');
    expect(html).toContain('title="Enviar WhatsApp al contacto principal"');
    expect(html).toContain("https://wa.me/542995550202");
  });

  it("shows fallback when no operative phones are available", () => {
    const html = renderToStaticMarkup(createElement(PhoneContactActions, {
      phone: "abc",
      mainContactPhone: "123",
      entity: "patient",
    }));

    expect(html).toContain("No hay canales telefónicos del paciente.");
    expect(html).not.toContain("wa.me");
  });

  it("shows entity-specific fallback for main contact", () => {
    const html = renderToStaticMarkup(createElement(PhoneContactActions, {
      phone: "abc",
      entity: "mainContact",
    }));

    expect(html).toContain("No hay canales telefónicos del contacto principal.");
    expect(html).not.toContain("No hay canales telefónicos del paciente.");
  });

  it("uses main contact accessibility labels for main contact actions", () => {
    const html = renderToStaticMarkup(createElement(PhoneContactActions, {
      phone: "+54 299 555 0202",
      entity: "mainContact",
    }));

    expect(html).toContain('aria-label="Enviar WhatsApp al contacto principal"');
    expect(html).toContain('title="Enviar WhatsApp al contacto principal"');
    expect(html).not.toContain('aria-label="Enviar WhatsApp al paciente"');
    expect(html).toContain(">Mensaje<");
  });
});
