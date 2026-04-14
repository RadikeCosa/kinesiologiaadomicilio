import { HOME_CONTENT } from "@/app/home/homeContent";
import { Container } from "@/components/ui/Container";

export function ServiceContextBanner() {
  return (
    <section
      aria-label={HOME_CONTENT.serviceContext.title}
      className="py-10 sm:py-12"
    >
      <Container className="max-w-4xl">
        <div className="rounded-2xl border border-slate-200/80 bg-white/40 px-4 py-6 dark:border-neutral-700 dark:bg-neutral-800/40 sm:px-6">
          <h2 className="mb-6 text-center text-lg font-semibold text-slate-900 dark:text-slate-100">
            {HOME_CONTENT.serviceContext.title}
          </h2>
          <ul className="flex flex-wrap justify-center gap-4">
            {HOME_CONTENT.serviceContext.items.map((item) => (
              <li
                key={item}
                className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"
              >
                <span
                  aria-hidden="true"
                  className="flex h-4 w-4 items-center justify-center"
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
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
