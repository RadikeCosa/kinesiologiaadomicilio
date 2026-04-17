import { describe, expect, it } from "vitest";

import {
  extractEpisodeDescriptionFromNotes,
  upsertEpisodeDescriptionInNotes,
} from "@/infrastructure/mappers/episode-of-care/episode-of-care-note.helpers";

describe("episode-of-care-note.helpers", () => {
  it("extracts description without depending on note[0] semantics", () => {
    const description = extractEpisodeDescriptionFromNotes([
      { text: "Inicio tratamiento" },
      { text: "Seguimiento" },
    ]);

    expect(description).toBe("Inicio tratamiento\n\nSeguimiento");
  });

  it("upserts description in notes", () => {
    expect(upsertEpisodeDescriptionInNotes({ description: "Plan inicial" })).toEqual([
      { text: "Plan inicial" },
    ]);

    expect(
      upsertEpisodeDescriptionInNotes({
        note: [{ text: "Anterior" }, { text: "Mantener" }],
        description: "Actualizada",
      }),
    ).toEqual([{ text: "Actualizada" }, { text: "Mantener" }]);
  });
});
