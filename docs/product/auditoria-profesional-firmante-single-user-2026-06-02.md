# Auditoria tecnica y de producto - Profesional firmante single-user

Fecha: 2026-06-02  
Estado: implementado/cerrado hasta Patch 3, sin IA ni reportes  
Alcance: configuracion minima del profesional firmante en la superficie privada `/admin`, sin IA, sin reportes clinicos y sin multiusuario.

## 0. Cierre de implementacion

Estado al cierre documental del 2026-06-02:

- Patch 1 implementado: dominio `SigningProfessionalConfig`, schema, reglas, tipos/mappers FHIR `Practitioner` y tests.
- Patch 2 implementado: repository `getSigningProfessionalConfig()` / `upsertSigningProfessionalConfig()`, loader reusable `loadSigningProfessionalConfig()`, busqueda por identifier singleton y tests mockeados.
- Patch 3 implementado: ruta privada `/admin/configuracion/profesional`, link `Configuracion` en navegacion privada, lectura primero + edicion explicita, formulario directo en estado `missing`, Server Action y tests de UI/action.
- Validacion HAPI real ejecutada: `/metadata` respondio HTTP 200 (`CapabilityStatement`) y `Practitioner?identifier=...|primary` respondio HTTP 200 (`Bundle`, `total=0`) antes de crear datos.
- Validacion manual ejecutada por usuario: guardado y edicion desde `/admin/configuracion/profesional` funcionando correctamente contra el entorno local.
- Validacion automatizada: `npm test -- --run` con 88 archivos y 586 tests passing; `npx tsc --noEmit` passing.
- No-alcances preservados: sin IA, sin reportes, sin persistencia de reportes, sin multiusuario, sin `PractitionerRole`, sin `Organization`, sin cambios en rutas publicas, landing, GA4 ni SEO.

## 1. Recomendacion ejecutiva

Conviene implementar una configuracion de **profesional firmante unico** antes de avanzar con reportes clinicos. La auditoria de IA para reportes clinicos ya marco como faltante la identidad profesional, matricula, rol y firma. Resolver este dato ahora reduce riesgo futuro: evita que reportes o documentos tengan que inventar o hardcodear datos profesionales.

La recomendacion para esta etapa es modelar el firmante como un recurso FHIR **`Practitioner` unico**, administrado desde una ruta privada simple: `/admin/configuracion/profesional`. No se recomienda `PractitionerRole`, `Organization`, multiusuario ni auth compleja en esta fase. Tampoco se recomienda usar constantes o env vars como fuente principal, porque no dan UI de edicion ni buena trazabilidad operacional.

Para mantener el modelo simple y evolutivo, el `Practitioner` debe tener un identificador tecnico singleton, por ejemplo:

```txt
system: https://kinesiologiaadomicilio.local/fhir/sid/signing-practitioner-config
value: primary
```

Ese identificador no representa una matricula; solo permite encontrar "el profesional firmante configurado para esta instalacion". La matricula profesional se guarda como un identificador separado.

## 2. Estado actual

### 2.1 Hallazgos en codigo y documentacion

Hallazgo original previo a la implementacion:

- No existe dominio `professional`, `practitioner`, `signature` o `settings`.
- No existen mappers/repositorios `Practitioner`.
- No existe ruta privada de configuracion.
- La navegacion privada en `src/app/admin/layout.tsx` solo expone `Pacientes` y `Nuevo paciente`.
- No hay uso de datos profesionales en `/admin` para firmar documentos, notas o reportes.
- La auditoria de IA en `docs/product/auditoria-feature-ia-reportes-clinicos-2026-06-02.md` lista como faltante: autor profesional, identidad profesional, matricula, rol y firma.

Estado implementado al cierre:

- Existe dominio `src/domain/signing-professional`.
- Existen mappers FHIR `src/infrastructure/mappers/practitioner`.
- Existe repository `src/infrastructure/repositories/practitioner.repository.ts`.
- Existe loader reusable `src/features/signing-professional/read-models/signing-professional-config.read-model.ts`.
- Existe ruta privada `/admin/configuracion/profesional`.
- La navegacion privada expone link `Configuracion`.
- La UI no genera reportes ni firma documentos; solo configura el firmante.

