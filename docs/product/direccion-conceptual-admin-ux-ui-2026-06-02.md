# Dirección conceptual UX/UI para `/admin`

Fecha: 2026-06-02

## Alcance

Documento de dirección conceptual para la evolución de `/admin` a partir de la auditoría previa:

- sin implementar cambios;
- sin modificar código;
- sin cambiar UI todavía;
- sin agregar rutas;
- sin agregar gráficos;
- sin cambiar modelo FHIR;
- sin persistir métricas nuevas.

## Punto de partida

La auditoría previa dejó una conclusión clara:

`/admin` hoy funciona como resumen operativo mínimo, pero mezcla métricas de pacientes y solicitudes con el mismo peso visual. La mejora más valiosa no es sumar más KPIs sino reordenar la superficie alrededor de una pregunta más útil.

Pregunta central recomendada para `/admin`:

**¿Qué requiere revisión o acción hoy, y qué está simplemente en seguimiento?**

## Rol recomendado de `/admin`

`/admin` debería consolidarse como una **consola breve de prioridad operativa**, no como:

- un dashboard clínico;
- un panel administrativo amplio;
- un resumen completo de todo lo que existe en `/patients`, `/administrative`, `/treatment` o `/encounters`.

Su función ideal es orientar el primer vistazo del día y derivar rápido hacia la superficie correcta.

## Principio rector de jerarquía

La superficie debería ordenar la información en tres niveles:

1. **Requiere acción**
2. **En seguimiento**
3. **Contexto / histórico**

La mejora clave no está sólo en qué mostrar, sino en **darle distinto peso visual y semántico** a cada nivel.

## Dirección recomendada de bloques

### Bloque 1. Requiere acción

Debe ser el bloque protagonista de `/admin`.

Su función es responder:

- qué cosas están trabadas;
- qué cosas esperan decisión;
- qué cosas ya deberían haber avanzado y todavía no avanzaron.

Señales candidatas más fuertes:

- `Solicitudes en evaluación`
- `Aceptadas pendientes de iniciar tratamiento`
- `Pacientes con datos operativos incompletos`
- `Pacientes activos sin visitas registradas`

Características recomendadas:

- pocas señales;
- copy muy directo;
- cada métrica debe implicar una pregunta accionable;
- idealmente con salida contextual hacia la superficie donde se resuelve.

### Bloque 2. En seguimiento

Debe funcionar como lectura de carga operativa viva.

Su función es responder:

- cuánto trabajo clínico está activo hoy;
- si hay seguimiento vivo pero no necesariamente bloqueos;
- si existe alguna señal de vigilancia útil.

Señales candidatas:

- `Pacientes en tratamiento`
- `Pacientes activos con última visita antigua`, sólo si se define una regla clara
- eventualmente una señal breve de “carga operativa activa”

Este bloque debería ser importante, pero no competir con pendientes urgentes.

### Bloque 3. Contexto / histórico

Debe quedar explícitamente en segundo plano.

Su función es aportar orientación general sin ocupar el centro del tablero.

Señales posibles:

- `Pacientes totales`
- `Tratamientos finalizados`
- `Pacientes finalizados recientemente`, si aporta lectura útil
- `Edad de pacientes`, sólo si se justifica mantenerla

## Qué métricas deberían ser protagonistas

### Protagonistas recomendadas

1. `Solicitudes en evaluación`
2. `Aceptadas pendientes de iniciar tratamiento`
3. `Pacientes con datos operativos incompletos que bloquean avance`
4. `Pacientes activos sin visitas registradas`

Razón: las cuatro responden mejor que el estado actual a la lógica de “qué tengo que revisar ahora”.

### Protagonista secundaria fuerte

- `Pacientes en tratamiento`

No es una urgencia por sí sola, pero sí una señal de volumen vivo y de carga clínica real.

## Qué métricas deberían pasar a segundo plano

- `Pacientes totales`
- `Tratamiento finalizado`
- `Edad de pacientes`
- `Pacientes finalizados recientemente`, salvo que luego se confirme una utilidad operativa concreta

Estas métricas no están mal, pero no deberían definir la identidad de la pantalla.

## “Sin tratamiento iniciado”: recomendación conceptual

### Diagnóstico

La etiqueta actual no conviene como métrica protagonista.

Problemas:

- mezcla `preliminary` y `ready_to_start`;
- oculta dos realidades distintas;
- se pisa semánticamente con el embudo de solicitudes;
- obliga a conocer reglas internas del modelo.

### Recomendación

No sostener `Sin tratamiento iniciado` como tarjeta principal con ese nombre actual.

Opciones conceptuales preferibles:

1. **Eliminarla como agregado principal**
   - y reemplazarla por señales más accionables.

2. **Desagregarla**
   - `Datos operativos incompletos`
   - `Listos para iniciar tratamiento`

3. **Renombrarla a una categoría más explicativa**
   - sólo si se mantiene como bloque secundario y no como KPI estrella.

### Dirección recomendada

La mejor dirección conceptual es:

- **sacarla del primer plano**;
- **reaprovechar su semántica desagregada** dentro de pendientes o seguimiento.

