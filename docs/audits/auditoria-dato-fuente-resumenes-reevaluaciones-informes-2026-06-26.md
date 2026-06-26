# Auditoría acotada — calidad y completitud del dato fuente para resúmenes, reevaluaciones e informes

> Estado: exploratoria, sin implementación
> Fecha: 2026-06-26
> Alcance: dato clínico fuente actual en `/admin/patients/[id]/treatment` y `/admin/patients/[id]/encounters/new`, con foco en su reutilización futura para resúmenes, reevaluaciones e informes clínicos

## Diagnóstico

### Conclusión corta

El modelo fuente actual ya tiene una separación conceptual correcta y útil para una app clínica mínima:

- contexto clínico longitudinal del ciclo en `EpisodeOfCare` + `Condition`;
- nota clínica puntual de visita en `Encounter`;
- métricas funcionales puntuales en `Observation`;
- cierre de ciclo en `EpisodeOfCare`.

El principal problema hoy no es falta total de estructura. El problema es de completitud operativa y de calidad de captura:

- casi todo el contenido clínico relevante es opcional;
- el resumen compartible depende fuertemente de pocos campos de `Encounter`;
- el contexto longitudinal captura bien el marco inicial del ciclo, pero todavía no captura bien hitos de reevaluación o síntesis de cierre;
- existe algo de capacidad semántica latente en tipos/schemas que la UI actual no usa;
- algunos labels y helper texts son suficientemente buenos para uso corriente, pero todavía no guían del todo la captura orientada a futuro informe/revaluación/cierre.

### Lectura ejecutiva

Para el estado actual del producto, el dato fuente es suficiente para:

- registro básico de visitas;
- tendencia funcional mínima;
- resumen compartible derivado de visita;
- un resumen clínico reciente acotado.

Todavía no es suficiente, sin fricción, para:

- una reevaluación comparable en el tiempo;
- un informe de cierre clínicamente consistente;
- un informe inicial relativamente completo sin depender de redacción libre muy variable.

## Mapa de datos fuente

## 1. Contexto longitudinal del tratamiento

### Superficie de captura

- `/admin/patients/[id]/treatment`
- `src/app/admin/patients/[id]/components/TreatmentClinicalContextForm.tsx`

### Dónde persiste

- `medicalReferenceDiagnosis` -> `Condition.code.text` referenciado desde `EpisodeOfCare.diagnosis[]`
- `kinesiologicDiagnosis` -> `Condition.code.text` referenciado desde `EpisodeOfCare.diagnosis[]`
- `initialFunctionalStatus` -> `EpisodeOfCare.extension[]`
- `therapeuticGoals` -> `EpisodeOfCare.extension[]`
- `frameworkPlan` -> `EpisodeOfCare.extension[]`

### Estado de obligatoriedad real

- todos estos campos son opcionales en la práctica actual;
- la UI los guarda de a uno por vez;
- no existe gate que exija un mínimo de completitud antes de usar `/encounters`.

### Calidad actual

Fortalezas:

- la separación entre diagnóstico y contexto longitudinal es clara;
- el contenido del ciclo no contamina la nota de visita;
- `/encounters` ya lo consume en modo lectura, sin duplicarlo.

Limitaciones:

- la UI solo captura texto libre para diagnósticos, aunque el tipo/schema admite `recordedAt` y `clinicalStatus`;
- no hay una noción explícita de “estado basal al inicio” versus “última reevaluación”;
- `therapeuticGoals` y `frameworkPlan` son útiles, pero muy abiertos y sin guía adicional;
- no hay un campo explícito para evolución longitudinal resumida del ciclo.

## 2. Cierre del tratamiento

### Superficie de captura

- `/admin/patients/[id]/treatment`
- `src/app/admin/patients/[id]/components/FinishEpisodeOfCareForm.tsx`

### Dónde persiste

- `endDate` -> `EpisodeOfCare.period.end`
- `closureReason` -> `EpisodeOfCare.extension[]`
- `closureDetail` -> `EpisodeOfCare.extension[]`

### Estado de obligatoriedad real

- `endDate`: obligatorio
- `closureReason`: obligatorio
- `closureDetail`: opcional, salvo cuando `closureReason === "other"`

### Calidad actual

Fortalezas:

- el cierre operativo ya tiene semántica explícita;
- permite recuperar motivo y detalle en historial;
- alcanza para un cierre administrativo/operativo razonable.

Limitaciones:

- `closureDetail` no es suficiente por sí solo como síntesis clínica de cierre;
- no hay captura explícita de resultados alcanzados, estado funcional al cierre o motivo clínico narrativo separado del motivo operativo.

## 3. Nota clínica de visita

### Superficie de captura

- `/admin/patients/[id]/encounters/new`
- `src/app/admin/patients/[id]/encounters/components/EncounterCreateForm.tsx`
- edición posterior en `src/app/admin/patients/[id]/encounters/components/EncounterClinicalNoteEditor.tsx`

