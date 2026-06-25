# Normalización y presentación de datos administrativos

> Estado: vigente
> Última actualización: 2026-06-25 (UTC)

## Objetivo

Concentrar en un único documento la guía activa para normalización y display de datos administrativos del paciente en la superficie privada.

Esta carpeta deja de mantener documentos separados para estrategia y helpers: el contrato vigente vive acá, y el material previo quedó archivado en `docs/archive/normalization-data/`.

## Alcance actual

Aplica a datos administrativos usados en `/admin`, sin cambiar el modelado FHIR base.

Campos incluidos:

- gender
- DNI
- teléfono
- fechas
- horas

Fuera de alcance:

- cambios en modelado FHIR
- validación externa como RENAPER
- múltiples teléfonos o canales complejos
- datepicker custom
- cambios de formularios más allá de validación básica

## Regla general

Toda la lógica debe mantenerse fuera de los componentes.

Separación vigente:

- `input -> validacion -> normalizacion -> persistencia`
- `persistencia -> lectura -> display`

Prohibido:

- usar valores sin normalizar para búsquedas
- formatear directamente en componentes
- aplicar display sobre valores no normalizados

## Helpers y contrato vigente

### DNI

#### `normalizeDni`

- input: string libre
- output: string con solo dígitos

#### `formatDniDisplay`

- input: string normalizado
- output: string con separadores para display, por ejemplo `12.345.678`

Regla vigente:

- el valor canónico es solo dígitos;
- ese mismo valor se usa para persistencia y búsquedas de duplicado;
- el formato con separadores es solo de presentación.

### Teléfono

#### `normalizePhone`

- input: string libre
- output: string limpio, sin espacios, guiones ni paréntesis

#### `formatPhoneDisplay`

- input: string normalizado
- output: formato legible

#### `buildTelHref`

- output: `tel:+54...`

#### `buildWhatsAppHref`

- output: `https://wa.me/...`

Regla vigente:

- se permite input flexible;
- no se fuerza una regex rígida;
- el valor normalizado debe ser la base para display y links.

### Gender

#### `formatGenderLabel`

- input: `male | female | other | unknown`
- output: `Hombre | Mujer | Otro | Desconocido`

Regla vigente:

- se preservan los valores FHIR internos;
- la traducción ocurre solo en UI;
- no se persiste semántica local adicional.

### Fechas

#### `formatDateDisplay`

- input: fecha
- output: formato local consistente, por ejemplo `dd/mm/aaaa`

#### `formatLocalDateInputValue`

- input: `Date` opcional
- output: `YYYY-MM-DD` usando año, mes y día locales

Regla obligatoria:

- no usar `toISOString().slice(0,10)` para defaults o envíos de `input[type="date"]`.

#### `formatDateTimeDisplay`

- input: `dateTime`
- output: fecha y hora

#### `calculateAgeFromBirthDate`

- input: `birthDate` en `YYYY-MM-DD`; en lectura legacy se tolera `YYYY-MM-DDT...`
- output: edad numérica para display o `null`

Reglas vigentes:

- `birthDate` y `EpisodeOfCare.startDate/endDate` son fechas calendario, no `dateTime`;
- la edad se deriva solo para UI, no se persiste;
- el display debe ser localizado y consistente.

Nota de ordenamiento de visitas:

- para ordenar `Encounter`, comparar timestamps reales parseados con `new Date(value).getTime()`;
- no ordenar por `localeCompare` de strings `dateTime`.

### Horas

#### `formatTimeDisplay`

- input: `dateTime`
- output: hora en formato 24h

Requisito:

- forzar `hour12: false`.

## Decisiones técnicas vigentes

- no incorporar una librería date/time en esta etapa;
- mantener inputs nativos `date` y `datetime-local`;
- evitar complejidad innecesaria mientras el problema siga siendo de normalización y display.

Reevaluar solo si aparece alguna de estas necesidades:

- formato obligatorio no cubierto por input nativo;
- datepicker consistente cross-browser;
- necesidades avanzadas de fecha y hora.

## Criterio de éxito

- datos consistentes en storage;
- duplicados de DNI detectados correctamente;
- UI legible y homogénea;
- sin dependencias innecesarias nuevas;
- listado de visitas ordenado por tiempo real parseado, no por comparación de strings.

## Historial archivado

El material previo quedó en `docs/archive/normalization-data/`.

Si algo archivado vuelve a ser necesario, conviene reintroducir solo la parte útil en este documento activo, no volver a abrir varias fuentes paralelas.
