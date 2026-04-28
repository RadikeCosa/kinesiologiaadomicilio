> Estado: archivado  
> Motivo: Documento histórico de auditoría/cierre/plan ya superado por la fuente operativa vigente o por implementación cerrada.  
> Fecha de archivo: 2026-04-28  
> Reemplazado/relacionado con: docs/fuente-de-verdad-operativa.md

# Auditoría técnica/producto — estadísticas clínicas mínimas en `/admin/patients/[id]/encounters`

Fecha: 2026-04-27.

## A) Executive summary

- **Sí conviene** introducir dos métricas separadas para capturar mejor la realidad clínica:
  1) demora inicial hasta primera visita del episodio;
  2) frecuencia promedio entre visitas consecutivas del mismo episodio.
- La separación propuesta corrige el sesgo de mezclar “tiempo muerto inicial” con “ritmo asistencial” posterior.
- En UI, **reemplazar la tarjeta protagonista “Excluidas del cálculo de duración” por “Frecuencia promedio”** y mantener transparencia de exclusiones como helper discreto debajo de duración/tiempo total.
- Recomiendo además **incorporar “Primera visita” como tarjeta principal** (no helper), porque aporta contexto clínico y explica por qué la frecuencia puede no estar disponible cuando hay una sola visita.
- No requiere cambios en repositorios/mappers FHIR ni nuevas llamadas; el cálculo debe vivir en dominio (`encounter-stats.ts`) y componerse desde `/encounters/data.ts`.
- Complejidad esperada: O(n log n) por ordenamiento de visitas válidas del episodio. Es aceptable para el volumen actual; más adelante puede optimizarse si hubiera pacientes con volumen muy alto.

## B) Fórmula recomendada

### 1) Métrica de demora inicial

**Nombre recomendado (interno):** `daysToFirstVisitFromEpisodeStart`

- Alternativa aceptable: `daysFromTreatmentStartToFirstVisit`.
- Ventaja del naming recomendado: explicita “episode” (fuente temporal efectiva) y evita ambigüedad entre tratamiento administrativo vs episodio operativo.

**Definición funcional**

1. Resolver episodio efectivo:
   - activo si existe;
   - si no, más reciente;
   - si no hay episodio, no calculable.
2. Tomar `episode.startDate` parseable como fecha base.
3. Filtrar visitas válidas del episodio efectivo (`encounter.episodeOfCareId === effectiveEpisode.id`) con `startedAt` parseable.
4. Ordenar ascendente por `startedAt` y tomar la primera.
5. Calcular diferencia exacta en milisegundos y convertir a días: `deltaDays = (firstVisitMs - episodeStartMs) / 86400000`.
6. Regla de presentación:
   - si `deltaDays < 0`: mostrar helper de anomalía y **clamp a 0 para cálculo**, pero copy clínico recomendado: “Antes del inicio registrado”;
   - si `0 <= deltaDays < 1`: mostrar “El mismo día” (evita “0 días”);
   - si `deltaDays >= 1`: mostrar entero con `Math.ceil(deltaDays)` para preservar expectativa de “a los N días” sin subestimar.

### 2) Métrica de frecuencia

**Nombre recomendado (interno):** `averageDaysBetweenEpisodeVisits`

- Alternativa aceptable: `averageDaysBetweenVisits`.
- Ventaja del naming recomendado: acota explícitamente al episodio efectivo.

**Definición funcional**

1. Usar mismas visitas válidas del episodio efectivo (con `startedAt` parseable).
2. Orden ascendente por `startedAt`.
3. Si hay menos de 2 visitas válidas: no calculable.
4. Calcular intervalos consecutivos: `interval_i = (visit[i].ms - visit[i-1].ms) / 86400000`.
5. Para calidad de dato, descartar intervalos negativos (si aparecieran por datos corruptos/duplicados de timezone) y registrar conteo para diagnóstico interno.
6. Promediar intervalos restantes: `avg = sum(intervals) / intervals.length`.
7. Regla de presentación:
   - `avg < 1`: “Menos de 1 día”;
   - `1 <= avg < 1.5`: “Una visita cada 1 día”;
   - `avg >= 1.5`: `Math.round(avg)` con singular/plural (“cada N días”).

