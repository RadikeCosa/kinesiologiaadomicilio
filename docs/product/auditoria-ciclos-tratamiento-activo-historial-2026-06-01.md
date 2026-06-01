# Auditoría — Ciclos de tratamiento activo e historial cerrado

Fecha: 2026-06-01

## 1. Resumen ejecutivo

Diagnóstico: el comportamiento actual es **parcialmente correcto y razonablemente protegido en las superficies clínicas principales**. Cuando conviven tratamientos finalizados con un tratamiento activo, los loaders revisados priorizan el `EpisodeOfCare` activo para estado operativo, resumen clínico reciente, visitas, estadísticas y métricas funcionales. Los tratamientos finalizados quedan como historial en `/treatment` y las solicitudes se clasifican por vínculo real `EpisodeOfCare.referralRequest`/`incoming-referral`.

El riesgo principal no está en la mezcla clínica normal, sino en la **ambigüedad técnica de naming** entre `latestEpisode`, `mostRecentEpisode` y `effectiveEpisode`, más la falta de una defensa explícita ante datos corruptos con dos episodios activos simultáneos. Si no se cambia nada, el producto probablemente seguirá funcionando bien con datos normales, pero queda expuesto a regresiones por uso semántico incorrecto de `latestEpisode` y a resultados no determinísticos si HAPI devuelve más de un activo.

## 2. Regla de producto recomendada

- `activeEpisode`: único tratamiento operativo actual. Si existe, domina todas las superficies clínicas y operativas.
- `closedEpisodes`: tratamientos finalizados. Son historial, no deben alimentar visitas, métricas ni contexto clínico actual cuando hay activo.
- `effectiveEpisode`: `activeEpisode ?? mostRecentEpisode`. Debe usarse para superficies de lectura que necesitan mostrar un ciclo cuando no hay activo.
- `latestEpisode`: nombre riesgoso. En el código actual a veces significa `active ?? mostRecent`; debería evitarse o documentarse como alias de lectura derivada, nunca como “último por fecha” capaz de desplazar al activo.
- `mostRecentEpisode`: episodio más reciente por `period.start`, útil solo como fallback cuando no hay activo o para historial. No debería ser fuente operativa si existe activo.

Recomendación de naming: centralizar un selector explícito:

```ts
selectPatientEpisodes({ episodes }) => ({
  activeEpisode,
  closedEpisodes,
  mostRecentEpisode,
  effectiveEpisode: activeEpisode ?? mostRecentEpisode,
  hasMultipleActiveEpisodes,
})
```

## 3. Auditoría por superficie

### `/admin/patients`

- Datos: `loadPatientsList()` lee pacientes y hace batch de `EpisodeOfCare` por `patientIds`.
- Prioridad: calcula `activeEpisode = patientEpisodes.find(status === "active")`, luego `latestEpisode = activeEpisode ?? getMostRecentEpisode(patientEpisodes)` en `src/app/admin/patients/data.ts:54`.
- UI: el filtro “En tratamiento” usa `operationalStatus === "active_treatment"`, por lo que un paciente con finalizados previos + activo actual aparece como en tratamiento.
- Riesgo de mezcla: bajo en estado/listado. Riesgo medio de naming porque `latestEpisode` ya viene protegido, pero su nombre sugiere “último cronológico”.
- Tests existentes: cubren batch y orden operativo, pero no explícitamente el caso “varios finalizados + activo”.
- Tests faltantes: fixture con Episode A/B finalizados y Episode C activo verificando badge, filtro y prioridad.

### `/admin/patients/[id]`

