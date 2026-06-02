import { buildWhatsAppHref } from "@/lib/patient-contact-links";

import type {
  VisitShareReportRecipientKind,
  VisitShareReportRecipientOption,
} from "./visit-share-report.types";

export interface VisitShareReportWhatsAppRecipient extends VisitShareReportRecipientOption {
  phone: string;
}

export function getAvailableVisitShareReportWhatsAppRecipients(
  recipients: VisitShareReportRecipientOption[],
): VisitShareReportWhatsAppRecipient[] {
  return recipients.filter((recipient): recipient is VisitShareReportWhatsAppRecipient => (
    Boolean(recipient.hasWhatsAppCandidate)
    && Boolean(recipient.phone?.trim())
    && Boolean(buildWhatsAppHref(recipient.phone))
  ));
}

export function selectDefaultVisitShareReportWhatsAppRecipient(
  recipients: VisitShareReportWhatsAppRecipient[],
): VisitShareReportWhatsAppRecipient | null {
  return recipients.find((recipient) => recipient.kind === "patient") ?? recipients[0] ?? null;
}

export function findVisitShareReportWhatsAppRecipient(
  recipients: VisitShareReportWhatsAppRecipient[],
  kind: VisitShareReportRecipientKind,
): VisitShareReportWhatsAppRecipient | null {
  return recipients.find((recipient) => recipient.kind === kind) ?? null;
}

export function buildVisitShareReportWhatsAppUrl(
  recipient: VisitShareReportWhatsAppRecipient | null,
  text: string,
): string | null {
  const message = text.trim();

  if (!recipient || !message) {
    return null;
  }

  const baseHref = buildWhatsAppHref(recipient.phone);

  if (!baseHref) {
    return null;
  }

  return `${baseHref}?text=${encodeURIComponent(message)}`;
}
