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
- Administración no clínica del paciente en `/admin/patients/[id]/administrative` con lectura + acciones, edición explícita de identidad/contacto/datos operativos y sección de solicitudes de atención (lectura, alta mínima y resolución administrativa: aceptar, cancelar, cerrar como No inició con motivo).
- Superficie clínica operativa del paciente en `/admin/patients/[id]/encounters` (header interno con CTA primario `Registrar visita` **solo** con tratamiento activo, navegación secundaria compacta a tratamiento, metadata compacta, estadísticas clínicas mínimas derivadas y diferenciación de estado entre sin inicio/finalizado).
- Pantalla específica de registro de visita en `/admin/patients/[id]/encounters/new`.
- Gestión específica de tratamiento (`EpisodeOfCare`) en `/admin/patients/[id]/treatment` (inicio/finalización, estado finalizado explícito y navegación secundaria a visitas).
- La gestión de tratamiento ya no vive inline en `/admin/patients/[id]/encounters`.
- El DNI es un dato administrativo opcional: se normaliza y persiste cuando existe, pero no bloquea el inicio de tratamiento.
- Representación visual del badge de tratamiento centralizada en `src/app/admin/patients/treatment-badge.ts` y separada de la lógica de estado operativo de dominio.
- Registro y listado de visitas realizadas (`Encounter` base): alta en `/encounters/new` y listado operativo en `/encounters`.
- En `/admin/patients/[id]/encounters` se muestran estadísticas clínicas mínimas derivadas (sin persistencia nueva) con scope de episodio efectivo (activo si existe; si no, último registrado): visitas del tratamiento, última visita, primera visita, frecuencia promedio, duración promedio y tiempo total registrado.
- Las métricas de duración en `/encounters` pueden ser parciales por datos legacy (ej. `start===end`) o encuentros sin cierre; la UI explicita cobertura como helper (`Duración calculada sobre X de Y visitas del tratamiento`).
- Estas estadísticas viven en `/encounters` y no en el hub `/admin/patients/[id]` en esta fase.
- Contrato operativo vigente en visitas: `startedAt` + `endedAt` obligatorios tanto al registrar (`/encounters/new`) como al editar en listado (`/encounters`), con validación temporal `endedAt >= startedAt`.
- `occurrenceDate` queda limitado a compatibilidad transicional de entrada para payloads legacy.
- Captura y visualización administrativa de `gender` y `birthDate` en pacientes (alta, edición y detalle).
- Persistencia/lectura FHIR real para `Patient`, `EpisodeOfCare` y `Encounter`.
- En `/admin/patients/[id]/administrative` las solicitudes de atención (`ServiceRequest`) se muestran en listado/empty state, pueden registrarse en forma mínima (fecha, motivo y datos básicos de quién consulta: relación + nombre) y resolverse administrativamente (aceptar, cancelar y cerrar como No inició con motivo).
- Resolver o registrar solicitudes de atención no inicia tratamiento, no habilita visitas por sí mismo y no cambia `PatientOperationalStatus`.
- En el flujo normal, una solicitud `in_review` se resuelve con `Aceptar e iniciar tratamiento` desde `/administrative`, marcando la solicitud como `accepted` y creando el `EpisodeOfCare` vinculado.
- Al iniciar tratamiento desde ese contexto, el `EpisodeOfCare` se crea vinculado a la solicitud mediante `referralRequest` (`ServiceRequest/{id}`), siempre que la solicitud accepted sea válida, pertenezca al paciente y no haya sido usada previamente; sin `serviceRequestId` no se permite iniciar tratamiento.
- Política vigente `single-use`: una solicitud `accepted` ya vinculada a algún `EpisodeOfCare` no puede reutilizarse para iniciar otro ciclo; se requiere nueva solicitud.
- Las métricas de `/admin` son derivadas de lectura (sin persistencia): resumen por estado operativo y métricas de edad para pacientes con `EpisodeOfCare` activo o finalizado basadas en `birthDate` válido.
- La edad es dato derivado de UI y no se persiste; el promedio se presenta redondeado.
- Métricas globales de visitas quedan fuera de Fase 1 por no existir aún una consulta agregada eficiente de `Encounter`.
- `/admin` en Fase 1 no incorpora gráficos ni rutas nuevas.

##### Cierre DASHBOARD-SR-001 (abril 2026)
- **Estado**: cerrado (PR1+PR2+PR3).
- **Resultado**: `/admin` muestra embudo SR (`in_review` y `accepted` pendiente sin vínculo `incoming-referral`) y mantiene resumen operativo + card simplificada de edad clínica.
- **Deuda técnica vigente**: métricas SR por composición per-patient (N+1 potencial). Migrar a read-model agregado cuando aumente volumen.

##### Cierre Fase 1 dashboard `/admin` (abril 2026)
- **Estado**: fase cerrada/aprobada para `/admin` como dashboard operativo mínimo.
- **Comportamiento vigente**:
  - card `Resumen operativo`;
  - card `Edad de pacientes`;
  - CTAs principales preservados: `Ver pacientes` y `Nuevo paciente`.
- **Métricas incluidas**:
  - resumen operativo: total, en tratamiento activo, tratamiento finalizado, sin tratamiento iniciado;
  - embudo de solicitudes: solicitudes en evaluación y aceptadas pendientes de tratamiento;
  - regla: `sin tratamiento iniciado = preliminary + ready_to_start`;
  - edad (pacientes con tratamiento activo o finalizado): paciente más joven, paciente más viejo y promedio.
- **Reglas de edad**:
  - dato derivado de lectura (no persistido), calculado desde `birthDate` sobre pacientes con `EpisodeOfCare` activo o finalizado;
  - fechas válidas/calculables participan del cálculo;
  - fechas ausentes o inválidas no participan;
  - cuando no hay edades calculables la UI muestra `—`.
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
  - micro-patch final de borde en render (`birthDate` válido + inválido + ausente, fallback cuando no hay edades calculables).

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