- Datos: `loadPatientDetail()` usa `activeEpisode ?? getMostRecentEpisodeByPatientId()` antes de mapear detalle; `loadPatientClinicalRecentSummary()` calcula `effectiveEpisode = activeEpisode ?? mostRecentEpisode`.
- Prioridad: el resumen clínico filtra encounters por `effectiveEpisode.id` antes de buscar métricas, en `src/app/admin/patients/[id]/data.ts:121`.
- UI: si hay activo, la acción primaria es clínica y el status del resumen es “Tratamiento activo” o “Nuevo tratamiento activo”.
- Riesgo de mezcla: bajo para visitas/métricas porque se filtra por episodio efectivo. Riesgo técnico menor: el resumen busca observations por encounter en N consultas, no batch, pero no mezcla ciclos.
- Tests existentes: hay tests de SR/hub, pero falta uno directo para hub clínico con finalizado + activo.
- Tests faltantes: resumen clínico debe ignorar encounters/observations del finalizado si hay activo sin visitas.

### `/admin/patients/[id]/treatment`

- Datos: usa `patient.activeEpisode` para el ciclo activo y `loadTreatmentEpisodeHistoryContext()` para finalizados.
- Prioridad: el formulario de contexto clínico solo se muestra con `activeEpisode`; el resumen de finalizado solo aparece si no hay activo.
- UI: muestra “Tratamiento activo” con inicio; muestra “Historial de ciclos cerrados” incluso si hay activo. El historial compacto lista solo inicio, mientras que motivo/detalle completo se ve en el resumen del último finalizado solo cuando no hay activo.
- Riesgo de mezcla: bajo en operación; medio en UX porque el historial con activo no muestra motivo/detalle de cierre de forma suficiente.
- Tests existentes: tests de página de treatment, pero no se observó cobertura específica para activo + múltiples finalizados.
- Tests faltantes: activo visible, historial cerrado visible, no renderizar resumen de finalizado como principal cuando hay activo.

### `/admin/patients/[id]/encounters`

- Datos: `loadPatientEncountersPageData()` lee activo, más reciente y encounters; define `effectiveEpisode = activeEpisode ?? mostRecentEpisode`.
- Prioridad: filtra visits por `encounter.episodeOfCareId === effectiveEpisode.id`; luego pide observations batch solo para esos encounter ids y vuelve a filtrar por `patientId` + `encounterId`, en `src/app/admin/patients/[id]/encounters/data.ts:83`.
- UI: si no hay activo pero hay finalizado, muestra visitas históricas del finalizado y bloquea registrar nuevas visitas; si hay activo, habilita registrar visita.
- Estadísticas: se calculan sobre `encountersWithFunctional` ya filtrados y con `episodeOfCareId` efectivo.
- Riesgo de mezcla: bajo. Esta es la superficie mejor defendida.
- Tests existentes: existe test explícito “does not mix previous episode metrics when active episode has no encounters” y filtro defensivo de observations fuera del set efectivo.
- Tests faltantes: caso completo con dos finalizados + activo con visitas en ambos lados y estadísticas esperadas.

### `/admin/patients/[id]/administrative`

- Datos: ordena `ServiceRequest` por `requestedAt`; para accepted/in_review consulta `listEpisodeOfCareByIncomingReferral()`.
- Prioridad: una solicitud accepted con vínculo a episodio activo se clasifica como `accepted_linked_active_treatment`; con episodio finalizado como `accepted_linked_finished_treatment`; sin vínculo queda `accepted_pending_treatment`.
- UI: separa “Solicitud activa a resolver” del “Historial de solicitudes” y muestra estado clínico vinculado, fechas y cierre.
- Riesgo de mezcla: bajo en clasificación por vínculo real. Riesgo medio por N+1 en `loadPatientServiceRequestHistoryContext()` si crece el historial, pero no por mezcla semántica.
- Tests existentes: cubren accepted vinculado a activo/finalizado y pending.
- Tests faltantes: varias solicitudes accepted vinculadas a ciclos distintos, más una accepted sin vínculo.

### `/admin`

- Datos: `loadAdminDashboard()` reutiliza `loadPatientsList()` y calcula solicitudes accepted pendientes excluyendo las que ya tienen `incoming-referral`.
- Prioridad: al depender de `loadPatientsList()`, mantiene activo sobre finalizados para resumen operativo.
- Riesgo de mezcla: bajo para métricas agregadas de estado. No expone visitas ni métricas clínicas globales.
- Tests existentes: cubren batch de SR y resumen operativo.
- Tests faltantes: dashboard con paciente finalizado + activo debe contarse una vez como `active_treatment`, no `finished_treatment`.

