"use client";

import Link from "next/link";
import { WhatsAppIcon } from "./WhatsAppIcon";
import { getWhatsAppUrl } from "@/lib/config";
import { trackGenerateLead, type CtaLocation } from "@/lib/analytics";

interface WhatsAppButtonProps {
  /** Texto del mensaje que se enviará por WhatsApp */
  message: string;
  /** Texto que aparece en el botón */
  children: React.ReactNode;
  /** Clases CSS adicionales para el botón */
  className?: string;
  /** Tamaño del ícono de WhatsApp */
  iconSize?: string;
  /** Ubicación del CTA para analytics */
  ctaLocation?: CtaLocation;
  /** Etiqueta enviada a analytics */
  ctaLabel?: string;
}

export function WhatsAppButton({
  message,
  children,
  className = "inline-flex items-center justify-center rounded-full bg-green-600 px-8 py-3 text-base font-semibold text-white transition hover:bg-green-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400",
  iconSize = "h-5 w-5",
  ctaLocation = "other",
  ctaLabel,
}: WhatsAppButtonProps) {
  const whatsappUrl = getWhatsAppUrl(message);
  const resolvedLabel = ctaLabel ?? (typeof children === "string" ? children : undefined);

  return (
    <Link
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() =>
        trackGenerateLead({
          ctaLocation,
          ctaLabel: resolvedLabel,
          destination: whatsappUrl,
        })
      }
    >
      <WhatsAppIcon className={`mr-2 ${iconSize}`} />
      {children}
    </Link>
  );
}