## Cómo separar visualmente métricas de solicitudes y de pacientes

La separación más importante no es estética sino conceptual.

### Recomendación principal

No mezclar en el mismo mosaico:

- señales del embudo de solicitudes;
- señales del estado operativo de pacientes/tratamientos.

### Separación sugerida

1. `Requiere acción`
   - puede combinar solicitudes y pacientes, pero sólo si comparten el criterio “necesita intervención ahora”.

2. `En seguimiento`
   - debería inclinarse más a pacientes/tratamientos activos.

3. `Contexto / histórico`
   - debería contener métricas generales, sin mezclar con pendientes.

### Regla práctica

Si una métrica responde “hay trabajo pendiente”, puede vivir arriba aunque sea de solicitud o de paciente.

Si una métrica sólo responde “cómo está el universo total”, debe bajar.

## Microcopy recomendado por bloque

### Header de página

Dirección conceptual:

- título con tono de consola operativa;
- subtítulo breve orientado a priorización, no a estadística general.

Ejemplo conceptual:

- `Panel operativo`
- `Prioriza qué revisar hoy y qué está simplemente en seguimiento.`

### Microcopy para `Requiere acción`

Objetivo:

- dejar claro que son señales accionables, no sólo descriptivas.

Ejemplos conceptuales:

- `Casos que requieren revisión o destraban el avance.`
- `Pendientes concretos para resolver hoy.`

### Microcopy para `En seguimiento`

Objetivo:

- transmitir operación viva, no urgencia.

Ejemplos conceptuales:

- `Carga clínica activa y señales de seguimiento.`
- `Casos en curso que conviene monitorear.`

### Microcopy para `Contexto / histórico`

Objetivo:

- degradar su urgencia de forma explícita.

Ejemplos conceptuales:

- `Contexto general de la operación.`
- `Indicadores útiles para lectura global, no para priorización inmediata.`

## Empty states útiles

### Si no hay pendientes en `Requiere acción`

El empty state debería comunicar alivio operativo y no vacío del sistema.

Dirección conceptual:

- `No hay pendientes críticos en este momento.`
- `La operación inmediata está al día.`

### Si no hay casos en `En seguimiento`

Debe explicar que no hay carga activa, no que faltan datos.

Dirección conceptual:

- `No hay tratamientos activos para seguir hoy.`

### Si el contexto histórico queda casi vacío

No hace falta dramatizarlo; debe ser un bloque silencioso.

Dirección conceptual:

- `Todavía no hay suficiente histórico para mostrar contexto estable.`

## CTAs o links contextuales que sí tendrían sentido

Como dirección conceptual, los accesos deberían acompañar cada tipo de señal:

- señales de solicitud → salida a la superficie administrativa del paciente o al listado de pacientes filtrado, según implementación futura;
- señales de tratamiento activo o sin visitas → salida a pacientes / gestión clínica;
- señales de datos incompletos → salida a pacientes / gestión administrativa.

### Principio

Los CTAs deberían ser:

- contextuales;
- pocos;
- consistentes con el bloque que originan.

### Qué evitar

- duplicar muchos accesos globales al final de la pantalla;
- sumar navegación que ya vive naturalmente en el layout;
- usar CTAs genéricos donde la métrica ya sugiere una resolución específica.

## Qué debería quedar explícitamente fuera

Para evitar sobrediseño, deberían quedar fuera de esta evolución conceptual:

- gráficos;
- métricas clínicas agregadas por `Observation`;
- resúmenes longitudinales clínicos cross-patient;
- comparativas complejas;
- semáforos o scores sintéticos poco explicables;
- persistencia de métricas derivadas;
- tableros extensos que dupliquen `/patients`, `/administrative`, `/treatment` o `/encounters`.

## Alternativas de composición visual

## Alternativa A. Dashboard centrado en “Requiere acción”

### Descripción

La pantalla abre con un bloque fuerte de pendientes accionables.

Debajo aparecen:

- `En seguimiento`
- `Contexto / histórico`

La identidad principal de `/admin` pasa a ser: “consola de prioridades”.

### Ventaja principal

Maximiza claridad diaria y alinea mejor la pregunta central del producto.

### Riesgo

Si se lleva demasiado lejos, puede hacer que el tablero parezca sólo una lista de problemas y pierda visión general.

### Complejidad estimada

Media.

No exige más dominio, pero sí buena curaduría de qué entra como pendiente.

### Claridad para el uso diario

Alta.

Es la alternativa más directa para el operador.

### Recomendación

**Muy recomendable.**

Es la opción más alineada con el audit y con la madurez actual del producto.

## Alternativa B. Embudo solicitud → tratamiento → visitas

### Descripción

La pantalla se organiza siguiendo explícitamente el flujo operativo:

1. solicitudes;
2. inicio de tratamiento;
3. seguimiento con visitas;
4. cierre/contexto.

### Ventaja principal

Hace visible la historia del proceso y reduce ambigüedad semántica entre solicitud y tratamiento.

### Riesgo

