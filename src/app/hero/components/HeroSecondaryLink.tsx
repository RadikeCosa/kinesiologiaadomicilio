import Link from "next/link";
import type { ReactNode } from "react";
import { getCtaClass } from "@/components/ui/ctaStyles";

interface HeroSecondaryLinkProps {
  children: ReactNode;
}

export function HeroSecondaryLink({ children }: HeroSecondaryLinkProps) {
  return (
    <Link
      href="/services"
      className={getCtaClass({ variant: "secondary", size: "md" })}
    >
      {children}
    </Link>
  );
}
