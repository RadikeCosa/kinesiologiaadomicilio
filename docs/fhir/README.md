# Contrato FHIR activo

> Estado: fuente técnica activa para migración
> Fecha: 2026-09-11
> Alcance: persistencia FHIR R4 realmente implementada y decisiones que deben preservarse al reconstruir la aplicación privada.

## 1. Frontera arquitectónica

FHIR pertenece a infraestructura. La UI y los casos de uso trabajan con dominio propio.

```text
UI -> caso de uso -> dominio -> repositorio -> mapper -> HAPI FHIR R4
```

En la aplicación nueva:

- el navegador no conocerá `FHIR_BASE_URL`;
- la PWA no enviará recursos FHIR;
- la API privada aplicará autenticación, reglas e idempotencia;
- el adaptador traducirá entre dominio y FHIR;
- HAPI FHIR seguirá siendo la fuente clínica confirmada durante V1.

## 2. Entornos actuales

- `http://localhost:8081/fhir`: dev/test descartable y única fuente permitida para demo o screenshots.
- `http://localhost:8080/fhir`: local-real; puede contener datos reales y nunca debe usarse como demo.

La selección se realiza mediante `FHIR_BASE_URL`, server-side, con un solo endpoint por ejecución.

## 3. Recursos activos

| Dominio | Recurso FHIR | Relación principal |
|---|---|---|
| Paciente | `Patient` | Eje longitudinal |
| Solicitud | `ServiceRequest` | `subject -> Patient` |
| Tratamiento | `EpisodeOfCare` | `patient -> Patient`, `referralRequest -> ServiceRequest` |
| Visita | `Encounter` | `subject -> Patient`, `episodeOfCare -> EpisodeOfCare` |
| Métrica | `Observation` | `subject -> Patient`, `encounter -> Encounter` |
| Diagnóstico | `Condition` | `subject -> Patient`; referenciado desde diagnóstico del episodio |
| Profesional | `Practitioner` | Singleton de configuración firmante |
| Informe | `DocumentReference` | `subject -> Patient`, `context.related -> EpisodeOfCare` |

`Communication`, `Composition`, `DiagnosticReport`, `Procedure`, `Goal`, `PractitionerRole` y `Organization` no forman parte del runtime activo.

## 4. Reglas transversales

- Los mappers de lectura y escritura deben evolucionar juntos.
- Los updates actuales siguen el patrón `GET -> merge controlado -> PUT`.
- Los campos externos razonables deben preservarse durante un merge.
- Un `404` de lectura individual se resuelve como ausencia cuando el repositorio lo declara así; otros errores se propagan.
- Las búsquedas construyen parámetros con `URLSearchParams`.
- Las referencias se normalizan a IDs de dominio al leer.
- La UI no recibe recursos FHIR crudos.
- La aplicación nueva deberá incorporar control de versión/concurrencia antes de permitir edición desde varios dispositivos.

## 5. `Patient`

Responsabilidad:

- identidad;
- nombre y apellido;
- teléfono y domicilio;
- contacto principal;
- fecha de nacimiento y género;
- DNI administrativo opcional.

### DNI

```text
system: https://kinesiologiaadomicilio.ar/fhir/sid/dni
type.coding.system: http://terminology.hl7.org/CodeSystem/v2-0203
type.coding.code: NI
type.text: DNI
value: solo dígitos
```

El DNI no bloquea el inicio de tratamiento. La búsqueda de duplicados utiliza `Patient?identifier=system|value` con el valor normalizado.

Los updates preservan identifiers externos y solo reemplazan el identificador propio de DNI.

## 6. `ServiceRequest`

Responsabilidad:

- pedido inicial;
- fecha de solicitud;
- motivo;
- quién consulta;
- resolución administrativa.

### Mapeo de estados

| Dominio | FHIR |
|---|---|
| `in_review` | `active` sin marca de aceptación |
| `accepted` | `active` + nota tagged `workflow-status:v1:accepted` |
| `closed_without_treatment` | `revoked` |
| `cancelled` | `revoked` con señal de cancelación |
| `entered_in_error` | `entered-in-error` |

Campos principales:

- `subject = Patient/{id}`;
- `authoredOn = requestedAt`;
- `reasonCode[0].text = reasonText`;
- `requester.display = requesterDisplay` cuando existe;
- `statusReason` para motivo terminal cuando es soportado.

Compatibilidad actual en `note[]`:

- `reported-diagnosis:v1:`;
- `requester-contact:v1:`;
- `general-note:v1:`;
- `workflow-status:v1:`;
- `resolution-reason:v1:`.

