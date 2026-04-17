# Fuente de verdad operativa del proyecto

> Última actualización: 2026-04-17 (UTC)

## 1) Resumen ejecutivo

El repositorio mantiene como superficie principal una **landing pública de captación local** para kinesiología a domicilio en Neuquén.

En paralelo, existe una **superficie privada mínima transicional** para flujo clínico inicial bajo `/admin/patients`, hoy extendida con Encounter base.

## 1.1) Dirección evolutiva del proyecto (decisión de encuadre)

- **Estado actual**:
  - la landing pública sigue activa y central en el repo;
  - existe una implementación privada mínima para `Patient`, `EpisodeOfCare` y `Encounter` base.
- **Dirección aceptada**: evolucionar de forma incremental hacia una app clínica privada conviviente en el mismo repositorio.
- **Límite explícito del estado actual**: la superficie privada implementada hoy sigue siendo mínima; no cubre detalle por `encounterId` ni flujo longitudinal clínico completo.
- **Foco funcional efectivamente implementado**:
  - alta mínima de paciente;
  - edición incremental de paciente;
  - inicio de tratamiento (`EpisodeOfCare`) como acción separada;
  - cierre formal de tratamiento (`EpisodeOfCare` activo -> `finished`);
  - validación de DNI para iniciar tratamiento y bloqueo simple por duplicado;
  - lectura mínima de listado y detalle de pacientes;
  - encounters base por paciente:
    - listado básico de visitas registradas;
    - registro de visita simple (`Encounter`) con gate de episodio activo.
- **Fuera de alcance vigente**:
  - `/admin/patients/[id]/encounters/[encounterId]`;
  - `Observation`;
  - `Procedure`;
  - historial longitudinal complejo;
  - auth productiva completa;
  - agenda, pagos, self-booking, `/portal`, panel administrativo amplio.

### Aclaración de límites documentales

- No documentar capacidades futuras como si existieran hoy.
- No reinterpretar el repo como si ya fuera una app clínica madura.

## 2) Estado actual confirmado en código

### Rutas públicas
- `/` (home)
- `/services`
- `/evaluar`

### Rutas privadas mínimas
- `/admin/patients`
- `/admin/patients/new`
- `/admin/patients/[id]`
- `/admin/patients/[id]/encounters`

### Capacidades actuales
- **Landing pública**:
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
- **Superficie privada mínima**:
  - listado mínimo de pacientes;
  - alta mínima de paciente;
  - detalle de paciente;
  - edición incremental de datos;
  - inicio de tratamiento en acción separada (no automática en alta);
  - cierre formal de tratamiento (finalización de `EpisodeOfCare` activo);
  - validación de DNI requerida para iniciar tratamiento;
  - bloqueo simple por duplicado de DNI para iniciar tratamiento;
  - estado operativo consistente entre listado y detalle para:
    - episodio activo;
    - tratamiento finalizado;
    - ausencia de tratamiento;
  - encounters base:
    - registro simple de visita realizada;
    - create permitido solo con `EpisodeOfCare` activo;
    - listado de encounters por paciente en `/admin/patients/[id]/encounters`.
  - persistencia/lectura FHIR real para `Patient`, `EpisodeOfCare` y `Encounter` base;
  - cobertura de tests de dominio/infraestructura y route-local para el tramo Encounter base.

## 3) Fuentes de verdad activas

| Dominio | Fuente primaria |
| --- | --- |
| Datos del negocio/contacto/base URL | `src/lib/config.ts` |
| Catálogo de servicios | `src/lib/servicesData.ts` |
| Navegación global | `src/lib/navLinks.ts` |
| Hero (copy editorial) | `src/app/hero/heroContent.ts` |
| Home (copy editorial) | `src/app/home/homeContent.ts` |
| Home “Cómo funciona” | `src/app/home/howItWorksContent.ts` |
| Flujo `/evaluar` | `src/app/evaluar/evaluar-content.ts` |
| Tracking GA4 | `src/lib/analytics.ts` |
| Slice clínico privado (rutas/admin pacientes + encounters) | `src/app/admin/patients/**` |
| Reglas y validaciones clínicas mínimas | `src/domain/patient/**`, `src/domain/episode-of-care/**`, `src/domain/encounter/**` |
| Diseño pre-implementación Encounter (histórico) | `docs/slice-2/encounter-base-pre-implementacion.md` |
| Cierre implementado Encounter base | `docs/slice-2/slice-2-encounter-base-cierre.md` |

## 4) Observaciones técnicas relevantes

1. `/evaluar` está implementada y enlazada desde Home.
2. `sitemap.ts` actualmente publica solo `/` y `/services` (no incluye `/evaluar`).
3. Header/Footer de la superficie pública comparten `NAV_LINKS`; `/evaluar` no figura en esa navegación global (acceso principal desde CTA de Home).
4. La superficie privada `/admin/patients/*` usa FHIR real para `Patient`, `EpisodeOfCare` y `Encounter` base, pero sigue siendo una base clínica mínima (sin detalle por `encounterId` ni clínica rica).
5. El root layout (`src/app/layout.tsx`) no inyecta header/footer; la shell pública vive en `src/app/(public)/layout.tsx` y la shell privada en `src/app/admin/layout.tsx`.

## 5) Mantenimiento recomendado

- Si cambia contacto, URL base o ubicación: editar `src/lib/config.ts` y revisar `layout.tsx`, `robots.ts`, `sitemap.ts`.
- Si cambia catálogo de servicios: editar `src/lib/servicesData.ts` y revisar consumidores (`ServicesGrid`, footer, hero, JSON-LD del layout público).
- Si cambia copy editorial:
  - Hero: `heroContent.ts`
  - Home: `homeContent.ts` / `howItWorksContent.ts`
  - Evaluar: `evaluar-content.ts`
- Si evoluciona la superficie privada clínica:
  - mantener alineadas `docs/slice-1/slice-1.md`, `docs/slice-1/backlog-tecnico-slice1.md`, `docs/slice-2/slice-2-encounter-base-cierre.md` y este documento;
  - declarar explícitamente qué sigue siendo transicional y qué ya es productivo cuando ocurra.

## 6) Estado de validación local

- `npm run lint`: pasa.
- `npm run build`: requiere `FHIR_BASE_URL`; en entorno sin esa variable falla en prerender de rutas privadas.

## 7) Reorganización de layouts y navegación público/privada

- Documento técnico específico: `docs/reorganizacion-layouts-publico-privado.md`.
- Mantener este documento como fuente operativa global, y el documento específico como detalle de arquitectura implementada de shell/layouts.
