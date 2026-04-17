# Backlog técnico Slice 1 — estado de cierre

> Estado del documento: backlog residual del Slice 1 (post-implementación)
> Última actualización: 2026-04-17 (UTC)

## 1) Propósito

Este archivo deja trazado qué partes del plan técnico del Slice 1:

- quedaron implementadas;
- quedaron transicionales;
- quedaron explícitamente fuera de alcance del slice.

No es roadmap general del proyecto.

## 2) Estado por fases del plan original

| Fase | Estado actual | Nota de cierre |
| --- | --- | --- |
| Fase 1 — estructura y naming | Implementada | Estructura base de `app/admin/patients`, dominio, repositorios y mappers presente. |
| Fase 2 — contratos de dominio | Implementada | Tipos de `patient` y `episode-of-care` disponibles. |
| Fase 3 — reglas de negocio | Implementada | Reglas para alta mínima e inicio de tratamiento aplicadas. |
| Fase 4 — schemas | Implementada | Schemas de create/update/start disponibles y usados por actions. |
| Fase 5 — read models | Implementada | Read models de listado y detalle presentes. |
| Fase 6 — repositorios/mappers | Implementada (FHIR real) | Repositorios y mappers activos sobre backend FHIR para `Patient` y `EpisodeOfCare`. |
| Fase 7 — loaders | Implementada | `loadPatientsList` y `loadPatientDetail` operativos. |
| Fase 8 — server actions | Implementada | `create`, `update`, `start episode` y `finish episode` operativas. |
| Fase 9 — UI mínima | Implementada | Listado, alta, detalle, edición, inicio y finalización de tratamiento. |
| Fase 10 — tests | Implementada (inicial) | Cobertura inicial de unit + integration del slice. |
| Fase 11 — documentación de cierre | Implementada | Documentación del slice y fuente operativa alineadas. |

## 3) Qué ya está hecho en código (y no debe quedar como pendiente)

- rutas privadas mínimas del slice:
  - `/admin/patients`
  - `/admin/patients/new`
  - `/admin/patients/[id]`
- acciones implementadas:
  - `create-patient.action.ts`
  - `update-patient.action.ts`
  - `start-episode-of-care.action.ts`
  - `finish-episode-of-care.action.ts`
- lectura implementada:
  - `src/app/admin/patients/data.ts`
  - `src/app/admin/patients/[id]/data.ts`
- validaciones y reglas implementadas:
  - alta mínima por nombre + apellido;
  - DNI obligatorio para iniciar tratamiento;
  - bloqueo simple por DNI duplicado;
  - bloqueo si hay episodio activo;
  - finalización permitida solo con episodio activo.
- dirección operativa implementada en flujo actual:
  - carga en alta;
  - edición de ficha;
  - visualización en detalle;
  - persistencia en `Patient.address` simple (`text`).
- estado operativo visible implementado:
  - listado y detalle distinguen episodio activo, tratamiento finalizado y ausencia de tratamiento.
- tests iniciales implementados:
  - unit tests de dominio/schemas;
  - integration tests para actions/loaders del slice.

## 4) Backlog residual real del Slice 1

El remanente del slice no es funcional nuevo, sino deuda técnica de estabilización:

1. **Endurecimiento pre-producción**
   - robustecer manejo de errores/observabilidad sobre repositorios FHIR actuales.
2. **Concurrencia y consistencia**
   - evaluar `If-Match`/versionado en updates (`Patient`, `EpisodeOfCare`) cuando el contexto lo requiera.

## 5) Fuera de alcance confirmado (no remanente de Slice 1)

No deben volver a listarse como “pendiente de Slice 1”:

- encounters / visitas;
- historial longitudinal;
- auth;
- agenda;
- pagos;
- `/portal`;
- multiusuario;
- deduplicación avanzada.

## 6) Límites vigentes (deben mantenerse explícitos)

- FHIR real acotado a `Patient` y `EpisodeOfCare`, sin Encounter;
- dirección mantenida como string simple (sin modelo postal rico);
- sin hard-gate por dirección para inicio de tratamiento en esta etapa;
- sin auth;
- sin encounters;
- sin historial longitudinal;
- sin cobertura de operación clínica completa.

## 7) Nota editorial

Este backlog reemplaza el enfoque anterior de “plan futuro por fases” para evitar confundir tareas ya implementadas con pendientes.

Si el siguiente slice abre nuevo alcance funcional, se recomienda crear backlog nuevo por slice y dejar este archivo congelado como cierre técnico del Slice 1.
