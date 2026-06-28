# Fuente de verdad operativa del proyecto

> Estado: vigente
> Última actualización: 2026-06-24 (UTC)
> Nota: la versión extensa anterior dejó de compartirse en el remoto; si existe localmente, queda en `docs-local/archive/cierres/fuente-de-verdad-operativa-extensa-2026-06-24.md`.

## Resumen ejecutivo

La superficie principal del repositorio sigue siendo una landing pública de captación local para kinesiología a domicilio en Neuquén.

En paralelo, el repo ya incluye una superficie privada clínica mínima y transicional bajo `/admin`. Esa superficie no pretende ser una historia clínica completa ni una plataforma multiusuario madura, pero sí resuelve un flujo operativo real:

- pacientes;
- solicitudes de atención;
- inicio y cierre de tratamiento;
- registro de visitas;
- métricas funcionales mínimas;
- resúmenes compartibles;
- configuración del profesional firmante.

## Rutas vigentes

### Públicas

- `/`
- `/services`
- `/evaluar`

### Privadas

- `/admin`
- `/admin/configuracion/profesional`
- `/admin/patients`
- `/admin/patients/new`
- `/admin/patients/[id]`
- `/admin/patients/[id]/administrative`
- `/admin/patients/[id]/encounters`
- `/admin/patients/[id]/encounters/new`
- `/admin/patients/[id]/treatment`

## Responsabilidad por superficie privada

- `/admin`
  Consola operativa breve, sin gráficos, orientada a prioridad de trabajo.
- `/admin/configuracion/profesional`
  Configuración single-user del profesional firmante basada en `Practitioner`.
- `/admin/patients`
  Listado operativo de pacientes con prioridad por estado y acceso rápido a registrar visita cuando hay tratamiento activo.
- `/admin/patients/[id]`
  Hub de lectura y navegación contextual del paciente.
- `/admin/patients/[id]/administrative`
  Gestión administrativa: identidad, contacto, datos operativos y solicitudes de atención.
- `/admin/patients/[id]/encounters`
  Gestión clínica de visitas del tratamiento, con nota clínica estructurada, métricas derivadas, tendencia funcional y resumen compartible.
- `/admin/patients/[id]/encounters/new`
  Registro puntual de una nueva visita.
- `/admin/patients/[id]/treatment`
  Inicio, estado, contexto general del tratamiento y cierre del tratamiento.
  Tambien concentra la preparacion del informe derivado de tratamiento/episodio en Fase 1.

## Naming visible vigente

- `/administrative` → `Gestión administrativa`
- `/encounters` → `Gestión clínica`
- `/treatment` → `Tratamiento`

CTAs estructurales vigentes:

- `Gestión administrativa`
- `Ir a gestión clínica`
- `Gestionar tratamiento`
- `Registrar visita`

## Flujo operativo vigente

1. Se registra o resuelve una solicitud de atención.
2. Si corresponde, se inicia tratamiento desde `/treatment`.
3. Solo con `EpisodeOfCare` activo se habilita `Registrar visita`.

Reglas clave:

- `ServiceRequest` no equivale a tratamiento.
- Registrar una solicitud no habilita visitas por sí mismo.
- Iniciar tratamiento requiere una solicitud `accepted`, válida y no usada previamente.
- Política vigente: `single-use` para solicitudes ya vinculadas a un `EpisodeOfCare`.

## Reglas clínicas y operativas principales

### Tratamiento

- La regla normal del producto es un único `EpisodeOfCare` activo por paciente.
- Si aparecen múltiples activos por inconsistencia de datos, las lecturas seleccionan el activo con `startDate` más reciente y el sistema no autocorrige FHIR.
- El DNI es un dato administrativo opcional: puede persistirse, pero no bloquea el inicio de tratamiento.

### Visitas

- `Encounter` es la unidad principal de la visita realizada.
- La nota clínica estructurada vive en `Encounter.extension[]`; no es el mismo artefacto que el resumen compartible.
- El resumen compartible de visita sigue siendo texto derivado y efímero: no se persisten informes, ni comunicaciones clínicas, ni artefactos formales con `Communication`, `DocumentReference` o `Composition`.
- Las métricas funcionales (`Observation`) son anexos opcionales de la visita.
- La creación de visita puede tener éxito parcial si fallan observaciones funcionales: no hay rollback compensatorio del `Encounter`.

