import Link from "next/link";
import { WhatsAppButton } from "./WhatsAppButton";
import { BUSINESS_CONFIG } from "@/lib/config";
import { NAV_LINKS } from "@/lib/navLinks";
import { PhoneLink } from "./PhoneLink";
import { servicesData } from "@/app/services/data/servicesData";
import { Container } from "./ui/Container";

export function Footer() {
  const { location, phone, phoneClean, name } = BUSINESS_CONFIG;

  return (
    <footer
      className="bg-slate-100 dark:bg-neutral-800 border-t border-slate-200 dark:border-neutral-700"
      role="contentinfo"
    >
      <Container className="max-w-6xl py-8 sm:py-12">
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
                  className="rounded-md transition-colors hover:text-sky-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 dark:hover:text-sky-400"
                >
                  {phone}
                </PhoneLink>
              </p>
            </address>
            <div className="mt-4">
              <WhatsAppButton
                message="Hola, quisiera consultar sobre kinesiología a domicilio"
                ctaLocation="footer"
                size="sm"
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
                    className="rounded-md transition-colors hover:text-sky-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 dark:hover:text-sky-400"
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
      </Container>
    </footer>
  );
}
