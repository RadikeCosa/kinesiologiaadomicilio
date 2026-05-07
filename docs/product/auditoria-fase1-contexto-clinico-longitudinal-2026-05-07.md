# Auditoría técnica — Fase 1 contexto clínico longitudinal (EpisodeOfCare + Condition, sin IA)

Fecha: 2026-05-07

## 1) Hallazgos del estado actual

### Arquitectura y patrones ya consolidados
- La app ya trabaja con separación de capas consistente: `domain/*` (tipos + schemas/rules), `infrastructure/mappers/*`, `infrastructure/repositories/*` y loaders/read-models en `app/*/data.ts`.
- La escritura se canaliza por **Server Actions** y schemas de validación previos al acceso a repositorio.
- `Encounter` ya está en esquema de nota clínica estructurada (7 campos opcionales), con persistencia principal en `Encounter.extension[]` y fallback de lectura legacy desde `note[]`.

### Modelado actual de EpisodeOfCare
- El dominio de `EpisodeOfCare` hoy contempla: estado, periodo, vínculo opcional a `ServiceRequest`, motivo y detalle de cierre.
- El cierre ya usa `EpisodeOfCare.extension[]` con URLs explícitas para `closureReason` y `closureDetail`.
- `FhirEpisodeOfCare` todavía **no tipa** `diagnosis[]`; hoy solo soporta `note[]`, `extension[]`, `referralRequest[]`, paciente y periodo.

### Scoping clínico actual
- `/encounters` ya aplica scoping estricto al episodio efectivo (`active ?? mostRecent`) y filtra visitas por `encounter.episodeOfCareId`.
- Esto es una base correcta para no contaminar la cronología clínica entre ciclos.

### Superficies UI existentes relevantes
- `/admin/patients/[id]/treatment` hoy gestiona ciclo activo/cierre/historial y vínculo con solicitud de origen.
- `/admin/patients/[id]/encounters` concentra registro de visitas.
- `/admin/patients/[id]` opera como hub/resumen general del paciente.

---

## 2) Recomendación de modelado FHIR + dominio (Fase 1)

## Decisión principal
Implementar **doble nivel**:
1. **Condition** como recurso propio para diagnósticos clínicos del episodio:
   - Diagnóstico médico de referencia.
   - Impresión/diagnóstico kinésico activo.
2. **EpisodeOfCare.extension[]** para contexto longitudinal no episódico-por-visita:
   - Situación inicial funcional.
   - Objetivos terapéuticos.
   - Plan marco del tratamiento.

Esto separa claramente:
- “qué problema clínico está siendo tratado” (Condition);
- “cómo arranca y hacia dónde va el plan del ciclo” (baseline/objetivos/plan marco en EpisodeOfCare).

## 3) Vínculo Condition ↔ EpisodeOfCare

Usar `EpisodeOfCare.diagnosis[]` con `diagnosis.condition.reference = Condition/{id}`.

Sugerencia de estructura mínima (R4 compatible):
- `EpisodeOfCare.diagnosis[0]`: diagnóstico médico de referencia.
- `EpisodeOfCare.diagnosis[1]`: diagnóstico kinésico activo.

Para evitar ambigüedad desde día 1, cada item de `diagnosis[]` debe llevar un **rol local** (vía `diagnosis.role` y/o extensión local de rol) controlado por app. Recomendado en Fase 1:
- mantener rol local explícito en dominio (`medical_reference` / `kinesiologic_impression`), y mapearlo en FHIR de forma determinística;
- no exigir código SNOMED/LOINC ahora; permitir `Condition.code.text` como texto libre sin transformación.

---

## 4) Diferenciar diagnóstico médico vs kinésico sin codificación terminológica completa

### Condición propuesta
Crear un tipo de dominio local:
- `EpisodeDiagnosisKind = "medical_reference" | "kinesiologic_impression"`