### Dónde persiste

- `Encounter.extension[]`, mapeada como:
  - `subjective`
  - `objective`
  - `intervention`
  - `assessment`
  - `tolerance`
  - `homeInstructions`
  - `nextPlan`

### Estado de obligatoriedad real

- `startedAt`: obligatorio
- `endedAt`: obligatorio
- `visitStartPunctuality`: opcional
- nota clínica completa: opcional
- cada campo de nota: opcional

### Calidad actual

Fortalezas:

- la estructura es buena para una visita mínima;
- los campos distinguen bien observación, intervención, respuesta y continuidad;
- la edición posterior permite completar la nota sin tocar horario ni métricas;
- la UI ya explicita que esta nota es la fuente clínica interna.

Limitaciones:

- no hay ningún mínimo clínico requerido para una visita “válida” más allá de horario;
- `assessment` y `tolerance` pueden solaparse según el uso del profesional;
- no hay campo específico para objetivos de esa visita o problema principal del día, aunque parte puede caer en `intervention` o `assessment`;
- el dato puede quedar demasiado variable entre visitas porque todo el contenido clínico es libre.

## 4. Métricas funcionales

### Superficie de captura

- `/admin/patients/[id]/encounters/new`
- bloque “Métricas funcionales” del `EncounterCreateForm`

### Dónde persisten

- `Observation`, una por métrica:
  - `tug_seconds`
  - `pain_nrs_0_10`
  - `standing_tolerance_minutes`
  - `gait_duration_minutes`

### Estado de obligatoriedad real

- todas opcionales

### Calidad actual

Fortalezas:

- tienen validación de rango y tipo;
- ya alimentan tendencia funcional y resumen clínico reciente;
- son suficientemente pocas para no sobrecargar la visita.

Limitaciones:

- el set actual es útil pero estrecho;
- no distingue claramente métricas basales versus seriadas;
- algunas combinan tolerancia/capacidad funcional de forma muy general;
- la creación puede ser parcial: la visita puede quedar persistida aunque fallen algunas observaciones.

## 5. Profesional firmante

### Dónde se usa

- `visit-share-report.read-model.ts`
- `visit-share-report.composer.ts`

### Calidad actual

- el resumen compartible depende de la completitud del `Practitioner`;
- no afecta tanto la calidad clínica fuente, pero sí la “listitud” del resumen para compartir.

## Qué datos son obligatorios, opcionales o incompletos

| Dato | Superficie | Persistencia | Estado actual |
|---|---|---|---|
| Inicio de visita | `/encounters/new` | `Encounter.period.start` | Obligatorio |
| Cierre de visita | `/encounters/new` | `Encounter.period.end` | Obligatorio |
| Puntualidad operativa | `/encounters/new` | `Encounter.extension[]` | Opcional |
| Subjetivo | `/encounters/new` | `Encounter.extension[]` | Opcional |
| Objetivo | `/encounters/new` | `Encounter.extension[]` | Opcional |
| Intervención | `/encounters/new` | `Encounter.extension[]` | Opcional, pero clave para resumen |
| Evaluación/respuesta | `/encounters/new` | `Encounter.extension[]` | Opcional |
| Tolerancia | `/encounters/new` | `Encounter.extension[]` | Opcional |
| Indicaciones domiciliarias | `/encounters/new` | `Encounter.extension[]` | Opcional, pero clave para resumen |
| Próximo plan | `/encounters/new` | `Encounter.extension[]` | Opcional, pero clave para resumen |
| Diagnóstico médico de referencia | `/treatment` | `Condition` + referencia en `EpisodeOfCare` | Opcional |
| Diagnóstico kinésico | `/treatment` | `Condition` + referencia en `EpisodeOfCare` | Opcional |
| Situación funcional inicial | `/treatment` | `EpisodeOfCare.extension[]` | Opcional |
| Objetivos terapéuticos | `/treatment` | `EpisodeOfCare.extension[]` | Opcional |
| Plan marco | `/treatment` | `EpisodeOfCare.extension[]` | Opcional |
| Motivo de cierre | `/treatment` | `EpisodeOfCare.extension[]` | Obligatorio al cerrar |
| Detalle de cierre | `/treatment` | `EpisodeOfCare.extension[]` | Opcional salvo `other` |
| Métricas funcionales | `/encounters/new` | `Observation` | Opcionales |

### Dato incompleto o subutilizado

- `Condition.recordedAt` y `Condition.clinicalStatus` existen a nivel mapper/schema, pero hoy no se capturan en la UI ni se reutilizan aguas abajo.
- no existe un dato explícito de reevaluación longitudinal.
- no existe una síntesis clínica de cierre separada del cierre operativo.

## Qué campos actuales alimentan bien el resumen compartible

