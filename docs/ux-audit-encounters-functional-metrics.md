# Auditoría UX/Copy — Métricas funcionales en `/encounters`

Fecha: 2026-05-08
Alcance: `/admin/patients/[id]/encounters` (sin cambios de dominio/FHIR/captura/scoping).

## Hallazgos actuales (baseline)

- En cada card con métricas funcionales se renderizan:
  - título `Métricas funcionales`;
  - helper `Valores registrados en esta visita. No representan tendencia.`
- El helper está dentro de cada card, por lo que se repite tantas veces como visitas con métricas existan.
- No existe aún bloque de tendencia funcional.

## Diagnóstico UX/copy

1. **Sí hay riesgo de ruido visual por repetición**: el helper actual es correcto en intención, pero redundante cuando hay múltiples cards consecutivas con métricas.
2. **El título solo (`Métricas funcionales`) no garantiza comprensión temporal**: comunica tema, pero no “nivel de agregación” (visita puntual vs evolución).
3. **La ambigüedad se resuelve mejor con separación estructural**:
   - cards de visita = dato puntual;
   - bloque de tendencia (futuro) = evolución por episodio.
4. **Mejor patrón**: reducir texto repetitivo en cards y poner la aclaración fuerte en un único lugar estable (encabezado de sección/listado o bloque de tendencia futuro).

---

## Respuestas A — Métricas funcionales en cards

1. **¿Mantener helper largo en cada card?** No recomendado.
2. **¿Se vuelve repetitivo?** Sí, especialmente en pacientes con alta frecuencia de visitas.
3. **¿Alcanza “Métricas funcionales”?** No del todo.
4. **¿Eliminar helper por card?** Sí, como opción preferida.
5. **¿Reemplazar por helper más corto?** Solo si producto requiere refuerzo local; sugerido: `De esta visita`.
6. **¿Mostrarlo una vez por página?** Sí, recomendado (una sola aclaración al inicio del listado o junto al subtítulo de sección).
7. **¿Lista, tabla o chips?**
   - Card: **lista simple de pares etiqueta/valor** (mejor legibilidad y robustez con datos parciales).
   - Evitar tabla (sobrepeso visual) y chips (dificultan escaneo de unidad/valor clínico).
8. **¿Orden canónico actual?** Sí, mantener:
   1) TUG
   2) Dolor
   3) Bipedestación
   4) Marcha

---

## Respuestas B — Valor puntual vs tendencia

1. **¿Dónde explicar que es puntual?** En una única nota de sección arriba del listado de visitas.
2. **¿Hace falta explicitarlo?** Sí, una vez (no por card).
3. **¿Bloque futuro de tendencia con helper?** Sí, breve y explícito sobre ventana/escopo de episodio.
4. **Copy anti-confusión con poco ruido**:
   - Sección visitas: `Las métricas en cada visita corresponden solo a ese registro.`
   - Tendencia: `Evolución calculada solo con visitas del episodio efectivo.`
5. **Texto preferido**:
   - En card: `Métricas funcionales` (título)
   - Aclaración puntual corta opcional en card: `De esta visita`
   - Evitar frase larga repetida actual.

---

## Respuestas C — Futura tendencia funcional

1. **Ubicación recomendada**: bloque propio **arriba del listado de visitas** y **debajo del contexto clínico read-only / estadísticas mínimas**.
2. **¿Integrada o separada?** Separada (card propia) para semántica clara y evolución futura sin contaminar estadísticas mínimas actuales.
3. **Por métrica mostrar**:
   - último valor;
   - fecha del último valor;
   - valor previo (si existe);
   - delta numérico simple (sin juicio clínico).
4. **No mostrar**:
   - interpretación automática (mejoró/empeoró);
   - recomendaciones;
   - gráficos complejos.
5. **Desktop**: grilla 2x2 o 4 columnas (una tarjeta por métrica).
6. **Mobile**: stack vertical (una métrica por fila/tarjeta).
7. **¿Ocultar con <2 mediciones?** No ocultar el bloque completo; mostrar estado vacío útil.
8. **Con 1 medición**: mostrar último valor + fecha, `Sin comparación previa`.
9. **Datos parciales**: mostrar solo métricas con datos; en faltantes mostrar `Sin datos` si ya existe cabecera de métrica.
10. **Scoping episodio efectivo**:
   - helper visible en bloque de tendencia;
   - etiqueta explícita de escopo (`Episodio efectivo`);
   - no mezclar visitas fuera de episodio.

---

## Respuestas D — Copy recomendado

