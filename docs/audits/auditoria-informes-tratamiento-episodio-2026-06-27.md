# Auditoría — informes de tratamiento / informes de episodio

> Estado: vigente para definir el próximo patch
> Fecha: 2026-06-27
> Alcance: audit de contrato, UX y dirección técnica. No implementa cambios funcionales.

## 1. Resumen ejecutivo

La app ya tiene un patrón claro para texto clínico compartible a nivel visita: un read model server-side, una composición derivada, advertencias de completitud y un textarea editable local sin persistencia. A nivel tratamiento, el lugar natural del nuevo informe no es `Gestión clínica`, sino `Tratamiento`, porque hoy `/treatment` ya concentra el contexto longitudinal del ciclo y el cierre de `EpisodeOfCare`, mientras que `/encounters` consume ese contexto en modo lectura y opera sobre visitas puntuales.

La recomendación principal es:

- Fase 1: informe derivado y editable localmente, sin persistencia FHIR, con superficie propia bajo `Tratamiento`.
- Superficie recomendada: nueva subruta de tratamiento, por ejemplo `/admin/patients/[id]/treatment/report` o equivalente, no modal en `/encounters`.
- Modos recomendados:
  - informe parcial/progreso para ciclo activo;
  - informe de cierre para ciclo finalizado o inmediatamente posterior al cierre.
- Persistencia recién en Fase 2 si aparece una necesidad operativa real de guardar el artefacto dentro del repo clínico.

La opción que mejor respeta el alcance incremental del proyecto es no persistir el informe en fase 1 y, si más adelante se decide persistir, preferir `DocumentReference` por encima de `Composition`, `DiagnosticReport` o texto largo en `EpisodeOfCare.extension[]`.

## 2. Estado actual relevante encontrado en código

### 2.1 Superficies y responsabilidades actuales

- [`src/app/admin/patients/[id]/treatment/page.tsx`](/home/ramiro/dev/kinesiologiaadomicilio/src/app/admin/patients/[id]/treatment/page.tsx)
  - concentra inicio de tratamiento, estado del ciclo, contexto longitudinal editable, atajos y cierre formal del tratamiento;
  - muestra conteo de sesiones del episodio activo;
  - renderiza historial compacto de ciclos cerrados.
- [`src/app/admin/patients/[id]/encounters/page.tsx`](/home/ramiro/dev/kinesiologiaadomicilio/src/app/admin/patients/[id]/encounters/page.tsx)
  - concentra gestión clínica de visitas;
  - consume el contexto del ciclo en modo read-only;
  - muestra tendencia funcional, estadísticas agregadas y lista de visitas;
  - expone el resumen compartible por visita, no por episodio.

### 2.2 Patrón existente para resumen compartible de visita

- Read model:
  - [`src/features/visit-share-report/visit-share-report.read-model.ts`](/home/ramiro/dev/kinesiologiaadomicilio/src/features/visit-share-report/visit-share-report.read-model.ts)
  - carga `Patient`, `Encounter`, `EpisodeOfCare` efectivo, `Observation` y `Practitioner`;
  - devuelve un contexto saneado, sin FHIR crudo ni datos administrativos innecesarios para compartir.
- Composición:
  - [`src/features/visit-share-report/visit-share-report.composer.ts`](/home/ramiro/dev/kinesiologiaadomicilio/src/features/visit-share-report/visit-share-report.composer.ts)
  - genera `initialText`, secciones incluidas/omitidas y warnings;
  - omite bloques vacíos;
  - no persiste el texto.
- Completitud:
  - [`src/features/visit-share-report/visit-share-report.completeness.ts`](/home/ramiro/dev/kinesiologiaadomicilio/src/features/visit-share-report/visit-share-report.completeness.ts)
  - clasifica `ready`, `usable_with_warnings` o `insufficient`.
- UI:
  - [`src/app/admin/patients/[id]/encounters/components/VisitShareReportPanel.tsx`](/home/ramiro/dev/kinesiologiaadomicilio/src/app/admin/patients/[id]/encounters/components/VisitShareReportPanel.tsx)
  - carga el texto on demand;
  - deja editar localmente;
  - permite regenerar, copiar y abrir WhatsApp;
  - explicita que no reemplaza la nota clínica interna.

### 2.3 Contexto longitudinal ya disponible en tratamiento

