import type { Metadata } from "next";
import Link from "next/link";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { ServicesGrid } from "./components/ServicesGrid";
import { Container } from "@/components/ui/Container";
import { getCtaClass } from "@/components/ui/ctaStyles";
import {
  SECTION_LEAD_CLASS,
  SECTION_TITLE_CLASS,
  SECTION_Y_SPACING,
} from "@/components/ui/styleTokens";
import { SERVICES_PAGE_CONTENT } from "./servicesPageContent";
import { BUSINESS_CONFIG } from "@/lib/config";

export const metadata: Metadata = {
  title: "Servicios de kinesiología a domicilio en Neuquén | Rehabilitación y fisioterapia",
  description:
    "Servicios de kinesiología a domicilio en Neuquén Capital y zonas cercanas según disponibilidad. Rehabilitación a domicilio y fisioterapia para adultos, postoperatorios, cuidados paliativos y recuperación funcional.",
  alternates: {
    canonical: `${BUSINESS_CONFIG.url}/services`,
  },
  openGraph: {
    title: "Servicios de kinesiología a domicilio en Neuquén | Rehabilitación y fisioterapia",
    description:
      "Servicios de kinesiología a domicilio en Neuquén Capital y zonas cercanas según disponibilidad. Rehabilitación a domicilio y fisioterapia para adultos, postoperatorios, cuidados paliativos y recuperación funcional.",
    url: `${BUSINESS_CONFIG.url}/services`,
    siteName: "Rehabilitación a domicilio Neuquén",
    locale: "es_AR",
    type: "website",
    images: [
      {
        url: "/og-placeholder.png",
        width: 1200,
        height: 630,
        alt: "Servicios de kinesiología a domicilio en Neuquén",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Servicios de kinesiología a domicilio en Neuquén | Rehabilitación y fisioterapia",
    description:
      "Servicios de kinesiología a domicilio en Neuquén Capital y zonas cercanas según disponibilidad. Rehabilitación a domicilio y fisioterapia para adultos, postoperatorios, cuidados paliativos y recuperación funcional.",
    images: ["/og-placeholder.png"],
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

        <section className="mt-14 rounded-2xl border border-slate-200 bg-white p-6 text-left dark:border-neutral-700 dark:bg-neutral-800">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            Preguntas frecuentes sobre atención a domicilio en Neuquén
          </h2>
          <dl className="mt-6 space-y-4 text-slate-700 dark:text-slate-200">
            <div>
              <dt className="font-semibold">¿En qué zonas atienden?</dt>
              <dd className="mt-1 text-sm">Atendemos en Neuquén Capital y zonas cercanas según disponibilidad y logística del día.</dd>
            </div>
            <div>
              <dt className="font-semibold">¿La atención es por obra social?</dt>
              <dd className="mt-1 text-sm">La modalidad actual es particular. Por WhatsApp te orientamos sobre disponibilidad, forma de trabajo y valor de la consulta.</dd>
            </div>
            <div>
              <dt className="font-semibold">¿Cuándo conviene consultar?</dt>
              <dd className="mt-1 text-sm">Podés consultar ante recuperación postoperatoria, pérdida de movilidad, rehabilitación funcional o necesidad de acompañamiento en domicilio.</dd>
            </div>
            <div>
              <dt className="font-semibold">¿Qué información conviene enviar por WhatsApp?</dt>
              <dd className="mt-1 text-sm">Zona/barrio, motivo de consulta, edad aproximada del paciente y franja horaria orientativa para coordinar.</dd>
            </div>
          </dl>
        </section>

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
            <div className="mt-4">
              <Link
                href="/evaluar"
                className={getCtaClass({ variant: "secondary", size: "md" })}
              >
                {SERVICES_PAGE_CONTENT.consultationCta.evaluationLinkLabel}
              </Link>
            </div>
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
