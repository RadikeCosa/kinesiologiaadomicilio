import { WhatsAppButton } from "@/components/WhatsAppButton";
import { HeroSecondaryLink } from "./components/HeroSecondaryLink";
import { HeroImage } from "./components/HeroImage";
import { heroContent } from "./heroContent";
import { Container } from "@/components/ui/Container";

export default function HeroSection() {
  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className="relative overflow-hidden bg-[#eaf2f2] py-8 dark:bg-neutral-900 sm:py-14 lg:py-20"
    >
      <Container className="max-w-6xl">
        <div className="grid items-center gap-8 rounded-[2rem] border border-white/80 bg-white/80 p-5 shadow-[0_24px_70px_rgba(20,52,67,0.08)] backdrop-blur sm:gap-12 sm:p-9 md:grid-cols-[0.9fr_1.1fr] md:p-12 dark:border-neutral-700 dark:bg-neutral-800/80 dark:shadow-none">
          <div className="order-1 text-left md:order-2">
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-sky-800 dark:text-sky-300">
              {heroContent.eyebrow}
            </p>
            <h1
              id="hero-heading"
              className="mt-4 max-w-xl text-balance text-4xl font-bold leading-[1.08] tracking-tight text-slate-950 sm:text-5xl lg:text-[3.65rem] dark:text-white"
            >
              {heroContent.h1}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-700 dark:text-slate-200">
              {heroContent.supportText}
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <WhatsAppButton
                message={heroContent.whatsappMessage}
                ctaLocation="hero"
                ctaLabel="Hablar con Ramiro por WhatsApp"
                variant="whatsapp"
                size="md"
                iconSize="h-5 w-5"
              >
                Hablar con Ramiro
              </WhatsAppButton>
              <HeroSecondaryLink>
                {heroContent.secondaryLinkLabel}
              </HeroSecondaryLink>
            </div>
            <ul
              aria-label="Datos principales del servicio"
              className="mt-7 flex flex-wrap gap-2.5 text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              {heroContent.commercialSignals.map((signal) => (
                <li
                  key={signal}
                  className="rounded-full border border-slate-300 bg-[#f7faf9] px-3.5 py-2 dark:border-neutral-600 dark:bg-neutral-900"
                >
                  {signal}
                </li>
              ))}
            </ul>
          </div>
          <div className="order-2 md:order-1">
            <HeroImage />
          </div>
        </div>
      </Container>
    </section>
  );
}
