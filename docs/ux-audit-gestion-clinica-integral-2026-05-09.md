# Auditoría UX/UI integral — Gestión clínica

Fecha: 2026-05-09  
Alcance: `/admin/patients/[id]/encounters/new`, `/admin/patients/[id]/encounters`, `/admin/patients/[id]`, impacto navegacional con `/admin/patients/[id]/treatment`.  
No-alcances respetados: sin cambios de domain/FHIR/schemas/actions/mappers/repositories/scoping/captura/persistencia.

## 1) Diagnóstico por superficie

### A. `/admin/patients/[id]/encounters/new`

**Fortalezas actuales**
- Inicio/Cierre mantiene prioridad visual al inicio del formulario y en grid de 2 columnas (desktop). 
- Puntualidad está explícitamente marcada como operativa y opcional.
- Métricas funcionales y Registro clínico están en `<details>`, lo cual limita ruido inicial.

**Problemas UX detectados**
- **Crítico**: Puntualidad ocupa más altura de la necesaria (fieldset + helper + 3 radios en columna), compite con Inicio/Cierre y desplaza métricas. 
- **Medio**: Etiquetas actuales de puntualidad mezclan semántica (“demora leve”, “con demora”) y rangos irregulares (15–45), poco escaneables. 
- **Medio**: Métricas funcionales en 4 columnas en desktop, pero sin grouping semántico; “Marcha” parece agregada al final, no parte de paquete base. 
- **Menor**: “Marcha” usa label corto y helper largo (“...en esta visita. (min)”), inconsistencia de estilo con TUG/Bipedestación.

**Recomendación de jerarquía**
Orden recomendado (se mantiene):
1) Inicio/Cierre  
2) Puntualidad (compacta, una sola línea visual)  
3) Métricas funcionales (details abierto por defecto opcional)  
4) Registro clínico (details colapsado por defecto)

**Patrón recomendado para puntualidad (sin cambiar datos)**
- Desktop: **segmented control de 3 o 4 opciones** dentro de un contenedor compacto (1 fila).  
- Mobile: wrap a 2 filas o fallback a radios horizontales con chips.  
- Evitar select como primera opción (esconde estado y agrega taps).

---

### B. `/admin/patients/[id]/encounters`

**Fortalezas actuales**
- Header claro + CTA “Registrar visita”.
- Contexto de tratamiento y contexto clínico read-only antes del listado.
- Tendencia funcional existe y no interpreta clínicamente.
- Cards preservan metadata temporal en primer plano.

**Problemas UX detectados**
- **Crítico**: Competencia visual entre “Estadísticas de visitas” y “Tendencia funcional”; ambas están al mismo nivel y pueden percibirse duplicadas.
- **Medio**: Tendencia actual es correcta en contenido, pero no maximiza escaneo rápido (faltan anclas visuales para último/previo/cambio).
- **Medio**: En cards, puntualidad como texto inline junto a inicio/cierre/duración/estado puede sobrecargar la línea de metadata.
- **Menor**: Bloque clínico + métricas + metadata puede verse denso en notas largas aunque exista toggle.

**Recomendación de jerarquía en página**
1) Header + CTA  
2) Contexto tratamiento + contexto clínico longitudinal  
3) **Tendencia funcional** (primera capa analítica)  
4) Estadísticas de visitas (segunda capa operativa)  
5) Listado de visitas

---

### C. `/admin/patients/[id]` (hub)

**Diagnóstico**
- El hub está bien orientado a navegación/estado general.
- Hoy no muestra adelanto clínico de encuentros, evitando duplicación.

**Recomendación**
- Sí conviene un **adelanto compacto** de Gestión clínica, pero solo como orientación:
  - Última visita (fecha)
  - Estado de tratamiento
  - 1–2 métricas recientes (ej. Dolor + TUG, si existen)
  - CTA “Ver gestión clínica”
- No incluir listado de visitas ni tendencia completa en hub.

---

### D. `/admin/patients/[id]/treatment` (impacto navegación)

- Mantener como fuente de contexto longitudinal y ciclo activo/cerrado.
- Reforzar coherencia de links cruzados (treatment ↔ encounters ↔ hub) sin rediseño.

## 2) Severidad (crítico / medio / menor)

### Críticos
1. Exceso de altura/énfasis del bloque de puntualidad en `new`.  
2. Solapamiento conceptual entre estadísticas y tendencia en `encounters`.