- [`src/app/admin/patients/[id]/components/TreatmentClinicalContextForm.tsx`](/home/ramiro/dev/kinesiologiaadomicilio/src/app/admin/patients/[id]/components/TreatmentClinicalContextForm.tsx)
  - ya modela cinco campos longitudinales:
    - diagnóstico médico de referencia;
    - diagnóstico kinésico;
    - situación funcional al inicio;
    - objetivos terapéuticos;
    - plan marco.
  - cada campo se guarda por separado.
- [`src/app/admin/patients/[id]/clinical-context.ts`](/home/ramiro/dev/kinesiologiaadomicilio/src/app/admin/patients/[id]/clinical-context.ts)
  - hidrata textos de diagnósticos desde `Condition`;
  - combina eso con extensiones de `EpisodeOfCare`.
- [`src/infrastructure/mappers/episode-of-care/episode-of-care-read.mapper.ts`](/home/ramiro/dev/kinesiologiaadomicilio/src/infrastructure/mappers/episode-of-care/episode-of-care-read.mapper.ts)
  - ya lee `closureReason`, `closureDetail`, `diagnosisReferences` y `clinicalContext`.
- [`src/infrastructure/mappers/episode-of-care/episode-of-care-write.mapper.ts`](/home/ramiro/dev/kinesiologiaadomicilio/src/infrastructure/mappers/episode-of-care/episode-of-care-write.mapper.ts)
  - ya escribe contexto clínico en `EpisodeOfCare.extension[]`;
  - ya escribe cierre en extensiones locales de `EpisodeOfCare`.

### 2.4 Datos agregados de visitas ya disponibles

- [`src/app/admin/patients/[id]/encounters/data.ts`](/home/ramiro/dev/kinesiologiaadomicilio/src/app/admin/patients/[id]/encounters/data.ts)
  - resuelve `effectiveEpisode`;
  - filtra `Encounter` por `episodeOfCareId`;
  - adjunta `functionalObservations`;
  - calcula estadísticas agregadas;
  - arma tendencia funcional.
- [`src/domain/encounter/encounter-stats.ts`](/home/ramiro/dev/kinesiologiaadomicilio/src/domain/encounter/encounter-stats.ts)
  - ya ofrece:
    - cantidad de visitas del tratamiento;
    - última visita;
    - tiempo a primera visita desde inicio del episodio;
    - frecuencia promedio;
    - duración promedio;
    - tiempo total registrado;
    - puntualidad agregada.
- [`src/app/admin/patients/[id]/encounters/functional-trend.ts`](/home/ramiro/dev/kinesiologiaadomicilio/src/app/admin/patients/[id]/encounters/functional-trend.ts)
  - ya ofrece últimas métricas y delta respecto de la medición previa por código funcional.

### 2.5 Cierre de tratamiento actual

- [`src/app/admin/patients/[id]/components/FinishEpisodeOfCareForm.tsx`](/home/ramiro/dev/kinesiologiaadomicilio/src/app/admin/patients/[id]/components/FinishEpisodeOfCareForm.tsx)
  - hoy solo pide fecha, motivo y detalle opcional.
- [`src/app/admin/patients/[id]/actions/finish-episode-of-care.action.ts`](/home/ramiro/dev/kinesiologiaadomicilio/src/app/admin/patients/[id]/actions/finish-episode-of-care.action.ts)
  - valida que exista episodio activo;
  - valida fecha no futura y no anterior al inicio;
  - finaliza `EpisodeOfCare`;
  - no genera ningún informe.

### 2.6 Documentación activa alineada

- `docs/fuente-de-verdad-operativa.md`
  - declara que el resumen compartible de visita es derivado y efímero;
  - declara que el contexto longitudinal del ciclo se edita en `/treatment` y se consume read-only en `/encounters`.
- `docs/fhir/README.md`
  - declara que `Communication`, `DocumentReference` y `Composition` fueron evaluados, pero hoy no forman parte del runtime vigente.

## 3. Modelo conceptual recomendado

### 3.1 Entidad conceptual propuesta

El nuevo artefacto conviene modelarlo primero como:

- `TreatmentReportContext`
  - contexto server-side derivado del ciclo;
- `TreatmentReportCompositionResult`
  - texto inicial + metadata de completitud;
