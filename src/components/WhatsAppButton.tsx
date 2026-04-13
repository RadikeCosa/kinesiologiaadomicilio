"use client";

import Link from "next/link";
import { WhatsAppIcon } from "./WhatsAppIcon";
import { getWhatsAppUrl } from "@/lib/config";
import { trackGenerateLead, type CtaLocation } from "@/lib/analytics";
import { getCtaClass } from "./ui/ctaStyles";

interface WhatsAppButtonProps {
  /** Texto del mensaje que se enviará por WhatsApp */
  message: string;
  /** Texto que aparece en el botón */
  children: React.ReactNode;
  /** Clases CSS adicionales para el botón */
  className?: string;
  /** Variante visual del CTA */
  variant?: "whatsapp" | "sky" | "secondary";
  /** Tamaño visual del CTA */
  size?: "sm" | "md";
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
  className,
  variant = "whatsapp",
  size = "md",
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
      className={getCtaClass({ variant, size, className })}
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
