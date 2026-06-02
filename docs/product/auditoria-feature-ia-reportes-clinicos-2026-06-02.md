# Auditoria tecnica y de producto - IA para borradores de reportes clinicos

Fecha: 2026-06-02  
Estado: auditoria y recomendacion, sin implementacion  
Alcance: superficie privada `/admin`, datos clinicos de paciente/tratamiento/visitas, arquitectura futura para generar borradores revisables de reportes clinicos con IA.

## 1. Recomendacion ejecutiva

La app esta en un momento razonable para iniciar una **fase de preparacion y spike tecnico controlado**, pero todavia no conviene lanzar una feature productiva amplia de IA. La base actual ya es mucho mejor que la auditoria historica del 2026-05-05: hoy existen nota clinica estructurada por visita, contexto longitudinal del tratamiento, diagnosticos de referencia/kinesico via `Condition` y metricas funcionales minimas via `Observation`.

La recomendacion es avanzar con un MVP estrecho: **borrador de reporte de una visita individual**, generado bajo demanda desde la superficie privada, sin persistencia automatica, sin envio automatico y con revision/edicion obligatoria por profesional. El reporte evolutivo de varias sesiones deberia quedar para una fase posterior, porque exige reglas mas fuertes de seleccion temporal, comparacion de metricas y manejo de datos faltantes para evitar que el modelo infiera progreso no registrado.

La feature debe diseñarse como una capa aislada de "AI reporting", alimentada por read models clinicos propios y sanitizados. La UI no debe conocer FHIR crudo, las API keys no deben salir del servidor, y los repositorios FHIR no deben contaminarse con prompts, schemas de IA ni decisiones de proveedor.

## 2. Estado actual de datos disponibles

### 2.1 Reporte de una sesion individual

Datos disponibles hoy:

- Identificacion interna del paciente, nombre completo, DNI opcional y fecha de nacimiento en `loadPatientEncountersPageData()`.
- Estado operativo derivado del paciente y del tratamiento.
- Tratamiento efectivo (`effectiveEpisode = activeEpisode ?? mostRecentEpisode`) con scoping robusto por `episodeOfCareId`.
- Contexto clinico longitudinal del episodio mediante `loadEpisodeClinicalContextReadModel()`:
  - diagnostico de referencia medica;
  - diagnostico/impresion kinesica;
  - situacion funcional inicial;
  - objetivos terapeuticos;
  - plan marco.
- Visita `Encounter` con:
  - inicio y cierre;
  - estado `finished`;
  - puntualidad operativa opcional;
  - nota clinica estructurada minima: `subjective`, `objective`, `intervention`, `assessment`, `tolerance`, `homeInstructions`, `nextPlan`.
- Observaciones funcionales por visita:
  - TUG en segundos;
  - dolor NRS 0-10;
  - tolerancia a bipedestacion en minutos;
  - marcha en minutos.

Fortalezas:

- `/admin/patients/[id]/encounters/data.ts` ya arma una vista bastante cercana al read model que necesita IA: paciente, episodio efectivo, contexto clinico, encounters y observations asociadas.
- El scoping por episodio efectivo reduce el riesgo de mezclar visitas de tratamientos cerrados con el tratamiento activo.
- Las observaciones se filtran defensivamente por `patientId` y `encounterId`.
- La nota clinica estructurada aporta hechos suficientes para redactar un reporte descriptivo, siempre que el profesional haya cargado contenido.

Debilidades:

- No hay un read model especifico de "reporte clinico" ni sanitizacion de payload para IA.
- El nombre, DNI y edad estan disponibles en loaders actuales, pero no siempre son necesarios para generar un borrador.
- La nota clinica es opcional; una visita puede tener solo fecha/duracion y metricas, lo cual no alcanza para un reporte clinico seguro.
- Las metricas no incluyen interpretacion clinica validada, solo valores.
- No hay autor profesional, destinatario del reporte, motivo administrativo del reporte, institucion, firma, cobertura ni formato final esperado.
- No hay edicion de nota clinica post-creacion dedicada, al menos no se observo una Server Action separada para actualizar el contenido clinico de la nota.

