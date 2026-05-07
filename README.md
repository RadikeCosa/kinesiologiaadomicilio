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
- Administración no clínica del paciente en `/admin/patients/[id]/administrative` con lectura + acciones, edición explícita de identidad/contacto/datos operativos y sección de solicitudes de atención (lectura, alta mínima y resolución administrativa: aceptar, cancelar, cerrar como No inició con motivo). Los motivos operativos se muestran como metadata compacta contextual (no como bloque protagonista clínico).
- Superficie clínica operativa del paciente en `/admin/patients/[id]/encounters` (header interno con CTA primario `Registrar visita` **solo** con tratamiento activo, navegación secundaria compacta a tratamiento, metadata compacta, estadísticas clínicas mínimas derivadas y diferenciación de estado entre sin inicio/finalizado).
- Pantalla específica de registro de visita en `/admin/patients/[id]/encounters/new`.
- Gestión específica de tratamiento (`EpisodeOfCare`) en `/admin/patients/[id]/treatment` (inicio/finalización con motivo de cierre y detalle opcional, estado finalizado explícito y navegación secundaria a visitas).
- En `EpisodeOfCare`, motivo y detalle de cierre se persisten en `extension[]` (URLs versionables con `valueCode`/`valueString`); `note[]` queda solo como fallback legacy de lectura por compatibilidad.
- La gestión de tratamiento ya no vive inline en `/admin/patients/[id]/encounters`.
- El DNI es un dato administrativo opcional: se normaliza y persiste cuando existe, pero no bloquea el inicio de tratamiento.
- Representación visual del badge de tratamiento centralizada en `src/app/admin/patients/treatment-badge.ts` y separada de la lógica de estado operativo de dominio.
- Registro y listado de visitas realizadas (`Encounter` base): alta en `/encounters/new` y listado operativo en `/encounters`.
- En Fase 0 clínica, cada `Encounter` puede incluir una nota clínica estructurada mínima opcional (`subjective`, `objective`, `intervention`, `assessment`, `tolerance`, `homeInstructions`, `nextPlan`).
- En `/admin/patients/[id]/encounters` se muestran estadísticas clínicas mínimas derivadas (sin persistencia nueva) con scope de episodio efectivo (activo si existe; si no, último registrado): visitas del tratamiento, última visita, primera visita, frecuencia promedio, duración promedio y tiempo total registrado.
- Las métricas de duración en `/encounters` pueden ser parciales por datos legacy (ej. `start===end`) o encuentros sin cierre; la UI explicita cobertura como helper (`Duración calculada sobre X de Y visitas del tratamiento`).
- Estas estadísticas viven en `/encounters` y no en el hub `/admin/patients/[id]` en esta fase.
- Contrato operativo vigente en visitas: `startedAt` + `endedAt` obligatorios tanto al registrar (`/encounters/new`) como al editar en listado (`/encounters`), con validación temporal `endedAt >= startedAt`.
- `occurrenceDate` queda limitado a compatibilidad transicional de entrada para payloads legacy.
- Captura y visualización administrativa de `gender` y `birthDate` en pacientes (alta, edición y detalle).
- Persistencia/lectura FHIR real para `Patient`, `EpisodeOfCare` y `Encounter`.
- En `/admin/patients/[id]/administrative` las solicitudes de atención (`ServiceRequest`) se muestran en listado/empty state, pueden registrarse en forma mínima (fecha, motivo y datos básicos de quién consulta: relación + nombre) y resolverse administrativamente (aceptar, cancelar y cerrar como No inició con motivo). Los motivos operativos se muestran como metadata compacta contextual (no como bloque protagonista clínico).
- Registrar solicitudes de atención no inicia tratamiento, no habilita visitas por sí mismo y no cambia `PatientOperationalStatus`.
- La resolución general de solicitudes puede cerrarlas o cancelarlas sin iniciar tratamiento.
- La acción específica `Aceptar e iniciar tratamiento` desde `/administrative` sí marca la solicitud como `accepted` y crea el `EpisodeOfCare` vinculado.
- Las acciones que cambian de contexto hacia `/encounters` usan feedback liviano por query param (`status`) para mantener confirmación en la pantalla destino.
- `Aceptar e iniciar tratamiento` navega a `/admin/patients/[id]/encounters?status=treatment-started`.
- `Registrar visita` navega a `/admin/patients/[id]/encounters?status=encounter-created`.
- Los cambios de estado de solicitud revalidan `/admin/patients`, `/admin/patients/[id]`, `/admin/patients/[id]/administrative` y `/admin/patients/[id]/treatment` para evitar vistas stale.
- El formulario de solicitud mantiene sus campos propios mínimos (fecha, motivo y datos básicos de quién consulta) y puede completar en contexto domicilio/teléfonos administrativos cuando faltan.
- Esos datos contextuales se guardan en `Patient` (no en `ServiceRequest`) para anticipar faltantes antes de `Aceptar e iniciar tratamiento`.
- Al iniciar tratamiento desde ese contexto, el `EpisodeOfCare` se crea vinculado a la solicitud mediante `referralRequest` (`ServiceRequest/{id}`), siempre que la solicitud accepted sea válida, pertenezca al paciente y no haya sido usada previamente; sin `serviceRequestId` no se permite iniciar tratamiento.
- Política vigente `single-use`: una solicitud `accepted` ya vinculada a algún `EpisodeOfCare` no puede reutilizarse para iniciar otro ciclo; se requiere nueva solicitud.
- `/admin/patients/[id]/administrative` separa solicitud activa a resolver (si existe) e histórico compacto de solicitudes con resultado operativo y vínculo a tratamiento cuando aplica.
- Regla operacional única de solicitudes:
  - si existe vínculo real `incoming-referral` con `EpisodeOfCare`, la solicitud se clasifica como `Aceptada — tratamiento activo` o `Aceptada — tratamiento finalizado` según el estado del episodio (histórica, sin acciones de resolución), incluso con normalización defensiva del status leído;
  - `in_review` sin vínculo => pendiente operativa;
  - `accepted` sin vínculo => `Pendiente de iniciar tratamiento` (compatibilidad transicional);
  - `closed_without_treatment`/`cancelled` => históricas terminales, no compiten como pendientes.
