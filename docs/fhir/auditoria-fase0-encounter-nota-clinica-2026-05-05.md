# Auditoría técnica acotada — Fase 0 captura clínica estructurada en Encounter (sin IA)

Fecha: 2026-05-05 (UTC)
Estado: análisis pre-implementación
Alcance: Encounter clínico estructurado. Sin `Condition`, `Observation`, `Procedure`, ni IA en este PR.

## Cierre posterior

- Estado: implementado en Fase 0 (2026-05-07).
- Decisión aplicada: persistencia principal en `Encounter.extension[]` con URLs versionables para nota clínica estructurada mínima.
- Compatibilidad: `Encounter.note[]` queda únicamente como fallback transicional de lectura.
- Validación ejecutada: tests de schemas, mappers, action de creación y componentes de alta/listado de visitas; además verificación de preservación de extensiones clínicas en actualización inline de período.
- No-alcances preservados: sin IA, sin prompts/modelos, sin `Condition`, sin `Observation`, sin `Procedure`, sin rediseño global de `/encounters`.


### Addendum de hardening/regresión (2026-05-07)

- Se aplicó patch de regresión acotado posterior a Fase 0 para asegurar consistencia operativa en `/admin/patients/[id]/encounters`.
- Alcance del hardening:
  - listado protagonista y métricas derivados **solo** de visitas del episodio efectivo (activo si existe; si no, último episodio registrado);
  - no mezclar visitas de episodios cerrados en el listado protagonista cuando existe nuevo episodio activo sin visitas;
  - metadata temporal de visita (`fecha`, `inicio`, `cierre`, `duración`) priorizada visualmente antes de la nota clínica;
  - duración visible únicamente con `startedAt` y `endedAt` válidos y `endedAt > startedAt`;
  - la nota clínica estructurada se preserva y no altera scoping ni cálculo de duración.
- Validación de hardening: tests de regresión en loader y listado de visitas (render/scoping/duración + preservación de nota clínica).
- No-alcances preservados: sin IA, sin `Condition`, sin `Observation`, sin `Procedure`, sin cambios de reglas de inicio/cierre de tratamiento.

## 1) Hallazgos del estado actual

## 1.1 Modelo de dominio y validación

- `Encounter` de dominio hoy contiene: `id`, `patientId`, `episodeOfCareId`, `startedAt`, `endedAt?`, `status`.
- `CreateEncounterInput` y `updateEncounterPeriod` solo modelan período temporal (sin nota clínica).
- `createEncounterSchema` y `updateEncounterPeriodSchema` validan strings y cronología `endedAt >= startedAt`, con normalización a dateTime FHIR.

Implicancia: hoy no existe contrato de entrada/salida para contenido clínico narrativo estructurado.

## 1.2 Mappers y repositorio

- Mapper de escritura `Encounter` persiste `status`, `subject`, `episodeOfCare`, `period.start/end`.
- Mapper de lectura reconstruye dominio desde `period` y referencias, tolerando inconsistencias temporales legacy.
- Repositorio `createEncounter`/`updateEncounterTimeRange` hace POST/PUT completos del recurso mapeado (patrón correcto para agregar campos clínicos en mapper sin filtrar en UI).

Implicancia: el punto de extensión natural para nota clínica está en mappers `encounter-write` y `encounter-read`.

## 1.3 Actions, loaders y UI

- `createEncounterAction` ya es la entrada única de escritura desde UI (server action), valida schema y reglas contra episodio activo.
- `/admin/patients/[id]/encounters/data.ts` carga y ordena visitas; la UI consume dominio/read model, no FHIR crudo.
- Existe edición inline de período temporal en listado.

Implicancia: la arquitectura vigente soporta añadir nota clínica sin romper principios actuales.

## 1.4 Cobertura de tests existente

- Hay tests en: schemas/rules/stats de dominio, mapper de encounter, repositorio, actions de crear/editar período, loaders y componentes de encounters.

Implicancia: hay base para introducir cobertura incremental centrada en roundtrip de nota clínica.

---

## 2) Recomendación de persistencia FHIR (decisión principal)

## 2.1 Opción A: `Encounter.extension[]` con URLs propias versionables

