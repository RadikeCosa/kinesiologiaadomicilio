
**Plan por fases (mínimo, preciso, ejecutable)**

### Fase 1 — Consolidar catálogo de servicios en superficies secundarias

**Objetivo**
Eliminar drift de servicios fuera del grid principal, usando `servicesData.ts` como fuente primaria única del dominio servicios.

**Alcance (archivos probables)**

- `src/app/services/data/servicesData.ts`
- `src/components/Footer.tsx`
- `src/app/hero/components/HeroServiceTypesList.tsx`
- (sin tocar aún JSON-LD en esta fase)

**Cambio conceptual**

- Footer y lista de hero dejan de mantener listas manuales de servicios.
- Se derivan desde catálogo existente (con variante corta si hace falta).

**Fuente de verdad consolidada**

- Servicios = `servicesData.ts`.

**Duplicaciones que elimina**

- Lista manual en footer vs catálogo.
- Lista manual en hero vs catálogo.

**Fuera de alcance explícito**

- Metadata de páginas.
- JSON-LD de `layout.tsx`.
- Copy editorial de hero (H1/subtitle/CTA principal).

**Done de fase**

- Footer ya no tiene array/lista de servicios hardcodeada.
- `HeroServiceTypesList` ya no define manualmente servicios que pertenecen al catálogo.
- El catálogo visible en `/services`, footer y hero deriva del mismo origen.

### Fase 2 — Derivar structured data de fuentes existentes (servicios + negocio)

**Objetivo**
Reducir el drift SEO estructurado: que JSON-LD no replique manualmente servicios/negocio ya existentes en `servicesData.ts` y `config.ts`.

**Alcance (archivos probables)**

- `src/app/layout.tsx`
- `src/lib/config.ts`
- `src/app/services/data/servicesData.ts`

**Cambio conceptual**

- `serviceType` / `hasOfferCatalog` del JSON-LD se arma desde catálogo.
- `name`, `telephone`, `address`, `geo`, `url` del JSON-LD se deriva de `config`.

**Fuente de verdad consolidada**

- Negocio/contacto = `config.ts`
- Servicios = `servicesData.ts`
- `layout.tsx` queda como consumidor/ensamblador SEO global.

**Duplicaciones que elimina**

- Servicios manuales en JSON-LD.
- Teléfono/nombre/ubicación/url repetidos manualmente en JSON-LD respecto `config`.

**Fuera de alcance explícito**

- No tocar aún copy editorial visible del hero.
- No introducir arquitectura SEO nueva.

**Done de fase**

- JSON-LD no contiene nombres/descripciones de servicios escritos a mano.
- JSON-LD no repite manualmente campos de negocio ya definidos en `config`.
- Un cambio en catálogo o contacto impacta JSON-LD sin edición manual duplicada.

### Fase 3 — Alinear metadata global y datos técnicos de URL/base

**Objetivo**
Disminuir drift entre metadata/canonical/base URL/sitemap/robots y datos de negocio base.

**Alcance (archivos probables)**

- `src/app/layout.tsx`
- `src/app/sitemap.ts`
- `public/robots.txt`
- `src/lib/config.ts`

**Cambio conceptual**

- `layout` deja de hardcodear valores globales derivables de `config` (al menos URL/base y nombre/contacto donde corresponda).
- Alineación explícita con `sitemap`/`robots` para evitar divergencia de dominio/canonical.

**Fuente de verdad consolidada**

- Datos globales negocio/url = `config.ts` (como base de referencia).

**Duplicaciones que elimina**

- Repetición de URL base y datos globales en varias capas SEO técnicas.

**Fuera de alcance explícito**

- Keywords/description editoriales finas (pueden seguir por archivo de ruta).
- No tocar aún labels de navegación/CTA.

**Done de fase**

- Base URL/canonical/sitemap/robots están alineados y mantenibles con un único punto de edición lógico.
- `layout.tsx` reduce hardcodes de negocio/contacto duplicados.

### Fase 4 — Separar hero editorial del dominio servicios (heroContent mínimo)

**Objetivo**
Ordenar el hero como dominio editorial propio sin mezclarlo con catálogo.

**Alcance (archivos probables)**

- `src/app/hero/hero.tsx`
- `src/app/hero/components/HeroSecondaryLink.tsx`
- nuevo archivo mínimo de contenido editorial de hero (ej. `heroContent`)

**Cambio conceptual**

- H1/subtítulo/CTA editorial del hero se centralizan en una fuente pequeña de copy de hero.
- La parte “tipos de servicio” del hero permanece derivada del catálogo (resultado de Fase 1).

**Fuente de verdad consolidada**

- Hero editorial = archivo mínimo `heroContent`
- Hero de servicios = `servicesData.ts`

**Duplicaciones que elimina**

- Strings de hero repartidos entre componentes.

