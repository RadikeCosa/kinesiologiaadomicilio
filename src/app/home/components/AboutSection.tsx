import Image from "next/image";
import { HOME_CONTENT } from "@/app/home/homeContent";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { Container } from "@/components/ui/Container";
import { SECTION_TITLE_CLASS, SECTION_Y_SPACING } from "@/components/ui/styleTokens";

export function AboutSection() {
  return (
    <section aria-labelledby="about-heading" className={`${SECTION_Y_SPACING} bg-white dark:bg-neutral-900`}>
      <Container className="max-w-6xl">
        <div className="grid grid-cols-1 gap-9 md:grid-cols-[1fr_0.9fr] md:items-center md:gap-14">
          <div className="order-2 md:order-1">
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-sky-800 dark:text-sky-300">{HOME_CONTENT.about.name}</p>
            <h2 id="about-heading" className={`${SECTION_TITLE_CLASS} mt-3`}>
              {HOME_CONTENT.about.sectionTitle}
            </h2>
            <p className="mt-4 text-lg font-semibold text-slate-800 dark:text-slate-200">
              {HOME_CONTENT.about.tagline}
            </p>
            <p className="mt-4 text-base leading-7 text-slate-700 dark:text-slate-300">
              {HOME_CONTENT.about.bio}
            </p>
            <ul className="mt-6 space-y-3 text-base text-slate-700 dark:text-slate-200">
              {HOME_CONTENT.about.highlights.map((highlight) => (
                <li key={highlight} className="flex items-start gap-3">
                  <span aria-hidden="true" className="mt-1 text-emerald-800 dark:text-emerald-300">✓</span>
                  <span className="leading-6">{highlight}</span>
                </li>
              ))}
            </ul>
            <div className="mt-7">
              <WhatsAppButton
                message={HOME_CONTENT.about.whatsappMessage}
                ctaLocation="other"
                ctaLabel="Consultar con Ramiro por WhatsApp"
                variant="secondary"
                size="md"
              >
                {HOME_CONTENT.about.ctaLabel}
              </WhatsAppButton>
            </div>
          </div>
          <div className="order-1 mx-auto aspect-[4/3] w-full max-w-lg overflow-hidden rounded-[1.75rem] md:order-2">
            <Image
              src="/hero-session.png"
              alt="Ramiro acompaña un ejercicio de movilidad durante una sesión de kinesiología"
              width={1536}
              height={1024}
              sizes="(max-width: 768px) 92vw, 480px"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