### 2.2 Reporte evolutivo de varias sesiones

Datos disponibles hoy:

- Lista ordenada de visitas del episodio efectivo.
- Conteo y estadisticas basicas mediante `calculateEncounterStats()`.
- Tendencia funcional mediante `buildFunctionalTrendSummary()`.
- Contexto clinico longitudinal del ciclo activo o del ciclo mas reciente cuando no hay activo.
- Historial cerrado visible en `/treatment`, con cierre, motivo, detalle y solicitud vinculada.

Fortalezas:

- La app ya distingue tratamiento activo, finalizados e historial.
- La auditoria del 2026-06-01 confirma que `/encounters` es la superficie mejor protegida contra mezcla de ciclos.
- Las metricas funcionales repetibles permiten un primer resumen de evolucion si existen mediciones comparables.

Debilidades:

- Las observaciones son opcionales y pueden faltar en muchas visitas.
- No hay seleccion explicita de rango de sesiones para reporte evolutivo.
- No hay snapshot de objetivos al momento de cada visita; los objetivos actuales del episodio podrian haber cambiado.
- No hay semantica de "alta", "reevaluacion", "derivacion" o "cierre clinico" como reporte final revisado.
- No hay escala de calidad/completitud del dato para decidir si un reporte evolutivo es confiable.
- Comparar metricas podria inducir al modelo a afirmar mejoria/empeoramiento si no se controla estrictamente.

### 2.3 Datos faltantes o debiles

- Destinatario y proposito del reporte: paciente/familia, medico derivante, auditoria, obra social, resumen interno.
- Identidad profesional: nombre, matricula, rol y firma. No debe inventarse.
- Plantilla/formato de reporte aprobado por el negocio.
- Seleccion de encounters para reporte evolutivo.
- Campo de "conclusion revisada" o "impresion profesional final" separado del borrador IA.
- Severidad/estado clinico codificado y confiable mas alla de texto libre.
- Validacion de completitud minima antes de permitir generar.
- Politica explicita de privacidad/PHI para IA.
- Auditoria de uso: quien genero, cuando, con que input sanitizado, sin guardar payload sensible innecesario.

### 2.4 Datos que no deberian enviarse al modelo en un MVP

No enviar por defecto:

- DNI.
- Telefono, WhatsApp, email, domicilio y datos de contacto.
- IDs FHIR crudos (`Patient/{id}`, `Encounter/{id}`, `EpisodeOfCare/{id}`), salvo que se reemplacen por IDs locales no reversibles para trazabilidad interna del prompt.
- Datos administrativos de solicitudes no necesarios para el reporte clinico.
- Historial de tratamientos cerrados cuando el reporte sea de una visita del tratamiento activo.
- Logs tecnicos, errores, URLs internas, nombres de rutas, tokens, cookies o metadata de infraestructura.
- Datos de terceros no necesarios, como familiar/contacto o solicitante.
- Texto no revisado de reportes previos generados por IA, si existieran en el futuro, para evitar retroalimentacion.

Permitido en MVP con politica explicita:

- Edad o rango etario, preferible a fecha de nacimiento exacta.
- Iniciales o etiqueta "Paciente" en lugar de nombre completo, si la configuracion de privacidad lo exige.
- Diagnosticos y notas clinicas necesarias para la tarea, porque son el insumo principal del reporte.

## 3. Ubicacion UX recomendada

### 3.1 Donde debe vivir la accion

Para el MVP, la accion **"Generar borrador de reporte"** deberia vivir en `/admin/patients/[id]/encounters`, junto a cada visita registrada. Esa pantalla ya concentra el contexto clinico del ciclo, la lista de sesiones, metricas y restricciones de tratamiento activo/finalizado.

Ubicacion concreta sugerida:

- En cada item de `EncountersList`, como accion secundaria junto a la visita.
- Visible solo si la visita tiene datos clinicos minimos: al menos una seccion de nota clinica o una metrica funcional, mas fecha de inicio.
- Con estado deshabilitado y copy explicito si faltan datos: "Faltan datos clinicos para generar un borrador util".