Un tratamiento vincula su solicitud real mediante `EpisodeOfCare.referralRequest`. Esa relación determina si la solicitud ya fue absorbida y no puede reutilizarse ni editarse como libre.

## 7. `EpisodeOfCare`

Responsabilidad:

- ciclo de tratamiento;
- inicio, estado y cierre;
- vínculo con solicitud origen;
- contexto clínico longitudinal;
- referencias a diagnósticos.

### Inicio

- `status = active`;
- `patient = Patient/{id}`;
- `period.start = startDate`;
- `referralRequest = ServiceRequest/{id}` cuando existe solicitud válida.

### Cierre

- `status = finished`;
- `period.end = endDate`;
- motivo y detalle en extensiones locales.

```text
https://kinesiologiaadomicilio.local/fhir/StructureDefinition/episodeofcare-closure-reason
https://kinesiologiaadomicilio.local/fhir/StructureDefinition/episodeofcare-closure-detail
```

La lectura preserva compatibilidad con notas legacy:

- `closure-reason:v1:`;
- `closure-detail:v1:`.

HAPI local perdió `EpisodeOfCare.note[]` en roundtrips observados; por eso el contrato vigente usa extensiones para cierre.

### Contexto longitudinal

```text
https://kinesiologiaadomicilio.local/fhir/StructureDefinition/episodeofcare-initial-functional-status-v1
https://kinesiologiaadomicilio.local/fhir/StructureDefinition/episodeofcare-therapeutic-goals-v1
https://kinesiologiaadomicilio.local/fhir/StructureDefinition/episodeofcare-framework-plan-v1
```

### Diagnósticos del episodio

Sistema de roles:

```text
https://kinesiologiaadomicilio.local/fhir/CodeSystem/episodeofcare-diagnosis-role-v1
```

Códigos:

- `medical_reference`;
- `kinesiologic_diagnosis`.

Cada entrada referencia un `Condition/{id}`.

## 8. `Condition`

Responsabilidad:

- diagnóstico médico de referencia;
- diagnóstico kinésico.

Mapeo mínimo:

- `subject -> Patient`;
- `code.text` para descripción;
- `clinicalStatus` cuando existe;
- `recordedDate` cuando existe.

El rol del diagnóstico dentro del tratamiento no vive en `Condition`, sino en `EpisodeOfCare.diagnosis.role`.

## 9. `Encounter`

Responsabilidad actual:

- visita finalizada;
- período de atención;
- vínculo a paciente y episodio;
- nota clínica estructurada mediante extensiones;
- puntualidad operativa opcional.

Mapeo vigente:

- `status = finished`;
- `subject = Patient/{id}`;
- `episodeOfCare[0] = EpisodeOfCare/{id}`;
- `period.start = startedAt`;
- `period.end = endedAt`.

La nueva V1 ampliará el dominio para representar visitas en curso y borradores, pero deberá seguir leyendo los encuentros actuales.

### Extensiones de nota clínica vigentes

Prefijo común:

```text
https://kinesiologiaadomicilio.local/fhir/StructureDefinition/
```

Sufijos:

- `encounter-clinical-subjective`;
- `encounter-clinical-objective`;
- `encounter-clinical-intervention`;
- `encounter-clinical-assessment`;
- `encounter-clinical-tolerance`;
- `encounter-clinical-home-instructions`;
- `encounter-clinical-next-plan`.

La lectura actual conserva fallback desde notas tagged `clinical-*:v1:`.

Extensión de puntualidad:

```text
https://kinesiologiaadomicilio.local/fhir/StructureDefinition/encounter-operational-punctuality-status-v1
```

La estructura futura de captura todavía no está definida. Migrar estas extensiones no obliga a repetir el formulario actual de siete campos.

## 10. `Observation`

Responsabilidad:

- métrica funcional objetiva;
- vínculo con paciente y visita;
- valor, unidad y fecha efectiva.

Sistema local:

```text
https://kinesiologiaadomicilio.local/fhir/CodeSystem/functional-observations
version: 0.1.0
```

Códigos actuales:

| Dominio | FHIR | Unidad |
|---|---|---|
| `tug_seconds` | `tug-seconds` | `s` |
| `pain_nrs_0_10` | `pain-nrs-0-10` | `{score}` |
| `standing_tolerance_minutes` | `standing-tolerance-minutes` | `min` |
| `gait_duration_minutes` | `gait-duration-minutes` | `min` |

Mapeo:

- `status = final` por defecto;
- `subject = Patient/{id}`;
- `encounter = Encounter/{id}`;
- `effectiveDateTime` corresponde a la medición;
- `valueQuantity` conserva valor y unidad.

