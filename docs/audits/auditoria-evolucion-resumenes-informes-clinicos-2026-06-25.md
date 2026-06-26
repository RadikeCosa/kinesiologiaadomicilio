# Auditoría exploratoria — evolución de resúmenes e informes clínicos

> Estado: exploratoria, sin implementación
> Fecha: 2026-06-25
> Alcance: producto, arquitectura y FHIR R4 para la evolución de la funcionalidad actual de resúmenes/informes en la app clínica privada

## 1. Diagnóstico del estado actual

### Conclusión corta

El producto hoy ya separa bastante bien tres capas distintas:

- registro clínico estructurado de una visita;
- contexto clínico longitudinal del ciclo de tratamiento;
- texto derivado y compartible orientado a paciente/familia/cuidador.

La funcionalidad actual de resumen compartible no es un artefacto clínico persistido. Es un texto efímero derivado desde datos ya persistidos, editable solo en UI, copiable y compartible por WhatsApp. Esa separación hoy evita mezclar comunicación familiar con historia clínica formal.

### Qué está confirmado en código

- La nota clínica de la visita vive en `Encounter.extension[]` y se modela como `clinicalNote` con campos estructurados como `subjective`, `objective`, `intervention`, `assessment`, `tolerance`, `homeInstructions` y `nextPlan`.
- El contexto clínico longitudinal del ciclo activo vive en `EpisodeOfCare`, combinado con `Condition` para diagnóstico médico de referencia y diagnóstico kinésico.
- Las métricas funcionales se persisten como `Observation` asociadas a `Encounter`.
- El resumen compartible se genera en tiempo de lectura desde `Encounter` + `Observation` + `Practitioner`, no se guarda como recurso propio y no modifica FHIR.
- El panel de UI advierte explícitamente que el texto “no reemplaza la nota clínica interna”.
- Las ediciones del resumen son locales al textarea. Regenerar reemplaza esas ediciones con un nuevo texto derivado de datos persistidos.
- El resumen compartible omite deliberadamente DNI, dirección, teléfono y diagnósticos, lo que reduce exposición de datos administrativos o clínicos en una comunicación familiar.

### Lectura de necesidad emergente

La necesidad que empieza a aparecer no parece ser una sola. Hay al menos cuatro:

1. Trazabilidad de textos compartidos.
2. Recuperación de resúmenes o informes anteriores.
3. Producción de informes clínicos más formales que el resumen familiar.
4. Consolidación longitudinal de información clínica útil para reevaluaciones o cierres.

El riesgo principal sería intentar resolver las cuatro con un único artefacto.

## 2. Mapa de archivos y responsabilidades

### Superficies y loaders

- `src/app/admin/patients/[id]/encounters/page.tsx`
  Dueña de `Gestión clínica`; muestra contexto del ciclo, tendencia funcional, stats y listado de visitas.
- `src/app/admin/patients/[id]/encounters/data.ts`
  Compone la lectura clínica de la pantalla a partir de paciente, `EpisodeOfCare`, `Encounter` y `Observation`.
- `src/app/admin/patients/[id]/encounters/new/page.tsx`
  Entry point de registro de visita.
- `src/app/admin/patients/[id]/encounters/components/EncounterCreateForm.tsx`
  Captura fecha/hora, puntualidad operativa, nota clínica estructurada y métricas funcionales.
- `src/app/admin/patients/[id]/treatment/page.tsx`
  Dueña del marco clínico longitudinal del ciclo activo y del historial compacto de ciclos cerrados.
- `src/app/admin/patients/[id]/clinical-context.ts`
  Read model del contexto clínico longitudinal del `EpisodeOfCare`.
- `src/app/admin/patients/[id]/data.ts`
  Resume contexto clínico reciente para el hub del paciente y coordina historia de solicitudes y tratamientos.

### Feature actual de resumen compartible

- `src/features/visit-share-report/visit-share-report.read-model.ts`
  Carga un contexto sanitizado para compartir, recortado al `Encounter` pedido y al episodio efectivo.
