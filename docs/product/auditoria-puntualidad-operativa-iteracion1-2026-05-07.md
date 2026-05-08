# Auditoría de cierre — Iteración 1 puntualidad operativa manual en Encounter (2026-05-07)

## Estado
- Cerrada / aprobada para alcance Iteración 1.

## Alcance implementado
- Captura opcional en alta de visita (`/admin/patients/[id]/encounters/new`) con campo `visitStartPunctuality`.
- Persistencia en `Encounter.extension[]` con URL versionada:
  - `https://kinesiologiaadomicilio.local/fhir/StructureDefinition/encounter-operational-punctuality-status-v1`
- `valueCode` permitido:
  - `on_time_or_minor_delay`
  - `delayed`
  - `severely_delayed`
- Render en card de `/admin/patients/[id]/encounters` solo cuando existe.

## Reglas confirmadas
- Dato operativo manual y transicional.
- No clínico: no se mezcla con `clinicalNote` ni `Observation`.
- No modifica contrato temporal vigente de visita (`startedAt`/`endedAt`).
- Lectura tolerante: códigos o URLs desconocidas se ignoran sin romper.
- Escritura no invasiva: no se agrega extensión cuando el dato no está cargado.

## No-alcances preservados
- Sin `Appointment`.
- Sin `scheduledStartAt`.
- Sin `delayMinutes` calculado.
- Sin KPI/estadísticas operativas ni dashboard.
- Sin cambios en IA / Procedure / Goal.

## Evidencia de test mínima
- Schema: undefined, valores válidos e inválidos.
- Mapper: write/read + tolerancia a URL/código desconocido.
- UI: radios presentes y render condicional en card (cobertura dentro de tests de componentes).
