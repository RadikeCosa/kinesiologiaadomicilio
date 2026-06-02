# FHIR-019 — ServiceRequest para solicitudes de atención

> Estado: referencia transicional vigente (base ya adoptada parcialmente en runtime)  
> Fecha: 2026-04-27 (actualizado 2026-04-28)  
> Alcance: modelado FHIR preliminar para solicitudes de atención

> Aclaración de estado (2026-04-28): `ServiceRequest` y el vínculo con `EpisodeOfCare.referralRequest` están implementados en runtime para el flujo SR-003 (inicio de tratamiento desde `/treatment`), manteniéndose este documento como referencia conceptual/transicional.

## 1) Propósito

Este documento define una estrategia **FHIR transicional** para modelar solicitudes de atención usando `ServiceRequest`.

No implementa código, no cierra interoperabilidad exhaustiva y no reemplaza validaciones que deben hacerse contra HAPI antes de implementar.

---

## 2) Contexto funcional

- un paciente puede tener múltiples solicitudes;
- una solicitud puede existir antes, durante o después de un tratamiento;
- una solicitud aceptada no inicia automáticamente tratamiento;
- un `EpisodeOfCare` puede estar asociado a una o varias solicitudes aceptadas;
- `Encounter` sigue dependiendo de `EpisodeOfCare`;
- `PatientOperationalStatus` es derivado.

---

## 3) Decisión principal

Se propone:

- usar `ServiceRequest` como recurso primario para solicitud de atención;
- mantener `Patient` como identidad base;
- mantener `EpisodeOfCare` como ciclo de tratamiento;
- mantener `Encounter` como visita;
- no usar `Task`, `CarePlan` ni `Condition` como recurso principal en V1.

Justificación breve:

- `Task` sobrediseña workflow para el alcance actual;
- `CarePlan` es prematuro para esta etapa;
- `Condition` no equivale a diagnóstico informado.

---

## 4) Guardrails de modelado

- `ServiceRequest` no es tratamiento.
- `ServiceRequest` no es visita.
- `ServiceRequest` no reemplaza `Patient`.
- `PatientOperationalStatus` no se persiste en FHIR.
- `episodeLinkStatus` no se persiste como estado clínico FHIR literal.
- `ServiceRequest.status` describe la solicitud.
- `EpisodeOfCare.status` describe el tratamiento.
- `Encounter` no referencia `ServiceRequest` en V1.
- Diagnóstico informado no se convierte en `Condition` en V1.
- `requester` no fuerza `Practitioner`/`RelatedPerson` en V1.

---

## 4.1) Decisiones aceptadas

- `ServiceRequest` será el recurso primario para solicitudes de atención.
- `PatientOperationalStatus` no se persiste en FHIR.
- `episodeLinkStatus` queda como dominio/read-model.
- diagnóstico informado no se modela como `Condition` en V1.
- requester transicional no fuerza `Practitioner`/`RelatedPerson` en V1.
- `Encounter` no referencia `ServiceRequest` en V1.
- el vínculo SR↔`EpisodeOfCare` tendrá owner único; primera opción a validar: `EpisodeOfCare.referralRequest`.

## 4.2) Decisiones cerradas antes de implementación (actualizado)

- mapping transicional `ServiceRequest.status/statusReason` cerrado en FHIR-021:
  - `in_review`/`accepted` → `active`;
  - `closed_without_treatment`/`cancelled` → `revoked`;
  - `entered_in_error` → `entered-in-error`.
- validación HAPI de `EpisodeOfCare.referralRequest` cerrada en FHIR-020 (viable en HAPI local).
- contrato de búsqueda por vínculo cerrado en FHIR-020/FHIR-022:
  - usar `EpisodeOfCare?incoming-referral=...`;
  - no usar `EpisodeOfCare?referralRequest=...`.
- requester transicional y búsquedas mínimas cerradas en FHIR-022.

---

## 5) Tabla de mapeo producto ↔ FHIR V1

