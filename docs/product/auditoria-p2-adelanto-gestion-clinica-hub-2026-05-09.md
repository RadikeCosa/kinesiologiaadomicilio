# Auditoría P2 — Adelanto compacto de Gestión clínica en hub del paciente

Fecha: 2026-05-09

## Recomendación de alcance P2

Sí, conviene incorporar en `/admin/patients/[id]` un bloque **"Resumen clínico reciente"** como orientación de estado y acceso, **sin convertir el hub en una segunda vista de `/encounters`**.

Objetivo del bloque:
- dar contexto clínico mínimo en 5–10 segundos;
- reducir navegación a ciegas;
- dirigir a la superficie correcta con CTA claro;
- mantener a `/encounters` como fuente de detalle clínico-operativo.

Principio de diseño para evitar duplicación:
- **Hub = síntesis + decisión de próximo paso**.
- **Encounters = detalle longitudinal + operación**.

## Respuestas a las preguntas

### 1) ¿Conviene mostrar un bloque “Resumen clínico reciente”?
Sí. El hub ya presenta estado general y CTA dual (clínica/administrativa), por lo que sumar un resumen clínico breve mejora orientación sin romper la arquitectura actual.

### 2) ¿Qué datos incluir como máximo?
Máximo recomendado (5 ítems):
1. **Estado del tratamiento** (activo / finalizado / sin tratamiento).
2. **Última visita** (fecha + tipo breve o “sin visitas aún”).
3. **Cantidad de visitas del episodio efectivo** (número simple).
4. **1–2 métricas funcionales recientes** (último valor disponible por métrica prioritaria).
5. **CTA**: “Ver gestión clínica” (link a `/admin/patients/[id]/encounters`).

Reglas:
- No más de 2 métricas.
- Si no hay datos, mostrar vacío explícito (“Sin registros funcionales”).
- No incluir interpretación clínica automática.

### 3) ¿Qué NO incluir?
No incluir en el hub:
- tendencia funcional completa;
- nota clínica;
- listado de visitas;
- estadísticas extensas (puntualidad, distribuciones, acumulados detallados).

Todo eso permanece en `/encounters`.

### 4) ¿Dónde ubicarlo en el hub?
Ubicación recomendada:
- dentro del bloque principal de paciente (misma tarjeta de resumen),
- **debajo de “Siguiente paso sugerido”**,
- **encima de la grilla de CTAs** o inmediatamente debajo con el CTA clínico repetido solo una vez dentro del bloque.

Orden visual sugerido:
1. identidad + badge;
2. resumen administrativo/estado general (actual);
3. siguiente paso sugerido (actual);
4. **Resumen clínico reciente (nuevo)**;
5. CTAs Gestión clínica / Gestión administrativa.

### 5) ¿Cómo evitar duplicar `/encounters`?
Checklist anti-duplicación:
- Limitarse a 1 snapshot temporal (última visita), no serie histórica.
- Limitarse a conteo único (visitas del episodio), no panel estadístico.
- Máximo 2 observaciones funcionales de último punto, sin tendencia.
- CTA obligatorio hacia `/encounters` para explorar detalle.
- Copy explícito: “Vista resumida. El detalle está en Gestión clínica”.

### 6) ¿Qué mostrar si no hay tratamiento activo?
Mostrar:
- Estado: “Sin tratamiento activo”.
- Última visita: si no hay episodio efectivo con visitas, “No disponible”.
- Visitas del episodio: “0”.
- Métricas: “Sin registros funcionales”.
- CTA principal: “Ir a Gestión administrativa” (crear/continuar solicitud).
- CTA secundario o link contextual: “Ver gestión clínica” (solo historial si aplica).

### 7) ¿Qué mostrar si hay tratamiento activo sin visitas?
Mostrar:
- Estado: “Tratamiento activo”.
- Última visita: “Aún no registrada”.
- Visitas del episodio: “0”.
- Métricas: “Sin registros funcionales todavía”.
- CTA principal: “Registrar primera visita” (puede seguir apuntando a `/encounters`, donde existe el flujo).