Si existen menciones publicas de profesional en la landing, por ejemplo textos de marketing sobre Ramiro/kinesiologo y experiencia profesional. Esos textos no deben tomarse como fuente clinica ni como configuracion firmante: pertenecen a captacion publica, no a la superficie privada ni a persistencia clinica.

Tambien existen decisiones historicas sobre `ServiceRequest.requester` donde se evito crear `Practitioner`/`RelatedPerson` para solicitantes. Esa decision no bloquea este caso: el firmante clinico propio tiene semantica distinta a un solicitante informado por una familia o derivador.

### 2.2 Riesgo actual

Si se implementaran reportes sin resolver el firmante:

- habria tentacion de hardcodear nombre/matricula en componentes o prompts;
- se podria mezclar dato profesional con `Patient`, `EpisodeOfCare` o `Encounter`;
- faltaria una fuente unica para documentos revisados/finales;
- seria mas dificil migrar luego a multi-profesional.

## 3. Comparacion de alternativas

### 3.1 Configuracion local propia del sistema

Ejemplos: archivo JSON local, tabla propia futura, storage interno no FHIR.

Ventajas:

- Simple conceptualmente.
- No requiere discutir mapeo FHIR.
- Puede ser agnostica al servidor HAPI.

Desventajas:

- El proyecto no tiene hoy una base propia separada de FHIR.
- Un archivo local no es buena persistencia para despliegues serverless o multi-entorno.
- Agrega una segunda fuente de persistencia clinico-operativa.
- Luego habria que migrar a FHIR o duplicar datos para documentos clinicos.

Evaluacion: razonable solo si el proyecto incorporara una base propia de configuracion. Hoy no parece el camino mas limpio.

### 3.2 FHIR `Practitioner`

Ventajas:

- Es el recurso FHIR correcto para representar una persona profesional.
- Puede contener nombre, telecom, identificadores y calificaciones.
- Evoluciona bien si mas adelante se referencia desde reportes, `Composition`, `DocumentReference`, `Encounter.participant` o auditoria.
- Mantiene persistencia clinica en el mismo backend FHIR/HAPI.
- No obliga a multiusuario.

Desventajas:

- Requiere mappers/repositorio nuevos.
- Hay que definir una estrategia para encontrar el firmante unico.
- Hay que protegerse contra duplicados o ambiguedad.
- HAPI puede requerir validar busquedas por `identifier`.

Evaluacion: mejor opcion para esta etapa si se mantiene acotada.

### 3.3 FHIR `PractitionerRole`

Ventajas:

- Modela rol, especialidad, organizacion, periodo y disponibilidad.
- Es mas correcto cuando un profesional puede tener multiples roles o instituciones.

Desventajas:

- Exige mas modelo del necesario.
- Suele involucrar `Organization`, que esta fuera de alcance.
- Agrega complejidad sin beneficio inmediato para single-user.

Evaluacion: no recomendado ahora. Puede aparecer si hay multi-profesional, varias instituciones, roles por cobertura o agenda.

### 3.4 Constantes o env vars

Ventajas:

- Muy simple.
- Sin mappers ni UI.
- Util para defaults de desarrollo.

Desventajas:

- No hay edicion desde `/admin`.
- No hay estado "sin configurar/incompleto/listo".
- Riesgo de filtrar o acoplar datos en deploy/config.
- Mala base para futura firma clinica revisada.

Evaluacion: no usar como fuente principal. Puede servir como fallback local de desarrollo o para prefill inicial si se decide, pero no como persistencia del producto.

### 3.5 Combinacion incremental recomendada

Recomendacion:

- Fuente de verdad: FHIR `Practitioner`.
- Localizador singleton: `Practitioner.identifier` tecnico `signing-practitioner-config|primary`.
- Matricula: `Practitioner.identifier` separado.
- Rol/titulo visible: `Practitioner.qualification.code.text` o extension propia si se prefiere simplicidad de mapper.
- Texto de firma/display: extension propia `practitioner-signature-display`.
- Telefono profesional: `Practitioner.telecom` opcional.
- Sin `PractitionerRole` y sin `Organization` en esta fase.

## 4. Modelo de datos propuesto

### 4.1 Dominio app

