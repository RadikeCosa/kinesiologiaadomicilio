> Estado: archivado  
> Motivo: Documento histórico de auditoría/cierre/plan ya superado por la fuente operativa vigente o por implementación cerrada.  
> Fecha de archivo: 2026-04-28  
> Reemplazado/relacionado con: docs/fuente-de-verdad-operativa.md

# Auditoría UX/UI y arquitectura de superficie

Fecha: 2026-04-23 (UTC)

Rutas auditadas:
- `/admin/patients/[id]/encounters`
- `/admin/patients/[id]/treatment`

## A. Diagnóstico general

### Evaluación de cada pantalla

- `/encounters` hoy sí funciona como superficie operativa clínica (registro + listado de visitas), pero mantiene un bloque de tratamiento demasiado protagonista para ser solo acceso a otra ruta.
- `/treatment` sí concentra la gestión de tratamiento (inicio/finalización), aunque su jerarquía visual y copy todavía dependen del marco “Gestión clínica” y no marcan con suficiente nitidez su rol específico.

### Principales problemas detectados

1. **Competencia de foco dentro de `/encounters`**: el bloque “Gestión del tratamiento” aparece arriba, con CTA primario oscuro, antes de la sección de visitas; eso compite contra la tarea principal de la pantalla (operar visitas).  
2. **Duplicación semántica de estado**: en `/encounters` conviven (a) bloque de tratamiento + (b) cartel de estado de tratamiento (verde/ámbar) + (c) gating del formulario de visita; se repite la misma señal en distintos pesos visuales.  
3. **Inconsistencia de CTA dominante por superficie**: hoy el CTA más fuerte en `/encounters` puede terminar siendo “Gestionar tratamiento activo / Iniciar tratamiento”, cuando debería dominar “Registrar visita”.  
4. **Copy con mezcla de niveles**: aparecen en UI términos técnicos (`EpisodeOfCare`) mezclados con copy de operación diaria (“visitas”), sin pauta de cuándo usar cada lenguaje.  
5. **Jerarquía de títulos poco específica**: ambos headers se presentan como “Gestión clínica …”, reduciendo diferenciación mental entre “operación de visitas” y “gestión del ciclo de tratamiento”.

### Principales oportunidades

- Bajar el bloque de acceso a tratamiento en `/encounters` a patrón de **navegación secundaria compacta**.
- Convertir `/treatment` en una superficie con **acción principal inequívoca** (iniciar o finalizar), manteniendo el resto como contexto.
- Estandarizar copy funcional con lenguaje de producto (tratamiento/visitas) y reservar `EpisodeOfCare` para apoyo contextual breve.
- Reducir estados redundantes para mejorar escaneo y disminuir “ruido” antes de agregar nuevas piezas clínicas.

## B. Hallazgos por pantalla

### `/admin/patients/[id]/encounters`

1. **Responsabilidad visible actual**: mezcla “gestión de tratamiento” y “operación de visitas” dentro del mismo primer pliegue.  
2. **Elemento sobredimensionado**: la card completa de tratamiento (`h2` + párrafo + botón primario) ocupa un rol mayor al de simple puente de navegación.  
3. **Redundancia de estado**: el mensaje verde/ámbar de estado activo/no activo vuelve a comunicar lo que ya dice la card de tratamiento y lo que ya impone el formulario (habilitado/bloqueado).  
4. **CTA dominante desalineado**: el primer botón primario se dedica a tratamiento, no a visitas.  
5. **Copy mejorable**: “Gestión clínica” como subtítulo es demasiado genérico para una vista que realmente es “Visitas del paciente”.

### `/admin/patients/[id]/treatment`

1. **Responsabilidad visible actual**: razonablemente enfocada en estado y acciones de tratamiento (iniciar/finalizar).  
2. **Jerarquía mejorable**: el header “Gestión clínica · Tratamiento” mantiene dependencia semántica del módulo clínico general; podría ser más directo como superficie de tratamiento.  
3. **Acciones**: la CTA principal está bien orientada según estado (iniciar o finalizar), pero el contexto superior podría reforzar mejor “esta pantalla no es para visitas”.  
4. **Copy técnico**: “EpisodeOfCare” aparece en mensajes de apoyo; para operación diaria puede bajarse o ir entre paréntesis, priorizando “tratamiento activo”.

## C. Recomendaciones concretas

### Cambios de jerarquía visual

1. En `/encounters`, elevar como bloque principal:
   - título de sección: **“Visitas del paciente”**;
   - formulario de registro (cuando hay tratamiento activo);
   - listado de visitas.
2. En `/encounters`, degradar tratamiento a bloque secundario compacto (1 línea de estado + link textual o botón secundario pequeño).
3. En `/treatment`, mantener una única card principal de decisión operativa (iniciar/finalizar) como primer bloque después del header.

### Cambios de layout

