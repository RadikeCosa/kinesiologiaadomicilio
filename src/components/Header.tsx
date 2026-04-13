import Link from "next/link";
import { BUSINESS_CONFIG } from "@/lib/config";
import { WhatsAppButton } from "./WhatsAppButton";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-sm dark:bg-neutral-900/80 border-b border-slate-200 dark:border-neutral-700">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100"
        >
          <span aria-hidden="true">💪</span>
          <span className="hidden sm:inline">{BUSINESS_CONFIG.shortName}</span>
          <span className="sm:hidden">Kinesio NQN</span>
        </Link>

        <nav aria-label="Navegación principal">
          <ul className="flex items-center gap-1 sm:gap-4">
            <li>
              <Link
                href="/"
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-neutral-800 dark:hover:text-slate-100"
              >
                Inicio
              </Link>
            </li>
            <li>
              <Link
                href="/services"
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-neutral-800 dark:hover:text-slate-100"
              >
                Servicios
              </Link>
            </li>
            <li>
              <WhatsAppButton
                message="Hola quisiera consultar por kinesio a domicilio"
                ctaLocation="header"
                ctaLabel="Contactar"
                className="inline-flex items-center gap-1.5 rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400"
                iconSize="h-4 w-4"
              >
                <span className="hidden sm:inline">Contactar</span>
                <span className="sm:hidden">WhatsApp</span>
              </WhatsAppButton>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
