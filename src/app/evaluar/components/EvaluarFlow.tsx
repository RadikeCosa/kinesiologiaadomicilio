"use client";

import { useState } from "react";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { Container } from "@/components/ui/Container";
import { getCtaClass } from "@/components/ui/ctaStyles";
import {
  SECTION_LEAD_CLASS,
  SECTION_TITLE_CLASS,
  SECTION_Y_SPACING,
} from "@/components/ui/styleTokens";
import type { EvaluarBranch, EvaluarContent, EvaluarFlowState } from "../types";

interface EvaluarFlowProps {
  content: EvaluarContent;
}

export function EvaluarFlow({ content }: EvaluarFlowProps) {
  const [selectedBranch, setSelectedBranch] = useState<EvaluarBranch | null>(null);
  const [flowState, setFlowState] = useState<EvaluarFlowState>("selection");

  const handleSelectBranch = (branch: EvaluarBranch) => {
    setSelectedBranch(branch);
    setFlowState("result");
  };

  const handleBackToSelection = () => {
    setSelectedBranch(null);
    setFlowState("selection");
  };

  return (
    <section className={SECTION_Y_SPACING} aria-live="polite">
      <Container className="max-w-4xl">
        {flowState === "selection" ? (
          <div>
            <header className="text-center">
              <h1 className={SECTION_TITLE_CLASS}>{content.headline}</h1>
              <p className={SECTION_LEAD_CLASS}>{content.subtitle}</p>
            </header>

            <div className="mt-10 grid gap-3 sm:gap-4">
              {content.branches.map((branch) => (
                <button
                  key={branch.id}
                  type="button"
                  onClick={() => handleSelectBranch(branch)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-4 text-left text-base font-medium leading-relaxed text-slate-800 transition-colors hover:border-sky-300 hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 dark:border-neutral-700 dark:bg-neutral-800 dark:text-slate-100 dark:hover:border-sky-500 dark:hover:bg-neutral-700"
                >
                  {branch.optionLabel}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {flowState === "result" && selectedBranch ? (
          <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-800 sm:p-8">
            <p className="text-sm font-semibold tracking-wide text-sky-700 dark:text-sky-300">
              Situación elegida
            </p>
            <p className="mt-1 text-base leading-relaxed text-slate-700 dark:text-slate-300">
              {selectedBranch.optionLabel}
            </p>

            <h2 className="mt-6 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {selectedBranch.resultTitle}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-700 dark:text-slate-300">
              {selectedBranch.resultText}
            </p>

            <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <WhatsAppButton
                message={selectedBranch.whatsappMessage}
                ctaLocation="evaluar"
                ctaLabel={selectedBranch.ctaLabel}
                variant="whatsapp"
                size="md"
              >
                {selectedBranch.ctaLabel}
              </WhatsAppButton>

              <button
                type="button"
                onClick={handleBackToSelection}
                className={getCtaClass({ variant: "secondary", size: "md" })}
              >
                {content.backLabel}
              </button>
            </div>
          </div>
        ) : null}
      </Container>
    </section>
  );
}
