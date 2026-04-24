import React, { createElement } from "react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
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
  PatientAdministrativeEditor: () => createElement("div", null, "PatientAdministrativeEditor"),
}));

describe("/admin/patients/[id]/administrative page", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders internal header with metadata and treatment badge", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-24T12:00:00Z"));

    loadPatientDetailMock.mockResolvedValueOnce({
      id: "pat-1",
      fullName: "Ana Pérez",
      firstName: "Ana",
      lastName: "Pérez",
      dni: "30111222",
      birthDate: "1958-04-24",
      operationalStatus: "active_treatment",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });

    const element = await AdminPatientAdministrativePage({
      params: Promise.resolve({ id: "pat-1" }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("← Volver al paciente");
    expect(html).toContain("href=\"/admin/patients/pat-1\"");
    expect(html).toContain("Ana Pérez");
    expect(html).toContain("Gestión de datos administrativos y de contacto del paciente.");
    expect(html).toContain("DNI: 30.111.222");
    expect(html).toContain("Edad: 68 años");
    expect(html).toContain("En tratamiento");
  });

  it("does not render age metadata when birthDate is missing", async () => {
    loadPatientDetailMock.mockResolvedValueOnce({
      id: "pat-1",
      fullName: "Ana Pérez",
      firstName: "Ana",
      lastName: "Pérez",
      dni: "30111222",
      operationalStatus: "ready_to_start",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });

    const element = await AdminPatientAdministrativePage({
      params: Promise.resolve({ id: "pat-1" }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("DNI: 30.111.222");
    expect(html).not.toContain("Edad:");
  });
  it("keeps back link before page title", async () => {
    loadPatientDetailMock.mockResolvedValueOnce({
      id: "pat-1",
      fullName: "Ana Pérez",
      firstName: "Ana",
      lastName: "Pérez",
      operationalStatus: "preliminary",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });

    const element = await AdminPatientAdministrativePage({
      params: Promise.resolve({ id: "pat-1" }),
    });
    const html = renderToStaticMarkup(element);

    const backLinkIndex = html.indexOf("← Volver al paciente");
    const titleIndex = html.indexOf("Administración del paciente");

    expect(backLinkIndex).toBeGreaterThan(-1);
    expect(titleIndex).toBeGreaterThan(backLinkIndex);
  });

});
