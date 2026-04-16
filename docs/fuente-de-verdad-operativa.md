# Fuente de verdad operativa del proyecto

> Última actualización: 2026-04-16 (UTC)

## 1) Resumen ejecutivo

El repositorio mantiene como superficie principal una **landing pública de captación local** para kinesiología a domicilio en Neuquén.

En paralelo, ahora existe una **superficie privada mínima transicional** para flujo clínico inicial bajo `/admin/patients`.

## 1.1) Dirección evolutiva del proyecto (decisión de encuadre)

- **Estado actual**:
  - la landing pública sigue activa y central en el repo;
  - existe una primera implementación de superficie privada clínica mínima.
- **Dirección aceptada**: evolucionar de forma incremental hacia una app clínica privada conviviente en el mismo repositorio.
- **Límite explícito del estado actual**: la superficie privada implementada hoy es **transicional (in-memory), no productiva**.
- **Foco funcional efectivamente implementado en Slice 1**:
  - alta mínima de paciente;
  - edición incremental;
  - inicio de tratamiento como acción separada;
  - validación de DNI para iniciar tratamiento;
  - bloqueo simple por duplicado de DNI al iniciar tratamiento;
  - lectura mínima de listado y detalle;
  - tests iniciales del slice.
- **Fuera de alcance vigente**:
  - FHIR real;
  - auth;
  - encounters / visitas;
  - historial longitudinal;
  - persistencia productiva;
  - agenda, pagos, self-booking, `/portal`, panel administrativo amplio.

### Aclaración de límites documentales

- No documentar capacidades futuras como si existieran hoy.
- No reinterpretar el repo como si ya fuera una app clínica madura.

## 2) Estado actual confirmado en código

### Rutas públicas
- `/` (home)
- `/services`
- `/evaluar`

### Rutas privadas mínimas (transicionales)
- `/admin/patients`
- `/admin/patients/new`
- `/admin/patients/[id]`

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
  - validación de DNI requerida para iniciar tratamiento;
  - bloqueo simple por duplicado de DNI para iniciar tratamiento;
  - cobertura inicial con tests de dominio e integración del slice.

## 3) Fuentes de verdad activas

| Dominio | Fuente primaria |
| --- | --- |
| Datos del negocio/contacto/base URL | `src/lib/config.ts` |
| Catálogo de servicios | `src/app/services/data/servicesData.ts` |
| Navegación global | `src/lib/navLinks.ts` |
| Hero (copy editorial) | `src/app/hero/heroContent.ts` |
| Home (copy editorial) | `src/app/home/homeContent.ts` |
| Home “Cómo funciona” | `src/app/home/howItWorksContent.ts` |
| Flujo `/evaluar` | `src/app/evaluar/evaluar-content.ts` |
| Tracking GA4 | `src/lib/analytics.ts` |
| Slice 1 privado (rutas/admin pacientes) | `src/app/admin/patients/**` |
| Reglas y validaciones slice clínico mínimo | `src/domain/patient/**`, `src/domain/episode-of-care/**` |

## 4) Observaciones técnicas relevantes

1. `/evaluar` está implementada y enlazada desde Home.
2. `sitemap.ts` actualmente publica solo `/` y `/services` (no incluye `/evaluar`).
3. Header/Footer comparten `NAV_LINKS`; `/evaluar` no figura en esa navegación global (acceso principal desde CTA de Home).
4. La superficie privada `/admin/patients/*` existe para uso transicional local y no debe presentarse como operación clínica productiva.

## 5) Mantenimiento recomendado

- Si cambia contacto, URL base o ubicación: editar `src/lib/config.ts` y revisar `layout.tsx`, `robots.ts`, `sitemap.ts`.
- Si cambia catálogo de servicios: editar `servicesData.ts` y revisar consumidores (`ServicesGrid`, footer, hero, JSON-LD).
- Si cambia copy editorial:
  - Hero: `heroContent.ts`
  - Home: `homeContent.ts` / `howItWorksContent.ts`
  - Evaluar: `evaluar-content.ts`
- Si evoluciona la superficie privada clínica:
  - mantener alineadas `docs/slice-1/slice-1.md`, `docs/slice-1/backlog-tecnico-slice1.md` y este documento;
  - declarar explícitamente qué sigue siendo transicional y qué ya es productivo cuando ocurra.

## 6) Estado de validación local

- `npm run lint`: pasa.
- `npm run build`: pasa.
