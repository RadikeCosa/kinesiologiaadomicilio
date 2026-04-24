# Contrato de helpers de normalización y display

## 1. Objetivo

Centralizar la lógica de:

* normalización (antes de persistir)
* display (antes de renderizar)

Evitar duplicación en componentes.

---

## 2. DNI

### normalizeDni

Input:

* string libre

Output:

* string con solo dígitos

---

### formatDniDisplay

Input:

* string normalizado

Output:

* string con separadores (ej. 12.345.678)

---

## 3. Teléfono

### normalizePhone

Input:

* string libre

Output:

* string limpio (sin espacios, guiones, paréntesis)

---

### formatPhoneDisplay

Input:

* string normalizado

Output:

* formato legible

---

### buildTelHref

Output:

* `tel:+54...`

---

### buildWhatsAppHref

Output:

* `https://wa.me/...`

---

## 4. Gender

### formatGenderLabel

Input:

* `male | female | other | unknown`

Output:

* Hombre / Mujer / Otro / Desconocido

---

## 5. Fechas

### formatDateDisplay

Input:

* fecha

Output:

* formato local consistente (dd/mm/aaaa)

---

### formatLocalDateInputValue

Input:

* `Date` opcional (usa `new Date()` por defecto)

Output:

* `YYYY-MM-DD` usando año/mes/día **locales**

Regla:

* no usar `toISOString().slice(0,10)` para defaults/envíos de `input[type="date"]`

---

### formatDateTimeDisplay

Input:

* dateTime

Output:

* fecha + hora

Nota de ordenamiento de visitas:

* para ordenar encounters, comparar timestamps reales parseados (`new Date(value).getTime()`)
* no ordenar por `localeCompare` de strings dateTime

---

### calculateAgeFromBirthDate

Input:

* `birthDate` (`YYYY-MM-DD`; en lectura legacy se tolera `YYYY-MM-DDT...`)

Output:

* edad numérica para display o `null`

Regla:

* edad derivada solo en UI, no persistida

---

## 6. Horas

### formatTimeDisplay

Input:

* dateTime

Output:

* hora en formato 24h

Requisito:

* `hour12: false`

---

## 7. Regla general

* Ningún componente debe formatear directamente
* Todo pasa por helpers
  
## Regla de normalización obligatoria

Todo valor administrativo debe cumplir:

input → validación → normalización → persistencia

Y:

persistencia → lectura → display

Prohibido:
- usar valores sin normalizar para búsquedas
- formatear directamente en componentes
- aplicar display sobre valores no normalizados