1. `/encounters`:
   - mover “Acceso a tratamiento” debajo del título o en una franja lateral/inline liviana;
   - evitar card grande completa de tratamiento en primer foco;
   - conservar un solo mensaje de estado (el estrictamente necesario para habilitar/bloquear registro).
2. `/treatment`:
   - mantener layout actual de una sola columna, pero con encabezado más específico;
   - separar visualmente “estado actual” de “acción” con menor ruido cromático cuando no es alerta.

### Cambios de copy

1. `/encounters`:
   - subtítulo de pantalla: de “Gestión clínica” a **“Registro y seguimiento de visitas”**.
   - bloque secundario: **“Tratamiento: activo desde {fecha}”** / **“Tratamiento: no activo”**.
   - link secundario: **“Ir a gestión de tratamiento”**.
2. `/treatment`:
   - subtítulo: **“Inicio y cierre del tratamiento del paciente”**.
   - título de estado: **“Tratamiento activo”** o **“Sin tratamiento activo”** (sin mayúsculas de sistema).
   - microcopy técnico opcional: “(EpisodeOfCare)” solo en texto auxiliar corto.

### Cambios de CTA / navegación entre pantallas

1. CTA dominante en `/encounters`: **“Registrar visita”** (cuando habilitado).  
2. CTA a `/treatment` desde `/encounters`: siempre **secundaria** (link o botón outline), nunca principal.  
3. CTA dominante en `/treatment`:
   - si no activo: **“Iniciar tratamiento”**;
   - si activo: **“Finalizar tratamiento”** (de advertencia).
4. Back links:
   - `/encounters` vuelve al hub de paciente (ok actual);
   - `/treatment` puede volver a `/encounters` (ok), pero conviene rotularlo como **“Volver a visitas”** para reforzar separación mental.

## D. Propuesta de criterio de diseño

Reglas simples para sostener separación futura:

1. **Una pantalla = una intención primaria.**
   - `/encounters`: operar visitas.
   - `/treatment`: gestionar ciclo del tratamiento.
2. **Lo no primario entra como navegación secundaria compacta.**
3. **Un solo CTA primario visible por pantalla.**
4. **Un solo bloque de estado dominante por decisión operativa.**
5. **Lenguaje de producto primero; lenguaje técnico en apoyo.**
6. **La severidad visual (color/contraste/tamaño) debe corresponder al riesgo de la acción, no a disponibilidad de navegación.**

## E. Plan mínimo de implementación

Cambios chicos de alto impacto (sin refactor grande):

1. En `encounters/page.tsx`, convertir la card de “Gestión del tratamiento” en una franja compacta secundaria con link de salida a `/treatment`.
2. En `encounters/page.tsx`, quitar el cartel verde “Tratamiento activo detectado…” y conservar solo el estado impeditivo cuando no hay tratamiento activo (ámbar), ya que el formulario ya comunica disponibilidad.
3. En `encounters/page.tsx`, ajustar copy de cabecera/subcabecera para enfatizar visitas.
4. En `treatment/page.tsx`, ajustar copy de cabecera y enlace de retorno para nombrar explícitamente “visitas”.
5. En formularios de tratamiento (`StartEpisodeOfCareForm`, `FinishEpisodeOfCareForm`), suavizar menciones técnicas de `EpisodeOfCare` en mensajes visibles al usuario.

## Verificación contra documentación vigente (estado posterior a implementación mínima)

- **Alineado** con la fuente de verdad operativa: `/encounters` mantiene foco primario en visitas y `/treatment` concentra inicio/cierre de tratamiento, con navegación secundaria compacta desde `encounters` hacia `treatment`.
- **Alineado en copy funcional**: la UI prioriza términos de operación (“tratamiento”, “visitas”) y reduce tecnicismos visibles como `EpisodeOfCare` al plano de apoyo.

## Actualización posterior (2026-04-24)

Refinamiento aplicado en `/admin/patients/[id]/encounters` para consolidar el patrón de contexto secundario de tratamiento:

- el bloque de tratamiento queda compacto y subordinado a la operación de visitas;
- el acceso a `/admin/patients/[id]/treatment` se mantiene como navegación secundaria (link/CTA compacto);
- el contexto de tratamiento distingue explícitamente tres estados:
  1. **Tratamiento activo**: informa fecha de inicio.
  2. **Tratamiento finalizado**: informa fecha de finalización.
  3. **Sin tratamiento iniciado**: informa estado sin episodio iniciado.
- el loader utiliza `activeEpisode` y `mostRecentEpisode` para separar correctamente “finalizado” vs “sin tratamiento iniciado”.

Este ajuste mantiene la regla de arquitectura de superficie:
- `/encounters` muestra contexto de tratamiento, pero **no lo gestiona inline**;
- `/treatment` conserva la responsabilidad primaria de inicio/cierre de tratamiento.
