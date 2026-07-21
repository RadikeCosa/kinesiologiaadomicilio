# Diseño funcional de documentación clínica de visitas

> Estado: borrador de diseño funcional
> Alcance: flujo piloto de creación de visita, edición posterior de la nota clínica y consumo en resumen compartible e informe de tratamiento.
> Base obligatoria: `docs/product/clinical-documentation-principles.md` y `docs-local/audits/clinical-documentation-field-matrix.md`.

## Propósito

Este documento define cómo debería funcionar, en términos de producto e información, la documentación clínica de una visita para que:

- el profesional no tenga que reescribir el mismo conocimiento en múltiples superficies;
- la nota conserve valor clínico propio y no se convierta en un texto genérico para “llenar campos”;
- la lectura longitudinal del caso siga siendo posible sin desplazar conocimiento al lugar incorrecto;
- los resúmenes compartibles e informes puedan derivarse desde la fuente primaria sin exigir una segunda redacción completa.

No es una especificación visual ni técnica. Tampoco asume que la estructura narrativa actual de siete campos sea la forma correcta final.

## 1. Propósito de una nota de visita

Una nota clínica de visita debería permitir comprender, con rapidez y suficiente precisión clínica:

- qué novedad motivó o contextualizó esa visita puntual;
- qué fue relevante observar en esa sesión;
- qué intervención efectivamente se realizó;
- cómo respondió la persona durante o inmediatamente después de la intervención;
- qué cambió respecto de la visita previa solo si ese cambio es clínicamente significativo;
- qué decisión clínica surge para la continuidad inmediata;
- qué debe tener presente el equipo o la familia hasta la próxima visita.

Una nota de visita no necesita volver a explicar en cada sesión:

- quién es la persona;
- por qué ingresó originalmente al sistema;
- el diagnóstico longitudinal completo;
- los objetivos terapéuticos generales del episodio;
- el plan marco del tratamiento;
- un resumen redactado para terceros.

La nota de visita debe responder primero a la pregunta: "¿Qué pasó clínicamente en esta sesión y qué implica para la continuidad inmediata?".

## 2. Contrato mínimo de documentación

## 2.1 Principio general

"Obligatorio" no significa "siempre escrito manualmente". Una visita puede considerarse suficientemente documentada cuando combina:

- datos que el sistema ya conoce;
- datos estructurados registrados en esa visita;
- narrativa libre solo donde aporta contexto clínico no reducible a estructura;
- omisión explícita de texto repetitivo cuando no hay novedad.

## 2.2 Información obligatoria

### Identificación temporal y operativa de la visita

- Incluye: inicio, cierre y vínculo con paciente y episodio.
- Puede ser conocido por el sistema: sí.
- Puede derivarse automáticamente: no en sentido clínico, sí en cuanto a relaciones y metadatos.
- Puede registrarse como dato estructurado: sí.
- Puede registrarse como narrativa libre: no corresponde.
- Puede omitirse cuando no aporta novedad: no.

### Intervención realizada

- Incluye: qué trabajo terapéutico se efectuó realmente en esa sesión.
- Puede ser conocido por el sistema: no.
- Puede derivarse automáticamente: no.
- Puede registrarse como dato estructurado: parcialmente en el futuro, pero en el piloto debe admitir narrativa.
- Puede registrarse como narrativa libre: sí.
- Puede omitirse cuando no aporta novedad: no; aunque sea continuidad de una línea previa, la sesión debe dejar constancia de qué se hizo.

### Respuesta inmediata o resultado clínico de la sesión

- Incluye: cómo toleró, respondió o cerró la sesión la persona en esa visita.
- Puede ser conocido por el sistema: no.
- Puede derivarse automáticamente: no.
- Puede registrarse como dato estructurado: solo en parte, si existen métricas asociadas.
- Puede registrarse como narrativa libre: sí.
- Puede omitirse cuando no aporta novedad: no del todo; puede ser breve si la respuesta fue esperable y sin incidentes.

### Continuidad inmediata