Para reporte evolutivo, la accion deberia agregarse mas adelante arriba del listado de visitas, cerca de `FunctionalTrendSummary` y `EncounterStatsSummary`, con seleccion de rango/sesiones.

### 3.2 Visita individual vs reporte evolutivo

Conviene empezar por **reporte de una visita individual**.

Motivos:

- Menor riesgo de inferencias longitudinales falsas.
- Menor superficie de privacidad.
- Payload mas chico y auditable.
- El profesional puede validar facilmente si el borrador respeta la visita.
- No requiere resolver seleccion de rango ni comparacion de tendencias.

El reporte evolutivo debe ser Fase 3, despues de probar guardrails, schema y experiencia de revision en una visita.

### 3.3 Como mostrar el resultado

Para MVP:

- Panel inline expandible dentro del item de visita, o drawer/modal liviano si el contenido resulta extenso.
- `textarea` editable con el cuerpo del borrador.
- Cabecera fija del panel:
  - "Borrador generado por IA";
  - "Debe ser revisado y editado por el profesional antes de usarse";
  - timestamp de generacion en UI, no necesariamente persistido.
- Bloques auxiliares no editables:
  - `missingData`: datos faltantes relevantes;
  - `warnings`: advertencias del generador;
  - `sourceFacts`: hechos usados para generar.
- Boton "Copiar borrador".
- Boton "Descartar".
- En MVP, no mostrar "Enviar", "Guardar como final" ni "Aprobar" si no existe semantica de persistencia revisada.

Evitaria una nueva ruta para el MVP. Una ruta dedicada cobra sentido cuando existan reportes persistidos, versionado, revision formal o exportacion.

### 3.4 Como dejar claro que es borrador revisable

Copy recomendado:

> Borrador generado por IA a partir de datos registrados. Revisalo, editalo y validalo con criterio profesional antes de compartirlo. La IA no agrega indicaciones ni conclusiones no documentadas.

Reglas UX:

- Usar siempre la palabra "borrador".
- Evitar "reporte final", "certificado", "evolucion validada" o "recomendacion".
- No autopoblar canales de envio.
- No guardar automaticamente como nota clinica ni como reporte final.

## 4. Arquitectura tecnica recomendada

### 4.1 Stack recomendado

La implementacion debe ser server-side. Hay dos caminos razonables:

- **Vercel AI SDK** (`ai` + provider OpenAI): encaja bien con Next.js App Router, Zod y Server Actions, especialmente si se usa `generateObject` para salida estructurada.
- **OpenAI SDK oficial**: opcion mas directa si se quiere reducir dependencia y controlar manualmente parsing/retries.

Dado que el repo ya usa Next.js App Router, Server Actions, TypeScript y Zod, el Vercel AI SDK encaja bien para un spike. Para MVP, lo importante no es el SDK sino mantener boundaries limpios y salida validada.

### 4.2 Boundaries propuestos

Capas:

- UI:
  - componente cliente `GenerateEncounterReportDraftButton` o equivalente;
  - maneja loading, success, missing data y error;
  - renderiza `textarea` editable y botones;
  - no recibe ni construye FHIR.
- Server Action:
  - `generateEncounterReportDraftAction(input)`;
  - valida `patientId`, `encounterId`, `episodeOfCareId`;
  - chequea permisos/autenticacion cuando exista esa capa;
  - llama al loader/read model;
  - llama al AI service;
  - nunca expone API keys.
- Loader/read-model:
  - `loadEncounterReportDraftContext({ patientId, encounterId })`;
  - devuelve un DTO clinico y sanitizado;
  - aplica scoping por episodio efectivo;
  - calcula completitud minima;
  - excluye FHIR crudo y datos administrativos innecesarios.
- Payload sanitizer:
  - whitelist explicita de campos permitidos;
  - desidentificacion configurable;
  - truncado de textos largos;
  - normalizacion de fechas y unidades.