Actualmente las observaciones se crean después del encuentro y pueden fallar parcialmente sin rollback. La nueva aplicación debe decidir si agrupa operaciones de forma atómica o reintenta anexos fallidos explícitamente.

## 11. `Practitioner`

Responsabilidad:

- configuración de un único profesional firmante;
- identidad, título, matrícula, jurisdicción, teléfono y firma visible.

Identificador singleton:

```text
system: https://kinesiologiaadomicilio.local/fhir/sid/signing-practitioner-config
value: primary
```

Matrícula:

```text
system: https://kinesiologiaadomicilio.local/fhir/sid/professional-license
type.text: Matricula profesional
```

Firma visible:

```text
https://kinesiologiaadomicilio.local/fhir/StructureDefinition/practitioner-signature-display
```

La búsqueda singleton debe fallar ante múltiples coincidencias; no debe elegir una silenciosamente. Los updates preservan identifiers, extensions y telecom externos.

## 12. `DocumentReference`

Responsabilidad actual:

- snapshot de informe de evolución o cierre de etapa;
- asociación a paciente y episodio;
- preservación del texto final y contexto del momento.

Mapeo principal:

- `status = current`;
- `subject = Patient/{id}`;
- `context.related = EpisodeOfCare/{id}`;
- `date = createdAt`;
- `content[0].attachment.contentType = text/plain; charset=utf-8`;
- texto final codificado en base64.

Sistema y código de tipo:

```text
system: https://kinesiologiaadomicilio.local/fhir/CodeSystem/documentreference-type
code: treatment-evolution-report
```

Extensiones actuales conservan:

- tipo de informe;
- estado del tratamiento;
- inicio del episodio;
- cantidad de visitas;
- primera y última visita;
- snapshots de diagnósticos;
- situación funcional inicial;
- objetivos;
- plan general;
- síntesis de métricas.

La nueva V1 debe ampliar el contrato para conservar:

- texto final;
- PDF exacto;
- período incluido;
- autor;
- versión de plantilla;
- relación entre versiones;
- estado vigente o reemplazado.

La elección entre attachment inline, recurso `Binary` o almacenamiento privado externo sigue abierta. El dominio no debe depender de esa elección.

## 13. Búsquedas activas

- pacientes por DNI;
- episodios por paciente;
- episodios activos por paciente;
- episodios por `incoming-referral`;
- visitas por paciente ordenadas por fecha descendente;
- solicitudes por `subject`;
- informes por `subject`;
- profesional por identificador singleton.

La nueva aplicación deberá revisar paginación, orden y búsquedas por lotes antes de reutilizarlas en una cartera mayor.

## 14. Compatibilidad que debe preservarse

- notas tagged de `ServiceRequest`;
- fallbacks de cierre en `EpisodeOfCare.note[]`;
- fallbacks de nota clínica en `Encounter.note[]`;
- extensiones y sistemas locales ya persistidos;
- campos externos razonables durante updates;
- informes de texto existentes en `DocumentReference`;
- selección defensiva del episodio activo más reciente ante datos inconsistentes.

La compatibilidad de lectura no obliga a seguir escribiendo todos los formatos legacy.

## 15. Extracción para el repositorio nuevo

Migrar por contrato y pruebas:

1. tipos FHIR mínimos;
2. errores, referencias, bundles y search params;
3. mappers read/write;
4. repositorios detrás de interfaces inyectables;
5. tests de mappers y repositorios;
6. casos de uso nuevos por encima del adaptador.

Antes de copiar, corregir:

- cliente/configuración singleton;
- dependencias de repositorios hacia helpers de display;
- features que importan desde rutas `/admin`;
- ausencia de control de concurrencia;
- creación de visitas limitada a `finished`;
- escrituras parciales de visita y observaciones;
- soporte documental limitado a texto plano.

## 16. Validación mínima del adaptador migrado

- roundtrip de cada recurso activo;
- lectura de formatos legacy;
- preservación de campos externos en updates;
- queries codificadas correctamente;
- error ante singleton ambiguo;
- vínculo real solicitud → tratamiento;
- vínculo visita → tratamiento → paciente;
- idempotencia de nuevas visitas;
- conflicto de versión sin sobrescritura silenciosa;
- informe con texto y PDF versionados;
- ningún tipo FHIR expuesto a UI.

## 17. Fuentes relacionadas

- `docs/operacion.md`: significado y reglas del dominio.
- `docs/remodelacion/03-decisiones-arquitectura.md`: arquitectura objetivo.
- `docs/privacidad-entornos-y-demo.md`: límites de datos, entornos y dispositivos.