Ventajas:
- Estable para datos estructurados de negocio clínico propio.
- Tipado claro por campo (`valueString`) y evolución versionada por URL.
- Compatible con patrón ya adoptado en el proyecto para `EpisodeOfCare` (extensiones propietarias versionables).
- Menor riesgo semántico de mezclar narrativa libre con metadata en `note.text`.

Costos:
- Requiere utilidades de lectura/escritura de extensiones y constantes de URLs.
- Exige disciplina de versionado de StructureDefinition URL.

## 2.2 Opción B: `Encounter.note[]` con prefijos versionados

Ventajas:
- Implementación rápida (serialización de strings con prefijo).
- Menor cambio inicial de tipos FHIR.

Riesgos:
- Menor robustez estructural (parsing por convención textual).
- Mayor fragilidad ante cambios de copy/formato.
- **Riesgo alto de roundtrip inconsistente en HAPI local**, dado antecedente documentado del repositorio: `note[]` no fue confiable como canal principal en otros recursos (ejemplo `EpisodeOfCare`).

## 2.3 Recomendación final

**Usar `Encounter.extension[]` como canal principal de persistencia para Fase 0.**

Definir URLs versionables (v1) por campo:
- `.../StructureDefinition/encounter-clinical-subjective`
- `.../StructureDefinition/encounter-clinical-objective`
- `.../StructureDefinition/encounter-clinical-intervention`
- `.../StructureDefinition/encounter-clinical-assessment`
- `.../StructureDefinition/encounter-clinical-tolerance`
- `.../StructureDefinition/encounter-clinical-home-instructions`
- `.../StructureDefinition/encounter-clinical-next-plan`

Formato sugerido inicial: `valueString` en todas.

**Fallback recomendado de lectura (opcional transicional):** soportar `note[]` prefijada solo si existiera data legacy/manual, pero no escribir ahí como canal primario.

---

## 3) Consideración explícita sobre HAPI local y roundtrip

Hallazgo relevante del proyecto: ya hay evidencia operativa de pérdida/fragilidad en `note[]` para otros recursos en HAPI local (documentado en `EpisodeOfCare`).

Por eso, para Fase 0:
1. Persistir en `extension[]`.
2. Validar roundtrip real `POST Encounter -> GET Encounter/{id} -> mapper dominio`.
3. Validar roundtrip `PUT Encounter/{id} -> GET Encounter/{id}` preservando extensiones no relacionadas (no sobrescritura destructiva).

Criterio técnico de seguridad:
- El update de período existente no debe borrar nota clínica.
- La futura edición de nota clínica no debe borrar campos administrativos/temporales.

---

## 4) Archivos a tocar (propuestos, sin implementar en este PR)

## 4.1 Dominio

- `src/domain/encounter/encounter.types.ts`
  - Agregar `clinicalNote?: EncounterClinicalNote`.
  - Agregar tipos `EncounterClinicalNote` y `EncounterClinicalNoteInput` (7 campos opcionales string normalizados).

- `src/domain/encounter/encounter.schemas.ts`
  - Extender `createEncounterSchema` para validar/normalizar bloque clínico.
  - (Fase 0 mínima) mantener update inline de período sin nota; crear acción dedicada luego.

## 4.2 Mapper FHIR

- `src/infrastructure/mappers/encounter/encounter-fhir.types.ts`
  - Incluir `extension?: FhirExtension[]` y opcionalmente `note?: Annotation[]` para fallback lectura.

- `src/infrastructure/mappers/encounter/encounter-write.mapper.ts`
  - Mapear `clinicalNote` a `extension[]` preservando extensiones ajenas.

- `src/infrastructure/mappers/encounter/encounter-read.mapper.ts`
  - Leer extensiones v1 y poblar `clinicalNote` dominio.
  - Fallback opcional de lectura desde `note[]` prefijada (sin escritura principal).

## 4.3 Repositorio y actions

- `src/infrastructure/repositories/encounter.repository.ts`
  - Sin cambio arquitectónico mayor; solo transportar nuevos campos via mapper.

- `src/app/admin/patients/[id]/encounters/actions/create-encounter.action.ts`
  - Aceptar payload clínico y persistir en creación.

- Nuevo (recomendado para reversibilidad):
  - `src/app/admin/patients/[id]/encounters/actions/update-encounter-clinical-note.action.ts`
  - Acción separada para editar nota clínica sin mezclar con inline de período.