- Prompt builder:
  - `buildEncounterReportDraftPrompt(context)`;
  - convierte DTO a input estructurado;
  - no consulta repositorios ni variables de entorno.
- AI service:
  - `generateClinicalReportDraft(promptInput)`;
  - encapsula provider, modelo, temperatura, schema, retries y errores;
  - retorna dominio propio `ClinicalReportDraft`.
- Schema de salida:
  - Zod/JSON schema para `title`, `body`, `missingData`, `warnings`, `sourceFacts`.

### 4.3 Ubicacion sugerida de codigo futuro

Sin implementar ahora, una estructura posible:

```txt
src/features/ai-reporting/
  clinical-report-draft.types.ts
  clinical-report-draft.schema.ts
  encounter-report-draft.read-model.ts
  encounter-report-draft.sanitizer.ts
  encounter-report-draft.prompt.ts
  clinical-report-ai.service.ts
  actions/
    generate-encounter-report-draft.action.ts
  __tests__/
```

Esta estructura mantiene la feature aislada del dominio clinico central y de infraestructura FHIR. Los repositorios existentes quedan como fuentes de datos, no como conocedores de IA.

### 4.4 Reglas tecnicas clave

- La UI no debe importar tipos FHIR ni mappers.
- El prompt builder no debe leer de FHIR ni de repositorios.
- El AI service no debe saber de rutas `/admin`.
- La Server Action no debe devolver payloads crudos de contexto al cliente salvo el resultado y advertencias necesarias.
- Los logs no deben incluir input clinico completo ni respuesta completa del modelo.
- La feature debe poder apagarse con env var/feature flag.

## 5. Diseño de prompt y guardrails

### 5.1 System prompt sugerido

```txt
Sos un asistente de redaccion clinica para kinesiologia domiciliaria.
Tu tarea es redactar un borrador de reporte clinico en español claro y profesional usando exclusivamente los datos provistos.
No reemplazas el criterio clinico del profesional.
No diagnostiques, no indiques tratamientos nuevos y no agregues recomendaciones que no esten documentadas.
No infieras mejoria, empeoramiento, causalidad, adherencia ni pronostico si no estan explicitamente registrados.
Si falta informacion, declarala en missingData o warnings en lugar de inventarla.
No crees metricas, fechas, nombres, matriculas ni datos administrativos inexistentes.
El resultado siempre debe presentarse como borrador revisable.
```

### 5.2 Estructura de input recomendada

```ts
type EncounterReportPromptInput = {
  reportKind: "single_encounter";
  privacyMode: "identified" | "partially_deidentified";
  patient: {
    displayName?: string;
    ageYears?: number;
  };
  treatmentContext: {
    startDate?: string;
    medicalReferenceDiagnosisText?: string;
    kinesiologicDiagnosisText?: string;
    initialFunctionalStatus?: string;
    therapeuticGoals?: string;
    frameworkPlan?: string;
  };
  encounter: {
    startedAt: string;
    endedAt?: string;
    durationMinutes?: number;
    clinicalNote?: {
      subjective?: string;
      objective?: string;
      intervention?: string;
      assessment?: string;
      tolerance?: string;
      homeInstructions?: string;
      nextPlan?: string;
    };
    functionalMetrics?: Array<{
      label: string;
      code: "tug_seconds" | "pain_nrs_0_10" | "standing_tolerance_minutes" | "gait_duration_minutes";
      value: number;
      unit: string;
    }>;
  };
  constraints: {
    doNotInferProgress: true;
    doNotAddClinicalRecommendations: true;
    doNotDiagnose: true;
  };
};
```

### 5.3 Reglas estrictas

- No inventar datos.
- No inferir mejoria o empeoramiento no registrado.
- No convertir objetivos terapeuticos en resultados alcanzados si no hay evidencia.
- No agregar recomendaciones clinicas no documentadas.
- No crear metricas inexistentes ni completar valores faltantes.
- No diagnosticar.
- No mencionar datos administrativos no incluidos.
- No usar lenguaje de certeza cuando la fuente sea texto subjetivo.
- No presentar la salida como documento final.
- Si hay datos insuficientes, generar un borrador breve o devolver warning de insuficiencia, segun regla de producto.

