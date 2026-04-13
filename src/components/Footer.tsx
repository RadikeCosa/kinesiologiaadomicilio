import Link from "next/link";
import { WhatsAppButton } from "./WhatsAppButton";
import { BUSINESS_CONFIG } from "@/lib/config";
import { NAV_LINKS } from "@/lib/navLinks";
import { PhoneLink } from "./PhoneLink";
import { servicesData } from "@/app/services/data/servicesData";

export function Footer() {
  const { location, phone, phoneClean, name } = BUSINESS_CONFIG;

  return (
    <footer
      className="bg-slate-100 dark:bg-neutral-800 border-t border-slate-200 dark:border-neutral-700"
      role="contentinfo"
    >
      <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Información de contacto */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Contacto
            </h2>
            <address className="mt-4 not-italic text-slate-600 dark:text-slate-400">
              <p className="flex items-center gap-2">
                <span aria-hidden="true">📍</span>
                <span>
                  {location.city}, {location.country}
                </span>
              </p>
              <p className="mt-2 flex items-center gap-2">
                <span aria-hidden="true">📞</span>
                <PhoneLink
                  destination={`tel:+${phoneClean}`}
                  ctaLocation="footer"
                  ctaLabel="Teléfono footer"
                  className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                >
                  {phone}
                </PhoneLink>
              </p>
            </address>
            <div className="mt-4">
              <WhatsAppButton
                message="Hola, quisiera consultar sobre kinesiología a domicilio"
                ctaLocation="footer"
                className="inline-flex items-center justify-center rounded-full bg-green-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-green-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400"
                iconSize="h-4 w-4"
              >
                WhatsApp
              </WhatsAppButton>
            </div>
          </div>

          {/* Navegación */}
          <nav aria-label="Enlaces del pie de página">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Navegación
            </h2>
            <ul className="mt-4 space-y-2 text-slate-600 dark:text-slate-400">
              {NAV_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Servicios */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Servicios
            </h2>
            <ul className="mt-4 space-y-2 text-slate-600 dark:text-slate-400">
              {servicesData.map((service) => (
                <li key={service.title}>{service.title}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t border-slate-200 dark:border-neutral-700 pt-6 text-center text-sm text-slate-500 dark:text-slate-500">
          <p>
            © {new Date().getFullYear()} {name}. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
