# FHIR-020 - Validacion HAPI R4 para vinculo ServiceRequest <-> EpisodeOfCare

> Estado: validado tecnicamente en entorno local
> Fecha de prueba: 2026-04-28
> Alcance: confirmar viabilidad real de `EpisodeOfCare.referralRequest` en HAPI-FHIR antes de implementar `ServiceRequest` en la app.

## 1) Objetivo

> Nota de adopción runtime (2026-04-28): lo validado en este documento fue adoptado en la app para SR-003. El inicio de tratamiento en `/treatment` puede persistir `EpisodeOfCare.referralRequest = ServiceRequest/{id}` y la consulta por vínculo usa `incoming-referral` en repositorio.


Validar si el servidor HAPI-FHIR usado en local soporta de forma viable el vinculo `ServiceRequest` <-> `EpisodeOfCare` con owner unico desde `EpisodeOfCare.referralRequest`, incluyendo:

- create/read de `Patient`, `ServiceRequest`, `EpisodeOfCare`;
- persistencia real de `referralRequest`;
- busquedas minimas por `patient` y por vinculo;
- definicion de fallback si aparecian limitaciones.

No se implementa `ServiceRequest` en runtime de app ni se modifican contratos/mappers/repositorios productivos.

## 2) Entorno probado

- `FHIR_BASE_URL`: `http://localhost:8080/fhir` (tomado de `.env.local`).
- Config app server-side: `src/lib/fhir/config.ts` exige `FHIR_BASE_URL` y normaliza URL sin slash final.
- Cliente FHIR actual: `src/lib/fhir/client.ts` con `Accept/Content-Type: application/fhir+json`.
- Repositorio actual de tratamiento usa `EpisodeOfCare` por `patient`/`status`: `src/infrastructure/repositories/episode-of-care.repository.ts`.
- `docker-compose.yml`: no existe en el repo actual (no encontrado en workspace).

Evidencia de metadata/capabilities (`GET $FHIR_BASE_URL/metadata`):

- HTTP `200`.
- Header: `X-Powered-By: HAPI FHIR 8.8.0 REST Server (FHIR Server; FHIR 4.0.1/R4)`.
- `CapabilityStatement.fhirVersion`: `4.0.1`.
- `CapabilityStatement.software.version`: `8.8.0`.
- `CapabilityStatement.implementation.url`: `http://localhost:8080/fhir`.
- Recursos soportados: `ServiceRequest` y `EpisodeOfCare` (con `create/read/update/search-type`).

Search params relevantes observados en metadata:

- `EpisodeOfCare`: incluye `patient` e `incoming-referral`.
- `ServiceRequest`: incluye `subject` y `patient`.

## 3) Recursos probados

Se crearon recursos tecnicos minimos de prueba (tag textual: `test-fhir-020`) en orden:

1. `Patient`.
2. `ServiceRequest` con `subject = Patient/{id}`.
3. `EpisodeOfCare` con `patient = Patient/{id}` y `referralRequest = [Reference(ServiceRequest/{id})]`.

IDs generados en prueba:

- `Patient/1000`
- `ServiceRequest/1001`
- `EpisodeOfCare/1002`

Payloads usados (minimos):

```json
{
  "resourceType": "Patient",
  "active": true,
  "name": [{ "use": "official", "family": "TestFhir020", "given": ["Audit"] }],
  "identifier": [{ "system": "https://kinesiologiaadomicilio.test/fhir020", "value": "fhir020-<timestamp>" }]
}
```

```json
{
  "resourceType": "ServiceRequest",
  "status": "active",
  "intent": "order",
  "subject": { "reference": "Patient/1000" },
  "authoredOn": "2026-04-28",
  "code": { "text": "Solicitud de atencion test FHIR-020" },
  "note": [{ "text": "test-fhir-020" }]
}
```

```json
{
  "resourceType": "EpisodeOfCare",
  "status": "active",
  "patient": { "reference": "Patient/1000" },
  "period": { "start": "2026-04-28" },
  "referralRequest": [{ "reference": "ServiceRequest/1001" }],
  "type": [{ "text": "Tratamiento test FHIR-020" }]
}
```

## 4) Resultado create/read

- `POST Patient`: aceptado (`201`).
- `POST ServiceRequest`: aceptado (`201`).
- `POST EpisodeOfCare` con `referralRequest`: aceptado (`201`).

`GET EpisodeOfCare/1002` devuelve y conserva `referralRequest` sin alteracion:

