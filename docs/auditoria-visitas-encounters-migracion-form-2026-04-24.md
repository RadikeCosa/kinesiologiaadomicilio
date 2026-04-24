# Auditoría técnica + UX/UI — flujo de visitas/encounters

Fecha: 2026-04-24
Scope: `/admin/patients/[id]/encounters` y dependencias directas.

## Executive summary

- **Viabilidad de mover el form a pantalla propia: alta**. El formulario actual está acoplado a la página por props mínimas (`patientId`, `activeEpisodeId`) y por `router.refresh()`, pero no comparte estado React con el listado ni con la edición inline.
- **Riesgo principal**: inconsistencias de gating y feedback al separar pantallas (hoy hay gating en UI y en server action, con mensajes no totalmente uniformes; además `createEncounterAction` no revalida ruta explícitamente).
- **Dirección recomendada**: mantener `/encounters` como listado + contexto + CTA y crear `/encounters/new` para alta de visita, reutilizando acción y schema actuales, con ajuste incremental de contratos para preparar `period.start` + `period.end`.

## Files inspected

- `src/app/admin/patients/[id]/encounters/page.tsx`: layout de página, composición form/listado, contexto de tratamiento.
- `src/app/admin/patients/[id]/encounters/data.ts`: loader de paciente/episodio/encounters y orden.
- `src/app/admin/patients/[id]/encounters/components/EncounterCreateForm.tsx`: form actual, submit, feedback y bloqueo por tratamiento activo.
- `src/app/admin/patients/[id]/encounters/components/EncountersList.tsx`: listado, empty states, edición inline de fecha/hora.
- `src/app/admin/patients/[id]/encounters/components/encounters-inline-edit.state.ts`: estado y reglas de edición inline.
- `src/app/admin/patients/[id]/encounters/actions/create-encounter.action.ts`: validación server-side de tratamiento activo + persistencia.
- `src/app/admin/patients/[id]/encounters/actions/update-encounter-occurrence.action.ts`: actualización inline + `revalidatePath`.
- `src/domain/encounter/encounter.schemas.ts`: normalización/validación de dateTime para create/update.
- `src/domain/encounter/encounter.rules.ts`: regla de negocio de bloqueo sin tratamiento activo.
- `src/infrastructure/repositories/encounter.repository.ts`: acceso FHIR Encounter.
- `src/infrastructure/mappers/encounter/encounter-write.mapper.ts`: mapeo create/update (`period.start` y `period.end` iguales).
- `src/infrastructure/mappers/encounter/encounter-read.mapper.ts`: lectura hacia `occurrenceDate`.
- `src/lib/fhir/date-time.ts`: normalización de `datetime-local` a FHIR dateTime con offset.
- `src/lib/date-input.ts`: util para `datetime-local` en edición inline.
- `src/lib/patient-admin-display.ts`: formateo de fecha/hora 24h y labels de estado.
- `src/app/admin/patients/[id]/encounters/*.test.ts`: cobertura de page/loader/listado/actions/inline state.
- `src/app/admin/patients/new/page.tsx`: convención de rutas `new` en App Router.
- `src/app/admin/patients/components/PhoneContactBlock.tsx` y `src/app/admin/patients/[id]/page.tsx`: referencia de estilo de acciones e iconografía SVG/aria para comparar con ícono de edición de encounters.

## Current flow map

1. Render server page
   - `page.tsx` resuelve `id`, carga `loadPatientEncountersPageData(id)` y además `loadPatientDetail(id)` para metadata compacta.
   - Si no hay paciente, devuelve estado “no encontrado”.
   - Si hay paciente, renderiza contexto de tratamiento + form + listado.

2. Carga de datos
   - `data.ts` busca paciente, episodio activo, episodio más reciente y encounters.
   - Ordena encounters por `occurrenceDate` real (timestamp), con fallback estable en fechas inválidas/faltantes.

