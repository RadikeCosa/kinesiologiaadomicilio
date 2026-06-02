# FHIR-022 — Cierre requester transicional y búsquedas mínimas V1

> Estado: cerrado documentalmente (aprobado para habilitar FHIR-023)
> Fecha: 2026-04-28
> Alcance: convenciones transicionales para requester y contrato de búsqueda mínima previo a implementación runtime.

> Aclaración de alcance: este documento **no implementa** `ServiceRequest` en código ni modifica comportamiento de producción.

## 1) Objetivo

Cerrar decisiones pendientes de FHIR-019 sobre:

- estrategia transicional de `requester`;
- tratamiento de `requesterDisplay`, `requesterType`, `requesterContact`;
- búsquedas mínimas V1 para `ServiceRequest` y vínculo con `EpisodeOfCare`.

## 2) Decisiones cerradas de requester (V1 transicional)

## 2.1 `requester`

Decisión:

- V1 **no crea** `Practitioner` ni `RelatedPerson`.
- Se permite `ServiceRequest.requester.display` como representación liviana del solicitante cuando haya dato disponible.

Justificación:

- evita introducir recursos no necesarios para el alcance actual;
- preserva trazabilidad humana mínima;
- reduce costo de implementación inicial.

## 2.2 `requesterDisplay`

Decisión:

- Campo de dominio `requesterDisplay` ↔ `ServiceRequest.requester.display` (cuando exista).
- Si no hay dato de solicitante, puede omitirse sin bloquear creación de solicitud.

## 2.3 `requesterType`

Decisión:

- Queda en dominio/read-model transicional.
- No forzar extensión FHIR en V1.
- Reevaluar extensión futura solo con necesidad real de interoperabilidad/filtros.

## 2.4 `requesterContact`

Decisión:

- Queda fuera del núcleo FHIR estructurado en V1.
- Si se requiere trazabilidad transicional, usar `note.text` etiquetada (por ejemplo `requester-contact:`).
- No usar `Patient.contact` como requester real salvo decisión explícita futura.

## 3) Búsquedas mínimas V1 (contrato)

Alineado con validación FHIR-020 en HAPI local (8.8.0 / R4 4.0.1):

### 3.1 `ServiceRequest` por paciente

- `ServiceRequest?subject=Patient/{id}`
- `ServiceRequest?patient=Patient/{id}` (si está soportado en servidor destino)

### 3.2 `EpisodeOfCare` por paciente

- `EpisodeOfCare?patient=Patient/{id}`

### 3.3 `EpisodeOfCare` por `ServiceRequest`

- `EpisodeOfCare?incoming-referral=ServiceRequest/{id}`
- `EpisodeOfCare?incoming-referral={id}`

### 3.4 Parámetro prohibido

- No usar `EpisodeOfCare?referralRequest=...` como query param.
- Motivo: en HAPI local devuelve error `HAPI-0524` por search parameter desconocido.

## 4) Fallback de lectura (si falla búsqueda por vínculo)

Estrategia de composición por `patient`:

1. Buscar `ServiceRequest` por `subject`/`patient`.
2. Buscar `EpisodeOfCare` por `patient`.
3. Asociar en read-model por coincidencia de `EpisodeOfCare.referralRequest`.

Guardrail:

- mantener owner único del vínculo en `EpisodeOfCare.referralRequest`;
- evitar doble vínculo en ambos recursos salvo decisión futura explícita.

## 5) Implicancia para FHIR-023

Con FHIR-022 cerrado, FHIR-023 ya cuenta con contrato documental para:

- representación transicional de requester;
- persistencia mínima de requester sin recursos nuevos;
- queries mínimas y fallback de lectura en caso de degradación.

## 6) Fuera de alcance (preservado)

- Crear `Practitioner`/`RelatedPerson`.
- Introducir `Task`, `CarePlan`, `Condition`, `DocumentReference`.
- Cambiar UI actual o rutas.
- Persistir estados derivados en FHIR.