- `TreatmentReportMode`
  - `progress`
  - `closure`

No conviene introducir todavía una entidad persistida de dominio tipo `TreatmentReport` si en fase 1 no se va a guardar.

### 3.2 Regla de ownership

El ownership del informe debe quedar en `Tratamiento`, no en `Gestión clínica`, porque:

- el informe resume el ciclo, no una visita;
- depende del contexto longitudinal ya editado en `/treatment`;
- su relación con el cierre pertenece al lifecycle de `EpisodeOfCare`;
- poner el editor en `/encounters` mezclaría visita puntual con síntesis longitudinal.

### 3.3 Regla de selección de episodio

Para esta funcionalidad no alcanza con depender siempre de `effectiveEpisode = activeEpisode ?? mostRecentEpisode`.

Recomendación:

- el contrato del informe debe aceptar `episodeId` explícito;
- para informe parcial, el default puede ser el episodio activo;
- para informe de cierre, el default puede ser el último episodio finalizado solo cuando no haya ambigüedad;
- para historial o futuras aperturas desde ciclos cerrados, debe usarse `episodeId`.

Esto evita drift cuando un paciente cierra un ciclo y luego inicia otro.

## 4. Propuesta UX

### 4.1 Dónde debería vivir la nueva superficie

Opción recomendada:

- nueva subruta dentro de tratamiento, por ejemplo:
  - `/admin/patients/[id]/treatment/report`
  - con `mode=progress|closure`
  - y `episodeId` cuando haga falta.

Motivos:

- conserva la separación entre `Tratamiento` y `Gestión clínica`;
- evita seguir cargando la página principal de `/treatment`, que ya tiene estado, contexto, atajos, cierre e historial;
- escala mejor si luego se suma persistencia, historial de informes o exportación;
- mantiene el patrón arquitectónico route-local.

Opciones no recomendadas como principal:

- panel inline en `/encounters`
  - mezcla responsabilidades;
  - arrastra a `Gestión clínica` una síntesis que no le pertenece.
- modal global
  - queda chica para un artefacto con varias secciones, warnings y textarea extenso.
- inline en `/treatment`
  - viable solo como microfase, pero la pantalla ya está cerca del límite de densidad útil.

### 4.2 Diferencias de UX entre informe parcial e informe de cierre

Informe parcial / progreso:

- disponible solo cuando hay episodio activo;
- foco en estado actual, evolución del ciclo, visitas registradas y próximos pasos;
- CTA sugerida en `/treatment`: `Preparar informe de progreso`;
- no debería pedir motivo de cierre.

Informe de cierre:

- disponible cuando el episodio ya está finalizado o inmediatamente después del cierre;
- foco en período completo, síntesis de evolución, métricas finales, motivo de cierre y continuidad sugerida;
- CTA sugerida:
  - antes de finalizar: no bloquear el cierre con este paso;
  - después de finalizar: `Preparar informe de cierre`.

### 4.3 Interacción recomendada dentro de la nueva ruta

Estructura sugerida:

- bloque superior read-only con datos fuente del ciclo;
- badge de completitud similar al resumen de visita;
- warnings de dato faltante;
- textarea de `Texto final editable`;
- acciones locales:
  - `Regenerar desde datos`
  - `Copiar`
  - opcional futuro: `Descargar texto`

No recomendaría en fase 1:

- envío directo por WhatsApp;
- guardado interno;
- firma electrónica formal;
- PDFs persistidos.

## 5. Propuesta técnica/FHIR

### 5.1 Qué datos pueden obtenerse hoy sin tocar dominio/FHIR

Disponibles hoy con composición de read model:

- paciente
  - nombre completo;
  - DNI opcional;
  - edad;
  - sexo y otros datos administrativos si hicieran falta, aunque no conviene compartirlos por defecto.
- tratamiento / `EpisodeOfCare`
  - `id`;
  - `status`;
  - `startDate`;
  - `endDate`;
  - `serviceRequestId`;
  - `closureReason`;
  - `closureDetail`.
- contexto clínico longitudinal
  - diagnóstico médico de referencia;
  - diagnóstico kinésico;
  - situación funcional inicial;
  - objetivos terapéuticos;
  - plan marco.