3. Gating
   - UI: `EncounterCreateForm` bloquea alta si `activeEpisodeId` es null.
   - Server: `createEncounterAction` vuelve a validar episodio activo y verifica coherencia de `episodeOfCareId`.

4. Submit
   - Form client-side arma payload mínimo (`patientId`, `episodeOfCareId`, `occurrenceDate`) y llama server action.
   - En success/error muestra feedback local (`useFormFeedback`) y en success hace `router.refresh()`.

5. Persistencia FHIR
   - `createEncounterAction` parsea schema (normaliza fecha), valida regla, persiste por repository.
   - Mapper write setea `Encounter.status = finished` y `period.start=end=occurrenceDate`.

6. Revalidación
   - Create: no usa `revalidatePath`; depende de `router.refresh()` del cliente.
   - Update inline: sí hace `revalidatePath('/admin/patients/{id}/encounters')` en server action.

7. Listado y edición inline
   - `EncountersList` muestra fecha/hora formateada + estado “Registrada”.
   - Inline edit cambia solo un campo UI `occurrenceDate` (`datetime-local`) y actualiza start/end a mismo valor.

## Coupling analysis

### Datos
- Bajo acoplamiento entre form y listado a nivel estado React (cada componente maneja su feedback/estado).
- Acoplamiento moderado por loader de página: `activeEpisodeId` entra por props desde `pageData`.

### Visual
- Acoplamiento alto en la experiencia: form y listado viven en misma pantalla y comparten continuidad visual (bloques consecutivos).

### Acciones
- Form create y edit inline usan acciones diferentes; no hay acción compartida de UI.
- Ambas convergen al mismo dominio de fecha única (`occurrenceDate`) y mismo write mapper (`start=end`).

### Tests
- Cobertura razonable de loader, actions e inline state.
- Falta test dedicado del `EncounterCreateForm` como unidad (feedback + pending + bloqueo UI).
- Mover a ruta nueva impactará tests de página y snapshots/strings esperados.

### Documental
- Existe material histórico de encounters en `/docs`, pero no hay contrato explícito de navegación post-create/new screen.

## Route recommendation

### Recomendación
- **`/admin/patients/[id]/encounters/new`**.

### Justificación
- Coherente con convención existente `.../patients/new`.
- Semántica estándar de App Router para creación.
- Permite mantener `/encounters` como “hub de listado” y separar complejidad incremental del formulario.

### Alternativas
- `/encounters/create`: funcional, pero menos alineada con convención del repo y menos idiomática en Next.
- Mantener todo en `/encounters` con modal/section expandida: menor cambio técnico, peor escalabilidad UX al agregar start/end y campos nuevos.

## Active treatment gating

- `/encounters` (listado): mantener contexto de tratamiento + CTA “Registrar visita” deshabilitada o reemplazada por CTA a `/treatment` cuando no haya episodio activo.
- `/encounters/new`: resolver gating server-side al cargar; si no hay activo, mostrar empty state orientado a acción (`Ir a gestión de tratamiento`) y no renderizar submit.
- Server action: conservar validación actual (fuente de verdad). Ajustar copy para uniformidad entre UI y server.

## Readiness for expanded visit form

- Base actual soporta start (como `occurrenceDate`), pero **no modela start/end separados** en dominio.
- Para agregar hora fin sin ruptura grande:
  1) extender tipos/schemas input (start/end opcional al principio),
  2) adaptar mapper write para no forzar `end=start` cuando se informe fin,
  3) adaptar read model para exponer ambos valores (o mantener `occurrenceDate` derivado + campos nuevos),
  4) validar `end >= start` en schema/regla.
- Motivo/tipo de visita y notas clínicas: dejar en backlog de formulario expandido; no bloquear mudanza de ruta por eso.

## Inline edit impact

