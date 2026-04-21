# Kinesiología a Domicilio

Landing pública + superficie privada clínica mínima desarrollada con Next.js para un servicio de kinesiología y rehabilitación a domicilio en Neuquén, Argentina.

## Estado actual (abril 2026)

El proyecto está en etapa **híbrida transicional**:

- **sitio de captación público** activo;
- **app clínica privada mínima** en `/admin` con integración FHIR para flujo base de pacientes.

### Rutas públicas implementadas
- `/` (home)
- `/services` (servicios)
- `/evaluar` (flujo guiado para orientar si conviene consultar)

### Rutas privadas implementadas
- `/admin`
- `/admin/patients`
- `/admin/patients/new`
- `/admin/patients/[id]`
- `/admin/patients/[id]/administrative`
- `/admin/patients/[id]/encounters`

### Funcionalidad disponible

#### Público
- Header y footer globales.
- CTA de WhatsApp reutilizable en múltiples superficies.
- Link telefónico en footer.
- Sección de servicios con catálogo centralizado.
- Flujo interactivo en `/evaluar` con ramas de orientación y CTA contextual de WhatsApp.
- SEO técnico base (metadata, Open Graph/Twitter, JSON-LD, `robots.txt`, `sitemap.xml`).
- GA4 integrado de forma directa (sin GTM) con eventos custom.

#### Privado clínico mínimo
- `/admin` como puerta de entrada de la superficie privada.
- Listado y alta de pacientes.
- Ficha consolidada de lectura del paciente en `/admin/patients/[id]` como hub de navegación.
- Edición administrativa no clínica del paciente en `/admin/patients/[id]/administrative` (identidad, contacto y datos operativos).
- Superficie de gestión clínica del paciente en `/admin/patients/[id]/encounters`.
- Inicio y finalización de tratamiento (`EpisodeOfCare`) dentro de la superficie clínica.
- Gate operativo por DNI para iniciar tratamiento.
- Representación visual del badge de tratamiento centralizada en `src/app/admin/patients/treatment-badge.ts` y separada de la lógica de estado operativo de dominio.
- Registro y listado de visitas realizadas (`Encounter` base) dentro de la superficie clínica.
- Persistencia/lectura FHIR real para `Patient`, `EpisodeOfCare` y `Encounter`.

## Fuentes de verdad principales
- `src/lib/config.ts`: datos del negocio/contacto/base URL.
- `src/lib/servicesData.ts`: catálogo de servicios.
- `src/lib/navLinks.ts`: navegación global (header/footer).
- `src/app/hero/heroContent.ts`: copy del hero.
- `src/app/home/homeContent.ts` y `src/app/home/howItWorksContent.ts`: contenido editorial de Home.
- `src/app/(public)/evaluar/evaluar-content.ts`: contenido del flujo `/evaluar`.
- `src/app/admin/patients/**`: superficie privada clínica mínima.

## Stack real

- **Next.js 15** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS 4**
- **ESLint**
- **Vitest**

## Scripts disponibles

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`
- `npm run test`

## Desarrollo local

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Levantar entorno local:
   ```bash
   npm run dev
   ```
3. Abrir:
   - `http://localhost:3000`

Checks recomendados antes de merge:

```bash
npm run lint
npm run test
npm run build
```
