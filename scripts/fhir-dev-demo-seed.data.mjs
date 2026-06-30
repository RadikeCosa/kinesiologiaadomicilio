const DEMO_TAG_SYSTEM = "https://kinesiologiaadomicilio.local/fhir/tags";
const DEMO_TAG_CODE = "portfolio-demo-seed";
const DEMO_TAG_DISPLAY = "Portfolio demo seed";

const DNI_IDENTIFIER_SYSTEM = "https://kinesiologiaadomicilio.ar/fhir/sid/dni";
const DNI_IDENTIFIER_TYPE_CODING_SYSTEM = "http://terminology.hl7.org/CodeSystem/v2-0203";
const DNI_IDENTIFIER_TYPE_CODING_CODE = "NI";
const DNI_IDENTIFIER_TYPE_TEXT = "DNI";

const SIGNING_PRACTITIONER_SINGLETON_IDENTIFIER_SYSTEM =
  "https://kinesiologiaadomicilio.local/fhir/sid/signing-practitioner-config";
const SIGNING_PRACTITIONER_SINGLETON_IDENTIFIER_VALUE = "primary";
const PRACTITIONER_PROFESSIONAL_LICENSE_IDENTIFIER_SYSTEM =
  "https://kinesiologiaadomicilio.local/fhir/sid/professional-license";
const PRACTITIONER_SIGNATURE_DISPLAY_EXTENSION_URL =
  "https://kinesiologiaadomicilio.local/fhir/StructureDefinition/practitioner-signature-display";

const SERVICE_REQUEST_NOTE_PREFIXES = {
  reportedDiagnosis: "reported-diagnosis:v1:",
  requesterContact: "requester-contact:v1:",
  generalNote: "general-note:v1:",
  workflowStatus: "workflow-status:v1:",
  resolutionReason: "resolution-reason:v1:",
};

const EPISODE_CONTEXT_INITIAL_FUNCTIONAL_STATUS_EXTENSION_URL =
  "https://kinesiologiaadomicilio.local/fhir/StructureDefinition/episode-context-initial-functional-status";
const EPISODE_CONTEXT_THERAPEUTIC_GOALS_EXTENSION_URL =
  "https://kinesiologiaadomicilio.local/fhir/StructureDefinition/episode-context-therapeutic-goals";
const EPISODE_CONTEXT_FRAMEWORK_PLAN_EXTENSION_URL =
  "https://kinesiologiaadomicilio.local/fhir/StructureDefinition/episode-context-framework-plan";
const EPISODE_OF_CARE_CLOSURE_REASON_EXTENSION_URL =
  "https://kinesiologiaadomicilio.local/fhir/StructureDefinition/episodeofcare-closure-reason";
const EPISODE_OF_CARE_CLOSURE_DETAIL_EXTENSION_URL =
  "https://kinesiologiaadomicilio.local/fhir/StructureDefinition/episodeofcare-closure-detail";
const EPISODE_DIAGNOSIS_ROLE_SYSTEM =
  "https://kinesiologiaadomicilio.local/fhir/CodeSystem/episode-diagnosis-role";

const ENCOUNTER_CLINICAL_NOTE_EXTENSION_URLS = {
  subjective: "https://kinesiologiaadomicilio.local/fhir/StructureDefinition/encounter-clinical-subjective",
  objective: "https://kinesiologiaadomicilio.local/fhir/StructureDefinition/encounter-clinical-objective",
  intervention: "https://kinesiologiaadomicilio.local/fhir/StructureDefinition/encounter-clinical-intervention",
  assessment: "https://kinesiologiaadomicilio.local/fhir/StructureDefinition/encounter-clinical-assessment",
  tolerance: "https://kinesiologiaadomicilio.local/fhir/StructureDefinition/encounter-clinical-tolerance",
  homeInstructions: "https://kinesiologiaadomicilio.local/fhir/StructureDefinition/encounter-clinical-home-instructions",
  nextPlan: "https://kinesiologiaadomicilio.local/fhir/StructureDefinition/encounter-clinical-next-plan",
};
const ENCOUNTER_OPERATIONAL_PUNCTUALITY_EXTENSION_URL =
  "https://kinesiologiaadomicilio.local/fhir/StructureDefinition/encounter-operational-punctuality-status-v1";

const FUNCTIONAL_OBSERVATION_CODE_SYSTEM =
  "https://kinesiologiaadomicilio.local/fhir/CodeSystem/functional-observations";