### 8) ¿Qué mostrar si el tratamiento está finalizado?
Mostrar:
- Estado: “Tratamiento finalizado”.
- Última visita: fecha de última visita del episodio efectivo (si existe).
- Visitas del episodio: total del episodio finalizado.
- Métricas recientes: último punto disponible (máx. 2).
- CTA: “Ver gestión clínica (historial)”.

### 9) ¿Qué mostrar si hay episodio nuevo sin visitas?
Caso equivalente operativo a “activo sin visitas”, pero con copy más directivo:
- Estado: “Nuevo tratamiento activo”.
- Última visita: “Todavía no hay visitas en este episodio”.
- Visitas del episodio: “0”.
- Métricas: “Se mostrarán al registrar visitas”.
- CTA: “Registrar primera visita”.

### 10) ¿Qué tests de render hacen falta?
Matriz mínima de tests de presentación en hub:
1. Render con tratamiento activo + visitas + métricas (muestra los 5 ítems).
2. Activo sin visitas (estado activo, visita vacía, contador 0, sin métricas).
3. Sin tratamiento activo y sin historial (estado vacío, CTA administrativa).
4. Tratamiento finalizado con historial (estado finalizado + datos históricos compactos).
5. Episodio nuevo sin visitas (copy específico de arranque).
6. Fallback sin métricas aunque existan visitas (mensaje “Sin registros funcionales”).
7. Presencia y destino correcto del CTA “Ver gestión clínica”.
8. Garantía de no-render de elementos prohibidos (sin tendencia completa, sin listado, sin nota clínica).

## Wireframe textual (propuesto)

```txt
[Paciente + badge estado]
[DNI | Edad | Inicio/Fin]
[Siguiente paso sugerido]

[Resumen clínico reciente]  <-- NUEVO
- Estado del tratamiento: Activo
- Última visita: 08/05/2026
- Visitas del episodio: 4
- Métricas recientes:
  - Dolor (EVA): 4/10
  - Marcha asistida: Sí
- [Ver gestión clínica]

[Botones actuales]
[Gestión clínica] [Gestión administrativa]
```

## Patch mínimo sugerido (sin implementación aún)

Alcance técnico mínimo para futura ejecución:
1. **Hub data/read-model**: agregar un selector compacto para resumen clínico reciente (sin tocar dominio/FHIR/repos).
2. **Hub UI**: nuevo componente presentacional `ClinicalRecentSummaryCard` en `src/app/admin/patients/[id]/components/`.
3. **Hub page**: insertar componente en el layout actual bajo “Siguiente paso sugerido”.
4. **Copy**: textos cortos de estado/vacío en archivo de copy de superficie del paciente.
5. **Tests**: unit/render del componente + casos de página para las 5 situaciones clave.

Criterio de aceptación P2:
- agrega orientación clínica mínima;
- no replica widgets de `/encounters`;
- conserva navegación natural hacia Gestión clínica.

## Tests recomendados (para cuando se implemente)

- Unit tests de mapeo de estados a copy (activo/finalizado/sin activo/nuevo episodio).
- Render tests del card con combinatorias de datos vacíos/parciales/completos.
- Page-level tests en `/admin/patients/[id]` validando ubicación y CTA.
- Test de regresión de no-duplicación (assert de ausencia de secciones de tendencia/listado/nota en hub).

## No-alcances (explícitos)

- No implementar código en esta auditoría.
- No cambios en FHIR/domain/schemas/actions/mappers/repositorios.
- No cambios de scoping de episodios/visitas ya definidos.
- No creación de dashboard clínico en hub.
- No IA/clasificación/interpretación automática.
- No Procedure/Goal en P2.

## Cierre de implementación (2026-05-09)

- Implementado bloque compacto `Resumen clínico reciente` en `/admin/patients/[id]` debajo de `Siguiente paso sugerido`.
- El bloque muestra síntesis mínima del episodio efectivo: estado, última visita, cantidad de visitas, hasta 2 métricas recientes y CTA a Gestión clínica.
- Priorización de métricas aplicada: Dolor → Marcha → TUG → Bipedestación.
- Se mantienen límites anti-duplicación: sin tendencia completa, sin notas clínicas, sin listado de visitas, sin delta/comparaciones en hub.
