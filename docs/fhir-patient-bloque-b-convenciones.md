# FHIR Patient (Bloque B) — convenciones vigentes

Este documento registra decisiones **ya implementadas** para cerrar Bloque B (migración de Patient a FHIR) sin abrir alcance nuevo.

> Última actualización: 2026-04-17 (UTC)

## 1) Notas generales (`Patient.note`)

- Lectura actual: se toman `Patient.note[*].text`, se limpian valores vacíos y se consolidan en un único `string` de dominio con separación `"\n\n"`.
- Escritura/actualización actual: cuando hay `notes` de dominio, se persiste como un array con un item `{ text }`.
- No existe contrato rígido con `note[0]` para lectura de dominio.

**Implicancia:** el slice opera hoy con un único campo `notes` en dominio, aunque FHIR permita múltiples `note`.

## 2) Timestamps (`createdAt`, `updatedAt`)

- Ambos se derivan de `Patient.meta.lastUpdated`.
- Si no existe `meta.lastUpdated`, se usa fallback técnico (`new Date(0).toISOString()`).

**Implicancia:** esto es suficiente para la etapa actual, pero no representa aún semántica histórica completa (alta original vs modificaciones sucesivas).

## 3) Límites vigentes del repositorio FHIR de Patient

- `listPatients` usa query básica (sin paginación avanzada).
- No hay estrategia sofisticada de orden en el listado.
- `updatePatient` mantiene estrategia `GET -> merge controlado -> PUT`.
- No hay concurrencia optimista todavía (`If-Match`/versionado).

## Deuda explícita aceptada (vigente post-Encounter base)

- Definir semántica histórica de timestamps si el producto la necesita.
- Definir estrategia de paginación/orden cuando el volumen lo requiera.
- Evaluar concurrencia optimista cuando haya edición concurrente real.
