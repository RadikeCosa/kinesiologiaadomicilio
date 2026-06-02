# Auditoria tecnica y de producto - Reporte de visita compartible

Fecha: 2026-06-02  
Estado: auditoria y recomendacion, sin implementacion  
Alcance: reporte deterministico de una visita para revisar y compartir con paciente o familiar/contacto principal desde la superficie privada `/admin`. Sin IA, sin PDF, sin persistencia de reportes y sin envio automatico.

## 1. Recomendacion ejecutiva

Conviene avanzar con un MVP de **mensaje/reporte compartible de visita**, no con un "documento clinico final" ni con un "borrador IA". La necesidad principal es operativa y relacional: despues de una visita, el profesional necesita enviar al paciente o familiar un resumen claro de lo trabajado, indicaciones domiciliarias y proximo plan, usando datos ya registrados y manteniendo control humano antes de compartir.

La recomendacion para MVP es:

- Ubicacion: accion secundaria en la card de cada visita ya registrada dentro de `/admin/patients/[id]/encounters`.
- Presentacion: panel inline expandible en la card, con texto editable.
- Composicion: plantilla deterministica con bloques condicionales.
- Sharing: copiar texto y abrir WhatsApp con mensaje prellenado, bajo accion explicita del profesional.
- Destinatario: permitir elegir paciente o contacto principal cuando ambos tengan WhatsApp; si solo uno existe, sugerirlo; si no hay telefono, permitir copiar pero bloquear WhatsApp.
- Persistencia: no persistir el reporte ni metadata de compartido en MVP.
- Semantica visible: **"Mensaje de visita para compartir"** o **"Resumen compartible de visita"**. Evitar "certificado", "informe final" o "documento legal".

Esta solucion mantiene bajo el riesgo clinico, aprovecha los datos actuales, no contamina `Encounter.clinicalNote`, no requiere nuevos recursos FHIR y prepara una base clara para futuras fases de persistencia, PDF o IA.

## 2. Problema de producto

### 2.1 Necesidad concreta

El profesional necesita una forma rapida y segura de convertir el registro de una visita en un texto comprensible para paciente/familiar. El valor esta en:

- comunicar que se trabajo en la sesion;
- reforzar indicaciones domiciliarias registradas;
- recordar el proximo plan;
- compartir metricas puntuales cuando sean utiles;
- reducir redaccion manual repetitiva;
- mantener tono profesional sin convertirlo en documento formal.

### 2.2 Conceptos que deben separarse

**Registro clinico fuente del `Encounter`:**

- Es la fuente clinica interna.
- Vive en `Encounter.clinicalNote` y `Observation`.
- Debe conservarse como registro de lo ocurrido.
- No debe ser reemplazado por el texto compartible.

**Reporte/mensaje compartible para paciente/familiar:**

- Es una comunicacion derivada y revisable.
- Puede simplificar lenguaje.
- Puede omitir datos internos o sensibles.
- No es fuente de verdad clinica.

**Mensaje operativo de WhatsApp:**

- Es el canal/formato de envio.
- Puede incluir el reporte compartible como texto prellenado.
- No debe enviarse automaticamente.

**Documento final/revisado futuro:**

- Requeriria semantica de version, autor, fecha, estado, firma y posible persistencia.
- Podria vivir en `DocumentReference`, `Composition` o `Communication`, pero eso no corresponde al MVP.

### 2.3 Riesgos de confundir conceptos

- Guardar texto compartible como nota clinica fuente y perder trazabilidad.
- Presentar un mensaje familiar como informe legal/certificado.
- Incluir diagnosticos o interpretaciones que no fueron registradas para compartir.
- Enviar por WhatsApp datos administrativos innecesarios.
- Crear expectativas de "finalizado/validado" cuando solo es un resumen revisable.

### 2.4 Semantica recomendada

Para MVP, usar:

```txt
Resumen compartible de visita
```

Copy sugerido:

> Texto generado a partir de datos registrados. Revisalo antes de copiarlo o compartirlo. No reemplaza la nota clinica interna.

Evitar "borrador IA" porque no hay IA. Evitar "reporte final" porque no hay persistencia formal ni firma documental.

## 3. Datos disponibles

### 3.1 Datos actuales que pueden alimentar el reporte

Paciente:

- nombre completo;
- fecha de nacimiento para derivar edad;
- telefono del paciente;
- contacto principal: nombre, vinculo y telefono.

