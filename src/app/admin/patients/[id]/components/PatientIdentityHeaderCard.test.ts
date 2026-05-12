import React, { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { PatientIdentityHeaderCard } from "@/app/admin/patients/[id]/components/PatientIdentityHeaderCard";

(globalThis as { React?: typeof React }).React = React;

describe("PatientIdentityHeaderCard", () => {
  it("renders full name, treatment badge, dni and age when provided", () => {
    const html = renderToStaticMarkup(
      createElement(PatientIdentityHeaderCard, {
        fullName: "Ana Pérez",
        treatmentBadgeLabel: "En tratamiento",
        treatmentBadgeClassName: "border-emerald-200 bg-emerald-50 text-emerald-800",
        dni: "30111222",
        age: 68,
      }),
    );

    expect(html).toContain("Ana Pérez");
    expect(html).toContain("En tratamiento");
    expect(html).toContain("DNI: 30.111.222");
    expect(html).toContain("Edad: 68 años");
  });

  it("keeps fallback for missing dni and age", () => {
    const html = renderToStaticMarkup(
      createElement(PatientIdentityHeaderCard, {
        fullName: "Ana Pérez",
        treatmentBadgeLabel: "Sin tratamiento activo",
        treatmentBadgeClassName: "border-slate-300 bg-white text-slate-700",
      }),
    );

    expect(html).toContain("DNI: No informado");
    expect(html).not.toContain("Edad:");
  });
});
