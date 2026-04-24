# Fuente de verdad operativa del proyecto

> Última actualización: 2026-04-24 (UTC)

## 1) Resumen ejecutivo

El repositorio mantiene como superficie principal una **landing pública de captación local** para kinesiología a domicilio en Neuquén.

En paralelo, existe una **superficie privada clínica mínima transicional** bajo `/admin`, con soporte para:

- gestión base de pacientes;
- ciclo básico de tratamiento (`EpisodeOfCare`);
- registro/listado simple de visitas realizadas (`Encounter` base).

## 1.1) Dirección evolutiva del proyecto

- **Estado actual**:
  - la landing pública sigue activa y central en el repo;
  - existe implementación privada mínima clínica operativa;
  - el flujo privado todavía no cubre historial clínico rico ni operación completa.
- **Dirección aceptada**: evolucionar incrementalmente hacia una app clínica privada conviviente en el mismo repositorio.
- **Límite explícito del estado actual**: la superficie privada implementa núcleo operativo chico; no reemplaza todavía una historia clínica longitudinal completa.

## 2) Estado actual confirmado en código

### Rutas públicas
- `/` (home)
- `/services`
- `/evaluar`

### Rutas privadas
- `/admin`
- `/admin/patients`
- `/admin/patients/new`
- `/admin/patients/[id]`
- `/admin/patients/[id]/administrative`
- `/admin/patients/[id]/encounters`
- `/admin/patients/[id]/treatment`

#### Responsabilidad actual por ruta (superficie de pacientes)
- `/admin`: puerta de entrada operativa de la superficie privada.
- `/admin/patients`: listado operativo de pacientes.
- `/admin/patients/[id]`: hub del paciente (resumen + navegación a superficies administrativa y clínica).
- `/admin/patients/[id]/administrative`: edición administrativa no clínica (identidad, contacto y datos operativos).
- `/admin/patients/[id]/encounters`: superficie clínica operativa del paciente (contexto clínico + visitas).
- `/admin/patients/[id]/treatment`: superficie específica de gestión de tratamiento (inicio/finalización de `EpisodeOfCare`).

#### Criterio vigente de presentación UI entre `encounters` y `treatment`
- En `/admin/patients/[id]/encounters` domina visualmente la operación de visitas (registro y listado).
- El acceso desde `/encounters` hacia `/treatment` es secundario y compacto (navegación de apoyo, no CTA principal).
- En `/admin/patients/[id]/treatment` domina la gestión de tratamiento (inicio o finalización según estado).
- El lenguaje visible al usuario prioriza términos operativos de producto (“tratamiento”, “visitas”).
- Los tecnicismos (`EpisodeOfCare`, `Encounter`) se reservan para soporte/aclaración cuando aportan contexto.
- En `/encounters` se permite contexto de tratamiento **compacto** (solo informativo), sin gestión inline.
- En `/encounters` el contexto compacto distingue 3 estados semánticos:
  - tratamiento activo (muestra fecha de inicio);
  - tratamiento finalizado (muestra fecha de finalización);
  - sin tratamiento iniciado (muestra mensaje específico).
- En `/encounters` se evita duplicar estados visuales de tratamiento; se conserva señal impeditiva real cuando bloquea registrar visitas.

### Capacidades actuales

#### Landing pública
- navegación global en header/footer;
- catálogo de servicios con cards + CTA;
- flujo de orientación en `/evaluar` (selección de situación, resultado y CTA de consulta);
- contacto por WhatsApp y teléfono;
- SEO técnico base:
  - metadata global + metadata por ruta;
  - Open Graph/Twitter;
  - JSON-LD `MedicalBusiness`;
  - `robots.txt` y `sitemap.xml`;
- analítica con GA4 directo (sin GTM):
  - `generate_lead`
  - `phone_click`
  - `scroll_50`
  - `scroll_90`

#### Superficie privada clínica mínima
- listado de pacientes;
- alta mínima de paciente (incluye dirección operativa opcional, `gender` y `birthDate` opcionales);
- ficha consolidada de paciente en `/admin/patients/[id]` como hub (incluye visualización de dirección, `gender`, `birthDate` y navegación a gestión clínica/administrativa);
- edición administrativa acotada en `/admin/patients/[id]/administrative` (incluye edición de dirección, `gender`, `birthDate` y datos no clínicos);
- gestión de tratamiento en superficie específica (`/admin/patients/[id]/treatment`):
  - inicio de tratamiento;
  - cierre formal de tratamiento (finalización de `EpisodeOfCare` activo);
- la gestión de tratamiento no vive inline en `/admin/patients/[id]/encounters`;
- validación de DNI requerida para iniciar tratamiento;
- bloqueo simple por duplicado de DNI para iniciar tratamiento;
- estado operativo consistente entre listado y detalle para episodio activo/finalizado/sin tratamiento;
- representación visual del badge de tratamiento centralizada en helper compartido (`src/app/admin/patients/treatment-badge.ts`), separada de la lógica de estado operativo de dominio;
- `finished_treatment` se representa con badge amarillo en la UI privada de pacientes;
- pantalla de gestión clínica operativa por paciente (`/admin/patients/[id]/encounters`);
- registro de visita realizada (`Encounter`) con gate de tratamiento activo;
- listado de visitas del paciente ordenadas por fecha más reciente (dentro de la superficie clínica);
- en `/encounters`, la gestión de tratamiento se presenta como acceso secundario compacto (link/CTA secundario), sin co-protagonismo visual con visitas;
- en `/encounters`, el bloque de contexto de tratamiento fue reducido visualmente para no competir con la operación de visitas;
- en `/encounters`, el loader diferencia tratamiento finalizado vs sin tratamiento iniciado usando `activeEpisode` + `mostRecentEpisode`;
- en `/encounters`, se removió redundancia de estados positivos de tratamiento para priorizar la señal impeditiva real del registro de visitas;
- en `/treatment`, la cabecera/copy explicitan que es la superficie de inicio/cierre de tratamiento y no de operación de visitas;
- persistencia/lectura FHIR real para `Patient`, `EpisodeOfCare` y `Encounter`.
- no existe actualmente captura ni render de notas generales del paciente (`Patient.note`) en la UI privada.
- en el frente FHIR de `Patient`, Fase 1 está cerrada para `gender` + `birthDate`, Fase 2 para `Identifier.type` + tests/fixtures de identidad y Fase 3 queda cerrada con `telecom`, `contact.relationship` y `name` resueltos incrementalmente, más deuda/trigger explícitos de `address` documentados en FHIR-018.

