import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { PatientDetailView } from "@/app/admin/patients/[id]/components/PatientDetailView";

describe("PatientDetailView", () => {
  it("shows address when patient has one", () => {
    const html = renderToStaticMarkup(
      createElement(PatientDetailView, {
        patient: {
          id: "pat-1",
          firstName: "Ana",
          lastName: "Pérez",
          fullName: "Ana Pérez",
          address: "Belgrano 123",
          operationalStatus: "preliminary",
          createdAt: "2026-04-17T00:00:00.000Z",
          updatedAt: "2026-04-17T00:00:00.000Z",
        },
      }),
    );

    expect(html).toContain("Dirección");
    expect(html).toContain("Belgrano 123");
  });

  it("shows active treatment start date when an episode is active", () => {
    const html = renderToStaticMarkup(
      createElement(PatientDetailView, {
        patient: {
          id: "pat-1",
          firstName: "Ana",
          lastName: "Pérez",
          fullName: "Ana Pérez",
          operationalStatus: "active_treatment",
          activeEpisode: {
            id: "ep-1",
            patientId: "pat-1",
            status: "active",
            startDate: "2026-04-17",
          },
          createdAt: "2026-04-17T00:00:00.000Z",
          updatedAt: "2026-04-17T00:00:00.000Z",
        },
      }),
    );

    expect(html).toContain("Tratamiento activo");
    expect(html).toContain("2026-04-17");
  });

  it("shows patient gender when present", () => {
    const html = renderToStaticMarkup(
      createElement(PatientDetailView, {
        patient: {
          id: "pat-1",
          firstName: "Ana",
          lastName: "Pérez",
          fullName: "Ana Pérez",
          gender: "female",
          operationalStatus: "preliminary",
          createdAt: "2026-04-17T00:00:00.000Z",
          updatedAt: "2026-04-17T00:00:00.000Z",
        },
      }),
    );

    expect(html).toContain("Gender");
    expect(html).toContain("female");
  });

  it("shows fallback text when gender is missing", () => {
    const html = renderToStaticMarkup(
      createElement(PatientDetailView, {
        patient: {
          id: "pat-1",
          firstName: "Ana",
          lastName: "Pérez",
          fullName: "Ana Pérez",
          operationalStatus: "preliminary",
          createdAt: "2026-04-17T00:00:00.000Z",
          updatedAt: "2026-04-17T00:00:00.000Z",
        },
      }),
    );

    expect(html).toContain("Gender");
    expect(html).toContain("No informado");
  });

  it("shows birthDate when present", () => {
    const html = renderToStaticMarkup(
      createElement(PatientDetailView, {
        patient: {
          id: "pat-1",
          firstName: "Ana",
          lastName: "Pérez",
          fullName: "Ana Pérez",
          birthDate: "1990-10-03",
          operationalStatus: "preliminary",
          createdAt: "2026-04-17T00:00:00.000Z",
          updatedAt: "2026-04-17T00:00:00.000Z",
        },
      }),
    );

    expect(html).toContain("Fecha de nacimiento");
    expect(html).toContain("1990-10-03");
  });

  it("shows fallback text when birthDate is missing", () => {
    const html = renderToStaticMarkup(
      createElement(PatientDetailView, {
        patient: {
          id: "pat-1",
          firstName: "Ana",
          lastName: "Pérez",
          fullName: "Ana Pérez",
          operationalStatus: "preliminary",
          createdAt: "2026-04-17T00:00:00.000Z",
          updatedAt: "2026-04-17T00:00:00.000Z",
        },
      }),
    );

    expect(html).toContain("Fecha de nacimiento");
    expect(html).toContain("No informada");
  });
});
