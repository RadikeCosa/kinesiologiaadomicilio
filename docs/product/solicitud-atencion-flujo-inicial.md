# Solicitudes de atención — flujo operativo y encaje funcional

> Estado: borrador de discusión  
> Fecha: 2026-04-27  
> Alcance: hipótesis funcional/producto previa a auditoría e implementación

> Nota interna de naming: el archivo se mantiene como `solicitud-atencion-flujo-inicial.md` por continuidad, pero por el nuevo enfoque podría renombrarse más adelante a `docs/product/solicitudes-atencion-flujo-operativo.md`.

## 1) Propósito del documento

Este documento actualiza la hipótesis funcional para pasar de una lógica de **“solicitud inicial única”** a un modelo operativo de **solicitudes de atención**.

La intención no es implementar todavía `ServiceRequest`, sino definir primero:

- qué problema de producto resuelve;
- cómo se inserta en el flujo real de trabajo;
- cómo convive con tratamiento activo y ciclos cerrados;
- qué superficies privadas impacta;
- qué estados operativos deberían verse en UI;
- qué debería entrar en una primera versión;
- qué decisiones quedan pendientes antes de auditar e implementar.

Este documento sigue siendo deliberadamente previo a una definición técnica/FHIR final.

---

## 2) Reencuadre funcional (de hipótesis lineal a modelo operativo)

### 2.1 Hipótesis previa (a corregir)

El flujo anterior se entendía casi linealmente como:

```text
Patient → ServiceRequest → EpisodeOfCare → Encounter
```

Eso era útil para pensar la admisión inicial, pero resultó incompleto para la operación real.

### 2.2 Nuevo enfoque

`ServiceRequest` (en lenguaje de producto: **solicitud de atención**) debe pensarse como una **unidad de demanda de atención/servicio** que puede existir:

- antes de iniciar tratamiento;
- durante un tratamiento activo;
- luego de un ciclo cerrado, cuando el paciente vuelve a consultar.

Por lo tanto:

- un paciente puede tener múltiples solicitudes de atención;
- un `EpisodeOfCare` puede asociarse a una o varias solicitudes aceptadas;
- en esta etapa del producto, un paciente puede tener como máximo un tratamiento activo.

Durante tratamiento activo, una nueva solicitud puede:

- quedar en evaluación;
- cerrarse sin tratamiento;
- aceptarse y agregarse al `EpisodeOfCare` activo;
- diferirse para un ciclo futuro.

---

## 3) Aclaraciones fundamentales (guardrails de producto)

- `ServiceRequest` **no es** tratamiento.
- `ServiceRequest` **no es** visita.
- `ServiceRequest` **no reemplaza** `Patient`.
- Una solicitud puede **no terminar** en tratamiento.
- Una solicitud puede aparecer **durante tratamiento activo**.
- Una solicitud aceptada **no implica automáticamente** tratamiento iniciado.
- **Tratamiento pendiente** = solicitud aceptada, pero `EpisodeOfCare` todavía no iniciado.
- **Tratamiento activo** = existe `EpisodeOfCare` activo y, por definición operativa, al menos una solicitud aceptada asociada o asociable.
- **Ciclo cerrado** = el `EpisodeOfCare` terminó.

---

## 4) Mapa conceptual actualizado

```text
Patient
  └── ServiceRequest[]
        ├── en evaluación
        ├── cerrada sin tratamiento / rechazada
        ├── aceptada con tratamiento pendiente
        ├── aceptada y vinculada a EpisodeOfCare activo
        └── aceptada y vinculada a EpisodeOfCare cerrado

EpisodeOfCare
  └── puede estar basado o vinculado a una o varias ServiceRequest aceptadas

Encounter
  └── pertenece al ciclo de tratamiento / EpisodeOfCare
```

### Relación conceptual de entidades

| Entidad | Rol |
|---|---|
| `Patient` | identidad base de la persona |
| `ServiceRequest` | unidad de demanda de atención (no necesariamente inicial) |
| `EpisodeOfCare` | ciclo de tratamiento |
| `Encounter` | visita dentro de un tratamiento |

---

## 5) Marco FHIR (aclaración de alcance)

En FHIR, esta entidad probablemente se modelará como `ServiceRequest`.

Sin embargo, este documento es de producto/flujo y **no** define todavía:

- mapeo FHIR definitivo;
- estrategia final de codificación;
- decisiones cerradas de interoperabilidad.

---

## 6) Estado actual confirmado en código

Al momento de este documento:

- no existe todavía `ServiceRequest` implementado;
- no existen estados derivados de solicitud en código;
- `PatientOperationalStatus` en código sigue limitado al flujo vigente de paciente/tratamiento;
- los estados propuestos aquí son hipótesis de producto para evolución futura;
- el gap entre documento y código actual es esperado en esta etapa.

