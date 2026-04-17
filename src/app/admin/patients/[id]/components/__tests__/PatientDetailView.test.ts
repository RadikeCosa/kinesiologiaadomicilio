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
});