Tipo de dominio recomendado:

```ts
export interface SigningProfessionalConfig {
  id?: string;
  fullName: string;
  roleTitle: string;
  licenseNumber: string;
  licenseJurisdiction?: string;
  signatureDisplay?: string;
  professionalPhone?: string;
  status: "missing" | "incomplete" | "ready";
}
```

Input de escritura:

```ts
export interface UpsertSigningProfessionalInput {
  fullName: string;
  roleTitle: string;
  licenseNumber?: string;
  licenseJurisdiction?: string;
  signatureDisplay?: string;
  professionalPhone?: string;
}
```

### 4.2 Campos obligatorios para "listo para firmar"

Para considerar la configuracion **lista para firmar**:

- `fullName`: obligatorio.
- `roleTitle`: obligatorio.
- `licenseNumber`: obligatorio.

Campos recomendados pero no bloqueantes:

- `licenseJurisdiction`: recomendado cuando corresponda por provincia/colegio.
- `signatureDisplay`: opcional; si falta, puede derivarse para display desde nombre + rol + matricula.
- `professionalPhone`: opcional; no deberia bloquear firma.

Regla de producto: si falta matricula, la configuracion queda `incomplete`. La app puede seguir operando, pero futuras funciones de reporte deberian mostrar advertencia o bloquear emision final segun el tipo de documento.

### 4.3 Mapeo FHIR `Practitioner`

Propuesta de recurso:

```json
{
  "resourceType": "Practitioner",
  "active": true,
  "identifier": [
    {
      "system": "https://kinesiologiaadomicilio.local/fhir/sid/signing-practitioner-config",
      "value": "primary"
    },
    {
      "system": "https://kinesiologiaadomicilio.local/fhir/sid/professional-license",
      "value": "12345",
      "type": { "text": "Matricula profesional" }
    }
  ],
  "name": [
    {
      "text": "Nombre Apellido"
    }
  ],
  "telecom": [
    {
      "system": "phone",
      "value": "299...",
      "use": "work"
    }
  ],
  "qualification": [
    {
      "code": { "text": "Lic. en Kinesiologia" },
      "issuer": { "display": "Colegio/Jurisdiccion opcional" }
    }
  ],
  "extension": [
    {
      "url": "https://kinesiologiaadomicilio.local/fhir/StructureDefinition/practitioner-signature-display",
      "valueString": "Lic. Nombre Apellido - MP 12345"
    }
  ]
}
```

Notas:

- `identifier[0]` es tecnico y estable para localizar el singleton.
- La matricula no debe mezclarse con el identificador singleton.
- `qualification.issuer.display` evita crear `Organization` solo para mostrar jurisdiccion/colegio.
- `signatureDisplay` como extension es pragmatico: no es una calificacion ni un identificador, es texto de presentacion.

### 4.4 Busqueda y duplicados

Lectura:

```txt
GET Practitioner?identifier=https://kinesiologiaadomicilio.local/fhir/sid/signing-practitioner-config|primary
```

Comportamiento:

- Cero resultados: estado `missing`.
- Un resultado: mapear a dominio y calcular `ready/incomplete`.
- Mas de un resultado: estado ambiguo; no elegir silenciosamente. Mostrar error operativo y bloquear escritura automatica hasta resolver.

Escritura:

- Si no existe, crear `Practitioner` con identificador singleton.
- Si existe uno, hacer `GET -> merge -> PUT` para preservar campos externos no manejados por la app.
- Si existen varios, no escribir; devolver error claro.

## 5. UI/UX recomendada

### 5.1 Ruta

Ruta recomendada: `/admin/configuracion/profesional`.

Motivos:

- Mantiene idioma coherente con la UI privada.
- No obliga a crear una pagina general de settings.
- Deja espacio para futuras configuraciones bajo `/admin/configuracion/*`.
- Evita mezclar esta responsabilidad con pacientes o tratamiento.

Alternativas:

- `/admin/settings/professional`: consistente con ingles tecnico, pero el resto de la UI esta en español.
- `/admin/profesional`: mas corta, pero menos clara si luego hay otras configuraciones.

### 5.2 Acceso desde navegacion privada

Agregar un link secundario en el header privado:

```txt
Configuracion
```