- Incluye: indicaciones, precauciones o próximo paso hasta la siguiente visita.
- Puede ser conocido por el sistema: no.
- Puede derivarse automáticamente: no.
- Puede registrarse como dato estructurado: no de forma suficiente en el piloto.
- Puede registrarse como narrativa libre: sí.
- Puede omitirse cuando no aporta novedad: solo si no existe ninguna indicación ni decisión puntual nueva.

## 2.3 Información opcional

### Contexto o novedad de llegada

- Incluye: cómo llegó, qué refirió o qué cambió desde la última visita.
- Puede ser conocido por el sistema: no.
- Puede derivarse automáticamente: no.
- Puede registrarse como dato estructurado: no de forma suficiente.
- Puede registrarse como narrativa libre: sí.
- Puede omitirse cuando no aporta novedad: sí.

### Hallazgos relevantes observados

- Incluye: observaciones puntuales con relevancia clínica en esa visita.
- Puede ser conocido por el sistema: no.
- Puede derivarse automáticamente: no.
- Puede registrarse como dato estructurado: a veces, si hay métrica.
- Puede registrarse como narrativa libre: sí.
- Puede omitirse cuando no aporta novedad: sí.

### Cambio clínicamente significativo respecto de visitas previas

- Incluye: mejora, retroceso o diferencia relevante.
- Puede ser conocido por el sistema: parcialmente, cuando hay tendencia objetiva.
- Puede derivarse automáticamente: solo para métricas; no para interpretación clínica completa.
- Puede registrarse como dato estructurado: parcialmente.
- Puede registrarse como narrativa libre: sí.
- Puede omitirse cuando no aporta novedad: sí.

## 2.4 Información condicional

### Métricas objetivas

- Incluye: dolor NRS, TUG, tolerancia de bipedestación, duración de marcha u otras mediciones comparables.
- Deben existir cuando esa medición fue tomada o cuando es relevante para el seguimiento.
- Puede ser conocido por el sistema: no.
- Puede derivarse automáticamente: no.
- Puede registrarse como dato estructurado: sí.
- Puede registrarse como narrativa libre: no como sustituto de la medición, aunque puede interpretarse narrativamente.
- Puede omitirse cuando no aporta novedad: sí, si no se midió o no era clínicamente necesario medir.

### Incidentes, interrupciones o excepciones

- Incluye: caída, descompensación, mala tolerancia, negativa, conducta inesperada, suspensión parcial o total.
- Deben existir cuando ocurrieron.
- Puede ser conocido por el sistema: no.
- Puede derivarse automáticamente: no.
- Puede registrarse como dato estructurado: solo parcialmente.
- Puede registrarse como narrativa libre: sí.
- Puede omitirse cuando no aporta novedad: sí, si no existieron.

### Línea de base reforzada en visita inicial

- Incluye: más contexto evaluativo del habitual para fijar el punto de partida del episodio.
- Debe existir cuando la visita sea inicial o cumpla función de evaluación de arranque.
- Puede ser conocido por el sistema: parcialmente, si ya existe contexto longitudinal.
- Puede derivarse automáticamente: no.
- Puede registrarse como dato estructurado: parcialmente.
- Puede registrarse como narrativa libre: sí.
- Puede omitirse cuando no aporta novedad: no en visita inicial.

## 2.5 Información reservada para excepciones

- Re-explicar el motivo original de consulta completo.
- Re-escribir el diagnóstico longitudinal.
- Re-escribir objetivos terapéuticos generales.
- Re-redactar el plan marco del episodio.
- Convertir la nota en un informe para familia o derivador.

Solo deberían aparecer dentro de la nota si una excepción clínica concreta exige reanclar esa información para entender la sesión.

## 3. Alcance temporal

## 3.1 Instante o medición

Corresponde a `Observation` o a un dato puntual equivalente.

- Ejemplos: TUG, dolor NRS, minutos de bipedestación, duración de marcha.
- No debería quedar absorbido solo como narrativa si requiere comparación longitudinal.

## 3.2 Visita

Corresponde a `Encounter`.

