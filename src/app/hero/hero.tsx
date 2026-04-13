import { WhatsAppButton } from "@/components/WhatsAppButton";
import { HeroSecondaryLink } from "./components/HeroSecondaryLink";
import { HeroServiceTypesList } from "./components/HeroServiceTypesList";
import { HeroImage } from "./components/HeroImage";
import { heroContent } from "./heroContent";

export default function HeroSection() {
  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className="flex flex-1 items-center px-4 py-10 sm:py-12"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-8 sm:flex-row md:gap-12">
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
              className="inline-flex items-center justify-center rounded-full bg-green-600 px-7 py-3 text-base font-semibold text-white transition hover:bg-green-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 dark:bg-green-600 dark:hover:bg-green-500"
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
    </section>
  );
}