### Medios
1. Copy y rangos de puntualidad con baja claridad semántica.  
2. Tendencia mejorable para escaneo rápido (último/previo/delta).  
3. Densidad en cards cuando coinciden nota + métricas + metadata.

### Menores
1. Inconsistencias de microcopy entre métricas (especialmente Marcha).  
2. Falta de patrón visual unificado para estado “sin dato suficiente”.

## 3) Recomendación puntualidad operativa

## Nombre
- Mantener “Puntualidad operativa” (es correcto y honesto).

## Copy de opciones (recomendado)
**Opción A (4 niveles, recomendada para escalabilidad):**
- En horario
- Hasta 15 min tarde
- Hasta 30 min tarde
- Más de 30 min tarde

**Opción B (3 niveles, mínima fricción):**
- En horario
- Hasta 30 min tarde
- Más de 30 min tarde

**Decisión sugerida**
- Si el equipo usa puntualidad para monitoreo real: 4 opciones.  
- Si hoy es solo contexto manual transicional: 3 opciones.

## Evitar falsa precisión
- Helper fijo breve: “Clasificación manual orientativa; no reemplaza agenda formal.”

## Visibilidad en cards
- Mostrar como **chip discreto** (“Puntualidad: En horario”) debajo o al final de metadata temporal, no en tooltip oculto.

## 4) Recomendación Tendencia funcional

- Mantener bloque propio (no fusionar con estadísticas).
- Ubicar antes del listado de visitas y antes de estadísticas operativas si se prioriza clínica; o inmediatamente después del contexto clínico.
- Jerarquía interna:
  1) Título
  2) Helper corto (alcance por episodio, sin interpretación)
  3) Grid de métricas
  4) Dentro de cada métrica: Último → Previo → Cambio
- Estados:
  - 0 datos: ocultar bloque completo (como hoy) o mostrar empty explícito si producto lo requiere.
  - 1 dato: mostrar último + “Sin comparación previa”.
  - n>=2: mostrar último/previo/cambio.

## 5) Colores y resaltados

## Qué sí (ahora)
- Color suave para **dirección del delta** solamente (ej. + / - / =), sin texto de “mejora/empeora”.
- Escala neutral para énfasis visual (peso tipográfico/fondo leve), no semáforo fuerte.

## Qué no (ahora)
- No usar umbrales clínicos para TUG/Bipedestación/Marcha sin criterio validado.
- No colorear por edad ni por perfiles sin evidencia y aprobación clínica.
- No mostrar mensajes inferenciales automáticos.

## Requiere evidencia externa
- Cualquier esquema de colores por riesgo clínico, estratificación etaria o umbrales de desempeño funcional.

## 6) Adelanto en hub de paciente

**Sí, con límites estrictos.**
- Card compacta “Resumen clínico reciente”.
- Máximo 4 filas + 1 CTA.
- Nunca reemplazar /encounters.

**Qué incluir**
- Última visita
- Estado tratamiento
- 1 o 2 métricas recientes (si existen)
- Conteo de visitas del episodio

**Qué excluir**
- Tendencia completa por métrica
- Estadísticas extensas
- Nota clínica narrativa

**Escenarios especiales**
- Sin tratamiento activo: “Sin tratamiento activo · No se pueden registrar visitas nuevas.” + CTA a Treatment.
- Tratamiento finalizado: “Tratamiento finalizado · Ver historial clínico.”
- Episodio nuevo sin visitas: “Tratamiento activo sin visitas registradas.” + CTA Registrar visita.

## 7) Wireframes textuales

### 7.1 Formulario nueva visita
```text
[Header paciente + badge]
Inicio de la visita* | Cierre de la visita*
Helper obligatorio

[Puntualidad operativa] (compacta, 1 línea)
[En horario] [≤15 min] [≤30 min] [>30 min]
Clasificación manual orientativa.

[Métricas funcionales] (details)
TUG | Dolor
Bipedestación | Marcha

[Registro clínico] (details colapsado por defecto)
Observación clínica
Intervención y respuesta
Continuidad del tratamiento

[CTA Registrar visita]
```

### 7.2 Card de visita
```text
Fecha: dd/mm/yyyy
Inicio · Cierre · Duración · Estado
[Chip puntualidad]

[Métricas funcionales]
TUG: x s · Dolor: x/10 · Bipedestación: x min · Marcha: x min

[Registro clínico]
Preview colapsado + botón Ver/Ocultar detalle
```

