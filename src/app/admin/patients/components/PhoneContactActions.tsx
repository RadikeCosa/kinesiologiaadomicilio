import React from "react";

import {
  buildTelHref,
  buildWhatsAppHref,
  resolvePatientWhatsAppTarget,
} from "@/lib/patient-contact-links";

interface PhoneContactActionsProps {
  phone: string | null | undefined;
  mainContactPhone?: string | null | undefined;
  entity: "patient" | "mainContact";
  showMissingChannelsMessage?: boolean;
}

export function PhoneContactActions({
  phone,
  mainContactPhone,
  entity,
  showMissingChannelsMessage = true,
}: PhoneContactActionsProps) {
  const mainContactWhatsAppHref = entity === "mainContact"
    ? buildWhatsAppHref(phone ?? undefined)
    : null;
  const whatsappTarget = entity === "patient"
    ? resolvePatientWhatsAppTarget({
      phone,
      mainContact: { phone: mainContactPhone },
    })
    : (mainContactWhatsAppHref
      ? {
        href: mainContactWhatsAppHref,
        visibleLabel: "Mensaje",
        accessibleLabel: "Enviar WhatsApp al contacto principal",
      }
      : null);
  const telHref = buildTelHref(phone ?? undefined);
  const hasContactChannel = Boolean(whatsappTarget || telHref);

  if (!hasContactChannel) {
    return showMissingChannelsMessage ? (
      <p className="text-xs text-slate-500">
        {entity === "mainContact"
          ? "No hay canales telefónicos del contacto principal."
          : "No hay canales telefónicos del paciente."}
      </p>
    ) : null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {whatsappTarget ? (
        <a
          aria-label={whatsappTarget.accessibleLabel}
          className="inline-flex items-center justify-center gap-1 rounded-md px-1 py-1 text-xs font-medium text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline"
          href={whatsappTarget.href}
          rel="noopener noreferrer"
          target="_blank"
          title={whatsappTarget.accessibleLabel}
        >
          <svg
            aria-hidden="true"
            className="h-3.5 w-3.5"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M19.05 4.91A9.82 9.82 0 0 0 12.03 2a9.96 9.96 0 0 0-8.64 14.92L2 22l5.26-1.37A9.96 9.96 0 0 0 12.03 22C17.54 22 22 17.54 22 12.03c0-2.66-1.04-5.17-2.95-7.12ZM12.03 20.3a8.23 8.23 0 0 1-4.2-1.15l-.3-.18-3.12.81.83-3.04-.2-.31a8.26 8.26 0 1 1 6.99 3.87Zm4.53-6.18c-.25-.13-1.47-.72-1.7-.8-.23-.08-.4-.13-.56.13-.17.25-.64.8-.79.96-.15.17-.29.19-.54.07-.25-.13-1.05-.39-2-1.24-.74-.66-1.24-1.48-1.39-1.73-.15-.25-.02-.39.11-.52.11-.11.25-.29.38-.43.12-.15.17-.25.25-.42.08-.17.04-.31-.02-.43-.06-.13-.56-1.36-.77-1.87-.2-.48-.41-.41-.56-.42h-.48c-.17 0-.43.06-.66.31s-.87.85-.87 2.08.89 2.42 1.01 2.58c.12.17 1.75 2.67 4.24 3.75.59.26 1.05.41 1.41.52.59.19 1.12.16 1.54.1.47-.07 1.47-.6 1.67-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.17-.48-.29Z" />
          </svg>
          {whatsappTarget.visibleLabel}
        </a>
      ) : null}

      {telHref ? (
        <a
          className="inline-flex items-center justify-center gap-1 rounded-md px-1 py-1 text-xs font-medium text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline"
          href={telHref}
        >
          <svg
            aria-hidden="true"
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              d="M5 4.75h3.1c.32 0 .6.22.67.53l.68 3.12a.7.7 0 0 1-.2.66l-1.6 1.6a13.7 13.7 0 0 0 5.69 5.69l1.6-1.6a.7.7 0 0 1 .66-.2l3.12.68c.31.07.53.35.53.67V19A1.25 1.25 0 0 1 18 20.25h-.5C10.6 20.25 4.75 14.4 4.75 7.5V7A1.25 1.25 0 0 1 6 5.75Z"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
            />
          </svg>
          Llamar
        </a>
      ) : null}
    </div>
  );
}