Y para cada diagnóstico:
- `kind` (obligatorio)
- `text` (obligatorio, texto libre)
- `recordedAt?`
- `clinicalStatus?` simple (`active` por defecto en kinésico; opcional para médico)

Mapeo FHIR mínimo recomendado:
- `Condition.subject` → paciente del episodio.
- `Condition.code.text` → texto clínico libre exacto (sin capitalizar/normalizar semánticamente).
- `Condition.clinicalStatus` opcional, solo si agrega valor operativo.
- `Condition.note` **evitar** en Fase 1 para no abrir vía de “cajón de notas”.

Regla operativa Fase 1:
- máximo 1 diagnóstico por `kind` por episodio (si cambian, estrategia de replace controlado, no append ilimitado).

---

## 5) Matriz dato clínico → recurso/campo → prioridad

| Dato clínico | Recurso FHIR | Campo recomendado | Prioridad |
|---|---|---|---|
| Diagnóstico médico de referencia | `Condition` | `Condition.code.text` + vínculo en `EpisodeOfCare.diagnosis[].condition` + rol local `medical_reference` | Alta |
| Impresión/diagnóstico kinésico activo | `Condition` | `Condition.code.text` + vínculo en `EpisodeOfCare.diagnosis[].condition` + rol local `kinesiologic_impression` | Alta |
| Situación inicial funcional | `EpisodeOfCare` | `EpisodeOfCare.extension[url=...baseline].valueString` | Alta |
| Objetivos terapéuticos | `EpisodeOfCare` | `EpisodeOfCare.extension[url=...goals].valueString` | Alta |
| Plan marco del tratamiento | `EpisodeOfCare` | `EpisodeOfCare.extension[url=...treatment-plan].valueString` | Alta |

Notas:
- `Goal` queda explícitamente como alternativa futura (fuera de alcance).
- no mover estos campos a `Encounter` para evitar duplicación en cada visita.

---

## 6) Tipos de dominio local necesarios

### Nuevo módulo sugerido
`src/domain/treatment-context/`

Tipos base:
- `EpisodeDiagnosisKind`
- `EpisodeDiagnosisInput`:
  - `kind`
  - `text`
  - `conditionId?` (en updates)
- `EpisodeClinicalContext`:
  - `medicalReferenceDiagnosis?: EpisodeDiagnosisInput`
  - `kinesiologicImpression?: EpisodeDiagnosisInput`
  - `initialFunctionalStatus?: string`
  - `therapeuticGoals?: string`
  - `frameworkPlan?: string`
- `UpsertEpisodeClinicalContextInput`:
  - `patientId`
  - `episodeOfCareId`
  - campos de `EpisodeClinicalContext`

Reglas:
- trimming de strings + vacío => `undefined`.
- límite de longitud prudente por campo (defensivo).
- no transformaciones de contenido clínico libre.

---

## 7) Schemas Zod necesarios

Aunque el repo hoy use validadores manuales con interfaz de schema, la restricción de Fase 1 pide Zod. Plan:

1. Crear schema(s) Zod para tratamiento longitudinal:
   - `upsertEpisodeClinicalContextSchema`
   - `episodeDiagnosisSchema`
2. Integrar parseo en Server Action nueva.
3. Mantener mensaje de error clínico-administrativo claro (sin exponer internals FHIR).

Validaciones mínimas:
- `patientId`, `episodeOfCareId` requeridos.
- mínimo un campo presente para upsert (evitar writes vacíos).
- `text` requerido cuando existe un diagnóstico.
- `kind` permitido solo en enum local.

---

## 8) Repositorios/mappers FHIR a crear o extender

## Crear
1. `src/infrastructure/mappers/condition/condition-fhir.types.ts`
2. `src/infrastructure/mappers/condition/condition-read.mapper.ts`
3. `src/infrastructure/mappers/condition/condition-write.mapper.ts`
4. `src/infrastructure/repositories/condition.repository.ts`

