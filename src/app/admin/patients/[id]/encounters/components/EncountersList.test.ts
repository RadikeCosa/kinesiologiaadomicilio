import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { EncountersList } from "@/app/admin/patients/[id]/encounters/components/EncountersList";

describe("EncountersList", () => {
  it("renders date-time in localized format with 24h time", () => {
    const html = renderToStaticMarkup(
      createElement(EncountersList, {
        encounters: [
          {
            id: "enc-1",
            patientId: "pat-1",
            episodeOfCareId: "ep-1",
            status: "finished",
            occurrenceDate: "2026-04-17T10:30:00Z",
          },
        ],
      }),
    );

    expect(html).toContain("17/04/2026");
    expect(html).toMatch(/\d{2}:\d{2}/);
    expect(html).not.toContain("AM");
    expect(html).not.toContain("PM");
  });
});
