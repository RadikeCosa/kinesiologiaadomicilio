# Backlog técnico Slice 1 — estado de cierre

> Estado del documento: backlog residual del Slice 1 (post-implementación)
> Última actualización: 2026-04-16 (UTC)

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
| Fase 6 — repositorios/mappers | Implementada (transicional) | Repositorios y mappers activos con dataset in-memory. |
| Fase 7 — loaders | Implementada | `loadPatientsList` y `loadPatientDetail` operativos. |
| Fase 8 — server actions | Implementada | `create`, `update`, `start episode` operativas. |
| Fase 9 — UI mínima | Implementada | Listado, alta, detalle, edición e inicio de tratamiento. |
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
- lectura implementada:
  - `src/app/admin/patients/data.ts`
  - `src/app/admin/patients/[id]/data.ts`
- validaciones y reglas implementadas:
  - alta mínima por nombre + apellido;
  - DNI obligatorio para iniciar tratamiento;
  - bloqueo simple por DNI duplicado;
  - bloqueo si hay episodio activo.
- tests iniciales implementados:
  - unit tests de dominio/schemas;
  - integration tests para actions/loaders del slice.

## 4) Backlog residual real del Slice 1

El remanente del slice no es funcional nuevo, sino deuda técnica de transición:

1. **Persistencia real**
   - reemplazar repositorios in-memory por persistencia estable.
2. **Integración FHIR real**
   - mantener frontera repository/mapper, conectando con backend FHIR real cuando corresponda.
3. **Endurecimiento pre-producción**
   - robustecer manejo de errores/observabilidad al migrar fuera de in-memory.

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

- implementación actual transicional/in-memory;
- sin FHIR real;
- sin auth;
- sin encounters;
- sin historial longitudinal;
- sin persistencia productiva.

## 7) Nota editorial

Este backlog reemplaza el enfoque anterior de “plan futuro por fases” para evitar confundir tareas ya implementadas con pendientes.

Si el siguiente slice abre nuevo alcance funcional, se recomienda crear backlog nuevo por slice y dejar este archivo congelado como cierre técnico del Slice 1.