> Nota: para métrica clínica de cadencia, `Math.round` en el promedio final es más estable que `Math.ceil` (que sobredimensiona frecuencias largas).

## C) Casos borde y fallback

1. **Sin tratamiento (sin episodio activo ni más reciente):**
   - primera visita: no calculable (`—`);
   - frecuencia promedio: no calculable (`—`).
2. **Tratamiento con 0 visitas válidas del episodio:**
   - primera visita: “Sin visitas en este tratamiento”; valor `—`.
   - frecuencia: “Aún no calculable”; valor `—`.
3. **1 visita válida:**
   - primera visita: calculable (si hay `startDate` válido);
   - frecuencia: no calculable (faltan intervalos).
4. **2 visitas válidas:**
   - frecuencia igual al único intervalo.
5. **Varias visitas:**
   - promedio de intervalos consecutivos.
6. **`startedAt` inválido/no parseable:**
   - excluir visita de ambas métricas de ritmo.
7. **Visitas sin `episodeOfCareId`:**
   - excluir de métricas del episodio.
8. **Visitas fuera del episodio efectivo:**
   - excluir de métricas de ritmo/frecuencia del tratamiento.
9. **Primera visita antes de `startDate`:**
   - no romper cálculo;
   - mostrar estado anómalo (“Antes del inicio registrado”) y sugerir revisión administrativa.
10. **Encuentros duplicados o mismo día:**
   - intervalos 0 se admiten;
   - para copy final, si promedio <1 => “Menos de 1 día”.
11. **Tratamiento finalizado:**
   - aplicar misma regla de episodio efectivo (si no activo, usar más reciente).
12. **Episodio sin `startDate`:**
   - primera visita no calculable;
   - frecuencia sí puede calcularse con visitas válidas del episodio.

## D) Layout UI recomendado

### Tarjetas principales (propuesta)

1. Visitas registradas
2. En este tratamiento
3. Última visita
4. Primera visita
5. Frecuencia promedio
6. Duración promedio
7. Tiempo total registrado

### Elementos que bajan a helper

- “Excluidas del cálculo de duración” **sale de tarjetas**.
- Advertencias de parcialidad de duración quedan como helper de bajo peso visual debajo de Duración/Tiempo total.

### Orden recomendado

- Bloque 1 (contexto de volumen/estado): Visitas registradas, En este tratamiento, Última visita.
- Bloque 2 (ritmo clínico): Primera visita, Frecuencia promedio.
- Bloque 3 (tiempo operativo): Duración promedio, Tiempo total registrado.
- Helpers al pie: transparencia de cobertura/exclusiones.

## E) Copy recomendado (español)

### Tarjetas nuevas

- **Primera visita**
  - “El mismo día del inicio”
  - “A los 4 días del inicio”
  - “Antes del inicio registrado” (anomalía)
  - “Sin datos suficientes”

- **Frecuencia promedio**
  - “Menos de 1 día”
  - “Una visita cada 1 día”
  - “Una visita cada N días”
  - “Aún no calculable”

### Helper de exclusiones (solo si aplica)

- Si `durationExcludedCount > 0`:
  - `* Duración calculada sobre X de Y visitas. Se excluyen visitas sin cierre, legacy o con fechas no válidas.`

**¿Mostrar excluidas explícitas?**
- Recomendación: con `X de Y` alcanza para pantalla principal.
- Opcional para debugging interno: conservar `durationExcludedCount` sólo en test/debug, no como tarjeta.

## F) Ubicación del cálculo (arquitectura)

- Extender `calculateEncounterStats` en `src/domain/encounter/encounter-stats.ts` con campos nuevos de salida.
- Crear helpers puros internos en el mismo archivo para:
  - filtrar visitas válidas del episodio efectivo;
  - ordenar cronológicamente ascendente;
  - calcular días al primer contacto;
  - calcular promedio de intervalos.
- Mantener composición en `src/app/admin/patients/[id]/encounters/data.ts` para resolver episodio efectivo y pasar su contexto al cálculo de dominio.
- **No calcular en React** (`EncounterStatsSummary` sólo formatea/presenta).
- Sin cambios en repositorios/mappers FHIR, sin nuevas llamadas, sin librerías nuevas.

## G) Impacto en performance

