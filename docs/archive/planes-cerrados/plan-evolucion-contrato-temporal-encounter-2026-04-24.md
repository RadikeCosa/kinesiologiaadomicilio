> Estado: archivado  
> Motivo: Documento histórico de auditoría/cierre/plan ya superado por la fuente operativa vigente o por implementación cerrada.  
> Fecha de archivo: 2026-04-28  
> Reemplazado/relacionado con: docs/fuente-de-verdad-operativa.md

# Plan técnico — evolución del contrato temporal de Encounter

Fecha: 2026-04-24
Estado base: alta de visita ya migrada a `/admin/patients/[id]/encounters/new`.

> Nota de seguimiento histórica: Fase 1 (`startedAt` obligatorio + `endedAt` opcional con compatibilidad legacy) implementada posteriormente sobre este plan.
> Cleanup posterior: lectura tolerante de datos externos con `end < start` (se preserva `startedAt` y se oculta `endedAt` inválido) y reducción de superficie de `occurrenceDate` a compatibilidad de entrada.
> Estado vigente (cierre de fase, 2026-04-26): alta y edición temporal en `/encounters/new` y `/encounters` operan con `startedAt` + `endedAt` obligatorios, validación `endedAt >= startedAt` y validación de rango temporal contra tratamiento/fecha futura en server/domain.

## A. Estado base histórico del contrato temporal (momento original del plan)

- El dominio usaba un único campo temporal `occurrenceDate` para representar la visita (sin distinguir inicio y fin).
- En create e inline update ese único valor se persistía en FHIR como `period.start` y `period.end` con el mismo timestamp.
- La lectura de FHIR priorizaba `period.start` y caía a `period.end` si no había start, volviendo siempre a `occurrenceDate`.
- El listado, ordenamiento e inline edit operaban sobre `occurrenceDate` (incluyendo el input `datetime-local`).

Deuda principal identificada en ese momento:
- No hay forma de expresar duración real de sesión.
- El inline edit pisa implícitamente `start` y `end` al mismo valor.
- No existe regla de validación `end >= start` porque no hay ambos campos en dominio.

## A.1 Estado operativo vigente (referencia de cierre)

- Contrato temporal vigente de alta y edición:
  - `startedAt` obligatorio;
  - `endedAt` obligatorio;
  - `endedAt >= startedAt`.
- La edición temporal en `/encounters` reemplazó el esquema de “solo inicio” y actualiza período completo.
- La lectura/listado conserva tolerancia legacy para datos históricos/externos, sin redefinir el contrato operativo vigente.
- Eliminación/anulación y edición clínica profunda siguen fuera de alcance de esta fase.

## B. Opciones de diseño

### Opción 1) Mantener `occurrenceDate` + agregar `endedAt`
**Pros**
- Cambios incrementales mínimos en UI/listado existente.
- Compatibilidad alta con código actual y encounters legacy.

**Contras**
- Semántica asimétrica (`occurrenceDate` ambiguo + `endedAt` explícito).
- A largo plazo dificulta consistencia mental/modelado.

**Impacto**
- Tipos/schemas: medio.
- Mappers/tests: medio.
- Legacy: simple (si `endedAt` vacío, sigue comportamiento actual).

### Opción 2) Renombrar a `startedAt` + `endedAt`
**Pros**
- Semántica clara para producto y técnica.
- Buen puente hacia período real en FHIR.

**Contras**
- Rompe contrato actual en más superficies de una vez.
- Requiere migrar naming en listado/tests/actions de forma coordinada.

**Impacto**
- Tipos/schemas/UI/tests: alto inicial.
- Legacy: manejable con fallback desde `occurrenceDate` o period start.

### Opción 3) Usar objeto `period: { start, end }` en dominio
**Pros**
- Alineación directa con FHIR.
- Extensible para validaciones y estado de sesión.

**Contras**
- Introduce más complejidad de acceso en UI simple.
- Puede sobredimensionar el dominio para la etapa actual.

**Impacto**
- Dominio/read-model/UI/tests: alto.
- Legacy: requiere adaptadores más explícitos.

### Opción 4) Mantener dominio simple y mapear start/end solo en FHIR
**Pros**
- Menos cambios de front y tests de UI.
- Baja fricción de implementación.

**Contras**
- Esconde complejidad temporal donde más se necesita (dominio).
- Difícil validar `end >= start` fuera de capa infra.

**Impacto**
- Bajo corto plazo; deuda alta mediano plazo.
- Legacy: fácil, pero posterga decisión estructural.

## C. Recomendación

Recomendar **Opción 2 (`startedAt` + `endedAt`)** con rollout en dos fases:
1) fase de compatibilidad: `endedAt` opcional y adapter transicional desde/hacia `occurrenceDate`;
2) fase de consolidación: remover dependencia semántica de `occurrenceDate` en create/edit nuevos.

