import { WhatsAppButton } from "@/components/WhatsAppButton";
import { HeroSecondaryLink } from "./components/HeroSecondaryLink";
import { HeroServiceTypesList } from "./components/HeroServiceTypesList";
import { HeroImage } from "./components/HeroImage";
import { heroContent } from "./heroContent";
import { Container } from "@/components/ui/Container";

export default function HeroSection() {
  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className="flex flex-1 items-center py-10 sm:py-12"
    >
      <Container className="max-w-6xl">
        <div className="flex w-full flex-col items-center gap-8 sm:flex-row md:gap-12">
          <div className="w-full max-w-2xl text-center sm:text-left">
            <h1
              id="hero-heading"
              className="text-balance text-3xl font-bold leading-snug sm:text-5xl md:text-6xl"
            >
              {heroContent.h1.prefix}{" "}
              <span className="text-sky-600 dark:text-sky-400">
                {heroContent.h1.highlight}
              </span>{" "}
              {heroContent.h1.suffix}
            </h1>
            <p className="sr-only">{heroContent.srOnly}</p>
            <p className="mt-4 text-base leading-relaxed text-slate-700 dark:text-slate-300 sm:mt-6 sm:text-xl">
              {heroContent.supportText}
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:items-center">
              <WhatsAppButton
                message={heroContent.whatsappMessage}
                ctaLocation="hero"
                variant="whatsapp"
                size="md"
                iconSize="h-6 w-6"
              >
                {heroContent.ctaLabel}
              </WhatsAppButton>
              <HeroSecondaryLink>
                {heroContent.secondaryLinkLabel}
              </HeroSecondaryLink>
            </div>
            <HeroServiceTypesList />
          </div>
          <HeroImage />
        </div>
      </Container>
    </section>
  );
}
