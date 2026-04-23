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

### formatDateTimeDisplay

Input:

* dateTime

Output:

* fecha + hora

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
