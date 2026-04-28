# PRODUCT-SR-001 — Plan de exposición funcional mínima de solicitudes de atención en `/admin/patients/[id]/administrative`

> Estado: cerrado (implementado en PR1→PR4)
> Fecha: 2026-04-28 (UTC)

## A) Executive summary

- El estado actual del código confirma que `/administrative` es una pantalla administrativa en **modo lectura por defecto** con edición explícita vía `Editar datos`, y sin UI de solicitudes. Existe un contexto técnico de `ServiceRequest` ya implementado en data-loader (`loadPatientServiceRequestContext`) pero no conectado a la página.  
- La base técnica FHIR/domain de `ServiceRequest` está disponible: tipos, schemas, mappers, repositorio y búsqueda por `subject`, más query de vínculo EoC por `incoming-referral`.  
- Recomendación para PRODUCT-SR-001: **Opción B** (lectura + creación mínima), preservando no-alcances clínicos/operativos actuales (sin resolución, sin cambios de `PatientOperationalStatus`, sin cambios de badges globales/CTAs globales).  
- Propuesta incremental en PRs pequeños: read-model público para administrativa, UI de lectura, formulario mínimo de creación (sin resolución), documentación/cierre.

## B) Files inspected

### Documentación
- `README.md`
- `docs/fuente-de-verdad-operativa.md`
- `docs/product/solicitud-atencion-flujo-inicial.md`
- `docs/fhir/README.md`
- `docs/fhir/backlog-remediacion-fhir.md`
- `docs/fhir/fhir-019-servicerequest-solicitudes-atencion.md`
- `docs/fhir/fhir-020-validacion-hapi-servicerequest-episodeofcare.md`
- `docs/fhir/fhir-021-servicerequest-status-statusreason.md`
- `docs/fhir/fhir-022-servicerequest-requester-busquedas.md`

### Código
- `src/app/admin/patients/[id]/administrative/page.tsx`
- `src/app/admin/patients/[id]/components/PatientAdministrativeEditor.tsx`
- `src/app/admin/patients/[id]/data.ts`
- `src/domain/service-request/service-request.types.ts`
- `src/domain/service-request/service-request.schemas.ts`
- `src/infrastructure/mappers/service-request/service-request-read.mapper.ts`
- `src/infrastructure/mappers/service-request/service-request-write.mapper.ts`
- `src/infrastructure/repositories/service-request.repository.ts`
- `src/lib/fhir/search-params.ts`

### Tests
- `src/app/admin/patients/[id]/administrative/__tests__/page.test.ts`
- `src/app/admin/patients/[id]/components/__tests__/PatientAdministrativeEditor.test.ts`
- `src/app/admin/patients/[id]/data.test.ts`
- `src/domain/service-request/__tests__/service-request.schemas.test.ts`
- `src/infrastructure/mappers/service-request/__tests__/service-request.mapper.test.ts`
- `src/infrastructure/repositories/__tests__/service-request.repository.test.ts`
- `tests/integration/admin-patients/patient-detail.data.test.ts`

## C) Current state of `/administrative`

### C.1 Estructura visual actual
- Página con cabecera, navegación de retorno, identidad del paciente y badge de tratamiento derivado de `operationalStatus`.  
- CTAs secundarios hacia `treatment` y `encounters`.  
- Sección protagonista actual: `Resumen administrativo`, que renderiza `PatientAdministrativeEditor`.  
- No existe bloque visual de “Solicitudes de atención”.

### C.2 Read model disponible
- `loadPatientDetail(id)` ya alimenta la pantalla administrativa para identidad/estado operativo/tratamiento.  
- Existe **contexto técnico separado** `loadPatientServiceRequestContext(patientId)` con:
  - `serviceRequests` ordenadas por `requestedAt desc`;
  - `latestServiceRequest`.
- Ese contexto no se usa hoy en `administrative/page.tsx`.

### C.3 Dónde podría entrar la sección
- Ubicación recomendada: **debajo de “Resumen administrativo”**, manteniendo precedencia de datos administrativos ya existentes y sin romper lectura-first.

### C.4 Qué datos ya existen técnicamente
- Dominio `ServiceRequest` soporta:
  - `requestedAt`, `reasonText`, `reportedDiagnosisText`, `requesterDisplay`, `requesterType`, `requesterContact`, `notes`, `status`, `closedReasonText`.