## 3) Fuentes de verdad activas

| Dominio | Fuente primaria |
| --- | --- |
| Datos del negocio/contacto/base URL | `src/lib/config.ts` |
| Catálogo de servicios | `src/lib/servicesData.ts` |
| Navegación global | `src/lib/navLinks.ts` |
| Hero (copy editorial) | `src/app/hero/heroContent.ts` |
| Home (copy editorial) | `src/app/home/homeContent.ts` |
| Home “Cómo funciona” | `src/app/home/howItWorksContent.ts` |
| Flujo `/evaluar` | `src/app/(public)/evaluar/evaluar-content.ts` |
| Tracking GA4 | `src/lib/analytics.ts` |
| Superficie privada de pacientes | `src/app/admin/patients/**` |
| Reglas y validaciones clínicas mínimas | `src/domain/patient/**`, `src/domain/episode-of-care/**`, `src/domain/encounter/**` |

## 4) Límites vigentes (fuera de alcance actual)

- auth productiva;
- historial longitudinal rico;
- detalle clínico profundo por encuentro;
- notas clínicas longitudinales / notas generales persistidas en UI;
- `Observation` / `Procedure`;
- agenda;
- pagos;
- self-booking;
- `/portal`;
- panel administrativo amplio;
- multiusuario.

## 5) Observaciones técnicas relevantes

1. `sitemap.ts` actualmente publica solo `/` y `/services` (no incluye `/evaluar`).
2. Header/Footer público comparten `NAV_LINKS`; `/evaluar` no figura en esa navegación global (acceso principal desde CTA de Home).
3. El root layout (`src/app/layout.tsx`) no inyecta header/footer; la shell pública vive en `src/app/(public)/layout.tsx` y la shell privada en `src/app/admin/layout.tsx`.
4. La dirección del paciente se persiste como `Patient.address` simple (`text`) sin modelado postal rico.

## 6) Mantenimiento recomendado

- Si cambia contacto, URL base o ubicación: editar `src/lib/config.ts` y revisar `layout.tsx`, `robots.ts`, `sitemap.ts`.
- Si cambia catálogo de servicios: editar `src/lib/servicesData.ts` y revisar consumidores (`ServicesGrid`, footer, hero, JSON-LD del layout público).
- Si cambia copy editorial:
  - Hero: `heroContent.ts`
  - Home: `homeContent.ts` / `howItWorksContent.ts`
  - Evaluar: `src/app/(public)/evaluar/evaluar-content.ts`
- Si evoluciona la superficie privada clínica:
  - mantener este documento como fuente de verdad principal;
  - ejecutar `docs/checklist-sincronizacion-doc-codigo.md` como requisito de merge;
  - declarar explícitamente qué sigue siendo transicional y qué ya es productivo cuando ocurra.

## 7) Estado de validación local

- `npm run lint`: pasa.
- `npm run test`: pasa.
- `npm run build`: falla en entorno sin `FHIR_BASE_URL` para prerender de `/admin/patients`.

## Convenciones de datos administrativos (UI privada)

- Gender se muestra traducido en UI, manteniendo códigos FHIR internos.
- DNI se almacena como solo dígitos y se usa así para duplicados.
- Teléfono se normaliza antes de persistir y se reutiliza para links.
- Fechas se muestran en formato local consistente.
- Horas se muestran en formato 24h.

## Convenciones UX/UI privadas (pacientes)

- **Convención de retorno**
  - usar `← Volver a pacientes` cuando el destino es la colección/listado (`/admin/patients`);
  - usar `← Volver al paciente` cuando el destino es el hub interno del paciente (`/admin/patients/[id]`).

- **Convención de Maps**
  - el texto visible de dirección no se altera por la desambiguación del link;
  - el `href` de Google Maps se construye de forma centralizada en `buildGoogleMapsSearchHref` (`src/lib/patient-contact-links.ts`);
  - si la dirección no incluye contexto suficiente, el query agrega `Neuquén, Argentina`.

- **Títulos de pestaña (metadata privada)**
  - las rutas privadas tienen títulos específicos;
  - en rutas dinámicas se usa nombre real del paciente cuando está disponible, con fallback estático razonable.

- **Encabezados internos de superficies de paciente**
  - patrón común: link de retorno, `h1`, subtítulo contextual y metadata compacta;
  - metadata compacta cuando aplica: DNI, edad (si `birthDate` permite cálculo) y badge de tratamiento.
  - este criterio aplica a detalle, administrativa, visitas y tratamiento;
  - no se modifica el header global de `src/app/admin/layout.tsx`.

- **Feedback de formularios privados**
  - éxito en verde;
  - error en rojo;
  - copy de resultado específico (evitar mensajes genéricos);
  - cuando cancelar implica retorno, el copy debe explicitarlo (ej.: `Cancelar y volver al paciente`).