Operaciones mínimas repositorio Condition:
- crear Condition;
- obtener Condition por id;
- actualización simple (si estrategia replace requiere);
- opcional: búsqueda por paciente para validaciones auxiliares.

## Extender EpisodeOfCare
1. `episode-of-care-fhir.types.ts`
   - agregar `diagnosis?: Array<{ condition?: { reference?: string }; role?: ... }>`.
2. `episode-of-care-read.mapper.ts`
   - exponer referencias diagnósticas + rol local.
3. `episode-of-care-write.mapper.ts`
   - upsert controlado de extensiones de baseline/goals/plan marco.
   - upsert de `diagnosis[]` por rol (sin duplicados).
4. `episode-of-care.repository.ts`
   - método orquestador para guardar contexto clínico longitudinal del episodio.

## Search params
- Extender `src/lib/fhir/search-params.ts` con helper de query de `Condition` por `subject` (si se necesita lectura directa).

---

## 9) Read models para UI

Crear read model específico de contexto longitudinal, desacoplado de FHIR crudo:

`TreatmentClinicalContextReadModel`:
- `episodeOfCareId`
- `medicalReferenceDiagnosisText?`
- `kinesiologicImpressionText?`
- `initialFunctionalStatus?`
- `therapeuticGoals?`
- `frameworkPlan?`
- `lastUpdatedAt?` (opcional)

Loader sugerido:
- `loadTreatmentClinicalContext(patientId, episodeId)`:
  - valida pertenencia episodio↔paciente;
  - resuelve `EpisodeOfCare` + referencias de Condition;
  - devuelve read model listo para formulario/resumen.

---

## 10) Ubicación de UI inicial

Recomendación: **combinación**.

1. **Edición principal en** `/admin/patients/[id]/treatment`.
   - Es la superficie natural del ciclo terapéutico.
   - Ya concentra “inicio/activo/cierre/historial”.
2. **Lectura resumida en** `/admin/patients/[id]/encounters`.
   - Solo bloque de contexto baseline (read-only) encima del listado de visitas, para que el clínico tenga marco sin duplicar carga.
3. `/admin/patients/[id]` solo badge/estado breve, sin edición.

Esto reduce navegación innecesaria y preserva el contrato actual de visitas.

---

## 11) Evitar duplicación del baseline por Encounter

Reglas de diseño:
- baseline/objetivos/plan marco viven **solo** a nivel EpisodeOfCare.
- `Encounter` conserva contenido de sesión (nota SOAP-like actual), no baseline.
- en UI de visitas mostrar contexto longitudinal como referencia read-only.

Resultado: sin copiar texto en cada visita, sin drift entre sesiones.

---

## 12) Evitar que EpisodeOfCare sea “cajón de notas”

Contención explícita:
1. Definir whitelist cerrada de extensiones Fase 1:
   - `.../episodeofcare-initial-functional-status`
   - `.../episodeofcare-therapeutic-goals`
   - `.../episodeofcare-framework-plan`
2. No usar `EpisodeOfCare.note` para notas clínicas de sesión.
3. Validar tamaño y cardinalidad (1 valor por extensión).
4. Toda evolución temporal sigue en Encounter, no en EpisodeOfCare.

---

## 13) Plan incremental de implementación

### Paso 1 — Dominio + schemas
- Crear tipos de `treatment-context`.
- Crear Zod schemas de input.
- Tests unitarios de parse/validación.

### Paso 2 — Infra Condition
- Agregar tipos FHIR Condition.
- Mappers read/write Condition.
- Repositorio Condition + tests.

### Paso 3 — Extensión EpisodeOfCare
- Soporte `diagnosis[]` en types/mappers.
- Soporte extensiones baseline/goals/plan.
- Método repo para upsert transaccional lógico (ordenado y determinista).

### Paso 4 — Application layer
- Nueva Server Action `upsert-episode-clinical-context.action.ts`.
- Loader/read model de contexto clínico longitudinal.