- Costo principal: filtrado O(n) + sort O(k log k), donde `k` = visitas válidas del episodio.
- En práctica actual (panel admin por paciente), costo aceptable.
- Micro-optimización opcional futura:
  - si ya llega ordenado desc por `startedAt`, puede hacerse single-pass para reconstruir ascendente sólo del subconjunto de episodio, pero no es necesario ahora.
- Trigger para optimizar: pacientes con cientos/miles de visitas en una sola carga.

## H) Tests recomendados

### Unitarios dominio (`encounter-stats.test.ts`)

1. 0 visitas.
2. 1 visita (primera visita calculable; frecuencia no).
3. 2 visitas (intervalo único).
4. Intervalos regulares (promedio exacto).
5. Intervalos irregulares (promedio con `Math.round`).
6. Intervalos <1 día (“Menos de 1 día” a nivel formateo UI).
7. Visitas mismo día (intervalo 0).
8. Primera visita antes de inicio de episodio.
9. `startedAt` inválido excluido.
10. Visitas fuera de episodio excluidas.
11. Episodio activo vs más reciente (contexto correcto).
12. Tratamiento finalizado (usa más reciente).
13. Episodio sin `startDate` (primera visita no calculable; frecuencia sí).

### Loader (`encounters/data.test.ts`)

- Caso con activo+más reciente verificando que métricas usan activo.
- Caso sin activo usando más reciente.
- Caso sin episodio (métricas no calculables).

### UI (`EncounterStatsSummary`)

- Render de tarjetas nuevas y ocultamiento de tarjeta de exclusiones.
- Render de helper de exclusiones sólo cuando `durationExcludedCount > 0`.
- Singular/plural y “Menos de 1 día”.
- Estados `—`/“Aún no calculable”.

## I) Documentación necesaria

- **Sí** actualizar `docs/fuente-de-verdad-operativa.md` para incluir definiciones de las dos métricas y sus reglas de exclusión/fallback.
- **README.md**: opcional, sólo si hoy documenta explícitamente el set de métricas del bloque `/encounters`; si no, puede omitirse.

## J) Riesgos / deudas

1. **Calidad de datos temporal** (timezone, fechas inválidas, inicio episodio tardío) puede producir casos de “antes del inicio registrado”.
2. **Semántica de episodio**: si hay visitas históricas mal asociadas a episodio, la frecuencia quedará sesgada.
3. **Diferencia entre dato y copy**: conviene separar valor numérico crudo (dominio) de copy amigable (presentación) para testabilidad.
4. **Estado actual ya mezcla métricas de duración globales con tratamiento contextual en treatmentCount**; al introducir ritmo por episodio, hay que explicitar scope de cada tarjeta para evitar confusión.

## K) Recomendación final

- **Implementar en próxima iteración (sí), no en esta auditoría.**
- Reemplazar tarjeta protagonista:
  - quitar “Excluidas del cálculo de duración” como tarjeta;
  - agregar “Frecuencia promedio” como tarjeta principal.
- Agregar también “Primera visita” como tarjeta principal.
- Mantener “En este tratamiento” (sigue aportando volumen contextual del episodio).
- Fórmula definitiva:
  - demora inicial = días desde `episode.startDate` a primera visita válida del episodio;
  - frecuencia = promedio de intervalos consecutivos entre visitas válidas del episodio;
  - reglas de copy para evitar “0 días” y tratar `<1 día` como “Menos de 1 día”.
- Transparencia de parcialidad:
  - helper corto con cobertura `X de Y` + causal de exclusión;
  - visible sólo cuando hay exclusiones.
- Riesgo residual aceptable: inconsistencias de calidad temporal en datos legacy; mitigable con tests + helper de anomalía.

## Cierre posterior

- **Estado:** implementado y cerrado (2026-04-27).
- **Decisión final aplicada:** scope único por episodio efectivo (activo si existe; si no, último registrado) para las métricas protagonistas del bloque en `/encounters`.
- **Transparencia de duración:** se mantiene como helper con cobertura `X de Y` sobre visitas del tratamiento, no como tarjeta protagonista.
- **Nota de deuda menor:** `totalCount` global permanece en contrato de stats como dato auxiliar/compatibilidad; evaluar limpieza futura si no hay consumidores o si no se define una sección global/histórica separada.