- Ejemplos: contexto puntual de llegada, hallazgos relevantes de esa sesión, intervención, respuesta inmediata, incidentes, indicaciones hasta la próxima visita.

## 3.3 Transición hacia la próxima visita

Sigue perteneciendo a la visita actual, pero orienta la continuidad inmediata.

- Ejemplos: ejercicios indicados, precauciones, próximo foco de trabajo, señal de alarma.
- No debe confundirse con objetivos terapéuticos del episodio.

## 3.4 Episodio completo

Corresponde a `EpisodeOfCare` y `Condition`.

- Ejemplos: diagnóstico de referencia, diagnóstico kinésico, situación funcional inicial, objetivos terapéuticos, estrategia general, cierre del ciclo.
- No debería reingresar como carga normal dentro de cada nota de visita.

## 3.5 Documento o snapshot

Corresponde a un artefacto derivado, persistido o no.

- Ejemplos: resumen compartible, informe de progreso, informe de cierre.
- Debe adaptarse al destinatario y no reemplazar la fuente primaria.

## 3.6 Qué no debería ingresar en la nota de visita

### Pertenece a `Patient`

- identidad estable;
- datos de contacto;
- domicilio;
- red de contacto estable.

### Pertenece a `ServiceRequest`

- motivo inicial de consulta como relato de ingreso;
- quién solicitó la atención;
- contexto administrativo del pedido.

### Pertenece a `EpisodeOfCare`

- objetivos terapéuticos generales;
- plan marco;
- línea de base funcional del episodio;
- cierre global del tratamiento.

### Pertenece a `Condition`

- diagnósticos sostenidos como conocimiento clínico longitudinal.

### Pertenece a `Observation`

- mediciones comparables cuando fueron relevadas como dato estructurado.

### Pertenece a un artefacto derivado

- versiones redactadas para compartir con familia;
- informes narrativos preparados para archivo o derivación;
- resúmenes explicativos orientados a terceros.

## 4. Modelo semántico de la visita

El piloto debería reorganizar la documentación de visita alrededor de categorías semánticas, no necesariamente de los siete campos actuales.

## 4.1 Contexto o novedad de llegada

- Pregunta clínica: qué traía esta visita que merecía ser dicho antes de intervenir.
- Tipo de información: referido puntual, novedad desde la última visita, síntoma, cambio funcional percibido, ausencia de novedad.
- Debe excluir: motivo de consulta original completo, historia del episodio, diagnóstico general.
- Puede quedar vacía: sí, cuando no hubo novedad relevante.
- Relación con métricas objetivas: puede justificar por qué se midió algo o contextualizar la medición.
- Reutilización: puede alimentar una síntesis clínica interna, pero rara vez debería copiarse textual a comunicación para familia.

## 4.2 Hallazgos relevantes

- Pregunta clínica: qué fue clínicamente importante observar o constatar en esta sesión.
- Tipo de información: signos, desempeño observado, hallazgo funcional puntual, respuesta al examen breve.
- Debe excluir: interpretación longitudinal completa y repetición de línea de base.
- Puede quedar vacía: sí, si no hubo hallazgos distintos a los esperables y las métricas ya capturan lo esencial.
- Relación con métricas objetivas: puede acompañar o interpretar `Observation`, no reemplazarla.
- Reutilización: útil para resumen profesional e informe, pero normalmente condensado.

## 4.3 Intervención realizada

- Pregunta clínica: qué se hizo efectivamente durante la sesión.
- Tipo de información: técnicas, ejercicios, entrenamiento, asistencia, educación, ajustes relevantes.
- Debe excluir: plan general del episodio y objetivos de largo plazo.
- Puede quedar vacía: no.
- Relación con métricas objetivas: puede explicar por qué ciertas métricas cambian o por qué no se tomaron.
- Reutilización: alimenta resumen compartible e informe, generalmente reformulado.

## 4.4 Respuesta inmediata

