# Auditoría Fase 2A: Observations funcionales mínimas para seguimiento kinésico (sin IA)

**Fecha:** 2026-05-07  
**Estado:** Propuesta de alcance mínimo (sin implementación)

## 1) Diagnóstico de necesidad real

Sí existe necesidad real de introducir `Observation` en una fase mínima, porque hoy los datos funcionales longitudinales quedan embebidos en texto clínico de `Encounter` y eso limita:

- comparabilidad entre visitas;
- detección rápida de tendencia (mejora/meseta/deterioro);
- consistencia para reportes clínicos básicos;
- interoperabilidad futura con recursos FHIR clínicos adicionales.

A la vez, **no conviene** intentar cubrir toda la valoración kinésica en esta fase porque aumentaría fricción de registro y riesgo de abandono del formulario. Por eso Fase 2A debe enfocarse en **muy pocos** datos repetibles, de alta utilidad transversal, bajo costo de captura y lectura inmediata.

## 2) Matriz: dato funcional → Observation sí/no → prioridad

| Dato funcional | Observation ahora | Prioridad | Justificación operativa |
|---|---|---:|---|
| **TUG (Timed Up and Go)** | **Sí** | **Alta** | Medida objetiva, comparable por tiempo, sensible a cambios funcionales y riesgo de caídas. |
| **Dolor (NRS 0–10)** | **Sí** | **Alta** | Universal en evolución, fácil de captar, útil para decisiones de carga y tolerancia. |
| **Tolerancia a bipedestación (minutos)** | **Sí** | **Alta** | Muy útil en domicilio, cuantificable, directa para metas funcionales cotidianas. |
| Marcha/asistencia | Parcial (texto por ahora) | Media | Puede requerir taxonomía más rica (dispositivo, ayuda humana, distancia, superficie). |
| Equilibrio | No (texto por ahora) | Media | Suele depender de escalas/protocolos no unificados en la práctica diaria. |
| Fatiga | No (texto por ahora) | Media | Heterogénea sin instrumento estandarizado acordado (ej. Borg/FSS). |
| Riesgo de caídas | No (derivado) | Media | Mejor derivarlo de combinación de hallazgos (TUG + clínica), no forzarlo aún como campo aislado. |
| Otros hallazgos funcionales | No (texto) | Baja | Mantener en nota clínica para no rigidizar excesivamente. |

## 3) Qué vincular a Encounter vs EpisodeOfCare

### Vincular en Fase 2A a `Encounter` (obligatorio)

Las observaciones seleccionadas deben registrarse como “mediciones de esa visita”. Por eso la referencia primaria es:

- `Observation.subject` → paciente
- `Observation.encounter` → visita donde se capturó el dato

### Considerar relación con `EpisodeOfCare` (opcional por integración)

En FHIR R4 no existe un `Observation.episodeOfCare` nativo. Para evitar extensiones prematuras:

- derivar pertenencia longitudinal vía `Observation.encounter -> Encounter.partOf / contexto clínico ya resuelto en Encounter`;
- resolver series por episodio desde capa de lectura (join por encounters del episodio).

Conclusión práctica: **no agregar extensión custom en 2A** para episodio; mantener modelo simple y trazable.

## 4) Recomendación de estructura FHIR (mínima y estable)

Para cada observación 2A:

- `Observation.status`: `final` (default recomendado)
- `Observation.subject`: `Reference(Patient)`
- `Observation.encounter`: `Reference(Encounter)`
- `Observation.effectiveDateTime`: fecha/hora clínica de la medición (ideal: la de la visita)
- `Observation.code`: `CodeableConcept` (sistema local versionado inicialmente)
- `Observation.value[x]` según tipo:
  - TUG → `valueQuantity` (segundos)
  - Dolor NRS → `valueQuantity` (escala 0–10, unit “score” o `{score}` local)
  - Bipedestación → `valueQuantity` (minutos)

No usar `valueString` en estos tres casos para preservar comparabilidad. Reservarlo para observaciones narrativas futuras.

## 5) Estrategia de codificación (códigos)

### Política recomendada

1. **Iniciar con sistema local versionado** para velocidad y control semántico.
2. Adoptar LOINC/SNOMED **solo cuando equivalencia esté validada clínicamente y semánticamente**.
3. Evitar “mapeos aproximados” que rompan interoperabilidad futura.

### Propuesta local inicial

- `system`: `https://kinesiologiaadomicilio.cl/fhir/CodeSystem/functional-observations`
- `version`: `0.1.0`
- `code`:
  - `tug-seconds`
  - `pain-nrs-0-10`
  - `standing-tolerance-minutes`

Se puede documentar “candidato de mapeo estándar” en tabla aparte sin comprometer validación runtime en 2A.

## 6) Cardinalidad y validaciones mínimas

