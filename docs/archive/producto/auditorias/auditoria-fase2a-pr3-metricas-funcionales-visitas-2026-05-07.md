# Auditoría funcional — Fase 2A PR3 (métricas funcionales en visitas)

Fecha: 2026-05-07

## Resultado ejecutivo

> Nota histórica: los hallazgos iniciales de esta auditoría (brecha de conexión) quedaron superados en el mismo día, 2026-05-07, por el cierre PR3 real incluido al final del documento.

Estado vigente: el flujo **UI → action → FHIR → loader → card** de métricas funcionales está implementado.

En particular:

1. El formulario de nueva visita no tiene bloque de métricas ni estado de inputs para TUG/dolor/bipedestación.
2. El `createEncounterSchema` no parsea `functionalObservations`.
3. La action `createEncounterAction` no persiste `Observation`; sólo crea `Encounter`.
4. El loader de `/encounters` no consulta Observations ni adjunta métricas al read model.
5. La card/listado de visitas no tiene render de “Métricas funcionales”.

## Hallazgos detallados

### 1) UI de nueva visita

- **No existe** bloque “Métricas funcionales” en `EncounterCreateForm`.
- El submit arma un `input` con `patientId`, `episodeOfCareId`, `startedAt`, `endedAt`, `clinicalNote`; **no envía** `tugSeconds`, `painNrs010`, `standingToleranceMinutes`, ni `functionalObservations`.
- No hay lógica para normalizar vacíos a `undefined` de métricas porque los campos no existen.
- El caso “dolor = 0” tampoco puede verificarse en UI actual: no hay input ni mapping.

### 2) Schema/action

- `createEncounterSchema.parse` valida tiempos/paciente/episodio y parsea `clinicalNote`; **no acepta** `functionalObservations`.
- `createEncounterAction` parsea schema, valida episodio activo y rango temporal, y luego llama a `createEncounter(parsedInput)`.
- No hay validación de métricas ni secuencia explícita “crear encounter y luego observations”.
- Sí usa `patientId` real recibido por input/action para validar episodio activo, pero ese input viene del front y no de una extracción explícita del segmento de ruta en la action.
- No hay código que use `encounter.id` recién creado para generar `Observation.encounter.reference`.

### 3) Persistencia FHIR

- El repository de encounters hace `POST Encounter` (mapper de encounter) y retorna dominio.
- No hay llamada en action/repository para `POST Observation` funcional asociada al encounter.
- Existen mappers de functional observation (`functional-observation-write.mapper.ts` y `...read.mapper.ts`) y constantes de code system, pero no están conectados al flujo de creación de visita.

### 4) Loader de `/encounters`

- `loadPatientEncountersPageData` trae encounters por paciente y hace scoping por episodio efectivo (`activeEpisode ?? mostRecentEpisode`).
- No consulta Observations por `encounterId` ni por paciente.
- El read model enviado a `EncountersList` es `Encounter[]` sin `functionalObservations` embebidas.
- Por no haber carga, no existe deduplicación por `encounterId + code` en esta ruta.

### 5) Render de cards

- `EncountersList` renderiza fecha/horario/duración/estado y “Registro clínico” (clinicalNote).
- No hay bloque condicional de “Métricas funcionales”, ni labels/unidades de esas métricas.

### 6) Scoping de episodios

- El scoping de visitas está correcto para encounters:
  - si hay episodio activo, muestra sólo encounters de ese episodio;
  - si no hay activo, usa episodio más reciente.
- Como no hay carga/render de métricas, no se puede observar todavía su scoping en UI.
- Cuando se implemente, deberá heredar exactamente el encounter ya scoped, vinculando Observations por `Encounter/{id}` para no mezclar episodios.

## Respuestas puntuales a preguntas

1. **UI nueva visita**: hoy no existe bloque ni names de métricas; no se envían campos; no aplica normalización; dolor 0 no se prueba en flujo actual.
2. **Schema/action**: schema no acepta `functionalObservations`; action no las procesa; no crea observations después del encounter; para 1/2/3 métricas hoy no ocurre nada porque no hay integración.
3. **FHIR persistencia**: no se crean Observation desde el flujo de crear visita actual; por lo tanto no se verifica shape en ejecución de este flujo.
4. **Loader**: sí scopea encounters por episodio efectivo; no consulta observations ni deduplica.
5. **Cards**: no reciben ni renderizan métricas; no hay bloque condicional de métricas.
6. **Scoping**: funciona para encounters; métricas no aplican aún al no estar integradas.

## QA manual esperado (estado actual y cómo detectar el problema)

### Precondiciones

- Paciente existente.
- Tratamiento activo (si no, la UI bloquea registro de visita).
- Ruta: `/admin/patients/{patientId}/encounters/new`.

### Pasos

1. Abrir `/encounters/new` del paciente con episodio activo.
2. Verificar visualmente que solo aparece:
   - tiempos (inicio/cierre),
   - bloque opcional “Registro clínico de la visita”.
3. Confirmar que **no** aparece “Métricas funcionales”.
4. Crear visita con tiempos válidos.
5. Ir a `/admin/patients/{patientId}/encounters`.
6. Verificar que la card muestra fecha/duración/estado y eventualmente clinicalNote, pero no métricas.

### Si se inspecciona HAPI/FHIR

- Buscar recursos `Observation` recientes del paciente o encounter creado.
- Resultado esperado hoy: no aparecerán observaciones funcionales creadas por esta acción (porque la action no las postea).

## Tests faltantes (para cuando se implemente conexión)

- action crea Encounter + 3 Observations funcionales.
- action con `pain=0` crea Observation válida (no se pierde por falsy).
- loader adjunta Observations al encounter correcto (`Encounter/{id}`).
- card renderiza bloque de métricas cuando hay al menos una.
- card no renderiza bloque vacío sin métricas.
- integración/e2e mínima del flujo completo.

> Nota: esto describe brechas detectadas; no se implementan features en esta auditoría.

## Cierre de implementación (actualización)

Estado actualizado: **implementado** el flujo UI → action → FHIR → loader → card para métricas funcionales opcionales en visitas.

- UI `/encounters/new`: se agregó bloque “Métricas funcionales” con `tugSeconds`, `painNrs010`, `standingToleranceMinutes`.
- Action/schema: se parsean/validan métricas opcionales y se crean `Observation` asociadas a `Patient/{id}` + `Encounter/{id}` con `effectiveDateTime=startedAt`.
- Loader: se cargan observaciones por `encounterId` y se adjuntan a la visita scoped por episodio efectivo.
- Card: se renderiza bloque condicional “Métricas funcionales” solo cuando hay datos.

### Deuda técnica registrada

- **Consistencia transaccional parcial**: si falla creación de Observation luego de crear Encounter, la visita queda creada y se devuelve mensaje funcional de falla parcial.
- **N+1 de Observations en loader**: actualmente se consulta por cada encounter scoped.