### Contexto clínico longitudinal

- El contexto clínico del ciclo se edita en `/treatment`.
- `/encounters` lo consume en modo read-only.
- Diagnóstico médico de referencia y diagnóstico kinésico se persisten como `Condition`.
- Situación funcional inicial, objetivos terapéuticos y plan marco viven en `EpisodeOfCare.extension[]`.
- El informe de tratamiento/episodio en Fase 1 se prepara en `/treatment/report`, se deriva de datos ya registrados, se puede editar localmente antes de copiarlo y no se persiste en FHIR.

## Estado funcional vigente

### Landing pública

- SEO técnico base con metadata, Open Graph/Twitter, JSON-LD, `robots.txt` y `sitemap.xml`.
- WhatsApp CTAs con mensajes predefinidos.
- GA4 directo limitado a la shell pública.
- `/admin` queda fuera del tracking público.

### Superficie privada

- Dashboard operativo mínimo en `/admin`.
- Listado de pacientes con filtros por estado operativo y señales de solicitud solo como información secundaria por paciente.
- Hub de paciente con jerarquía clínica-operativa.
- Gestión administrativa con solicitudes de atención.
- Gestión clínica con listado de visitas, edición de nota, puntualidad operativa, tendencia funcional y resumen compartible.
- Gestión de tratamiento con inicio, cierre, historial compacto, contexto general del tratamiento e informe derivado de tratamiento/episodio no persistido.
- Configuración del profesional firmante single-user.

## FHIR y arquitectura

Recursos activos en el modelado actual:

- `Patient`
- `ServiceRequest`
- `EpisodeOfCare`
- `Encounter`
- `Observation`
- `Condition`
- `Practitioner`

Dirección arquitectónica vigente:

- lectura: `FHIR Server -> FHIR Client -> Repository -> Mapper -> Read model / loader -> UI`
- escritura: `UI Form -> Server Action -> Zod Schema -> Domain Rules -> Repository -> FHIR payload`

La UI no debería consumir FHIR crudo.

## Entorno y runtime

- `FHIR_BASE_URL` es obligatorio para la superficie privada.
- La app apunta a un único endpoint FHIR por ejecución; la selección se define por script o variable de entorno.
- `http://localhost:8081/fhir` corresponde al entorno dev/test y a datos descartables.
- `http://localhost:8080/fhir` corresponde al entorno local-real y a datos reales/locales.
- `npm run dev` y `npm run dev:fhir-dev` usan por defecto `http://localhost:8081/fhir`.
- `npm run dev:fhir-real` apunta a `http://localhost:8080/fhir`.
- `NEXT_PUBLIC_GA_ID` es opcional y solo afecta el tracking público.
- `/admin` está marcado como `noindex/nofollow` y además desautorizado en `robots.txt`.

## Fuentes activas relacionadas

- `README.md`
- `docs/README.md`
- `docs/product/solicitud-atencion-flujo-inicial.md`
- `docs/fhir/README.md`
- `docs/analytics-handoff.md`
- `docs/checklist-sincronizacion-doc-codigo.md`

## Fuera de alcance actual

Siguen fuera de alcance:

- IA productiva;
- `Procedure`;
- `Goal`;
- portal `/portal`;
- agenda o self-booking;
- pagos;
- auth compleja o multiusuario;
- dashboard clínico amplio;
- demo pública segura de `/admin` basada en mock mode.

## Cuándo actualizar este documento

Actualizar este archivo cuando cambie alguno de estos contratos:

- rutas vigentes;
- responsabilidades por superficie;
- recursos FHIR realmente usados;
- reglas de inicio/cierre de tratamiento;
- relación entre solicitudes, tratamiento y visitas;
- límites de tracking o indexación pública;
- variables de entorno necesarias para operar el repo.

Si el cambio es histórico o explica una auditoría cerrada, no debería seguir viviendo en la documentación activa del remoto.