### Paso 5 — UI
- Formulario inicial en `/treatment`.
- Resumen read-only en `/encounters`.

### Paso 6 — Hardening
- Manejo de errores funcionales.
- Cobertura de tests mínimos y smoke E2E/integración.

---

## 14) Archivos probables a tocar

- `src/domain/treatment-context/*` (nuevo)
- `src/app/admin/patients/[id]/actions/upsert-episode-clinical-context.action.ts` (nuevo)
- `src/app/admin/patients/[id]/data.ts` (extensión loader/read model)
- `src/app/admin/patients/[id]/treatment/page.tsx` (UI edición)
- `src/app/admin/patients/[id]/encounters/data.ts` (inyectar resumen read-only)
- `src/app/admin/patients/[id]/encounters/page.tsx` (render resumen)
- `src/infrastructure/mappers/condition/*` (nuevo)
- `src/infrastructure/repositories/condition.repository.ts` (nuevo)
- `src/infrastructure/mappers/episode-of-care/episode-of-care-fhir.types.ts`
- `src/infrastructure/mappers/episode-of-care/episode-of-care-read.mapper.ts`
- `src/infrastructure/mappers/episode-of-care/episode-of-care-write.mapper.ts`
- `src/infrastructure/repositories/episode-of-care.repository.ts`
- `src/lib/fhir/search-params.ts` (si se requiere query helper Condition)

---

## 15) Riesgos y no-alcances

### Riesgos
- Inconsistencia lógica si se actualiza EpisodeOfCare pero falla creación/actualización de Condition (falta transacción real multi-recurso).
- Ambigüedad de rol diagnóstico si no se fija convención estricta de `kind`.
- Crecimiento de extensiones sin gobernanza si no se impone whitelist.

Mitigación:
- orden de operaciones + idempotencia de upsert.
- reglas de cardinalidad 1 por `kind`.
- constants centralizadas para URLs de extensiones.

### No-alcances reafirmados
- Sin IA.
- Sin Goal/Observation/Procedure.
- Sin rediseño formulario de visitas.
- Sin rediseño cards de Encounter.
- Sin cambiar scoping actual de `/encounters`.

---

## 16) Pruebas mínimas a agregar

1. **Domain/schema tests**
- valida enum `kind`.
- rechaza payload vacío.
- respeta texto libre sin transformarlo.

2. **Mapper tests**
- Condition write/read para ambos `kind`.
- EpisodeOfCare diagnosis mapping (link correcto a `Condition/{id}`).
- extensiones baseline/goals/plan (upsert sin duplicados).

3. **Repository tests**
- upsert contexto en episodio activo válido.
- rechazo cuando episodio no pertenece al paciente.
- comportamiento ante referencias de Condition faltantes.

4. **Action tests**
- éxito end-to-end de Server Action.
- error de validación Zod.
- error de regla de negocio (sin episodio activo, por ejemplo).

5. **Loader/read model tests**
- devuelve contexto consolidado correcto.
- tolera ausencia parcial de datos sin romper UI.

6. **UI tests mínimos**
- render formulario en `/treatment`.
- resumen read-only visible en `/encounters` cuando hay contexto.

---

## 17) Criterios de aceptación (Definition of Done Fase 1)

1. Se pueden guardar y editar, por episodio activo:
- diagnóstico médico de referencia,
- impresión/diagnóstico kinésico,
- situación inicial funcional,
- objetivos terapéuticos,
- plan marco.

2. Diagnósticos quedan en `Condition` y vinculados desde `EpisodeOfCare.diagnosis[]`.

3. Baseline/objetivos/plan quedan en extensiones de `EpisodeOfCare` con URLs fijas y sin duplicados.

4. La UI consume read models (sin exponer FHIR crudo).

5. Escrituras solo por Server Actions con validación Zod.

6. `/encounters` mantiene su scoping actual y no duplica baseline por visita.

7. Suite mínima de tests en verde para dominio/mappers/repos/actions/loaders/UI crítica.