Tratamiento:

- estado activo/finalizado;
- fecha de inicio del ciclo;
- contexto clinico longitudinal read-only:
  - diagnostico medico de referencia;
  - diagnostico kinesico;
  - situacion funcional inicial;
  - objetivos terapeuticos;
  - plan marco.

Visita:

- fecha/hora de inicio;
- hora de cierre;
- duracion calculable;
- nota clinica estructurada:
  - `subjective`;
  - `objective`;
  - `intervention`;
  - `assessment`;
  - `tolerance`;
  - `homeInstructions`;
  - `nextPlan`.
- metricas funcionales:
  - TUG;
  - dolor NRS 0-10;
  - bipedestacion;
  - marcha.

Profesional firmante:

- nombre completo;
- titulo/rol visible;
- matricula;
- jurisdiccion/colegio;
- texto de firma;
- telefono profesional opcional.

### 3.2 Datos adecuados para compartir por defecto

- Primer nombre o nombre completo del paciente, segun tono elegido.
- Fecha de la visita.
- Duracion si es calculable y aporta contexto.
- Intervencion/trabajo realizado (`intervention`) en lenguaje claro.
- Tolerancia/respuesta si esta registrada (`tolerance`, `assessment`) sin inferir evolucion no documentada.
- Indicaciones domiciliarias (`homeInstructions`).
- Proximo plan (`nextPlan`).
- Metricas funcionales puntuales si estan registradas y se muestran sin interpretacion.
- Firma/display del profesional si esta listo para firmar o al menos completo parcialmente.

### 3.3 Datos internos que no deberian salir por defecto

- DNI.
- Domicilio.
- Telefono del paciente/contacto dentro del cuerpo del mensaje.
- IDs internos o FHIR.
- Solicitudes de atencion y estados administrativos.
- Puntualidad operativa de visita.
- Diagnosticos si no hay decision explicita de incluirlos.
- Baseline/objetivos completos del tratamiento, salvo que el profesional los agregue manualmente.
- Observaciones de otros encounters o historial de otros ciclos.

### 3.4 Datos faltantes

- Destinatario elegido para el mensaje.
- Proposito del envio.
- Estado de revision/finalizacion del texto compartible.
- Registro de compartido, si se quisiera persistir en futuro.
- Plantilla aprobada por producto/legal.
- Preferencia de privacidad: incluir o no diagnostico, metricas, firma completa.

## 4. Alternativas de ubicacion UX

### 4.1 Debajo del formulario de `/encounters/new`

Ventajas:

- El profesional esta en el momento de registrar la visita.
- Podria componer inmediatamente despues de cargar datos.

Desventajas:

- Antes de guardar no existe `Encounter.id`.
- Si hay fallo parcial de `Observation`, el reporte podria reflejar datos no persistidos.
- Mezcla registro clinico fuente con comunicacion externa.
- Aumenta carga cognitiva en una pantalla que ya registra la visita.

Evaluacion: no recomendado para MVP.

### 4.2 Generar despues de guardar y redirigir a `/encounters`

Ventajas:

- Usa datos persistidos.
- Encaja con el flujo actual de redirect `status=encounter-created`.
- Podria destacar la ultima visita creada.

Desventajas:

- Requiere estado/anchor para abrir panel automaticamente.
- Si se abre automaticamente, puede sentirse como paso obligatorio.
- Puede complicar el success flow actual.

Evaluacion: buena mejora futura, no necesaria para el primer MVP.

### 4.3 Panel/modal/drawer desde card de visita ya registrada

Ventajas:

- Usa datos persistidos.
- Mantiene `/encounters` como superficie natural de visitas.
- La accion es explicita y reversible.
- Permite revisar/editar sin cambiar la nota fuente.
- Escala a copiar/WhatsApp sin nueva ruta.

Desventajas:

- `EncountersList` ya tiene edicion inline de periodo; hay que cuidar densidad visual.
- Puede crecer el componente si no se separa bien.

Evaluacion: recomendado para MVP como panel inline por visita.

### 4.4 Ruta dedicada `/admin/patients/[id]/encounters/[encounterId]/report`

Ventajas:

- Espacio amplio para revision, destinatario, historial, persistencia futura.
- Buena base si luego hay PDF o documento final.

Desventajas:

- Agrega ruta y navegacion antes de validar utilidad.
- Puede parecer mas formal de lo que es.
- Mayor complejidad tecnica y documental.

