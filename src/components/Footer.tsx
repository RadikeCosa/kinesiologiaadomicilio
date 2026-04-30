import Link from "next/link";
import { WhatsAppButton } from "./WhatsAppButton";
import { BUSINESS_CONFIG } from "@/lib/config";
import { NAV_LINKS } from "@/lib/navLinks";
import { PhoneLink } from "./PhoneLink";
import { servicesData } from "@/lib/servicesData";
import { Container } from "./ui/Container";

export function Footer() {
  const { location, phone, phoneClean, name } = BUSINESS_CONFIG;

  return (
    <footer
      className="border-t border-slate-200/80 bg-slate-50 dark:border-neutral-800 dark:bg-neutral-950"
      role="contentinfo"
    >
      <Container className="max-w-6xl py-10 sm:py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.2fr_0.85fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="h-2.5 w-2.5 rounded-full bg-sky-500 shadow-sm shadow-sky-500/30"
              />
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sky-700 dark:text-sky-400">
                Contacto
              </p>
            </div>

            <h2 className="mt-4 text-xl font-semibold tracking-[0.01em] text-slate-900 dark:text-slate-100">
              Kinesiología a domicilio en {location.city}
            </h2>

            <p className="mt-3 max-w-sm text-sm leading-6 text-slate-600 dark:text-slate-400">
              Atención profesional orientada a rehabilitación, movilidad y
              acompañamiento funcional en domicilio.
            </p>

            <address className="mt-5 space-y-3 not-italic text-sm text-slate-600 dark:text-slate-400">
              <p>
                <span className="font-medium text-slate-900 dark:text-slate-200">
                  Zona de atención:
                </span>{" "}
                {location.city}, {location.country}
              </p>

              <p>
                <span className="font-medium text-slate-900 dark:text-slate-200">
                  Teléfono:
                </span>{" "}
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

            <div className="mt-5">
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

          <nav aria-label="Enlaces del pie de página">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
              Navegación
            </p>

            <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-400">
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
              <li>
                <Link
                  href="/evaluar"
                  className="rounded-md transition-colors hover:text-sky-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 dark:hover:text-sky-400"
                >
                  Evaluar mi situación
                </Link>
              </li>
            </ul>
          </nav>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
              Servicios
            </p>

            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
              {servicesData.map((service) => (
                <li key={service.title}>
                  {service.shortTitle ?? service.title}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-200/80 pt-6 text-sm text-slate-500 dark:border-neutral-800 dark:text-slate-500">
          <p>
            © {new Date().getFullYear()} {name}. Todos los derechos reservados.
          </p>
        </div>
      </Container>
    </footer>
  );
}
