# FHIR-HARDEN-002 — Hardening de preservación en repositorios (roundtrip liviano)

> Estado: **cerrado / aprobado**  
> Fecha de cierre: 2026-05-12 (UTC)  
> Tipo: hardening de tests + patch mínimo productivo (Patient mapper)

## 1) Objetivo

Complementar FHIR-HARDEN-001 (mappers unitarios) con cobertura de preservación en capa repositorio usando patrón `GET -> merge -> PUT` contra cliente FHIR mockeado, sin cambios funcionales visibles ni de UI.

## 2) Alcance cubierto

Recursos cubiertos:

- `Patient`
- `ServiceRequest`
- `EpisodeOfCare`
- `Encounter`

Cobertura añadida a nivel repositorio/roundtrip liviano:

1. **Patient**
   - preservación de `identifier`, `address`, `contact`, `telecom`, `name` externos/no propios en update;
   - hallazgo real: pérdida de identificadores no-DNI, telecom no-phone y names externos en update.
2. **ServiceRequest**
   - preservación de `note[]` externas y notas tagged propias al cambiar estado;
   - validación de fallback operativo transicional (`workflow-status`/`resolution-reason`).
3. **EpisodeOfCare**
   - preservación de `referralRequest`;
   - preservación de `diagnosis[]` con roles no locales;
   - preservación de `extension[]` desconocidas al actualizar contexto clínico/diagnóstico local.
4. **Encounter**
   - preservación de `extension[]` desconocidas;
   - preservación de extensiones clínicas propias;
   - preservación de puntualidad operativa al actualizar período.

## 3) Hallazgo real y fix mínimo aplicado

Durante el hardening se detectó pérdida real en updates de `Patient`.

Fix mínimo aplicado en `src/infrastructure/mappers/patient/patient-write.mapper.ts`:

- preservación de identifiers externos (no-DNI) al actualizar DNI;
- preservación de telecom no-phone al normalizar teléfono principal;
- preservación de names externos no-oficiales al actualizar name editable.

También se actualizó el test unitario del mapper `Patient` para reflejar ese comportamiento.

## 4) Garantía lograda

- **Mayor que FHIR-HARDEN-001**: agrega verificación en capa repositorio con composición real de payload de update (`GET -> merge -> PUT`).
- **Menor que end-to-end real**: no valida todavía roundtrip integral contra servidor FHIR real/HAPI en este cierre.

## 5) Pendientes explícitos

1. prueba contra servidor FHIR real/local HAPI para roundtrip integrado;
2. mitigación N+1 de `Observation`;
3. estrategia de consistencia/atomicidad `Encounter -> Observation`.

## 6) No-alcances preservados

- sin cambios UI/copy/rutas;
- sin cambios de dominio/schemas/actions/loaders;
- sin recursos FHIR nuevos;
- sin migraciones;
- sin perfiles FHIR formales;
- sin `Procedure`/`Goal`/IA;
- sin cambios de flujo funcional.

## 7) Archivos modificados en FHIR-HARDEN-002

- `src/infrastructure/repositories/__tests__/patient.repository.test.ts`
- `src/infrastructure/repositories/__tests__/service-request.repository.test.ts`
- `src/infrastructure/repositories/__tests__/episode-of-care.repository.test.ts`
- `src/infrastructure/repositories/__tests__/encounter.repository.test.ts`
- `src/infrastructure/mappers/patient/patient-write.mapper.ts`
- `src/infrastructure/mappers/patient/__tests__/patient-write.mapper.test.ts`

## 8) Validación de cierre

- `npm run test` ✅
- `npm run lint` ✅