- Los motivos de `No inició`/`Cancelar` se intentan persistir en `statusReason.text` y, por compatibilidad con HAPI local, también se guardan en `ServiceRequest.note[]` como `resolution-reason:v1:<texto>`; la lectura prioriza `statusReason` (incluyendo fallback de `coding[].display/text`) y usa `note[]` como fallback final, y se muestran en el historial operativo junto al detalle de cierre del tratamiento cuando aplica.
- Durante tratamiento activo, crear una nueva solicitud se mantiene como acción administrativa secundaria (no CTA clínico principal del hub).
- `/admin/patients/[id]/treatment` mantiene el estado principal actual y agrega historial compacto de ciclos cerrados (inicio/fin, motivo, detalle y solicitud de origen si existe).
- `/admin/patients/[id]/treatment` funciona como superficie de gestión del tratamiento actual y también de historial compacto de ciclos cerrados; sin tratamiento activo pero con ciclos finalizados, prioriza el historial y ofrece acceso directo al historial de solicitudes en `/administrative#service-requests`.
- Las métricas de `/admin` son derivadas de lectura (sin persistencia): resumen por estado operativo y métricas de edad para pacientes con `EpisodeOfCare` activo o finalizado basadas en `birthDate` válido.
- La edad es dato derivado de UI y no se persiste; el promedio se presenta redondeado.
- Métricas globales de visitas quedan fuera de Fase 1 por no existir aún una consulta agregada eficiente de `Encounter`.
- `/admin` en Fase 1 no incorpora gráficos ni rutas nuevas.
- En Fase 1, el contexto clínico longitudinal del tratamiento se edita en `/admin/patients/[id]/treatment` y se resume en modo read-only en `/admin/patients/[id]/encounters` (diagnósticos en `Condition` vinculados desde `EpisodeOfCare.diagnosis[]`).
- En Fase 2A ya se incorporó modelado mínimo de `Observation` funcional por visita (TUG, dolor 0–10, bipedestación) con captura opcional; continúan fuera de alcance `Procedure`, `Goal`, IA y tendencia avanzada/dashboard clínico.

#### Mapa corto de superficies privadas de paciente (UI vigente)
- **Gestión administrativa** (`/admin/patients/[id]/administrative`): datos del paciente y solicitudes de atención.
- **Gestión clínica** (`/admin/patients/[id]/encounters`): registro y consulta de visitas del tratamiento.
- **Tratamiento** (`/admin/patients/[id]/treatment`): inicio, estado y cierre del ciclo de atención.
- Flujo operativo esperado: primero se resuelve la solicitud, luego se inicia tratamiento, y con tratamiento activo se registra la visita.

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
  - embudo de solicitudes: solicitudes en evaluación y aceptadas pendientes de tratamiento (solo si no están vinculadas por incoming-referral);
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