O si se quiere evitar abrir una seccion general, link directo:

```txt
Profesional
```

Recomendacion de UX: empezar con link `Configuracion` que apunta directamente a `/admin/configuracion/profesional`. Si luego hay mas settings, se puede convertir en indice sin romper URLs.

### 5.3 Jerarquia visual

Si no hay datos:

- Mostrar estado vacio y formulario directo.
- Titulo: "Profesional firmante".
- Copy: "Configura los datos que se usaran mas adelante para firmar reportes o documentos clinicos revisados."

Si hay datos:

- Lectura primero.
- Badge de estado: `Sin configurar`, `Incompleto`, `Listo para firmar`.
- Boton `Editar datos`.
- Formulario aparece solo al editar.

Esto reduce edicion accidental de datos que tendran valor legal/clinico.

### 5.4 Estados y copy

Sin configurar:

> Todavia no hay profesional firmante configurado. Completa estos datos antes de emitir reportes o documentos clinicos revisados.

Incompleto:

> La configuracion existe, pero falta informacion necesaria para firmar. Revisa nombre, rol y matricula.

Listo para firmar:

> Profesional firmante listo. Estos datos podran usarse en reportes o documentos revisados cuando esa funcion exista.

Error de guardado:

> No se pudo guardar la configuracion del profesional. Reintenta en unos minutos.

Duplicado/ambiguedad FHIR:

> Hay mas de un profesional marcado como firmante principal. No se puede elegir uno automaticamente.

## 6. Arquitectura tecnica propuesta

### 6.1 Estructura de carpetas futura

```txt
src/domain/signing-professional/
  signing-professional.types.ts
  signing-professional.schemas.ts
  signing-professional.rules.ts
  __tests__/

src/infrastructure/mappers/practitioner/
  practitioner-fhir.types.ts
  practitioner-read.mapper.ts
  practitioner-write.mapper.ts
  practitioner.constants.ts
  __tests__/

src/infrastructure/repositories/
  practitioner.repository.ts

src/app/admin/configuracion/profesional/
  page.tsx
  data.ts
  actions.ts
  components/
    SigningProfessionalForm.tsx
    SigningProfessionalSummary.tsx
```

### 6.2 Boundaries

- Dominio:
  - tipos propios de configuracion firmante;
  - schemas Zod;
  - reglas de completitud.
- Mapper FHIR:
  - conversion `Practitioner` <-> dominio;
  - preservacion de campos externos en update.
- Repository:
  - busqueda por identificador singleton;
  - create/update;
  - deteccion de duplicados.
- Loader/read model:
  - `loadSigningProfessionalPageData()`;
  - no expone FHIR crudo.
- Server Action:
  - valida input con Zod;
  - llama reglas de dominio;
  - persiste por repository;
  - revalida `/admin/configuracion/profesional`.
- UI:
  - solo consume read model y action result;
  - no conoce FHIR.

### 6.3 Reglas tecnicas

- No agregar IA, prompts, providers ni variables de entorno de IA.
- No modificar `Patient`, `EpisodeOfCare` ni `Encounter`.
- No introducir `Organization`.
- No crear `PractitionerRole` hasta que exista necesidad real.
- No agregar auth/multiusuario.
- No guardar datos profesionales en textos publicos ni constantes de UI.

## 7. Validaciones y reglas

### 7.1 Normalizacion

- `fullName`: trim, colapsar espacios internos, max 160.
- `roleTitle`: trim, max 120.
- `licenseNumber`: trim, preservar guiones/barras si el colegio los usa, max 80.
- `licenseJurisdiction`: trim, max 160.
- `signatureDisplay`: trim, max 240.
- `professionalPhone`: trim, max 60; validacion laxa para telefono humano, no bloquear por formato internacional perfecto.

### 7.2 Reglas de completitud

```txt
missing: no existe Practitioner singleton.
incomplete: existe, pero falta fullName, roleTitle o licenseNumber.
ready: existen fullName, roleTitle y licenseNumber.
ambiguous: hay mas de un Practitioner singleton.
```

`ambiguous` puede modelarse fuera del status de dominio normal como error de repository/read model, porque requiere intervencion tecnica o administrativa.

### 7.3 Falta de matricula

