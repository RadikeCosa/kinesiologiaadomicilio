# PRODUCT-SR-HARDENING-2 — Control de doble uso de ServiceRequest aceptada

Fecha: 2026-04-28  
Estado: implementado/cerrado (PR1-PR3)

## Objetivo
Endurecer el flujo SR→Treatment para evitar reutilizar la misma `ServiceRequest` aceptada en más de un `EpisodeOfCare`.

## Política elegida
**Single-use SR (Opción B):** si una `ServiceRequest` ya está vinculada a cualquier `EpisodeOfCare` (activo, finalizado u otro estado), no puede volver a usarse para iniciar otro tratamiento.

## Plan incremental
1. **PR1 (este PR)**: hardening backend en `startEpisodeOfCareAction`.
   - usar `listEpisodeOfCareByIncomingReferral(serviceRequestId)`;
   - bloquear si existen vínculos previos;
   - mantener flujo legacy intacto cuando no llega `serviceRequestId`.
2. **PR2**: copy/UI mínima en `/treatment` para explicar bloqueo por SR ya usada. ✅ completado
3. **PR3**: cierre documental final y validación de aceptación. ✅ completado

## Criterios de aceptación PR1
- SR accepted sin vínculos previos puede iniciar tratamiento.
- SR accepted con cualquier vínculo previo no puede iniciar otro tratamiento.
- bloqueo implementado vía `incoming-referral`.
- flujo legacy sin SR no se rompe.


## Criterios de aceptación end-to-end (cierre)
- SR `accepted` sin vínculos previos puede iniciar tratamiento desde `/treatment`.
- SR `accepted` con cualquier vínculo previo (`incoming-referral`) queda bloqueada por política single-use.
- El bloqueo no discrimina estado del `EpisodeOfCare` ya vinculado.
- Flujo legacy sin `serviceRequestId` no consulta `incoming-referral` y se mantiene intacto.
- `/treatment` muestra aviso específico para `already_used` y no pasa `serviceRequestId` al formulario.
- No hay cambios en `PatientOperationalStatus`, badges globales ni habilitación de visitas por SR.