### 7.3 Bloque Tendencia funcional
```text
Tendencia funcional
Comparación de las dos últimas mediciones por métrica del episodio actual.

[TUG] Último | Previo | Cambio
[Dolor] Último | Previo | Cambio
[Bipedestación] Último | Previo | Cambio
[Marcha] Último | Previo | Cambio

Si solo hay una medición: “Sin comparación previa”
```

### 7.4 Adelanto en hub
```text
Resumen clínico reciente
Última visita: dd/mm/yyyy
Estado tratamiento: Activo/Finalizado/Sin iniciar
Dolor: x/10 · TUG: x s
Visitas del episodio: n
[Ver gestión clínica]
```

## 8) Patch mínimo sugerido por prioridad (sin tocar dominio)

### P0 (inmediato)
1. Compactar UI de puntualidad (patrón horizontal/chips) + copy claro.  
2. Reordenar jerarquía visual en `encounters`: tendencia encima de estadísticas operativas.  
3. Pasar puntualidad de texto largo inline a chip compacto en cards.

### P1 (corto plazo)
1. Refinar microcopy de métricas (consistencia unidades y ejemplo de 0 válido).  
2. Ajustar spacing y densidad de card (separadores suaves por bloque).

### P2 (posterior)
1. Adelanto compacto en hub con CTA (sin duplicar encounters).  
2. Tokens de color suaves para delta neutral.

## 9) Tests de render recomendados

1. Form `new`: orden de bloques (Inicio/Cierre → Puntualidad → Métricas → Registro clínico).  
2. Form `new`: puntualidad render compacta en desktop/mobile (snapshot).  
3. Form `new`: labels de puntualidad y helper manual/transicional visibles.
4. Encounters: tendencia se renderiza antes de listado y conserva helper sin interpretación.
5. Encounters cards: puntualidad en chip compacto; metadata temporal sigue visible.
6. Cards con nota larga: colapsado por defecto + toggle funcional.
7. Tendencia: casos 0, 1, >=2 mediciones por métrica.
8. Hub: render condicional del adelanto según estado de tratamiento/episodio.
9. No regresión de scoping por episodio efectivo en tendencia y listados.
10. Mobile snapshots de form, tendencia y cards.

## 10) No-alcances preservados

- Sin cambios en FHIR/domain/schemas/actions/mappers/repositories.
- Sin cambios en captura/persistencia/scoping.
- Sin IA, Procedure ni Goal.
- Sin dashboard avanzado ni gráficos.
- Sin umbrales clínicos por edad.

## 11) Roadmap sugerido

### Etapa 1 — Patch UX inmediato
- Compactar puntualidad.
- Mejorar jerarquía tendencia vs estadísticas.
- Limpiar densidad de cards.

### Etapa 2 — Mejora visual posterior
- Sistema de chips/estados consistente.
- Delta con énfasis visual neutro.
- Copy clínico-operativo unificado.

### Etapa 3 — Futuro (tendencia avanzada)
- Evolución funcional más rica (siempre por episodio).
- Posible visualización temporal simple (sparklines) solo tras validación clínica y de producto.

## Cierre P0 implementado (2026-05-09)

- Se compactó visualmente `Puntualidad operativa` en `/encounters/new` con patrón de opciones en línea (wrap responsive), manteniendo `name`, `valueCode` y payload.
- En `/encounters`, `Tendencia funcional` quedó jerárquicamente antes de `Estadísticas de visitas`, sin cambios de cálculo ni read model.
- En cards de visitas, la puntualidad se muestra como chip compacto cuando existe, fuera de la línea principal de metadata temporal.
- No se modificaron domain/FHIR/schemas/actions/mappers/repositories, ni scoping/captura/persistencia.

## Cierre P1 implementado (2026-05-09)

- Se reforzó la jerarquía interna de `Tendencia funcional` con mini-cards por métrica y estructura visual consistente `Último` (principal) + `Previo`/`Cambio` (secundarios), manteniendo cálculo y alcance por episodio.
- Cuando una métrica tiene una sola medición, la UI muestra `Sin comparación previa`.
- El delta conserva formato numérico con signo y se destaca con énfasis visual neutro (sin semáforos clínicos ni interpretación automática).
- En cards de visitas se mejoró densidad/escaneabilidad con bloques compactos y mejor distribución de métricas funcionales, sin alterar datos, orden canónico ni lógica de render.
- No se modificaron domain/FHIR/schemas/actions/mappers/repositories, ni scoping/captura/persistencia.
