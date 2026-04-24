import { describe, expect, it, vi } from "vitest";
import React, { createElement } from "react";
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import AdminPatientAdministrativePage from "@/app/admin/patients/[id]/administrative/page";

const loadPatientDetailMock = vi.hoisted(() => vi.fn());
(globalThis as { React?: typeof React }).React = React;

vi.mock("next/link", () => ({
  default: ({ children, href, ...rest }: { children: ReactNode; href: string }) =>
    createElement("a", { href, ...rest }, children),
}));

vi.mock("@/app/admin/patients/[id]/data", () => ({
  loadPatientDetail: loadPatientDetailMock,
}));

vi.mock("@/app/admin/patients/[id]/components/PatientAdministrativeEditor", () => ({
  PatientAdministrativeEditor: () => createElement("div", null, "editor"),
}));

describe("/admin/patients/[id]/administrative page", () => {
  it("renders back link at the top before the page title", async () => {
    loadPatientDetailMock.mockResolvedValueOnce({
      id: "pat-1",
      firstName: "Ana",
      lastName: "Pérez",
      fullName: "Ana Pérez",
      operationalStatus: "preliminary",
      createdAt: "2026-04-17T00:00:00.000Z",
      updatedAt: "2026-04-17T00:00:00.000Z",
    });

    const element = await AdminPatientAdministrativePage({
      params: Promise.resolve({ id: "pat-1" }),
    });
    const html = renderToStaticMarkup(element);

    const backLinkIndex = html.indexOf("← Volver al paciente");
    const titleIndex = html.indexOf("Administración del paciente");

    expect(backLinkIndex).toBeGreaterThan(-1);
    expect(titleIndex).toBeGreaterThan(backLinkIndex);
    expect(html).not.toContain("border-t border-slate-200");
  });
});