---

## 7) Estados operativos del caso

Para operación y UI conviene mostrar un estado derivado del caso del paciente.

### 7.1 Secuencia base sugerida

- Sin solicitud
- Solicitud en evaluación
- Solicitud cerrada sin tratamiento / no iniciada / rechazada
- Tratamiento pendiente
- Tratamiento activo
- Ciclo cerrado

### 7.2 Tipo conceptual propuesto

```ts
type PatientOperationalStatus =
  | "no_service_request"
  | "service_request_in_review"
  | "service_request_closed_without_treatment"
  | "accepted_request_treatment_pending"
  | "active_treatment"
  | "closed_cycle";
```

### 7.3 Labels UI sugeridos

- Sin solicitud
- En evaluación
- No inició / Cerrada sin tratamiento
- Tratamiento pendiente
- Tratamiento activo
- Ciclo cerrado

> Nota de copy: “Rechazada” puede ser técnicamente útil, pero en UI puede sonar duro. Mantener abierta la decisión entre variantes como “No inició”, “Cerrada sin tratamiento” o “No aceptada”.

---

### 7.4 Glosario breve de estado técnico/copy UI

| Estado técnico interno conceptual | Label UI sugerido | Copy alternativo pendiente |
| --- | --- | --- |
| `no_service_request` | Sin solicitud | — |
| `service_request_in_review` | En evaluación | — |
| `service_request_closed_without_treatment` | No inició | Cerrada sin tratamiento / No aceptada |
| `accepted_request_treatment_pending` | Tratamiento pendiente | — |
| `active_treatment` | Tratamiento activo | — |
| `closed_cycle` | Ciclo cerrado | — |

Nota: el copy definitivo para solicitud cerrada sin tratamiento sigue abierto.

---

## 8) Regla de prioridad para badge/listado (múltiples solicitudes)

Cuando conviven varias solicitudes/estados, el badge principal debería resolverse con esta prioridad:

1. Si hay tratamiento activo → **Tratamiento activo**.
2. Si no hay tratamiento activo pero hay solicitud aceptada pendiente → **Tratamiento pendiente**.
3. Si hay solicitud en evaluación → **En evaluación**.
4. Si el último `EpisodeOfCare` está cerrado → **Ciclo cerrado**.
5. Si solo hay solicitudes cerradas sin tratamiento → **No inició** o **Cerrada sin tratamiento**.
6. Si no hay solicitudes → **Sin solicitud**.

Aclaración: si hay tratamiento activo y además una nueva solicitud en evaluación, el badge principal debe seguir mostrando **Tratamiento activo**. La solicitud en evaluación puede mostrarse como indicador secundario.

Criterio de desempate temporal:

- cuando no hay tratamiento activo ni tratamiento pendiente, una solicitud en evaluación más reciente puede tomar prioridad sobre un ciclo cerrado previo;
- el criterio temporal debe usar la solicitud/episodio más reciente disponible;
- si hay tratamiento activo, este conserva prioridad como badge principal.

### 8.1 Escenarios mixtos de referencia

| Escenario | Badge principal | Indicador secundario | CTA principal | CTA secundaria |
| --- | --- | --- | --- | --- |
| Tratamiento activo + nueva solicitud en evaluación | Tratamiento activo | Nueva solicitud en evaluación | Registrar visita | Nueva solicitud / Ver solicitud |
| Ciclo cerrado + nueva solicitud en evaluación | En evaluación | Ciclo cerrado previo | Ver solicitud / Resolver solicitud | Ver ciclo cerrado |
| Solicitud aceptada sin tratamiento iniciado | Tratamiento pendiente | — | Iniciar tratamiento | Ver solicitud |
| Solo solicitudes cerradas sin tratamiento | No inició o Cerrada sin tratamiento | — | Ver motivo | Nueva solicitud |

---

## 9) Matriz de CTAs por estado operativo

| Estado operativo | CTA principal | CTA secundaria |
| --- | --- | --- |
| Sin solicitud | Crear solicitud | Editar datos |
| En evaluación | Ver solicitud | Resolver solicitud |
| No inició / cerrada sin tratamiento | Ver motivo | Nueva solicitud |
| Tratamiento pendiente | Iniciar tratamiento | Ver solicitud |
| Tratamiento activo | Registrar visita | Nueva solicitud |
| Ciclo cerrado | Ver visitas | Nueva solicitud |

Regla de responsabilidad:

- la acción real de iniciar tratamiento debe seguir pasando por `/admin/patients/[id]/treatment` (o una ruta equivalente que preserve esa responsabilidad);
- no mezclar gestión completa de `ServiceRequest` con responsabilidades de `EpisodeOfCare`.

---

## 10) Superficies impactadas