- Validación de creación ya lista (schema): obliga `patientId`, `requestedAt (YYYY-MM-DD)`, `reasonText`.
- Mapper de escritura crea FHIR `ServiceRequest` con `status=active` (equivale a dominio `in_review`) e `intent=order`.
- Repositorio ya implementa:
  - `createServiceRequest`;
  - `listServiceRequestsByPatientId`;
  - `getServiceRequestById`.

### C.5 Qué falta para exponer UI
- Exponer read-model en loader de `/administrative`.
- Implementar componente de sección de lectura de solicitudes.
- Definir helper de labels de estado no técnico para UI.
- Definir server action de creación mínima y formulario.
- Agregar pruebas de render + action + integración de data-flow en `/administrative`.

## D) Recommended PRODUCT-SR-001 scope

## Recomendación
**Opción B: lectura + creación mínima**.

## Evaluación rápida de opciones
- **A (solo lectura):** bajo riesgo y muy rápido, pero deja incompleta la hipótesis funcional de “solicitud como unidad operativa viva”.
- **B (lectura + creación mínima):** mejor balance valor/riesgo; habilita operación real sin tocar estados globales ni flujo clínico.
- **C (incluye cierre/resolución):** demasiado alcance para SR-001; aumenta ambigüedad semántica y riesgo de mezclar solicitud vs tratamiento.

## Decisión de corte
- SR-001 cierra con lectura + alta mínima (`in_review`).
- SR-002 aborda resolución/cierre/aceptación y decisiones de transición de estado.

## E) Proposed UX

### E.1 Layout en `/administrative`
- Mantener bloque actual “Resumen administrativo”.
- Agregar debajo sección: **“Solicitudes de atención”**.

### E.2 Contenido del listado mínimo
Por solicitud mostrar:
- fecha de solicitud (`requestedAt`);
- motivo de consulta (`reasonText`);
- diagnóstico informado (`reportedDiagnosisText`) si existe;
- solicitante (`requesterDisplay`) si existe;
- estado (label no técnico).

### E.3 Labels de estado no técnico
- `in_review` → **En evaluación**
- `accepted` → **Aceptada**
- `closed_without_treatment` → **No inició**
- `cancelled` → **Cancelada**
- `entered_in_error` → **Error de carga** (solo en contexto interno)

### E.4 Empty state
- Copy recomendado: “Todavía no hay solicitudes de atención registradas.”
- CTA visible: `Nueva solicitud`.

### E.5 Alta mínima
- Botón `Nueva solicitud` dentro de la sección.
- Formulario mínimo embebido (o acordeón) para evitar navegación/ruta nueva.

## F) Proposed data/read-model changes

### F.1 Contrato recomendado para `/administrative`
Agregar/usar en data-loader de administrativa:
- `serviceRequests: ServiceRequest[]`
- `latestServiceRequest: ServiceRequest | null` (opcional pero útil para futuros micro-resúmenes)

### F.2 Estrategia técnica sugerida
- Reusar `loadPatientServiceRequestContext(patientId)` existente en `src/app/admin/patients/[id]/data.ts`.
- Mantener separación de concerns:
  - `loadPatientDetail` para base del paciente;
  - contexto SR para sección SR.

### F.3 Guardrails explícitos
- No derivar `PatientOperationalStatus` desde SR en SR-001.
- No tocar read-model de listado `/admin/patients`.

## G) Proposed actions/components

### G.1 Componentes probables
- `PatientServiceRequestsSection` (server component o presentacional con props serializables).
- `ServiceRequestCreateForm` (client component para submit + validaciones básicas de UX).
- `serviceRequestStatusLabel.ts` (helper de presentación de labels).

### G.2 Action probable
- `createPatientServiceRequestAction`:
  - valida input con schema de dominio existente;
  - llama `createServiceRequest` del repository;
  - revalida ruta de `/administrative`.

### G.3 Tests esperados
- Render de sección con lista existente.
- Render de empty state.
- Label mapping de estados.
- Alta mínima feliz (`in_review` inicial).
- Validaciones de campos obligatorios (`requestedAt`, `reasonText`).
- Aserciones de no-efecto:
  - no cambia tratamiento;
  - no habilita visitas;
  - no cambia badges globales.

## H) Explicit non-scope

