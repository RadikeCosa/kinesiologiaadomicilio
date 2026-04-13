"use client";

import { trackPhoneClick, type CtaLocation } from "@/lib/analytics";

interface PhoneLinkProps {
  destination: string;
  ctaLocation: CtaLocation;
  ctaLabel?: string;
  className?: string;
  children: React.ReactNode;
}

export function PhoneLink({
  destination,
  ctaLocation,
  ctaLabel,
  className,
  children,
}: PhoneLinkProps) {
  const resolvedLabel = ctaLabel ?? (typeof children === "string" ? children : undefined);

  return (
    <a
      href={destination}
      className={className}
      onClick={() =>
        trackPhoneClick({
          ctaLocation,
          ctaLabel: resolvedLabel,
          destination,
        })
      }
    >
      {children}
    </a>
  );
}
