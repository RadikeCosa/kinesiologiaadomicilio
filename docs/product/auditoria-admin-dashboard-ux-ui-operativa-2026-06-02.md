# Auditoría `/admin` UX/UI, producto y claridad operativa

Fecha: 2026-06-02

## Alcance

Auditoría de la superficie privada `/admin` como tablero inicial de la app clínica privada.

Restricciones respetadas:

- sin implementar cambios;
- sin modificar código;
- sin cambiar UI;
- sin agregar rutas;
- sin cambiar modelo FHIR;
- sin persistir métricas nuevas.

## Diagnóstico ejecutivo

`/admin` cumple hoy una función válida pero limitada: da una lectura rápida de volumen y estados generales, y evita una home completamente vacía. También está alineado con la arquitectura actual porque calcula todo en lectura, no expone FHIR crudo y usa loaders/helpers simples.

El problema principal no es técnico sino conceptual y de producto: el tablero mezcla en el mismo bloque dos niveles distintos de información:

- estado operativo agregado de pacientes;
- estado operativo agregado de solicitudes.

Ambos niveles son legítimos, pero hoy aparecen como seis tarjetas del mismo peso, con copy corto y sin marco explicativo suficiente. Eso hace que varias métricas se lean como si fueran categorías hermanas cuando en realidad responden a unidades diferentes y a momentos distintos del flujo.

La consecuencia es que `/admin` transmite “resumen correcto” pero no termina de responder con claridad:

- qué requiere acción ahora;
- qué está en seguimiento;
- qué es sólo contexto histórico;
- qué diferencia hay entre “sin tratamiento iniciado”, “solicitudes en evaluación” y “aceptadas pendientes de tratamiento”.

Veredicto general:

- **Funciona** como resumen operativo mínimo.
- **No alcanza todavía** como verdadera primera superficie de priorización.
- **Debe seguir siendo principalmente operativo**, no clínico.
- **Necesita más jerarquía conceptual que más métricas**.

## Estado actual confirmado en código

La home `/admin` hoy muestra:

1. Un bloque `Resumen operativo` con:
   - `Pacientes totales`
   - `En tratamiento`
   - `Tratamiento finalizado`
   - `Sin tratamiento iniciado`
   - `Solicitudes en evaluación`
   - `Aceptadas pendientes de tratamiento`
2. Un bloque `Edad de pacientes` con:
   - paciente más joven;
   - paciente más viejo;
   - promedio de edad.
3. Dos CTAs:
   - `Ver pacientes`
   - `Nuevo paciente`

La lógica actual confirma estas reglas:

- `Sin tratamiento iniciado` = `preliminary + ready_to_start`.
- `preliminary` = paciente sin tratamiento activo/finalizado y con datos operativos mínimos incompletos.
- `ready_to_start` = paciente sin tratamiento activo/finalizado pero con datos operativos mínimos suficientes para iniciar tratamiento.
- `Solicitudes en evaluación` = `ServiceRequest.status === "in_review"`.
- `Aceptadas pendientes de tratamiento` = solicitudes `accepted` sin `EpisodeOfCare` vinculado por `incoming-referral`.
- Edad de pacientes se calcula sólo sobre pacientes con tratamiento iniciado o finalizado.

## Qué funciona hoy

### 1. El tablero ya evita una home puramente navegacional

La superficie dejó de ser sólo un menú y ya muestra señal operativa real.

### 2. La separación entre métricas de pacientes y edad es simple de entender

Hay una organización base comprensible en dos bloques, sin ruido visual ni ornamentación.

### 3. Las métricas actuales son baratas y consistentes con la arquitectura

Se derivan desde loaders/read-models existentes, sin persistencia extra ni dashboards materializados.

### 4. Las solicitudes aceptadas pendientes sí tienen valor operativo real

Ese dato se acerca bastante a una pregunta útil de operación: “qué casos ya pasaron evaluación pero todavía no comenzaron atención”.

### 5. La UI todavía no cae en dashboard decorativo

No hay gráficos innecesarios ni indicadores cosméticos. La superficie es austera, lo cual hoy juega a favor.

## Qué no se entiende bien

### 1. “Sin tratamiento iniciado” es demasiado ambigua para ser protagonista

Hoy esa métrica agrupa dos realidades operativamente distintas:

- paciente preliminar, todavía incompleto;
- paciente listo para iniciar tratamiento.

Como tarjeta principal, el nombre oculta una diferencia importante: una parte requiere completar datos; la otra requiere decidir/iniciar.