La falta de matricula no debe bloquear la app clinica actual. Si mas adelante existen reportes:

- borradores: permitir con warning;
- reportes finales/firmados: bloquear o exigir confirmacion fuerte, segun decision legal/producto.

### 7.4 Duplicados

Si se detectan multiples `Practitioner` con `signing-practitioner-config|primary`:

- no hacer upsert;
- no elegir por fecha ni primer resultado;
- mostrar error operativo;
- registrar `console.error` sin datos sensibles excesivos;
- resolver manualmente en HAPI o con herramienta de mantenimiento futura.

## 8. Riesgos

### 8.1 Riesgos de `Practitioner`

- Ambiguedad si se crean duplicados por fuera de la app.
- Necesidad de validar busqueda `identifier` contra HAPI local.
- Dudas sobre jurisdiccion/matricula si hay mas de una matricula.
- Extension propia para `signatureDisplay` requiere documentacion FHIR.

Mitigacion:

- Identificador singleton tecnico.
- Tests de mapper/repositorio.
- Documentar extension y sistemas de identificadores.
- Preservar datos externos en update.

### 8.2 Riesgos de no usar FHIR

- Segunda persistencia sin necesidad.
- Dificultad para referenciar firmante desde documentos clinicos.
- Mas migracion futura.

### 8.3 Riesgos de usar env vars/constantes

- Hardcoding de datos con valor profesional.
- Sin UI ni estado de completitud.
- Riesgo de divergencia entre entornos.

## 9. Plan incremental por patches

### Patch 0 - Documentacion y decision

Estado: completado.

Entregables:

- Decision recomendada.
- Modelo de datos.
- Ruta/UI propuesta.
- Plan de tests.
- Checklist documental.

### Patch 1 - Dominio y mappers FHIR

Alcance:

- Tipos `SigningProfessionalConfig`.
- Schema Zod de upsert.
- Reglas `getSigningProfessionalStatus`.
- Tipos FHIR minimos de `Practitioner`.
- Mapper read/write.
- Constantes de identificadores/extensiones.
- Tests unitarios.

Estado: completado.

### Patch 2 - Repository y loader

Alcance:

- `getSigningProfessionalConfig()`.
- `upsertSigningProfessionalConfig()`.
- Busqueda por identifier singleton.
- Create si no existe.
- GET -> merge -> PUT si existe.
- Error si hay duplicados.
- Loader de pagina.
- Tests con `fhirClient` mockeado.

Estado: completado.

### Patch 3 - UI privada minima

Alcance:

- Ruta `/admin/configuracion/profesional`.
- Link privado en admin layout.
- Vista de estado.
- Formulario de creacion/edicion.
- Server Action.
- Mensajes de exito/error.
- Tests de render y action.

Estado: completado y validado manualmente.

### Patch 4 - Preparacion para reportes futuros

Alcance:

- Exponer read model reusable para futuras features de documentos.
- Agregar helper `assertSigningProfessionalReadyForFinalReport()`.
- Documentar consumo futuro, sin implementar reportes.

Estado: pendiente futuro. No es necesario para considerar cerrada la configuracion single-user basica.

## 10. Tests recomendados

### 10.1 Schemas y reglas

- Normaliza espacios en nombre, rol y matricula.
- Rechaza nombre vacio.
- Rechaza rol vacio.
- Permite matricula vacia pero marca `incomplete`.
- Aplica max length por campo.
- Calcula `missing`, `incomplete` y `ready`.

### 10.2 Mapper FHIR

- Mapea `Practitioner.name[0].text` a `fullName`.
- Mapea `qualification.code.text` a `roleTitle`.
- Mapea identifier de matricula a `licenseNumber`.
- Mapea `qualification.issuer.display` a `licenseJurisdiction`.
- Mapea extension `signatureDisplay`.
- Preserva identifiers externos al aplicar update.
- Preserva telecom externo no manejado cuando corresponda.
- No confunde singleton identifier con matricula.

### 10.3 Repository

- Cero resultados devuelve `null` o estado `missing`.
- Un resultado se mapea correctamente.
- Multiples resultados generan error de ambiguedad.
- Create agrega identificador singleton.
- Update usa GET -> merge -> PUT.
- 404 en GET individual se maneja como no encontrado cuando corresponda.

