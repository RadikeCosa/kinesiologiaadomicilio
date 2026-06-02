import { describe, expect, it } from "vitest";

import type { VisitShareReportRecipientOption } from "../visit-share-report.types";
import {
  buildVisitShareReportWhatsAppUrl,
  findVisitShareReportWhatsAppRecipient,
  getAvailableVisitShareReportWhatsAppRecipients,
  selectDefaultVisitShareReportWhatsAppRecipient,
} from "../visit-share-report.whatsapp";

const recipients: VisitShareReportRecipientOption[] = [
  {
    kind: "patient",
    displayName: "Ana Perez",
    phone: "+54 299 555 0101",
    hasWhatsAppCandidate: true,
  },
  {
    kind: "main_contact",
    displayName: "Marta Perez",
    relationshipLabel: "Hijo/a",
    phone: "+54 299 555 0202",
    hasWhatsAppCandidate: true,
  },
];

describe("visit share report WhatsApp helpers", () => {
  it("returns available patient and main contact recipients", () => {
    expect(getAvailableVisitShareReportWhatsAppRecipients(recipients)).toEqual(recipients);
  });

  it("filters recipients without valid operative phone", () => {
    const available = getAvailableVisitShareReportWhatsAppRecipients([
      ...recipients,
      {
        kind: "main_contact",
        displayName: "Contacto sin telefono",
        phone: "123",
        hasWhatsAppCandidate: true,
      },
    ]);

    expect(available).toHaveLength(2);
  });

  it("selects patient as default when both recipients exist", () => {
    const available = getAvailableVisitShareReportWhatsAppRecipients(recipients);

    expect(selectDefaultVisitShareReportWhatsAppRecipient(available)?.kind).toBe("patient");
  });

  it("falls back to main contact when patient phone is not available", () => {
    const available = getAvailableVisitShareReportWhatsAppRecipients([
      {
        kind: "patient",
        displayName: "Ana Perez",
        hasWhatsAppCandidate: false,
      },
      recipients[1],
    ]);

    expect(selectDefaultVisitShareReportWhatsAppRecipient(available)?.kind).toBe("main_contact");
  });

  it("returns no recipient when there is no operative phone", () => {
    const available = getAvailableVisitShareReportWhatsAppRecipients([
      {
        kind: "patient",
        displayName: "Ana Perez",
        phone: "abc",
        hasWhatsAppCandidate: true,
      },
    ]);

    expect(available).toEqual([]);
    expect(selectDefaultVisitShareReportWhatsAppRecipient(available)).toBeNull();
  });

  it("builds WhatsApp URL with encoded edited text", () => {
    const available = getAvailableVisitShareReportWhatsAppRecipients(recipients);
    const recipient = findVisitShareReportWhatsAppRecipient(available, "patient");
    const url = buildVisitShareReportWhatsAppUrl(
      recipient,
      "Texto editado\nCon acentos: sesión & evolución",
    );

    expect(url).toBe(
      "https://wa.me/542995550101?text=Texto%20editado%0ACon%20acentos%3A%20sesi%C3%B3n%20%26%20evoluci%C3%B3n",
    );
  });

  it("does not build URL without recipient or text", () => {
    const available = getAvailableVisitShareReportWhatsAppRecipients(recipients);

    expect(buildVisitShareReportWhatsAppUrl(null, "Texto")).toBeNull();
    expect(buildVisitShareReportWhatsAppUrl(available[0], "   ")).toBeNull();
  });
});
