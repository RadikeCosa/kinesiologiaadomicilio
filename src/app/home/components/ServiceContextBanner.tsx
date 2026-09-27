import { HOME_CONTENT } from "@/app/home/homeContent";
import { Container } from "@/components/ui/Container";

export function ServiceContextBanner() {
  return (
    <section
      aria-label={HOME_CONTENT.serviceContext.title}
      className="py-7 sm:py-10"
    >
      <Container className="max-w-6xl">
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-800 sm:px-6">
          <h2 className="mb-6 text-center text-lg font-semibold text-slate-900 dark:text-slate-100">
            {HOME_CONTENT.serviceContext.title}
          </h2>
          <ul className="flex flex-wrap justify-center gap-4">
            {HOME_CONTENT.serviceContext.items.map((item) => (
              <li
                key={item}
                className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200"
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
                    className="h-4 w-4 text-emerald-800 dark:text-emerald-300"
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
