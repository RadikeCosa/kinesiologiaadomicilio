import React, { createElement } from "react";
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import AdminSigningProfessionalPage from "@/app/admin/configuracion/profesional/page";

const loadSigningProfessionalConfigMock = vi.hoisted(() => vi.fn());
(globalThis as { React?: typeof React }).React = React;

vi.mock("next/link", () => ({
  default: ({ children, href, ...rest }: { children: ReactNode; href: string }) =>
    createElement("a", { href, ...rest }, children),
}));

vi.mock("@/features/signing-professional/read-models/signing-professional-config.read-model", () => ({
  loadSigningProfessionalConfig: loadSigningProfessionalConfigMock,
}));

vi.mock("@/app/admin/configuracion/profesional/components/SigningProfessionalSettingsPanel", () => ({
  SigningProfessionalSettingsPanel: ({ initialConfig }: { initialConfig: { status: string } }) =>
    createElement("div", null, `SigningProfessionalSettingsPanel:${initialConfig.status}`),
}));

describe("/admin/configuracion/profesional page", () => {
  it("renders professional settings page with read model", async () => {
    loadSigningProfessionalConfigMock.mockResolvedValueOnce({ status: "missing" });

    const element = await AdminSigningProfessionalPage();
    const html = renderToStaticMarkup(element);

    expect(html).toContain("← Volver al panel");
    expect(html).toContain("href=\"/admin/\"");
    expect(html).toContain("Configuración · Profesional firmante");
    expect(html).toContain("Esta pantalla no genera reportes ni firma documentos todavía.");
    expect(html).toContain("SigningProfessionalSettingsPanel:missing");
  });
});