- Pregunta clínica: cómo respondió la persona a la intervención en esta visita.
- Tipo de información: tolerancia, dolor durante o al cierre, fatiga, cooperación, logro inmediato, limitación observada.
- Debe excluir: juicio de evolución longitudinal del episodio salvo que haya un cambio puntual muy relevante.
- Puede quedar vacía: no idealmente; si no hubo novedad, puede resolverse de manera breve.
- Relación con métricas objetivas: puede dialogar con dolor, tolerancia o desempeño medido.
- Reutilización: importante para resúmenes, pero debe adaptarse al destinatario.

## 4.5 Cambio clínicamente significativo

- Pregunta clínica: hubo una diferencia relevante respecto de la visita previa o del estado esperado.
- Tipo de información: mejora, retroceso, nuevo problema, cambio de tolerancia, avance funcional.
- Debe excluir: repetir que "sigue en tratamiento" o volver a narrar todo el episodio.
- Puede quedar vacía: sí, si no hubo cambio significativo.
- Relación con métricas objetivas: puede apoyarse en tendencia, pero no depende exclusivamente de ella.
- Reutilización: muy valioso para informe de progreso y lectura longitudinal.

## 4.6 Decisión o continuidad inmediata

- Pregunta clínica: qué decisión deja esta visita para el período hasta la próxima atención.
- Tipo de información: siguiente foco terapéutico, indicación domiciliaria, monitoreo, precaución, necesidad de reevaluación.
- Debe excluir: objetivos globales o plan general del ciclo.
- Puede quedar vacía: solo si no existe indicación ni ajuste puntual.
- Relación con métricas objetivas: una métrica puede motivar la decisión, pero no la reemplaza.
- Reutilización: alimenta resumen compartible e informe, con distinto nivel de detalle.

## 4.7 Incidentes o excepciones

- Pregunta clínica: ocurrió algo fuera del curso esperado que modifica la interpretación de la visita.
- Tipo de información: evento adverso, interrupción, conducta inesperada, descompensación, imposibilidad de completar.
- Debe excluir: dramatización o texto defensivo sin dato clínico.
- Puede quedar vacía: sí, en la mayoría de las visitas.
- Relación con métricas objetivas: puede coexistir con ellas, pero no depende de ellas.
- Reutilización: debe preservarse en resumen profesional e informe; hacia familia o terceros puede requerir reformulación cuidadosa.

## 5. Distinciones que deben quedar resueltas

### Subjetivo puntual vs motivo de consulta

- El subjetivo puntual describe lo referido en esa visita.
- El motivo de consulta pertenece al ingreso del caso y no debería reabrirse en cada sesión.

### Hallazgo puntual vs situación funcional longitudinal

- El hallazgo puntual es una observación de esa sesión.
- La situación funcional longitudinal pertenece al episodio y debe vivir una sola vez como marco de seguimiento.

### Intervención vs plan general

- La intervención documenta lo ejecutado en esa visita.
- El plan general organiza el tratamiento completo y no debe reescribirse por sesión.

### Respuesta inmediata vs evolución longitudinal

- La respuesta inmediata interpreta la sesión actual.
- La evolución longitudinal surge de múltiples visitas y métricas, y debe leerse a nivel de episodio o informe derivado.

### Tolerancia narrativa vs métricas funcionales

- La tolerancia narrativa expresa una apreciación clínica puntual.
- Las métricas funcionales son datos fuente comparables.
- Ninguna debe reemplazar a la otra.

### Próximo paso inmediato vs objetivos terapéuticos

- El próximo paso inmediato pertenece a la transición entre esta visita y la siguiente.
- Los objetivos terapéuticos pertenecen al episodio.

### Nota clínica interna vs resumen para familia

- La nota interna prioriza precisión clínica y continuidad asistencial.
- El resumen para familia es comunicación derivada, más sintética y adaptada al destinatario.

### Nota clínica interna vs informe profesional

- La nota interna es fuente primaria puntual.
- El informe profesional es un documento derivado que sintetiza un período o cierre.

## 6. Casos normales y excepcionales

## 6.1 Visita habitual sin novedades relevantes

