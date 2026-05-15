# AUDIT LANDING-GROWTH-001 (2026-05-15)

## Alcance auditado
- Rutas públicas revisadas: `/`, `/services`, `/evaluar`.
- Superficies excluidas: `/admin` y flujo clínico privado.
- Fuentes auditadas: Search Console (exportes 28/90 días), GA4 público y registro manual de WhatsApp (negocio).
- Esta iteración **no** rediseña la landing completa, **no** crea páginas nuevas y **no** toca la app clínica privada.

---

## 1) Diagnóstico actualizado (de preliminar a cuantificado)

La versión preliminar del audit planteaba correctamente la base técnica, pero indicaba que faltaba baseline versionado. En esta actualización se incorpora baseline real inicial y se cambia la tesis:

- El cuello de botella principal **no es** necesariamente la conversión consulta → paciente.
- Con registro manual (1 marzo–15 mayo) la conversión consulta → paciente ronda ~33%, valor saludable para servicio profesional local.
- El foco pasa a: **más volumen orgánico calificado + mejor trazabilidad + menor descarte por distancia/costo/obra social**.

### 1.1 Estado de medición técnica (GA4 público)
- Instrumentación vigente en rutas públicas para:
  - `generate_lead` (click de WhatsApp),
  - `phone_click` (click teléfono),
  - `scroll_50`,
  - `scroll_90`.
- Se mantiene criterio de análisis de captación **solo** sobre `/`, `/services`, `/evaluar`.
- `/admin` y superficies privadas quedan explícitamente fuera de conclusiones de marketing.

### 1.2 Advertencia de lectura GA4 histórica
- Puede existir contaminación histórica de datasets globales por tráfico/eventos de `/admin` en periodos anteriores.
- Por lo tanto, el análisis de captación de esta auditoría debe filtrar por rutas públicas auditadas y no usar agregados de “todo el sitio” para decisiones de marketing.

---

## 2) Baseline real cuantificado

## 2.1 Baseline negocio (registro manual WhatsApp)
**Período:** 2026-03-01 a 2026-05-15 (aprox.)

- Consultas por WhatsApp: **≥15**.
- Pacientes que iniciaron tratamiento: **5**.
- Conversión consulta → paciente estimada: **~33%**.

### Motivos observados de no avance
- Distancia/zona fuera de cobertura práctica (múltiples casos).
- Expectativa de costo y posterior no continuidad.
- Consulta por obra social que no continuó al aclararse modalidad particular.

### Lectura de negocio
- La conversión de fondo no luce crítica para el tipo de servicio.
- El problema principal parece estar en la mezcla entre consultas calificadas e inviables antes del contacto efectivo.

## 2.2 Baseline Search Console (28 y 90 días)
Se incorporan exportes disponibles para lectura por **consulta** y **página**, con foco en:
- `/`
- `/services`
- `/evaluar`

### Ejes de análisis obligatorios en baseline
1. Clicks, impresiones, CTR y posición media por query.
2. Distribución por página de aterrizaje pública.
3. Segmentación mobile vs desktop (cuando esté disponible en export).
4. Priorización de términos:
   - kinesiología a domicilio,
   - kinesiólogo a domicilio,
   - fisioterapia a domicilio,
   - kinesiología Neuquén,
   - rehabilitación a domicilio.

### Criterio de oportunidad SEO
- Queries con muchas impresiones y CTR bajo: oportunidad de snippet/copy.
- Queries con posición media intermedia (ej. página 1 baja / página 2 alta): oportunidad de reforzar intención local en contenido existente.
- Queries transaccionales locales con buen CTR pero bajo volumen: oportunidad de ampliar cobertura semántica sin crear páginas nuevas.

## 2.3 Baseline GA4 público (lectura funcional)
Con los datos disponibles de GA4, el baseline debe leerse con dos planos:

1. **Plano técnico (evento):** volumen y tasa de `generate_lead`, `phone_click`, `scroll_50`, `scroll_90` por ruta pública.
2. **Plano negocio (lead real):** contraste con registro manual para evitar confundir evento técnico con consulta útil.

Regla operativa: `generate_lead` indica intención/acción de contacto, pero **no equivale automáticamente** a lead calificado.

---

## 3) Definición operativa de lead calificado

Para esta etapa del negocio, un **lead calificado** es una consulta que cumple mínimamente:
1. Zona geográfica atendible (distancia viable).
2. Motivo compatible con servicio ofrecido.
3. Aceptación de modalidad de atención particular.
4. Interés vigente tras referencia de rango de inversión (sin publicar precio exacto en landing).

Esta definición permite separar:
- **más WhatsApps** (cantidad bruta), de
- **más consultas calificadas** (calidad útil para agenda real).

---

## 4) Oportunidades SEO por consulta (con foco local y comercial)

## Clúster A — intención transaccional local (prioridad máxima)
- “kinesiología a domicilio”
- “kinesiólogo a domicilio”
- “fisioterapia a domicilio”
- “kinesiología Neuquén”

**Acción recomendada**
- Reforzar servicio + localidad en bloques iniciales de `/` y `/services`.
- Alinear títulos, descripciones y H1/H2 con intención de contratación local.

## Clúster B — intención de solución / rehabilitación (prioridad alta)
- “rehabilitación a domicilio” y variantes relacionadas.