### 10.1 Mini matriz de ownership de ruta (dirección propuesta)

| Superficie | Ownership |
| --- | --- |
| `/admin/patients/[id]/administrative` | datos administrativos + solicitudes de atención |
| `/admin/patients/[id]/treatment` | inicio/cierre de `EpisodeOfCare` |
| `/admin/patients/[id]/encounters` | visitas realizadas |
| `/admin/patients/[id]` | resumen operativo compacto |
| `/admin/patients` | listado, badge y CTA contextual |

Esta matriz expresa dirección funcional propuesta y no implementación actual.

### 10.2 `/admin/patients/new`

- mantener alta liviana;
- permitir crear solicitud opcionalmente en el alta;
- no volver obligatorio el formulario de solicitud.

### 10.3 `/admin/patients/[id]/administrative`

Evolución esperada:

- pasar de “formulario de edición” a “Administración del paciente”;
- visualizar datos administrativos;
- editar datos;
- crear/ver/resolver solicitudes.

Es la superficie natural para la gestión de solicitudes de atención.

### 10.4 `/admin/patients`

- revisar badges;
- agregar CTA contextual por estado;
- eventualmente permitir filtros por estado operativo.

### 10.5 `/admin/patients/[id]`

- mostrar resumen operativo del caso;
- no sobrecargar el hub;
- mostrar motivos/diagnósticos activos o relevantes en forma compacta.

### 10.6 `/admin/patients/[id]/treatment`

- mantener foco en `EpisodeOfCare`;
- mostrar solicitudes aceptadas asociadas al tratamiento;
- mostrar motivos de consulta / diagnósticos informados asociados;
- permitir iniciar tratamiento desde solicitud aceptada;
- no convertir `/treatment` en gestor completo de solicitudes.

### 10.7 `/admin/patients/[id]/encounters`

- mantener foco en visitas;
- mostrar motivos/diagnósticos asociados al tratamiento en formato compacto;
- no habilitar visitas solo por tener solicitud abierta (debe existir tratamiento activo).

---

## 11) Motivo de consulta y diagnóstico informado (visibilidad transversal)

Debe quedar explícito que el motivo de consulta y el diagnóstico informado:

- no deberían quedar ocultos solo en `/administrative`;
- deben poder aparecer como resumen en:
  - detalle del paciente;
  - tratamiento;
  - visitas;
  - administración.

Distribución esperada:

- `/administrative`: versión completa de solicitudes.
- `/treatment`: solicitudes aceptadas asociadas al `EpisodeOfCare`.
- `/encounters`: resumen compacto para contexto asistencial.
- `/admin/patients/[id]`: resumen operativo del caso.

Aclaración de lenguaje: “diagnóstico informado” no necesariamente equivale a diagnóstico profesional confirmado. Evitar en UI llamarlo simplemente “diagnóstico” cuando pueda generar ambigüedad.

---

## 12) Contrato conceptual de dominio (no definitivo)

```ts
type ServiceRequestRequesterType =
  | "patient"
  | "family"
  | "caregiver"
  | "physician"
  | "other";

type ServiceRequestStatus =
  | "in_review"
  | "accepted"
  | "closed_without_treatment"
  | "cancelled"
  | "entered_in_error";

type ServiceRequestEpisodeLinkStatus =
  | "none"
  | "pending_episode_start"
  | "linked_to_active_episode"
  | "linked_to_closed_episode"
  | "deferred_to_future_episode";

type ServiceRequestClosedReason =
  | "too_expensive"
  | "no_availability"
  | "patient_declined"
  | "outside_service_area"
  | "not_appropriate"
  | "referred_elsewhere"
  | "no_response"
  | "other";

type PatientServiceRequest = {
  id: string;
  patientId: string;
  requestedAt: string;
  requesterType: ServiceRequestRequesterType;
  requesterDisplay?: string;
  requesterContact?: string;
  reasonText: string;
  reportedDiagnosisText?: string;
  status: ServiceRequestStatus;
  episodeLinkStatus: ServiceRequestEpisodeLinkStatus;
  closedReason?: ServiceRequestClosedReason;
  closedReasonText?: string;
  notes?: string;
  episodeOfCareId?: string;
};
```

Este contrato se mantiene como **conceptual** y sujeto a ajustes tras la auditoría funcional/técnica.

---

## Recorte anti-sobrediseño: V0 antes de ServiceRequest

### Decisión de producto

- No implementar `ServiceRequest` todavía.
- Primero reencuadrar `/admin/patients/[id]/administrative` como “Administración del paciente”.
- V0 no agrega persistencia FHIR nueva.
- V0 no crea rutas nuevas.
- V0 no altera `EpisodeOfCare` ni `Encounter`.

### Qué aporta valor ahora

