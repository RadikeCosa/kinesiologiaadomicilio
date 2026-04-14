import Link from "next/link";
import { BUSINESS_CONFIG } from "@/lib/config";
import { NAV_LINKS } from "@/lib/navLinks";
import { WhatsAppButton } from "./WhatsAppButton";
import { Container } from "./ui/Container";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-950/85">
      <Container className="max-w-6xl">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link
            href="/"
            className="group flex min-w-0 items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2"
          >
            <span
              aria-hidden="true"
              className="h-2.5 w-2.5 rounded-full bg-sky-500 shadow-sm shadow-sky-500/30"
            />

            <div className="min-w-0 leading-none">
              <span className="block truncate text-sm font-semibold tracking-[0.01em] text-slate-900 transition-colors group-hover:text-sky-700 dark:text-slate-100 dark:group-hover:text-sky-300 sm:text-base">
                {BUSINESS_CONFIG.shortName}
              </span>
              <span className="hidden text-xs font-medium text-slate-500 dark:text-slate-400 sm:block">
                Atención domiciliaria
              </span>
            </div>
          </Link>

          <nav aria-label="Navegación principal">
            <ul className="flex items-center gap-1 sm:gap-3">
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
