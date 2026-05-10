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
        visibleLabel: "WhatsApp contacto principal",
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
          className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
          href={whatsappTarget.href}
          rel="noopener noreferrer"
          target="_blank"
          title={whatsappTarget.accessibleLabel}
        >
          {whatsappTarget.visibleLabel}
        </a>
      ) : null}

      {telHref ? (
        <a
          className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
          href={telHref}
        >
          {entity === "mainContact" ? "Llamar contacto" : "Llamar paciente"}
        </a>
      ) : null}
    </div>
  );
}