**Fuera de alcance explícito**

- No convertir todo el sitio en sistema de content files.
- No mover copy única de una sola pantalla que no se repite.

**Done de fase**

- El hero no tiene copy editorial crítica enterrada en JSX.
- Hero editorial y catálogo quedan explícitamente separados por dominio.

### Fase 5 — Micro-consolidación de labels globales de navegación/CTA

**Objetivo**
Reducir inconsistencias de labels globales repetidos (header/footer y CTAs recurrentes), sin sobrecentralizar.

**Alcance (archivos probables)**

- `src/components/Header.tsx`
- `src/components/Footer.tsx`
- pequeño módulo shared de labels (solo los repetidos)

**Cambio conceptual**

- Consolidar únicamente labels repetidos: nav principal y CTAs globales recurrentes.
- Dejar inline los textos únicos/contextuales.

**Fuente de verdad consolidada**

- Labels globales repetidos = fuente compartida mínima.

**Duplicaciones que elimina**

- “Inicio/Servicios” duplicados en header/footer.
- Algunos labels CTA globales redundantes.

**Fuera de alcance explícito**

- No unificar todos los mensajes WhatsApp (algunos deben seguir contextuales por intención).
- No crear diccionario global de todo el sitio.

**Done de fase**

- Header y footer consumen los mismos labels globales de navegación.
- No se centralizan strings únicos de bajo valor.

### Orden recomendado y justificación

- **Fase 1 primero (alto impacto, bajo riesgo):**
  Corrige drift visible en UI (footer/hero) con cambios acotados y prepara fase SEO siguiente.

- **Fase 2 después (alto impacto SEO, riesgo medio):**
  Aprovecha consolidación de servicios para derivar JSON-LD sin inventar nuevas fuentes.

- **Fase 3 luego (consistencia técnica global):**
  Cierra duplicaciones de URL/base/contacto en metadata/sitemap/robots.

- **Fase 4 después (editorial):**
  Separa hero cuando los dominios ya están limpios; evita mezclar “copy” con “catálogo”.

- **Fase 5 al final (higiene fina):**
  Micro-centralización de labels compartidos sin frenar lo importante.

Este orden evita refactor grande, reduce riesgo acumulativo y deja cada fase con valor independiente.

### Riesgos por fase (y cómo acotarlos)

**Fase 1**

- Técnico: bajo (consumidores de listas).

- Semántico/editorial: medio (labels cortos del hero pueden requerir variante).

- Sobrecen: bajo si solo se derivan servicios repetidos.

**Fase 2**

- Técnico: medio (mapeo de catálogo a schema.org).

- Semántico: medio (texto schema vs copy UI no siempre idéntico).

- Sobrecen: bajo si `layout` sigue siendo ensamblador y no se crea capa extra.

**Fase 3**

- Técnico: medio-bajo (alinear URL/canonical/sitemap/robots).

- Semántico: bajo.

- Sobrecen: bajo si solo se derivan campos claramente globales.

**Fase 4**

- Técnico: bajo.

- Semántico: medio (tono y posicionamiento de hero).

- Sobrecen: medio si se intenta externalizar todo; mantenerlo mínimo.

**Fase 5**

- Técnico: bajo.

- Semántico: bajo-medio (consistencia de wording).

- Sobrecen: alto si se intenta centralizar absolutamente todos los textos; evitarlo.

### Recomendación sobre diseño de fuentes (confirmaciones pedidas)

**`servicesData.ts`:**
No reemplazar. Sí conviene fortalecerlo levemente (campos mínimos para variantes cortas/SEO-schema si son necesarias), sin crear “services copy file” aparte.

**`config.ts`:**
Debe seguir como fuente primaria de negocio/contacto.

**Fuente compartida para labels globales nav/CTA:**
Sí, pero mínima y tardía (fase 5), solo para textos repetidos en múltiples superficies.

**`heroContent`:**
Sí conviene, pero en fase posterior (fase 4), cuando catálogo/SEO ya estén consolidados para no mezclar dominios.

### Resultado final esperado (sin sobre-refactor)

#### Al terminar las fases:

- **Centralizado claramente**
  - Negocio/contacto: `config.ts`.
  - Servicios: `servicesData.ts`.
  - Hero editorial: `heroContent` mínimo.
  - Labels globales repetidos: fuente compartida mínima (solo lo necesario).

- **Derivado consistentemente**
  - Footer/hero servicios y JSON-LD desde catálogo.
  - JSON-LD y metadata global con datos de negocio alineados a `config`.
  - URL base/canonical/sitemap/robots sin drift.

- **Legítimamente inline (no centralizar todavía)**
  - Copy único de una sección que no se repite.
  - Mensajes WhatsApp contextuales por intención (cuando aportan valor real).
  - Microcopy puramente presentacional de un solo componente