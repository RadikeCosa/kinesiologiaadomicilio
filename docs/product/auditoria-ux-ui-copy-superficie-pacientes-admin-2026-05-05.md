# Auditoría UX/UI + copy — superficie privada de pacientes (`/admin`) 

Fecha: 2026-05-05

## 1) Resumen ejecutivo

La superficie privada de pacientes tiene una base sólida (flujo principal funciona, separación de rutas razonable y estados de tratamiento modelados), pero hoy mezcla **nombres de navegación**, **jerarquía de estados** y **mensajes operativos** de forma que puede inducir decisiones incorrectas, especialmente en escenarios con solicitud aceptada y tratamiento finalizado.

Diagnóstico general:
- La nomenclatura actual alterna entre “Visitas”, “Ver visitas” y descripciones que en la práctica abarcan más que visitas (contexto clínico + métricas + restricciones), generando deuda semántica.
- En solicitudes, conviven “estado administrativo” y “estado clínico vinculado” con señales visuales que no siempre separan claramente qué requiere acción ahora y qué es histórico.
- Existen helper texts útiles, pero no están estandarizados entre hub, administrativa, tratamiento y encounters; algunos compiten entre sí.
- El sistema de badges de tratamiento ya tiene una convención adecuada (emerald/amber/slate), pero no siempre se replica en estados derivados de solicitud.

Conclusión: antes de features nuevas, conviene un hardening UX/UI-copy en 4 parches acotados para mejorar orientación operativa sin tocar dominio, mappers ni contratos.

---

## 2) Hallazgos priorizados

## Críticos

### C1. Ambigüedad entre “Visitas” como lista vs gestión clínica real
- **Rutas afectadas:** `/admin/patients/[id]`, `/admin/patients/[id]/administrative`, `/admin/patients/[id]/treatment`, `/admin/patients/[id]/encounters`.
- **Problema observado:** CTA y navegación usan “Visitas”/“Ver visitas”, pero la superficie `/encounters` incluye estado de tratamiento, restricciones para registrar y resumen clínico-operativo (no solo listado).
- **Por qué confunde:** el usuario puede esperar una lista simple y no una consola clínica; además pierde contexto de cuál es la entrada principal para trabajo clínico.
- **Recomendación concreta:**
  - Usar naming de superficie: **“Gestión clínica”** para `/encounters` cuando se navega desde hubs/cards.
  - Mantener “Registrar visita” como CTA de acción puntual.
  - Dentro de la página, título principal puede ser “Gestión clínica” y subtítulo “Visitas del paciente”.
- **Archivos probables a tocar:**
  - `src/app/admin/patients/[id]/page.tsx`
  - `src/app/admin/patients/[id]/administrative/page.tsx`
  - `src/app/admin/patients/[id]/treatment/page.tsx`
  - `src/app/admin/patients/[id]/encounters/page.tsx`

### C2. Riesgo de falso positivo visual en solicitudes aceptadas con tratamiento finalizado
- **Rutas afectadas:** `/admin/patients/[id]/administrative`.
- **Problema observado:** en cards de solicitudes, `displayStatus` se muestra en texto verde (`text-emerald-700`) para todos los casos, incluyendo “Aceptada — tratamiento finalizado”.
- **Por qué confunde:** “aceptada” en verde se interpreta como vigente/accionable, aunque el tratamiento asociado ya cerró.
- **Recomendación concreta:** separar tono visual por tipo:
  - Vigente/activo (en evaluación, tratamiento activo) → verde o azul según convención.
  - Tratamiento finalizado → **amber**.
  - Histórico no accionable (no inició/cancelada) → gris.
  - Error/cancelación crítica si aplica → rojo sólo para bloqueo real.
- **Archivos probables a tocar:**
  - `src/app/admin/patients/[id]/administrative/components/PatientServiceRequestsSection.tsx`
  - `src/app/admin/patients/[id]/administrative/service-request-status-label.ts`

## Importantes

### I1. Inconsistencia de naming entre “Administración del paciente”, “Gestión de tratamiento”, “Ver visitas”
- **Rutas afectadas:** `/admin/patients/[id]`, `/administrative`, `/treatment`, `/encounters`.
- **Problema observado:** se mezclan prefijos “Administración”, “Gestión” y verbos “Ver”, sin criterio uniforme de superficie vs acción.
- **Por qué confunde:** reduce escaneabilidad; no queda claro qué botón te lleva a una consola y cuál ejecuta una tarea.
- **Recomendación concreta:**
  - Superficies: “Gestión administrativa”, “Gestión clínica”, “Tratamiento”.
  - Acciones: “Registrar visita”, “Iniciar tratamiento”, “Finalizar tratamiento”, “Nueva solicitud”.
  - Back links consistentes: “Volver al paciente” (detalle), “Volver a pacientes” (listado).