- Hoy inline edit equivale a “corrección rápida de fecha/hora de inicio” pero técnicamente pisa también `period.end` al mismo valor.
- Cuando exista hora fin, este comportamiento puede romper duración real.
- Recomendación por etapas:
  - Corto plazo: mantener inline edit, etiquetarlo explícitamente como edición de inicio, y no tocar end cuando ya exista.
  - Medio plazo: migrar a edición de período (start/end) o pantalla dedicada de edición.

## UX/UI recommendation

### `/encounters` futuro (sin form)
- Header actual + contexto de tratamiento compacto.
- CTA principal arriba del listado: “Registrar visita”.
- Empty states:
  - sin tratamiento: mensaje + CTA a tratamiento;
  - con tratamiento y sin visitas: mensaje + CTA a registrar primera visita.

### `/encounters/new`
- Back a `/encounters`, título claro “Registrar visita”.
- Contexto mínimo del paciente + tratamiento activo.
- Form centrado en una acción, feedback claro y navegación post-guardado (recomendado volver al listado con feedback persistente por query/search param o flash).

### Ícono de edición
- Reemplazar emoji ✏️ por SVG (stroke/currentColor) consistente con estilo de Maps y acciones de contacto.
- Mantener `aria-label`, estados hover/focus visibles y disabled.

## Findings

### Critical
- Ninguno detectado en este scope.

### High
1) **Modelo temporal colapsado (`start=end`) en create/update**.
   - Impacto: bloquea evolución limpia a hora de fin/duración.
   - Timing: **antes o durante mudanza** (definir estrategia de compatibilidad).

2) **Inconsistencia de invalidación post-create (sin `revalidatePath`)**.
   - Impacto: dependencia en `router.refresh()` desde cliente; menor robustez para flujos alternativos.
   - Timing: **durante mudanza**.

### Medium
1) **Gating duplicado UI + server con copies distintos**.
2) **`Encounter` de dominio solo expone `occurrenceDate`** (sin `start/end`).
3) **Inline edit no distingue inicio/fin** y puede volverse ambiguo.
- Timing: **durante mudanza** para copy/flujo; **después** para refinamiento de modelo completo.

### Low
1) Falta test unitario de `EncounterCreateForm`.
2) Acoplamiento de `page.tsx` a doble carga (`loadPatientEncountersPageData` + `loadPatientDetail`) que agrega complejidad de render.
- Timing: **después**.

### UX/UI
1) El listado perderá CTA obvia al quitar form si no se rediseña encabezado.
2) Emoji de lápiz desentona con estilo textual/SVG del resto de admin.
3) Feedback post-create necesita patrón claro entre pantallas.
- Timing: **durante mudanza**.

## Suggested implementation plan (propuesto)

1. Preparar acciones/loaders:
   - extraer loader compartido para `/encounters` y `/encounters/new`.
   - homogenizar mensajes de gating.
2. Crear ruta nueva `/encounters/new`.
3. Convertir `/encounters` en listado + CTA principal.
4. Mantener inline edit como corrección rápida del inicio (sin sobreprometer edición de sesión completa).
5. Preparar soporte start/end en contratos de dominio/mappers con compatibilidad backward.
6. Ajustar/expandir tests (page, action, navegación y gating).
7. Documentación posterior mínima (decisión de ruta + reglas start/end).

## Open questions

- ¿Hora de fin obligatoria al crear, opcional o posterior?
- ¿Registrar visita requiere tratamiento activo en todos los casos, sin excepciones?
- ¿Al guardar en `/encounters/new` volvemos siempre al listado?
- ¿Mostramos duración en listado cuando exista `end`?
- ¿Inline edit corrige solo inicio o período completo?
- ¿Copy visible prioriza “visita” o “sesión” (y en qué contexto)?

## Out of scope (confirmado)

- No tocar `Observation`, `Procedure`, agenda, pagos ni longitudinal.
- No mover tratamiento fuera de `/treatment`.
- No agregar librerías.
- No crear aún la nueva ruta ni campos nuevos.
- No cambiar modelado FHIR en esta etapa, salvo recomendaciones de evolución.
