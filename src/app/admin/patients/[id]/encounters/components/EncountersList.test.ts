import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock("@/app/admin/patients/[id]/encounters/actions/update-encounter-start.action", () => ({
  updateEncounterStartAction: vi.fn(),
}));

import { EncountersList } from "@/app/admin/patients/[id]/encounters/components/EncountersList";

describe("EncountersList", () => {
  it("renders start always and shows finalization/duration only when endedAt exists", () => {
    const html = renderToStaticMarkup(
      createElement(EncountersList, {
        patientId: "pat-1",
        hasActiveTreatment: true,
        encounters: [
          {
            id: "enc-1",
            patientId: "pat-1",
            episodeOfCareId: "ep-1",
            status: "finished",
            startedAt: "2026-04-17T10:30:00Z",
            endedAt: "2026-04-17T11:00:00Z",
          },
          {
            id: "enc-2",
            patientId: "pat-1",
            episodeOfCareId: "ep-1",
            status: "finished",
            startedAt: "2026-04-16T10:30:00Z",
          },
        ],
      }),
    );

    expect(html).toContain("17/04/2026");
    expect(html).toContain("16/04/2026");
    expect(html).toMatch(/\d{2}:\d{2}/);
    expect((html.match(/Finalización:/g) ?? []).length).toBe(1);
    expect((html.match(/Duración:/g) ?? []).length).toBe(1);
    expect(html).toContain("Estado: Registrada");
    expect(html).toContain("aria-label=\"Editar fecha y hora\"");
    expect(html).not.toContain("Estado: finished");
    expect(html).not.toContain("AM");
    expect(html).not.toContain("PM");
  });
});