- Mostrar datos administrativos en modo lectura.
- Separar edición como acción.
- Mostrar estado operativo simple basado en lo ya existente:
  - Tratamiento activo.
  - Ciclo cerrado.
  - Sin tratamiento activo.
- Mantener CTAs existentes:
  - Registrar visita cuando hay tratamiento activo.
  - Ir a tratamiento / gestionar tratamiento.
  - Editar datos administrativos.

### Qué queda como referencia futura

- Múltiples `ServiceRequest` por paciente.
- Estados finos de solicitud.
- Requester transicional.
- Motivos de cierre.
- Vínculo `ServiceRequest` ↔ `EpisodeOfCare`.
- FHIR-019 como referencia transicional previa a implementación.

### Qué NO entra en V0

- `ServiceRequest` persistido.
- Mappers/repositorio/schemas nuevos.
- Filtros por estado de solicitud.
- Badges secundarios.
- Rutas `/requests`.
- Alta de paciente con solicitud opcional.
- Integración transversal de motivo/diagnóstico informado.
- Taxonomía completa de `closedReason`.

### V1 mínima futura con ServiceRequest

La V1 se mantiene como evolución futura, no como alcance actual de implementación:

- `ServiceRequest` mínimo con:
  - `status`
  - `intent`
  - `subject`
  - `authoredOn`
  - `reasonText`
- 3 estados UI:
  - en evaluación
  - aceptada
  - cerrada sin tratamiento
- Sin requester complejo.
- Sin filtros avanzados.
- Sin integración completa en todas las superficies.

---

## 13) Plan incremental actualizado

### Fase 0 — Documento y auditoría

- cerrar hipótesis funcional;
- auditar UX/rutas/superficies;
- auditar modelado FHIR `ServiceRequest` y vínculo con `EpisodeOfCare`.

### Fase 1 — Reencuadre UI de `/administrative`

- convertirla en lectura + acciones;
- todavía sin `ServiceRequest` real persistido.

### Fase 2 — Estado operativo derivado

- revisar `PatientOperationalStatus`;
- revisar badges;
- revisar CTA contextual en listado.

### Fase 3 — Contrato de dominio `ServiceRequest`

- tipos;
- schemas;
- reglas;
- estados;
- motivos de cierre/rechazo/no inicio.

### Fase 4 — Persistencia/mappers/repositorio FHIR

- `ServiceRequest` repository;
- read/write mappers;
- búsqueda por `patient`;
- vínculo con `EpisodeOfCare`;
- tests.

### Fase 5 — UI de creación/visualización/resolución

- crear solicitud desde `/administrative`;
- eventualmente crear solicitud desde alta de paciente;
- visualizar solicitudes;
- resolver solicitud como aceptada, cerrada sin tratamiento o diferida.

### Fase 6 — Integración con tratamiento

- iniciar tratamiento desde solicitud aceptada;
- asociar una o más solicitudes aceptadas al `EpisodeOfCare`;
- permitir agregar una nueva solicitud aceptada al tratamiento activo.

### Fase 7 — Resumen transversal y listado

- mostrar motivos/diagnósticos en paciente, tratamiento y visitas;
- filtros en `/patients`;
- refinamiento de badges y CTAs.

---

## 14) Fuera de alcance explícito por ahora

- multi `EpisodeOfCare` activo;
- `Practitioner` completo;
- `RelatedPerson` completo;
- `Condition` formal;
- `DocumentReference` para pedido médico adjunto;
- carga de archivos;
- agenda;
- pagos;
- presupuestos;
- portal;
- historia clínica longitudinal rica;
- `CarePlan`;
- `Task`;
- `QuestionnaireResponse`.

---

## 15) Decisiones abiertas

- copy final en UI para estado “rechazada/no inició/cerrada sin tratamiento/no aceptada”;
- nivel de detalle de badges secundarios cuando coexisten tratamiento activo + solicitud en evaluación;
- estrategia de ruta concreta para gestionar solicitudes (todo en `/administrative` vs subrutas);
- estrategia FHIR transicional para solicitantes sin recursos completos (`Practitioner`/`RelatedPerson`);
- forma final de representar “diagnóstico informado” sin ambigüedad clínica.

---

## 16) Criterio de consistencia esperado

El enfoque se considera correctamente reflejado si el documento deja claro que:

- no hay una única solicitud por paciente;
- puede haber múltiples solicitudes;
- las solicitudes pueden coexistir con tratamiento activo;
- una solicitud aceptada puede vincularse a un `EpisodeOfCare` nuevo o existente;
- los motivos/diagnósticos asociados deben estar visibles transversalmente;
- `/administrative` es candidata a ser la superficie de gestión administrativa y solicitudes;
- `/treatment` sigue siendo la superficie de `EpisodeOfCare`;
- `/encounters` sigue siendo la superficie de visitas.