- **Archivos probables a tocar:** mismas rutas de navegación + tests de páginas.

### I2. Jerarquía insuficiente entre estado de solicitud vs estado de tratamiento vinculado
- **Rutas afectadas:** `/admin/patients/[id]/administrative`.
- **Problema observado:** en la card, status de solicitud y `displayStatus` se apilan, pero sin estructura explícita “Estado de solicitud” / “Estado de tratamiento”.
- **Por qué confunde:** dificulta entender si hay acción pendiente o solo histórico.
- **Recomendación concreta:** en cada card:
  - Línea 1: **Estado de solicitud** (badge principal).
  - Línea 2: **Estado clínico vinculado** (badge secundario o texto con tono específico).
  - Línea 3: **Acción disponible** (botón o “Sin acción pendiente”).
- **Archivos probables a tocar:** `PatientServiceRequestsSection.tsx`, `ServiceRequestStatusActions.tsx`.

### I3. Empty states útiles pero no unificados
- **Rutas afectadas:** `/administrative`, `/encounters`, `/encounters/new`, `/treatment`.
- **Problema observado:** hay mensajes buenos por pantalla, pero cambian el lenguaje (a veces orientan a acción, otras sólo describen estado).
- **Por qué confunde:** misma situación operativa, distinto mensaje; aumenta fricción cognitiva.
- **Recomendación concreta:** banco único de microcopy operativo por estado (ver sección 4).
- **Archivos probables a tocar:** páginas y componentes de esas rutas + tests de copy visible.

### I4. Acción principal vs secundaria compite en hub del paciente
- **Rutas afectadas:** `/admin/patients/[id]`.
- **Problema observado:** se resaltan dos CTAs (visitas/administrativo) según tratamiento activo, pero “tratamiento” queda como tercer eje con peso variable y sin marco mental explícito.
- **Por qué confunde:** usuarios novatos no distinguen cuándo ir a tratamiento vs administrativa.
- **Recomendación concreta:** convertir sección de acceso en 3 cards con descriptor:
  - Gestión administrativa (datos + solicitudes)
  - Gestión clínica (visitas + operación diaria)
  - Tratamiento (inicio/cierre)
- **Archivos probables a tocar:** `src/app/admin/patients/[id]/page.tsx`.

## Menores

### M1. Copy técnico mezclado con operativo en contextos puntuales
- **Rutas afectadas:** `/treatment` y mensajes de solicitud.
- **Problema observado:** aunque la UI evita términos FHIR en general, algunos textos pueden sonar de implementación (“vinculado”, “no se pudo usar la solicitud indicada…”).
- **Recomendación concreta:** reformular a lenguaje de operador (“No se pudo iniciar desde esta solicitud. Podés iniciar tratamiento manualmente y luego continuar con visitas.”).
- **Archivos probables a tocar:** `treatment/page.tsx`, acciones/mensajes.

### M2. Dashboard `/admin` no conecta explícitamente con superficies paciente
- **Ruta afectada:** `/admin`.
- **Problema observado:** muestra métricas claras, pero CTA final “Ver pacientes” no orienta sobre flujo recomendado por estado.
- **Recomendación concreta:** helper corto debajo de métricas: “Aceptadas pendientes → Gestión administrativa. En tratamiento → Gestión clínica.”
- **Archivos probables a tocar:** `src/app/admin/page.tsx`.

---

## 3) Convenciones propuestas

### 3.1 Naming de superficies
- `/admin/patients/[id]/administrative` → **Gestión administrativa**
- `/admin/patients/[id]/encounters` → **Gestión clínica** (subsección: Visitas)
- `/admin/patients/[id]/treatment` → **Tratamiento** (inicio/cierre)

### 3.2 Copy de CTAs
- Navegación a `/encounters`: **Ir a gestión clínica**
- Acción puntual: **Registrar visita**
- Navegación a `/treatment`: **Gestionar tratamiento** (o “Ir a tratamiento”)
- Navegación a `/administrative`: **Gestión administrativa**
- Back links:
  - detalle→listado: **Volver a pacientes**
  - subpágina→detalle: **Volver al paciente**

### 3.3 Colores / badges por estado
- **Verde (emerald):** activo vigente o acción habilitada inmediata.
- **Amber:** tratamiento finalizado (`finished_treatment`) y estados aceptados con ciclo cerrado.
- **Gris (slate):** histórico/cerrado no accionable (no inició/cancelada cuando no exige intervención).
- **Rojo:** error real/entrada inválida/bloqueo.

### 3.4 Microcopy estándar operativo
- **Solicitud de atención:** “Pedido inicial para evaluar si corresponde iniciar atención.”
- **Tratamiento:** “Ciclo de atención profesional del paciente (activo o finalizado).”
- **Visitas:** “Registros de las atenciones realizadas dentro de un tratamiento.”
- **Relación entre los tres:** “Primero se resuelve la solicitud; luego se inicia tratamiento; con tratamiento activo se registran visitas.”