El resumen compartible actual funciona razonablemente bien cuando existen:

- `Encounter.startedAt`
- `Encounter.endedAt`
- `visitStartPunctuality`
- `clinicalNote.intervention`
- `clinicalNote.assessment`
- `clinicalNote.tolerance`
- `clinicalNote.homeInstructions`
- `clinicalNote.nextPlan`
- métricas funcionales si están presentes
- profesional firmante utilizable

### Campos que más impactan hoy

Los tests y la lógica de completitud muestran que los más determinantes son:

- `intervention`
- `homeInstructions`
- `nextPlan`
- firma profesional

En cambio, estos ayudan pero no determinan tanto la “listitud”:

- `subjective`
- `objective`
- `assessment`
- `tolerance`
- métricas

### Lectura importante

El resumen compartible actual depende mucho más de la visita puntual que del contexto longitudinal. Eso es coherente con el producto actual, pero deja débil cualquier salto futuro hacia informe inicial, reevaluación o cierre si no se fortalece el dato fuente longitudinal.

## Qué campos faltan o están mal ubicados para futura reevaluación o informe de cierre

### Para reevaluación

Faltan o están débiles:

- una forma explícita de registrar cambios respecto de la situación funcional inicial;
- una síntesis longitudinal breve del progreso del ciclo;
- una captura más guiada de objetivos alcanzados / pendientes;
- una forma clara de distinguir “dato basal” de “estado reevaluado”.

No necesariamente falta un recurso nuevo. Falta, primero, semántica y captura más clara.

### Para informe de cierre

Faltan o están débiles:

- síntesis clínica de cierre;
- estado funcional al cierre;
- correlación explícita entre objetivos terapéuticos y resultado del ciclo;
- motivos clínicos/narrativos de alta, suspensión o derivación más allá del motivo operativo.

### Qué está potencialmente mal ubicado

- pretender que `closureDetail` absorba una conclusión clínica de cierre sería forzarlo demasiado;
- pretender que la última nota de `Encounter` funcione como reevaluación o cierre también sería mezclar semánticas.

## ¿Hay duplicación entre `Encounter`, `EpisodeOfCare`, `Condition` y `Observation`?

### Duplicación real hoy

No hay una duplicación grave de persistencia estructural. La separación base es correcta.

### Riesgos de duplicación semántica

Sí hay riesgos potenciales de superposición:

- diagnóstico kinésico podría repetirse en `assessment` de múltiples visitas;
- evolución longitudinal podría quedar dispersa entre `assessment` de visitas y `frameworkPlan` del ciclo;
- cierre narrativo podría terminar escribiéndose parcialmente en `closureDetail` y parcialmente en la última visita.

### Conclusión

La deuda no es “hay demasiados campos iguales”. La deuda es “faltan convenciones de uso para no cargar longitudinalidad dentro de la visita puntual”.

## Brechas detectadas

### Brecha 1

La visita puede registrarse sin ningún contenido clínico más allá del horario.

Impacto:

- baja reutilización futura para resumen, seguimiento o informe.

### Brecha 2

El resumen compartible considera “ready” sobre todo cuando hay intervención + indicaciones o plan + firma, pero eso no garantiza una nota clínica rica para seguimiento o reevaluación.

Impacto:

- buen resumen compartible no equivale necesariamente a buen dato clínico fuente.

### Brecha 3

El contexto longitudinal del tratamiento es correcto como estructura, pero todavía muy libre y sin hitos de reevaluación.

Impacto:

- cuesta reutilizarlo para un informe inicial o una evolución longitudinal clara.

### Brecha 4

El cierre captura motivo y detalle operativos, pero no una conclusión clínica final del ciclo.

Impacto:

- un futuro informe de cierre quedaría débil sin releer visitas y reconstruir narrativa.

### Brecha 5

Existe semántica de diagnóstico más rica en tipos/mappers (`recordedAt`, `clinicalStatus`) que hoy no llega a la UI ni al read model.

Impacto:

- capacidad subutilizada, pero no necesariamente prioritaria.

## Recomendación incremental

### Recomendación principal

No agregar todavía campos nuevos de alto alcance ni recursos FHIR nuevos.

La mejor secuencia incremental parece ser:

1. mejorar la calidad de uso de los campos existentes;
2. reforzar labels, helper text y expectativa de completitud;
3. solo después decidir si hace falta sumar 1 o 2 campos nuevos muy puntuales.

### Por qué

- el modelo actual ya es suficientemente bueno para una app mínima;
- todavía hay margen alto de mejora sin tocar persistencia;
- agregar campos temprano puede aumentar ruido y no necesariamente mejorar el dato.

## Qué mejoras mínimas de captura tendrían mayor impacto

### Mayor impacto con menor costo

