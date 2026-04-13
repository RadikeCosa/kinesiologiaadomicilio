import Link from "next/link";
import { BUSINESS_CONFIG } from "@/lib/config";
import { NAV_LINKS } from "@/lib/navLinks";
import { WhatsAppButton } from "./WhatsAppButton";
import { Container } from "./ui/Container";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-sm dark:bg-neutral-900/80 border-b border-slate-200 dark:border-neutral-700">
      <Container className="max-w-6xl">
        <div className="flex h-16 items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-md text-lg font-semibold text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 dark:text-slate-100"
          >
            <span aria-hidden="true">💪</span>
            <span className="hidden sm:inline">{BUSINESS_CONFIG.shortName}</span>
            <span className="sm:hidden">Kinesio NQN</span>
          </Link>

          <nav aria-label="Navegación principal">
            <ul className="flex items-center gap-1 sm:gap-4">
              {NAV_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 dark:text-slate-400 dark:hover:bg-neutral-800 dark:hover:text-slate-100"
                  >
                    {label}
                  </Link>
                </li>
              ))}
              <li>
                <WhatsAppButton
                  message="Hola quisiera consultar por kinesio a domicilio"
                  ctaLocation="header"
                  ctaLabel="Contactar"
                  size="sm"
                  iconSize="h-4 w-4"
                >
                  <span className="hidden sm:inline">Contactar</span>
                  <span className="sm:hidden">WhatsApp</span>
                </WhatsAppButton>
              </li>
            </ul>
          </nav>
        </div>
      </Container>
    </header>
  );
}
