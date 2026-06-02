# Plan de implementación — normalización administrativa

## Ticket 1 — Gender display

Scope:

* crear `formatGenderLabel`
* reemplazar render crudo en UI

Out:

* no tocar schema ni FHIR

---

## Ticket 2 — DNI

Scope:

* validación en schema (digits-only)
* normalizeDni
* aplicar en:

  * create/update
  * búsquedas de duplicado
* formatDniDisplay

Riesgo:

* datos legacy

---

## Ticket 3 — Teléfono

Scope:

* normalizePhone
* validación mínima (longitud)
* formatPhoneDisplay
* buildTelHref
* ajustar WhatsApp

Out:

* no regex rígida

---

## Ticket 4 — Fechas y horas

Scope:

* formatDateDisplay
* formatDateTimeDisplay
* formatTimeDisplay (24h)
* reemplazar usos directos de toLocaleString

Out:

* no cambiar inputs

---

## Orden obligatorio

1 → 2 → 3 → 4

---

## Criterios de aceptación globales

* no hay lógica duplicada
* todos los campos se muestran consistente
* DNI consistente en duplicados
* hora siempre 24h en display
