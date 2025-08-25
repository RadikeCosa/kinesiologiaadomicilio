import Link from "next/link";
import type { Service } from "../types/Service";

interface ServiceCardProps {
  service: Service;
}

export function ServiceCard({ service }: ServiceCardProps) {
  return (
    <div className="flex flex-col rounded-2xl bg-white p-8 shadow-lg ring-1 ring-slate-200 dark:bg-neutral-800 dark:ring-neutral-700">
      <div className="flex items-center gap-4">
        <span className="text-2xl" aria-hidden="true">
          {service.icon}
        </span>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          {service.title}
        </h2>
      </div>
      <p className="mt-4 flex-auto text-base leading-7 text-slate-600 dark:text-slate-300">
        {service.description}
      </p>
      <Link
        href={service.href}
        className="mt-6 inline-flex items-center justify-center rounded-full bg-sky-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
      >
        Ver detalles
        <span className="ml-2" aria-hidden="true">
          →
        </span>
      </Link>
    </div>
  );
}