const FUNCTIONAL_OBSERVATION_DEFINITIONS = {
  tug_seconds: {
    fhirCode: "tug-seconds",
    display: "Timed Up and Go (segundos)",
    unit: "s",
    quantitySystem: "http://unitsofmeasure.org",
    quantityCode: "s",
  },
  pain_nrs_0_10: {
    fhirCode: "pain-nrs-0-10",
    display: "Dolor NRS 0-10",
    unit: "score",
    quantityCode: "{score}",
  },
  standing_tolerance_minutes: {
    fhirCode: "standing-tolerance-minutes",
    display: "Tolerancia a bipedestacion (minutos)",
    unit: "min",
    quantitySystem: "http://unitsofmeasure.org",
    quantityCode: "min",
  },
  gait_duration_minutes: {
    fhirCode: "gait-duration-minutes",
    display: "Marcha (minutos)",
    unit: "min",
    quantitySystem: "http://unitsofmeasure.org",
    quantityCode: "min",
  },
};

function buildMeta() {
  return {
    tag: [
      {
        system: DEMO_TAG_SYSTEM,
        code: DEMO_TAG_CODE,
        display: DEMO_TAG_DISPLAY,
      },
    ],
  };
}

function buildDniIdentifier(dni) {
  return {
    system: DNI_IDENTIFIER_SYSTEM,
    value: String(dni),
    type: {
      coding: [
        {
          system: DNI_IDENTIFIER_TYPE_CODING_SYSTEM,
          code: DNI_IDENTIFIER_TYPE_CODING_CODE,
          display: DNI_IDENTIFIER_TYPE_TEXT,
        },
      ],
      text: DNI_IDENTIFIER_TYPE_TEXT,
    },
  };
}

function buildPatientReference(patientId) {
  return `Patient/${patientId}`;
}

function buildEpisodeReference(episodeId) {
  return `EpisodeOfCare/${episodeId}`;
}

function buildConditionReference(conditionId) {
  return `Condition/${conditionId}`;
}

function buildServiceRequestReference(serviceRequestId) {
  return `ServiceRequest/${serviceRequestId}`;
}

function buildEncounterReference(encounterId) {
  return `Encounter/${encounterId}`;
}

function withResourceId(resourceType, id, resource) {
  return {
    resourceType,
    id,
    meta: buildMeta(),
    ...resource,
  };
}

function buildPatientResource(patient) {
  const given = patient.firstName.split(/\s+/).filter(Boolean);
  const contact = patient.mainContact
    ? [{
      name: patient.mainContact.name ? { text: patient.mainContact.name } : undefined,
      relationship: patient.mainContact.relationship ? [{ text: patient.mainContact.relationship }] : undefined,
      telecom: patient.mainContact.phone ? [{ system: "phone", value: patient.mainContact.phone }] : undefined,
    }]
    : undefined;

  return withResourceId("Patient", patient.id, {
    identifier: patient.dni ? [buildDniIdentifier(patient.dni)] : undefined,
    name: [
      {
        family: patient.lastName,
        given,
        text: `${patient.firstName} ${patient.lastName}`,
      },
    ],
    telecom: patient.phone ? [{ system: "phone", value: patient.phone }] : undefined,
    gender: patient.gender,
    birthDate: patient.birthDate,
    address: patient.address ? [{ text: patient.address }] : undefined,
    contact,
  });
}

function buildServiceRequestNotes(serviceRequest) {
  const note = [];

  if (serviceRequest.reportedDiagnosisText) {
    note.push({
      text: `${SERVICE_REQUEST_NOTE_PREFIXES.reportedDiagnosis}${serviceRequest.reportedDiagnosisText}`,
    });
  }

  if (serviceRequest.requesterContact) {
    note.push({
      text: `${SERVICE_REQUEST_NOTE_PREFIXES.requesterContact}${serviceRequest.requesterContact}`,
    });
  }

  if (serviceRequest.notes) {
    note.push({
      text: `${SERVICE_REQUEST_NOTE_PREFIXES.generalNote}${serviceRequest.notes}`,
    });
  }

  if (serviceRequest.status === "accepted") {
    note.push({
      text: `${SERVICE_REQUEST_NOTE_PREFIXES.workflowStatus}accepted`,
    });
  }

  if (
    (serviceRequest.status === "closed_without_treatment" || serviceRequest.status === "cancelled")
    && serviceRequest.closedReasonText
  ) {
    note.push({
      text: `${SERVICE_REQUEST_NOTE_PREFIXES.resolutionReason}${serviceRequest.closedReasonText}`,
    });
  }

  return note.length ? note : undefined;
}

function mapServiceRequestStatus(status) {
  switch (status) {
    case "accepted":
    case "in_review":
      return "active";
    case "closed_without_treatment":
    case "cancelled":
      return "revoked";
    case "entered_in_error":
      return "entered-in-error";
    default:
      return "active";
  }
}

function buildServiceRequestResource(patientId, serviceRequest) {
  return withResourceId("ServiceRequest", serviceRequest.id, {
    status: mapServiceRequestStatus(serviceRequest.status),
    intent: "order",
    subject: {
      reference: buildPatientReference(patientId),
    },
    authoredOn: serviceRequest.requestedAt,
    reasonCode: [{ text: serviceRequest.reasonText }],
    requester: serviceRequest.requesterDisplay
      ? { display: serviceRequest.requesterDisplay }
      : undefined,
    statusReason: (
      serviceRequest.status === "closed_without_treatment" || serviceRequest.status === "cancelled"
    ) && serviceRequest.closedReasonText
      ? { text: serviceRequest.closedReasonText }
      : undefined,
    note: buildServiceRequestNotes(serviceRequest),
  });
}

