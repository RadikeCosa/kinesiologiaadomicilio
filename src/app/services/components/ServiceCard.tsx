import { WhatsAppButton } from "@/components/WhatsAppButton";
import type { Service } from "../types/Service";

interface ServiceCardProps {
  service: Service;
}

export function ServiceCard({ service }: ServiceCardProps) {
  return (
    <div className="flex flex-col items-center text-center rounded-2xl bg-white p-8 shadow-lg ring-1 ring-slate-200 dark:bg-neutral-800 dark:ring-neutral-700 transition-all hover:shadow-xl">
      <div className="flex flex-col items-center gap-3">
        <span className="text-3xl" aria-hidden="true">
          {service.icon}
        </span>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          {service.title}
        </h2>
      </div>
      <p className="mt-4 flex-auto text-base leading-7 text-slate-600 dark:text-slate-300">
        {service.description}
      </p>
      <WhatsAppButton
        message={service.whatsappMessage}
        ctaLocation="services"
        className="mt-6"
        variant="whatsapp"
        size="sm"
        iconSize="h-4 w-4"
      >
        Consultar
      </WhatsAppButton>
    </div>
  );
}
