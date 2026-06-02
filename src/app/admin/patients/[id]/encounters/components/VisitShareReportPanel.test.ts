import React, { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/app/admin/patients/[id]/encounters/actions/load-visit-share-report.action", () => ({
  loadVisitShareReportAction: vi.fn(),
}));

import { VISIT_SHARE_REPORT_TEXTAREA_CLASS, VisitShareReportPanel } from "./VisitShareReportPanel";

(globalThis as { React?: typeof React }).React = React;

describe("VisitShareReportPanel", () => {
  it("renders the secondary action when closed", () => {
    const html = renderToStaticMarkup(createElement(VisitShareReportPanel, {
      patientId: "pat-1",
      encounterId: "enc-1",
      isOpen: false,
      onOpen: vi.fn(),
      onClose: vi.fn(),
    }));

    expect(html).toContain("Resumen para compartir");
    expect(html).not.toContain("Resumen compartible de visita");
    expect(html).not.toMatch(/WhatsApp/i);
  });

  it("renders inline panel structure when open", () => {
    const html = renderToStaticMarkup(createElement(VisitShareReportPanel, {
      patientId: "pat-1",
      encounterId: "enc-1",
      isOpen: true,
      onOpen: vi.fn(),
      onClose: vi.fn(),
    }));

    expect(html).toContain("Resumen compartible de visita");
    expect(html).toContain("Texto generado a partir de datos registrados.");
    expect(html).toContain("Cerrar");
    expect(html).not.toMatch(/WhatsApp/i);
  });

  it("uses a tall resizable textarea for report review", () => {
    expect(VISIT_SHARE_REPORT_TEXTAREA_CLASS).toContain("min-h-[28rem]");
    expect(VISIT_SHARE_REPORT_TEXTAREA_CLASS).toContain("max-h-[70vh]");
    expect(VISIT_SHARE_REPORT_TEXTAREA_CLASS).toContain("resize-y");
  });
});
