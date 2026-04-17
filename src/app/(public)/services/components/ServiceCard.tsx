import { WhatsAppButton } from "@/components/WhatsAppButton";
import type { Service } from "@/lib/servicesData";

interface ServiceCardProps {
  service: Service;
}

export function ServiceCard({ service }: ServiceCardProps) {
  return (
    <div className="flex flex-col rounded-2xl bg-white p-8 shadow-lg ring-1 ring-slate-200 transition-all hover:shadow-xl dark:bg-neutral-800 dark:ring-neutral-700">
      <h2 className="text-xl font-semibold leading-snug tracking-tight text-slate-900 dark:text-slate-100">
        {service.title}
      </h2>
      <p className="mt-3 flex-auto text-base leading-7 text-slate-600 dark:text-slate-300">
        {service.description}
      </p>
      <WhatsAppButton
        message={service.whatsappMessage}
        ctaLocation="services"
        className="mt-8 self-start"
        variant="whatsapp"
        size="sm"
        iconSize="h-4 w-4"
      >
        Consultar
      </WhatsAppButton>
    </div>
  );
}