function buildConditionResource(patientId, condition) {
  return withResourceId("Condition", condition.id, {
    subject: {
      reference: buildPatientReference(patientId),
    },
    code: {
      text: condition.text,
    },
    recordedDate: condition.recordedAt,
    clinicalStatus: {
      coding: [
        {
          system: "http://terminology.hl7.org/CodeSystem/condition-clinical",
          code: condition.clinicalStatus ?? "active",
        },
      ],
    },
  });
}

function buildEpisodeResource(patientId, episode) {
  const extensions = [];

  if (episode.initialFunctionalStatus) {
    extensions.push({
      url: EPISODE_CONTEXT_INITIAL_FUNCTIONAL_STATUS_EXTENSION_URL,
      valueString: episode.initialFunctionalStatus,
    });
  }

  if (episode.therapeuticGoals) {
    extensions.push({
      url: EPISODE_CONTEXT_THERAPEUTIC_GOALS_EXTENSION_URL,
      valueString: episode.therapeuticGoals,
    });
  }

  if (episode.frameworkPlan) {
    extensions.push({
      url: EPISODE_CONTEXT_FRAMEWORK_PLAN_EXTENSION_URL,
      valueString: episode.frameworkPlan,
    });
  }

  if (episode.status === "finished" && episode.closureReason) {
    extensions.push({
      url: EPISODE_OF_CARE_CLOSURE_REASON_EXTENSION_URL,
      valueCode: episode.closureReason,
    });
  }

  if (episode.status === "finished" && episode.closureDetail) {
    extensions.push({
      url: EPISODE_OF_CARE_CLOSURE_DETAIL_EXTENSION_URL,
      valueString: episode.closureDetail,
    });
  }

  return withResourceId("EpisodeOfCare", episode.id, {
    status: episode.status,
    patient: {
      reference: buildPatientReference(patientId),
    },
    period: {
      start: episode.startDate,
      end: episode.endDate,
    },
    referralRequest: episode.serviceRequestId
      ? [{ reference: buildServiceRequestReference(episode.serviceRequestId) }]
      : undefined,
    diagnosis: [
      {
        condition: { reference: buildConditionReference(episode.medicalConditionId) },
        role: {
          coding: [
            {
              system: EPISODE_DIAGNOSIS_ROLE_SYSTEM,
              code: "medical_reference",
            },
          ],
        },
      },
      {
        condition: { reference: buildConditionReference(episode.kinesiologicConditionId) },
        role: {
          coding: [
            {
              system: EPISODE_DIAGNOSIS_ROLE_SYSTEM,
              code: "kinesiologic_diagnosis",
            },
          ],
        },
      },
    ],
    extension: extensions.length ? extensions : undefined,
  });
}

function buildEncounterResource(patientId, episodeId, encounter) {
  const extensions = [];

  for (const [field, url] of Object.entries(ENCOUNTER_CLINICAL_NOTE_EXTENSION_URLS)) {
    const value = encounter.clinicalNote?.[field];
    if (value) {
      extensions.push({
        url,
        valueString: value,
      });
    }
  }

  if (encounter.visitStartPunctuality) {
    extensions.push({
      url: ENCOUNTER_OPERATIONAL_PUNCTUALITY_EXTENSION_URL,
      valueCode: encounter.visitStartPunctuality,
    });
  }

  return withResourceId("Encounter", encounter.id, {
    status: "finished",
    subject: {
      reference: buildPatientReference(patientId),
    },
    episodeOfCare: [
      {
        reference: buildEpisodeReference(episodeId),
      },
    ],
    period: {
      start: encounter.startedAt,
      end: encounter.endedAt,
    },
    extension: extensions.length ? extensions : undefined,
  });
}

function buildObservationResource(patientId, encounterId, observation) {
  const definition = FUNCTIONAL_OBSERVATION_DEFINITIONS[observation.code];

  return withResourceId("Observation", observation.id, {
    status: "final",
    subject: {
      reference: buildPatientReference(patientId),
    },
    encounter: {
      reference: buildEncounterReference(encounterId),
    },
    effectiveDateTime: observation.effectiveDateTime,
    code: {
      coding: [
        {
          system: FUNCTIONAL_OBSERVATION_CODE_SYSTEM,
          code: definition.fhirCode,
          display: definition.display,
        },
      ],
      text: definition.display,
    },
    valueQuantity: {
      value: observation.value,
      unit: definition.unit,
      system: definition.quantitySystem,
      code: definition.quantityCode,
    },
  });
}