```json
{
  "resourceType": "EpisodeOfCare",
  "id": "1002",
  "status": "active",
  "patient": { "reference": "Patient/1000" },
  "period": { "start": "2026-04-28" },
  "referralRequest": [{ "reference": "ServiceRequest/1001" }]
}
```

Conclusion de create/read: el vinculo mediante `EpisodeOfCare.referralRequest` funciona en este HAPI local.

## 5) Resultado de busquedas

Busqueda ejecutada y resultado observado:

- `GET ServiceRequest?subject=Patient/1000` -> `200`, `total=1`.
- `GET ServiceRequest?patient=Patient/1000` -> `200`, `total=1`.
- `GET ServiceRequest?patient=1000` -> `200`, `total=1`.
- `GET EpisodeOfCare?patient=Patient/1000` -> `200`, `total=1`.
- `GET EpisodeOfCare?incoming-referral=ServiceRequest/1001` -> `200`, `total=1`.
- `GET EpisodeOfCare?incoming-referral=1001` -> `200`, `total=1`.

Validacion de parametro incorrecto (para delimitar fallback):

- `GET EpisodeOfCare?referralRequest=ServiceRequest/1001` -> `400`.
- Error exacto (OperationOutcome):
  - `HAPI-0524: Unknown search parameter "referralRequest" for resource type "EpisodeOfCare". ... valid ... incoming-referral ...`

Conclusion de busqueda:

- No existe search param literal `referralRequest`.
- El equivalente funcional en HAPI R4 es `incoming-referral` y funciona para resolver el vinculo.

## 6) Decision

**Decision: viable** para este entorno HAPI-FHIR local (`8.8.0`, `R4 4.0.1`).

Viabilidad confirmada para FHIR-020:

- `EpisodeOfCare.referralRequest` se acepta en create.
- `referralRequest` se conserva en read.
- El vinculo es consultable por search usando `incoming-referral`.

Limitacion importante:

- la query debe usar `incoming-referral` (no `referralRequest`) para busqueda de `EpisodeOfCare` por solicitud.

## 7) Fallback recomendado (si cambia compatibilidad de servidor)

Fallback minimo recomendado, en orden:

1. Mantener owner unico del vinculo en `EpisodeOfCare.referralRequest` siempre que create/read sigan funcionando.
2. Si se degrada busqueda por vinculo, componer read-model por `patient`:
   - buscar `EpisodeOfCare` por `patient`;
   - buscar `ServiceRequest` por `subject/patient`;
   - resolver asociacion en capa de lectura.
3. Solo si create/read de `referralRequest` dejara de ser viable en el servidor destino:
   - extension transicional en `EpisodeOfCare` para guardar referencia a solicitud.
4. Ultimo recurso transicional:
   - referencia textual en `note` (documental), explicitamente marcada como debt tecnica.

Guardrail preservado:

- evitar duplicar vinculo en ambos recursos salvo decision explicita futura.

## 8) Implicancias para FHIR-021 / FHIR-022 / FHIR-023

- **FHIR-021 (`status/statusReason`)**:
  - puede avanzar sin bloquearse por el vinculo SR<->EoC;
  - documentar que la estrategia de consulta debera contemplar `incoming-referral` para trazabilidad desde episodio.

- **FHIR-022 (requester + busquedas minimas)**:
  - baseline tecnico disponible:
    - `ServiceRequest` por `subject` y `patient`;
    - `EpisodeOfCare` por `patient` e `incoming-referral`.
  - recomendacion: explicitar estos params como contrato operativo de consulta minima.

- **FHIR-023 (implementacion incremental ServiceRequest)**:
  - puede planificarse con owner unico del vinculo en `EpisodeOfCare.referralRequest`;
  - incluir tests de repositorio que usen `incoming-referral` (no `referralRequest`) en queries de vinculo;
  - no requiere por ahora doble enlace ni cambio de `EpisodeOfCare`/`Encounter` vigentes.

## 9) Fuera de alcance preservado

Durante FHIR-020 no se realizo:

- implementacion de `ServiceRequest` en runtime app;
- creacion de repositorio/mappers definitivos de `ServiceRequest`;
- cambios en dominio/schemas/UI/rutas;
- cambios en `PatientOperationalStatus`.

Solo se ejecutaron llamadas tecnicas de auditoria contra HAPI y se documento resultado.

## 10) Limpieza de datos de prueba

Recursos temporales eliminados tras validacion:

- `DELETE EpisodeOfCare/1002` -> `200`
- `DELETE ServiceRequest/1001` -> `200`
- `DELETE Patient/1000` -> `200`

Chequeo posterior:

- `GET EpisodeOfCare/1002` -> `410` (`Resource was deleted ...`).
