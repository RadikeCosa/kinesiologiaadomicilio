import { WHATSAPP_EVALUAR_MESSAGE } from "@/lib/whatsapp-messages";

export const EVALUAR_CONTENT = {
  headline: "¿Me puede ayudar un kinesiólogo a domicilio?",
  subtitle:
    "Elegí la situación que más se parezca a la tuya o la de tu familiar para orientarte sobre kinesiología y rehabilitación a domicilio en Neuquén.",
  backLabel: "Volver a elegir otra opción",
  branches: [
    {
      id: "inactividad",
      optionLabel:
        "Estuve mucho tiempo inactivo y quiero volver a moverme con más seguridad",
      resultTitle:
        "Sí, este tipo de atención puede ayudarte a retomar movimiento de forma progresiva",
      resultText:
        "Después de un tiempo prolongado de inactividad, es habitual perder fuerza, estabilidad y confianza para moverse. La kinesiología a domicilio puede ayudar a recuperar movilidad y seguridad de manera gradual, adaptada al momento y al entorno real de la persona.",
      ctaLabel: "Consultar por una primera evaluación en domicilio",
      whatsappMessage: WHATSAPP_EVALUAR_MESSAGE,
    },
    {
      id: "recuperacion-reciente",
      optionLabel:
        "Tuve una cirugía, una internación o un período de reposo reciente y necesito recuperar movilidad e independencia",
      resultTitle:
        "Sí, puede ser un muy buen momento para acompañar la recuperación en casa",
      resultText:
        "Después de una cirugía, una internación o un período de reposo, muchas personas necesitan apoyo para recuperar movilidad, fuerza y mayor independencia en sus actividades diarias. La atención en domicilio permite trabajar esa recuperación en el contexto real de la persona.",
      ctaLabel: "Consultar por una primera evaluación en domicilio",
      whatsappMessage: WHATSAPP_EVALUAR_MESSAGE,
    },
    {
      id: "movilidad-autonomia",
      optionLabel:
        "Por la edad o el paso del tiempo, a mí o a mi familiar nos cuesta más caminar, movernos o manejarnos en casa",
      resultTitle:
        "Sí, la atención en domicilio puede ayudar cuando empezar a moverse cuesta más",
      resultText:
        "Cuando caminar, trasladarse o realizar actividades cotidianas se vuelve más difícil, una intervención en domicilio puede ser útil para trabajar movilidad, equilibrio, seguridad y mayor autonomía. Hacerlo en casa además permite adaptar mejor la atención a la realidad diaria de la persona.",
      ctaLabel: "Consultar por una primera evaluación en domicilio",
      whatsappMessage: WHATSAPP_EVALUAR_MESSAGE,
    },
    {
      id: "salud-compleja",
      optionLabel:
        "Estamos atravesando una enfermedad compleja, oncológica o una situación donde el objetivo principal es el confort en casa",
      resultTitle:
        "En estos casos, el acompañamiento en domicilio puede ser valioso según la situación concreta",
      resultText:
        "Cuando hay una situación de salud compleja, muchas veces el foco está en acompañar el movimiento posible, facilitar cuidados, mejorar el confort y sostener la mejor calidad de vida en casa. La atención kinesiológica a domicilio puede formar parte de ese acompañamiento, de acuerdo con el momento y las necesidades del caso.",
      ctaLabel: "Consultar por este caso en domicilio",
      whatsappMessage: WHATSAPP_EVALUAR_MESSAGE,
    },
    {
      id: "no-estoy-seguro",
      optionLabel:
        "No estoy seguro de cuál opción encaja, pero quiero consultar por mi caso o el de un familiar",
      resultTitle:
        "No hace falta tener todo resuelto para saber si este servicio puede encajar",
      resultText:
        "Muchas personas llegan con la misma duda: no saben si la atención kinesiológica a domicilio corresponde, si este es el momento indicado o si el caso realmente encaja. Con una breve descripción de la situación ya se puede evaluar mejor si tiene sentido coordinar una primera visita.",
      ctaLabel: "Consultar por este caso en domicilio",
      whatsappMessage: WHATSAPP_EVALUAR_MESSAGE,
    },
  ],
} as const;
