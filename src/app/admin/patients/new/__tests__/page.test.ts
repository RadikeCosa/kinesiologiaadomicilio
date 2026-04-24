import React, { createElement } from "react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import AdminNewPatientPage from "@/app/admin/patients/new/page";

(globalThis as { React?: typeof React }).React = React;

vi.mock("next/link", () => ({
  default: ({ children, href, ...rest }: { children: ReactNode; href: string }) =>
    createElement("a", { href, ...rest }, children),
}));

vi.mock("@/app/admin/patients/new/components/PatientCreateForm", () => ({
  PatientCreateForm: () => createElement("div", null, "PatientCreateForm"),
}));

describe("/admin/patients/new page", () => {
  it("renders standardized back link and operational copy", () => {
    const html = renderToStaticMarkup(createElement(AdminNewPatientPage));

    expect(html).toContain("← Volver a pacientes");
    expect(html).toContain("href=\"/admin/patients\"");
    expect(html).toContain("Completá los datos iniciales del paciente.");
    expect(html).not.toContain("Alta mínima del slice");
  });
});
