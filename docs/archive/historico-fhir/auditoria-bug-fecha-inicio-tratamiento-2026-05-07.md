# Auditoría bug: "Aceptar e iniciar tratamiento" usa fecha actual

## Resultado

No encontré un reemplazo explícito de `treatmentStartDate` por "hoy" en el flujo de código auditado. El flujo UI → action → repository → mapper FHIR → read model conserva `treatmentStartDate` con el mismo valor.

Diagnóstico principal: el bug reportado por QA no se reproduce por inspección estática en esta rama; la causa más probable es **desalineación entre el flujo manual ejecutado por QA y el flujo auditado** (por ejemplo, uso de acción legacy en `/treatment` o entorno con versión anterior), o un problema de ejecución/UI no cubierto por tests de interacción real (click + cambio de date input).

## Evidencia por capa

### 1) UI administrativa
- El input de fecha existe y tiene `name="treatmentStartDate"`.
- El valor es controlado por estado React (`value={treatmentStartDate}` + `onChange`).
- El botón "Aceptar e iniciar tratamiento" no envía un `<form>` HTML tradicional; construye `FormData` manualmente y setea `treatmentStartDate` desde estado en `handleDirectAcceptAndStartTreatment`.

Conclusión: a nivel código, si el estado cambia, se envía el valor cambiado.

### 2) Action
- La action `acceptAndStartTreatmentFromServiceRequestAction` lee `treatmentStartDate` desde `FormData`.
- Valida obligatorio, formato `YYYY-MM-DD`, no futura y no anterior a `requestedAt` cuando esta es válida.
- Pasa `startDate: treatmentStartDate` a `createEpisodeOfCare`.

Conclusión: la action conserva y propaga la fecha explícita.

### 3) Repository / dominio
- `createEpisodeOfCare(input)` recibe `StartEpisodeOfCareInput` con `startDate` requerido.
- No hay fallback a hoy en repository.

### 4) Mapper FHIR write
- `mapStartEpisodeOfCareInputToFhir` escribe `period.start = input.startDate`.
- No hay normalización a fecha actual ni conversiones de zona horaria que sustituyan el valor.
- `referralRequest` se conserva usando `serviceRequestId`.

### 5) Read / display
- `mapFhirEpisodeOfCareToDomain` lee `startDate` desde `resource.period?.start ?? ""`.
- `/treatment` muestra `activeEpisode.startDate` directamente.
- `/administrative` historial muestra `linkedEpisode.startDate` directamente.
- `/encounters` usa `episodeStartDate: effectiveEpisode?.startDate` para cálculos.

Conclusión: tampoco hay fallback a hoy en display cuando existe `period.start`.

## Hallazgos de testing

Cobertura existente:
- Action testea que `createEpisodeOfCare` se llame con `startDate` igual al `treatmentStartDate` enviado.
- Mapper testea mapeo de `startDate` en recursos EpisodeOfCare.
- UI test actual valida render estático (incluye value inicial), pero **no** interacción real de usuario cambiando fecha y clickeando botón para verificar `FormData` enviado.

Gap más importante:
- Falta test de integración/interacción del componente `ServiceRequestStatusActions` que:
  1. cambie el input date,
  2. haga click en "Aceptar e iniciar tratamiento",
  3. inspeccione `FormData` recibido por `acceptAndStartTreatmentFromServiceRequestAction` mockeada,
  4. confirme que viaja la fecha modificada y no el default.

## Hipótesis más probables (ordenadas)

1. QA corrió un build previo sin este flujo (o con flujo legacy).
2. QA inició tratamiento desde `/treatment` (formulario legacy) en lugar de la acción directa de administrativa.
3. Problema de interacción UI no capturado por test SSR estático (menos probable por el código actual, pero posible por timing/eventos del navegador).

## Recomendación de fix (acotado y reversible)

Sin cambiar reglas de negocio, agregar observabilidad temporal y tests:

1. **Test de interacción UI** (prioridad alta): cubrir cambio de date + click + assert de `FormData`.
2. **Log temporal (debug) en action** detrás de flag de entorno para registrar `serviceRequestId` y `treatmentStartDate` recibidos (retirable).
3. **Test e2e mínimo** del flujo administrativa → creación EpisodeOfCare verificando `period.start` persistido.

Esto permite confirmar en qué capa real se desvía en entorno QA sin tocar single-use de ServiceRequest, referralRequest, cierre, visitas ni demás no-alcances.

## No-alcances preservados

- No se modificaron reglas clínicas ni operativas.
- No se tocaron single-use de ServiceRequest, referralRequest, cierre de tratamiento, encounters/visitas, clinical notes, observations, IA, appointment ni dashboard.
- No se cambió la UX de administrativa ni las reglas de fechas definidas.


## Cierre documental posterior (2026-05-08)

### Diagnóstico final
- Se confirma la hipótesis de auditoría inicial: en la rama vigente no hay reemplazo explícito de la fecha elegida por el usuario hacia “hoy”.
- El riesgo real identificado fue de **confusión semántica** entre:
  - fecha administrativa de solicitud (`ServiceRequest.requestedAt`),
  - fecha clínica de inicio real (`EpisodeOfCare.startDate` / `period.start`),
  - baseline operativo de visitas en `/encounters`.

### Cierre aplicado
Se cerró reforzando cobertura documental y de tests en los puntos de frontera donde podía mezclarse `requestedAt` con `startDate`, sin modificar reglas de dominio ni mapeos FHIR.

### Tests agregados / reforzados
- UI/helper de `FormData`: conserva `treatmentStartDate` elegido por la persona usuaria al confirmar “Aceptar e iniciar tratamiento”.
- Action: `acceptAndStartTreatmentFromServiceRequestAction` forwardea `treatmentStartDate` como `startDate` a `createEpisodeOfCare`.
- `/treatment`: muestra `EpisodeOfCare.startDate` como “Inicio del tratamiento”.
- `/treatment`: separa semánticamente “Fecha de solicitud” (`requestedAt`) e “Inicio” (`EpisodeOfCare.startDate`).
- `/encounters`: usa `EpisodeOfCare.startDate` como baseline para primera visita del tratamiento (no `ServiceRequest.requestedAt`).

### Resultado de validación
- Validación final consistente con la auditoría inicial: no se detectó override a fecha actual en el flujo UI → action → repository → mapper → loaders/display.
- El cierre del bugfix se considera documental + cobertura: se explicita regla vigente y se protege regresión semántica en capas de entrada/salida.

### Regla vigente (fuente operativa)
- “Aceptar e iniciar tratamiento” crea `EpisodeOfCare` vinculado a `ServiceRequest` por `referralRequest`.
- La fecha de inicio de tratamiento es explícita y editable.
- `ServiceRequest.requestedAt` funciona como default inicial cuando es válido.
- La fecha persistida en `EpisodeOfCare.period.start` es la elegida por el usuario.
- `ServiceRequest.requestedAt` se conserva como dato administrativo/histórico de la solicitud.
- Si existe `EpisodeOfCare.startDate`, `requestedAt` no debe usarse como baseline clínico de visitas.

### No-alcances preservados
- Sin cambios en reglas single-use de `ServiceRequest`.
- Sin cambios en `referralRequest`.
- Sin cambios en cierre de tratamiento.
- Sin cambios en `Encounter`/visitas más allá de cobertura y validación de baseline vigente.
- Sin cambios en `clinicalNote`, `Observation`, puntualidad operativa, `Appointment`, IA, dashboard o rediseño de administrativa.
