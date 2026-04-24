# Auditoría post-implementación — Fase 1 contrato temporal Encounter

Fecha: 2026-04-24

> Actualización: parte de la deuda identificada en esta auditoría fue atendida en un cleanup posterior (renames `Occurrence`->`Start`, saneamiento read mapper para `end < start`, reducción de emisión de `occurrenceDate`).

## A. Executive summary

La implementación de Fase 1 quedó **funcional y mayormente coherente** con el objetivo:
- `startedAt` obligatorio + `endedAt` opcional en dominio/schema;
- create sin `period.end` artificial cuando no hay `endedAt`;
- read con fallback legacy y ocultamiento de `endedAt` en casos históricos `start === end`;
- inline edit limitado a inicio y con protección para no mover inicio luego del fin existente;
- UI actualizada en `/encounters/new` y `/encounters`.

Riesgos detectados:
1) `occurrenceDate` sigue presente en más capas de las estrictamente necesarias para alias transicional (incluye read mapper + tests), lo que puede prolongar deuda semántica.
2) El read mapper no filtra explícitamente escenarios externos inválidos `end < start` (no rompe, pero podría exponer fin inconsistente si esos datos ya existieran en FHIR).
3) Documentación de plan temporal conserva secciones de “estado actual previo” (válido como histórico, pero potencialmente confuso).

## B. Files inspected

- Dominio/schemas:
  - `src/domain/encounter/encounter.types.ts`
  - `src/domain/encounter/encounter.schemas.ts`
- Mappers/repo:
  - `src/infrastructure/mappers/encounter/encounter-write.mapper.ts`
  - `src/infrastructure/mappers/encounter/encounter-read.mapper.ts`
  - `src/infrastructure/repositories/encounter.repository.ts`
- Actions/UI:
  - `src/app/admin/patients/[id]/encounters/actions/create-encounter.action.ts`
  - `src/app/admin/patients/[id]/encounters/actions/update-encounter-occurrence.action.ts`
  - `src/app/admin/patients/[id]/encounters/components/EncounterCreateForm.tsx`
  - `src/app/admin/patients/[id]/encounters/components/EncountersList.tsx`
  - `src/app/admin/patients/[id]/encounters/components/encounters-inline-edit.state.ts`
  - `src/app/admin/patients/[id]/encounters/data.ts`
  - `src/app/admin/patients/[id]/encounters/new/page.tsx`
- Tests:
  - `src/domain/encounter/__tests__/encounter.schemas.test.ts`
  - `src/infrastructure/mappers/encounter/__tests__/encounter.mapper.test.ts`
  - `src/infrastructure/repositories/__tests__/encounter.repository.test.ts`
  - `src/app/admin/patients/[id]/encounters/actions/__tests__/create-encounter.action.test.ts`
  - `src/app/admin/patients/[id]/encounters/actions/__tests__/update-encounter-occurrence.action.test.ts`
  - `src/app/admin/patients/[id]/encounters/data.test.ts`
  - `src/app/admin/patients/[id]/encounters/components/EncounterCreateForm.test.ts`
  - `src/app/admin/patients/[id]/encounters/components/EncountersList.test.ts`
- Documentación:
  - `docs/fuente-de-verdad-operativa.md`
  - `README.md`
  - `docs/plan-evolucion-contrato-temporal-encounter-2026-04-24.md`

## C. Contract consistency review

### 1) Referencias a `occurrenceDate`
Clasificación:
- **Compatibilidad transicional válida**:
  - alias deprecated en `Encounter` y `CreateEncounterInput`.
  - parse legacy de schema (fallback `occurrenceDate -> startedAt`).
  - fallback de mapper write (`input.startedAt || input.occurrenceDate`).
- **Deuda a remover luego**:
  - `occurrenceDate` emitido por read mapper como alias en cada read.
  - varios asserts en tests siguen validando alias.
- **Drift/posible bug**:
  - no se observó un bug directo por `occurrenceDate`; sí riesgo de prolongar dependencia accidental si no se acota su uso.

Resultado: nuevas entradas de UI/action ya usan `startedAt`.

### 2) Dominio/schema
- `startedAt` obligatorio: OK.
- `endedAt` opcional: OK.
- validación `endedAt >= startedAt`: OK.
- compatibilidad legacy payload con `occurrenceDate`: OK.
- estados ambiguos:
  - create protege bien start/end;
  - update inline valida `startedAt` pero no recibe `endedAt` (esperado por alcance).

### 3) Mapper write FHIR
- Create sin `period.end` artificial cuando no hay `endedAt`: OK.
- Update inline preserva `period.end`: OK.
- Bloquea `startedAt > endedAt`: OK.
- Mantiene otros campos del Encounter (`...existing`): OK.