| Campo de producto | Elemento FHIR candidato | Estándar/transicional | Recomendación V1 | Riesgo |
| --- | --- | --- | --- | --- |
| `id` | `ServiceRequest.id` | Estándar | usar `id` FHIR como identificador de solicitud | bajo |
| `patientId` | `ServiceRequest.subject.reference = Patient/{id}` | Estándar | obligatorio | bajo |
| `requestedAt` | `ServiceRequest.authoredOn` | Estándar | obligatorio en dominio y persistido en FHIR | bajo |
| `requesterDisplay` | `ServiceRequest.requester.display` | Estándar (uso liviano) | usar display transicional sin referencia fuerte | interoperabilidad parcial |
| `requesterType` | dominio/read-model (extensión futura opcional) | Transicional | no cerrar extensión aún | inconsistencia si no se define convención |
| `requesterContact` | dominio/read-model o `note` transicional | Transicional | mantener fuera del núcleo FHIR por ahora | búsqueda limitada |
| `reasonText` | `ServiceRequest.reasonCode.text` | Estándar | usar texto libre clínico-operativo | heterogeneidad semántica |
| `reportedDiagnosisText` | `ServiceRequest.note` textual etiquetada (o `supportingInfo` futuro) | Transicional | no usar `Condition` en V1 | riesgo de ambigüedad clínica |
| `status` | `ServiceRequest.status` | Estándar | mapear solo estado propio de solicitud | mapeo semántico a validar |
| `closedReason` | `ServiceRequest.statusReason` si disponible; fallback `note` | Estándar + fallback transicional | preferir `statusReason` | variación de soporte/perfil |
| `closedReasonText` | `statusReason.text` o `note.text` | Transicional | mantener texto humano trazable | duplicidad si no hay convención |
| `notes` | `ServiceRequest.note` | Estándar | uso directo | bajo |
| `episodeOfCareId` | derivado del vínculo definido en `EpisodeOfCare` | Derivado/transicional | no duplicar en `ServiceRequest` en V1 salvo decisión explícita futura | desalineación si hay doble fuente |
| `episodeLinkStatus` | derivado/read-model | Derivado | no persistir literal en FHIR | confusión entre estado de solicitud y de tratamiento |

---

## 6) Estados

### 6.1 Estado propio de ServiceRequest

Tipo conceptual de dominio:

```ts
type ServiceRequestStatus =
  | "in_review"
  | "accepted"
  | "closed_without_treatment"
  | "cancelled"
  | "entered_in_error";
```

Mapping FHIR transicional cerrado (FHIR-021):

- `in_review` → `active`;
- `accepted` → `active`;
- `closed_without_treatment` → `revoked`;
- `cancelled` → `revoked`;
- `entered_in_error` → `entered-in-error`.

### 6.2 Estado de vínculo con episodio

Tipo solo de dominio/read-model:

```ts
type ServiceRequestEpisodeLinkStatus =
  | "none"
  | "pending_episode_start"
  | "linked_to_active_episode"
  | "linked_to_closed_episode"
  | "deferred_to_future_episode";
```

No debe persistirse literalmente como estado FHIR.

### 6.3 Estado operativo de paciente

`PatientOperationalStatus` debe derivarse de:

- solicitudes existentes;
- estado de `EpisodeOfCare`;
- temporalidad;
- reglas de prioridad de UI.

No debe persistirse en FHIR.

---

## 7) Motivo de consulta

Decisión transicional:

- `reasonText` se modela como texto;
- candidato V1: `ServiceRequest.reasonCode.text`;
- no forzar codificación SNOMED/ICD en esta etapa;
- no crear `Condition` solo por motivo de consulta.

Ejemplos:

- “Dolor de rodilla”
- “Rehabilitación post ACV”
- “Dificultad para la marcha”

---

## 8) Diagnóstico informado

Decisión transicional:

- `reportedDiagnosisText` representa un dato informado/referido, no diagnóstico confirmado por el profesional;
- no usar `Condition` en V1;
- guardarlo como texto etiquetado (probablemente en `note`) y dejar `supportingInfo` como evolución futura;
- en UI evitar llamarlo “diagnóstico” a secas.

Triggers futuros para evaluar evolución a `Condition`:

- necesidad de codificación clínica estructurada;
- interoperabilidad real entre sistemas;
- seguimiento longitudinal por problema;
- reportes clínicos estructurados.

---

## 9) Requester transicional

Decisión transicional:

- usar `ServiceRequest.requester.display` cuando no exista `Practitioner`/`RelatedPerson`;
- `requesterType` queda en dominio/read-model o eventual extensión futura;
- `requesterContact` queda en dominio/read-model o `note` textual transicional;
- no crear `Practitioner` ni `RelatedPerson` en V1.

Riesgos:

- interoperabilidad limitada;
- búsqueda limitada por solicitante;
- necesidad de convención clara para `display`.

---

## 10) Vínculo ServiceRequest ↔ EpisodeOfCare

Decisión transicional cerrada (FHIR-020):

- owner primario del vínculo: `EpisodeOfCare`;
- `EpisodeOfCare` puede referenciar una o varias `ServiceRequest` aceptadas;
- `EpisodeOfCare.referralRequest` es viable en HAPI local validado (R4 4.0.1 / HAPI 8.8.0);
- para búsqueda por vínculo usar `incoming-referral` (no `referralRequest` como search param);
- si degrada búsqueda por vínculo, aplicar fallback de composición por `patient`;
- evitar duplicar vínculo en ambos recursos sin regla única.

Escenarios:

