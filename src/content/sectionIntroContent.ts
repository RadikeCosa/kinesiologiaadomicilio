interface SectionIntroContent {
  title: string;
  description: string;
}

export const SECTION_INTRO_CONTENT: {
  homeServicesPreview: SectionIntroContent;
  servicesPage: SectionIntroContent;
} = {
  homeServicesPreview: {
    title: "Nuestros Servicios",
    description:
      "Atención kinesiológica especializada en tu hogar con equipamiento profesional",
  },
  servicesPage: {
    title: "Servicios de kinesiología a domicilio",
    description:
      "Ofrecemos atención kinesiológica especializada en la comodidad de tu hogar. Cada sesión está diseñada según las necesidades específicas del paciente, con equipamiento profesional y técnicas actualizadas para garantizar una recuperación efectiva y segura.",
  },
};