Evaluacion: razonable para fase posterior, no MVP.

### 4.5 Accion secundaria en listado de visitas

Es compatible con 4.3. Recomendacion concreta:

- boton secundario `Preparar mensaje` o `Resumen para compartir`;
- aparece en cada card de visita;
- abre panel inline con textarea editable.

## 5. Flujo recomendado

Flujo MVP:

1. Profesional registra visita como hoy.
2. Vuelve a `/admin/patients/[id]/encounters`.
3. En la card de la visita, elige `Resumen para compartir`.
4. La app compone un texto deterministico con datos persistidos.
5. El panel muestra:
   - estado de completitud;
   - advertencias;
   - destinatario sugerido;
   - textarea editable;
   - botones `Regenerar desde datos`, `Copiar texto`, `Abrir WhatsApp`.
6. Profesional revisa y edita.
7. Si hay telefonos:
   - si paciente y contacto tienen WhatsApp, elige destinatario;
   - si solo uno tiene WhatsApp, se preselecciona;
   - si ninguno tiene WhatsApp, solo se permite copiar.
8. Al abrir WhatsApp, se usa mensaje prellenado. El envio final queda en manos del profesional.
9. No se persiste el texto ni se marca como compartido en MVP.

Reglas:

- No generar automaticamente al guardar.
- No enviar automaticamente.
- Permitir regenerar desde datos persistidos, aclarando que sobrescribe ediciones locales.
- Permitir descartar cerrando el panel.
- No bloquear registrar visitas por falta de datos para reporte.

## 6. Plantilla/composicion

### 6.1 Estrategia recomendada

Usar **plantilla deterministica + bloques condicionales + textarea editable**.

Motivos:

- No inventa datos.
- Es testeable.
- Es rapida de implementar.
- Prepara una baseline clara para IA futura.
- Mantiene revision humana.

### 6.2 Estructura base posible

```txt
Hola {destinatarioNombre}.

Resumen de la visita de kinesiologia de {pacienteNombre} del {fecha}.

Trabajamos sobre:
{intervention}

Respuesta/tolerancia durante la sesion:
{tolerance/assessment}

Metricas registradas:
- Dolor: {pain}/10
- TUG: {tug} s
- Bipedestacion: {standing} min
- Marcha: {gait} min

Indicaciones para casa:
{homeInstructions}

Proximo plan:
{nextPlan}

{signatureDisplay | fullName + roleTitle + licenseNumber}
```

Bloques condicionales:

- Si no hay metricas, omitir "Metricas registradas".
- Si no hay indicaciones, omitir bloque o mostrar advertencia fuera del texto.
- Si no hay proximo plan, omitir bloque o advertir.
- Si no hay firma lista, incluir solo nombre/rol si existe y advertir.

### 6.3 Reglas de contenido

- Usar solo datos explicitamente registrados.
- No interpretar metricas.
- No afirmar mejoria/empeoramiento salvo que `assessment` lo diga.
- No agregar recomendaciones no registradas.
- No incluir diagnostico por defecto en WhatsApp.
- No incluir DNI, domicilio ni IDs.
- Mantener tono profesional, simple y entendible.
- Evitar lenguaje de certificado/legal.

## 7. Completitud minima

### 7.1 Estados propuestos

**Suficiente/listo:**

- visita tiene fecha;
- tiene al menos `intervention`;
- tiene `homeInstructions` o `nextPlan`;
- tiene destinatario WhatsApp o se permite copiar;
- profesional firmante `ready` o al menos `fullName + roleTitle`.

**Incompleto pero utilizable con advertencia:**

- tiene fecha y algun contenido clinico (`intervention`, `assessment`, `tolerance`, `homeInstructions`, `nextPlan`) o metricas;
- falta firma lista;
- faltan indicaciones o proximo plan;
- faltan telefonos, pero se puede copiar.

**Insuficiente/no recomendable:**

- solo tiene fecha/duracion sin nota ni metricas;
- solo tiene datos operativos internos;
- no hay contenido compartible registrado.

### 7.2 Evaluacion de campos

- Metricas solas no son ideales, pero pueden ser "incompleto utilizable" si el profesional edita texto antes de compartir.
- `intervention` es el campo mas importante para explicar que se trabajo.
- `homeInstructions` y `nextPlan` son muy valiosos para paciente/familiar, pero no deberian bloquear generar.
- Falta de profesional firmante no debe bloquear preparar/copiar; deberia advertir.
- Falta de destinatario/telefono solo bloquea WhatsApp, no el armado del texto.