- visitas / `Encounter`
  - lista de visitas del episodio;
  - fecha de primera y última visita;
  - duración y puntualidad;
  - texto clínico estructurado por visita;
  - cantidad total de visitas del ciclo.
- métricas funcionales / `Observation`
  - últimas mediciones por código;
  - delta respecto de medición previa;
  - serie por visita si se quisiera resumir.
- profesional firmante / `Practitioner`
  - nombre;
  - rol;
  - matrícula;
  - `signatureDisplay`.
- referencia de solicitud
  - si el episodio está vinculado a `ServiceRequest`, puede recuperarse con repos existentes para agregar motivo o solicitante sin tocar FHIR.

### 5.2 Qué datos faltan hoy y requerirían cambios

Faltan hoy, y exigirían cambios de read model o dominio:

- un read model dedicado para informe de episodio;
- un composer dedicado para informe de tratamiento;
- un estado explícito de completitud a nivel tratamiento;
- una nota libre del profesional a nivel informe si se quisiera persistir;
- un texto final persistido del informe;
- una noción de tipo de informe persistido:
  - progreso;
  - cierre.

Si además se quisiera enriquecer el contenido con más semántica, harían falta cambios menores de lectura:

- exponer `recordedAt` o `clinicalStatus` de diagnósticos desde `Condition`;
- exponer el detalle de la `ServiceRequest` vinculada al episodio dentro del read model del informe;
- soportar carga exacta por `episodeId` en vez de depender del episodio efectivo cuando el caso lo requiera.

### 5.3 Secciones recomendadas para el informe

Propuesta base:

1. Encabezado del informe
   - tipo: progreso o cierre;
   - paciente;
   - período del tratamiento.
2. Estado del tratamiento
   - activo/finalizado;
   - fecha de inicio;
   - fecha de cierre y motivo si corresponde.
3. Contexto clínico longitudinal
   - diagnóstico médico;
   - diagnóstico kinésico;
   - situación funcional inicial;
   - objetivos;
   - plan marco.
4. Resumen agregado de visitas
   - cantidad de sesiones;
   - primera y última visita;
   - frecuencia promedio;
   - duración promedio/total;
   - puntualidad si existe.
5. Métricas funcionales
   - últimas métricas registradas;
   - delta contra registro previo cuando exista.
6. Síntesis profesional
   - nota libre editable.
7. Continuidad / cierre
   - en progreso: foco de trabajo y próximos pasos;
   - en cierre: motivo, resultado global y continuidad sugerida.
8. Firma profesional
   - texto derivado del `Practitioner`.
9. Texto final editable
   - bloque único para copiar/compartir.

### 5.4 Qué partes deberían ser read-only y cuáles editables

Read-only:

- identidad mínima del paciente;
- datos del episodio;
- diagnósticos leídos;
- contexto clínico persistido;
- métricas agregadas;
- firma profesional derivada;
- motivo/detalle de cierre ya persistidos.

Editables en fase 1:

- nota libre del profesional dentro de la experiencia de armado;
- texto final del informe.

No recomendaría editar en esa misma pantalla:

- diagnósticos;
- objetivos;
- plan marco;
- motivo de cierre;
- detalle de cierre.

Esos datos ya tienen superficie propia y duplicar edición acá aumentaría drift.

### 5.5 Persistencia en fase 1

No recomendada.

Razones:

- ya existe un patrón aceptado de texto derivado/efímero;
- baja el costo del primer patch;
- evita abrir demasiado pronto un problema de versionado clínico;
- respeta mejor el carácter incremental y no-EHR del proyecto.

### 5.6 Si luego se recomienda persistencia: evaluación FHIR

#### Opción recomendada si se persiste: `DocumentReference`

Pros:

- separa el artefacto documental del estado operativo de `EpisodeOfCare`;
- soporta progreso y cierre como documentos distintos;
- admite versionado o múltiples documentos por ciclo;
- permite referenciar `Patient`, `EpisodeOfCare` y `Practitioner`;
- mantiene el cierre operativo de `EpisodeOfCare` pequeño y claro.

Contras:

- requiere nuevo repo/mapper/read model;
- obliga a definir formato de contenido y estrategia de búsqueda.

#### Opción descartada para esta fase: `Composition`

Motivos:

- semánticamente más pesada;
- arrastra una noción de documento clínico formal más cercana a un EHR;
- exigiría resolver más estructura, secciones, author/attester y lifecycle documental.