- Información indispensable: intervención realizada, respuesta inmediata breve, continuidad inmediata si corresponde.
- Información que ya conoce el sistema: identidad, episodio, plan general, contexto longitudinal, tiempos de visita, métricas previas.
- Narrativa libre legítima: breve y puntual; puede indicar ausencia de novedades.
- Qué no debería repetirse: motivo inicial, diagnóstico completo, objetivos terapéuticos, situación funcional de base.

## 6.2 Visita con mejora concreta

- Información indispensable: qué mejoró, respecto de qué referencia, qué intervención se realizó, qué decisión surge.
- Información que ya conoce el sistema: mediciones previas, línea de base, contexto del episodio.
- Narrativa libre legítima: interpretación de la mejora y su relevancia clínica.
- Qué no debería repetirse: historia completa del progreso si la mejora puede ubicarse con una frase precisa y métricas asociadas.

## 6.3 Visita con retroceso o nueva dificultad

- Información indispensable: nueva dificultad o retroceso, impacto en la sesión, intervención adaptada, respuesta, precaución o próximo paso.
- Información que ya conoce el sistema: estado previo documentado y métricas anteriores.
- Narrativa libre legítima: explicación clínica puntual del retroceso.
- Qué no debería repetirse: diagnóstico longitudinal completo o texto defensivo redundante.

## 6.4 Visita con incidente

- Información indispensable: qué ocurrió, cuándo afectó la sesión, consecuencia clínica u operativa, decisión inmediata.
- Información que ya conoce el sistema: marco del episodio e identificación de la visita.
- Narrativa libre legítima: descripción precisa del incidente y su manejo.
- Qué no debería repetirse: contexto general del caso salvo que sea indispensable para comprender el evento.

## 6.5 Visita inicial del episodio

- Información indispensable: suficiente evaluación para establecer estado de arranque, intervención inicial si existió, respuesta y continuidad inmediata.
- Información que ya conoce el sistema: datos administrativos, motivo de ingreso, parte del contexto del episodio si ya fue cargado.
- Narrativa libre legítima: mayor densidad evaluativa que en una visita habitual.
- Qué no debería repetirse: duplicación completa del `ServiceRequest` o de información estable del `Patient`.

## 6.6 Visita de cierre o próxima al cierre

- Información indispensable: estado actual relevante, intervención realizada si la hubo, relación con cumplimiento parcial o total, continuidad inmediata o discontinuidad.
- Información que ya conoce el sistema: motivo de cierre definitivo cuando se registre a nivel de episodio, trayectoria previa y métricas acumuladas.
- Narrativa libre legítima: síntesis puntual de la sesión en relación con el cierre.
- Qué no debería repetirse: informe de cierre completo dentro de la nota de esa visita.

## 7. Ejemplos comparativos

Los siguientes ejemplos usan datos ficticios y sanitizados. No son plantillas rígidas.

## 7.1 Visita habitual sin novedades

### Nota excesiva o repetitiva

"Paciente de 78 años en tratamiento kinésico por secuela motora crónica. Continúa con el mismo diagnóstico y objetivos previos. Refiere sentirse igual que siempre. Se realiza sesión según plan establecido con ejercicios habituales. Tolera bien. Se indica continuar igual."

### Nota demasiado pobre

"Sin cambios. Bien."

### Versión breve, precisa y clínicamente suficiente

"Sin novedades referidas desde la visita previa. Se realizó entrenamiento de transferencias y marcha asistida dentro de lo previsto. Buena tolerancia durante la sesión, sin dolor ni fatiga fuera de lo esperable. Continuar con indicaciones domiciliarias habituales."

### Datos estructurados o derivados que acompañan

- `startedAt` y `endedAt`
- `visitStartPunctuality`
- ausencia de nueva métrica si no fue necesaria
- episodio, paciente y profesional ya conocidos por el sistema

## 7.2 Visita con mejora concreta

### Nota excesiva o repetitiva

"Paciente con antecedente de ACV, en tratamiento desde hace varias semanas, con objetivos de mejorar marcha y tolerancia. Hoy se observa una evolución favorable respecto del cuadro basal y de las sesiones previas, dentro del marco del plan general."

### Nota demasiado pobre

"Mejor."