function buildPractitionerResource(practitioner) {
  return withResourceId("Practitioner", practitioner.id, {
    active: true,
    identifier: [
      {
        system: SIGNING_PRACTITIONER_SINGLETON_IDENTIFIER_SYSTEM,
        value: SIGNING_PRACTITIONER_SINGLETON_IDENTIFIER_VALUE,
      },
      {
        system: PRACTITIONER_PROFESSIONAL_LICENSE_IDENTIFIER_SYSTEM,
        value: practitioner.licenseNumber,
        type: {
          text: "Matricula profesional",
        },
      },
    ],
    name: [
      {
        text: practitioner.fullName,
      },
    ],
    telecom: practitioner.professionalPhone
      ? [{
        system: "phone",
        use: "work",
        value: practitioner.professionalPhone,
      }]
      : undefined,
    qualification: [
      {
        code: {
          text: practitioner.roleTitle,
        },
        issuer: practitioner.licenseJurisdiction
          ? { display: practitioner.licenseJurisdiction }
          : undefined,
      },
    ],
    extension: practitioner.signatureDisplay
      ? [{
        url: PRACTITIONER_SIGNATURE_DISPLAY_EXTENSION_URL,
        valueString: practitioner.signatureDisplay,
      }]
      : undefined,
  });
}

export const DEMO_SIGNING_PRACTITIONER = {
  id: "demo-signing-practitioner",
  fullName: "Lic. Paula Demo",
  roleTitle: "Lic. en Kinesiologia",
  licenseNumber: "DEMO-0001",
  licenseJurisdiction: "Neuquen",
  signatureDisplay: "Lic. Paula Demo - Kinesiologia domiciliaria",
  professionalPhone: "+54 299 000 0100",
};

