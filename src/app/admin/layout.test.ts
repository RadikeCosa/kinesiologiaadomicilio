import React, { createElement } from "react";
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import AdminLayout from "@/app/admin/layout";

(globalThis as { React?: typeof React }).React = React;

vi.mock("next/link", () => ({
  default: ({ children, href, ...rest }: { children: ReactNode; href: string }) =>
    createElement("a", { href, ...rest }, children),
}));

vi.mock("@/app/admin/components/AdminNavLink", () => ({
  AdminNavLink: ({ children, href }: { children: ReactNode; href: string }) =>
    createElement("a", { href }, children),
}));

describe("AdminLayout", () => {
  it("exposes professional configuration navigation", () => {
    const html = renderToStaticMarkup(
      createElement(AdminLayout, null, createElement("div", null, "contenido")),
    );

    expect(html).toContain("href=\"/admin/patients/\"");
    expect(html).toContain("href=\"/admin/patients/new\"");
    expect(html).toContain("href=\"/admin/configuracion/profesional\"");
    expect(html).toContain("Configuración");
  });
});