Para SR-001 debe quedar fuera (estricto):
- resolver/cerrar solicitud;
- aceptar solicitud;
- iniciar tratamiento desde solicitud;
- vincular SR con `EpisodeOfCare` desde UI;
- cambiar badges/CTAs globales en listado/hub;
- cambiar `PatientOperationalStatus`;
- tocar `/treatment` o `/encounters` en comportamiento;
- agregar SR al listado `/admin/patients`.

## I) Incremental PR plan

### PR1 — Exposición de read-model para administrativa
- Estado: ✅ completado (2026-04-28).
- Hacer público/consumible el contexto SR en la carga de `/administrative`.
- Helper de labels no técnicos.
- Tests unitarios de mapping/orden/presentación.

### PR2 — UI de lectura en `/administrative`
- Estado: ✅ completado (2026-04-28).
- Sección “Solicitudes de atención” + listado + empty state.
- Sin formularios ni actions.
- Tests de render SSR de la página.

### PR3 — Alta mínima de solicitud
- Estado: ✅ completado (2026-04-28).
- Server Action `createPatientServiceRequestAction`.
- `ServiceRequestCreateForm` embebido/desplegable.
- Revalidación de ruta y tests de action/UI.

### PR4 — Cierre documental SR-001
- Estado: ✅ completado (2026-04-28).
- Actualización puntual de docs operativas/FHIR si corresponde.
- Checklist de no-regresión de alcance.

## J) Acceptance criteria

1. Con solicitudes existentes, la sección lista correctamente (orden desc por `requestedAt`, desempate determinista por id).  
2. Sin solicitudes, aparece empty state con CTA `Nueva solicitud`.  
3. Crear solicitud mínima genera `ServiceRequest` con estado inicial `in_review` (persistido como FHIR `active`).  
4. Crear solicitud **no** crea tratamiento automáticamente.  
5. Crear solicitud **no** habilita visitas si no hay `EpisodeOfCare` activo.  
6. No cambia badges/global CTAs de otras pantallas.  
7. Suite de tests relevante pasa.

## K) Risks / mitigations

- **Riesgo: confusión solicitud vs tratamiento.**
  - Mitigación: copy explícito en sección y no mostrar CTAs clínicos desde SR.

- **Riesgo: duplicar estado operativo global.**
  - Mitigación: mantener SR-001 sin tocar `PatientOperationalStatus`.

- **Riesgo: formularios excesivos.**
  - Mitigación: alta mínima con 2 obligatorios + opcionales simples.

- **Riesgo: tagging de `note` frágil (`reported-diagnosis:v1`, `requester-contact:v1`, `general-note:v1`).**
  - Mitigación: centralizar helper y tests de roundtrip mapper.

- **Riesgo: N+1 futuro al escalar SR a listados globales.**
  - Mitigación: mantener SR-001 en scope paciente puntual; posponer agregado global.

- **Riesgo: build/test por `FHIR_BASE_URL` en algunos entornos.**
  - Mitigación: preservar estrategia actual de tests aislados/mocks y evitar dependencias runtime nuevas en build.

## L) Documentation impact

Ajustes mínimos recomendados al cerrar SR-001 (no en esta iteración):
- `README.md`: eliminar frase de inexistencia de `ServiceRequest` y aclarar “base técnica + UI administrativa mínima”.
- `docs/fuente-de-verdad-operativa.md`: actualizar sección de capacidades privadas para incluir exposición mínima en `/administrative`.
- `docs/product/solicitud-atencion-flujo-inicial.md`: marcar SR-001 como primer corte implementado y preservar SR-002 para resolución.

## M) Final recommendation

**PRODUCT-SR-001: ✅ cerrado.**

Resultado implementado:
- lectura de solicitudes en `/admin/patients/[id]/administrative`;
- empty state cuando no hay solicitudes;
- alta mínima con formulario embebido y server action (`requestedAt` + `reasonText` obligatorios);
- sin resolver/cerrar/aceptar, sin impacto en `PatientOperationalStatus` y sin habilitar visitas por sí mismo.

### Próximo ticket propuesto
**PRODUCT-SR-002 — Resolución y cambio de estado de solicitudes de atención**

Alcance sugerido de SR-002:
- aceptar solicitud;
- cerrar sin tratamiento;
- cancelar;
- ver motivo de resolución/cierre.

No alcance explícito de SR-002:
- iniciar tratamiento desde solicitud;
- cambiar `PatientOperationalStatus` global;
- vincular SR↔EpisodeOfCare desde UI;
- modificar badges/CTAs globales.