### 4) Mapper read FHIR
- Fallback legacy desde `period.end` cuando falta `period.start`: OK.
- Legacy `start===end` no expone `endedAt`: OK.
- Registros nuevos con `start+end` exponen ambos: OK.
- read model no depende de `occurrenceDate` para lógica operativa, pero sigue devolviendo alias por compatibilidad.

### 5) Repositorio/actions
- create/update usan nuevos contratos: OK.
- ownership/patientId en update action: OK.
- `revalidatePath` create/update: OK.
- manejo de errores: OK (mensajes propagados desde throw en mapper/update).

### 6) UI `/encounters/new`
- labels/copy correctos para inicio/finalización.
- inicio requerido, finalización opcional.
- feedback y redirect se mantienen.
- no se agregó alcance clínico extra.

### 7) UI `/encounters`
- orden por `startedAt`: OK.
- render inicio/finalización/duración condicional: OK.
- legacy sin `endedAt`: render correcto (solo inicio).
- inline edit sigue corrección rápida de inicio.
- ícono edit SVG con `aria-label`: OK.

### 8) Tests
Cobertura relevante presente para:
- schemas (`startedAt` solo, `startedAt+endedAt`, error `endedAt<startedAt`, payload legacy);
- mappers (write con/sin `endedAt`, read legacy/fallback, protección update);
- inline preserve `period.end` vía mapper/repo + action error path;
- orden descendente por `startedAt`;
- listado duración condicional;
- create action mantiene revalidate.

Gap menor:
- falta test explícito de read mapper con `end < start` proveniente de datos externos (para definir criterio de sanitización en lectura).

### 9) Documentación
- README y fuente operativa reflejan Fase 1 de forma coherente.
- El plan temporal incluye nota de seguimiento de implementación, pero conserva secciones históricas del “estado pre-Fase 1”; no es incorrecto, pero conviene clarificar encabezado para evitar lectura ambigua.

## D. Findings por severidad

### Critical
- Ninguno.

### High
- Ninguno bloqueante.

### Medium
1. **`occurrenceDate` sigue saliendo del read mapper como alias global**.
   - Impacto: deuda semántica y posibilidad de consumo accidental en features nuevas.
   - Sugerencia: restringir alias a borde transicional (adapter/API) y no al modelo principal.
2. **Sin criterio explícito en read para `end < start` externo**.
   - Impacto: podría mostrarse finalización inconsistente si existen datos anómalos en FHIR legado/manual.
   - Sugerencia: sanitizar `endedAt` cuando `endedAt < startedAt` al leer.

### Low
1. Nombre técnico heredado: `updateEncounterOccurrenceSchema` / `updateEncounterOccurrenceAction`.
   - Impacto: naming drift; no rompe funcionalidad.
2. `saveOccurrenceDate` y `draftOccurrenceDate` en UI state todavía usan naming previo.
   - Impacto: deuda de legibilidad.

### Documentation
1. El plan temporal mezcla estado histórico y estado actual (aunque con nota), puede inducir confusión en lectura rápida.

## E. Remaining `occurrenceDate` references

Resumen de referencias remanentes:
- Dominio/types: alias deprecated (válido transicional).
- Schemas: fallback legacy parse (válido transicional).
- Write mapper: fallback legacy (válido transicional).
- Read mapper: alias emitido siempre (deuda, no bug inmediato).
- Tests: asserts legacy/alias (aceptable por transición).
- Docs de plan: menciones históricas (documentales).

No se detectó uso de `occurrenceDate` en nuevas entradas UI/action de create/update.

## F. Test coverage assessment

Cobertura actual: buena para Fase 1.

Casos pedidos verificados:
- create con `startedAt` solo: sí.
- create con `startedAt + endedAt`: sí.
- error `endedAt < startedAt`: sí.
- read legacy `start===end`: sí.
- inline preserva `period.end`: sí (mapper/repo/action).
- orden por `startedAt` descendente: sí.
- listado muestra duración solo cuando corresponde: sí.

Gap recomendado:
- test específico de read con `end < start` externo.

## G. Recommended fixes (si hay)

Sin implementar en esta auditoría:
1. Sanitizar read mapper para no exponer `endedAt` cuando `endedAt < startedAt`.
2. Mover alias `occurrenceDate` fuera del core model en fase de cleanup (mantener solo en capa transicional).
3. Renombrar APIs internas `Occurrence` -> `Start` para coherencia semántica.

## H. Deferred cleanup plan

Fase de limpieza sugerida (post-estabilización):
1) Renames internos de acciones/schemas/estado UI.
2) Reducir superficie de alias `occurrenceDate` a boundary específico.
3) Agregar test de datos FHIR anómalos (`end < start`) y política de saneamiento explícita.
4) Actualizar docs de plan con snapshot “estado vigente” al inicio para no mezclar histórico vs actual.

## I. Out of scope confirmado

Se confirma que esta fase no abrió:
- Observation,
- Procedure,
- agenda,
- pagos,
- notas clínicas longitudinales,
- edición clínica profunda completa de Encounter.
