import { afterEach, describe, expect, it, vi } from "vitest";
import React, { createElement } from "react";
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import type { PatientDetailReadModel } from "@/features/patients/read-models/patient-detail.read-model";
import AdminPatientDetailPage from "@/app/admin/patients/[id]/page";

const loadPatientDetailMock = vi.hoisted(() => vi.fn());
(globalThis as { React?: typeof React }).React = React;

vi.mock("next/link", () => ({
  default: ({ children, href, ...rest }: { children: ReactNode; href: string }) =>
    createElement("a", { href, ...rest }, children),
}));

vi.mock("@/app/admin/patients/[id]/data", () => ({
  loadPatientDetail: loadPatientDetailMock,
}));

function buildPatient(
  overrides: Partial<PatientDetailReadModel> = {},
): PatientDetailReadModel {
  return {
    id: "pat-1",
    firstName: "Ana",
    lastName: "Pérez",
    fullName: "Ana Pérez",
    operationalStatus: "preliminary",
    createdAt: "2026-04-17T00:00:00.000Z",
    updatedAt: "2026-04-17T00:00:00.000Z",
    ...overrides,
  };
}

describe("/admin/patients/[id] page", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the contacto section with patient contact, address and main contact in order", async () => {
    loadPatientDetailMock.mockResolvedValueOnce(
      buildPatient({
        phone: "+542995550101",
        address: "Belgrano 123",
        mainContact: {
          name: "Carlos Pérez",
          relationship: "caregiver",
          phone: "+542995550102",
        },
      }),
    );

    const element = await AdminPatientDetailPage({
      params: Promise.resolve({ id: "pat-1" }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("Gestión Clínica");
    expect(html).toContain("Gestión Administrativa");
    expect(html).toContain("Contacto");
    expect(html).toContain("Dirección");
    expect(html).toContain("Abrir en Maps");
    expect(html).toContain("aria-label=\"Abrir en Maps\"");
    expect(html).toContain("Contacto principal");
    expect(html).toContain("Contacto del paciente");
    expect(html).toContain("Belgrano 123");
    expect(html).toContain("google.com/maps/search");
    expect(html).not.toContain(">Belgrano 123</a>");
    expect(html).toContain("rel=\"noreferrer\"");
    expect(html).toContain("target=\"_blank\"");

    const patientContactIndex = html.indexOf("Contacto del paciente");
    const addressIndex = html.indexOf("Dirección");
    const mainContactIndex = html.indexOf("Contacto principal");

    expect(patientContactIndex).toBeGreaterThan(-1);
    expect(addressIndex).toBeGreaterThan(patientContactIndex);
    expect(mainContactIndex).toBeGreaterThan(addressIndex);
  });

  it("renders address fallback without maps action when address is missing", async () => {
    loadPatientDetailMock.mockResolvedValueOnce(
      buildPatient({
        phone: "+542995550101",
        address: "",
      }),
    );

    const element = await AdminPatientDetailPage({
      params: Promise.resolve({ id: "pat-1" }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("Dirección");
    expect(html).toContain("Sin dirección");
    expect(html).not.toContain("Abrir en Maps");
  });

  it("renders treatment summary with active episode start date", async () => {
    loadPatientDetailMock.mockResolvedValueOnce(
      buildPatient({
        operationalStatus: "active_treatment",
        activeEpisode: {
          id: "ep-1",
          patientId: "pat-1",
          status: "active",
          startDate: "2026-04-17",
        },
      }),
    );

    const element = await AdminPatientDetailPage({
      params: Promise.resolve({ id: "pat-1" }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("Inicio: 17/04/2026");
    expect(html).toContain("Registrar visita");
    expect(html).toContain("href=\"/admin/patients/pat-1/encounters/new\"");
  });

  it("renders patient age in header when birthDate is available", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-24T12:00:00Z"));

    loadPatientDetailMock.mockResolvedValueOnce(
      buildPatient({
        birthDate: "1958-04-24",
      }),
    );

    const element = await AdminPatientDetailPage({
      params: Promise.resolve({ id: "pat-1" }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("Edad: 68 años");
  });

  it("renders patient age when birthDate comes as ISO date-time string", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-24T12:00:00Z"));

    loadPatientDetailMock.mockResolvedValueOnce(
      buildPatient({
        birthDate: "1958-04-24T00:00:00Z",
      }),
    );

    const element = await AdminPatientDetailPage({
      params: Promise.resolve({ id: "pat-1" }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("Edad: 68 años");
  });

  it("does not render patient age when birthDate is missing", async () => {
    loadPatientDetailMock.mockResolvedValueOnce(
      buildPatient({
        birthDate: undefined,
      }),
    );

    const element = await AdminPatientDetailPage({
      params: Promise.resolve({ id: "pat-1" }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).not.toContain("Edad:");
  });

  it("renders not found state when patient does not exist", async () => {
    loadPatientDetailMock.mockResolvedValueOnce(null);

    const element = await AdminPatientDetailPage({
      params: Promise.resolve({ id: "missing-id" }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("Paciente no encontrado");
    expect(html).toContain("No se encontró el paciente solicitado.");
  });

  it("does not render register encounter CTA when patient has no active treatment", async () => {
    loadPatientDetailMock.mockResolvedValueOnce(
      buildPatient({
        operationalStatus: "finished_treatment",
        activeEpisode: undefined,
      }),
    );

    const element = await AdminPatientDetailPage({
      params: Promise.resolve({ id: "pat-1" }),
    });
    const html = renderToStaticMarkup(element);

    expect(html).not.toContain("href=\"/admin/patients/pat-1/encounters/new\"");
    expect(html).not.toContain("Registrar visita");
    expect(html).toContain("Gestión Clínica");
    expect(html).toContain("Gestión Administrativa");
  });
});
