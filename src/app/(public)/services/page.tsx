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
  title: "Servicios de rehabilitación a domicilio en Neuquén Capital",
  description:
    "Situaciones atendidas en kinesiología a domicilio para adultos y adultos mayores en Neuquén Capital, con rehabilitación funcional y evaluación inicial según cada caso.",
  alternates: {
    canonical: `${BUSINESS_CONFIG.url}/services`,
  },
  openGraph: {
    title: "Servicios de rehabilitación a domicilio en Neuquén Capital",
    description:
      "Situaciones atendidas en kinesiología a domicilio para adultos y adultos mayores en Neuquén Capital, con rehabilitación funcional y evaluación inicial según cada caso.",
    url: `${BUSINESS_CONFIG.url}/services`,
    siteName: "Rehabilitación a domicilio Neuquén",
    locale: "es_AR",
    type: "website",
    images: [
      {
        url: "/og-placeholder.png",
        width: 1200,
        height: 630,
        alt: "Servicios de rehabilitación a domicilio en Neuquén Capital",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Servicios de rehabilitación a domicilio en Neuquén Capital",
    description:
      "Situaciones atendidas en kinesiología a domicilio para adultos y adultos mayores en Neuquén Capital, con rehabilitación funcional y evaluación inicial según cada caso.",
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

        <section className="mt-12" aria-labelledby="situaciones-heading">
          <header>
            <h2
              id="situaciones-heading"
              className="text-2xl font-semibold text-slate-900 dark:text-slate-100"
            >
              {SERVICES_PAGE_CONTENT.situations.title}
            </h2>
            <p className="mt-3 text-base leading-7 text-slate-600 dark:text-slate-300">
              {SERVICES_PAGE_CONTENT.situations.lead}
            </p>
          </header>
          <ul className="mt-6 grid gap-3 text-sm leading-6 text-slate-700 dark:text-slate-200 sm:grid-cols-2">
            {SERVICES_PAGE_CONTENT.situations.items.map((item) => (
              <li
                key={item}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-neutral-700 dark:bg-neutral-800"
              >
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-14" aria-labelledby="servicios-heading">
          <header>
            <h2
              id="servicios-heading"
              className="text-2xl font-semibold text-slate-900 dark:text-slate-100"
            >
              {SERVICES_PAGE_CONTENT.services.title}
            </h2>
            <p className="mt-3 text-base leading-7 text-slate-600 dark:text-slate-300">
              {SERVICES_PAGE_CONTENT.services.lead}
            </p>
          </header>
          <div id="servicios-grid">
            <ServicesGrid />
          </div>
        </section>

        <section className="mt-14 rounded-2xl border border-slate-200 bg-white p-6 text-left dark:border-neutral-700 dark:bg-neutral-800">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            {SERVICES_PAGE_CONTENT.evaluation.title}
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-700 dark:text-slate-200">
            {SERVICES_PAGE_CONTENT.evaluation.description}
          </p>
          <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
            {SERVICES_PAGE_CONTENT.evaluation.note}
          </p>
        </section>

        <section className="mt-14 rounded-2xl border border-slate-200 bg-white p-6 text-left dark:border-neutral-700 dark:bg-neutral-800">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            {SERVICES_PAGE_CONTENT.faq.title}
          </h2>
          <dl className="mt-6 space-y-4 text-slate-700 dark:text-slate-200">
            {SERVICES_PAGE_CONTENT.faq.items.map((item) => (
              <div key={item.question}>
                <dt className="font-semibold">{item.question}</dt>
                <dd className="mt-1 text-sm leading-6">{item.answer}</dd>
              </div>
            ))}
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
