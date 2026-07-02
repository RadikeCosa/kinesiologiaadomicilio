export const PATIENT_SURFACE_COPY = {
  requestDefinition: "Pedido inicial para evaluar si corresponde iniciar atención. Aceptarla no inicia el tratamiento por sí sola.",
  treatmentDefinition: "Ciclo de atención profesional iniciado desde una solicitud aceptada; puede estar activo o finalizado.",
  clinicalDefinition: "Registrá y consultá las visitas realizadas durante el tratamiento.",
  flowDefinition:
    "Primero se resuelve la solicitud; luego se inicia tratamiento; con tratamiento activo se registran visitas.",
} as const;
