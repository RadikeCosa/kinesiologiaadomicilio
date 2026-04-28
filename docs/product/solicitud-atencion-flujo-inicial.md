# Solicitudes de atención — flujo operativo y encaje funcional

> Estado: borrador de discusión  
> Fecha: 2026-04-27  
> Alcance: hipótesis funcional/producto previa a auditoría e implementación

> Nota de naming vigente: por ahora se **mantiene** `solicitud-atencion-flujo-inicial.md` para evitar romper referencias. Si se renombra a `solicitudes-atencion-flujo-operativo.md`, debe hacerse con actualización completa de enlaces en el mismo PR.

> Actualización de estado (2026-04-28): **PRODUCT-SR-001 implementado** como primer corte funcional en `/admin/patients/[id]/administrative` (lectura + alta mínima), preservando no-alcances de resolución/cierre/aceptación para SR-002.
>
> Actualización de estado (2026-04-28): **PRODUCT-SR-002 implementado** como segundo corte funcional en `/admin/patients/[id]/administrative` (aceptar, cancelar y cerrar como No inició con motivo), manteniendo no-alcances clínicos/operativos globales.
>
> Actualización de estado (2026-04-28): **PRODUCT-SR-HARDENING cerrado** (fidelidad `accepted/in_review` + ownership paciente↔solicitud en update), quedando base robusta para planificar SR-003 sin expandir alcance clínico en esta etapa.
>
> Actualización de estado (2026-04-28): **PRODUCT-SR-003 implementado/cerrado** como tercer corte funcional: una solicitud `accepted` puede derivar a `/treatment` y, al iniciar tratamiento desde esa superficie, se vincula el `EpisodeOfCare` mediante `referralRequest` sin mover ownership clínico fuera de `/treatment`.
>
> Actualización de estado (2026-04-28): **PRODUCT-SR-HARDENING-2 cerrado**: política `single-use` para SR accepted implementada (si ya tiene vínculo con `EpisodeOfCare`, debe registrarse nueva solicitud para otro ciclo).

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

Estado actualizado al 2026-04-28:

- existe implementación mínima de `ServiceRequest` en `/admin/patients/[id]/administrative` (lectura + alta mínima);
- no existe aún resolución/cierre/aceptación de solicitudes desde UI;
- `PatientOperationalStatus` en código sigue limitado al flujo vigente de paciente/tratamiento (sin señal SR en derivación global);
- los estados extendidos propuestos aquí continúan como hipótesis de evolución futura;
- el cierre de SR-001 reduce parte del gap documento↔código y SR-002 queda como siguiente corte funcional.

---

## 7) Estados operativos del caso

Para operación y UI conviene mostrar un estado derivado del caso del paciente.

### 7.0 Separación explícita: vigente vs futuro

- **Vigente en código hoy (2026-04-28):**
  - `preliminary`
  - `ready_to_start`
  - `active_treatment`
  - `finished_treatment`
- Esta derivación actual depende de `EpisodeOfCare` (activo/finalizado) y de la presencia de DNI; no existe señal de `ServiceRequest` en runtime.
- **Modelo de esta sección:** es **futuro/conceptual** y no debe interpretarse como implementado.
- `PatientOperationalStatus` futuro sigue siendo un estado **derivado** (read-model), no persistido como verdad clínica en FHIR.

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
| `service_request_closed_without_treatment` | No inició | Cerrada sin tratamiento / No aceptada / No avanzó |
| `accepted_request_treatment_pending` | Tratamiento pendiente | — |
| `active_treatment` | Tratamiento activo | — |
| `closed_cycle` | Ciclo cerrado | — |

### 7.4.1 Decisión de copy (V1 futura) para `service_request_closed_without_treatment`

Decisión recomendada:

- **Label principal badge/listado:** `No inició`
- **Texto explicativo corto (detalle):** `La solicitud se cerró sin iniciar tratamiento.`
- **CTA principal sugerida:** `Ver motivo`
- **CTA secundaria sugerida:** `Nueva solicitud`

Justificación de producto:

- evita tono duro/acusatorio;
- diferencia claramente este estado de `closed_cycle` (tratamiento que sí existió y terminó);
- evita confusión con `finished_treatment` (tratamiento finalizado);
- conserva lenguaje operativo breve para listado y badge.

Términos a evitar como label principal visible:

