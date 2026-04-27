# Solicitud de atención — flujo inicial y encaje funcional

> Estado: borrador de discusión  
> Fecha: 2026-04-27  
> Alcance: hipótesis funcional/producto previa a auditoría e implementación

## 1) Propósito del documento

Este documento ordena la hipótesis funcional para incorporar una **solicitud inicial de atención** en la app clínica privada.

La intención no es implementar todavía `ServiceRequest`, sino definir primero:

- qué problema de producto resuelve;
- cómo se inserta en el flujo real de trabajo;
- qué superficies privadas podría impactar;
- qué estados operativos nuevos podrían aparecer;
- qué debería entrar en una primera versión;
- qué decisiones quedan pendientes antes de auditar e implementar.

Este documento es deliberadamente previo a una auditoría técnica/FHIR.

---

## 2) Problema de producto

El flujo privado actual cubre principalmente:

\`\`\`text
Patient → EpisodeOfCare → Encounter
\`\`\`

Es decir:

\`\`\`text
Paciente → Tratamiento → Visitas
\`\`\`

Ese flujo funciona cuando el paciente ya está listo para iniciar tratamiento, pero no representa bien la etapa previa de la vida real:

\`\`\`text
Me contactan → registro la consulta/solicitud → evalúo si inicia tratamiento o no
\`\`\`

En la práctica, una persona puede contactar por distintos motivos:

- el mismo paciente consulta;
- escribe un familiar;
- deriva o indica un médico;
- consulta un cuidador;
- se recibe un pedido médico formal;
- se consulta por un síntoma sin diagnóstico;
- se decide iniciar tratamiento;
- se decide no iniciar por motivos operativos, económicos, clínicos o de disponibilidad.

Actualmente esa etapa queda difusa entre datos administrativos del paciente y el inicio de tratamiento.

---

## 3) Hipótesis central

La app debería incorporar una entidad funcional previa al tratamiento:

> **Solicitud de atención**

En términos FHIR, esta entidad probablemente se modelará con `ServiceRequest`.

En lenguaje de producto, conviene priorizar nombres comprensibles para el uso cotidiano:

- "Solicitud de atención"
- "Consulta inicial"
- "Pedido de atención"
- "Solicitud de servicio"

**Hipótesis preliminar:** "Solicitud de atención" parece el nombre más claro y amplio para UI.

---

## 4) Definición funcional

Una solicitud de atención representa el pedido, consulta o demanda inicial por la cual una persona podría requerir atención kinésica.

La solicitud puede:

- crearse junto con el alta del paciente;
- crearse después desde la administración del paciente;
- quedar pendiente;
- ser evaluada;
- derivar en inicio de tratamiento;
- cerrarse sin tratamiento;
- registrar el motivo por el cual no se inició.

> La solicitud de atención no es el tratamiento.  
> La solicitud de atención no es una visita.  
> La solicitud de atención no reemplaza al paciente.

---

## 5) Mapa conceptual

\`\`\`text
Patient
  └── ServiceRequest / Solicitud de atención
        ├── pendiente / abierta / aceptada / no iniciada / cerrada
        ├── solicitante
        ├── motivo de consulta
        ├── diagnóstico informado opcional
        ├── notas administrativas o de admisión
        └── puede originar EpisodeOfCare
              └── Encounter(s)
\`\`\`

**Relación conceptual:**

| Entidad | Rol |
|---|---|
| `Patient` | identidad base de la persona |
| `ServiceRequest` | solicitud inicial de atención |
| `EpisodeOfCare` | tratamiento iniciado |
| `Encounter` | visita realizada |

---

## 6) Flujo real esperado

### 6.1 Alta rápida sin solicitud

1. Se crea el paciente con datos mínimos.
2. No se registra solicitud inicial en ese momento.
3. El paciente queda disponible para completar datos o crear solicitud más adelante.

Este flujo sirve cuando se quiere cargar una persona rápidamente sin completar todavía el motivo de consulta.

### 6.2 Alta de paciente con solicitud inicial

1. Se crea el paciente.
2. En el mismo acto se registra una solicitud de atención.
3. La solicitud queda abierta/pendiente.
4. Luego puede evaluarse y convertirse o no en tratamiento.

Este flujo sirve cuando el contacto inicial ya incluye motivo de consulta, solicitante y contexto suficiente.

### 6.3 Solicitud creada desde administración

1. El paciente ya existe.
2. Desde la superficie administrativa se crea una solicitud de atención.
3. La solicitud queda asociada al paciente.
4. Luego se decide si inicia tratamiento o no.

Este flujo permite no sobrecargar el alta inicial.

### 6.4 Solicitud que deriva en tratamiento

1. Existe una solicitud de atención.
2. Se acepta iniciar tratamiento.
3. Se crea un EpisodeOfCare.
4. La solicitud queda resuelta/vinculada al tratamiento.
5. Desde el tratamiento activo se habilita el registro de visitas.

### 6.5 Solicitud que no inicia tratamiento

1. Existe una solicitud de atención.
2. Se decide no iniciar tratamiento.
3. Se registra un motivo.
4. El paciente queda con antecedente administrativo de solicitud no iniciada.

Motivos posibles:

- le pareció caro;
- no hay disponibilidad;
- el paciente/familia decidió no iniciar;
- fuera del área de atención;
- no corresponde atención kinésica domiciliaria;
- derivado a otro profesional;
- no responde;
- otro.

---

## 7) Superficies impactadas

La incorporación de solicitud de atención podría impactar varias superficies.

### 7.1 `/admin/patients/new`

Alta de paciente.

**Hipótesis:**

- mantener el alta liviana;
- permitir crear solicitud inicial opcionalmente;
- no hacer obligatoria la solicitud;
- no convertir el alta en una historia clínica extensa.

**Posible estructura:**

\`\`\`
Datos mínimos del paciente
- Nombre *
- Apellido *
- Teléfono
- DNI
- Dirección

Solicitud de atención inicial
[ ] Registrar solicitud de atención ahora

Si se activa:
- Solicitado por
- Tipo de solicitante
- Motivo de consulta
- Diagnóstico informado / pedido médico
- Notas
\`\`\`

### 7.2 `/admin/patients/[id]/administrative`

Superficie administrativa del paciente.

**Hipótesis:**

- dejar de pensarla como un formulario directo de edición;
- convertirla en una pantalla de lectura + acciones;
- mostrar datos administrativos y contacto;
- incluir bloque de solicitud de atención;
- permitir crear/ver/gestionar solicitud;
- dejar "Editar datos administrativos" como una acción secundaria.

**Posible nombre funcional:** Administración del paciente

**Posibles secciones:**

- Datos administrativos
- Contacto y dirección
- Contacto principal / quién escribe
- Solicitud de atención
- Acciones administrativas

### 7.3 `/admin/patients`

Listado de pacientes.

**Hipótesis:**

- incorporar estado operativo derivado;
- revisar badges;
- agregar CTA contextual según estado;
- eventualmente agregar filtros por estado.

**Ejemplos de CTA contextual:**

\`\`\`
Sin solicitud          → Crear solicitud
Solicitud abierta      → Ver solicitud
Solicitud aceptada     → Iniciar tratamiento
Tratamiento activo     → Registrar visita
Tratamiento finalizado → Ver visitas / Ver historial
\`\`\`

### 7.4 `/admin/patients/[id]`

Hub/resumen del paciente.

**Hipótesis:**

- no sobrecargar el hub;
- mostrar un resumen compacto del estado operativo;
- mantener navegación hacia administración, tratamiento y visitas;
- eventualmente mostrar acceso rápido a solicitud activa.

### 7.5 `/admin/patients/[id]/treatment`

Gestión de tratamiento.

**Hipótesis:**

- mantener esta superficie enfocada en EpisodeOfCare;
- permitir iniciar tratamiento desde una solicitud aceptada;
- no mezclar admisión inicial con tratamiento activo;
- no crear tratamiento hasta que haya decisión real de inicio.

### 7.6 `/admin/patients/[id]/encounters`

Visitas.

**Hipótesis:**

- no modificar demasiado esta superficie;
- mantener Encounter dependiente de tratamiento activo;
- no permitir registrar visitas solo por tener solicitud abierta;
- conservar el gate operativo de tratamiento activo.

---

## 8) Estados operativos posibles

Hay dos capas distintas:

- Estado de solicitud
- Estado de tratamiento

Pero para la UI puede convenir un estado operativo derivado del caso.

### 8.1 Estados de solicitud posibles

- Sin solicitud
- Solicitud abierta
- Solicitud en evaluación
- Solicitud aceptada
- Solicitud no iniciada
- Solicitud cancelada
- Ingresada por error

### 8.2 Estados de tratamiento actuales

- Sin tratamiento iniciado
- Tratamiento activo
- Tratamiento finalizado

### 8.3 Estado operativo derivado sugerido

**Versión amplia:**

\`\`\`ts
type PatientOperationalStatus =
  | "no_request"
  | "request_open"
  | "request_in_review"
  | "request_accepted"
  | "request_not_started"
  | "active_treatment"
  | "finished_treatment";
\`\`\`

**Versión mínima para V1:**

\`\`\`ts
type PatientOperationalStatus =
  | "no_request"
  | "request_open"
  | "request_not_started"
  | "active_treatment"
  | "finished_treatment";
\`\`\`

**Recomendación preliminar:** empezar con la versión mínima.

---

## 9) Badges sugeridos

Los badges deberían representar el estado operativo del caso, no solamente el tratamiento.

**Posibles labels:**

- Sin solicitud
- Solicitud abierta
- No inició
- Tratamiento activo
- Tratamiento finalizado

**A evaluar:**

- si conviene mantener "Sin iniciar" para tratamiento o reemplazarlo por "Sin solicitud";
- si "No inició" es suficientemente claro;
- si "Solicitud abierta" es mejor que "Pendiente";
- si "En evaluación" aporta o complica.

---

## 10) Matriz inicial de CTAs por estado

| Estado operativo | Badge sugerido | CTA contextual sugerido | Destino probable |
|---|---|---|---|
| Sin solicitud | Sin solicitud | Crear solicitud | `/admin/patients/[id]/administrative` o futura subruta |
| Solicitud abierta | Solicitud abierta | Ver solicitud | `/admin/patients/[id]/administrative` o futura subruta |
| Solicitud no iniciada | No inició | Ver motivo | `/admin/patients/[id]/administrative` |
| Tratamiento activo | Tratamiento activo | Registrar visita | `/admin/patients/[id]/encounters/new` |
| Tratamiento finalizado | Tratamiento finalizado | Ver visitas | `/admin/patients/[id]/encounters` |

Pendiente definir si "Iniciar tratamiento" aparece:

- desde el listado;
- desde `/administrative`;
- desde `/treatment`;
- o solo desde `/treatment` para mantener responsabilidad clara.

**Hipótesis preliminar:** el listado puede sugerir la acción, pero la creación real de EpisodeOfCare debería seguir ocurriendo en `/treatment`.

---

## 11) Filtros posibles en `/admin/patients`

No implementar en primera instancia hasta definir bien los estados.

**Filtros candidatos:**

- Todos
- Solicitudes abiertas
- Tratamientos activos
- Finalizados
- Sin solicitud
- No iniciados

**Versión mínima futura:**

- Todos
- Solicitudes abiertas
- Tratamientos activos
- Finalizados

---

## 12) Campos mínimos de solicitud para V1

### 12.1 Campos visibles en UI

- Fecha de solicitud
- Solicitado por
- Tipo de solicitante
- Motivo de consulta
- Diagnóstico informado / pedido médico
- Estado de solicitud
- Resultado
- Motivo de no inicio
- Notas

### 12.2 Tipo de solicitante

- Paciente
- Familiar
- Cuidador/a
- Médico/a
- Otro

### 12.3 Resultado posible

- Pendiente
- Aceptada para iniciar tratamiento
- No inicia tratamiento
- Cancelada

### 12.4 Motivo de no inicio

- Le pareció caro
- Sin disponibilidad
- Decidió no iniciar
- Fuera del área de atención
- No corresponde atención domiciliaria
- Derivado a otro profesional
- No responde
- Otro

---

## 13) Posible contrato de dominio inicial

Snippet conceptual, no definitivo:

\`\`\`ts
type ServiceRequestRequesterType =
  | "patient"
  | "family"
  | "caregiver"
  | "physician"
  | "other";

type ServiceRequestStatus =
  | "open"
  | "accepted"
  | "not_started"
  | "cancelled"
  | "entered_in_error";

type ServiceRequestNotStartedReason =
  | "too_expensive"
  | "no_availability"
  | "patient_declined"
  | "outside_service_area"
  | "not_appropriate"
  | "referred_elsewhere"
  | "no_response"
  | "other";

type InitialServiceRequest = {
  id: string;
  patientId: string;
  requestedAt: string;
  requesterType: ServiceRequestRequesterType;
  requesterDisplay?: string;
  requesterContact?: string;
  reasonText: string;
  reportedDiagnosisText?: string;
  status: ServiceRequestStatus;
  notStartedReason?: ServiceRequestNotStartedReason;
  notStartedReasonText?: string;
  notes?: string;
  resultingEpisodeOfCareId?: string;
};
\`\`\`

---

## 14) Encaje FHIR preliminar

Este documento no define todavía el mapeo FHIR final.

**Hipótesis:**

- usar `ServiceRequest` para representar la solicitud inicial;
- usar `subject` para vincular al `Patient`;
- usar `authoredOn` para fecha de solicitud;
- usar `requester` cuando exista un recurso referenciable;
- usar una representación transicional para solicitantes no modelados todavía;
- usar `reason` / concepto equivalente para motivo de consulta;
- usar `status` y/o `statusReason` para resultado/motivo de no inicio;
- vincular con `EpisodeOfCare` cuando la solicitud derive en tratamiento.

**Decisiones pendientes:**

- cómo representar familiar/cuidador sin crear todavía `RelatedPerson`;
- cómo representar médico solicitante sin crear todavía `Practitioner`;
- si el diagnóstico informado debe quedar como texto, `Condition`, `supportingInfo` u otra estrategia;
- cómo vincular técnicamente `ServiceRequest` con `EpisodeOfCare`;
- cómo mantener compatibilidad con el nivel actual de complejidad del sistema.

---

## 15) Decisiones pendientes

Antes de auditar o implementar, definir:

- **Nombre visible principal:**
  - Solicitud de atención
  - Consulta inicial
  - Pedido de atención
  - Solicitud de servicio
- **Si `/administrative` debe cambiar de responsabilidad:**
  - de formulario de edición;
  - a pantalla de lectura + acciones administrativas.
- **Si el alta de paciente debe permitir crear solicitud:**
  - sí, opcional;
  - no, solo desde administración;
  - sí, pero en paso posterior.
- **Si debe existir ruta propia:**
  - `/admin/patients/[id]/requests`
  - `/admin/patients/[id]/requests/new`
  - subruta bajo `/administrative`
  - todo dentro de `/administrative` en V1.
- Cuántos estados usar en V1.
- Qué CTA contextual mostrar en `/patients`.
- Si el listado debe tener filtros en V1 o dejarlo para después.
- Desde dónde se inicia tratamiento cuando una solicitud fue aceptada.

---

## 16) Recomendación preliminar

La dirección más ordenada parece ser:

1. Mantener alta de paciente liviana.
2. Permitir crear solicitud inicial opcionalmente en el alta.
3. Convertir `/administrative` en "Administración del paciente":
   - lectura de datos;
   - acciones;
   - solicitud de atención.
4. Mantener `/treatment` como única superficie fuerte de EpisodeOfCare.
5. Mantener `/encounters` como superficie de visitas.
6. Evolucionar `/patients` con badges/CTA contextuales.
7. Dejar filtros para una fase posterior.

---

## 17) Plan incremental tentativo

### Fase 0 — Documento y auditoría

**Alcance:**

- cerrar hipótesis funcional;
- pedir auditoría UX/UI + arquitectura;
- pedir auditoría FHIR de ServiceRequest.

Sin código.

### Fase 1 — Reencuadre UI de `/administrative`

**Alcance:**

- convertir la pantalla en lectura + acciones;
- mantener edición administrativa como acción o subflujo;
- no crear todavía ServiceRequest.

**Objetivo:** preparar la superficie antes de agregar nueva entidad.

### Fase 2 — Definir contrato de dominio

**Alcance:**

- tipos;
- schemas;
- reglas mínimas;
- estados;
- motivos de no inicio;
- tests unitarios.

Sin UI compleja todavía.

### Fase 3 — Persistencia FHIR

**Alcance:**

- repositorio;
- mappers;
- fixtures;
- tests;
- decisión de mapeo transicional para solicitante, motivo y statusReason.

### Fase 4 — UI de solicitud

**Alcance:**

- crear solicitud desde paciente existente;
- visualizar solicitud en administración;
- cerrar solicitud sin tratamiento;
- eventualmente crear desde alta de paciente.

### Fase 5 — Integración con tratamiento

**Alcance:**

- iniciar tratamiento desde solicitud aceptada;
- vincular solicitud con EpisodeOfCare;
- ajustar estado operativo derivado;
- ajustar badges/CTA del listado.

### Fase 6 — Listado y filtros

**Alcance:**

- CTA contextual por estado;
- filtros por solicitud/tratamiento;
- refinamiento de badges.

---

## 18) Fuera de alcance explícito por ahora

No incluir todavía:

- agenda;
- pagos;
- presupuestos;
- self-booking;
- portal de paciente;
- multiusuario;
- carga de documentos adjuntos;
- Practitioner completo;
- RelatedPerson completo;
- Condition formal;
- CarePlan;
- Task;
- QuestionnaireResponse;
- historia clínica longitudinal rica.

---

## 19) Criterio de decisión

Una implementación futura debería considerarse correcta si:

- no obliga a crear tratamiento antes de tiempo;
- permite registrar solicitudes que no terminan en tratamiento;
- no ensucia EpisodeOfCare con estados de admisión;
- no convierte el alta de paciente en un formulario pesado;
- mejora la operación del listado de pacientes;
- mantiene `/treatment` y `/encounters` con responsabilidades claras;
- permite crecer hacia FHIR sin sobrediseñar la V1.