### 5.4 Schema de salida

Conviene usar salida estructurada con Zod/schema desde el primer spike. Propuesta:

```ts
const clinicalReportDraftSchema = z.object({
  title: z.string().min(1).max(140),
  body: z.string().min(1).max(6000),
  missingData: z.array(z.string().max(240)).max(12),
  warnings: z.array(z.string().max(240)).max(12),
  sourceFacts: z.array(z.object({
    label: z.string().max(80),
    value: z.string().max(500),
  })).max(24),
});
```

`sourceFacts` es importante para revision humana: permite mostrar que el borrador se apoya en datos concretos. No debe contener IDs FHIR ni PHI innecesaria.

## 6. Privacidad y seguridad

### 6.1 Variables de entorno necesarias

Para una futura implementacion:

- `OPENAI_API_KEY`: server-only.
- `OPENAI_MODEL`: modelo configurable, por ejemplo para cambiar sin tocar codigo.
- `AI_REPORT_DRAFTS_ENABLED`: feature flag global.
- `AI_REPORT_PRIVACY_MODE`: `identified` o `partially_deidentified`.
- Opcional: `AI_REPORT_MAX_INPUT_CHARS` para limitar payload.

Ninguna variable debe tener prefijo `NEXT_PUBLIC_`.

### 6.2 Politica de datos minimos

Principios:

- Enviar solo lo necesario para redactar el reporte solicitado.
- Preferir edad sobre fecha de nacimiento.
- Excluir DNI y contacto.
- Excluir historial fuera del ciclo seleccionado.
- Excluir datos administrativos salvo que el reporte los requiera explicitamente.
- Truncar textos largos y mostrar warning si el truncado afecta completitud.
- No guardar prompts completos en logs.

### 6.3 Riesgos de enviar datos clinicos identificables

Riesgos:

- Exposicion de informacion de salud protegida o sensible a un subprocesador externo.
- Falta de consentimiento o informacion al profesional/paciente, segun politica legal aplicable.
- Retencion accidental en logs propios si se registra input/respuesta.
- Envio excesivo por incluir datos administrativos innecesarios.
- Confianza excesiva en una redaccion fluida que puede ocultar omisiones.

Recomendacion:

- Antes de MVP productivo, definir una decision documentada de privacidad y proveedor.
- Habilitar desidentificacion parcial como configuracion del MVP.
- Mostrar en UI que se usaran datos clinicos registrados para generar el borrador.
- No ejecutar generacion automatica al entrar a una pantalla.
- No enviar nada sin accion explicita del profesional.

## 7. Persistencia

### 7.1 MVP

No persistir el borrador generado en el MVP.

Motivos:

- Reduce riesgo legal y semantico.
- Evita confundir "borrador IA" con verdad clinica.
- Permite validar utilidad antes de diseñar versionado y aprobacion.
- Mantiene el cambio aislado.

El usuario puede copiar el texto editado desde el `textarea`. Si se necesita trazabilidad minima, registrar solo evento tecnico no sensible: fecha, user id si existe, patient id interno, encounter id interno, exito/error, sin prompt ni respuesta completa.

### 7.2 Persistencia futura

Si se persiste mas adelante, separar semanticas:

- `AI draft`: texto generado, no validado, descartable, con metadata de modelo y fuente.
- `Reviewed report`: texto editado/revisado por profesional, aun puede ser borrador.
- `Final report`: documento aprobado para compartir, con autor, fecha, version y estado.

No guardar automaticamente en `Encounter.clinicalNote`, porque eso convertiria una redaccion generada en registro clinico fuente. Si se modela en FHIR, evaluar `Composition` o `DocumentReference` para reportes revisados/finales, no `Observation` ni `Condition`. Esta decision requiere ADR/FHIR especifica antes de implementarse.

