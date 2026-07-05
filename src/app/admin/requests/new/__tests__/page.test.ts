import React, { createElement } from "react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import AdminNewRequestPage from "@/app/admin/requests/new/page";

(globalThis as { React?: typeof React }).React = React;

vi.mock("next/link", () => ({
  default: ({ children, href, ...rest }: { children: ReactNode; href: string }) =>
    createElement("a", { href, ...rest }, children),
}));

vi.mock("@/app/admin/requests/new/components/RequestIntakeForm", () => ({
  RequestIntakeForm: () => createElement("div", null, "RequestIntakeForm"),
}));

describe("/admin/requests/new page", () => {
  it("renders the new intake entrypoint with route-local helper copy", () => {
    const html = renderToStaticMarkup(createElement(AdminNewRequestPage));

    expect(html).toContain("← Volver a administración");
    expect(html).toContain("href=\"/admin\"");
    expect(html).toContain("Nueva solicitud de atención");
    expect(html).toContain("Registrá la consulta inicial y definí luego si avanza a tratamiento.");
    expect(html).toContain("RequestIntakeForm");
  });
});