- Solicitud aceptada pendiente: `ServiceRequest` accepted + sin `EpisodeOfCare` vinculado.
- Solicitud aceptada inicia tratamiento: se crea `EpisodeOfCare` y se referencia `ServiceRequest`.
- Nueva solicitud durante tratamiento activo: si se acepta, se agrega referencia al `EpisodeOfCare` activo.
- Ciclo cerrado: `EpisodeOfCare` finalizado conserva referencias históricas.

---

## 11) Relación con Encounter

Decisión V1:

- `Encounter` sigue vinculado a `EpisodeOfCare`;
- no vincular `Encounter` directamente con `ServiceRequest` en V1;
- evaluar `basedOn` más adelante solo si aparece necesidad real de trazabilidad fina.

---

## 12) Búsquedas mínimas futuras

Búsquedas necesarias:

- `ServiceRequest` por `Patient`;
- `ServiceRequest` por `status`;
- `ServiceRequest` vinculadas a `EpisodeOfCare` (según estrategia elegida);
- `EpisodeOfCare` con referencias a `ServiceRequest` aceptadas.

Search params validados y documentados en FHIR-020/FHIR-022; cualquier despliegue fuera del entorno validado debe reverificar capabilities del servidor destino.

---

## 13) Responsabilidades por capa

- **Domain:** tipos, reglas de transición, estados derivados.
- **Mapper:** FHIR ↔ dominio.
- **Repository:** IO y queries FHIR.
- **Loaders/read models:** composición `Patient` + `ServiceRequest` + `EpisodeOfCare`.
- **UI:** consume read models; no FHIR crudo.

---

## 14) Plan incremental FHIR

- **FHIR-0 — ADR/modelado transicional**  
  Objetivo: cerrar decisiones mínimas de modelado; riesgo: cerrar semántica sin validar servidor.
- **FHIR-1 — Tipos/schemas dominio**  
  Objetivo: contrato transicional de solicitud; riesgo: acoplar de más dominio a FHIR.
- **FHIR-2 — Write mapper**  
  Objetivo: mapear escritura de `ServiceRequest`; riesgo: ambigüedad de `status/statusReason`.
- **FHIR-3 — Read mapper**  
  Objetivo: mapear lectura consistente a dominio; riesgo: perder semántica de texto transicional.
- **FHIR-4 — Repository/search**  
  Objetivo: IO + búsquedas mínimas robustas; riesgo: queries frágiles por supuestos de HAPI.
- **FHIR-5 — Integración con EpisodeOfCare**  
  Objetivo: materializar vínculo SR↔EoC con owner único; riesgo: duplicidad de fuente de verdad.
- **FHIR-6 — Tests/fixtures**  
  Objetivo: cubrir mappers/repositorio/reglas; riesgo: cobertura parcial de escenarios mixtos.
- **FHIR-7 — Sincronización documental**  
  Objetivo: alinear docs FHIR/producto/operativa; riesgo: divergencia doc-código.

---

## 15) Deudas explícitas

- posible evolución a `Condition`;
- posible evolución a `Practitioner`/`RelatedPerson`;
- posible evolución a `DocumentReference` para pedido médico;
- codificación estructurada futura de `statusReason` (si aparece necesidad analítica/interoperable).

---

## 16) Fuera de alcance

No incluir por ahora:

- implementación;
- mappers;
- repositorio;
- UI;
- rutas nuevas;
- filtros;
- `Practitioner`;
- `RelatedPerson`;
- `Condition`;
- `DocumentReference`;
- `CarePlan`;
- `Task`;
- `QuestionnaireResponse`;
- múltiples `EpisodeOfCare` activos.

---

## 17) Criterio de aceptación documental

Este documento se considera correcto si:

- define `ServiceRequest` como recurso primario para solicitud;
- separa estado de solicitud, vínculo con episodio y estado operativo de paciente;
- evita `Condition` para diagnóstico informado en V1;
- evita `Practitioner`/`RelatedPerson` en V1;
- mantiene `Encounter` dependiente de `EpisodeOfCare`;
- declara un owner único para el vínculo SR↔EoC;
- deja claras las deudas transicionales.

---

## 18) Próximos pasos recomendados (antes de implementar)

1. Cerrar primero el carril **Producto V0** en `/admin/patients/[id]/administrative` (reencuadre a “Administración del paciente”, lectura + acciones, sin persistencia nueva).
2. Con FHIR-020/FHIR-021/FHIR-022 cerrados, avanzar a FHIR-023 (implementación incremental) manteniendo:
   - owner único del vínculo SR↔EoC en `EpisodeOfCare.referralRequest`;
   - query por vínculo con `incoming-referral`;
   - fallback por composición con `patient` si degrada búsqueda por vínculo;
   - separación estricta entre estado de solicitud y estado operativo derivado de paciente.