### 2. Hay mezcla de unidades conceptuales dentro del mismo bloque

`En tratamiento`, `Tratamiento finalizado` y `Sin tratamiento iniciado` son métricas sobre pacientes.

`Solicitudes en evaluación` y `Aceptadas pendientes de tratamiento` son métricas sobre solicitudes.

Como visualmente todas pesan igual, el tablero sugiere falsamente que son categorías del mismo universo.

### 3. El tablero no explicita el embudo operativo

El flujo real del producto es:

1. solicitud;
2. evaluación;
3. aceptación;
4. inicio de tratamiento;
5. seguimiento con visitas;
6. cierre.

Hoy `/admin` no hace visible ese relato. Muestra conteos aislados.

### 4. Falta una capa de “qué requiere atención ahora”

Las tarjetas son descriptivas, pero no distinguen:

- pendiente accionable inmediata;
- seguimiento activo;
- contexto histórico.

### 5. El bloque de edad tiene baja prioridad operativa en la home

No está mal calculado, pero compite por espacio con una señal que, al entrar a `/admin`, suele ser menos urgente que pendientes, activos o huecos operativos.

## Problemas de claridad UX/UI detectados

### Problema A. Igual peso visual para métricas de distinta importancia

Hoy el tablero no marca una diferencia clara entre:

- lo urgente;
- lo importante pero no urgente;
- lo meramente contextual.

### Problema B. Copy corto sin aclaración de semántica

Especialmente en:

- `Sin tratamiento iniciado`
- `Solicitudes en evaluación`
- `Aceptadas pendientes de tratamiento`

Sin microcopy o subtítulo, el usuario debe recordar las reglas del modelo.

### Problema C. Falta de agrupación por categoría operativa

El bloque `Resumen operativo` hoy está ordenado como mosaico de tarjetas, no como lectura de:

- requiere acción;
- en seguimiento;
- historial/contexto.

### Problema D. Los CTA finales no terminan de completar la promesa del tablero

`Ver pacientes` y `Nuevo paciente` son correctos, pero no se conectan con la idea de “qué revisar ahora”. Funcionan como navegación general, no como salida contextual desde las métricas.

## Mapa conceptual de estados operativos

### Flujo recomendado para leer `/admin`

1. **Solicitud en evaluación**
   - existe pedido inicial;
   - todavía no fue aceptado ni descartado;
   - pregunta operativa: “¿hay que revisar esta solicitud?”

2. **Solicitud aceptada pendiente de tratamiento**
   - la solicitud ya se resolvió favorablemente;
   - todavía no existe tratamiento iniciado;
   - pregunta operativa: “¿falta iniciar el tratamiento?”

3. **Paciente preliminar**
   - no tiene tratamiento;
   - tampoco tiene datos mínimos completos para iniciar;
   - pregunta operativa: “¿faltan datos operativos para avanzar?”

4. **Paciente listo para iniciar**
   - no tiene tratamiento activo ni finalizado;
   - sí tiene datos mínimos operativos suficientes;
   - pregunta operativa: “¿está listo para que se inicie tratamiento si corresponde?”

5. **Tratamiento activo**
   - existe `EpisodeOfCare` activo;
   - pregunta operativa: “¿requiere seguimiento, visitas o revisión clínica?”

6. **Tratamiento finalizado**
   - existe tratamiento previo ya cerrado;
   - pregunta operativa: generalmente contexto/histórico, no prioridad inmediata.

### Solapamientos actuales

- `Sin tratamiento iniciado` pisa semánticamente a `preliminary` y `ready_to_start`.
- `Aceptadas pendientes de tratamiento` puede convivir conceptualmente con pacientes `ready_to_start`, pero no son equivalentes.
- `Solicitudes en evaluación` vive en un nivel previo al paciente operativo y debería verse más como embudo que como estado “del paciente”.

## Qué debería priorizar visualmente `/admin`

### Prioridad 1. Requiere acción ahora

Este nivel debería contener sólo indicadores que habilitan una acción concreta y relativamente inmediata.

Candidatos fuertes:

- solicitudes en evaluación;
- aceptadas pendientes de tratamiento;
- pacientes activos sin visitas registradas;
- pacientes con datos operativos incompletos que bloquean inicio.

### Prioridad 2. En seguimiento

Indicadores que muestran carga operativa viva, pero no necesariamente urgencia inmediata.

Candidatos fuertes:

- pacientes en tratamiento;
- pacientes activos con última visita antigua;
- pacientes activos totales.