#### Opción descartada: `DiagnosticReport`

Motivos:

- el problema no es un estudio diagnóstico;
- la app no está modelando este flujo como resultado diagnóstico ni como batería diagnóstica formal.

#### Opción descartada salvo metadata mínima: `EpisodeOfCare.extension[]`

Motivos:

- ya se usa bien para contexto y cierre breve;
- no conviene cargar ahí texto largo editable;
- mezcla estado del ciclo con artefacto narrativo;
- complica merges y futuras lecturas;
- no resuelve bien versionado ni múltiples informes.

#### Alternativa secundaria: `Communication`

Solo tendría sentido si el objetivo real fuera auditar un mensaje efectivamente enviado. Para “guardar un informe clínico de tratamiento” es menos claro que `DocumentReference`.

## 6. Alternativas descartadas y motivos

### 6.1 Hacer todo en `/encounters`

Descartada porque:

- confunde ciclo con visita;
- rompe la separación entre `Gestión clínica` y `Tratamiento`;
- empuja contexto longitudinal a una superficie que hoy es consumidora, no dueña.

### 6.2 Acoplar el informe al formulario de cierre y volverlo obligatorio

Descartada para fase 1 porque:

- mezcla cambio de estado operativo con redacción documental;
- si falla el informe, complica una acción que hoy es simple;
- aumenta la fricción del cierre sin validar todavía la necesidad real.

### 6.3 Reutilizar `closureDetail` como informe de cierre

Descartada porque:

- `closureDetail` hoy es una justificación breve del cierre;
- no debería absorber una síntesis clínica longitudinal;
- mezclar ambos conceptos generaría duplicación semántica.

### 6.4 Persistir el texto largo en `EpisodeOfCare.note[]`

Descartada porque:

- el propio repo ya documenta problemas de roundtrip con `note[]` para otros usos;
- sería débil como contrato para una funcionalidad nueva.

## 7. Plan de implementación por fases

### Fase 1 mínima

Objetivo:

- generar informe derivado y editable localmente, sin persistencia.

Alcance:

- nueva subruta bajo `Tratamiento`;
- loader dedicado por `patientId + episodeId/mode`;
- composer dedicado;
- warnings/completitud;
- textarea editable;
- copiar/regenerar;
- sin WhatsApp, sin guardado.

Contrato sugerido:

- `progress` para ciclo activo;
- `closure` para ciclo finalizado;
- `episodeId` explícito cuando aplique.

### Fase 2 persistencia / compartir

Objetivo:

- guardar el artefacto si el uso real lo justifica.

Alcance recomendado:

- persistencia con `DocumentReference`;
- guardar metadata mínima:
  - `patientId`
  - `episodeId`
  - `mode`
  - `createdAt`
  - `author/practitioner`
- diferenciar:
  - borrador generado;
  - versión final revisada.

Integración posible:

- `Finalizar tratamiento y abrir informe de cierre`
- o `Finalizar tratamiento` seguido de CTA a informe.

### Fase 3 mejoras opcionales

- historial de informes por episodio;
- exportación a PDF o impresión;
- registro opcional de destinatario/canal compartido;
- plantillas diferenciadas por progreso/cierre;
- snapshot explícito de métricas para evitar drift visual frente a datos posteriores.

## 8. Archivos probablemente afectados

Si luego se implementa, el patch probablemente tocaría:

- nueva ruta:
  - `src/app/admin/patients/[id]/treatment/report/page.tsx`
- nuevos componentes route-locales:
  - panel/editor del informe;
  - cards de fuente y completitud.
- nuevo feature:
  - `src/features/treatment-report/`
  - `treatment-report.read-model.ts`
  - `treatment-report.composer.ts`
  - `treatment-report.types.ts`
  - `treatment-report.completeness.ts`
- loaders/actions existentes:
  - `src/app/admin/patients/[id]/data.ts`
  - quizá una action tipo `loadTreatmentReportAction`
- posible integración de navegación:
  - `src/app/admin/patients/[id]/treatment/page.tsx`
  - opcional CTA secundaria desde `src/app/admin/patients/[id]/encounters/page.tsx`
