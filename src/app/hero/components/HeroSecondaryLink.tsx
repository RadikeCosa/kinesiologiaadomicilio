import Link from "next/link";

export function HeroSecondaryLink() {
  return (
    <Link
      href="/services"
      className="inline-flex items-center justify-center rounded-full border border-slate-300 px-8 py-3 text-base font-semibold text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-neutral-800"
    >
      Ver servicios
    </Link>
  );
}