export const DEMO_PATIENT_SCENARIOS = [
  {
    code: "active_treatment",
    label: "Paciente en tratamiento activo",
    summary: "Solicitud aceptada, EpisodeOfCare activo, tres visitas, metricas y resumen compartible usable.",
    patient: {
      id: "demo-patient-active",
      firstName: "Alicia",
      lastName: "Ficticia",
      dni: "30000001",
      phone: "+54 299 000 0001",
      gender: "female",
      birthDate: "1948-04-14",
      address: "Domicilio Demo 1, Neuquen",
      mainContact: {
        name: "Lucia Demo",
        relationship: "child",
        phone: "+54 299 000 0101",
      },
    },
    serviceRequests: [
      {
        id: "demo-sr-active",
        requestedAt: "2026-06-10T09:00:00-03:00",
        requesterDisplay: "Lucia Demo",
        requesterContact: "+54 299 000 0101",
        reasonText: "Consulta por dolor de rodilla y menor seguridad para caminar dentro del domicilio.",
        reportedDiagnosisText: "Artrosis de rodilla",
        status: "accepted",
        notes: "Solicitud demo aceptada para seguimiento domiciliario.",
      },
    ],
    conditions: [
      {
        id: "demo-cond-active-medical",
        text: "Artrosis de rodilla",
        recordedAt: "2026-06-10",
      },
      {
        id: "demo-cond-active-kinesio",
        text: "Deficit de fuerza de miembros inferiores con alteracion del equilibrio.",
        recordedAt: "2026-06-12",
      },
    ],
    episode: {
      id: "demo-episode-active",
      status: "active",
      startDate: "2026-06-12",
      serviceRequestId: "demo-sr-active",
      medicalConditionId: "demo-cond-active-medical",
      kinesiologicConditionId: "demo-cond-active-kinesio",
      initialFunctionalStatus:
        "Ingresa con dolor al iniciar la marcha, tolerancia limitada a bipedestacion y necesidad de pausas breves en pasillo domiciliario.",
      therapeuticGoals:
        "Mejorar seguridad en transferencias, aumentar tolerancia a la marcha domiciliaria y disminuir dolor durante actividades funcionales.",
      frameworkPlan:
        "Trabajo progresivo de fuerza, equilibrio y marcha segura en domicilio con pauta breve para continuidad entre visitas.",
      encounters: [
        {
          id: "demo-enc-active-1",
          startedAt: "2026-06-12T10:00:00-03:00",
          endedAt: "2026-06-12T10:50:00-03:00",
          visitStartPunctuality: "delayed",
          clinicalNote: {
            subjective:
              "Refiere dolor al comenzar a caminar y sensacion de inestabilidad en giros dentro del hogar.",
            objective:
              "Se observa marcha lenta con apoyo en mobiliario y menor tolerancia a bipedestacion sostenida.",
            intervention:
              "Se trabajaron transferencias seguras, activacion de miembros inferiores y practica guiada de marcha corta.",
            assessment: "Responde con buena colaboracion y requiere pausas breves para recuperar comodidad.",
            tolerance: "Tolera la sesion completa con fatiga leve.",
            homeInstructions:
              "Repetir dos veces al dia los ejercicios indicados y realizar caminatas cortas con apoyo cercano.",
            nextPlan: "Progresar tiempo de marcha y revisar dolor al inicio del movimiento.",
          },
          observations: [
            { id: "demo-obs-active-1-tug", code: "tug_seconds", value: 22, effectiveDateTime: "2026-06-12T10:00:00-03:00" },
            { id: "demo-obs-active-1-pain", code: "pain_nrs_0_10", value: 7, effectiveDateTime: "2026-06-12T10:00:00-03:00" },
            { id: "demo-obs-active-1-stand", code: "standing_tolerance_minutes", value: 3, effectiveDateTime: "2026-06-12T10:00:00-03:00" },
            { id: "demo-obs-active-1-gait", code: "gait_duration_minutes", value: 4, effectiveDateTime: "2026-06-12T10:00:00-03:00" },
          ],
        },
        {
          id: "demo-enc-active-2",
          startedAt: "2026-06-17T10:00:00-03:00",
          endedAt: "2026-06-17T10:45:00-03:00",
          visitStartPunctuality: "on_time_or_minor_delay",
          clinicalNote: {
            subjective:
              "Refiere menor dolor en traslados cortos y mas confianza para pasar de la cama a la silla.",
            objective:
              "Se observa mejor control en transferencias y marcha mas continua con menos pausas.",
            intervention:
              "Se progresaron ejercicios de fuerza funcional, equilibrio asistido y marcha en trayecto domiciliario habitual.",
            assessment: "Evoluciona de manera favorable respecto de la visita inicial.",
            tolerance: "Tolera bien la progresion propuesta.",
            homeInstructions:
              "Mantener caminatas cortas distribuidas durante el dia y registrar momentos de mayor cansancio.",
            nextPlan: "Aumentar tiempo de marcha y trabajar cambios de direccion con mayor seguridad.",
          },
          observations: [
            { id: "demo-obs-active-2-tug", code: "tug_seconds", value: 18, effectiveDateTime: "2026-06-17T10:00:00-03:00" },
            { id: "demo-obs-active-2-pain", code: "pain_nrs_0_10", value: 5, effectiveDateTime: "2026-06-17T10:00:00-03:00" },
            { id: "demo-obs-active-2-stand", code: "standing_tolerance_minutes", value: 5, effectiveDateTime: "2026-06-17T10:00:00-03:00" },
            { id: "demo-obs-active-2-gait", code: "gait_duration_minutes", value: 6, effectiveDateTime: "2026-06-17T10:00:00-03:00" },
          ],
        },
        {
          id: "demo-enc-active-3",
          startedAt: "2026-06-24T09:30:00-03:00",
          endedAt: "2026-06-24T10:20:00-03:00",
          visitStartPunctuality: "on_time_or_minor_delay",
          clinicalNote: {
            subjective:
              "Refiere menor molestia al levantarse y mas tolerancia para caminar dentro del domicilio con pausas breves.",
            objective:
              "Se observa mejor continuidad de la marcha y mas seguridad en transferencias basicas.",
            intervention:
              "Se reforzaron ejercicios de fuerza, equilibrio y practica de marcha en circuito corto dentro del hogar.",
            assessment: "Mantiene tendencia favorable y gana autonomia funcional progresiva.",
            tolerance: "Tolera la sesion sin incidentes y con fatiga controlada.",
            homeInstructions:
              "Continuar rutina indicada una vez al dia y sostener caminatas cortas con descansos programados.",
            nextPlan: "Progresar velocidad de marcha y revisar tolerancia a recorridos un poco mas largos.",
          },
          observations: [
            { id: "demo-obs-active-3-tug", code: "tug_seconds", value: 15, effectiveDateTime: "2026-06-24T09:30:00-03:00" },
            { id: "demo-obs-active-3-pain", code: "pain_nrs_0_10", value: 4, effectiveDateTime: "2026-06-24T09:30:00-03:00" },
            { id: "demo-obs-active-3-stand", code: "standing_tolerance_minutes", value: 7, effectiveDateTime: "2026-06-24T09:30:00-03:00" },
            { id: "demo-obs-active-3-gait", code: "gait_duration_minutes", value: 8, effectiveDateTime: "2026-06-24T09:30:00-03:00" },
          ],
        },
      ],
    },
  },
  {
    code: "ready_to_start",
    label: "Paciente listo para iniciar",
    summary: "Solicitud aceptada y datos administrativos completos, sin EpisodeOfCare todavia.",
    patient: {
      id: "demo-patient-ready",
      firstName: "Bruno",
      lastName: "Portafolio",
      dni: "30000002",
      phone: "+54 299 000 0002",
      gender: "male",
      birthDate: "1956-08-02",
      address: "Domicilio Demo 2, Neuquen",
      mainContact: {
        name: "Marta Demo",
        relationship: "spouse",
        phone: "+54 299 000 0102",
      },
    },
    serviceRequests: [
      {
        id: "demo-sr-ready",
        requestedAt: "2026-06-26T15:00:00-03:00",
        requesterDisplay: "Marta Demo",
        requesterContact: "+54 299 000 0102",
        reasonText: "Consulta por desacondicionamiento fisico y menor tolerancia para caminar en domicilio.",
        reportedDiagnosisText: "Desacondicionamiento fisico",
        status: "accepted",
        notes: "Solicitud demo aceptada. Aun no se inicio EpisodeOfCare.",
      },
    ],
  },
  {
    code: "preliminary",
    label: "Paciente con datos incompletos",
    summary: "Solicitud en revision y datos administrativos incompletos para mantener estado preliminary.",
    patient: {
      id: "demo-patient-preliminary",
      firstName: "Carla",
      lastName: "Borrador",
      dni: undefined,
      phone: undefined,
      gender: "female",
      birthDate: "1964-11-21",
      address: undefined,
      mainContact: undefined,
    },
    serviceRequests: [
      {
        id: "demo-sr-preliminary",
        requestedAt: "2026-06-27T11:30:00-03:00",
        requesterDisplay: "Familiar demo",
        requesterContact: "+54 299 000 0103",
        reasonText: "Consulta inicial en revision por dificultad para movilizarse luego de una internacion reciente.",
        reportedDiagnosisText: "Desacondicionamiento fisico",
        status: "in_review",
        notes: "Faltan datos administrativos antes de resolver el inicio.",
      },
    ],
  },
  {
    code: "finished_treatment",
    label: "Paciente con tratamiento finalizado",
    summary: "Solicitud aceptada, EpisodeOfCare cerrado y visitas historicas con contexto clinico util para treatment y encounters.",
    patient: {
      id: "demo-patient-finished",
      firstName: "Diego",
      lastName: "Archivo",
      dni: "30000004",
      phone: "+54 299 000 0004",
      gender: "male",
      birthDate: "1951-02-19",
      address: "Domicilio Demo 4, Neuquen",
      mainContact: {
        name: "Sara Demo",
        relationship: "caregiver",
        phone: "+54 299 000 0104",
      },
    },
    serviceRequests: [
      {
        id: "demo-sr-finished",
        requestedAt: "2026-04-02T08:30:00-03:00",
        requesterDisplay: "Sara Demo",
        requesterContact: "+54 299 000 0104",
        reasonText: "Consulta por postoperatorio de reemplazo total de rodilla con necesidad de rehabilitacion domiciliaria.",
        reportedDiagnosisText: "Postoperatorio de reemplazo total de rodilla",
        status: "accepted",
        notes: "Solicitud demo aceptada y luego vinculada a tratamiento ya finalizado.",
      },
    ],
    conditions: [
      {
        id: "demo-cond-finished-medical",
        text: "Postoperatorio de reemplazo total de rodilla",
        recordedAt: "2026-04-02",
      },
      {
        id: "demo-cond-finished-kinesio",
        text: "Limitacion funcional para transferencias y marcha domiciliaria con disminucion de tolerancia al esfuerzo.",
        recordedAt: "2026-04-05",
      },
    ],
    episode: {
      id: "demo-episode-finished",
      status: "finished",
      startDate: "2026-04-05",
      endDate: "2026-05-03",
      serviceRequestId: "demo-sr-finished",
      closureReason: "goals_reached",
      closureDetail: "Cierre demo por objetivos funcionales basicos alcanzados.",
      medicalConditionId: "demo-cond-finished-medical",
      kinesiologicConditionId: "demo-cond-finished-kinesio",
      initialFunctionalStatus:
        "Inicia con marcha domiciliaria muy limitada, dolor en actividades basicas y necesidad de asistencia para transferencias.",
      therapeuticGoals:
        "Disminuir dolor, mejorar seguridad en transferencias y favorecer independencia para la marcha dentro del hogar.",
      frameworkPlan:
        "Plan breve de movilidad, fuerza funcional y practica de marcha progresiva con pautas simples para continuidad diaria.",
      encounters: [
        {
          id: "demo-enc-finished-1",
          startedAt: "2026-04-08T09:00:00-03:00",
          endedAt: "2026-04-08T09:50:00-03:00",
          visitStartPunctuality: "on_time_or_minor_delay",
          clinicalNote: {
            subjective:
              "Refiere dolor moderado al movilizarse y temor a apoyar por tiempos prolongados.",
            objective:
              "Se observa rigidez inicial y marcha muy corta dentro del domicilio con pausas frecuentes.",
            intervention:
              "Se trabajaron movilidad suave, ejercicios activos asistidos y practica de transferencias basicas.",
            assessment: "Responde con buena tolerancia a la carga propuesta.",
            tolerance: "Tolera la sesion con cansancio controlado.",
            homeInstructions: "Continuar movilidad suave y pausas activas cortas varias veces al dia.",
            nextPlan: "Aumentar seguridad en apoyo y marcha corta.",
          },
          observations: [
            { id: "demo-obs-finished-1-tug", code: "tug_seconds", value: 28, effectiveDateTime: "2026-04-08T09:00:00-03:00" },
            { id: "demo-obs-finished-1-pain", code: "pain_nrs_0_10", value: 8, effectiveDateTime: "2026-04-08T09:00:00-03:00" },
            { id: "demo-obs-finished-1-stand", code: "standing_tolerance_minutes", value: 2, effectiveDateTime: "2026-04-08T09:00:00-03:00" },
            { id: "demo-obs-finished-1-gait", code: "gait_duration_minutes", value: 3, effectiveDateTime: "2026-04-08T09:00:00-03:00" },
          ],
        },
        {
          id: "demo-enc-finished-2",
          startedAt: "2026-05-02T09:00:00-03:00",
          endedAt: "2026-05-02T09:45:00-03:00",
          visitStartPunctuality: "on_time_or_minor_delay",
          clinicalNote: {
            subjective:
              "Refiere menos dolor y mejor autonomia para desplazamientos cortos dentro del domicilio.",
            objective:
              "Se observa mejor seguridad para transferencias y marcha corta continua con menos pausas.",
            intervention:
              "Se reforzaron ejercicios funcionales, equilibrio y practica de marcha con giros controlados.",
            assessment: "Alcanza objetivos funcionales basicos propuestos para el domicilio.",
            tolerance: "Tolera adecuadamente el trabajo final del ciclo.",
            homeInstructions:
              "Sostener rutina de movilidad y caminatas cortas segun tolerancia.",
            nextPlan: "Continuar seguimiento autonomo y consultar si reaparece limitacion relevante.",
          },
          observations: [
            { id: "demo-obs-finished-2-tug", code: "tug_seconds", value: 16, effectiveDateTime: "2026-05-02T09:00:00-03:00" },
            { id: "demo-obs-finished-2-pain", code: "pain_nrs_0_10", value: 3, effectiveDateTime: "2026-05-02T09:00:00-03:00" },
            { id: "demo-obs-finished-2-stand", code: "standing_tolerance_minutes", value: 7, effectiveDateTime: "2026-05-02T09:00:00-03:00" },
            { id: "demo-obs-finished-2-gait", code: "gait_duration_minutes", value: 8, effectiveDateTime: "2026-05-02T09:00:00-03:00" },
          ],
        },
      ],
    },
  },
  {
    code: "closed_without_treatment",
    label: "Paciente con solicitud cancelada",
    summary: "Solicitud cerrada sin EpisodeOfCare para representar un caso resuelto sin inicio de tratamiento.",
    patient: {
      id: "demo-patient-cancelled",
      firstName: "Elena",
      lastName: "Demo",
      dni: "30000005",
      phone: "+54 299 000 0005",
      gender: "female",
      birthDate: "1970-09-09",
      address: "Domicilio Demo 5, Neuquen",
      mainContact: {
        name: "Pablo Demo",
        relationship: "sibling",
        phone: "+54 299 000 0105",
      },
    },
    serviceRequests: [
      {
        id: "demo-sr-cancelled",
        requestedAt: "2026-06-03T13:15:00-03:00",
        requesterDisplay: "Pablo Demo",
        requesterContact: "+54 299 000 0105",
        reasonText: "Consulta por seguimiento funcional que finalmente no se coordinara en domicilio.",
        reportedDiagnosisText: "Secuela motora posterior a ACV",
        status: "cancelled",
        closedReasonText: "Solicitud demo cancelada por decision familiar antes de iniciar tratamiento.",
        notes: "Caso demo cerrado sin EpisodeOfCare.",
      },
    ],
  },
  {
    code: "active_light",
    label: "Paciente con contexto completo y pocas visitas",
    summary: "Caso opcional con EpisodeOfCare activo, contexto clinico completo y una sola visita inicial.",
    patient: {
      id: "demo-patient-light",
      firstName: "Fabian",
      lastName: "Contexto",
      dni: "30000006",
      phone: "+54 299 000 0006",
      gender: "male",
      birthDate: "1959-12-01",
      address: "Domicilio Demo 6, Neuquen",
      mainContact: {
        name: "Nora Demo",
        relationship: "caregiver",
        phone: "+54 299 000 0106",
      },
    },
    serviceRequests: [
      {
        id: "demo-sr-light",
        requestedAt: "2026-06-28T10:45:00-03:00",
        requesterDisplay: "Nora Demo",
        requesterContact: "+54 299 000 0106",
        reasonText: "Consulta por secuela motora y necesidad de organizacion inicial del tratamiento domiciliario.",
        reportedDiagnosisText: "Secuela motora posterior a ACV",
        status: "accepted",
        notes: "Caso demo con tratamiento recientemente iniciado.",
      },
    ],
    conditions: [
      {
        id: "demo-cond-light-medical",
        text: "Secuela motora posterior a ACV",
        recordedAt: "2026-06-28",
      },
      {
        id: "demo-cond-light-kinesio",
        text: "Disminucion de tolerancia al esfuerzo con limitacion funcional para marcha domiciliaria.",
        recordedAt: "2026-06-29",
      },
    ],
    episode: {
      id: "demo-episode-light",
      status: "active",
      startDate: "2026-06-29",
      serviceRequestId: "demo-sr-light",
      medicalConditionId: "demo-cond-light-medical",
      kinesiologicConditionId: "demo-cond-light-kinesio",
      initialFunctionalStatus:
        "Ingresa con necesidad de supervison cercana para marcha corta y cansancio rapido en recorridos domiciliarios.",
      therapeuticGoals:
        "Favorecer independencia en actividades basicas, mejorar tolerancia al esfuerzo y ordenar la marcha dentro del hogar.",
      frameworkPlan:
        "Plan inicial de movilidad, equilibrio y marcha segura con consignas simples para continuidad entre visitas.",
      encounters: [
        {
          id: "demo-enc-light-1",
          startedAt: "2026-06-29T11:00:00-03:00",
          endedAt: "2026-06-29T11:40:00-03:00",
          visitStartPunctuality: "on_time_or_minor_delay",
          clinicalNote: {
            subjective:
              "Refiere cansancio rapido al caminar y necesidad de organizar mejor los trayectos dentro del hogar.",
            objective:
              "Se observa marcha corta con supervision cercana y necesidad de pausas frecuentes.",
            intervention:
              "Se trabajaron ejercicios iniciales de equilibrio, transferencias y marcha guiada en trayecto breve.",
            assessment: "Buen primer contacto y comprension de consignas simples.",
            tolerance: "Tolera la sesion inicial con descansos programados.",
            homeInstructions:
              "Practicar trayectos cortos con supervision y repetir consignas simples una vez al dia.",
            nextPlan: "Completar primeras progresiones de equilibrio y revisar autonomia en marcha corta.",
          },
          observations: [
            { id: "demo-obs-light-1-tug", code: "tug_seconds", value: 24, effectiveDateTime: "2026-06-29T11:00:00-03:00" },
            { id: "demo-obs-light-1-pain", code: "pain_nrs_0_10", value: 3, effectiveDateTime: "2026-06-29T11:00:00-03:00" },
            { id: "demo-obs-light-1-stand", code: "standing_tolerance_minutes", value: 4, effectiveDateTime: "2026-06-29T11:00:00-03:00" },
            { id: "demo-obs-light-1-gait", code: "gait_duration_minutes", value: 3, effectiveDateTime: "2026-06-29T11:00:00-03:00" },
          ],
        },
      ],
    },
  },
];

