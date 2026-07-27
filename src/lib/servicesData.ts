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
  whenToConsult: string[];
  evaluates: string[];
  goal: string;
  whatsappMessage: string;
}

export const servicesData: Service[] = [
  {
    title: "Rehabilitación postoperatoria",
    shortTitle: "Rehab post-operatoria",
    description:
      "Acompañamiento en domicilio durante la recuperación posterior a una cirugía.",
    whenToConsult: [
      "Cuando cuesta movilizarse, levantarse o retomar actividades después de una cirugía.",
    ],
    evaluates: [
      "Movilidad, dolor, fuerza, marcha y uso de apoyos si corresponden.",
    ],
    goal:
      "Favorecer una recuperación progresiva según los objetivos de cada caso.",
    whatsappMessage: WHATSAPP_POST_OPERATIVE_MESSAGE,
  },
  {
    title: "Adultos Mayores",
    shortTitle: "Adultos mayores",
    description:
      "Atención kinesiológica para sostener o recuperar movilidad y seguridad en casa.",
    whenToConsult: [
      "Cuando caminar, levantarse o realizar transferencias se vuelve más difícil.",
    ],
    evaluates: [
      "Equilibrio, fuerza, marcha, autonomía y necesidades de acompañamiento.",
    ],
    goal:
      "Trabajar sobre la movilidad posible sin presentar el envejecimiento como enfermedad.",
    whatsappMessage: WHATSAPP_OLDER_ADULTS_MESSAGE,
  },
  {
    title: "Cuidados Paliativos",
    shortTitle: "Cuidados paliativos",
    description:
      "Acompañamiento kinésico prudente cuando el foco está en confort y movilidad posible.",
    whenToConsult: [
      "Cuando una enfermedad compleja limita la movilidad o aumenta el tiempo en cama.",
    ],
    evaluates: [
      "Confort, tolerancia, movilidad posible y riesgos asociados a inmovilidad.",
    ],
    goal:
      "Adaptar objetivos sin reemplazar al equipo médico ni prometer resultados cerrados.",
    whatsappMessage: WHATSAPP_PALLIATIVE_CARE_MESSAGE,
  },
  {
    title: "Recuperación Funcional",
    shortTitle: "Recuperación funcional",
    description:
      "Sesiones para adultos con movilidad reducida, debilidad, dolor o inactividad.",
    whenToConsult: [
      "Después de internación, reposo o dificultad para retomar actividades cotidianas.",
    ],
    evaluates: [
      "Movilidad, dolor, fuerza, tolerancia y actividades que se buscan recuperar.",
    ],
    goal:
      "Acompañar una recuperación gradual según condición clínica y objetivos personales.",
    whatsappMessage: WHATSAPP_FUNCTIONAL_RECOVERY_MESSAGE,
  },
];
