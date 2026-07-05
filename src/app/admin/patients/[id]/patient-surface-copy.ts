export const PATIENT_SURFACE_COPY = {
  requestDefinition: "Pedido inicial para evaluar si corresponde iniciar atención. Aceptarla no inicia el tratamiento por sí sola.",
  treatmentDefinition: "Ciclo de atención profesional iniciado desde una solicitud aceptada; puede estar activo o finalizado.",
  clinicalDefinition: "Registrá y consultá las visitas realizadas durante el tratamiento.",
  requestCreatedTitle: "Solicitud registrada",
  requestCreatedDescription:
    "La consulta inicial quedó cargada. Revisá la solicitud para decidir si avanza, se cancela o se cierra sin iniciar tratamiento.",
  nextRequestStepTitle: "Próximo paso recomendado",
  nextRequestStepDescription: "Registrá la solicitud de atención para dejar asentado quién consulta, el motivo del pedido y la fecha de la consulta inicial.",
  reviewRequestTitle: "Solicitud pendiente de revisión",
  reviewRequestDescription: "Hay una solicitud de atención cargada. Revisala para aceptarla, cancelarla o cerrarla sin iniciar tratamiento.",
  acceptedRequestTitle: "Solicitud aceptada pendiente",
  acceptedRequestDescription: "La solicitud ya fue aceptada. Falta iniciar el tratamiento para habilitar el registro de visitas.",
  activeTreatmentTitle: "Tratamiento activo",
  flowDefinition:
    "Primero se resuelve la solicitud; luego se inicia tratamiento; con tratamiento activo se registran visitas.",
} as const;