## 8. Compartir con paciente o familiar

### 8.1 Estrategia MVP recomendada

Implementar:

- `Copiar texto`.
- `Abrir WhatsApp` con mensaje prellenado.
- Selector de destinatario cuando existan paciente y contacto principal.
- Fallback automatico al contacto principal si no hay telefono del paciente.
- Advertencia antes de abrir WhatsApp:

> Revisá el texto antes de compartirlo. WhatsApp abrirá el mensaje prellenado, pero el envío final depende de vos.

No implementar:

- WhatsApp Business API.
- Envio automatico.
- Registro persistido de compartido.

### 8.2 Datos sensibles en WhatsApp

No incluir por defecto:

- DNI;
- domicilio;
- telefono;
- diagnosticos;
- historia longitudinal;
- solicitudes administrativas;
- datos de otros familiares;
- IDs internos.

## 9. Persistencia

### 9.1 Recomendacion MVP

No persistir el reporte en MVP.

Motivos:

- Evita confundir texto compartible con nota clinica fuente.
- Evita versionado temprano.
- Reduce riesgo legal/privacidad.
- Permite validar utilidad de la plantilla.
- No requiere nuevos recursos FHIR.

### 9.2 Alternativas futuras

**Persistir texto editado como reporte revisado:**

- Requiere autor, fecha, estado, version y semantica de aprobacion.
- Posibles recursos: `DocumentReference` o `Composition`.

**Persistir metadata de "compartido":**

- Podria modelarse como `Communication`.
- Riesgo: requiere decidir destinatario, canal, fecha y privacy/audit.

**Persistir en `Encounter.extension`:**

- No recomendado para reporte final: mezcla derivado compartible con recurso fuente.

**Persistir historial de reportes:**

- Fase posterior si hay necesidad de trazabilidad formal.

## 10. Arquitectura tecnica propuesta

### 10.1 Boundaries recomendados

Crear feature module:

```txt
src/features/visit-share-report/
  visit-share-report.types.ts
  visit-share-report.completeness.ts
  visit-share-report.composer.ts
  visit-share-report.whatsapp.ts
  visit-share-report.read-model.ts
  __tests__/
```

UI route-local:

```txt
src/app/admin/patients/[id]/encounters/components/
  VisitShareReportPanel.tsx
  VisitShareReportAction.tsx
```

### 10.2 Responsabilidades

Loader/read model:

- `loadEncounterShareableReportContext({ patientId, encounterId })`;
- paciente/contactos minimos;
- encounter seleccionado;
- functional observations del encounter;
- contexto clinico solo si se decide incluir o usar para warnings;
- profesional firmante;
- sin FHIR crudo.

Composer:

- recibe contexto sanitizado;
- genera texto deterministico;
- devuelve bloques, warnings y texto inicial.

Completitud:

- calcula `ready | usable_with_warnings | insufficient`;
- lista faltantes.

WhatsApp:

- resuelve destinatarios disponibles;
- construye `wa.me` con `text=` encoded;
- no envia.

UI:

- panel inline;
- textarea local;
- botones copiar/WhatsApp/regenerar/descartar;
- selector destinatario.

Server Actions:

- no necesarias si no se persiste.
- Si se agrega persistencia futura, usar Server Action + Zod.

## 11. Seguridad, privacidad y contenido

Principios:

- Minimo dato para el canal.
- Revision humana obligatoria.
- No diagnostico por defecto.
- No DNI/domicilio/contactos en cuerpo.
- No IDs internos.
- No metricas interpretadas.
- No recomendaciones nuevas.

Diagnostico:

- Para MVP, no incluir diagnostico por defecto en WhatsApp familiar.
- Si se agrega toggle futuro, debe ser explicito y visible.

Metricas:

- Incluir solo valores registrados, no conclusiones.
- Ejemplo: "Dolor registrado: 4/10"; no "mejoro el dolor".

## 12. Relacion con futura IA

Esta funcionalidad prepara el terreno para IA sin implementarla:

- El read model sanitizado puede servir como payload futuro.
- La plantilla deterministica es baseline y fallback.
- Los tests de exclusion de datos sensibles sirven tambien para IA.
- La edicion humana ya queda como parte natural del flujo.
- Separar composer/read-model/UI evita contaminar repositorios FHIR con prompts.

Decisiones que facilitan IA futura:

