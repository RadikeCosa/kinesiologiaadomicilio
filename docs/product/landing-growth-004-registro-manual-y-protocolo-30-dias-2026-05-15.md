# LANDING-GROWTH-004 — Registro manual simple de leads y protocolo de medición (30 días)

**Fecha:** 2026-05-15  
**Base previa implementada:**
- AUDIT LANDING-GROWTH-001 (cuantificado).
- LANDING-GROWTH-002 (WhatsApp prellenado para pre-calificación suave).
- LANDING-GROWTH-003 (SEO local/copy en rutas públicas existentes).

## 1) Objetivo de esta etapa

El objetivo operativo **no** es aumentar WhatsApps brutos, sino:
1. aumentar consultas calificadas;
2. sostener o mejorar conversión consulta → paciente;
3. reducir descartes evitables (distancia, obra social, costo/expectativa);
4. decidir el próximo patch con evidencia de 30 días, sin nuevos cambios de copy sin datos.

---

## 2) Alcance y no-alcances

## Alcance
- Definir un registro manual simple y consistente de consultas reales por WhatsApp.
- Definir protocolo de medición controlada de 30 días post LANDING-GROWTH-003.
- Definir cómo cruzar resultados con Search Console y GA4 en rutas públicas.

## No-alcances
- No tocar `/admin`.
- No tocar app clínica privada.
- No rediseñar landing.
- No crear páginas nuevas.
- No cambiar nuevamente copy/metadata en esta etapa, salvo documentación operativa.

---

## 3) Ventana de medición de 30 días

## Inicio y cierre
- **Día 0 (inicio):** fecha/hora de deploy en producción de LANDING-GROWTH-003.
- **Día 30 (cierre):** mismo horario calendario +30 días.

## Regla de consistencia
- Durante la ventana 30 días, evitar cambios de copy/metadata que alteren comparabilidad.
- Si hay cambios inevitables, registrar fecha exacta y naturaleza del cambio como incidente metodológico.

---

## 4) Plantilla de registro manual (campos mínimos obligatorios)

Cada consulta real de WhatsApp debe registrarse en una fila única.

Campos mínimos:
1. **fecha** (AAAA-MM-DD)
2. **zona_barrio**
3. **motivo_consulta**
4. **servicio_probable** (ej. postoperatorio, adultos mayores, cuidados paliativos, recuperación funcional, otro)
5. **origen_estimado** (home / services / evaluar / referido / no_claro)
6. **consulta_calificada** (si/no)
7. **motivo_descarte** (distancia / obra_social / costo / otro / no_aplica)
8. **paciente_iniciado** (si/no)
9. **observaciones** (texto corto)

Reglas de carga:
- `consulta_calificada=no` requiere `motivo_descarte != no_aplica`.
- `consulta_calificada=si` permite `motivo_descarte=no_aplica`.
- `paciente_iniciado=si` debe tener seguimiento clínico iniciado por circuito operativo.
- Completar registro idealmente dentro de 24 h de la consulta.

---

## 5) Métricas de cierre (al día 30)

Calcular al cierre de ventana:

1. **consultas_whatsapp_reales** = total de filas.
2. **consultas_calificadas** = filas con `consulta_calificada=si`.
3. **pacientes_iniciados** = filas con `paciente_iniciado=si`.
4. **conversion_consulta_paciente** = pacientes_iniciados / consultas_whatsapp_reales.
5. **conversion_calificada_paciente** = pacientes_iniciados / consultas_calificadas.
6. **descartes_distancia** = filas con `motivo_descarte=distancia`.
7. **descartes_obra_social** = filas con `motivo_descarte=obra_social`.
8. **descartes_costo** = filas con `motivo_descarte=costo`.

Indicadores derivados sugeridos:
- **tasa_calificacion** = consultas_calificadas / consultas_whatsapp_reales.
- **mix_descartes_%** por motivo sobre total descartes.

---

## 6) Cruce con Search Console y GA4 (solo marketing público)

## Search Console (GSC)
Para el mismo período de 30 días:
- impresiones,
- clicks,
- CTR,
- posición media,
por query y por página, con foco en queries locales:
- kinesiología a domicilio,
- kinesiólogo a domicilio,
- fisioterapia a domicilio,
- kinesiología Neuquén,
- rehabilitación a domicilio.

## GA4
Para el mismo período:
- `generate_lead` por `page_path` en:
  - `/`
  - `/services`
  - `/evaluar`

Si están disponibles, desglosar por:
- `cta_location`
- `cta_label`
- `destination`

## Regla de exclusión
- Excluir `/admin` y cualquier superficie privada de conclusiones de marketing.
- No usar agregados “sitio completo” para inferir impacto de captación pública.

---

## 7) Protocolo operativo semanal (semanas 1 a 4)

1. Exportar snapshot semanal de registro manual (control de completitud de campos).
2. Revisar consistencia de `consulta_calificada` y `motivo_descarte`.
3. Extraer GSC semanal por query/página pública.
4. Extraer GA4 semanal de `generate_lead` por rutas públicas.
5. Registrar hallazgos sin cambiar copy en caliente (salvo incidencia crítica).

---

## 8) Criterio de decisión al día 30

Solo proponer siguiente patch si hay evidencia clara de al menos uno de estos casos:
1. sube volumen pero cae tasa de calificación;
2. sube `generate_lead` pero no suben consultas reales;
3. concentración alta y sostenida de descartes por un motivo específico;
4. query cluster con impresiones altas y CTR bajo en una ruta puntual.

Si no hay señal robusta:
- extender medición 2-4 semanas adicionales antes de tocar copy/flujo.

---

## 9) Plantilla CSV sugerida

Archivo sugerido: `docs/product/templates/landing-growth-004-leads-template.csv`

Encabezados:
`fecha,zona_barrio,motivo_consulta,servicio_probable,origen_estimado,consulta_calificada,motivo_descarte,paciente_iniciado,observaciones`

Valores esperados:
- `consulta_calificada`: `si|no`
- `motivo_descarte`: `distancia|obra_social|costo|otro|no_aplica`
- `paciente_iniciado`: `si|no`

---

## 10) Resultado esperado de LANDING-GROWTH-004

Al final del ciclo, el equipo debe poder responder con datos:
1. si creció la demanda calificada (no solo contactos);
2. si se sostuvo o mejoró la conversión consulta → paciente;
3. qué descarte pesa más y dónde ajustar próximo patch;
4. qué ruta pública y qué intención de búsqueda aportan mejor calidad de lead.
