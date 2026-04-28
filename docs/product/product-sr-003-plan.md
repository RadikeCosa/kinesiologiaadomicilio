# PRODUCT-SR-003 — Vinculación administrativa entre solicitud aceptada y tratamiento

Fecha: 2026-04-28.
Estado: implementado/cerrado (PR1-PR5).

> Actualización PR1 (2026-04-28): **completado soporte técnico en dominio/mappers/repository/tests para `EpisodeOfCare.referralRequest`** mediante `serviceRequestId` opcional. Sin cambios de UI, rutas ni actions de `/treatment`.
>
> Actualización PR2 (2026-04-28): **backend de `/treatment` en progreso/completado para validación de `serviceRequestId` en action de inicio** (existencia, ownership paciente↔solicitud y estado `accepted`) y passthrough mínimo desde query/form. Sin CTA nueva en `/administrative` ni UI contextual completa.
>
> Actualización PR3 (2026-04-28): **CTA liviana en `/administrative` para solicitudes `accepted`** que navega a `/treatment?serviceRequestId={id}`. No inicia tratamiento en esta pantalla; el inicio real continúa en `/treatment`.

> Actualización PR4 (2026-04-28): **UI contextual mínima en `/treatment`** para solicitudes `accepted` válidas (detalle de solicitud + copy de alcance) y aviso cuando el `serviceRequestId` no es utilizable. El inicio real se mantiene en el formulario de `/treatment`.

> Actualización PR5 (2026-04-28): **auditoría de aceptación + sincronización documental mínima completadas**. `PRODUCT-SR-003` queda **cerrado**: una solicitud `accepted` puede originar inicio en `/treatment`, con vínculo técnico en `EpisodeOfCare.referralRequest`, manteniendo ownership clínico en `/treatment`.

> Nota posterior (2026-04-28): la deuda de reutilización de la misma SR accepted fue atendida en `PRODUCT-SR-HARDENING-2` con política **single-use** (bloqueo por vínculo previo vía `incoming-referral`).

## 1) Resumen

Se recomienda habilitar un flujo de preparación de inicio de tratamiento desde una `ServiceRequest` en estado `accepted`, manteniendo **ownership clínico en `/treatment`**.

Propuesta base:
- CTA en `/administrative` para solicitudes `accepted`: navegar a `/treatment?serviceRequestId={id}`.
- `/treatment` valida ownership paciente↔solicitud y status `accepted`.
- Si se inicia tratamiento, `EpisodeOfCare` se crea con `referralRequest = [ServiceRequest/{id}]`.
- Si ya existe `EpisodeOfCare` activo, no crear otro.
- `PatientOperationalStatus` no cambia por SR; sólo por `EpisodeOfCare` como hoy.

## 2) Hallazgos del estado actual

### 2.1 Inicio de tratamiento actual
- `startEpisodeOfCareAction` valida:
  - input schema (`patientId`, `startDate`);
  - existencia de paciente;
  - ausencia de episodio activo;
  - no duplicidad de DNI entre pacientes.
- Si pasa validaciones, llama `createEpisodeOfCare(input)`.
- No usa `revalidatePath`; en cliente se aplica `router.refresh()`.

### 2.2 Soporte técnico actual de vínculo SR↔EoC
- Repositorio de `EpisodeOfCare` ya soporta búsqueda por `incoming-referral`:
  - `listEpisodeOfCareByIncomingReferral(serviceRequestId)`.
- **Gap**: mapper write de `EpisodeOfCare` no incluye `referralRequest`.
- **Gap**: tipo de dominio `EpisodeOfCare` y `StartEpisodeOfCareInput` no contemplan `serviceRequestId`/`referralRequest`.
- **Gap**: mapper read no expone referencias SR de `EpisodeOfCare`.

## 3) Alcance recomendado para SR-003

### Incluido
1. Navegación desde solicitud `accepted` a `/treatment` con `serviceRequestId`.
2. Contextualización en `/treatment` de la solicitud preseleccionada.
3. Validaciones en loader/action de `/treatment`:
   - ownership paciente↔SR,
   - status `accepted`,
   - ausencia de episodio activo.
4. Creación de `EpisodeOfCare` con `referralRequest` cuando exista `serviceRequestId` válido.
5. Pruebas unitarias/integración de repositorio, mappers, loader/action y páginas involucradas.

### Excluido
- Iniciar tratamiento directamente desde `/administrative`.
- Cambiar reglas globales de `PatientOperationalStatus`.
- Habilitar visitas por SR sin `EpisodeOfCare` activo.
- Multi-episodio activo o re-diseño clínico.

## 4) Reglas funcionales propuestas