- no persistir texto generado como fuente clinica;
- mantener source facts/datos explicitos;
- completar firmante;
- evitar diagnostico por defecto en canales informales.

No agregar ahora:

- OpenAI;
- Vercel AI SDK;
- prompts;
- variables de entorno de IA.

## 13. Tests recomendados

- Composer:
  - compone texto con `intervention`, `homeInstructions`, `nextPlan`;
  - omite bloques vacios;
  - incluye metricas solo si existen;
  - no interpreta metricas.
- Completitud:
  - listo con intervencion + indicaciones/proximo plan;
  - usable con warnings si faltan indicaciones;
  - insuficiente con solo fecha/duracion.
- Privacidad:
  - excluye DNI;
  - excluye domicilio;
  - excluye telefonos del cuerpo;
  - excluye IDs FHIR.
- Destinatario/WhatsApp:
  - prioriza paciente si se elige paciente;
  - permite contacto principal;
  - fallback a contacto si paciente no tiene WhatsApp;
  - no ofrece WhatsApp si no hay telefono valido;
  - encodea correctamente texto con saltos de linea.
- UI:
  - muestra panel;
  - estados listo/incompleto/insuficiente;
  - copy button;
  - warning antes de WhatsApp;
  - selector si hay dos destinatarios.
- Integracion:
  - no modifica `Encounter.clinicalNote`;
  - usa profesional firmante ready/incomplete/missing;
  - flujo post-guardado puede destacar visita creada si se implementa.

## 14. Plan incremental

### Fase 0 - Auditoria/decision

Estado: este documento.

### Fase 1 - Read model + composer deterministico

Alcance:

- `EncounterShareableReportContext`;
- composer;
- completitud;
- tests de privacidad y plantilla;
- sin UI productiva.

### Fase 2 - UI inline en card de visita

Alcance:

- accion secundaria en `EncountersList`;
- panel inline;
- textarea editable;
- copiar/regenerar/descartar;
- warnings.

### Fase 3 - WhatsApp prellenado

Alcance:

- selector paciente/contacto principal;
- link `wa.me` con texto;
- advertencia previa;
- fallback copy-only sin telefono.

### Fase 4 - Post-guardado

Alcance:

- opcion de destacar la visita recien creada;
- abrir panel bajo accion explicita, no automatico obligatorio.

### Fase 5 - Persistencia opcional

Alcance:

- decidir `Communication`, `DocumentReference` o `Composition`;
- versionado/autor/estado;
- solo si el uso real lo justifica.

### Fase 6 - IA futura

Alcance:

- usar read model sanitizado;
- mantener composer deterministico como fallback;
- revision humana obligatoria.

## 15. No-alcances

- No implementar codigo en esta auditoria.
- No implementar IA.
- No agregar OpenAI, Vercel AI SDK ni variables de entorno de IA.
- No generar reporte evolutivo.
- No generar PDF.
- No enviar WhatsApp automaticamente.
- No integrar WhatsApp Business API.
- No tocar landing publica, GA4, SEO ni rutas publicas.
- No agregar portal, agenda, pagos ni dashboard clinico.
- No agregar `Procedure`, `Goal`, `PractitionerRole` ni `Organization`.
- No modificar recursos FHIR existentes salvo decision posterior justificada.
- No guardar el reporte como nota clinica fuente.
- No tratar el mensaje compartible como documento legal/final.

## 16. Checklist documental

Si se implementa Fase 1-3:

- `README.md`: actualizar si se agrega funcionalidad visible de reporte compartible.
- `docs/fuente-de-verdad-operativa.md`: documentar ruta/superficie, semantica y no-alcances.
- `docs/product/*`: actualizar esta auditoria con cierre de patch.
- `docs/fhir/*`: no requiere cambio si no hay persistencia FHIR nueva.
- Tests: composer, completitud, WhatsApp, UI y privacidad.

En esta auditoria:

- Documentos actualizados: se agrega este documento en `docs/product/`.
- README: no requiere actualizacion porque no cambia comportamiento implementado.
- `docs/fuente-de-verdad-operativa.md`: no requiere actualizacion porque no cambia runtime.
- `docs/fhir/README.md`: no requiere actualizacion porque no se agrega persistencia FHIR.
- Fuera de alcance preservado: IA, reportes persistidos, PDF, WhatsApp automatico, rutas publicas, GA4, SEO, portal, agenda, pagos y dashboard clinico.