## 8. Tests recomendados

### 8.1 Unitarios de prompt builder y sanitizacion

- Excluye DNI, telefono, domicilio, email e IDs FHIR.
- Convierte fecha de nacimiento a edad o elimina segun `privacyMode`.
- Incluye solo el encounter seleccionado para reporte individual.
- No incluye encounters de episodios cerrados cuando hay activo.
- Trunca textos largos y agrega warning.
- Mantiene unidades de metricas funcionales.
- Declara datos faltantes si no hay nota clinica.

### 8.2 Schema/output parsing

- Acepta una respuesta valida con `title`, `body`, `missingData`, `warnings`, `sourceFacts`.
- Rechaza salida sin `body`.
- Rechaza campos extra si se decide `strict`.
- Maneja arrays demasiado largos.
- Maneja respuesta del proveedor no parseable.

### 8.3 Server Action con mock del AI service

- Rechaza patient/encounter vacios.
- Rechaza encounter que no pertenece al paciente.
- Rechaza encounter fuera del episodio efectivo.
- Devuelve missing data sin llamar al AI service si no hay datos minimos.
- Llama al loader, sanitizer y AI service con DTO sanitizado.
- Devuelve error controlado ante fallo del provider.
- No revalida rutas ni persiste nada en MVP.

### 8.4 UI

- Loading: boton deshabilitado y texto "Generando...".
- Success: muestra panel/textarea editable, warnings y source facts.
- Missing data: muestra mensaje accionable sin resultado falso.
- Error: muestra error no tecnico.
- Copy button: copia el contenido editado.
- Descartar: limpia el borrador local.
- No muestra accion si feature flag esta apagado.

### 8.5 Fixtures representativos

- Visita completa con todas las secciones clinicas y metricas.
- Visita con solo nota subjetiva/intervencion.
- Visita con solo metricas y sin nota.
- Paciente con tratamiento activo y finalizados previos.
- Tratamiento finalizado sin activo, en modo historial.
- Observations duplicadas por codigo en el mismo encounter, esperando ultima efectiva.
- Datos identificables completos para probar sanitizacion.

## 9. Plan incremental

### Fase 0 - auditoria/documentacion

Estado: esta auditoria.

Entregables:

- Diagnostico de datos disponibles.
- Recomendacion UX.
- Arquitectura propuesta.
- Guardrails y politica de datos minimos.
- Plan de tests y fases.

### Fase 1 - spike tecnico sin UI productiva

Objetivo: validar integracion server-side y salida estructurada sin exponerla al flujo clinico real.

Alcance:

- Agregar dependencias `ai`/OpenAI o SDK oficial.
- Crear read model sanitizado para un encounter.
- Crear prompt builder y schema.
- Mock/fake runner por defecto en tests.
- Comando o test aislado con fixture local, sin enviar datos reales automaticamente.
- Documentar variables de entorno y riesgos.

Criterio de salida:

- Se obtiene salida estructurada con fixture sintetico.
- Tests demuestran que no se filtran datos prohibidos.

### Fase 2 - MVP reporte de una visita

Objetivo: generar borrador bajo demanda para una visita.

Alcance:

- Server Action con provider real detras de feature flag.
- Accion secundaria en `EncountersList`.
- Panel inline o modal con textarea editable.
- Copy button, warnings, missing data y source facts.
- Sin persistencia.
- Sin envio automatico.

Criterio de salida:

- El profesional puede generar, revisar, editar y copiar un borrador.
- La UI comunica claramente que no es documento final.

### Fase 3 - reporte evolutivo de varias sesiones

Objetivo: generar resumen evolutivo controlado.

Alcance:

- Seleccion explicita de rango o sesiones.
- Read model evolutivo con tendencia funcional y notas por visita.
- Guardrails reforzados para no inferir progreso no registrado.
- Mostrar matriz de fuente por sesion/metrica.

Criterio de salida:

- El borrador distingue hechos, faltantes y advertencias.
- No mezcla tratamientos ni sesiones no seleccionadas.