## 4. Auditoría de capa técnica

- Repositorio `EpisodeOfCare`: `getMostRecentEpisode()` compara timestamps con `new Date().getTime()` y maneja fechas inválidas/ties de forma estable. Correcto para evitar comparación lexicográfica.
- `getActiveEpisodeByPatientId()`: consulta `status=active`, pero usa `extractSingleResource()` y toma el primer recurso del bundle. No detecta múltiples activos.
- Batch por patient ids: `listEpisodesByPatientIds()` deduplica ids y consulta `EpisodeOfCare?patient=Patient/{id1},Patient/{id2}`.
- Batch por incoming-referral: `listEpisodesByIncomingReferralIds()` existe y se usa en `/admin`; las páginas administrativas por paciente aún usan consulta por solicitud.
- Mappers EoC: lectura extrae `serviceRequestId` desde `referralRequest`; cierre lee extensiones nuevas y fallback legacy por `note[]`. Escritura crea `referralRequest` al iniciar tratamiento y persiste cierre en extensiones.
- Domain rules: `getPatientOperationalStatus()` prioriza `hasActiveEpisode` antes de `hasFinishedEpisode`, correcto para activo + finalizados.
- Server-side start guard: `startEpisodeOfCareAction()` bloquea iniciar si ya hay activo, exige `ServiceRequest.accepted`, pertenencia al paciente, fecha válida y single-use por `incoming-referral`.
- Normalización de estados FHIR: se usa `status` de dominio directamente. No se vio hardening centralizado para estados inesperados de `EpisodeOfCare`; en SR sí hay clasificación defensiva de display.
- Observations: `/encounters` usa scoping robusto por encounter ids efectivos y patient id. El hub usa scoping por encounters efectivos, pero consulta observations por encounter individual.

## 5. Casos de prueba recomendados

A. Paciente sin tratamientos: estado `ready_to_start` o `preliminary` según datos mínimos; encounters vacío; treatment invita a solicitud.

B. Paciente con un finalizado: estado `finished_treatment`; encounters muestra historial del finalizado; no habilita registrar visita.

C. Paciente con varios finalizados: `mostRecentEpisode` es el de `startDate` más reciente; historial ordenado por `endDate ?? startDate`.

D. Paciente con activo solamente: estado `active_treatment`; registro de visitas habilitado; métricas del activo.

E. Paciente con varios finalizados + activo: todas las superficies priorizan activo; encounters y observations de finalizados no aparecen en resumen operativo.

F. Paciente con solicitud accepted vinculada a finalizado: administrative la muestra como histórica, sin acción pendiente.

G. Paciente con solicitud accepted vinculada a activo: administrative la muestra como vinculada a tratamiento activo, sin acción pendiente.

H. Paciente con accepted sin vínculo: administrative la muestra como pendiente de iniciar tratamiento.

I. Caso defensivo dos activos simultáneos: el selector debe reportar `hasMultipleActiveEpisodes`; UI/logs deberían advertir y no depender del orden del bundle.

## 6. Recomendación de mejora

- Patch 0: agregar tests/documentación de regresión para “finalizados + activo actual”. Si no se cambia código, este patch igual vale porque fija el contrato esperado.
- Patch 1: refactor mínimo de naming/selector. Centralizar `activeEpisode`, `closedEpisodes`, `mostRecentEpisode`, `effectiveEpisode` y reemplazar usos ambiguos de `latestEpisode`.
- Patch 2: hardening server-side y repositorio ante múltiples activos. `getActiveEpisodeByPatientId()` debería detectar más de uno o exponerse una función `listActiveEpisodesByPatientId()` para validación/observabilidad.
- Patch 3: UX de historial en `/treatment`. Cuando hay activo + cerrados, el historial compacto debería mostrar al menos inicio, cierre, motivo, detalle breve y solicitud vinculada.

