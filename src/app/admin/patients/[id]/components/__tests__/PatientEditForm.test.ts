import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock("@/app/admin/patients/[id]/actions/update-patient.action", () => ({
  updatePatientAction: vi.fn(),
}));

import { PatientEditForm } from "@/app/admin/patients/[id]/components/PatientEditForm";

describe("PatientEditForm", () => {
  it("renders relationship as select with allowed catalog options", () => {
    const html = renderToStaticMarkup(
      createElement(PatientEditForm, {
        isEditing: true,
        onEditingChange: vi.fn(),
        patient: {
          id: "pat-1",
          firstName: "Ana",
          lastName: "Pérez",
          fullName: "Ana Pérez",
          mainContact: {
            relationship: "sibling",
          },
          operationalStatus: "preliminary",
          createdAt: "2026-04-17T00:00:00.000Z",
          updatedAt: "2026-04-17T00:00:00.000Z",
        },
      }),
    );

    expect(html).toContain('name="mainContactRelationship"');
    expect(html).toContain("<select");
    expect(html).toContain('<option value="parent">Madre/padre</option>');
    expect(html).toContain('<option value="spouse">Pareja/cónyuge</option>');
    expect(html).toContain('<option value="child">Hijo/a</option>');
    expect(html).toContain('<option value="sibling" selected="">Hermano/a</option>');
    expect(html).toContain('<option value="caregiver">Cuidador/a</option>');
    expect(html).toContain('<option value="other">Otro</option>');
  });
});
