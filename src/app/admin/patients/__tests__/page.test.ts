import React, { createElement } from "react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import AdminPatientsPage from "@/app/admin/patients/page";
import type { PatientListItemReadModel } from "@/features/patients/read-models/patient-list-item.read-model";

const loadPatientsListMock = vi.hoisted(() => vi.fn());
(globalThis as { React?: typeof React }).React = React;

vi.mock("next/link", () => ({
  default: ({ children, href, ...rest }: { children: ReactNode; href: string }) =>
    createElement("a", { href, ...rest }, children),
}));

vi.mock("@/app/admin/patients/data", () => ({
  loadPatientsList: loadPatientsListMock,
}));

vi.mock("@/app/admin/patients/components/PhoneContactActions", () => ({
  PhoneContactActions: () => createElement("div", null, "PhoneContactActions"),
}));

function buildPatient(
  overrides: Partial<PatientListItemReadModel> & Pick<PatientListItemReadModel, "id" | "fullName" | "operationalStatus">,
): PatientListItemReadModel {
  return {
    dni: "30111222",
    phone: "2991234567",
    address: "Calle 1",
    createdAt: "2026-04-17T12:00:00.000Z",
    updatedAt: "2026-04-17T12:00:00.000Z",
    ...overrides,
  };
}

const patientFixtures = [
  buildPatient({
    id: "pat-active",
    fullName: "Ana Activa",
    operationalStatus: "active_treatment",
  }),
  buildPatient({
    id: "pat-ready",
    fullName: "Rita Lista",
    operationalStatus: "ready_to_start",
  }),
  buildPatient({
    id: "pat-pre",
    fullName: "Pía Pre",
    address: "Calle 3",
    operationalStatus: "preliminary",
  }),
  buildPatient({
    id: "pat-finished",
    fullName: "Fede Finalizado",
    address: "",
    operationalStatus: "finished_treatment",
  }),
];