### Prioridad 3. Histórico o contexto

Indicadores útiles para lectura global, pero no para ordenar el día.

Candidatos:

- tratamientos finalizados;
- pacientes totales;
- estadísticas de edad;
- finalizados recientemente.

## Lectura crítica de las métricas actuales

| Métrica actual | Qué aporta | Problema actual | Recomendación preliminar |
| --- | --- | --- | --- |
| Pacientes totales | contexto de volumen | baja accionabilidad al entrar | mantener sólo como secundaria |
| En tratamiento | muy buena señal de carga actual | falta contexto de si alguno requiere atención | mantener como métrica principal de seguimiento |
| Tratamiento finalizado | aporta contexto histórico | baja urgencia, hoy compite demasiado | degradar a secundaria |
| Sin tratamiento iniciado | captura universo sin episodio | demasiado amplia y semánticamente mezclada | reemplazar o desagregar conceptualmente |
| Solicitudes en evaluación | buena señal de embudo y trabajo pendiente | comparte plano con métricas de paciente | subir protagonismo, pero como bloque de pendientes |
| Aceptadas pendientes de tratamiento | alta accionabilidad | necesita marco conceptual mejor | mantener y reforzar |
| Edad de pacientes | contexto poblacional mínimo | poco relevante en home operativa diaria | mantener sólo si queda claramente secundaria |

## Indicadores candidatos

### Alta prioridad recomendada

- solicitudes pendientes de evaluar;
- solicitudes aceptadas pendientes de iniciar tratamiento;
- pacientes con tratamiento activo;
- pacientes activos sin visitas registradas;
- pacientes con datos operativos incompletos para iniciar tratamiento.

### Prioridad media recomendada

- pacientes activos con última visita antigua;
- pacientes finalizados recientemente;
- pacientes listos para iniciar tratamiento;
- pacientes preliminares.

### Baja prioridad o dudosa para `/admin`

- edad promedio, mínimo y máximo;
- volumen histórico acumulado sin ventana temporal;
- indicadores clínicos agregados complejos;
- gráficos de tendencia si no responden una decisión real.

## Tabla comparativa de métricas y bloques candidatos

| Métrica o bloque propuesto | Qué pregunta responde | Valor operativo | Valor clínico | Valor visual / percepción profesional | Fuente de datos | Complejidad técnica estimada | Riesgo de confusión | Recomendación preliminar |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Solicitudes en evaluación | ¿Qué pedidos iniciales esperan revisión? | Alto | Bajo | Alto si abre el tablero con “pendientes” | `ServiceRequest.status=in_review` | Baja | Bajo | Incluir |
| Aceptadas pendientes de tratamiento | ¿Qué casos ya aprobados no empezaron todavía? | Alto | Bajo | Alto | `ServiceRequest.accepted` + ausencia de `EpisodeOfCare.incoming-referral` | Baja | Medio | Incluir |
| Pacientes con tratamiento activo | ¿Cuántos casos están hoy en seguimiento? | Alto | Medio-bajo | Alto | `EpisodeOfCare.status=active` derivado en estado operativo | Baja | Bajo | Incluir |
| Pacientes activos sin visitas registradas | ¿Qué tratamientos activos aún no tuvieron primera visita? | Alto | Medio | Alto | `EpisodeOfCare` activo + ausencia de `Encounter` del episodio efectivo | Media | Bajo | Incluir en evolución temprana |
| Pacientes activos con última visita antigua | ¿Qué seguimientos podrían estar desactualizados? | Alto | Medio | Alto | `EpisodeOfCare` activo + `Encounter.startedAt` último por episodio | Media | Medio, por umbral temporal | Incluir sólo con regla explícita |
| Pacientes con datos operativos incompletos | ¿Qué casos no pueden iniciar fácilmente? | Alto | Bajo | Medio-alto | `Patient.address`, `phone`, `mainContact.phone`, nombre | Baja | Bajo | Incluir |
| Pacientes listos para iniciar tratamiento | ¿Qué pacientes ya tienen base operativa completa? | Medio | Bajo | Medio | estado `ready_to_start` | Baja | Medio, porque no implica solicitud aceptada | Incluir como secundaria |
| Pacientes preliminares | ¿Qué altas todavía están verdes? | Medio | Bajo | Medio | estado `preliminary` | Baja | Bajo | Incluir sólo si se explica bien |
| Pacientes finalizados recientemente | ¿Qué cierres ocurrieron hace poco? | Medio-bajo | Bajo | Medio | `EpisodeOfCare.status=finished` + `endDate` | Media | Bajo | Secundaria |
| Tratamientos finalizados totales | ¿Cuánto historial cerrado hay? | Bajo para home | Bajo | Medio | estado `finished_treatment` | Baja | Bajo | Secundaria o mover fuera del foco |
| Edad de pacientes | ¿Cuál es el perfil etario general? | Bajo | Bajo | Medio si se quiere contexto poblacional | `Patient.birthDate` | Baja | Bajo | Mantener sólo como contexto lateral |
| Pacientes con contacto operativo incompleto | ¿Qué casos tienen riesgo de coordinación? | Alto | Bajo | Alto | `Patient.phone`, `mainContact.phone` | Baja | Bajo | Incluir o fusionar con datos incompletos |
| Pacientes con domicilio incompleto | ¿Qué casos no tienen dirección operativa para atención? | Alto | Bajo | Medio | `Patient.address` | Baja | Bajo | Incluir dentro de datos incompletos, no aislado |
| Pacientes con marco clínico incompleto | ¿Qué tratamientos activos carecen de contexto clínico base? | Medio | Medio-alto | Medio-alto | contexto clínico de `EpisodeOfCare` | Media | Medio-alto | Posponer o llevar a superficies clínicas |
| Resumen clínico agregado de métricas funcionales | ¿Cómo evolucionan los pacientes a nivel clínico? | Bajo para home | Medio-alto | Alto visualmente, pero riesgoso | `Observation` por visitas/episodios | Media-alta | Alto | No priorizar para `/admin` V1 |

