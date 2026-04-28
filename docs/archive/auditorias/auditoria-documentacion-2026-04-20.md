> Estado: archivado  
> Motivo: Documento histórico de auditoría/cierre/plan ya superado por la fuente operativa vigente o por implementación cerrada.  
> Fecha de archivo: 2026-04-28  
> Reemplazado/relacionado con: docs/fuente-de-verdad-operativa.md

# Auditoría de actualización documental vs avance real del proyecto

> Fecha de auditoría: 2026-04-20 (UTC)
> Alcance: documentación funcional/técnica principal del repo vs implementación observable en código.

## 1) Diagnóstico ejecutivo

El estado de la documentación es **parcialmente actualizado**.

- **Grado global estimado de actualización**: **72%**.
- **Cobertura bien alineada**: arquitectura general de landing + presencia de superficie privada `/admin/patients`.
- **Desfasaje principal**: varios documentos clave todavía describen el sistema como **pre-Encounter**, pero en código ya existe Encounter base funcional (`/admin/patients/[id]/encounters`, action, repositorio, mappers, tests).

## 2) Método de comparación

Se contrastó documentación con evidencia en:

- rutas y páginas de `src/app/admin/patients/**`;
- acciones y validaciones de dominio Encounter;
- repositorio/mappers/tests de Encounter;
- estado de sitemap/SEO y fuentes de verdad declaradas.

## 3) Hallazgos por documento

## 3.1 README.md

**Estado**: desactualizado (alto impacto).

### Desfasajes detectados

1. Describe el proyecto como “sitio de captación (sin backend transaccional)”, pero ya existe superficie privada clínica transicional con escritura/lectura FHIR.
2. No menciona rutas privadas ni capacidad de registrar visitas (Encounter base).
3. Lista una ruta de fuente de verdad incorrecta para servicios (apunta a `src/app/services/data/servicesData.ts`, mientras la fuente real está en `src/lib/servicesData.ts`).

### Actualización propuesta

- Reencuadrar estado como “landing + superficie privada mínima clínica”.
- Agregar rutas privadas y capacidades clínicas mínimas vigentes.
- Corregir rutas de fuentes de verdad al árbol real.

## 3.2 docs/fuente-de-verdad-operativa.md

**Estado**: parcialmente desactualizado (alto impacto).

### Desfasajes detectados

1. Declara que la superficie privada “aún no cubre Encounter”, pero Encounter base ya está implementado.
2. Falta la ruta `/admin/patients/[id]/encounters` en el inventario de rutas.
3. Mantiene Encounter como fuera de alcance, contradiciendo implementación real.

### Actualización propuesta

- Declarar explícitamente que existe **Encounter base** (registro/listado simple de visitas realizadas).
- Actualizar rutas privadas y capacidades implementadas.
- Ajustar límites: fuera de alcance pasa a ser “detalle clínico rico, longitudinal complejo, Observation/Procedure”, no Encounter base.

## 3.3 docs/slice-1/slice-1.md

**Estado**: desactualizado por arrastre (impacto medio).

### Desfasajes detectados

- En “Fuera de alcance vigente” incluye encounters, pero el repositorio ya avanzó con Slice 2 funcional.

### Actualización propuesta

- Congelar el documento como “cierre histórico de Slice 1” y aclarar que el alcance posterior (Encounter) se implementó en Slice 2.
- Evitar reescribir objetivos originales de Slice 1, pero agregar nota de contexto para no inducir lecturas incorrectas.

## 3.4 docs/slice-1/backlog-tecnico-slice1.md

**Estado**: desactualizado por arrastre (impacto medio).

### Desfasajes detectados

- Sigue afirmando “sin Encounter” en límites vigentes.

### Actualización propuesta

- Mantener cierre de Slice 1, pero aclarar que el límite “sin Encounter” ya no representa estado global del repo.

## 3.5 docs/slice-2/encounter-base-pre-implementacion.md

**Estado**: fuertemente desactualizado (alto impacto).

### Desfasajes detectados

1. Se presenta como pre-implementación.
2. Afirma explícitamente que Encounter no existe en código.
3. Mantiene criterios de cierre futuros que hoy ya están cumplidos.

### Actualización propuesta

- Convertirlo a documento de cierre de Slice 2 implementado (o reemplazarlo por uno nuevo de cierre).
- Marcar criterios cumplidos y registrar límites que continúan fuera de alcance.

## 4) Evidencia técnica del avance real (resumen)

Encounter base ya existe en implementación con:

- ruta funcional: `/admin/patients/[id]/encounters`;
- listado y formulario de alta de visita;
- `createEncounterAction` con gate por tratamiento activo y verificación de `episodeOfCareId`;
- repositorio FHIR para alta/listado de `Encounter`;
- mappers read/write de Encounter;
- tests unitarios e integración para Encounter.

## 5) Grado de actualización por bloque documental

| Bloque | Estado | Grado estimado |
| --- | --- | --- |
| README | desactualizado | 45% |
| Fuente de verdad operativa | parcialmente desactualizado | 70% |
| Slice 1 (cierre) | parcialmente desactualizado por arrastre | 80% |
| Slice 2 Encounter | desactualizado crítico | 25% |
| Promedio ponderado | **parcialmente actualizado** | **72%** |

## 6) Propuesta de actualización adecuada (priorizada)

### Prioridad P0 (hacer ahora)

1. Actualizar `README.md` para reflejar estado real de producto y rutas.
2. Actualizar `docs/fuente-de-verdad-operativa.md` para alinear capacidades y límites.
3. Transformar `docs/slice-2/encounter-base-pre-implementacion.md` en documento de cierre implementado.

### Prioridad P1 (próximo bloque)

4. Agregar nota explícita en docs de Slice 1 indicando que Encounter quedó resuelto en slice posterior.
5. Revisar referencias cruzadas entre documentos para evitar contradicciones.

### Prioridad P2 (mantenimiento)

6. Establecer checklist de “sincronización doc-código” por cada merge funcional (rutas, alcance, fuera de alcance, tests).

## 7) Resultado esperado tras la actualización

Si se aplican P0 + P1, la documentación quedaría en un nivel estimado de actualización de **90–95%**, con desfasajes menores solo en backlog futuro y decisiones no críticas.
