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
- `/admin/patients/[id]/encounters/new`
- `/admin/patients/[id]/treatment`

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
- Acceso rápido contextual desde el listado para `Registrar visita` en pacientes con tratamiento activo (navega a `/admin/patients/[id]/encounters/new`).
- Ficha consolidada de lectura del paciente en `/admin/patients/[id]` como hub de navegación, con acción rápida contextual `Registrar visita` cuando hay tratamiento activo.
- Edición administrativa no clínica del paciente en `/admin/patients/[id]/administrative` (identidad, contacto y datos operativos).
- Superficie clínica operativa del paciente en `/admin/patients/[id]/encounters` (header interno con CTA primario `Registrar visita` cuando hay tratamiento activo, metadata compacta de tratamiento y listado de visitas con corrección inline).
- Pantalla específica de registro de visita en `/admin/patients/[id]/encounters/new`.
- Gestión específica de tratamiento (`EpisodeOfCare`) en `/admin/patients/[id]/treatment` (inicio/finalización).
- La gestión de tratamiento ya no vive inline en `/admin/patients/[id]/encounters`.
- Gate operativo por DNI para iniciar tratamiento.
- Representación visual del badge de tratamiento centralizada en `src/app/admin/patients/treatment-badge.ts` y separada de la lógica de estado operativo de dominio.
- Registro y listado de visitas realizadas (`Encounter` base): alta en `/encounters/new` y listado operativo en `/encounters`.
- Contrato temporal vigente (Fase 1): `startedAt` obligatorio + `endedAt` opcional; compatibilidad legacy para encuentros históricos con instante único (`start === end`).
- `occurrenceDate` queda limitado a compatibilidad transicional de entrada para payloads legacy.
- Captura y visualización administrativa de `gender` y `birthDate` en pacientes (alta, edición y detalle).
- Persistencia/lectura FHIR real para `Patient`, `EpisodeOfCare` y `Encounter`.

### Estado del frente FHIR Patient

- **Fase 1 cerrada**: `gender` + `birthDate` soportados end-to-end (contrato, schemas, mappers, UI privada y tests).
- **Fase 2 cerrada**: `Identifier.type` + tests/fixtures de identidad.
- **Fase 3 cerrada**: `telecom`, `contact.relationship`, `name`, `address` (con `telecom`, `contact.relationship` y `name` ya resueltos incrementalmente, y deuda/trigger de `address` documentados en FHIR-018).

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
