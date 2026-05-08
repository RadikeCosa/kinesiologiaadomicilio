# Auditoría pre-implementación (actualizada): marcha funcional estructurada para Fase 2B PR1 (sin código)

**Fecha de actualización:** 2026-05-08  
**Estado:** Recomendación vigente actualizada contra estado real del proyecto

## 1) Diagnóstico de necesidad (revalidado)

### Conclusión

La recomendación **sigue vigente**: conviene incorporar marcha funcional como nueva `Observation` mínima en Fase 2B, manteniendo bajo costo de captura y sin rigidizar el flujo.

### Justificación contra estado actual

Con el estado actual del producto (clinicalNote estructurada en `Encounter`, contexto longitudinal en `EpisodeOfCare + Condition`, y observaciones funcionales mínimas ya operativas para TUG/dolor/bipedestación), sumar una métrica de marcha mínima:

- completa el set funcional de visitas con un dato ambulatorio comparativo;
- mantiene coherencia con patrón ya implementado de `Observation` funcional;
- evita que todo lo relacionado con marcha quede exclusivamente en narrativa;
- habilita tendencia futura sin requerir rediseño de superficies clínicas.

---

## 2) Matriz de alcance actualizada (decisión para PR1)

| Modalidad de marcha | ¿Implementar en Fase 2B PR1? | Prioridad | Decisión |
|---|---:|---:|---|
| `gait-duration-minutes` (minutos) | **Sí** | **Alta** | **In scope PR1** |
| Asistencia simple (asistida/no asistida) | No | Media | **Fuera de PR1** (eventual PR separado) |
| Distancia (metros) | No | Media | Fuera de PR1 |
| Pasos | No | Baja | Fuera de PR1 |
| Terreno/superficie | No | Baja | Queda en `clinicalNote` |
| Dificultad subjetiva | No | Baja | Queda en `clinicalNote` |
| Asistencia detallada y dispositivo | No | Media | Queda en `clinicalNote` |
| Compensaciones y hallazgos cualitativos | No | Alta clínica, baja estructuración inicial | Queda en `clinicalNote` |

**Resolución:** PR1 de Fase 2B incorpora solo una medición cuantitativa: `gait-duration-minutes`.

---

## 3) Recomendación FHIR actualizada

### 3.1 Recurso

- Usar `Observation` simple.
- **No** usar `Observation.component` en fase inicial.

### 3.2 Patrón de representación

Para `gait-duration-minutes`:

- `Observation.status = final`
- `Observation.subject = Reference(Patient)`
- `Observation.encounter = Reference(Encounter)`
- `Observation.effectiveDateTime = fecha/hora de visita`
- `Observation.code = CodeableConcept(local)`
- `Observation.valueQuantity = minutos`

### 3.3 Namespace/código local canónico

Alinear al namespace FHIR interno vigente:

- `system`: `https://kinesiologiaadomicilio.local/fhir/CodeSystem/functional-observations`
- `code`: `gait-duration-minutes`
- `unit`: `min`
- `valueQuantity.system`: `http://unitsofmeasure.org`
- `valueQuantity.code`: `min`

> Nota de control de drift: documentos antiguos usan `.cl` y hay rastros aislados con otros dominios; para Fase 2B PR1 se debe usar `.local` como canónico interno.

---

## 4) Reglas mínimas de validación (gait-duration-minutes)

### Rango recomendado

- `>= 0` y `<= 180` minutos.

### Racional operativo

- `0` permite registrar imposibilidad/ensayo no tolerado en visita.
- `180` funciona como guard-rail alto en domicilio para evitar errores de carga (ej. cero de más).

### Reglas de formato

- numérico;
- permitir decimales cortos (ej. 0.5) solo si UX actual ya los soporta de forma consistente;
- si no hay soporte claro de decimales, usar entero y documentarlo en helper textual.

---

## 5) Qué queda en clinicalNote (confirmado)

Permanece en `clinicalNote` en esta fase:

- terreno/superficie (plano, pendiente, rampa, irregular);
- dificultad/tolerancia subjetiva de marcha;
- asistencia detallada (supervisión, mínima, moderada, máxima);
- dispositivo (bastón, andador, acompañante);
- compensaciones, pausas, síntomas y observaciones cualitativas.

---

## 6) UX mínima (sin rediseño)

### Ubicación

- Dentro de **Métricas funcionales** (misma superficie actual).
- Campo opcional.

### Captura

- Un único input: `Marcha (min)` o `Marcha: minutos`.
- Sin selector de modalidad (tiempo/distancia/pasos) en PR1.
- Sin bloque nuevo complejo ni subformulario.