describe("/admin/patients page", () => {
  beforeEach(() => {
    loadPatientsListMock.mockReset();
  });

  it("renders quick CTA to register encounter only for active treatment patients and preserves existing actions", async () => {
    loadPatientsListMock.mockResolvedValueOnce(patientFixtures);

    const element = await AdminPatientsPage({});
    const html = renderToStaticMarkup(element);

    expect(html).toContain("Pacientes");
    expect(html).toContain("href=\"/admin/patients/new\"");
    expect(html).toContain("href=\"/admin/patients/pat-active\"");
    expect(html).toContain("href=\"/admin/patients/pat-ready\"");
    expect(html).toContain("href=\"/admin/patients/pat-finished\"");
    expect(html).toContain("href=\"/admin/patients/pat-pre\"");
    expect(html).toContain("PhoneContactActions");

    expect(html).toContain("href=\"/admin/patients/pat-active/encounters/new\"");
    expect(html).toContain("Registrar visita");
    expect(html).not.toContain("href=\"/admin/patients/pat-finished/encounters/new\"");
    expect(html).not.toContain("href=\"/admin/patients/pat-pre/encounters/new\"");
    expect(html).not.toContain("href=\"/admin/patients/pat-ready/encounters/new\"");

    expect(html).toContain("Dirección: Calle 1");
    expect(html).toContain("Dirección: Sin dirección");
    expect(html).toContain("Dirección: Calle 3");
    expect(html).toContain("href=\"https://www.google.com/maps/search/?api=1&amp;query=Calle%201%2C%20Neuqu%C3%A9n%2C%20Argentina\"");
    expect(html).toContain("href=\"https://www.google.com/maps/search/?api=1&amp;query=Calle%203%2C%20Neuqu%C3%A9n%2C%20Argentina\"");
    expect(html).not.toContain("query=Calle%202");
    expect(html).not.toContain(">Calle 1</a>");
    expect(html).toContain("aria-label=\"Abrir en Maps\"");
    expect(html).toContain("rel=\"noreferrer\"");
    expect(html).toContain("target=\"_blank\"");
  });

  it("filters patients by status query param and marks the active filter", async () => {
    loadPatientsListMock.mockResolvedValueOnce(patientFixtures);

    const element = await AdminPatientsPage({
      searchParams: Promise.resolve({ status: "pending" }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("href=\"/admin/patients?status=active\"");
    expect(html).toContain("href=\"/admin/patients?status=pending\"");
    expect(html).toContain("href=\"/admin/patients?status=finished\"");
    expect(html).toContain("aria-current=\"page\"");
    expect(html).toContain("Sin tratamiento activo");

    expect(html).toContain("href=\"/admin/patients/pat-ready\"");
    expect(html).toContain("href=\"/admin/patients/pat-pre\"");
    expect(html).not.toContain("href=\"/admin/patients/pat-active\"");
    expect(html).not.toContain("href=\"/admin/patients/pat-finished\"");
    expect(html).not.toContain("Registrar visita");
  });

  it("does not show finished patients in active or pending filters", async () => {
    loadPatientsListMock.mockResolvedValueOnce(patientFixtures);

    const activeElement = await AdminPatientsPage({
      searchParams: Promise.resolve({ status: "active" }),
    });
    const activeHtml = renderToStaticMarkup(activeElement);

    expect(activeHtml).toContain("href=\"/admin/patients/pat-active\"");
    expect(activeHtml).toContain("Registrar visita");
    expect(activeHtml).not.toContain("href=\"/admin/patients/pat-finished\"");
    expect(activeHtml).not.toContain("href=\"/admin/patients/pat-ready\"");
    expect(activeHtml).not.toContain("href=\"/admin/patients/pat-pre\"");

    loadPatientsListMock.mockResolvedValueOnce(patientFixtures);

    const pendingElement = await AdminPatientsPage({
      searchParams: Promise.resolve({ status: "pending" }),
    });
    const pendingHtml = renderToStaticMarkup(pendingElement);

    expect(pendingHtml).toContain("href=\"/admin/patients/pat-ready\"");
    expect(pendingHtml).toContain("href=\"/admin/patients/pat-pre\"");
    expect(pendingHtml).not.toContain("href=\"/admin/patients/pat-finished\"");
    expect(pendingHtml).not.toContain("href=\"/admin/patients/pat-active\"");
  });

  it("renders filter-specific empty states", async () => {
    loadPatientsListMock.mockResolvedValueOnce([]);
    const allElement = await AdminPatientsPage({});
    const allHtml = renderToStaticMarkup(allElement);
    expect(allHtml).toContain("No hay pacientes para mostrar.");

    loadPatientsListMock.mockResolvedValueOnce([]);
    const activeElement = await AdminPatientsPage({
      searchParams: Promise.resolve({ status: "active" }),
    });
    const activeHtml = renderToStaticMarkup(activeElement);
    expect(activeHtml).toContain("No hay pacientes en tratamiento.");

    loadPatientsListMock.mockResolvedValueOnce([]);
    const pendingElement = await AdminPatientsPage({
      searchParams: Promise.resolve({ status: "pending" }),
    });
    const pendingHtml = renderToStaticMarkup(pendingElement);
    expect(pendingHtml).toContain("No hay pacientes sin tratamiento activo.");

    loadPatientsListMock.mockResolvedValueOnce([]);
    const finishedElement = await AdminPatientsPage({
      searchParams: Promise.resolve({ status: "finished" }),
    });
    const finishedHtml = renderToStaticMarkup(finishedElement);
    expect(finishedHtml).toContain("No hay pacientes con tratamiento finalizado.");
  });

  it("renders empty state without register encounter CTA", async () => {
    loadPatientsListMock.mockResolvedValueOnce([]);

    const element = await AdminPatientsPage({});
    const html = renderToStaticMarkup(element);

    expect(html).toContain("No hay pacientes para mostrar.");
    expect(html).not.toContain("Registrar visita");
  });
});