1. Guiar mejor el uso de `assessment` y `tolerance`.
2. Guiar mejor `initialFunctionalStatus` para que funcione realmente como basal.
3. Guiar mejor `therapeuticGoals` para que quede redactado como resultado observable, no solo intención general.
4. Guiar mejor `frameworkPlan` para que represente estrategia longitudinal y no evolución puntual.
5. Explicitar mejor que `closureDetail` es insuficiente como síntesis clínica de cierre.

### Si más adelante hubiera un patch mínimo

La primera opción razonable sería mejorar labels y helper text antes que agregar campos.

## ¿Conviene agregar campos, mejorar labels/help text, o solo mejorar uso de lo existente?

### Recomendación

Primero:

- mejorar labels/help text;
- aclarar expectativa de uso;
- revisar criterios de completitud del resumen y del contexto clínico.

Solo después:

- evaluar si hace falta un campo puntual de “síntesis clínica de cierre” o una forma explícita de “reevaluación”, pero eso no parece justificado todavía como primer patch.

### Motivo

Hoy la brecha dominante es de captura consistente, no de falta absoluta de contenedores.

## Qué NO conviene agregar todavía

- un “informe” persistido de cualquier tipo;
- campos genéricos tipo “observaciones generales del tratamiento” sin semántica clara;
- duplicados de diagnóstico en `Encounter`;
- campos de comunicación familiar dentro de la nota clínica;
- una capa de reevaluación compleja que convierta la app en HCE;
- más métricas por agregar sin validar antes la utilidad real de las cuatro actuales.

## Patch mínimo sugerido si después se aprueba implementación

### Opción recomendada

Patch 1 acotado, sin tocar FHIR ni contrato de recursos:

- mejorar labels y helper text en `TreatmentClinicalContextForm`;
- mejorar helper text en `EncounterCreateForm` y `EncounterClinicalNoteEditor`;
- opcionalmente agregar copy de completitud sugerida en UI:
  - para resumen compartible de visita: `intervention`, `homeInstructions`, `nextPlan`;
  - para contexto longitudinal útil: diagnóstico médico, diagnóstico kinésico, situación funcional inicial y objetivos.

### Qué no tocaría en ese primer patch

- no haría obligatorios campos clínicos;
- no agregaría campos nuevos todavía;
- no cambiaría mappers;
- no cambiaría repositorios;
- no tocaría `visit-share-report` para persistir nada.

## Riesgos

### Riesgo clínico

- que el dato siga siendo demasiado heterogéneo entre visitas si todo queda opcional y libre.

### Riesgo técnico

- que un patch de UX termine insinuando reglas de obligatoriedad que todavía no existen en dominio.

### Riesgo de producto

- sobreguiar demasiado la captura y volver más pesada la visita mínima.

### Riesgo de alcance

- convertir una mejora de calidad de dato en una rediscusión grande de modelo clínico.

## Tests sugeridos para un patch posterior

Si se implementa un patch mínimo de labels/help text/copy:

- `src/app/admin/patients/[id]/components/__tests__/TreatmentClinicalContextForm.test.ts`
- `src/app/admin/patients/[id]/encounters/components/EncounterCreateForm.test.ts`
- `src/app/admin/patients/[id]/encounters/components/EncounterClinicalNoteEditor.test.ts`

Si además cambia la lógica de completitud:

- `src/features/visit-share-report/__tests__/visit-share-report.completeness.test.ts`
- `src/features/visit-share-report/__tests__/visit-share-report.composer.test.ts`
- `src/features/visit-share-report/__tests__/visit-share-report.read-model.test.ts`

Si se tocara validación o obligatoriedad:

- `src/domain/encounter/__tests__/encounter.schemas.test.ts`
- `src/domain/treatment-context/__tests__/treatment-context.schemas.test.ts`
- actions de tratamiento/encounters correspondientes

## Documentación a revisar si luego se implementa un patch

- `docs/fuente-de-verdad-operativa.md`
  Si cambia la expectativa operativa de captura o la definición de qué alimenta resúmenes.
- `docs/fhir/README.md`
  Solo si cambia el contrato efectivo de campos persistidos o su semántica.
- `docs/checklist-sincronizacion-doc-codigo.md`
  No necesariamente requiere cambio, pero sí usarlo al cerrar el patch.
- `README.md`
  Solo si cambia de forma relevante la descripción portfolio-facing del flujo clínico.

## Recomendación final

El dato fuente actual ya está suficientemente bien separado para la etapa del producto, pero todavía no está suficientemente guiado para soportar sin fricción futuros resúmenes más ricos, reevaluaciones o cierres clínicos.

La mejor siguiente jugada no es agregar artefactos nuevos ni más persistencia. Es mejorar la calidad y consistencia de captura de lo que ya existe, empezando por copy, helper text y convenciones de uso, y recién después reevaluar si falta un campo nuevo realmente imprescindible.
