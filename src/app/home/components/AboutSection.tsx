import { HOME_CONTENT } from "@/app/home/homeContent";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { Container } from "@/components/ui/Container";
import {
  SECTION_TITLE_CLASS,
  SECTION_Y_SPACING,
} from "@/components/ui/styleTokens";

export function AboutSection() {
  return (
    <section aria-labelledby="about-heading" className={SECTION_Y_SPACING}>
      <Container className="max-w-4xl">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:items-center md:gap-12">
          <div>
            <h2 id="about-heading" className={SECTION_TITLE_CLASS}>
              {HOME_CONTENT.about.sectionTitle}
            </h2>
            <p className="mt-2 text-sm font-semibold tracking-wide text-slate-800 dark:text-slate-200">
              {HOME_CONTENT.about.name}
            </p>
            <p className="mt-4 text-lg font-medium text-sky-600 dark:text-sky-400">
              {HOME_CONTENT.about.tagline}
            </p>
            <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-300">
              {HOME_CONTENT.about.bio}
            </p>

            <ul className="mt-6 space-y-3 text-sm text-slate-700 dark:text-slate-200 sm:text-base">
              {HOME_CONTENT.about.highlights.map((highlight) => (
                <li key={highlight} className="flex items-start gap-2">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 flex h-4 w-4 items-center justify-center"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 text-emerald-500"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </span>
                  <span className="leading-snug">{highlight}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <WhatsAppButton
                message={HOME_CONTENT.about.whatsappMessage}
                ctaLocation="other"
                variant="whatsapp"
                size="md"
              >
                {HOME_CONTENT.about.ctaLabel}
              </WhatsAppButton>
            </div>
          </div>

          <div className="mx-auto flex aspect-square w-full max-w-xs items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 dark:border-neutral-600 dark:bg-neutral-700">
            <div className="text-center">
              <p className="text-base font-medium text-slate-700 dark:text-slate-200">
                Foto profesional próximamente
              </p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
                Mientras tanto, seguimos mejorando esta presentación.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