1. **Título en card de visita**: `Métricas funcionales`
2. **Helper en card (si se conserva)**: `De esta visita`
3. **Título bloque tendencia**: `Tendencia funcional (episodio efectivo)`
4. **Helper tendencia**: `Compara las dos mediciones más recientes por métrica dentro del episodio efectivo.`
5. **Empty state tendencia**: `Aún no hay suficientes mediciones para mostrar tendencia (mínimo 2 por métrica).`

---

## Respuestas E — Patch mínimo recomendado

**Recomendación**: **(1) Solo quitar/reducir helper repetitivo de cards**, con preferencia por quitarlo del card y mover aclaración única a nivel sección/listado en patch posterior inmediato.

Orden sugerido de entrega incremental:

1. Patch 1 (mínimo): eliminar helper largo repetitivo por card.
2. Patch 2 (copy): agregar una única nota de sección arriba del listado de visitas.
3. Patch 3 (diseño, sin lógica): especificación visual del bloque de tendencia (sin implementar).

No recomendado: esperar a implementar tendencia para recién mejorar el ruido actual.

---

## Wireframe textual

### 1) Card de visita (sin helper largo)

```text
[Card visita — 12 May 2026]
  ...datos clínicos de la visita...

  Métricas funcionales
  - TUG: 18 s
  - Dolor: 6/10
  - Bipedestación: 4 min
  - Marcha: 7 min
```

### 2) Card de visita (si se decide mantener helper mínimo)

```text
[Card visita — 12 May 2026]
  ...datos clínicos de la visita...

  Métricas funcionales
  De esta visita
  - TUG: 18 s
  - Dolor: 6/10
  - Bipedestación: 4 min
  - Marcha: 7 min
```

### 3) Bloque futuro de tendencia funcional

```text
[Tendencia funcional (episodio efectivo)]
Compara las dos mediciones más recientes por métrica dentro del episodio efectivo.

TUG           Último: 18 s (12 May 2026)   Previo: 20 s (05 May 2026)   Δ -2 s
Dolor         Último: 6/10 (12 May 2026)   Previo: 7/10 (05 May 2026)   Δ -1
Bipedestación Último: 4 min (12 May 2026)  Previo: —                    Sin comparación previa
Marcha        Sin datos
```

---

## Tests de render recomendados (cuando se implemente patch UI)

1. Renderiza `Métricas funcionales` en card con observaciones.
2. No renderiza helper largo repetitivo por card.
3. Renderiza nota única de sección (si se adopta patch 2).
4. Respeta orden canónico TUG/Dolor/Bipedestación/Marcha.
5. Con datos parciales en card, muestra solo filas con dato.
6. Tendencia (futuro):
   - con 0 datos: empty state;
   - con 1 dato: último + fecha + `Sin comparación previa`;
   - con >=2 datos: último, previo y delta.
7. Tendencia filtra estrictamente por episodio efectivo.
8. Mobile snapshot: stack vertical; desktop snapshot: layout multicolumna.

---

## No-alcances preservados

- Sin cambios en domain.
- Sin cambios en FHIR.
- Sin cambios en schemas/actions/mappers/repositorios.
- Sin cambios en captura de métricas.
- Sin cambios en scoping.
- Sin implementación de tendencia en esta auditoría.
- Sin dashboard.
- Sin IA.
- Sin Procedure.
- Sin Goal.


---

## Cierre de implementación (patch UX/copy mínimo)

- Estado: **aplicado** en UI de `EncountersList`.
- Cambio: se eliminó de cada card el helper repetitivo `Valores registrados en esta visita. No representan tendencia.`
- Se mantiene:
  - título `Métricas funcionales`;
  - render condicional del bloque solo cuando hay métricas;
  - orden canónico TUG → Dolor → Bipedestación → Marcha;
  - render de solo métricas presentes (sin bloque vacío).
- La aclaración de tendencia queda **reservada para el futuro bloque de tendencia funcional por episodio efectivo** (no implementado en este patch).

## Cierre de implementación de tendencia funcional simple (2026-05-09)

- Estado: **implementado** bloque `Tendencia funcional` en `/encounters` antes del listado de visitas.
- Fuente: derivado de `Observation` funcionales asociadas a `Encounter` del episodio efectivo (sin persistir derivados).
- Presentación: por métrica se muestra `Último` (+fecha), y `Previo`/`Cambio` cuando existe comparación.
- Sin interpretación automática (sin “mejoró/empeoró”), sin gráficos, sin dashboard.
- Se conserva la separación: card de visita = dato puntual; bloque de tendencia = comparación simple del tratamiento actual.
