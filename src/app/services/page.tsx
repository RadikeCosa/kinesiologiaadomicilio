import type { Metadata } from "next";
import Link from "next/link";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { ServicesGrid } from "./components/ServicesGrid";
import { Container } from "@/components/ui/Container";
import {
  SECTION_LEAD_CLASS,
  SECTION_TITLE_CLASS,
  SECTION_Y_SPACING,
} from "@/components/ui/styleTokens";
import { SERVICES_PAGE_CONTENT } from "./servicesPageContent";

export const metadata: Metadata = {
  title: "Servicios de kinesiología a domicilio en Neuquén | Rehabilitación",
  description:
    "Servicios especializados de kinesiología y rehabilitación a domicilio: postoperatorio, adultos mayores, cuidados paliativos y terapia física personalizada en Neuquén.",
  alternates: {
    canonical: "https://kinesiologiaadomicilio.vercel.app/services",
  },
  keywords: [
    "servicios kinesiología domicilio",
    "rehabilitación postoperatoria Neuquén",
    "kinesiología adultos mayores",
    "cuidados paliativos kinesiología",
    "terapia física domiciliaria",
  ],
};

export default function ServicesPage() {
  return (
    <div className="bg-slate-50 dark:bg-neutral-900 min-h-screen">
      <Container className={`max-w-4xl ${SECTION_Y_SPACING}`}>
        <header className="text-center">
          <h1 className={SECTION_TITLE_CLASS}>{SERVICES_PAGE_CONTENT.intro.title}</h1>
          <p className={SECTION_LEAD_CLASS}>
            {SERVICES_PAGE_CONTENT.intro.description}
          </p>
        </header>

        <div id="servicios-grid">
          <ServicesGrid />
        </div>

        <div className="mt-16 text-center">
          <div className="rounded-2xl bg-sky-50 p-8 dark:bg-sky-950">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              {SERVICES_PAGE_CONTENT.consultationCta.title}
            </h2>
            <p className="mt-4 text-base text-slate-600 dark:text-slate-300">
              {SERVICES_PAGE_CONTENT.consultationCta.description}
            </p>
            <WhatsAppButton
              message={SERVICES_PAGE_CONTENT.consultationCta.whatsappMessage}
              ctaLocation="services"
              className="mt-6"
              variant="whatsapp"
              size="md"
            >
              {SERVICES_PAGE_CONTENT.consultationCta.ctaLabel}
            </WhatsAppButton>
          </div>
        </div>

        <div className="mt-12 text-center">
          <nav aria-label="Navegación de servicios">
            <Link
              href="/"
              className="text-sky-600 transition-colors hover:text-sky-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 dark:text-sky-400 dark:hover:text-sky-300"
            >
              ← Volver al inicio
            </Link>
          </nav>
        </div>
      </Container>
    </div>
  );
}