1. Sólo `ServiceRequest.accepted` puede originar inicio de tratamiento.
2. `in_review`, `closed_without_treatment`, `cancelled`, `entered_in_error` no habilitan inicio.
3. Si ya existe episodio activo, bloquear nuevo inicio (incluyendo el caso con `serviceRequestId`).
4. Si `serviceRequestId` no pertenece al paciente de la ruta, bloquear.
5. Si la SR `accepted` ya está vinculada a un EoC:
   - si hay EoC activo: mostrar como ya en tratamiento y bloquear nuevo inicio;
   - si sólo hay EoC cerrados: permitir iniciar nuevo episodio (decisión explícita y testeada).
6. El alta de visitas sigue condicionada exclusivamente por episodio activo.

## 5) UX evaluada

### Opción A (recomendada)
- Botón en `accepted`: “Iniciar tratamiento”.
- Navega a `/treatment?serviceRequestId={id}`.
- `/treatment` muestra contexto y decide habilitación.

**Pros**:
- Conserva ownership en `/treatment`.
- Menor fricción operativa.
- Reutiliza validaciones clínicas existentes.

### Opción B (alternativa)
- Botón “Ver en tratamiento”.
- Selección de SR dentro de `/treatment`.

**Pros**: más robusta si hay múltiples SR aceptadas.
**Contras**: mayor complejidad de UI/estado en esta etapa.

### Opción C (no recomendada)
- Iniciar desde `/administrative`.

**Motivo de descarte**: rompe separación administrativa vs clínica y aumenta riesgo de regresión conceptual.

## 6) Cambios técnicos sugeridos

1. `domain/episode-of-care`:
   - extender `StartEpisodeOfCareInput` con `serviceRequestId?: string`.
   - opcionalmente exponer `referralRequestIds?: string[]` en `EpisodeOfCare` (read model técnico).
2. mapper write `EpisodeOfCare`:
   - si `serviceRequestId` válido, serializar `referralRequest: [{ reference: "ServiceRequest/{id}" }]`.
3. mapper read `EpisodeOfCare`:
   - conservar `referralRequest` y extraer ids cuando estén presentes.
4. repository `createEpisodeOfCare`:
   - aceptar input extendido y delegar mapper write.
5. `/treatment` loader:
   - leer `searchParams.serviceRequestId`.
   - cargar SR por id, validar ownership y status.
   - opcional: consultar `listEpisodeOfCareByIncomingReferral` para contexto.
6. `startEpisodeOfCareAction`:
   - aceptar `serviceRequestId` opcional.
   - validar ownership + status `accepted` antes de crear episodio.
7. tests:
   - mappers EoC (write/read con `referralRequest`),
   - repository create/list/get,
   - action start con casos válidos e inválidos,
   - page/loader de treatment con query param manipulada.

## 7) Plan incremental en PRs chicos

1. **PR1** — Soporte técnico EoC↔SR:
   - dominio + mappers + repository create/read para `referralRequest`.
   - tests de mapper/repository.
2. **PR2** — Backend `/treatment`:
   - loader + action aceptan `serviceRequestId`.
   - validaciones ownership/status/episodio activo.
   - tests backend y de page server.
3. **PR3** — UI `/administrative`:
   - CTA en SR `accepted` hacia `/treatment?serviceRequestId=...`.
4. **PR4** — UI contextual `/treatment`:
   - bloque de contexto SR + mensajes de bloqueo/habilitación.
5. **PR5** — cierre documental y criterios de aceptación.

## 8) Riesgos y mitigaciones

1. **Confusión "solicitud aceptada" vs "tratamiento iniciado"**
   - Mitigar con copy explícito en ambas pantallas.
2. **Doble fuente de verdad SR↔EoC**
   - Mantener owner único del vínculo en `EpisodeOfCare.referralRequest`.
3. **Manipulación de query param**
   - Validar en servidor ownership + status + existencia.
4. **SR accepted ya vinculada**
   - Definir política explícita (bloqueo con activo; permitir nuevo si sólo cerrados).
5. **Regresión flujo actual de treatment**
   - Mantener camino sin `serviceRequestId` intacto + suite de regresión.
6. **Carga extra en loaders**
   - Evitar consultas redundantes; sólo cargar SR si hay query param.

## 9) Criterios de aceptación propuestos

1. Una SR `accepted` puede derivar a `/treatment` y disparar inicio válido.
2. EoC creado queda con referencia `ServiceRequest/{id}` en `referralRequest`.
3. SR no `accepted` no puede iniciar tratamiento.
4. SR de otro paciente no puede iniciar tratamiento.
5. Episodio activo bloquea nuevo inicio.
6. `PatientOperationalStatus` continúa derivando sólo por estado de episodio.
7. Registrar visita permanece condicionado a episodio activo.
