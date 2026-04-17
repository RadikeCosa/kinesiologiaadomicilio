# Slice 2 — Encounter base (cierre implementado)

> Estado del documento: cierre post-implementación
> Última actualización: 2026-04-17 (UTC)

## 1) Propósito

Registrar el estado real implementado del slice Encounter base sin mezclarlo con roadmap futuro.

## 2) Qué quedó implementado

### 2.1 Rutas privadas

- `/admin/patients/[id]/encounters`

### 2.2 Capacidades funcionales

- listado básico de encounters del paciente;
- registro de visita realizada simple (`Encounter`);
- creación de encounter bloqueada si no hay `EpisodeOfCare` activo;
- mensajes operativos en UI cuando no se puede registrar visita;
- acceso al tramo de encounters desde el detalle de paciente.

### 2.3 Convenciones técnicas efectivamente usadas

- Encounter base representa visita realizada simple;
- `Encounter.status = "finished"`;
- `occurrenceDate` se persiste como:
  - `Encounter.period.start = occurrenceDate`
  - `Encounter.period.end = occurrenceDate`
- pipeline de escritura:
  - action server-side
  - schema parse
  - regla de dominio
  - repositorio FHIR
  - resultado simple `{ ok, message }`.

### 2.4 Infraestructura implementada

- dominio mínimo: `src/domain/encounter/**`;
- mappers y tipos FHIR mínimos: `src/infrastructure/mappers/encounter/**`;
- repositorio FHIR de encounter: `src/infrastructure/repositories/encounter.repository.ts`;
- shared FHIR mínimo extendido para encounter:
  - `src/lib/fhir/resource-types.ts`
  - `src/lib/fhir/search-params.ts`
  - `src/lib/fhir/references.ts`.

### 2.5 Tests implementados del tramo

- schemas/rules de encounter;
- mappers de encounter;
- repository de encounter con `fhirClient` mockeado;
- action de creación de encounter;
- data loader de `/admin/patients/[id]/encounters`.

## 3) Límites vigentes (siguen fuera)

- `/admin/patients/[id]/encounters/[encounterId]`;
- `Observation`;
- `Procedure`;
- detalle rico de encounter;
- historial longitudinal complejo;
- paginación/orden avanzados para encounters;
- auth productiva completa.

## 4) Criterio de cierre alcanzado

Se considera alcanzado el cierre de Encounter base porque:

- existe ruta privada operativa para encounters por paciente;
- se puede listar encounters básicos;
- se puede registrar visita simple con gate de episodio activo;
- la convención temporal/status de Encounter quedó aplicada en mapper/repositorio;
- hay cobertura de tests para dominio, infraestructura y route-local del tramo;
- no se abrió alcance fuera de slice (sin detalle por `encounterId`, sin Observation/Procedure).

## 5) Relación con documento de diseño pre-implementación

- `docs/slice-2/encounter-base-pre-implementacion.md` se conserva como documento de diseño/decisión previa.
- Este documento (`slice-2-encounter-base-cierre.md`) es la referencia de estado implementado real del Slice 2.
