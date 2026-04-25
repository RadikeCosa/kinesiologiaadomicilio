import React, { createElement } from "react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import AdminPatientsPage from "@/app/admin/patients/page";

const loadPatientsListMock = vi.hoisted(() => vi.fn());
(globalThis as { React?: typeof React }).React = React;

vi.mock("next/link", () => ({
  default: ({ children, href, ...rest }: { children: ReactNode; href: string }) =>
    createElement("a", { href, ...rest }, children),
}));

vi.mock("@/app/admin/patients/data", () => ({
  loadPatientsList: loadPatientsListMock,
}));

vi.mock("@/app/admin/patients/components/PhoneContactBlock", () => ({
  PhoneContactActions: () => createElement("div", null, "PhoneContactActions"),
}));

describe("/admin/patients page", () => {
  it("renders quick CTA to register encounter only for active treatment patients and preserves existing actions", async () => {
    loadPatientsListMock.mockResolvedValueOnce([
      {
        id: "pat-active",
        fullName: "Ana Activa",
        dni: "30111222",
        phone: "2991234567",
        address: "Calle 1",
        operationalStatus: "active_treatment",
      },
      {
        id: "pat-finished",
        fullName: "Fede Finalizado",
        dni: "30999888",
        phone: "2997654321",
        address: "Calle 2",
        operationalStatus: "finished_treatment",
      },
      {
        id: "pat-pre",
        fullName: "Pía Pre",
        dni: "30888777",
        phone: "2991112222",
        address: "Calle 3",
        operationalStatus: "preliminary",
      },
    ]);

    const element = await AdminPatientsPage();
    const html = renderToStaticMarkup(element);

    expect(html).toContain("Pacientes");
    expect(html).toContain("href=\"/admin/patients/new\"");
    expect(html).toContain("href=\"/admin/patients/pat-active\"");
    expect(html).toContain("href=\"/admin/patients/pat-finished\"");
    expect(html).toContain("href=\"/admin/patients/pat-pre\"");
    expect(html).toContain("PhoneContactActions");

    expect(html).toContain("href=\"/admin/patients/pat-active/encounters/new\"");
    expect(html).toContain("Registrar visita");
    expect(html).not.toContain("href=\"/admin/patients/pat-finished/encounters/new\"");
    expect(html).not.toContain("href=\"/admin/patients/pat-pre/encounters/new\"");
  });

  it("renders empty state without register encounter CTA", async () => {
    loadPatientsListMock.mockResolvedValueOnce([]);

    const element = await AdminPatientsPage();
    const html = renderToStaticMarkup(element);

    expect(html).toContain("No hay pacientes para mostrar.");
    expect(html).not.toContain("Registrar visita");
  });
});
