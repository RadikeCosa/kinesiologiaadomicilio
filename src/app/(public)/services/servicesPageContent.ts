import { WHATSAPP_GENERAL_MESSAGE } from "@/lib/whatsapp-messages";

export const SERVICES_PAGE_CONTENT = {
  intro: {
    title: "Servicios de kinesiología a domicilio en Neuquén",
    description:
      "Brindamos kinesiología a domicilio en Neuquén Capital y zonas cercanas según disponibilidad, con enfoque de rehabilitación a domicilio y fisioterapia como complemento terapéutico. La atención está orientada a adultos y adultos mayores en postoperatorios, cuidados paliativos y recuperación funcional, con evaluación inicial y seguimiento personalizado.",
  },
  consultationCta: {
    title: "¿Tenés dudas sobre qué servicio necesitás?",
    description:
      "Contactanos por WhatsApp para una consulta personalizada sin compromiso.",
    ctaLabel: "Consultá por WhatsApp",
    evaluationLinkLabel: "¿No estás seguro? Hacé una evaluación rápida",
    whatsappMessage: WHATSAPP_GENERAL_MESSAGE,
  },
} as const;