export function buildDemoFhirResourceGroups() {
  const practitioner = [buildPractitionerResource(DEMO_SIGNING_PRACTITIONER)];
  const patients = DEMO_PATIENT_SCENARIOS.map((scenario) => buildPatientResource(scenario.patient));
  const serviceRequests = DEMO_PATIENT_SCENARIOS.flatMap((scenario) =>
    (scenario.serviceRequests ?? []).map((serviceRequest) => buildServiceRequestResource(scenario.patient.id, serviceRequest)),
  );
  const conditions = DEMO_PATIENT_SCENARIOS.flatMap((scenario) =>
    (scenario.conditions ?? []).map((condition) => buildConditionResource(scenario.patient.id, condition)),
  );
  const episodes = DEMO_PATIENT_SCENARIOS.flatMap((scenario) =>
    scenario.episode ? [buildEpisodeResource(scenario.patient.id, scenario.episode)] : [],
  );
  const encounters = DEMO_PATIENT_SCENARIOS.flatMap((scenario) =>
    scenario.episode
      ? scenario.episode.encounters.map((encounter) =>
        buildEncounterResource(scenario.patient.id, scenario.episode.id, encounter))
      : [],
  );
  const observations = DEMO_PATIENT_SCENARIOS.flatMap((scenario) =>
    scenario.episode
      ? scenario.episode.encounters.flatMap((encounter) =>
        encounter.observations.map((observation) =>
          buildObservationResource(scenario.patient.id, encounter.id, observation)))
      : [],
  );

  return {
    practitioner,
    patients,
    serviceRequests,
    conditions,
    episodes,
    encounters,
    observations,
  };
}

export function buildDemoFhirResourcesFlat() {
  const groups = buildDemoFhirResourceGroups();

  return [
    ...groups.practitioner,
    ...groups.patients,
    ...groups.serviceRequests,
    ...groups.conditions,
    ...groups.episodes,
    ...groups.encounters,
    ...groups.observations,
  ];
}