## Reglas por recurso

- `status`: obligatorio (`final` por defecto)
- `subject`: obligatorio
- `code`: obligatorio
- `effectiveDateTime`: obligatorio
- `encounter`: obligatorio en 2A
- `valueQuantity`: obligatorio para los 3 tipos definidos

### Reglas de rango

- **TUG segundos**: `> 0` y `<= 300` (guard-rail operativo; fuera de rango requerir confirmación)
- **Dolor NRS**: entero `0..10`
- **Bipedestación minutos**: `>= 0` y `<= 240` (guard-rail operativo)

### Reglas de unicidad por visita (soft)

- máximo **1 valor por código por Encounter** en flujo estándar;
- si hay corrección, reemplazo explícito (no duplicar silenciosamente).

## 7) Cómo no sobrecargar el formulario clínico

### Patrón UX recomendado

- Sección plegable: **“Métricas funcionales (opcional)”**.
- Solo 3 campos, todos opcionales en 2A (para adopción gradual).
- Inputs rápidos:
  - TUG (segundos) numérico;
  - Dolor actual 0–10 con step 1;
  - Bipedestación (min) numérico.
- Ayudas breves (tooltip/placeholder) de 1 línea por campo.
- Persistencia de últimos valores como referencia visual no editable (para reducir carga cognitiva).

## 8) Tendencia sin dashboard complejo

Mostrar en la ficha clínica del paciente (o timeline de visitas) un bloque compacto:

- **Último valor + fecha** por métrica;
- **Delta vs medición previa** (↑/↓/= con valor absoluto);
- acceso a “ver histórico” como lista tabular simple (fecha, encounter, valor).

Sin gráficos avanzados en 2A. Una mini-tabla cronológica descendente alcanza para utilidad clínica inicial.

## 9) Privacidad y minimización de datos

- Registrar únicamente dato clínico funcional + contexto clínico mínimo (`subject`, `encounter`, fecha).
- No incluir identificadores administrativos extra en Observation.
- Evitar texto libre sensible en estos 3 campos estructurados.
- Mantener controles existentes de acceso de superficie admin clínica.

## 10) Qué queda explícitamente fuera (Procedure/Goal/IA)

Fuera de Fase 2A:

- `Procedure` (intervenciones terapéuticas detalladas);
- `Goal` (objetivos formales y target tracking);
- cualquier scoring predictivo, recomendador o automatización con IA;
- cuestionarios extensos o baterías completas de equilibrio/fatiga;
- rediseño global de visitas.

## Propuesta de alcance Fase 2A (mínimo viable)

Implementar hasta **3 Observation** estructuradas:

1. `tug-seconds`
2. `pain-nrs-0-10`
3. `standing-tolerance-minutes`

Con captura opcional por visita y lectura de tendencia básica (último + previo).

## Riesgos y mitigaciones

- **Riesgo:** baja adherencia de carga.  
  **Mitigación:** campos opcionales, pocos, visibles solo si aplica.
- **Riesgo:** inconsistencias semánticas iniciales.  
  **Mitigación:** code system local versionado + glosario corto.
- **Riesgo:** duplicados por visita.  
  **Mitigación:** restricción soft 1/código/encounter.
- **Riesgo:** expansión prematura de alcance.  
  **Mitigación:** congelar 2A a 3 métricas, backlog explícito para 2B.

## Tests mínimos sugeridos (cuando se implemente)

1. **Schema/domain tests**
   - valida obligatoriedad (`status`, `subject`, `encounter`, `code`, `effectiveDateTime`, `valueQuantity` según tipo);
   - valida rangos por métrica.
2. **Mapper tests**
   - roundtrip read/write de Observation local;
   - unidad y sistema correctos por código.
3. **Repository tests**
   - create/list por patient + encounter;
   - orden cronológico correcto;
   - prevención de duplicado por código/encounter.
4. **UI form tests**
   - render sección opcional;
   - submit con 0, 1, 2 o 3 métricas;
   - validación inline de rangos.
5. **Integración mínima**
   - guardar Encounter + Observations asociadas;
   - recuperar último/previo por métrica en vista paciente.

## Criterios de aceptación propuestos

- Existe contrato de `Observation` mínimo para 3 métricas, validado por tests.
- Las 3 métricas se pueden guardar opcionalmente en una visita sin romper flujo actual.
- Cada Observation queda asociada a `Patient` y `Encounter`.
- Se puede mostrar último valor y previo por métrica en UI clínica sin dashboard complejo.
- No se introducen `Procedure`, `Goal`, ni componentes de IA.
- No se modifica el alcance funcional de Fase 0/Fase 1 más allá de integración mínima.

## Estado de implementación

- PR1 (dominio, schemas y mappers FHIR de Observation funcional mínima, sin UI): implementado en código.
