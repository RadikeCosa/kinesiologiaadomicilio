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
- `/admin` como dashboard operativo mínimo de la superficie privada (resumen operativo + edad de pacientes).
- Listado y alta de pacientes.
- Acceso rápido contextual desde el listado para `Registrar visita` en pacientes con tratamiento activo (navega a `/admin/patients/[id]/encounters/new`).
- Ficha consolidada de lectura del paciente en `/admin/patients/[id]` como hub de navegación, con acción rápida contextual `Registrar visita` cuando hay tratamiento activo.
- Edición administrativa no clínica del paciente en `/admin/patients/[id]/administrative` (identidad, contacto y datos operativos).
- Superficie clínica operativa del paciente en `/admin/patients/[id]/encounters` (header interno con CTA primario `Registrar visita` **solo** con tratamiento activo, navegación secundaria compacta a tratamiento, metadata compacta, estadísticas clínicas mínimas derivadas y diferenciación de estado entre sin inicio/finalizado).
- Pantalla específica de registro de visita en `/admin/patients/[id]/encounters/new`.
- Gestión específica de tratamiento (`EpisodeOfCare`) en `/admin/patients/[id]/treatment` (inicio/finalización, estado finalizado explícito y navegación secundaria a visitas).
- La gestión de tratamiento ya no vive inline en `/admin/patients/[id]/encounters`.
- Gate operativo por DNI para iniciar tratamiento.
- Representación visual del badge de tratamiento centralizada en `src/app/admin/patients/treatment-badge.ts` y separada de la lógica de estado operativo de dominio.
- Registro y listado de visitas realizadas (`Encounter` base): alta en `/encounters/new` y listado operativo en `/encounters`.
- En `/admin/patients/[id]/encounters` se muestran estadísticas clínicas mínimas derivadas (sin persistencia nueva) con scope de episodio efectivo (activo si existe; si no, último registrado): visitas del tratamiento, última visita, primera visita, frecuencia promedio, duración promedio y tiempo total registrado.
- Las métricas de duración en `/encounters` pueden ser parciales por datos legacy (ej. `start===end`) o encuentros sin cierre; la UI explicita cobertura como helper (`Duración calculada sobre X de Y visitas del tratamiento`).
- Estas estadísticas viven en `/encounters` y no en el hub `/admin/patients/[id]` en esta fase.
- Contrato operativo vigente en visitas: `startedAt` + `endedAt` obligatorios tanto al registrar (`/encounters/new`) como al editar en listado (`/encounters`), con validación temporal `endedAt >= startedAt`.
- `occurrenceDate` queda limitado a compatibilidad transicional de entrada para payloads legacy.
- Captura y visualización administrativa de `gender` y `birthDate` en pacientes (alta, edición y detalle).
- Persistencia/lectura FHIR real para `Patient`, `EpisodeOfCare` y `Encounter`.
- Las métricas de `/admin` son derivadas de lectura (sin persistencia): resumen por estado operativo y métricas de edad basadas en `birthDate` válido.
- La edad es dato derivado de UI y no se persiste; el promedio se presenta redondeado.
- Métricas globales de visitas quedan fuera de Fase 1 por no existir aún una consulta agregada eficiente de `Encounter`.
- `/admin` en Fase 1 no incorpora gráficos ni rutas nuevas.

##### Cierre Fase 1 dashboard `/admin` (abril 2026)
- **Estado**: fase cerrada/aprobada para `/admin` como dashboard operativo mínimo.
- **Comportamiento vigente**:
  - card `Resumen operativo`;
  - card `Edad de pacientes`;
  - CTAs principales preservados: `Ver pacientes` y `Nuevo paciente`.
- **Métricas incluidas**:
  - resumen operativo: total, en tratamiento activo, tratamiento finalizado, sin tratamiento iniciado;
  - regla: `sin tratamiento iniciado = preliminary + ready_to_start`;
  - edad: menor, mayor, promedio, con/sin fecha válida y cobertura.
- **Reglas de edad/cobertura**:
  - dato derivado de lectura (no persistido), calculado desde `birthDate`;
  - solo fechas válidas/calculables cuentan como `con fecha válida`;
  - fechas ausentes o inválidas cuentan como `sin fecha válida`;
  - cuando no hay edades calculables la UI muestra `—`;
  - cuando la cobertura no puede calcular porcentaje la UI muestra fallback `—` y evita un `0/0 (0%)` engañoso.
- **Arquitectura vigente**:
  - `src/app/admin/page.tsx` sin cálculos inline;
  - `loadAdminDashboard()` centraliza composición;
  - `dashboard-metrics.ts` concentra funciones puras testeables;
  - `dashboard.read-model.ts` define contrato específico de dashboard;
  - lógica route-local en `src/app/admin/*`, sin extracción prematura a `domain/patient`.
- **Validación de fase**:
  - tests unitarios de métricas;
  - tests del loader;
  - tests de render de `/admin`;
  - micro-patch final de borde en render (`birthDate` válido + inválido + ausente, cobertura visible `1/3 (33%)`, fallback con `percentage === null`).

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