**Acción recomendada**
- Ajustar microcopy en `/services` con lenguaje más cercano a la consulta real (situación funcional y objetivo de recuperación).
- Mejorar enlaces internos desde home y `/evaluar` hacia secciones de servicio pertinentes.

## Clúster C — intención de evaluación previa (prioridad media)
- búsquedas tipo evaluación inicial y orientación sobre atención domiciliaria.

**Acción recomendada**
- Reforzar `/evaluar` como paso de pre-calificación suave antes del WhatsApp.

---

## 5) Objetivos a 30/60 días (SEO + negocio)

## Objetivos a 30 días
1. **Medición pública confiable**
   - Reporte base separado de rutas públicas (`/`, `/services`, `/evaluar`) sin mezclar `/admin`.
   - `generate_lead` y `phone_click` validados como Key Events para análisis operativo.
   - Parámetros/dimensiones necesarios activos para lectura por ruta y CTA.

2. **Crecimiento orgánico calificado**
   - Mejorar clicks orgánicos de clúster A/B en páginas públicas versus baseline inmediato anterior.

3. **Calidad de consulta**
   - Implementar registro manual simple que permita clasificar cada consulta: calificada / no calificada y motivo de descarte.

## Objetivos a 60 días
1. **Volumen útil**
   - Aumentar consultas WhatsApp reales manteniendo foco en calidad (no solo volumen bruto).

2. **Calificación**
   - Aumentar proporción de consultas calificadas sobre total de consultas WhatsApp.

3. **Conversión de negocio**
   - Sostener o mejorar la conversión consulta → paciente sobre baseline (~33%) evitando degradación por tráfico no calificado.

4. **Reducción de inviables**
   - Reducir proporción de descartes por distancia, obra social y desalineación de costo esperado mediante mejor mensaje pre-WhatsApp.

---

## 6) Plan de patches priorizados

## P0 — Medición pública confiable + exclusión analítica de /admin
1. Normalizar tablero/reporte de captación solo con `/`, `/services`, `/evaluar`.
2. Verificar en GA4 Admin Key Events y dimensiones para lectura accionable.
3. Documentar regla de análisis: nunca usar agregados mezclando superficies privadas para decisiones de marketing.

## P1 — WhatsApp prellenado para pre-calificar (implementado en LANDING-GROWTH-002)
1. Ajustar CTA a WhatsApp con mensaje inicial estructurado (zona, motivo, modalidad).
2. Estandarizar texto para recolectar datos mínimos de calificación sin fricción.
3. Mantener enfoque en claridad de expectativa (particular / cobertura geográfica) sin publicar precio exacto.

## P2 — Copy SEO local en `/`, `/services`, `/evaluar` (implementado en LANDING-GROWTH-003)
1. Refuerzo semántico de intención local (Neuquén + domicilio + servicio).
2. Mejora de snippets (title/description) y encabezados clave.
3. Ajuste de enlaces internos entre rutas públicas según intención.

## P3 — Registro manual simple de leads
1. Planilla liviana (fecha, origen, zona, motivo, estado, motivo de descarte, paciente iniciado).
2. Revisión semanal de calidad y aprendizajes de objeciones.
3. Cierre mensual con métricas de negocio y decisiones de copy/segmentación.

---

## 7) Checklist post-medición (30 días)

## Medición y datos
- [ ] Exportes actualizados de Search Console (28/90 días) por query y página pública.
- [ ] Reporte GA4 de eventos en `/`, `/services`, `/evaluar` con separación explícita de `/admin`.
- [ ] Validación de `generate_lead`, `phone_click`, `scroll_50`, `scroll_90` en análisis por ruta.

## Negocio
- [ ] Conteo real de consultas WhatsApp del período.
- [ ] % de consultas calificadas sobre total.
- [ ] Pacientes iniciados del período.
- [ ] Conversión consulta → paciente del período.
- [ ] % de descartes por distancia.
- [ ] % de descartes por obra social.
- [ ] % de descartes por costo/expectativa.

## Decisión operativa
- [x] Implementado PATCH LANDING-GROWTH-002: mensaje prellenado de WhatsApp para pre-calificación suave (zona, motivo, edad aproximada, disponibilidad/modalidad particular y valor).
- [x] Implementado PATCH LANDING-GROWTH-002B: consistencia de CTAs globales de WhatsApp en Header/Footer con el mensaje de pre-calificación suave (zona, motivo, edad aproximada y consulta por disponibilidad/modalidad particular/valor).
- [ ] Monitorear 30 días el impacto en consultas calificadas antes de ajustar fricción o copy adicional.
- [x] Implementado PATCH LANDING-GROWTH-003: ajuste SEO local en metadata/copy de rutas públicas existentes y FAQ breve de pre-calificación suave.
- [ ] Medir a 30 días por ruta pública: impresiones, clicks, CTR, `generate_lead` y proporción de consultas calificadas (sin mezclar `/admin`).
- [x] LANDING-GROWTH-004 definido: registro manual simple de leads + protocolo controlado de medición a 30 días post deploy de LANDING-GROWTH-003.
- [ ] No ejecutar nuevos cambios de copy/metadata hasta cerrar la ventana de medición (salvo incidencia crítica).
- [ ] Confirmar que no se incluyan cambios en `/admin` ni app clínica privada dentro del ciclo de marketing.