- `Rechazada`
- `Denegada`
- `Fallida`
- `Abandonada`

Nota: `Cerrada sin tratamiento` puede quedar como copy de apoyo contextual, pero no como label principal.

### 7.5 Qué depende sí o sí de `ServiceRequest` real

No puede implementarse de forma correcta sin `ServiceRequest` persistido y consultable:

- distinguir `no_service_request` de `service_request_closed_without_treatment`;
- representar `service_request_in_review`;
- representar `accepted_request_treatment_pending`;
- priorizar estados mixtos usando temporalidad de solicitudes;
- habilitar CTAs de solicitud (`Ver solicitud`, `Resolver solicitud`, `Nueva solicitud`) con respaldo real.

### 7.6 Qué NO anticipar ahora

- no cambiar estados operativos vigentes en código;
- no modificar badges/CTAs actuales;
- no mezclar estado de solicitud con estado de `EpisodeOfCare`;
- no persistir un estado operativo derivado como estado clínico FHIR;
- no abrir rutas nuevas de solicitudes en esta fase.

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

Reglas complementarias de cierre/prioridad:

- `closed_cycle` representa último ciclo cerrado cuando no existe solicitud más relevante;
- `no_service_request` solo aplica cuando no hay solicitudes y tampoco ciclos relevantes;
- `service_request_closed_without_treatment` se muestra como `No inició` (label principal recomendado para V1 futura).

### 8.1 Escenarios mixtos de referencia

| Escenario | Badge principal | Indicador secundario | CTA principal | CTA secundaria |
| --- | --- | --- | --- | --- |
| Tratamiento activo + nueva solicitud en evaluación | Tratamiento activo | Nueva solicitud en evaluación | Registrar visita | Nueva solicitud / Ver solicitud |
| Ciclo cerrado + nueva solicitud en evaluación | En evaluación | Ciclo cerrado previo | Ver solicitud / Resolver solicitud | Ver ciclo cerrado |
| Solicitud aceptada sin tratamiento iniciado | Tratamiento pendiente | — | Iniciar tratamiento | Ver solicitud |
| Solo solicitudes cerradas sin tratamiento | No inició o Cerrada sin tratamiento | — | Ver motivo | Nueva solicitud |

### 8.2 Criterios de aceptación funcional futura (escenarios temporales límite)

> Estos escenarios son **criterios funcionales futuros** para validar diseño de producto cuando exista `ServiceRequest` real.  
> **No son tests implementados actualmente** ni cambian el comportamiento vigente.

| Caso | Escenario temporal límite | Estado principal esperado | Indicador secundario esperado | Guardrail / observación |
| --- | --- | --- | --- | --- |
| 1 | Paciente sin solicitud y sin ciclos. | `no_service_request` | — | Caso base sin demanda ni tratamiento previo. |
| 2 | Paciente con solicitud en evaluación y sin tratamiento. | `service_request_in_review` | — | No habilita visitas. |
| 3 | Paciente con solicitud cerrada sin tratamiento y sin ciclos. | `service_request_closed_without_treatment` (`No inició`) | — | Diferenciar de ciclo cerrado. |
| 4 | Paciente con solicitud aceptada, pero sin `EpisodeOfCare` iniciado. | `accepted_request_treatment_pending` | — | CTA esperada: iniciar tratamiento. |
| 5 | Paciente con `EpisodeOfCare` activo. | `active_treatment` | — | **Puede registrar visita**. |
| 6 | Paciente con `EpisodeOfCare` activo + nueva solicitud en evaluación. | `active_treatment` | Solicitud en evaluación | `Registrar visita` sigue dependiendo del episodio activo, no de la solicitud. |
| 7 | Paciente con ciclo cerrado y sin solicitud nueva. | `closed_cycle` | — | Refleja último ciclo finalizado. |
| 8 | Paciente con ciclo cerrado + solicitud nueva en evaluación más reciente. | `service_request_in_review` | Ciclo cerrado previo | La temporalidad reciente de la solicitud prevalece sobre el cierre previo. |
| 9 | Paciente con solicitud aceptada pendiente + ciclo cerrado previo. | `accepted_request_treatment_pending` | Ciclo cerrado previo | La solicitud aceptada pendiente tiene mayor prioridad operativa. |
| 10 | Paciente con solicitud cerrada sin tratamiento posterior a ciclo cerrado. | `service_request_closed_without_treatment` (`No inició`) | Ciclo cerrado previo | Al ser evento más reciente de demanda, prevalece sobre `closed_cycle`; evita confundir con tratamiento finalizado vigente. |

