import React, { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { SigningProfessionalSettingsPanel } from "@/app/admin/configuracion/profesional/components/SigningProfessionalSettingsPanel";

(globalThis as { React?: typeof React }).React = React;

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: vi.fn(),
  }),
}));

vi.mock("@/app/admin/configuracion/profesional/actions", () => ({
  upsertSigningProfessionalAction: vi.fn(),
}));

describe("SigningProfessionalSettingsPanel", () => {
  it("renders direct form when professional is missing", () => {
    const html = renderToStaticMarkup(createElement(SigningProfessionalSettingsPanel, {
      initialConfig: { status: "missing" },
    }));

    expect(html).toContain("Datos del profesional");
    expect(html).toContain("Nombre completo *");
    expect(html).toContain("Guardar profesional firmante");
    expect(html).not.toContain("Editar datos");
  });

  it("renders incomplete read state", () => {
    const html = renderToStaticMarkup(createElement(SigningProfessionalSettingsPanel, {
      initialConfig: {
        id: "prac-1",
        fullName: "Nombre Apellido",
        roleTitle: "Kinesiologo",
        status: "incomplete",
      },
    }));

    expect(html).toContain("Incompleto");
    expect(html).toContain("Nombre Apellido");
    expect(html).toContain("No informado");
    expect(html).toContain("Editar datos");
  });

  it("renders ready read state", () => {
    const html = renderToStaticMarkup(createElement(SigningProfessionalSettingsPanel, {
      initialConfig: {
        id: "prac-1",
        fullName: "Nombre Apellido",
        roleTitle: "Lic. en Kinesiología",
        licenseNumber: "MP-123",
        signatureDisplay: "Lic. Nombre Apellido - MP-123",
        status: "ready",
      },
    }));

    expect(html).toContain("Listo para firmar");
    expect(html).toContain("Lic. en Kinesiología");
    expect(html).toContain("MP-123");
    expect(html).toContain("Lic. Nombre Apellido - MP-123");
  });
});