- `src/features/visit-share-report/visit-share-report.composer.ts`
  Compone el texto final a partir de campos ya persistidos.
- `src/features/visit-share-report/visit-share-report.completeness.ts`
  Clasifica completitud y warnings del resumen.
- `src/features/visit-share-report/visit-share-report.whatsapp.ts`
  Resuelve destinatarios y URL prellenada de WhatsApp.
- `src/app/admin/patients/[id]/encounters/actions/load-visit-share-report.action.ts`
  Server action de lectura para preparar el resumen.
- `src/app/admin/patients/[id]/encounters/components/VisitShareReportPanel.tsx`
  UI editable local, copiar, regenerar y abrir WhatsApp.

### Dominio y persistencia clínica relevante

- `src/domain/encounter/encounter.types.ts`
  Contrato de visita y nota clínica estructurada.
- `src/domain/episode-of-care/episode-of-care.types.ts`
  Contrato de ciclo de tratamiento y contexto longitudinal.
- `src/infrastructure/repositories/encounter.repository.ts`
  Crea, lee y actualiza `Encounter`.
- `src/infrastructure/mappers/encounter/*.ts`
  Traduce la nota clínica y puntualidad entre dominio y FHIR.
- `src/infrastructure/repositories/episode-of-care.repository.ts`
  Lee/crea/cierra `EpisodeOfCare` y actualiza contexto clínico.
- `src/infrastructure/mappers/episode-of-care/*.ts`
  Traduce contexto longitudinal, diagnósticos y cierre entre dominio y FHIR.
- `src/infrastructure/repositories/observation.repository.ts`
  Maneja métricas funcionales como `Observation`.
- `src/infrastructure/repositories/condition.repository.ts`
  Maneja diagnósticos usados por el contexto longitudinal.
- `src/infrastructure/repositories/practitioner.repository.ts`
  Maneja el `Practitioner` single-user del profesional firmante.

### Tests ya existentes que fijan contrato

- `src/features/visit-share-report/__tests__/visit-share-report.read-model.test.ts`
  Verifica que el resumen usa contexto sanitizado, no expone FHIR crudo y no confunde fuente clínica con texto final.
- `src/features/visit-share-report/__tests__/visit-share-report.composer.test.ts`
  Verifica que el texto omite placeholders, no interpreta métricas y no incluye datos internos o de contacto.

## 3. Artefactos actuales y responsabilidades

| Artefacto | Dónde vive hoy | Responsabilidad principal | No debería confundirse con |
|---|---|---|---|
| Nota clínica estructurada de visita | `Encounter.extension[]` | Registrar lo ocurrido en la sesión | Mensaje familiar, informe formal longitudinal |
| Resumen compartible | Feature `visit-share-report` + UI local | Traducir parte de la visita a texto revisable y compartible | Historia clínica persistida |
| Contexto clínico longitudinal | `EpisodeOfCare` + `Condition` | Sostener diagnóstico, situación funcional inicial, objetivos y plan del ciclo | Evolución puntual de cada visita |
| Métricas funcionales | `Observation` por visita | Medir evolución funcional puntual | Interpretación clínica narrativa |
| Profesional firmante | `Practitioner` singleton | Firma y atribución profesional | Documento clínico en sí |
| Historial de ciclos | `EpisodeOfCare` cerrados | Dar contexto de continuidad o cierre | Historial de comunicaciones |

### Riesgos al mezclar artefactos

- Si el resumen familiar se guarda como si fuera nota clínica, se introduce texto editado para terceros dentro del registro clínico fuente.
- Si el informe formal se resuelve con `Encounter` únicamente, se fuerza a una visita puntual a cargar semántica longitudinal o de cierre que pertenece al ciclo.
- Si todo se resuelve con un solo “texto libre”, se pierde la distinción entre dato fuente, narrativa derivada y comunicación efectivamente enviada.
- Si el mismo artefacto sirve para familia y para derivación profesional, aparecen tensiones de tono, detalle clínico, privacidad y versionado.

## 4. Necesidad real que parece emerger

### Lectura principal

La necesidad dominante hoy no parece ser “persistir informes” en abstracto, sino poder separar mejor:

- comunicación compartida con paciente/familia/cuidador;
- documentación clínica profesional;
- snapshots reutilizables o auditables de textos generados;
- síntesis longitudinales del tratamiento.

### Traducción a problemas concretos

| Necesidad | Qué falta hoy | Qué no exige todavía |
|---|---|---|
| Ver textos previos enviados o preparados | No hay historial de snapshots ni comunicaciones | No obliga a un documento clínico formal |
| Preparar un informe inicial/seguimiento/cierre | No hay artefacto formal distinto del resumen familiar | No obliga a una historia clínica completa |
| Reusar contexto longitudinal | Parte del contenido ya existe en `EpisodeOfCare` y `Condition`, pero no se materializa como informe | No obliga a persistir cada borrador |
| Trazar mensajes a familiares | No hay evidencia persistida de envío o destinatario | No obliga a mezclar eso con la nota clínica |

## 5. Investigación FHIR R4

### Recursos candidatos relevantes

#### `Communication`

Qué aporta en R4:

- registra una comunicación como evento;
- puede tener `sender`, `recipient`, `medium`, `sent`, `payload` y referencias a `Encounter`, `Condition`, `Observation`, `DiagnosticReport` o `DocumentReference`.

Por qué es relevante acá:

- es el mejor candidato si la necesidad es guardar trazabilidad de comunicaciones efectivamente preparadas o enviadas;
- permite diferenciar canal y destinatario sin contaminar la nota clínica de la visita.

Límite importante:

- FHIR aclara que no representa el flujo real de la llamada o conversación; representa el hecho de que información fue transferida.
- Tampoco es un mecanismo general de auditoría de toda divulgación de datos.

Referencia:

- HL7 FHIR R4 `Communication`: https://hl7.org/fhir/R4/communication.html

#### `DocumentReference`

Qué aporta en R4:

- indexa un documento, nota clínica u otro binario con metadatos de descubrimiento y manejo;
- puede apuntar a PDF, texto, documentos FHIR, binarios u otros formatos.

Por qué es relevante acá:

- sirve si se decide persistir un documento terminado o snapshot estable del contenido.

Límite importante:

- modela una referencia a un documento ensamblado; no es, por sí solo, una narrativa clínica estructurada ni una comunicación.
- suele tener más sentido cuando ya existe un documento materializado.

Referencia:

- HL7 FHIR R4 `DocumentReference`: https://hl7.org/fhir/R4/documentreference.html

#### `Composition`

Qué aporta en R4:

- estructura contenido clínico en secciones;
- es base de un documento FHIR con atestación clínica e inmutabilidad del bundle/documento derivado.

Por qué es relevante acá:

- sería el candidato más formal para informes clínicos atestados, especialmente iniciales, reevaluaciones o cierres.

Límite importante:

- es más pesado: requiere pensar documento, narrativa, bundle `type=document`, secciones y proceso de congelado/versionado.
- para este producto mínimo probablemente sea demasiado temprano salvo que aparezca una necesidad fuerte de documento clínico formal.

Referencia:

- HL7 FHIR R4 `Composition`: https://hl7.org/fhir/R4/composition.html

#### `ClinicalImpression`

Qué aporta en R4:

- registra una evaluación clínica o una síntesis de assessment;
- puede encajar con impresión inicial, reevaluación o summation clínica.

Por qué es relevante acá:

- conceptualmente puede calzar con reevaluaciones o síntesis clínicas del tratamiento.

Límite importante:

- en R4 tiene madurez baja y el propio estándar advierte poca estabilización de uso/intercambio.
- no resuelve por sí mismo la necesidad de documento compartible o de comunicación.

Referencia:

- HL7 FHIR R4 `ClinicalImpression`: https://hl7.org/fhir/R4/clinicalimpression.html

#### `DiagnosticReport`

Qué aporta en R4:

- agrupa resultados e interpretación de investigaciones diagnósticas.

Por qué solo es parcialmente relevante:

- tiene narrativa e incluso adjuntos, pero está orientado a reportes diagnósticos, no a resumen de visita domiciliaria general ni a mensajes familiares.

