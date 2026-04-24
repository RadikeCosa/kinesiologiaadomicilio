# Normalización y presentación de datos administrativos del paciente

> Estado: aprobado para implementación
> Fecha: 2026-04-23

## 1. Objetivo

Mejorar la calidad, consistencia y legibilidad de los datos administrativos del paciente en la superficie privada (`/admin`) sin modificar el modelado FHIR base.

## 2. Alcance

Campos incluidos:

* gender
* DNI
* teléfono
* fechas (día/mes/año)
* horas (formato 24h en display)

Fuera de alcance:

* cambios en modelado FHIR
* validación externa (ej. RENAPER)
* múltiples teléfonos o canales
* datepicker custom
* cambios en formularios más allá de validación básica

---

## 3. Decisiones clave

### 3.1 Gender

* Se mantienen valores FHIR internos:

  * `male | female | other | unknown`
* Se traduce solo en UI:

  * Hombre / Mujer / Otro / Desconocido
* No se introduce semántica local persistida

---

### 3.2 DNI

* Valor canónico: **solo dígitos**
* Se elimina cualquier separador al guardar
* Se usa el mismo valor para:

  * persistencia
  * búsquedas de duplicado

Display:

* puede mostrarse con separadores (ej. 12.345.678)

---

### 3.3 Teléfono

* Se permite input flexible (sin regex rígida)
* Se normaliza a valor consistente
* Se usa ese valor para:

  * display
  * `tel:`
  * WhatsApp

---

### 3.4 Fechas

* Se mantienen inputs nativos (`date`, `datetime-local`)
* Persistencia:

  * `YYYY-MM-DD` (fecha)
  * FHIR `dateTime` para encuentros
* Convenciones vigentes:

  * `birthDate` y `EpisodeOfCare.startDate/endDate` son fechas calendario (no dateTime)
  * para defaults de `input[type="date"]` usar fecha local de calendario
  * **no usar `toISOString().slice(0,10)`** para defaults/envíos de fecha
* Display:

  * formato localizado consistente (ej. `dd/mm/aaaa`)
* Edad:

  * se calcula para display a partir de `birthDate`
  * no se persiste como campo propio

---

### 3.5 Horas

* Display siempre en formato **24h**
* Se fuerza en helpers (`hour12: false`)
* Input nativo no se modifica

---

### 3.6 Librerías date/time

**Decisión: NO incorporar librería en esta etapa**

Rationale:

* inputs nativos ya cubren el flujo actual
* el problema actual es de display/normalización
* no hay React Hook Form
* evitar complejidad innecesaria

Reevaluar solo si:

* se requiere `dd-mm-aaaa` obligatorio en input
* se necesita datepicker consistente cross-browser
* aparecen necesidades avanzadas

---

## 4. Estrategia técnica

No modificar modelado ni FHIR.

Se introduce:

* capa de helpers de normalización
* capa de helpers de display

Separación explícita:

* **input → validación → normalización → persistencia**
* **persistencia → lectura → display**

---

## 5. Criterio de éxito

* datos consistentes en storage
* duplicados de DNI correctamente detectados
* UI legible y homogénea
* sin introducir dependencias innecesarias
* listado de visitas ordenado por tiempo real parseado (no string compare)

---

## 6. Límites

* no forzar formato en inputs nativos
* no sobrerregular teléfono AR
* no introducir lógica compleja innecesaria