## 7. No-alcances

- Sin dashboard clínico nuevo.
- Sin gráficos.
- Sin cambiar modelo FHIR salvo necesidad detectada.
- Sin migraciones.
- Sin IA.
- Sin portal.
- Sin rediseño global.

## 8. Propuesta final de decisión

Mantener el comportamiento funcional actual para datos normales, porque ya prioriza el activo y evita mezcla clínica en las superficies críticas. Hacer un patch inmediato de tests para el caso “varios finalizados + activo”, luego un refactor chico de naming/selector para bajar ambigüedad, y después agregar guard/observabilidad ante múltiples activos. La UI de `/treatment` puede mejorarse en un patch separado para comunicar mejor “actual vs historial”.

## Respuestas a preguntas concretas

1. Sí en las superficies revisadas: Episode C activo domina estado, hub, treatment activo y encounters.
2. Sí. El listado muestra “En tratamiento” por `hasActiveEpisode`.
3. El hub usa el activo como efectivo; no debería tomar el último finalizado si hay activo.
4. Sí. `/encounters` filtra por episodio efectivo, que prioriza activo.
5. Sí. Las estadísticas se calculan sobre encounters ya filtrados por episodio efectivo.
6. Sí en `/encounters`; el hub también filtra por encounters efectivos antes de leer observations.
7. Parcialmente. Muestra activo e historial compacto, pero el historial cerrado con activo no comunica motivo/detalle de cierre con suficiente claridad.
8. Sí, por vínculo real `incoming-referral`/`referralRequest`.
9. No se encontró un bug concreto, pero el nombre `latestEpisode` es ambiguo y puede inducir regresiones.
10. Con dos activos, el repositorio toma el primero del bundle; no hay detección explícita.
11. Sí. `startEpisodeOfCareAction()` bloquea si `getActiveEpisodeByPatientId()` devuelve activo.
12. Hay tests parciales, pero falta una regresión transversal “historial finalizado + activo actual”.

## Archivos revisados

- `src/app/admin/patients/page.tsx`
- `src/app/admin/patients/data.ts`
- `src/app/admin/patients/[id]/page.tsx`
- `src/app/admin/patients/[id]/data.ts`
- `src/app/admin/patients/[id]/treatment/page.tsx`
- `src/app/admin/patients/[id]/encounters/page.tsx`
- `src/app/admin/patients/[id]/encounters/data.ts`
- `src/app/admin/patients/[id]/administrative/page.tsx`
- `src/app/admin/patients/[id]/administrative/components/PatientServiceRequestsSection.tsx`
- `src/app/admin/data.ts`
- `src/app/admin/dashboard-metrics.ts`
- `src/domain/episode-of-care/episode-of-care.rules.ts`
- `src/domain/episode-of-care/episode-of-care.types.ts`
- `src/domain/patient/patient.rules.ts`
- `src/domain/encounter/encounter-stats.ts`
- `src/infrastructure/repositories/episode-of-care.repository.ts`
- `src/infrastructure/repositories/encounter.repository.ts`
- `src/infrastructure/repositories/observation.repository.ts`
- `src/infrastructure/repositories/service-request.repository.ts`
- `src/infrastructure/mappers/episode-of-care/episode-of-care-read.mapper.ts`
- `src/infrastructure/mappers/episode-of-care/episode-of-care-write.mapper.ts`
- `src/infrastructure/mappers/patient/patient-read.mapper.ts`
- `src/lib/fhir/search-params.ts`
- `src/lib/fhir/bundle-utils.ts`
- Tests relacionados en `src/app/admin/patients/**/*.test.ts`, `src/domain/encounter/__tests__/encounter-stats.test.ts`, `src/infrastructure/repositories/__tests__/episode-of-care.repository.test.ts` y `tests/integration/admin-patients/*.test.ts`
- `README.md`
- `docs/fuente-de-verdad-operativa.md`
- Documentos FHIR/product de ServiceRequest, EpisodeOfCare, Encounter y Observation listados por `rg`.
