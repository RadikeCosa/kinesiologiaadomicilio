# Auditoría UX: integración de `treatment` dentro de `encounters` (sin implementación)

Fecha: 2026-05-09

## 1) Diagnóstico actual

- `encounters` ya consume y muestra contexto longitudinal del episodio (`medicalReferenceDiagnosisText`, `kinesiologicImpressionText`, `initialFunctionalStatus`, `therapeuticGoals`, `frameworkPlan`) en un bloque read-only con `details` expandible.
- La ubicación actual del bloque es **antes de Tendencia funcional**.
- El bloque solo aparece si existe contenido (`clinicalContext.hasAnyContent`).
- `encounters` ya diferencia estado del ciclo: activo, finalizado y sin tratamiento activo.
- `encounters` ya incluye CTA hacia `treatment` (“Gestionar tratamiento”, “Editar en tratamiento”, “Ir a gestión de tratamiento”).

Lectura: el diseño base respeta la separación conceptual, pero todavía falta jerarquía explícita entre “resumen operativo” vs “detalle longitudinal”, y reglas uniformes para contexto incompleto/finalizado.

## 2) Regla de superficies (A)

### /treatment (exclusivo)
Debe seguir siendo **el único lugar editable** para:
- diagnóstico médico de referencia (edición);
- impresión kinésica (edición);
- estado funcional inicial (edición);
- objetivos terapéuticos (edición completa);
- plan terapéutico general (edición completa);
- cierre del tratamiento (motivo + detalle + operación de cierre).

### /encounters (read-only, orientado a ejecución)
Debe mostrar solo lo necesario para interpretar visitas y tendencia:
- estado del ciclo (activo/finalizado/sin activo);
- objetivo terapéutico principal (resumen);
- diagnóstico de referencia (resumen);
- estado funcional inicial (resumen breve);
- fechas de ciclo (inicio / cierre si aplica);
- señal de completitud clínica (suave, no bloqueante);
- acceso directo a editar en `treatment`.

## 3) Matriz de visibilidad por dato (B)

- Diagnóstico médico de referencia: **mostrar solo si existe** (resumen visible + detalle).
- Impresión kinésica: **mostrar solo en details** (si existe).
- Estado funcional inicial: **mostrar solo si existe** (resumen corto visible; versión completa en details).
- Objetivo terapéutico principal: **mostrar siempre el contenedor**; contenido **si existe**.
- Plan terapéutico general: **mostrar solo en details** (si existe).
- Motivo/detalle de cierre: **mostrar solo si tratamiento finalizado** (resumen visible + detalle expandible).
- Fecha inicio/cierre: **mostrar siempre** (según estado del ciclo).
- Completitud del contexto clínico: **mostrar siempre como badge/estado suave**.

## 4) Ubicación y jerarquía recomendada (C + D)

Recomendación única: **Opción 1**
1. Header + CTA Registrar visita.
2. Estado/contexto compacto del ciclo.
3. Tendencia funcional.
4. Estadísticas de visitas.
5. Listado de visitas.

Racional:
- El profesional necesita marco mínimo antes de interpretar tendencia.
- Pero la tendencia conserva protagonismo operacional al quedar inmediatamente después.
- Evita “muro de texto” arriba: tarjeta compacta + detalle colapsable.

Patrón de componente sugerido:
- Card compacta persistente.
- Primera línea: estado de ciclo + fechas + completitud.
- Segunda línea: objetivo principal (1-2 líneas máx).
- Link “Ver detalle clínico” (expandible) + CTA “Editar en Tratamiento”.

## 5) Estado activo (E)

Qué priorizar en visible:
- objetivo terapéutico principal;
- diagnóstico de referencia (abreviado);
- estado funcional inicial (abreviado);
- inicio del ciclo.

Qué dejar colapsado:
- impresión kinésica completa;
- plan terapéutico general completo;
- textos largos de objetivos secundarios.

Copy sugerido (ligero):
- Título: **“Contexto clínico del ciclo”**.
- Helper: “Resumen longitudinal para interpretar visitas y tendencia. Edición en Tratamiento.”
- Empty parcial: “Falta completar parte del contexto clínico del ciclo.”

## 6) Estado finalizado (F)

- Sí, mostrar: “Visitas en modo historial”.
- Sí, mostrar motivo de cierre (label) y detalle (si existe).
- Mostrar resumen breve del ciclo finalizado (fechas + cierre + objetivo principal si existe), no el formulario ni resumen extenso.
- Mantener CTA a `treatment` para consultar/editar registro longitudinal (si la política lo permite).

## 7) Contexto incompleto (G)

- Sí, aviso suave no bloqueante cuando falten campos troncales.
- Sí, CTA “Completar contexto en Tratamiento”.
- Evitar ruido: solo mostrar aviso si hay tratamiento activo o si hay encounters en ciclo activo.
- Mínimos para justificar bloque visible:
  - estado de ciclo + fecha inicio;
  - al menos uno entre objetivo/diagnóstico/estado inicial.
  - si no hay ninguno, mostrar versión ultracompacta con CTA a completar.

