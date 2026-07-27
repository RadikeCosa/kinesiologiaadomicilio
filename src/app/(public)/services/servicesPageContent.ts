import { WHATSAPP_SERVICES_GENERAL_MESSAGE } from "@/lib/whatsapp-messages";

export const SERVICES_PAGE_CONTENT = {
  intro: {
    title: "Servicios y situaciones atendidas a domicilio",
    description:
      "Esta página explica en qué situaciones puede corresponder una evaluación kinesiológica a domicilio en Neuquén Capital y qué aspectos se consideran antes de iniciar un tratamiento.",
  },
  situations: {
    title: "Situaciones que pueden motivar una consulta",
    lead:
      "Puede ser útil consultar cuando una dificultad funcional empieza a limitar la movilidad, la seguridad o la autonomía en casa. Cada caso se evalúa según la situación funcional y clínica.",
    items: [
      "Recuperación luego de una cirugía, internación o período de reposo.",
      "Pérdida de movilidad, autonomía o confianza para moverse.",
      "Dificultad para caminar, levantarse, girar en cama o realizar transferencias.",
      "Disminución de fuerza, equilibrio o tolerancia al esfuerzo.",
      "Necesidad de acompañamiento funcional en adultos mayores.",
      "Acompañamiento kinésico dentro de cuidados paliativos.",
    ],
  },
  services: {
    title: "Servicios actuales",
    lead:
      "Los servicios se orientan a adultos y adultos mayores. La primera evaluación ayuda a definir si corresponde iniciar tratamiento y con qué objetivos generales.",
  },
  evaluation: {
    title: "Cómo se evalúa cada caso",
    description:
      "Antes de definir un plan se consideran la edad, la situación general, el motivo de consulta, el diagnóstico o indicación médica si existe, la movilidad actual, el dolor, la capacidad para caminar o levantarse, el domicilio o zona y los objetivos de la persona y su familia.",
    note:
      "La frecuencia, duración y objetivos del tratamiento se definen según la evaluación inicial y la evolución de cada caso.",
  },
  faq: {
    title: "Preguntas frecuentes sobre atención a domicilio en Neuquén",
    items: [
      {
        question: "¿La atención es particular?",
        answer:
          "Sí. La modalidad actual es particular, sin obra social. Por WhatsApp se informa la forma de trabajo y el valor de la consulta.",
      },
      {
        question: "¿En qué zona se realiza?",
        answer:
          "La atención se coordina en Neuquén Capital y zonas cercanas según disponibilidad y logística del día.",
      },
      {
        question: "¿Hace falta una orden médica?",
        answer:
          "Si existe una indicación médica, conviene compartirla. En algunas situaciones puede ser necesario consultar o reevaluar con el equipo médico antes de iniciar.",
      },
      {
        question: "¿Qué ocurre en la primera evaluación?",
        answer:
          "Se revisa el motivo de consulta, movilidad, dolor, fuerza, marcha, transferencias y objetivos de la persona y su familia.",
      },
      {
        question: "¿Cómo se define la frecuencia?",
        answer:
          "La frecuencia y duración no se definen de antemano: dependen de la evaluación inicial, la situación clínica y la evolución.",
      },
      {
        question: "¿Qué información conviene enviar por WhatsApp?",
        answer:
          "Edad aproximada, motivo principal, situación funcional actual, barrio o zona de Neuquén Capital y si hay indicación médica previa.",
      },
    ],
  },
  consultationCta: {
    title: "¿Querés consultar por una situación concreta?",
    description:
      "Contá brevemente edad aproximada, motivo, situación funcional y barrio o zona para orientar la primera respuesta.",
    ctaLabel: "Consultar por WhatsApp",
    evaluationLinkLabel: "¿No estás seguro? Hacé una evaluación rápida",
    whatsappMessage: WHATSAPP_SERVICES_GENERAL_MESSAGE,
  },
} as const;
