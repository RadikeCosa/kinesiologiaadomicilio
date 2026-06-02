# FHIR-CONSISTENCY-001A — Semántica de éxito parcial en creación de visita

> Estado: **cerrado / aprobado**  
> Fecha de cierre: 2026-05-12 (UTC)  
> Tipo: decisión operativa V1 + ajuste de contrato de server action

## 1) Contexto

En la creación de visita (`Encounter`) con métricas funcionales (`Observation`) existía inconsistencia semántica:

- primero se creaba `Encounter`;
- luego se intentaba crear métricas funcionales;
- si fallaba alguna métrica, la action devolvía error total (`ok:false`) aun cuando la visita podía haber quedado persistida.

## 2) Decisión V1

No se implementa atomicidad dura entre `Encounter` y `Observation` en este paso.

- `Encounter` es la unidad principal de la visita realizada.
- `Observation` funcional es un anexo opcional que puede fallar parcialmente.

## 3) Contrato operativo vigente

La action de creación de visita distingue tres estados:

1. **Fallo total**: `ok:false` (no se creó `Encounter`).
2. **Éxito total**: `ok:true`, `partial:false` (`Encounter` y métricas guardadas).
3. **Éxito parcial**: `ok:true`, `partial:true` (`Encounter` creado, una o más métricas fallaron).

Cuando hay éxito parcial:

- no se borra `Encounter`;
- no se hace rollback compensatorio;
- se informa mensaje explícito de éxito parcial;
- se reportan `failedObservationCodes`.

## 4) Implementación aplicada

- reemplazo de `Promise.all` por `Promise.allSettled` para creación de métricas funcionales;
- logging server-side mínimo con `patientId`, `encounterId`, `failedObservationCodes`;
- preservación de semántica de fallo total solo para casos donde no se crea `Encounter`.

## 5) Pendientes explícitos

1. reintento manual dirigido de métricas funcionales para `Encounter` existente;
2. eventual validación/integración real contra HAPI si se decide;
3. performance/N+1 de `Observation` continúa fuera de este PR.

## 6) No-alcances preservados

- sin rollback compensatorio;
- sin transacciones Bundle;
- sin colas/jobs;
- sin dashboard;
- sin cambios de recursos FHIR;
- sin cambios de rutas;
- sin rediseño UI;
- sin mezclar N+1/performance.

## 7) Trazabilidad técnica

- `src/app/admin/patients/[id]/encounters/actions/create-encounter.action.ts`
- `src/app/admin/patients/[id]/encounters/actions/__tests__/create-encounter.action.test.ts`

## 8) Validación de cierre

- `npm run test -- src/app/admin/patients/[id]/encounters/actions/__tests__/create-encounter.action.test.ts` ✅
- `npm run lint && npm run test` ✅