Puede priorizar demasiado la lógica del flujo y menos la urgencia real del día.

También corre el riesgo de duplicar mentalmente responsabilidades de superficies más específicas.

### Complejidad estimada

Media-alta.

No tanto por datos, sino por necesidad de una narrativa UX más cuidada.

### Claridad para el uso diario

Media.

Muy clara para entender el sistema; menos directa para priorizar en segundos.

### Recomendación

**Recomendable como inspiración conceptual, no como estructura principal.**

Puede aportar al lenguaje y al microcopy, pero no parece la mejor forma base para la home.

## Alternativa C. Resumen operativo clásico mejor jerarquizado

### Descripción

Mantener la idea general del dashboard actual, pero:

- reordenando tarjetas;
- separando mejor bloques;
- degradando métricas históricas;
- aclarando semántica con copy.

### Ventaja principal

Es la evolución menos disruptiva y más fácil de introducir.

### Riesgo

Puede quedarse corta y conservar demasiado la lógica actual de “mosaico de KPIs”.

### Complejidad estimada

Baja-media.

### Claridad para el uso diario

Media-alta.

Mejora bastante, pero menos que una consola realmente centrada en prioridades.

### Recomendación

**Aceptable si se busca una primera iteración conservadora**, pero inferior a la alternativa A como dirección estratégica.

## Comparación resumida

| Alternativa | Ventaja principal | Riesgo | Complejidad | Claridad diaria | Recomendación |
| --- | --- | --- | --- | --- | --- |
| A. Centrada en `Requiere acción` | prioriza mejor el trabajo real del día | puede sentirse demasiado “pendientes” si se exagera | Media | Alta | Recomendada |
| B. Embudo solicitud → tratamiento → visitas | explica muy bien el flujo | menos directa para priorizar rápido | Media-alta | Media | Útil como inspiración parcial |
| C. Resumen clásico mejor jerarquizado | cambio más simple y gradual | puede quedarse demasiado cerca del estado actual | Baja-media | Media-alta | Válida como enfoque conservador |

## Recomendación final de estructura

La dirección más recomendable es una **versión moderada de la alternativa A**, incorporando un poco del orden narrativo de la alternativa B.

### Estructura propuesta

1. **Header breve**
   - orientación operativa;
   - una frase que defina el propósito del tablero.

2. **Bloque protagonista: Requiere acción**
   - pocas señales;
   - semántica inequívoca;
   - foco en destrabar trabajo.

3. **Bloque secundario: En seguimiento**
   - pacientes activos;
   - eventualmente señales de vigilancia bien definidas.

4. **Bloque terciario: Contexto / histórico**
   - totales;
   - finalizados;
   - edad sólo si se decide conservarla.

5. **CTAs contextuales mínimos**
   - más cerca de cada bloque que al estilo “menú duplicado”.

## Criterios de priorización para pasar luego a implementación

Antes de bajar esto a un patch, conviene sostener estos criterios:

1. Cada métrica protagonista debe responder una pregunta accionable.
2. Ninguna métrica protagonista debería necesitar explicación larga para entenderse.
3. No mezclar en primer plano volumen histórico con pendientes urgentes.
4. Evitar cualquier indicador clínico agregado que duplique `/encounters` o `/treatment`.
5. Si una señal no destraba una decisión o no orienta una revisión concreta, debe bajar de jerarquía.
6. Si una señal necesita reglas nuevas costosas o poco claras, no debería liderar la primera evolución.

## Dudas abiertas antes del patch de implementación

1. ¿Conviene sostener el nombre `Panel operativo` o migrar a una identidad más explícita de consola de prioridades?
2. ¿`Pacientes con datos operativos incompletos` debe consolidarse como una sola señal o desagregarse en contacto/domicilio?
3. ¿Existe una regla suficientemente clara para “última visita antigua” como para llevarla a `/admin` sin arbitrariedad?
4. ¿`Edad de pacientes` aporta suficiente valor como para permanecer en la home?
5. ¿Los CTAs globales `Ver pacientes` y `Nuevo paciente` deberían seguir como cierre fijo o pasar a un esquema más contextual?
6. ¿Se quiere una primera evolución conservadora tipo alternativa C, o una dirección más decidida hacia la alternativa A?

## Conclusión

La evolución conceptual recomendada para `/admin` es convertirlo en una **consola breve de prioridad operativa**, no en un dashboard más grande.

La decisión más importante no es agregar información, sino ordenar mejor lo que ya existe y priorizar señales que respondan:

- qué requiere revisión hoy;
- qué está en seguimiento;
- qué es sólo contexto.

En esa dirección:

- `Requiere acción` debe transformarse en el centro del tablero;
- `En seguimiento` debe mostrar la carga clínica viva sin competir con los pendientes;
- `Contexto / histórico` debe quedar claramente degradado;
- `Sin tratamiento iniciado` no debería sobrevivir como KPI protagonista con su nombre actual.

Esa estructura permitiría mejorar claridad, utilidad diaria y percepción de madurez sin inflar la superficie ni romper el enfoque mínimo de `/admin`.
