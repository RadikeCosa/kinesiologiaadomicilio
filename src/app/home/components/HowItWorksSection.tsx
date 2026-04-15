import { HOW_IT_WORKS_CONTENT } from "@/app/home/howItWorksContent";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { Container } from "@/components/ui/Container";
import {
  SECTION_LEAD_CLASS,
  SECTION_TITLE_CLASS,
  SECTION_Y_SPACING,
} from "@/components/ui/styleTokens";

export function HowItWorksSection() {
  return (
    <section aria-labelledby="how-it-works-heading" className={SECTION_Y_SPACING}>
      <Container className="max-w-4xl">
        <header className="text-center">
          <h2 id="how-it-works-heading" className={SECTION_TITLE_CLASS}>
            {HOW_IT_WORKS_CONTENT.title}
          </h2>
          <p className={SECTION_LEAD_CLASS}>{HOW_IT_WORKS_CONTENT.lead}</p>
        </header>

        <ol className="mt-10 space-y-4">
          {HOW_IT_WORKS_CONTENT.steps.map((step, index) => (
            <li
              key={step.id}
              className="rounded-xl border border-slate-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-800"
            >
              <p className="text-sm font-semibold tracking-wide text-sky-700 dark:text-sky-300">
                Paso {index + 1}
              </p>
              <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
                {step.title}
              </h3>
              <p className="mt-2 text-base leading-relaxed text-slate-600 dark:text-slate-300">
                {step.description}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-8 text-center">
          <WhatsAppButton
            message={HOW_IT_WORKS_CONTENT.ctaWhatsAppMessage}
            ctaLocation="how_it_works"
            variant="whatsapp"
            size="md"
          >
            {HOW_IT_WORKS_CONTENT.ctaLabel}
          </WhatsAppButton>
        </div>
      </Container>
    </section>
  );
}