## 8) UX/copy recomendado (H)

- Título recomendado: **Contexto clínico del ciclo**.
- Labels:
  - “Objetivo terapéutico principal” (qué se busca lograr).
  - “Plan terapéutico general” (cómo se planea intervenir).
- Para evitar textos largos:
  - clamp 2 líneas en resumen;
  - “Ver más” abre `details`;
  - detalle completo solo dentro del colapsable o en `treatment`.

## 9) Relación con tendencia funcional (I)

- Mostrar contexto **antes** de tendencia, en formato compacto.
- Mantener protagonismo operativo de tendencia con posición inmediata posterior.
- Relación visual sugerida: chip “Objetivo principal” encima del gráfico (sin interpretación automática).
- Evitar textos como “la tendencia confirma el objetivo”; usar lenguaje neutral: “Referencia clínica para lectura de evolución”.

## 10) FHIR/modelado (J)

Sin cambios ahora.

- Mantener lectura desde EpisodeOfCare/Condition y read model actual.
- Evitar duplicar contexto longitudinal en `Encounter`.
- No migrar a nuevos recursos (Goal/CarePlan/Procedure) en esta fase.
- Alcance suficiente: ajustar read-model/UI de `encounters` usando datos existentes.

## 11) Wireframes textuales (entregable)

### a) Tratamiento activo (contexto completo)
- Header paciente + badges + CTA Registrar visita.
- Card “Contexto clínico del ciclo”
  - Estado: Activo · Inicio: DD/MM/AAAA · Completitud: Completo
  - Objetivo terapéutico principal (2 líneas)
  - Diagnóstico ref. (1 línea)
  - Estado funcional inicial (1 línea)
  - [Ver detalle clínico ▼] [Editar en Tratamiento]
- Tendencia funcional
- Estadísticas
- Listado de visitas

### b) Tratamiento activo (contexto incompleto)
- Header + CTA.
- Card contexto
  - Estado: Activo · Inicio...
  - Aviso suave: “Falta completar diagnóstico/objetivo/plan.”
  - [Completar contexto en Tratamiento]
  - (Opcional) detalle de lo ya cargado
- Tendencia funcional
- Estadísticas
- Listado

### c) Tratamiento finalizado
- Header (sin CTA registrar visita)
- Banner: “Visitas en modo historial”
- Card contexto
  - Estado: Finalizado · Inicio... · Cierre...
  - Motivo de cierre (+ detalle si existe)
  - Objetivo principal alcanzado/no documentado (si existe)
  - [Ver ciclo en Tratamiento]
- Tendencia funcional (histórica)
- Estadísticas
- Listado

### d) Nuevo ciclo activo tras ciclo cerrado
- Header + CTA registrar visita
- Card contexto del **ciclo activo actual**
  - Estado activo + inicio actual
  - Resumen clínico del ciclo activo
  - Link secundario: “Ver ciclos cerrados en Tratamiento”
- Tendencia/estadísticas/listado **scopeados al ciclo activo**

## 12) Patch mínimo sugerido P0 (sin tocar domain/FHIR)

1. Consolidar bloque actual en una card compacta persistente + details.
2. Reordenar campos visibles: objetivo principal > diagnóstico > estado inicial.
3. Agregar estado de completitud suave (completo/parcial/sin contexto).
4. Ajustar variante finalizado con motivo/detalle de cierre en resumen.
5. Unificar copy y CTA a `treatment`.

## 13) Roadmap

### P1
- Mejorar truncado/expansión de textos largos.
- Highlight visual mínimo de “objetivo principal” cerca de tendencia.
- Mensajería contextual por estado (activo/finalizado/parcial).

### P2
- Configurar reglas de visibilidad por rol/perfil profesional.
- Telemetría UX (uso de expandir detalle y clics a treatment).
- Refinamiento de densidad de información según volumen de visitas.

## 14) Tests recomendados (K)

1. Activo + contexto completo: card visible, resumen + details, CTA editar.
2. Activo + contexto parcial: aviso suave + datos existentes + CTA completar.
3. Activo sin contexto: card ultracompacta + CTA completar, sin ruido excesivo.
4. Finalizado: modo historial + cierre visible (motivo/detalle si existe).
5. Nuevo episodio activo tras cerrado: datos scopeados al episodio activo.
6. CTA a `/treatment` presente en variantes esperadas.
7. Verificar ausencia de formulario editable en `/encounters`.
8. Verificar que no se duplica resumen completo de cierre (solo compacto + link).

## 15) No-alcances preservados

- Sin implementación de código en esta auditoría.
- Sin cambios FHIR/domain/schema/action/mapper/repository/scoping/persistencia.
- Sin mover edición a `encounters`.
- Sin duplicar formulario de `treatment`.
- Sin IA, sin nuevos recursos clínicos, sin dashboard.