### Fase 4 - persistencia de reporte revisado

Objetivo: guardar reportes revisados con semantica clara.

Alcance:

- Definir modelo: `AI draft`, `Reviewed report`, `Final report`.
- ADR FHIR para `Composition`/`DocumentReference` u otra alternativa.
- Versionado, autor, fecha, estado, audit trail.
- Flujo de aprobacion profesional.

Criterio de salida:

- Nada generado por IA queda como verdad clinica sin aprobacion.

## 10. No-alcances

- No implementar IA en esta auditoria.
- No tocar GA4, landing publica, rutas publicas ni SEO.
- No modificar modelo FHIR sin ADR/justificacion.
- No agregar dashboard clinico.
- No agregar recomendaciones clinicas automaticas.
- No enviar reportes automaticamente.
- No persistir borradores IA en MVP.
- No usar datos administrativos sensibles salvo decision explicita posterior.
- No mezclar reportes de tratamientos cerrados con tratamiento activo.

## 11. Checklist de implementacion futura

Antes de Fase 1:

- [ ] Definir proveedor/modelo y decision de privacidad.
- [ ] Confirmar si se permite enviar datos clinicos identificables o solo parcialmente desidentificados.
- [ ] Definir variables de entorno server-only.
- [ ] Crear fixtures sinteticos representativos.
- [ ] Crear schema de salida y tests de parsing.

Antes de Fase 2:

- [ ] Crear read model sanitizado para reporte de una visita.
- [ ] Validar que el read model no expone FHIR crudo a UI.
- [ ] Implementar feature flag.
- [ ] Agregar tests unitarios de sanitizacion.
- [ ] Agregar tests de Server Action con AI service mockeado.
- [ ] Agregar UI states: loading, success, missing data, error.
- [ ] Revisar copy legal/producto de "borrador revisable".

Antes de Fase 3:

- [ ] Definir seleccion de sesiones/rango.
- [ ] Agregar fixtures con multiples ciclos y multiples sesiones.
- [ ] Probar que no se infiere mejoria no registrada.
- [ ] Mostrar source facts por sesion.

Antes de Fase 4:

- [ ] Crear ADR FHIR para persistencia de reportes.
- [ ] Separar `AI draft`, `Reviewed report` y `Final report`.
- [ ] Definir audit trail, autor y versionado.
- [ ] Definir permisos y retencion.

## 12. Sincronizacion documentacion/codigo

Revision segun `docs/checklist-sincronizacion-doc-codigo.md`:

- Documentos actualizados: se agrega esta auditoria en `docs/product/`.
- README: no requiere actualizacion porque no cambia comportamiento implementado.
- `docs/fuente-de-verdad-operativa.md`: no requiere actualizacion porque no cambia el runtime.
- `docs/fhir/README.md`: no requiere actualizacion porque no se modifica modelo FHIR.
- Rutas/UI/dominio/mappers/repositorios/actions: sin cambios.
- Tests: no se agregan porque no hay implementacion.
- Fuera de alcance deliberado: GA4, landing publica, rutas publicas, SEO, dashboard clinico, envio automatico, persistencia de reportes.

## 13. Referencias externas revisadas

- OpenAI Structured Outputs: la documentacion oficial recomienda Structured Outputs por encima de JSON mode cuando se necesita adherencia a schema, e indica soporte con JSON Schema y helpers SDK para Zod/Pydantic.
  - https://platform.openai.com/docs/guides/structured-outputs
- OpenAI API keys: la documentacion oficial recomienda cargar API keys de forma segura desde variables de entorno o key management server-side.
  - https://platform.openai.com/docs/api-reference/authentication
- Vercel AI SDK + OpenAI: la documentacion oficial de Vercel recomienda no exponer API keys en codigo cliente y usar variables de entorno; el AI SDK es una opcion natural para apps Next.js.
  - https://vercel.com/docs/ai/openai
- Vercel AI SDK: documentacion oficial del toolkit TypeScript para React/Next.js y otros runtimes.
  - https://vercel.com/ai-sdk