---

## 4) Empty states y helper texts sugeridos

- **Sin solicitudes:** “Todavía no hay solicitudes. Registrá la primera para iniciar la evaluación.”
- **Solicitud en evaluación:** “Solicitud en evaluación. Definí si se inicia tratamiento, no inició o se cancela.”
- **Solicitud aceptada pendiente tratamiento:** “Solicitud aceptada. Falta iniciar tratamiento para habilitar visitas.”
- **Sin tratamiento iniciado:** “No hay tratamiento activo. Iniciá uno desde una solicitud aceptada.”
- **Tratamiento activo:** “Tratamiento activo. Ya podés registrar visitas.”
- **Tratamiento finalizado:** “Tratamiento finalizado. Si corresponde, iniciá un nuevo ciclo desde una nueva solicitud.”
- **Sin visitas:** “Todavía no hay visitas registradas para este tratamiento.”
- **No se puede registrar visita:** “No podés registrar visitas hasta tener un tratamiento activo.”

---

## 5) Plan sugerido en parches pequeños

### Patch 1 — Naming y CTAs
- Homologar títulos de superficies y labels de navegación.
- Sustituir “Ver visitas” por “Ir a gestión clínica” donde aplique.
- Ajustar subtítulos para aclarar alcance de cada página.

### Patch 2 — Badges y jerarquía de estados
- Separar visualmente “Estado de solicitud” vs “Estado clínico vinculado”.
- Aplicar tonos por convención (emerald/amber/slate/red).
- Corregir caso aceptada + tratamiento finalizado para evitar verde engañoso.

### Patch 3 — Helper texts y microcopy
- Crear set reutilizable de textos cortos por estado.
- Unificar empty states y mensajes de bloqueo/desbloqueo en administrativa, treatment y encounters.

### Patch 4 — Tests + documentación
- Actualizar tests de copy visible y estilos de badges/estados.
- Actualizar documentación operativa y checklist de sincronización.

---

## 6) Tests recomendados

1. **Tests de UI copy (RTL / page tests):**
- Validar títulos de superficie: “Gestión administrativa”, “Gestión clínica”, “Tratamiento”.
- Validar CTAs críticos: “Registrar visita”, “Ir a gestión clínica”, “Volver al paciente”.

2. **Tests de estados visuales (component tests):**
- `accepted_linked_finished_treatment` renderiza tono amber, no emerald.
- `in_review` y `accepted_pending_treatment` mantienen acción principal visible.
- estados cerrados muestran “Sin acción pendiente” cuando corresponda.

3. **Tests de empty states:**
- Sin solicitudes, sin tratamiento, sin visitas.
- Bloqueo de registrar visita sin tratamiento activo.

4. **Tests de regresión de navegación:**
- Desde hub paciente, cada CTA abre la superficie correcta.
- Back links vuelven al nivel esperado.

---

## 7) Documentación a actualizar

Si se implementan cambios de copy/jerarquía visual (aunque no cambie dominio):
- **Sí** actualizar `docs/fuente-de-verdad-operativa.md` con vocabulario UI oficial (Solicitud / Tratamiento / Visitas) y convención de estados visibles.
- **Recomendado** actualizar `README.md` en sección de producto/admin con mapa corto de superficies.
- **Sí** ejecutar checklist `docs/checklist-sincronizacion-doc-codigo.md` para cualquier cambio de comportamiento UI visible (naming, CTA, estados, helper texts).

---

## 8) Cierre

Esta auditoría propone mejoras de claridad operativa en capas de presentación (copy, jerarquía visual, badges y navegación), sin tocar reglas clínicas, modelos FHIR ni contratos de datos. El enfoque en parches acotados reduce riesgo y facilita validar impacto con tests de UI antes de sumar features.

---

## 9) Cierre posterior de implementación (2026-05-05)

**Estado:** Cerrada / implementada / aprobada.

Se completaron los 4 parches definidos:
- **Patch 1 (naming/CTAs):** homologación de “Gestión administrativa”, “Gestión clínica” y “Tratamiento”; “Registrar visita” reservado para acción puntual.
- **Patch 2 (estados/badges):** separación visible entre estado administrativo de solicitud y estado clínico vinculado, con convención emerald/amber/slate/red y “Sin acción pendiente.” en no accionables.
- **Patch 3 (helper texts/microcopy):** unificación de copy operativo en superficies privadas usando fuente route-local (`patient-surface-copy.ts`).
- **Patch 4 (tests/docs):** hardening de regresión y actualización de documentación activa.

Fuente vigente de comportamiento:
- `docs/fuente-de-verdad-operativa.md` (operativo vigente)
- `README.md` (mapa alto nivel)

Este documento queda como **trazabilidad histórica** de diagnóstico y plan, y no reemplaza la fuente operativa vigente.
