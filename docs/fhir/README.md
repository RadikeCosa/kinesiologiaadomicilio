# Documentación FHIR

> Estado: vigente
> Última actualización: 2026-06-25 (UTC)

## Objetivo

Concentrar en un único documento la referencia FHIR activa y reusable del repo.

Esta carpeta ya no mantiene varios documentos operativos separados: el contrato vigente vive acá, y el material histórico o superado quedó archivado en `docs/archive/historico-fhir/`.

## Cómo usar este documento

1. Confirmar primero el comportamiento real en `docs/fuente-de-verdad-operativa.md`.
2. Usar esta guía cuando el cambio toque recursos FHIR, repositorios, mappers, loaders, actions, schemas o UI con impacto de contrato.
3. Si aparece contexto viejo útil, recuperarlo desde `docs/archive/historico-fhir/`, pero reintroducir al flujo activo solo lo necesario.

## Entornos FHIR operativos

Para el desarrollo local del repo, la app Next.js usa un único endpoint FHIR por ejecución:

- `http://localhost:8081/fhir` → entorno dev/test, datos descartables.
- `http://localhost:8080/fhir` → entorno local-real, datos reales/locales.

La selección se define por `FHIR_BASE_URL` a través del script de ejecución o de la variable de entorno del proceso. La admin muestra el entorno activo para reducir confusión operativa.

## Recursos FHIR activos

El modelado vigente del repo usa:

- `Patient`
- `ServiceRequest`
- `EpisodeOfCare`
- `Encounter`
- `Observation`
- `Condition`
- `Practitioner`

Estos son los únicos recursos FHIR activos documentados para el runtime actual. `Communication`, `DocumentReference` y `Composition` fueron evaluados como posible dirección futura para resúmenes o informes, pero hoy no forman parte de la implementación vigente.

Dirección arquitectónica vigente:

- lectura: `FHIR Server -> FHIR Client -> Repository -> Mapper -> Read model / loader -> UI`
- escritura: `UI Form -> Server Action -> Zod Schema -> Domain Rules -> Repository -> FHIR payload`

La UI no debería consumir FHIR crudo si ya existe capa de repositorio, mapper o read model.

## Contratos activos

### 1. Identidad operativa del paciente

- El DNI es un dato administrativo opcional: puede persistirse, pero no bloquea el inicio de tratamiento.
- El inicio de `EpisodeOfCare` depende de una `ServiceRequest` aceptada válida más datos operativos mínimos del paciente.
- La semántica mínima esperada para DNI en `Patient.identifier` es:
  - `identifier.system`
  - `identifier.value`
  - `identifier.type`

Sigue fuera de alcance actual:

- validación externa de identidad;
- RENAPER;
- identidad validada vs declarada;
- MPI o identidad federada;
- múltiples documentos con estrategia compleja de prioridad.

### 2. Cierre de tratamiento con `EpisodeOfCare`

Al cerrar tratamiento:

- se persiste `status = finished`;
- se persiste `period.end`;
- se registra motivo de finalización;
- se registra detalle opcional.

Motivo y detalle se persisten en `EpisodeOfCare.extension[]` con URLs locales versionables:

- `https://kinesiologiaadomicilio.local/fhir/StructureDefinition/episodeofcare-closure-reason` como `valueCode`
- `https://kinesiologiaadomicilio.local/fhir/StructureDefinition/episodeofcare-closure-detail` como `valueString`

Notas operativas:

- `note[]` no es el canal principal para cierre porque HAPI local lo pierde en roundtrip `PUT/GET`.
- La lectura mantiene fallback legacy desde `note[]` con prefijos `closure-reason:v1:` y `closure-detail:v1:`.
- Este cierre describe contexto operativo, no una historia clínica longitudinal rica.

### 2.1. Solicitudes de atención con `ServiceRequest`

Contrato operativo vigente:

- `ServiceRequest.authoredOn` persiste la fecha visible de la solicitud.
- La edición de fecha usa `GET -> merge -> PUT` y solo está permitida para solicitudes no vinculadas a `EpisodeOfCare`.
- La eliminación visible en la UI no hace hard delete: usa `status = entered-in-error` para cargas erróneas.
- Si la solicitud ya está vinculada por `EpisodeOfCare.referralRequest`, no se permite ni editar la fecha ni marcarla como carga errónea.

### 3. Profesional firmante single-user con `Practitioner`

La instalación privada actual usa un único `Practitioner` para configuración del profesional firmante.

No se modela todavía:

- `PractitionerRole`;
- `Organization`;
- multiusuario;
- referencias clínicas amplias desde otros recursos.