### 10.4 Server Action

- Valida input con schema.
- Devuelve error amigable ante fallo FHIR.
- No escribe si hay duplicados.
- Revalida la ruta de configuracion al guardar.
- No toca rutas de pacientes/tratamientos/visitas.

### 10.5 UI

- Renderiza estado sin configurar.
- Renderiza estado incompleto.
- Renderiza estado listo para firmar.
- Muestra formulario directo cuando no hay datos.
- Muestra lectura primero y boton editar cuando hay datos.
- Muestra error de guardado.
- Muestra error de duplicado/ambiguedad.

## 11. Documentacion a actualizar si se implementa

Segun `docs/checklist-sincronizacion-doc-codigo.md`, al implementar deberian actualizarse:

- `README.md`: si se agrega ruta privada nueva y comportamiento vigente de configuracion profesional.
- `docs/fuente-de-verdad-operativa.md`: describir la nueva fuente operativa del profesional firmante.
- `docs/fhir/README.md`: agregar `Practitioner` como recurso usado por la app.
- Nuevo documento FHIR especifico, por ejemplo `docs/fhir/fhir-practitioner-profesional-firmante.md`, con:
  - identificador singleton;
  - sistema de matricula;
  - extension `practitioner-signature-display`;
  - reglas de duplicado.
- `docs/product/*`: esta auditoria puede quedar como decision de producto; si se implementa, agregar cierre o actualizacion de estado.

No requieren cambios si solo se deja esta auditoria:

- rutas publicas;
- GA4;
- SEO;
- landing;
- docs de IA/reportes, salvo referencia futura si se desea.

## 12. No-alcances explicitos

- No implementar IA.
- No agregar OpenAI, Vercel AI SDK ni variables de entorno de IA.
- No implementar reportes clinicos.
- No persistir reportes.
- No crear multiusuario.
- No crear portal.
- No agregar agenda, pagos ni dashboard clinico.
- No tocar landing publica, GA4, SEO ni rutas publicas.
- No modificar `Patient`, `EpisodeOfCare` ni `Encounter`.
- No crear `Organization`.
- No crear `PractitionerRole`.
- No usar datos de marketing publico como fuente de firma clinica.

## 13. Sincronizacion documentacion/codigo

Revision segun `docs/checklist-sincronizacion-doc-codigo.md`:

- Documentos actualizados:
  - `README.md`: agrega ruta privada `/admin/configuracion/profesional` y funcionalidad de configuracion profesional.
  - `docs/fuente-de-verdad-operativa.md`: agrega ruta, responsabilidad y cierre tecnico/UI del profesional firmante.
  - `docs/fhir/README.md`: agrega documento activo de `Practitioner`.
  - `docs/fhir/fhir-practitioner-profesional-firmante.md`: documenta singleton, matricula, extension de firma, preservacion y validacion HAPI.
  - `docs/product/auditoria-profesional-firmante-single-user-2026-06-02.md`: este cierre.
- Rutas privadas agregadas:
  - `/admin/configuracion/profesional`.
- Dominio/schemas/rules agregados:
  - `src/domain/signing-professional/*`.
- Mappers/repositorios FHIR agregados:
  - `src/infrastructure/mappers/practitioner/*`.
  - `src/infrastructure/repositories/practitioner.repository.ts`.
- Loader/action/UI agregados:
  - `src/features/signing-professional/read-models/signing-professional-config.read-model.ts`.
  - `src/app/admin/configuracion/profesional/*`.
  - link en `src/app/admin/layout.tsx`.
- Tests agregados:
  - schema/reglas;
  - mapper;
  - repository;
  - loader;
  - Server Action;
  - page/panel/layout.
- Validacion ejecutada:
  - `npm test -- --run`;
  - `npx tsc --noEmit`;
  - HAPI real `/metadata` y busqueda `Practitioner?identifier=...|primary`;
  - prueba manual de guardado/edicion desde UI.
- Fuera de alcance deliberado: IA, reportes, persistencia de reportes, multiusuario, portal, agenda, pagos, dashboard clinico, landing publica, GA4, SEO, rutas publicas, `PractitionerRole`, `Organization`.