---

## 9) Matriz de CTAs por estado operativo

| Estado operativo | CTA principal | CTA secundaria |
| --- | --- | --- |
| Sin solicitud | Crear solicitud | Editar datos |
| En evaluación | Ver solicitud | Resolver solicitud |
| No inició | Ver motivo | Nueva solicitud |
| Tratamiento pendiente | Iniciar tratamiento | Ver solicitud |
| Tratamiento activo | Registrar visita | Nueva solicitud |
| Ciclo cerrado | Ver visitas | Nueva solicitud |

Regla de responsabilidad:

- la acción real de iniciar tratamiento debe seguir pasando por `/admin/patients/[id]/treatment` (o una ruta equivalente que preserve esa responsabilidad);
- no mezclar gestión completa de `ServiceRequest` con responsabilidades de `EpisodeOfCare`.

### 9.1 Guardrail innegociable de operación clínica

- `Registrar visita` solo se habilita con `EpisodeOfCare` **activo**.
- Una solicitud aceptada (`accepted_request_treatment_pending`) **no habilita visitas por sí sola**.
- El ownership de habilitación de visitas permanece en la capa de tratamiento (`EpisodeOfCare`), no en solicitud.

### 9.2 Matriz futura badge/CTA por superficie (dirección funcional)

> Esta matriz define dirección futura de producto. **No representa comportamiento implementado hoy**.

| Estado conceptual futuro | `/admin/patients` | `/admin/patients/[id]` | `/admin/patients/[id]/administrative` | `/admin/patients/[id]/treatment` | `/admin/patients/[id]/encounters` |
| --- | --- | --- | --- | --- | --- |
| `no_service_request` | Badge “Sin solicitud”. CTA principal: Gestión administrativa. | Resumen: sin solicitud. CTA principal: Gestión administrativa. | CTA principal: Crear solicitud. | Mantener foco en tratamiento; sin efecto automático por solicitud. | Sin CTA `Registrar visita` si no hay tratamiento activo. |
| `service_request_in_review` | Badge “En evaluación”. CTA principal: Ver solicitud. | Resumen de solicitud en evaluación + acceso a administrativa. | CTA principal: Ver/Resolver solicitud. | Sin iniciar visitas por solicitud en evaluación. | Sin CTA `Registrar visita` si no hay tratamiento activo. |
| `service_request_closed_without_treatment` | Badge “No inició”. CTA: Ver motivo/Nueva solicitud. | Resumen de cierre sin tratamiento. | CTA principal: Nueva solicitud. | No iniciar tratamiento automáticamente. | Sin CTA `Registrar visita` si no hay tratamiento activo. |
| `accepted_request_treatment_pending` | Badge “Tratamiento pendiente”. CTA principal: Iniciar tratamiento. | CTA principal: Ir a tratamiento para iniciar. | Ver solicitud aceptada + contexto administrativo. | Acción principal: Iniciar `EpisodeOfCare`. | Sin CTA `Registrar visita` hasta tener episodio activo. |
| `active_treatment` | Badge “Tratamiento activo”. CTA principal: Registrar visita. | CTA rápida: Registrar visita. | Gestión administrativa secundaria. | Acción principal: gestionar inicio/cierre de ciclo. | CTA principal: Registrar visita (si episodio activo). |
| `closed_cycle` | Badge “Ciclo cerrado”. CTA principal: Ver visitas / Nueva solicitud. | Resumen de último ciclo cerrado. | CTA principal: Nueva solicitud. | Posible reinicio de tratamiento según criterio clínico-operativo. | Listado histórico; sin alta de visita si no hay episodio activo. |

### 9.3 Ejemplos de copy UI futuro por superficie (referencia)

> Ejemplos de copy para implementación futura (cuando exista solicitud persistida).  
> No representan comportamiento vigente ni cambios runtime actuales.

1. **`/admin/patients` (listado/card)**
   - Caso `No inició`:
     - Badge: `No inició`
     - Línea breve: `La solicitud se cerró sin iniciar tratamiento.`
     - CTA principal: `Ver motivo`
     - CTA secundaria: `Nueva solicitud`
   - Caso `Tratamiento activo`:
     - Badge: `Tratamiento activo`
     - Línea breve: `En curso desde 12/05/2026`
     - CTA principal: `Registrar visita`
     - CTA secundaria: `Ver paciente`

