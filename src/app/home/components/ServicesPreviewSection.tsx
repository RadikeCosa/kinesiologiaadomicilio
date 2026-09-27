import Link from "next/link";
import { servicesData } from "@/lib/servicesData";
import { Container } from "@/components/ui/Container";
import { getCtaClass } from "@/components/ui/ctaStyles";
import { SECTION_TITLE_CLASS, SECTION_Y_SPACING } from "@/components/ui/styleTokens";

export function ServicesPreviewSection() {
  return (
    <section id="servicios-preview" aria-labelledby="services-preview-heading" className={SECTION_Y_SPACING}>
      <Container className="max-w-6xl">
        <header className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-sky-800 dark:text-sky-300">Atención para adultos y adultos mayores</p>
          <h2 id="services-preview-heading" className={`${SECTION_TITLE_CLASS} mt-3`}>
            Situaciones que podemos evaluar
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-700 dark:text-slate-300">
            La primera evaluación ayuda a entender cada caso y conversar sobre objetivos y próximos pasos.
          </p>
        </header>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {servicesData.map((service) => (
            <li key={service.title} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-800">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{service.title}</h3>
              <p className="mt-3 text-base leading-6 text-slate-700 dark:text-slate-300">{service.description}</p>
            </li>
          ))}
        </ul>
        <div className="mt-8">
          <Link href="/services" className={getCtaClass({ variant: "secondary", size: "md" })}>
            Conocer servicios y situaciones atendidas
          </Link>
        </div>
      </Container>
    </section>
  );
}