Identificador singleton operativo:

```txt
system: https://kinesiologiaadomicilio.local/fhir/sid/signing-practitioner-config
value: primary
```

Búsqueda operativa:

```txt
Practitioner?identifier=https://kinesiologiaadomicilio.local/fhir/sid/signing-practitioner-config|primary
```

Matrícula profesional:

```txt
system: https://kinesiologiaadomicilio.local/fhir/sid/professional-license
value: <matricula>
type.text: Matricula profesional
```

Mapeo vigente:

| Dominio | FHIR |
|---|---|
| `id` | `Practitioner.id` |
| `fullName` | `Practitioner.name[0].text` |
| `roleTitle` | `Practitioner.qualification[0].code.text` |
| `licenseNumber` | `Practitioner.identifier` con system de matrícula |
| `licenseJurisdiction` | `Practitioner.qualification[0].issuer.display` |
| `signatureDisplay` | extensión local `practitioner-signature-display` |
| `professionalPhone` | `Practitioner.telecom` phone/work |

Extensión local:

```txt
https://kinesiologiaadomicilio.local/fhir/StructureDefinition/practitioner-signature-display
```

Estados de completitud:

- `missing`: no existe `Practitioner` singleton.
- `incomplete`: falta `fullName`, `roleTitle` o `licenseNumber`.
- `ready`: existen `fullName`, `roleTitle` y `licenseNumber`.

Reglas operativas:

- la escritura usa `GET -> merge -> PUT`;
- no se deben borrar identifiers, extensions, telecom ni otros campos externos razonables;
- si la búsqueda devuelve más de un `Practitioner`, el repositorio debe fallar por ambigüedad y no elegir uno silenciosamente.

## Checklist reusable para cambios FHIR

### Trazabilidad

- [ ] El cambio referencia ticket o alcance explícito.
- [ ] El alcance coincide con lo pedido.
- [ ] No mezcla temas FHIR distintos sin justificación.

### Contrato y dominio

- [ ] El cambio actualiza contrato de dominio si corresponde.
- [ ] No introduce naming ambiguo.
- [ ] Mantiene compatibilidad hacia atrás cuando fue requerida.

### Capa FHIR

- [ ] Mappers read/write quedaron alineados.
- [ ] No se inventa semántica no soportada por producto.
- [ ] Toda simplificación nueva quedó explícita.

### UI y acciones

- [ ] La UI refleja el contrato vigente.
- [ ] Actions y validación quedaron consistentes.
- [ ] No quedaron campos a medias entre UI y persistencia.

### Tests y validación

- [ ] Hay cobertura de schema, mapper o integración cuando aplica.
- [ ] No se rompieron reglas operativas existentes sin decisión explícita.
- [ ] Se ejecutó la validación mínima razonable: `npm run lint`, `npm run test` o `FHIR_BASE_URL=http://localhost:8081/fhir npm run build`, según alcance.

### Documentación

- [ ] Se actualizó `README.md` si cambió el contrato público del repo.
- [ ] Se actualizó `docs/fuente-de-verdad-operativa.md` si cambió comportamiento vigente.
- [ ] Se actualizó este documento si cambió contrato FHIR activo.

## Plantilla breve para trabajo FHIR nuevo

Usar esta estructura cuando haga falta abrir o describir una pieza nueva:

### Título

`FHIR-xxx — <resumen corto>`

### Objetivo

Qué problema resuelve y por qué se hace ahora.

### Contexto

- hallazgo origen;
- fase;
- dependencia con ADRs o tickets previos.

### Alcance

- qué entra;
- qué capas toca;
- qué zonas del repo cambian.

### No alcance

- qué queda afuera;
- qué no debe mezclarse.

### Riesgo

- nivel;
- riesgo técnico;
- riesgo funcional.

### Criterio de aceptación

Resultado verificable por código, tests y docs.

### Validación mínima

Lint, tests, build o validación manual según el cambio.

## Historial archivado

Quedaron archivados en `docs/archive/historico-fhir/`:

- decisiones previas ahora absorbidas por este documento;
- contratos puntuales ya consolidados;
- checklists o templates que antes estaban separados;
- cualquier remediación o plan FHIR ya cerrado.

## Relación con otros documentos activos

- `README.md`: resumen portfolio-facing del proyecto.
- `docs/README.md`: mapa de documentación activa.
- `docs/fuente-de-verdad-operativa.md`: comportamiento operativo vigente.
- `docs/checklist-sincronizacion-doc-codigo.md`: control liviano antes de merge.
- `docs/product/solicitud-atencion-flujo-inicial.md`: contrato vigente para solicitudes de atención.