Referencia:

- HL7 FHIR R4 `DiagnosticReport`: https://hl7.org/fhir/R4/diagnosticreport.html

### Recursos que no convendría usar ahora

#### No convendría usar `DiagnosticReport` como solución principal

- Semánticamente está orientado a servicios diagnósticos.
- Forzaría una lectura clínica que hoy no coincide con el uso real del producto.

#### No convendría usar `Composition` como primer paso

- Sería la opción correcta solo si la necesidad prioritaria ya fuera documento clínico formal, atestado y congelable.
- Para conservar la simplicidad actual, arranca con demasiada carga de modelado, UI y versionado.

#### No convendría usar `ClinicalImpression` como base principal del roadmap inmediato

- Tiene mejor encaje para assessment clínico que para comunicación familiar.
- Su madurez en R4 es baja para convertirlo hoy en pivote central.

#### No convendría seguir ampliando `Encounter.clinicalNote` para absorber todo

- Rompería la separación actual entre fuente clínica estructurada y texto derivado.
- Haría más difícil distinguir qué fue observado profesionalmente de qué fue redactado para compartir.

#### No convendría persistir mensajes familiares dentro de `EpisodeOfCare` o `Condition`

- Son recursos de contexto clínico longitudinal, no de comunicación ni snapshot documental.

## 6. Alternativas comparadas

### Alternativa A — Mantener el resumen compartible como derivado efímero y fortalecer primero el modelo fuente

Qué resuelve:

- preserva la funcionalidad actual sin riesgo;
- mejora calidad futura de informes al depender de mejor contexto longitudinal y mejores notas;
- evita persistir artefactos ambiguos antes de entender la necesidad exacta.

Qué no resuelve:

- no hay historial de textos generados;
- no hay trazabilidad de lo compartido;
- no habilita informes formales.

Complejidad:

- baja.

Riesgos:

- la necesidad de historial puede seguir reapareciendo;
- usuarios podrían seguir compensando con copiar/pegar fuera del sistema.

Reversibilidad:

- máxima.

Impacto en UI:

- nulo o mínimo.

Impacto en FHIR:

- nulo.

Tests necesarios si se avanzara:

- tests de composición/completitud;
- tests de loaders del contexto clínico;
- tests del formulario de visita y del marco clínico del tratamiento.

### Alternativa B — Persistir snapshots de resumen compartible como artefacto de comunicación, separado del registro clínico

Recurso candidato principal:

- `Communication`.

Qué resuelve:

- historial de textos preparados o enviados;
- destinatario, canal, fecha, autor y relación con `Patient`/`Encounter`/`EpisodeOfCare`;
- mejor separación entre nota clínica e intercambio con familia/cuidador.

Qué no resuelve:

- no produce por sí solo un informe clínico formal;
- no reemplaza la necesidad de un documento más profesional si luego hiciera falta.

Complejidad:

- media.

Riesgos:

- si se sobrediseña, puede convertir una simple trazabilidad en un mini mensajero clínico;
- si se guarda el texto editable sin estado claro, puede no quedar claro qué fue borrador y qué fue enviado.

Reversibilidad:

- alta, si se mantiene acotado a snapshots/comunicaciones y no se convierte en capa transversal.

Impacto en UI:

- una lista mínima de “comunicaciones/summaries compartidos” por visita o por paciente;
- conviene no sobrecargar la pantalla principal de `/encounters`.

Impacto en FHIR:

- agrega un recurso nuevo, pero con una semántica razonablemente alineada al problema.

Tests necesarios:

- mappers y repositorio del recurso nuevo;
- tests de action/loaders;
- tests de UI para listado mínimo y estados de borrador/enviado si existieran.

### Alternativa C — Crear un artefacto de documento clínico formal para informes iniciales, reevaluaciones y cierre

Recursos candidatos:

- `Composition` y eventualmente `DocumentReference` como envoltorio/índice del documento final.

Qué resuelve:

- informes clínicos formales, versionables, con secciones y atribución profesional;
- mejor encaje para compartir con otros profesionales, auditorías o derivaciones.