### Versión breve, precisa y clínicamente suficiente

"Refiere mayor seguridad para caminar dentro del domicilio. En la sesión realizó marcha con pausas más cortas y menor asistencia verbal. Mejor tolerancia al esfuerzo respecto de la visita previa. Se mantiene progresión de marcha y control postural."

### Datos estructurados o derivados que acompañan

- `gait_duration_minutes`
- `standing_tolerance_minutes`
- comparación longitudinal derivada de `Observation`

## 7.3 Visita con dolor o retroceso

### Nota excesiva o repetitiva

"Paciente en seguimiento por limitación funcional, que desde el inicio presenta dolor y dificultades generales. En el día de la fecha vuelve a presentar dolor, por lo cual se reconsidera todo el plan terapéutico."

### Nota demasiado pobre

"Dolor. Se trabajó menos."

### Versión breve, precisa y clínicamente suficiente

"Refiere aumento de dolor lumbar desde ayer, con mayor dificultad para incorporarse. Se redujo la carga de ejercicios de pie y se priorizó movilidad asistida y control postural. Persistió molestia moderada al cierre, sin empeoramiento durante la sesión. Reevaluar dolor y tolerancia en próxima visita."

### Datos estructurados o derivados que acompañan

- `pain_nrs_0_10`
- tiempos de visita
- tendencia comparativa de dolor si existiera

## 7.4 Visita con incidente

### Nota excesiva o repetitiva

"Durante la visita se produjo un evento inesperado que obligó a interrumpir el tratamiento, en el contexto del cuadro general del paciente y su evolución, con posterior reevaluación del caso."

### Nota demasiado pobre

"Se suspendió."

### Versión breve, precisa y clínicamente suficiente

"Durante el inicio de ejercicios en bipedestación presentó mareo súbito, por lo que se suspendió la actividad de pie y se completó control en sedestación. Cedió en reposo a los pocos minutos. No se continuó la progresión prevista. Indicar vigilancia de nuevos episodios y reevaluar antes de retomar trabajo en bipedestación."

### Datos estructurados o derivados que acompañan

- registro temporal de la visita
- incidente marcado como excepción narrativa
- ausencia justificada de determinadas métricas o actividades previstas

## 7.5 Visita inicial del episodio

### Nota excesiva o repetitiva

"Paciente derivado para tratamiento domiciliario por dificultad para la marcha, con todos sus antecedentes y motivo de consulta ya conocidos. Se deja constancia nuevamente de su situación general, de sus objetivos de tratamiento y del plan completo."

### Nota demasiado pobre

"Primera visita. Se evalúa."

### Versión breve, precisa y clínicamente suficiente

"Primera visita del episodio. Refiere fatiga al caminar dentro del hogar y necesidad de apoyo para transferencias. Se observa tolerancia reducida a la bipedestación y marcha breve con asistencia. Se inicia evaluación funcional y entrenamiento básico de transferencias. Continuar con mediciones de línea de base y definir progresión inicial en próxima visita."

### Datos estructurados o derivados que acompañan

- métricas de línea de base si fueron tomadas
- `EpisodeOfCare.initialFunctionalStatus` ya cargado o en consolidación
- contexto administrativo y motivo de ingreso ya conocidos por el sistema

## 8. Reutilización posterior

## 8.1 Listado longitudinal de visitas

Debería alimentarse con:

- fecha y duración de la visita;
- una síntesis breve de cambio relevante o ausencia de novedades;
- incidentes si existieron.

No debería copiar:

- toda la narrativa completa de la nota;
- texto pensado para familia.

## 8.2 Tendencia funcional

Debería alimentarse con:

- `Observation` comparables;
- interpretación clínica breve cuando exista cambio significativo.

No debería copiar:

- frases narrativas de tolerancia como si fueran métricas;
- conclusiones longitudinales completas por cada visita.

## 8.3 Resumen compartible

Debería alimentarse con:

- intervención realizada;
- respuesta inmediata;
- indicaciones domiciliarias;
- próximo paso inmediato;
- métricas seleccionadas si aportan claridad.