Razón:
- Mantiene modelo simple y claro sin llegar a sobrediseño de objeto complejo completo.
- Da base sólida para validar `end >= start` y calcular duración.
- Permite mantener encounters legacy sin ruptura.

## D. Decisión sobre hora de finalización

Recomendación:
- **Opcional al principio, con objetivo de volverla obligatoria más adelante**.

Justificación:
- Minimiza fricción operativa inicial en alta.
- Permite migrar legacy y flujos existentes.
- Habilita aprendizaje UX antes de endurecer validación.

No recomendar autocompletar por defecto (ej. +45 min) en esta etapa para evitar datos clínicos artificiales.

## D.1) Fase 2 operativa (actualización 2026-04-26)

Decisión vigente para altas nuevas desde UI/action/schema (`/encounters/new`):
- `startedAt` obligatorio;
- `endedAt` obligatorio;
- regla temporal obligatoria `endedAt >= startedAt`.

Alcance explícito de la decisión:
- endurece el contrato **operativo de alta nueva**;
- no endurece lectura legacy ni datos históricos externos.

Compatibilidad:
- se mantiene tolerancia de lectura para `period.end` ausente;
- se mantiene tolerancia para encuentros históricos con `start === end`.

Nota FHIR:
- FHIR permite omitir `Encounter.period.end`, pero la app aplica una regla local más estricta para registrar visitas realizadas en la operación diaria.


## E. Validaciones mínimas

1. Formatos aceptados:
- `datetime-local` (`YYYY-MM-DDTHH:mm`) en UI.
- FHIR `dateTime` con zona u offset en capa de persistencia.

2. Normalización:
- Reutilizar `normalizeToFhirDateTime` para `startedAt` y `endedAt`.

3. Zona horaria:
- Mantener normalización con offset local al convertir `datetime-local`.
- Mantener display local 24h.

4. Regla temporal:
- Si `endedAt` existe, validar `endedAt >= startedAt`.

5. Vacíos:
- `startedAt` obligatorio en create.
- `endedAt` opcional en fase 1.

6. Mensajes:
- `startedAt: es obligatorio.`
- `endedAt: debe ser igual o posterior al inicio.`
- `endedAt: formato dateTime inválido.`

## F. Impacto en UI

### `/encounters/new`
- Reemplazar campo único por:
  - Inicio de sesión *
  - Finalización de sesión (opcional en fase 1)
- Mantener copy en lenguaje operativo: “visita”, “sesión”, “inicio”, “finalización”.

### Listado `/encounters`
- Mostrar inicio siempre.
- Mostrar finalización solo si existe.
- Mostrar duración solo si `start` y `end` válidos.

### Empty states
- Sin cambios estructurales en esta iteración de contrato.

### Inline edit
- Mantener como corrección rápida del inicio en fase 1.

## G. Estrategia para inline edit

Elegir: **mantener edición rápida solo de inicio** en la primera fase de evolución temporal.

Motivo:
- Evita duplicar complejidad en UI de lista.
- Reduce riesgo de introducir errores de período durante la transición.
- Permite luego evaluar edición de período completo con diseño dedicado.

## H. Plan incremental de implementación

1. Dominio/schema
- Introducir `startedAt` y `endedAt?` en tipos de input/domain.
- Mantener compatibilidad transicional leyendo/escribiendo `occurrenceDate` donde corresponda.
- Agregar validación `end >= start`.

2. Mapper write/read
- Create/update write: setear `period.start = startedAt`, `period.end = endedAt ?? startedAt` solo durante compatibilidad.
- Read mapper: mapear `startedAt` desde `period.start ?? period.end`; `endedAt` desde `period.end` solo si difiere o existe explícitamente.

3. Form new
- Agregar segundo campo `endedAt` opcional.
- Enviar payload nuevo y mantener mensajes UX actuales.

4. Listado/display
- Mostrar inicio/finalización/duración condicional.
- Mantener ordenamiento por inicio (`startedAt`) durante transición.

5. Inline edit
- Mantener update de inicio únicamente.
- Evitar sobreescribir fin cuando ya exista.

6. Tests
- Actualizar schemas, mappers, actions, data sorting y componentes.
- Agregar casos legacy (sin end, solo start, solo end legado).

7. Documentación
- Ajustar fuente de verdad operativa y guías FHIR con contrato transicional explícito.

## I. Riesgos

- Riesgo de inconsistencias temporales en legacy (encounters sin `start` o con `end` igual a `start`).
- Riesgo UX por ambigüedad si el listado no distingue claramente inicio/finalización.
- Riesgo técnico si inline edit sigue pisando `end` en encuentros nuevos con duración real.
- Riesgo de regresión en ordenamiento/listado si no se define claramente campo de orden.

## J. Out of scope (confirmado)

- No abrir `Observation`.
- No abrir `Procedure`.
- No abrir agenda.
- No abrir pagos.
- No abrir notas clínicas longitudinales.
- No implementar edición clínica profunda del Encounter en esta fase.
