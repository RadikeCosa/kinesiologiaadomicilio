# FHIR-HARDEN-001 — Hardening de tests de mappers (roundtrip parcial y preservación)

> Estado: **cerrado / aprobado**  
> Fecha de cierre: 2026-05-12 (UTC)  
> Tipo: hardening de tests (sin cambios funcionales)

## 1) Objetivo

Reducir riesgo de regresión en mappers FHIR agregando cobertura de preservación y roundtrip parcial, **sin** cambiar contratos de dominio, UI, rutas, actions, schemas ni comportamiento operativo.

## 2) Alcance cubierto

Recursos cubiertos en tests unitarios de mappers:

- `Patient`
- `ServiceRequest`
- `EpisodeOfCare`
- `Encounter`

Casos reforzados:

1. preservación de `extension[]` desconocidas cuando aplica;
2. preservación de `note[]` ajenas y tagged propias cuando aplica;
3. preservación de referencias no locales (`referralRequest`, roles diagnósticos externos);
4. no sobrescritura accidental de arrays existentes en updates;
5. tolerancia de lectura para payloads FHIR externos/parciales razonables;
6. validación explícita de fallback transicional en `ServiceRequest` (`statusReason`/`note`).

## 3) Garantía que sí entrega este cierre

- Cobertura de **unit tests de mappers** sobre preservación y roundtrip parcial de campos soportados.
- Detección temprana de regresiones de merge/actualización en capa mapper.

## 4) Lo que este cierre NO garantiza

- No garantiza roundtrip end-to-end completo (`create -> read -> update -> read`) a nivel repositorio/servidor.
- No valida por sí mismo persistencia PUT/GET real contra HAPI en todos los escenarios externos.
- No cubre consistencia transaccional `Encounter -> Observation`.
- No corrige performance N+1 de `Observation` por `encounterId`.

## 5) Pendientes explícitos posteriores

1. cobertura equivalente en repositorios para PUT/GET con payloads externos;
2. matriz de roundtrip integrada `create -> read -> update -> read` por recurso;
3. definición/mitigación de consistencia parcial `Encounter -> Observation`;
4. mitigación del N+1 en consultas de `Observation`.

## 6) No-alcances preservados

- sin cambios funcionales;
- sin cambios UI/copy/rutas;
- sin cambios de dominio;
- sin perfiles FHIR formales;
- sin migraciones de datos;
- sin introducir `Procedure`, `Goal` o IA.

## 7) Archivos de test tocados en este hardening

- `src/infrastructure/mappers/patient/__tests__/patient-write.mapper.test.ts`
- `src/infrastructure/mappers/service-request/__tests__/service-request.mapper.test.ts`
- `src/infrastructure/mappers/episode-of-care/__tests__/episode-of-care.mapper.test.ts`
- `src/infrastructure/mappers/encounter/__tests__/encounter.mapper.test.ts`


## 8) Relación con FHIR-HARDEN-002

- Este cierre (001) quedó complementado por `docs/fhir/fhir-harden-002-repository-roundtrip-preservacion.md`, que agrega cobertura en repositorios (`GET -> merge -> PUT`) con cliente FHIR mockeado.
- FHIR-HARDEN-002 no reemplaza este documento: lo extiende en profundidad de garantía sin convertirlo aún en validación end-to-end contra servidor FHIR real.