No debería copiar literalmente:

- subjetivo interno sensible;
- incidentes en bruto sin adaptación de lenguaje;
- razonamiento clínico interno completo.

## 8.4 Informe de progreso

Debería alimentarse con:

- cambios clínicamente significativos;
- tendencia de métricas;
- patrón de intervenciones;
- continuidad del episodio.

No debería copiar literalmente:

- todas las notas de visita una por una;
- frases de baja señal como "tolera bien" repetidas sin contexto.

## 8.5 Informe de cierre

Debería alimentarse con:

- trayectoria resumida del episodio;
- logros o límites alcanzados;
- cierre canónico del episodio;
- datos objetivos comparables cuando existan.

No debería copiar literalmente:

- la nota de la última visita como si fuera el cierre completo;
- texto interno dirigido a continuidad inmediata cuando ya no habrá próxima visita.

## 9. Criterios de calidad

Una futura propuesta de diseño debería evaluarse contra estos criterios:

- precisión clínica: permite entender qué ocurrió sin ambiguedad relevante;
- ausencia de repetición: evita reescribir contexto que ya vive en otra entidad;
- claridad temporal: distingue visita, transición inmediata, episodio y documento derivado;
- capacidad de registrar excepciones: no obliga a forzar incidentes dentro de campos normales;
- facilidad para releer varias visitas: permite identificar cambios y continuidad sin leer bloques redundantes;
- reutilización sin reescritura: alimenta resúmenes e informes desde la fuente primaria;
- trazabilidad hacia la fuente primaria: cada dato importante conserva su dueño canónico;
- riesgo de pérdida de información: no simplifica tanto que se pierda razonamiento clínico útil;
- riesgo de producir texto genérico sin valor: no incentiva frases vacías solo para completar;
- esfuerzo operativo del profesional: reduce carga manual sin empobrecer la nota;
- convivencia entre narrativa y medición: no obliga a elegir entre texto clínico y dato objetivo;
- legibilidad longitudinal: hace visible qué cambió y qué continúa.

## 10. Decisiones abiertas

Las siguientes decisiones siguen abiertas y requieren validación profesional o pruebas de uso:

- si la nota de visita debe conservar una categoría explícita de "contexto de llegada" o si esa información puede vivir solo cuando hay novedad;
- si "hallazgos relevantes" y "respuesta inmediata" deben permanecer separados o si en la práctica clínica conviene unificarlos bajo una sola interpretación breve;
- cuánto detalle necesita la intervención para seguir siendo útil sin transformarse en una lista operativa excesiva;
- cuándo una ausencia de novedad justifica una nota muy breve y cuándo esa brevedad empieza a volverse insuficiente;
- cómo distinguir, en uso real, entre cambio clínicamente significativo y simple continuidad esperable;
- qué incidentes o excepciones merecen una categoría dedicada y cuáles pueden resolverse como narrativa dentro de la visita;
- hasta dónde el resumen compartible puede reformular lenguaje sin empezar a introducir una verdad paralela;
- hasta dónde el informe profesional puede agregar síntesis propia sin compensar vacíos de la fuente primaria;
- qué métricas objetivas conviene considerar "habituales pero no obligatorias" para no introducir rigidez artificial;
- si la visita inicial del episodio necesita un contrato mínimo distinto del de una visita de seguimiento habitual.

## Síntesis de diseño

La visita debería tratarse como una unidad clínica puntual con seis responsabilidades posibles:

- registrar el contexto puntual solo cuando aporta novedad;
- capturar hallazgos relevantes de esa sesión;
- dejar constancia de la intervención realizada;
- interpretar la respuesta inmediata;
- marcar cambios significativos solo cuando existan;
- orientar la continuidad inmediata, incluyendo excepciones si ocurrieron.

Lo que pertenece al episodio, a la identidad del paciente, al ingreso del caso o a documentos derivados no debería volver a pedirse como carga narrativa normal de cada visita. Si el sistema logra sostener esa frontera, la nota clínica puede ser más breve, más confiable y más reutilizable sin perder valor profesional.
