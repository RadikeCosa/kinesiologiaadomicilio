Cierre de implementación — normalización administrativa de paciente

Estado: cerrado
Fecha: 2026-04-23

1. Resumen ejecutivo

Se completó la implementación del frente de normalización y presentación de datos administrativos del paciente en la superficie privada (/admin).

El objetivo fue mejorar:

consistencia de datos en storage,
confiabilidad operativa (especialmente DNI),
legibilidad y coherencia de UI,
sin modificar el modelado FHIR ni introducir complejidad innecesaria.

Resultado:

Se logró una capa consistente de normalización + display, centralizada en helpers, aplicada en toda la UI privada.

2. Alcance implementado

Campos cubiertos:

gender
DNI
teléfono
fechas
horas (formato 24h en display)

Fuera de alcance (mantenido):

modelado FHIR
validación externa (RENAPER)
datepicker custom
múltiples teléfonos
WhatsApp como canal FHIR
control de formato en inputs nativos
3. Implementación por etapas
Ticket 1 — Gender
helper formatGenderLabel
traducción UI:
male → Hombre
female → Mujer
other → Otro
unknown → Desconocido
sin cambios en dominio/FHIR
Ticket 2 — DNI
helper normalizeDni (valor canónico: solo dígitos)
helper formatDniDisplay (formato legible)
validación en schema (7–8 dígitos)
persistencia normalizada
búsquedas y duplicados normalizados

Impacto:

Se eliminan falsos no-duplicados por formato (ej. 12.345.678 vs 12345678)

Ticket 3 — Teléfono
helper normalizePhone
helper formatPhoneDisplay
helper buildTelHref
helper buildWhatsAppHref
validación tolerante (10–15 dígitos)
persistencia normalizada
UI sin lógica inline

Decisión:

No sobrerregular numeración argentina.

Ticket 4 — Fechas y horas
helper formatDateDisplay (dd/mm/aaaa)
helper formatTimeDisplay (24h obligatorio)
helper formatDateTimeDisplay
eliminación de toLocaleString directo en componentes
estandarización en:
encounters
detalle
hub
tratamiento
4. Decisiones técnicas clave
4.1 Separación de responsabilidades

Se estableció como regla:

input → validación → normalización → persistencia
persistencia → lectura → display

Y:

ningún componente formatea datos directamente
todo pasa por helpers
4.2 No modificación de FHIR
se mantuvieron contratos existentes
no se introdujeron extensiones
no se alteró estructura de Patient

Esto mantiene alineación con el cierre del frente FHIR Patient.

4.3 No uso de librerías

Se decidió:

No incorporar date/time picker ni librerías de formateo

Motivo:

inputs nativos suficientes
problema era de display, no de widget
evitar sobreingeniería
4.4 Inputs nativos
date y datetime-local se mantienen
no se fuerza dd-mm-aaaa en input
la consistencia se resuelve en display
5. Estado final del sistema
Datos
DNI consistente en storage y duplicados
teléfono consistente y reutilizable
sin contaminación por formatos libres
UI
gender traducido
DNI legible
teléfono usable (click/WhatsApp)
fechas homogéneas
horas en 24h
Código
helpers centralizados (src/lib/patient-admin-display.ts)
eliminación de lógica inline
cobertura de tests en:
helpers
schemas
mappers
repositorios
UI
6. Riesgos conocidos (aceptados)
datos legacy de DNI pueden existir con formato previo
teléfono no valida semántica completa de numeración AR
timezone depende del entorno del usuario
inputs nativos no garantizan formato visual uniforme

Todos estos riesgos son aceptados y documentados.

7. Criterio de cierre

Este frente se considera cerrado porque:

no hay bugs funcionales detectados
no hay lógica duplicada
no hay ambigüedad en contratos
la UI es consistente
la implementación está cubierta por tests
8. Criterio para reabrir

Reabrir solo si aparece:

bug real en validación/normalización
necesidad de input custom (datepicker)
necesidad de validación más estricta (ej. identidad real)
expansión del modelo (multi-telefono, etc.)

No reabrir por mejoras cosméticas menores.

9. Conclusión operativa

La normalización administrativa del paciente quedó resuelta de forma simple, consistente y alineada con el estado actual del producto, sin introducir complejidad innecesaria.