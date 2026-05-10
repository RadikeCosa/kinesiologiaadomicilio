import React from "react";

import {
  buildTelHref,
  resolvePatientWhatsAppTarget,
} from "@/lib/patient-contact-links";

interface PhoneContactActionsProps {
  phone: string | null | undefined;
  mainContactPhone?: string | null | undefined;
  showMissingChannelsMessage?: boolean;
}

export function PhoneContactActions({
  phone,
  mainContactPhone,
  showMissingChannelsMessage = true,
}: PhoneContactActionsProps) {
  const whatsappTarget = resolvePatientWhatsAppTarget({
    phone,
    mainContact: { phone: mainContactPhone },
  });
  const telHref = buildTelHref(phone);
  const hasContactChannel = Boolean(whatsappTarget || telHref);

  if (!hasContactChannel) {
    return showMissingChannelsMessage ? (
      <p className="text-xs text-slate-500">No hay canales de contacto disponibles.</p>
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
          Llamar
        </a>
      ) : null}
    </div>
  );
}