### Render en card

- Mostrar **solo si existe**:
  - `Marcha: X min`
- Si no existe, no renderizar línea vacía ni placeholder adicional.

---

## 7) Tests mínimos para Fase 2B PR1 (cuando se implemente)

1. **Schema/domain**
   - valida obligatoriedad estructural de `Observation`;
   - valida rango `0..180` para `gait-duration-minutes`.
2. **Mapper**
   - write mapper serializa `code/system` canónicos (`.local`) y `valueQuantity` en minutos;
   - read mapper recupera valor y metadatos correctamente.
3. **Repository**
   - persistencia y recuperación por `patient + encounter`;
   - listado cronológico para consumo de UI.
4. **Form**
   - submit sin dato de marcha (opcional) no rompe flujo;
   - submit con valor válido guarda observation;
   - error inline con valor fuera de rango.
5. **Card/UI de visita**
   - render condicional `Marcha: X min` solo cuando existe.

---

## 8) Alcance final recomendado para Fase 2B PR1

**In scope PR1:**

- nueva `Observation` funcional mínima `gait-duration-minutes`;
- captura opcional por visita en bloque Métricas funcionales;
- render mínimo en card (`Marcha: X min`);
- tests de schema/mapper/repository/form/card asociados.

**Fuera de PR1 (eventual PR separado):**

- asistencia simple estructurada (asistida/no asistida);
- distancia, pasos;
- terreno, dificultad, asistencia detallada, dispositivo, compensaciones como estructura.

---

## 9) No-alcances preservados

Se preservan explícitamente:

- no implementar código en esta auditoría;
- no agregar `Procedure`;
- no agregar `Goal`;
- no agregar IA;
- no rediseñar formulario;
- no cambiar métricas funcionales existentes (TUG, dolor, bipedestación);
- no cambiar `clinicalNote`;
- no cambiar scoping clínico actual.

---

## Recomendación final resumida

Para evitar drift y complejidad prematura, Fase 2B PR1 debe incorporar únicamente `gait-duration-minutes` como `Observation` simple, con código local en namespace canónico `.local`, validación de rango `0..180`, captura opcional en Métricas funcionales y render condicional en card. Todo el contexto cualitativo de marcha se mantiene en `clinicalNote`.

## Actualización de cierre — Fase 2B PR1 implementada (2026-05-08)

- Se implementó `gait_duration_minutes` como nueva métrica funcional opcional por visita.
- Mapeo FHIR aplicado: `gait-duration-minutes` con code system local canónico `https://kinesiologiaadomicilio.local/fhir/CodeSystem/functional-observations`.
- Se mantiene `Observation` simple (sin `Observation.component`) y asociación a `Patient` + `Encounter`.
- Se agregó validación `0..180` (entero), aceptando `0` como dato válido.
- UX: campo `Marcha` en bloque `Métricas funcionales` de `/encounters/new` (opcional, sin rediseño).
- Card `/encounters`: render condicional `Marcha: X min`, respetando orden canónico `TUG → Dolor → Bipedestación → Marcha`.
- No-alcances preservados: sin distancia/pasos/asistencia/terreno/dificultad estructurados; continúan en `clinicalNote`.


### Validación ejecutada en PR1

- `npx vitest run src/domain/functional-observation/__tests__/functional-observation.schemas.test.ts`
- `npx vitest run src/domain/encounter/__tests__/encounter.schemas.test.ts`
- `npx vitest run src/infrastructure/mappers/functional-observation/__tests__/functional-observation.mapper.test.ts`
- `npx vitest run src/app/admin/patients/[id]/encounters/actions/__tests__/create-encounter.action.test.ts`
- `npx vitest run src/app/admin/patients/[id]/encounters/components/EncounterCreateForm.test.ts`
- `npx vitest run src/app/admin/patients/[id]/encounters/components/EncountersList.test.ts`
- `npm run lint`

### Checklist doc-código ejecutado

- Checklist aplicado: `docs/checklist-sincronizacion-doc-codigo.md`.
- Documentos actualizados: `docs/fuente-de-verdad-operativa.md`, `docs/product/auditoria-fase2b-pre-marcha-funcional-estructurada-2026-05-07.md`, `README.md`.
- Documentos revisados sin cambios: `docs/fhir/README.md` (sin drift para este alcance puntual).
- Fuera de alcance preservado: sin asistencia, distancia, pasos, terreno, dificultad ni `Observation.component`; sin `Procedure`, `Goal`, IA, dashboard o tendencia funcional.