2. **`/admin/patients/[id]` (resumen operativo)**
   - Estado principal + secundario (ejemplo mixto):
     - Estado principal: `Tratamiento activo`
     - Indicador secundario: `Nueva solicitud en evaluación`
     - Resumen: `Tratamiento en curso. Hay una solicitud nueva pendiente de revisión.`

3. **`/admin/patients/[id]/administrative` (administrativo + solicitudes)**
   - Bloque futuro sugerido:
     - Título: `Solicitudes de atención`
     - Estado visible: `No inició`
     - Copy: `La última solicitud se cerró sin iniciar tratamiento.`
     - CTA principal: `Nueva solicitud`
     - Nota de alcance: `Hasta implementar persistencia de solicitudes, este bloque es solo referencia funcional.`

4. **`/admin/patients/[id]/treatment` (ownership de tratamiento)**
   - Caso `Tratamiento pendiente` por solicitud aceptada:
     - Estado: `Tratamiento pendiente`
     - Copy: `Hay una solicitud aceptada. Para continuar, iniciá el tratamiento.`
     - CTA principal: `Iniciar tratamiento`
     - Aclaración: `Esta pantalla mantiene ownership de inicio/cierre de tratamiento (EpisodeOfCare).`

5. **`/admin/patients/[id]/encounters` (visitas)**
   - Sin tratamiento activo:
     - Copy: `Necesitás un tratamiento activo para registrar visitas.`
     - CTA: `Ir a gestión de tratamiento`
   - Con tratamiento activo:
     - Copy: `Podés registrar una nueva visita del tratamiento activo.`
     - CTA principal: `Registrar visita`
   - Guardrail explícito:
     - `Una solicitud aceptada por sí sola no habilita registrar visitas.`

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

## 13) Plan incremental actualizado (dos carriles)

### Carril A — Producto V0 (siguiente iteración recomendada)

Objetivo: entregar valor operativo sin introducir `ServiceRequest` persistido.

- Reencuadrar `/admin/patients/[id]/administrative` como **“Administración del paciente”**.
- Priorizar **lectura + acciones** (no rediseño profundo ni nuevas rutas).
- Mantener CTAs actuales y navegación vigente.
- No cambiar lógica ni contratos de `EpisodeOfCare` y `Encounter`.
- No incorporar estados nuevos persistidos.

#### Nota de cierre (2026-04-28)

**Estado:** Producto V0 administrativo implementado/cerrado.

Alcance efectivamente cerrado en esta etapa:
- `/admin/patients/[id]/administrative` opera en lectura + acciones por defecto;
- edición explícita detrás de CTA `Editar datos`;
- sin `ServiceRequest` persistido;
- sin rutas nuevas;
- sin cambios en `EpisodeOfCare`/`Encounter`;
- sin cambios FHIR (FHIR V1 continúa como carril futuro).

Próximo carril recomendado:
1. pulido UX opcional de la superficie administrativa;
2. luego, auditoría de estados operativos futuros de producto;
3. recién después, FHIR V1 al cerrar decisiones técnicas pendientes.

### Carril B — FHIR V1 futura (posterior a Producto V0)

Objetivo: implementar `ServiceRequest` real con validación técnica previa.

1. Validar `EpisodeOfCare.referralRequest` en HAPI/R4.
2. Cerrar mapping `ServiceRequest.status/statusReason`.
3. Definir requester transicional.
4. Validar búsquedas mínimas.
5. Definir fallback si `referralRequest` no aplica.
6. Recién después, avanzar con implementación incremental (tipos/schemas → mappers → repositorio → UI).

#### Gate de entrada para abrir FHIR-020/021/022

Antes de abrir ejecución técnica de FHIR-020/021/022, deben estar explícitamente cerradas estas precondiciones:

1. Validación real de `EpisodeOfCare.referralRequest` en HAPI/R4 (o descarte con justificación).
2. Mapping acordado y estable para `ServiceRequest.status/statusReason`.
3. Definición de requester transicional (`display`, alcance y límites).
4. Búsquedas mínimas validadas contra servidor objetivo.
5. Fallback documentado si `referralRequest` no aplica.

Sin este gate, el carril FHIR se mantiene como referencia técnica futura y no como implementación.

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