- documentación:
  - `docs/fuente-de-verdad-operativa.md`
  - `docs/fhir/README.md`
  - `docs/README.md`
  - `README.md` solo si cambia el resumen visible del repo.

Si más adelante hubiera persistencia:

- nuevo repo/mapper FHIR para `DocumentReference`;
- tests FHIR asociados.

## 9. Tests recomendados

### Si se implementa fase 1

- read model:
  - carga exacta del episodio seleccionado;
  - no mezcla visitas de otros ciclos;
  - adjunta diagnósticos, contexto, stats, métricas y firmante;
  - no expone FHIR crudo en UI.
- composer:
  - compone progreso y cierre con bloques distintos;
  - omite secciones vacías;
  - no inyecta teléfono, dirección o DNI en el texto compartible por defecto;
  - separa claramente texto derivado vs dato fuente.
- action server:
  - valida `patientId`, `episodeId` y `mode`;
  - falla si el episodio no pertenece al paciente;
  - falla si no hay datos mínimos suficientes.
- UI route:
  - muestra CTA correcta según episodio activo/finalizado;
  - renderiza warnings;
  - conserva edición local y regeneración.

### Si se implementa integración con cierre

- no bloquea el cierre cuando el informe no se usa;
- no duplica `closureReason`/`closureDetail`;
- genera modo `closure` sobre el episodio correcto.

### Si se implementa persistencia futura

- mapper/repo `DocumentReference`;
- roundtrip de contenido y referencias;
- lectura por `episodeId`;
- versionado o coexistencia de múltiples informes por ciclo.

## 10. Documentación que habría que actualizar si se implementa

- `docs/fuente-de-verdad-operativa.md`
  - nueva responsabilidad dentro de `Tratamiento`;
  - aclarar si el informe sigue siendo derivado o si pasa a persistirse.
- `docs/fhir/README.md`
  - solo si entra un recurso nuevo como `DocumentReference`.
- `docs/README.md`
  - si esta auditoría sigue guiando el patch siguiente, referenciarla como auditoría vigente;
  - cuando quede absorbida por implementación, moverla a `docs/archive/audits/`.
- `docs/checklist-sincronizacion-doc-codigo.md`
  - no requiere cambio salvo que aparezca una convención nueva de persistencia.
- `README.md`
  - solo si el alcance visible del case study cambia de manera material.

## 11. Riesgos y decisiones pendientes

### Riesgos

- privacidad
  - incluir DNI, teléfono, dirección o datos del contacto principal en el texto final eleva el riesgo de sobreexposición;
  - conviene que el texto compartible salga minimalista por defecto.
- drift clínico
  - si el texto final se persiste y luego cambian diagnósticos, contexto o métricas, puede quedar desfasado del dato fuente;
  - por eso fase 1 sin persistencia reduce riesgo.
- duplicación semántica
  - duplicar `closureDetail`, objetivos o plan en múltiples superficies editables generaría conflicto de fuente de verdad.
- selección incorrecta del ciclo
  - apoyarse solo en `effectiveEpisode` puede generar informes del ciclo equivocado cuando exista un nuevo tratamiento activo.
- sobredimensionamiento del producto
  - `Composition`, PDFs formales o flujos documentales complejos empujarían al repo hacia una historia clínica más formal de lo que hoy declara.

### Decisiones pendientes

1. Nombre visible final:
   - `Informe de progreso`
   - `Informe de tratamiento`
   - `Informe de cierre`
2. Si el texto compartible debe pensarse para:
   - médico derivante;
   - familia/cuidador;
   - uso mixto con revisión manual.
3. Si fase 1 debe permitir solo copiar texto o también descargarlo localmente.
4. Si el informe de cierre debe abrirse:
   - después de cerrar;
   - o desde un CTA paralelo no acoplado al cierre.

## Recomendación final

La opción más consistente con el estado actual del repo es:

- nueva subruta bajo `Tratamiento`;
- informe derivado y editable localmente;
- dos modos: progreso y cierre;
- `episodeId` explícito en el contrato;
- sin persistencia en fase 1;
- si luego aparece necesidad real de guardar, avanzar con `DocumentReference`.

Eso reutiliza el patrón ya probado del resumen compartible de visita, mantiene separación de dominios, evita inflar `EpisodeOfCare` con texto largo y no empuja al proyecto a una semántica de EHR completo antes de tiempo.