## Valor clínico: qué sí y qué no debería entrar en `/admin`

### Recomendación principal

Mantener `/admin` como tablero **principalmente operativo**.

### Qué información clínica mínima sí podría tener sentido

- pacientes activos sin visitas todavía;
- pacientes activos con seguimiento probablemente atrasado;
- eventualmente, pacientes activos sin marco clínico base cargado.

Estas son señales clínicas sólo en sentido débil. Sirven porque traducen una posible falta de seguimiento o de completitud, no porque resuman evolución terapéutica.

### Qué información clínica conviene evitar en la home

- promedios agregados de dolor, marcha o métricas funcionales;
- tendencias comparativas entre pacientes;
- resúmenes clínicos longitudinales fuera del contexto de cada paciente;
- rankings o gráficos de evolución global.

Motivo: pierden contexto, pueden inducir lectura incorrecta y empujan a `/admin` hacia un pseudo-dashboard clínico que hoy no es el rol de la superficie.

## Valor visual y percepción profesional

La mejora más importante no parece ser “hacerlo más lindo”, sino hacer que se lea como una consola confiable de prioridades.

### Señales que sumarían profesionalidad

- separar visualmente `requiere acción` de `seguimiento` y `contexto`;
- dar más protagonismo a 2-4 señales realmente accionables;
- usar microcopy breve para aclarar reglas de negocio donde la etiqueta sola no alcanza;
- mostrar empty states útiles, no sólo ausencia de datos;
- usar badges/listas cortas cuando sirvan para explicar estado, no para decorar.

### Sobre gráficos

No se recomiendan como primera evolución.

Razones:

- hoy el problema es de jerarquía y semántica, no de visualización numérica;
- los volúmenes parecen relativamente bajos y las métricas son discretas;
- un gráfico podría aumentar la sensación de “dashboard moderno” pero no necesariamente la utilidad real.

### Qué conviene evitar

- mosaicos grandes de KPIs del mismo peso;
- métricas vanidosas;
- indicadores históricos sin pregunta operativa clara;
- señales clínicas agregadas fuera de contexto;
- colorido excesivo que simule prioridad sin una regla de negocio detrás.

## Viabilidad técnica y datos disponibles

### Derivable razonablemente con datos actuales

- solicitudes en evaluación;
- aceptadas pendientes de tratamiento;
- pacientes activos;
- pacientes preliminares;
- pacientes listos para iniciar;
- pacientes finalizados;
- pacientes con datos operativos mínimos incompletos;
- pacientes activos sin visitas registradas;
- pacientes finalizados recientemente;
- pacientes con contacto o domicilio incompleto.

### Derivable con datos actuales pero con costo o cuidado adicional

- pacientes activos con última visita antigua;
- pacientes activos sin contexto clínico base;
- ventanas temporales de cierres recientes;
- cortes más finos de completitud administrativa.

El costo no parece de dominio sino de composición/read-model y potenciales consultas adicionales.