## 4.4 UI y loaders

- `src/app/admin/patients/[id]/encounters/new/components/EncounterCreateForm.tsx`
  - Agregar campos clínicos (colapsables/optativos) con UX de baja fricción.

- `src/app/admin/patients/[id]/encounters/data.ts`
  - Exponer `clinicalNote` en read model para listado/detalle según alcance de Fase 0.

---

## 5) Plan de implementación incremental y reversible

## Paso 1 — Contrato de dominio + constantes de extensiones

- Introducir tipos de `clinicalNote` y catálogo de URLs v1 centralizado.
- No tocar aún UI.

Rollback: revertir tipos/constantes sin impacto en flujo actual.

## Paso 2 — Mapper read/write + tests unitarios

- Escribir/leer extensiones en mapper Encounter.
- Garantizar preservación de extensiones desconocidas.
- Mantener compatibilidad con encounters sin nota.

Rollback: feature flag de mapper o revert de mapeo sin tocar repositorio.

## Paso 3 — Create action + form new encounter

- Permitir carga de nota clínica al crear visita.
- Campos opcionales en Fase 0 para no bloquear operación.

Rollback: ocultar campos UI; creación sigue funcionando con período.

## Paso 4 — Edición dedicada de nota clínica

- Añadir action separada para editar nota clínica de una visita existente.
- No mezclar con action inline de horario.

Rollback: retirar botón/form de edición clínica; se conserva dato ya persistido.

## Paso 5 — Hardening

- Ajustar copy, límites de longitud, mensajes y cobertura de tests de integración.
- Documentar contrato en `docs/fuente-de-verdad-operativa.md`.

---

## 6) Tests mínimos necesarios

## 6.1 Unitarios (mappers/schemas)

1. `encounter-write.mapper` escribe cada campo clínico en su URL correcta.
2. `encounter-read.mapper` reconstruye `clinicalNote` desde extensiones.
3. Preservación de extensiones ajenas en update.
4. Compatibilidad con Encounter sin extensiones clínicas.
5. (Opcional) fallback lectura desde `note[]` prefijada.
6. Schema normaliza trim/empty -> `undefined` en campos clínicos opcionales.

## 6.2 Integración (actions/repository)

7. `createEncounterAction` persiste período + nota clínica.
8. `updateEncounterTimeRange` no elimina extensiones clínicas existentes.
9. Nueva acción `updateEncounterClinicalNote` actualiza solo nota clínica sin romper período.

## 6.3 Loader/UI

10. `data.ts` expone `clinicalNote` en read model sin FHIR crudo.
11. Form de alta envía payload clínico válido.
12. Render básico en listado/detalle (si entra en alcance de Fase 0 UI) muestra contenido existente.

---

## 7) Riesgos y no-alcances

## 7.1 Riesgos

- Formularios largos pueden reducir adherencia de carga.
- Texto libre sin guías mínimas puede degradar consistencia clínica.
- Update concurrente período vs nota podría causar overwrite si no se hace read-modify-write cuidadoso.

## 7.2 No-alcances en esta fase

- No implementar `Condition`, `Observation`, `Procedure`.
- No generar reportes automáticos ni IA asistiva.
- No codificación terminológica avanzada.

---

## 8) Criterios de aceptación de Fase 0 (sin IA)

1. Se puede crear Encounter con período obligatorio y bloque clínico estructurado opcional.
2. Los 7 campos clínicos persisten y sobreviven roundtrip HAPI local.
3. La app sigue cumpliendo arquitectura: UI sin FHIR crudo, actions + schemas + repos + mappers + loaders.
4. La edición inline de período mantiene comportamiento actual y no borra nota clínica.
5. Existe set mínimo de tests unitarios/integración para mapper/actions críticos.
6. El cambio es reversible por etapas sin bloquear operación administrativa actual.

---

## 9) Decisión recomendada para implementar

Para este repositorio y su comportamiento observado con HAPI local, la opción más segura para Fase 0 es:

- **Persistencia principal en `Encounter.extension[]` con URLs propias versionables (v1)**.
- `Encounter.note[]` solo como fallback de lectura transicional, no como canal primario.
- Implementación incremental en acciones separadas (crear visita vs editar nota) para reducir riesgo operativo.
