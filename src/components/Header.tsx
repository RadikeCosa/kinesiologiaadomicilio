import Link from "next/link";
import { BUSINESS_CONFIG } from "@/lib/config";
import { NAV_LINKS } from "@/lib/navLinks";
import { WHATSAPP_GLOBAL_PREQUALIFIED_MESSAGE } from "@/lib/whatsapp-messages";
import { WhatsAppButton } from "./WhatsAppButton";
import { Container } from "./ui/Container";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-950/85">
      <Container className="max-w-6xl">
        <div className="flex min-h-16 items-center justify-between gap-2 sm:gap-4">
          <Link
            href="/"
            aria-label={BUSINESS_CONFIG.shortName}
            className="group flex min-w-0 items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700 focus-visible:ring-offset-2 dark:focus-visible:ring-sky-300"
          >
            <span
              aria-hidden="true"
              className="h-2.5 w-2.5 rounded-full bg-teal-700 shadow-sm shadow-teal-700/30"
            />

            <div className="min-w-0 leading-none">
              <span className="block truncate text-sm font-semibold tracking-[0.01em] text-slate-900 transition-colors group-hover:text-sky-700 dark:text-slate-100 dark:group-hover:text-sky-300 min-[360px]:hidden sm:hidden">
                Kine
              </span>
              <span className="hidden truncate text-sm font-semibold tracking-[0.01em] text-slate-900 transition-colors group-hover:text-sky-700 dark:text-slate-100 dark:group-hover:text-sky-300 min-[360px]:block sm:hidden">
                Kinesiología
              </span>
              <span className="hidden truncate text-base font-semibold tracking-[0.01em] text-slate-900 transition-colors group-hover:text-sky-700 dark:text-slate-100 dark:group-hover:text-sky-300 sm:block">
                {BUSINESS_CONFIG.shortName}
              </span>
              <span className="hidden text-xs font-medium text-slate-500 dark:text-slate-400 sm:block">
                Atención domiciliaria
              </span>
            </div>
          </Link>

          <nav aria-label="Navegación principal">
            <ul className="flex items-center gap-0.5 sm:gap-3">
              {NAV_LINKS.map(({ href, label }) => (
                <li
                  key={href}
                  className={href === "/" ? "hidden sm:block" : undefined}
                >
                  <Link
                    href={href}
                    className="inline-flex min-h-11 items-center rounded-lg px-2 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700 focus-visible:ring-offset-2 sm:px-3 dark:text-slate-200 dark:hover:bg-neutral-800 dark:hover:text-white"
                  >
                    {label}
                  </Link>
                </li>
              ))}
              <li>
                <WhatsAppButton
                  message={WHATSAPP_GLOBAL_PREQUALIFIED_MESSAGE}
                  ctaLocation="header"
                  ctaLabel="Contactar"
                  size="sm"
                  iconSize="hidden sm:block h-4 w-4"
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