Qué no resuelve:

- no es la mejor respuesta si el problema inmediato es trazar WhatsApp o ver textos previos de familia;
- es demasiado para el resumen familiar de visita.

Complejidad:

- alta.

Riesgos:

- sobre-modelar demasiado temprano;
- duplicar contenido que ya vive en `Encounter`, `EpisodeOfCare`, `Condition` y `Observation`;
- abrir temas de inmutabilidad, correcciones, attestation y generación documental demasiado pronto.

Reversibilidad:

- media.

Impacto en UI:

- requiere nuevas superficies o al menos una pantalla dedicada a “informes”.

Impacto en FHIR:

- alto.

Tests necesarios:

- tests de ensamblado documental;
- validación de referencias incluidas;
- tests de narrativa, generación, versionado y consulta.

## 7. Recomendación principal

La opción más coherente con el alcance actual es una dirección en dos tiempos:

1. Mantener por ahora el resumen compartible actual como artefacto derivado y efímero.
2. Si la necesidad de historial se confirma, agregar una capa mínima y separada de persistencia para comunicaciones/snapshots usando `Communication`, no reutilizando `Encounter` ni `EpisodeOfCare` como contenedor de ese texto.

### Por qué esta es la mejor opción hoy

- respeta el producto actual, que es una app clínica mínima y no una historia clínica completa;
- evita mezclar texto familiar/WhatsApp con documentación clínica fuente;
- es reversible;
- conserva la arquitectura vigente;
- deja abierta una evolución posterior hacia documentos formales sin comprometerla ahora.

### Qué guardaría en esa opción mínima si se avanzara

Datos mínimos recomendados:

- `type` o categoría del artefacto;
- `status`;
- `createdAt`;
- `sentAt` si aplica;
- `author`/sender;
- `patient`;
- `episodeOfCare`;
- `encounter` si proviene de visita;
- `recipient`;
- `recipientKind` o relación;
- `channel` o `medium`;
- `content`;
- `contentFormat` si más adelante hubiera PDF o attachment;
- `origin` del texto: generado, editado, manual;
- `version` o `revisionOf` si se permite más de una versión;
- `isClinicalRecord` o una categoría equivalente para no mezclarlo con documento clínico formal.

## 8. Alternativa más conservadora

No persistir nada todavía.

Antes de agregar otro recurso, fortalecer:

- completitud y calidad del contexto longitudinal en `/treatment`;
- claridad del registro clínico de `Encounter`;
- criterios de qué tipo de salida se quiere producir: comunicación familiar, informe clínico o ambos.

Esta alternativa es especialmente razonable si el uso actual del resumen es ocasional y la principal fricción todavía es de calidad de inputs, no de histórico.

## 9. Alternativa más formal / ambiciosa

Crear una capacidad nueva de “informes clínicos” distinta del resumen compartible, con plantillas como:

- informe inicial;
- seguimiento;
- reevaluación;
- cierre.

Dirección FHIR sugerida para esa línea:

- `Composition` como núcleo del informe clínico formal;
- `DocumentReference` si además se necesita indexar o consultar el documento congelado como artefacto final.

Eso debería ser una superficie nueva o al menos una responsabilidad nueva explícita, no una extensión del panel actual de WhatsApp.

## 10. Qué no haría ahora

- No guardaría el texto editado dentro de `Encounter.clinicalNote`.
- No ampliaría `EpisodeOfCare` con blobs narrativos de comunicación familiar.
- No usaría `DiagnosticReport` para informes de seguimiento kinésico general.
- No introduciría `Composition` como primera respuesta si el problema real es ver textos previos o registrar destinatario/canal.
- No mezclaría en una misma UI “resumen para familia” con “informe clínico formal” sin diferenciación de tipo, destino y estado.
- No movería el problema a una tabla/recurso genérico tipo “notes” sin semántica clínica o comunicacional clara.

## 11. UI mínima sugerida si se decide persistir algo

### Opción mínima viable

Mantener `/encounters` liviano y agregar solo una consulta compacta:

- en el panel de resumen compartible, mostrar “último resumen compartido” con fecha y destinatario;
- opcionalmente un link “Ver historial”.

### Donde convendría ver el historial completo

- mejor en una sección pequeña del hub del paciente o en una subvista dedicada;
- no conviene que `/encounters` absorba una grilla completa de comunicaciones, documentos y reportes.

### Distinción visible mínima

- `Resumen compartido`
- `Comunicación`
- `Informe clínico`

La UI debería distinguir estos tipos antes de permitir persistencia masiva.

## 12. Riesgos clínicos, legales, técnicos y de producto

### Clínicos

- que un texto editado para familia sea leído como verdad clínica fuente;
- que un resumen amistoso omita matices importantes si luego se reusa como documento profesional.

### Legales / privacidad

- persistir mensajes a familiares puede requerir más cuidado sobre destinatario correcto y contenido sensible;
- guardar contenido enviado por WhatsApp puede aumentar exposición de PHI/PII si no se acota bien el propósito.

### Técnicos

- duplicación de narrativa clínica ya registrada en `Encounter` y `EpisodeOfCare`;
- ambigüedad de versionado si se permiten múltiples ediciones del mismo texto;
- complejidad extra de búsquedas y relaciones si el nuevo recurso no nace con semántica clara.

### De producto

- convertir una app mínima en una pseudo-HCE documental antes de validar la necesidad;
- sobrecargar `/encounters` con responsabilidades nuevas.

## 13. Qué debería seguir siendo derivado/efímero y qué podría persistirse

### Debería seguir derivado o efímero

- texto editable transitorio del panel actual;
- warnings de completitud;
- selección momentánea de destinatario en UI;
- regeneraciones locales del mismo resumen.

### Podría persistirse si la necesidad se confirma

- snapshot final o borrador guardado del contenido compartido;
- metadatos de comunicación;
- vínculo con visita/ciclo/paciente;
- estado del artefacto: borrador, preparado, compartido, descartado;
- eventualmente, en otra fase, informes clínicos formales de tipo específico.

## 14. Fases sugeridas

### Fase 0 — no tocar persistencia

- observar uso del resumen actual;
- confirmar si el problema es historial, trazabilidad, formalización clínica o todo junto.

### Fase 1 — clarificar tipologías

- definir vocabulario de producto:
  - resumen compartible;
  - comunicación registrada;
  - informe clínico.

### Fase 2 — trazabilidad mínima separada

- si el problema confirmado es historial o evidencia de comunicación, modelar una persistencia mínima separada, preferentemente con `Communication`.

### Fase 3 — consulta mínima

- exponer historial compacto por paciente o por visita, sin rediseñar `/encounters`.

### Fase 4 — informes clínicos formales

- solo si aparece una necesidad real de documento clínico profesional persistido;
- evaluar `Composition` y, si corresponde, `DocumentReference`.

## 15. Documentación a actualizar si se avanza

- `README.md`
  Solo si cambia la descripción portfolio-facing del alcance privado.
- `docs/fuente-de-verdad-operativa.md`
  Si cambia comportamiento vigente o aparece una nueva superficie/artefacto persistido.
- `docs/arquitectura-objetivo-app-clinica.md`
  Si la dirección del producto incorpora explícitamente comunicaciones persistidas o informes formales.
- `docs/fhir/README.md`
  Si entra un recurso nuevo como `Communication`, `Composition` o `DocumentReference`.
- `docs/checklist-sincronizacion-doc-codigo.md`
  Solo si el cambio exige nuevos controles documentales.

## 16. Recomendación ejecutiva final

No convertir todavía el resumen compartible en “informe” ni persistirlo dentro de los recursos clínicos actuales.

La dirección más sana hoy es:

- sostener el resumen actual como texto derivado;
- fortalecer la calidad del dato fuente en `Encounter` y `EpisodeOfCare`;
- si se confirma necesidad de historial o trazabilidad, introducir una capa separada y acotada de `Communication`;
- reservar `Composition` + `DocumentReference` para una fase posterior, solo si aparece una necesidad explícita de documento clínico formal.
