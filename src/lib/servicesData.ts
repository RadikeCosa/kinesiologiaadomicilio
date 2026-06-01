import {
  WHATSAPP_FUNCTIONAL_RECOVERY_MESSAGE,
  WHATSAPP_OLDER_ADULTS_MESSAGE,
  WHATSAPP_PALLIATIVE_CARE_MESSAGE,
  WHATSAPP_POST_OPERATIVE_MESSAGE,
} from "@/lib/whatsapp-messages";

export interface Service {
  title: string;
  shortTitle?: string;
  description: string;
  whatsappMessage: string;
}

export const servicesData: Service[] = [
  {
    title: "Rehabilitación Post-operatoria",
    shortTitle: "Rehab post-operatoria",
    description:
      "Acompañamiento en los primeros días y semanas después de una operación. Ramiro trabaja la movilización temprana, el uso de elementos de apoyo y los cuidados prácticos para que la recuperación sea segura y progresiva.",
    whatsappMessage: WHATSAPP_POST_OPERATIVE_MESSAGE,
  },
  {
    title: "Adultos Mayores",
    shortTitle: "Adultos mayores",
    description:
      "Atención kinesiológica y de fisioterapia a domicilio para personas mayores que necesitan recuperar o mantener su movilidad, fuerza e independencia. Un acompañamiento pensado también para dar tranquilidad a la familia.",
    whatsappMessage: WHATSAPP_OLDER_ADULTS_MESSAGE,
  },
  {
    title: "Cuidados Paliativos",
    shortTitle: "Cuidados paliativos",
    description:
      "Cuidados kinesicos orientados al bienestar y el confort en situaciones de cuidados paliativos.",
    whatsappMessage: WHATSAPP_PALLIATIVE_CARE_MESSAGE,
  },
  {
    title: "Recuperación Funcional",
    shortTitle: "Recuperación funcional",
    description:
      "Sesiones de kinesiología y rehabilitación a domicilio para adultos con dolor crónico, movilidad reducida o que buscan recuperar funcionalidad en su vida cotidiana.",
    whatsappMessage: WHATSAPP_FUNCTIONAL_RECOVERY_MESSAGE,
  },
];