### Métricas que probablemente exigen evolución más profunda o no convienen en esta etapa

- resúmenes clínicos agregados por `Observation`;
- indicadores longitudinales comparativos;
- dashboards con series temporales o gráficos;
- persistencia de métricas precomputadas.

## Coherencia con la arquitectura actual

La siguiente dirección conceptual sería consistente con el proyecto actual:

- mantener `/admin` como superficie privada clínica mínima;
- seguir resolviendo métricas en loaders/read-models;
- no exponer FHIR crudo;
- no persistir métricas derivadas sin necesidad;
- evitar duplicar responsabilidad de `/patients`, `/encounters`, `/treatment` o `/administrative`;
- privilegiar queries batch o derivaciones simples antes que agregaciones complejas;
- evitar N+1 nuevos, especialmente si se agregan señales basadas en `Encounter` u `Observation`.

## Propuesta conceptual de jerarquía de la superficie

### Nivel 1. Requiere acción

Bloque protagonista.

Debería responder:

- qué solicitudes esperan evaluación;
- qué casos aprobados faltan iniciar;
- qué tratamientos activos todavía no tuvieron primera visita;
- qué casos están bloqueados por datos operativos faltantes.

### Nivel 2. En seguimiento

Bloque secundario de carga operativa viva.

Debería responder:

- cuántos pacientes están en tratamiento;
- qué pacientes activos podrían necesitar revisión por antigüedad de última visita.

### Nivel 3. Contexto e histórico

Bloque terciario.

Debería contener:

- pacientes totales;
- tratamientos finalizados;
- eventualmente edad de pacientes.

## Riesgos de sobrediseño

1. Convertir `/admin` en tablero “completo” cuando el producto todavía se apoya en superficies específicas por paciente.
2. Duplicar información clínica que vive mejor en `/encounters` o `/treatment`.
3. Agregar gráficos para compensar problemas semánticos.
4. Introducir demasiadas métricas secundarias y perder foco.
5. Forzar indicadores clínicos agregados que hoy no tienen contexto suficiente.

## Límites recomendados para no inflar el dashboard

- no superar un núcleo de 3 a 5 señales protagonistas;
- no mezclar sin aclaración métricas de pacientes y métricas de solicitudes;
- no incorporar tendencias clínicas agregadas en esta etapa;
- no convertir la home en listado resumido de todo lo que existe en `/patients`;
- no agregar complejidad técnica que exija persistencia, read models materializados o cambios de dominio.

## Recomendación preliminar de producto

La mejor evolución de `/admin` no parece ser “más métricas”, sino una reformulación del tablero alrededor de esta pregunta:

**¿Qué requiere revisión o acción hoy, y qué está simplemente en seguimiento?**

En esa dirección:

- `Solicitudes en evaluación` y `Aceptadas pendientes de tratamiento` deberían ganar protagonismo como embudo operativo;
- `Sin tratamiento iniciado` no debería seguir como métrica protagonista con esa etiqueta actual;
- `En tratamiento` debería quedar como principal señal de seguimiento;
- `Edad de pacientes` debería pasar a contexto secundario o quedar bajo revisión de continuidad.

## Preguntas abiertas para próximos pasos

1. ¿`/admin` debe priorizar acción inmediata aunque pierda algo de contexto estadístico general?
2. ¿Conviene mostrar pacientes `preliminary` y `ready_to_start` por separado, o agruparlos bajo una lógica de “datos pendientes”?
3. ¿La aceptación de solicitud debe verse como el corazón del embudo operativo inicial de la app privada?
4. ¿Existe una regla de negocio clara para definir “última visita antigua” sin introducir arbitrariedad?
5. ¿La edad de pacientes aporta valor real para la home privada diaria o debería degradarse/moverse?
6. ¿Conviene que `/admin` tenga un pequeño bloque “bloqueos operativos” antes que más KPIs?

## Conclusión

Hoy `/admin` es correcto como tablero mínimo, pero todavía comunica mejor “estado general” que “prioridad operativa”.

La principal mejora recomendada es conceptual y de jerarquía:

- separar pendientes de seguimiento;
- explicitar mejor el embudo solicitud → tratamiento → visitas;
- dejar de usar `Sin tratamiento iniciado` como rótulo paraguas protagonista;
- mantener el tablero principalmente operativo y sólo marginalmente clínico.

Eso permitiría aumentar claridad, utilidad percibida y sensación de producto maduro sin caer en complejidad prematura ni en dashboard decorativo.
