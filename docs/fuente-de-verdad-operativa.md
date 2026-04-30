# Fuente de verdad operativa del proyecto

> Última actualización: 2026-04-28 (UTC)

## 1) Resumen ejecutivo

El repositorio mantiene como superficie principal una **landing pública de captación local** para kinesiología a domicilio en Neuquén.

En paralelo, existe una **superficie privada clínica mínima transicional** bajo `/admin`, con soporte para:

- gestión base de pacientes;
- ciclo básico de tratamiento (`EpisodeOfCare`);
- registro/listado simple de visitas realizadas (`Encounter` base).

Y con implementación de `ServiceRequest` en `/admin/patients/[id]/administrative` (lectura + alta mínima: fecha, motivo y datos básicos de quién consulta; más resolución administrativa: aceptar, no inició/cerrar y cancelar con motivo), preservando no-alcances clínicos.

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
- `/admin/patients/[id]/encounters/new`
- `/admin/patients/[id]/treatment`

#### Responsabilidad actual por ruta (superficie de pacientes)
- `/admin`: dashboard operativo mínimo de la superficie privada (resumen operativo + edad de pacientes), sin gráficos.
- `/admin/patients`: listado operativo de pacientes, con acceso rápido contextual para `Registrar visita` cuando el paciente tiene tratamiento activo (destino: `/admin/patients/[id]/encounters/new`).
- `/admin/patients/[id]`: hub del paciente (resumen + navegación a superficies administrativa y clínica), con acción rápida contextual `Registrar visita` solo si hay tratamiento activo.
- `/admin/patients/[id]/administrative`: administración no clínica con lectura + acciones (edición explícita de identidad, contacto y datos operativos) + sección de solicitudes de atención (listado/empty state y alta mínima).
- `/admin/patients/[id]/encounters`: superficie clínica operativa del paciente (header con acción primaria `Registrar visita` cuando hay tratamiento activo, metadata compacta de tratamiento y listado de visitas con corrección inline rápida).
- `/admin/patients/[id]/encounters/new`: pantalla específica para registrar una visita.
- `/admin/patients/[id]/treatment`: superficie específica de gestión de tratamiento (inicio/finalización de `EpisodeOfCare`).

#### Criterio vigente de presentación UI entre `encounters` y `treatment`
- En `/admin/patients/[id]/encounters` domina visualmente la operación de visitas (listado y corrección rápida).
- El registro de visita se realiza en `/admin/patients/[id]/encounters/new`.
- El acceso desde `/encounters` hacia `/treatment` es secundario y compacto (navegación de apoyo, no CTA principal).
- En `/admin/patients/[id]/treatment` domina la gestión de tratamiento (inicio o finalización según estado), y el motivo de cierre se presenta como contexto operativo compacto.
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
- analítica con GA4 directo (sin GTM) limitada a la shell pública (`src/app/(public)/layout.tsx`):
  - `generate_lead`
  - `phone_click`
  - `scroll_50`
  - `scroll_90`
- `/admin` excluido del tracking público (sin carga de script GA4).
- `/admin` marcado como noindex/nofollow (metadata + header `X-Robots-Tag`) y desautorizado en `robots.txt`.

#### Superficie privada clínica mínima
- listado de pacientes;
- acceso rápido contextual desde el listado a `Registrar visita` solo para pacientes con tratamiento activo (navega a `/admin/patients/[id]/encounters/new`);
- alta mínima de paciente (incluye dirección operativa opcional, `gender` y `birthDate` opcionales);
- ficha consolidada de paciente en `/admin/patients/[id]` como hub (incluye visualización de dirección, `gender`, `birthDate` y navegación a gestión clínica/administrativa);
- superficie administrativa acotada en `/admin/patients/[id]/administrative` con lectura + acciones (incluye edición explícita de dirección, `gender`, `birthDate` y datos no clínicos);
- en `/admin/patients/[id]/administrative`, las solicitudes de atención (`ServiceRequest`) se muestran en listado/empty state, pueden registrarse con formulario mínimo embebido (fecha, motivo y datos básicos de quién consulta: relación + nombre) y resolverse administrativamente (`Aceptar`, `No inició`, `Cancelar`);
- al cerrar como `No inició` o `Cancelar`, la UI administrativa exige motivo y lo muestra en listado cuando existe, con copy específico por estado y jerarquía visual compacta;
- el teléfono operativo y el domicilio de atención pertenecen a los datos administrativos del paciente (no al formulario normal de alta de solicitud);
- registrar solicitudes no inicia tratamiento por sí mismo; en el flujo normal, `Aceptar e iniciar tratamiento` crea el episodio vinculado y luego la navegación recomendada continúa en `/encounters`;
- el formulario de solicitud conserva campos propios mínimos (fecha, motivo y datos básicos de quién consulta) y puede mostrar/completar en contexto datos administrativos requeridos para iniciar tratamiento (domicilio y teléfonos);
- esos datos contextuales se persisten en `Patient` y no en `ServiceRequest`;
- la solicitud `accepted` sin tratamiento iniciado queda como compatibilidad/transición y no como camino principal;
- `/treatment` conserva ownership de inicio/cierre y valida contexto de solicitud antes de iniciar;
- al iniciar con solicitud válida, `EpisodeOfCare` se vincula por `referralRequest = ServiceRequest/{id}`;
- política vigente `single-use`: una SR `accepted` ya vinculada por `incoming-referral` no puede iniciar otro tratamiento y `/treatment` solicita nueva solicitud para nuevo ciclo;
- cambios de estado de solicitud revalidan superficies dependientes: listado (`/admin/patients`), hub (`/admin/patients/[id]`), administrativa y tratamiento;
- solicitudes inválidas/no aceptadas/no pertenecientes no originan inicio; sin `serviceRequestId` válido tampoco se permite iniciar tratamiento;
- visitas siguen dependiendo solo de `EpisodeOfCare` activo y `PatientOperationalStatus` no deriva de `ServiceRequest`.
- en `/admin/patients/[id]/administrative` la UI separa solicitud activa a resolver e histórico compacto de solicitudes previas (incluye resultado operativo y señal de inicio de tratamiento cuando corresponde);
- clasificación operacional SR unificada en UI privada:
  - `in_review` y `accepted` sin vínculo `incoming-referral` son pendientes operativas (esta última como compatibilidad transicional);
  - `accepted` con vínculo `incoming-referral` se muestra como `Aceptada — tratamiento iniciado` y no compite como pendiente;
  - `closed_without_treatment` y `cancelled` son terminales históricas (sin acciones de resolución ni peso operativo);
- en tratamiento activo, `Nueva solicitud` permanece disponible como acción administrativa secundaria y no como CTA clínico principal;
- en `/admin/patients/[id]/treatment` la UI conserva el estado principal actual y agrega historial compacto de ciclos cerrados (inicio/fin, motivo, detalle y solicitud de origen cuando existe);
- en `/admin/patients/[id]/treatment`, si no hay tratamiento activo pero existen ciclos finalizados, la pantalla prioriza el historial de ciclos cerrados y brinda acceso directo al historial de solicitudes en `/administrative#service-requests`;
- gestión de tratamiento en superficie específica (`/admin/patients/[id]/treatment`):
  - inicio de tratamiento;
  - cierre formal de tratamiento (finalización de `EpisodeOfCare` activo) con motivo obligatorio y detalle opcional;
  - los motivos de finalización se muestran como contexto operativo del ciclo (no historia clínica longitudinal rica).
- la gestión de tratamiento no vive inline en `/admin/patients/[id]/encounters`;
- el DNI es un dato administrativo opcional: se normaliza y persiste como identificador cuando está disponible, pero no bloquea el inicio de tratamiento;
- para iniciar tratamiento se requiere una solicitud de atención aceptada, perteneciente al paciente y no usada previamente;
- además, el paciente debe contar con datos mínimos operativos: nombre, apellido, domicilio de atención y al menos un teléfono de contacto operativo, ya sea del paciente o del contacto principal;
- bloqueo simple por duplicado de DNI para iniciar tratamiento;
- estado operativo consistente entre listado y detalle para episodio activo/finalizado/sin tratamiento;
- representación visual del badge de tratamiento centralizada en helper compartido (`src/app/admin/patients/treatment-badge.ts`), separada de la lógica de estado operativo de dominio;
- `finished_treatment` se representa con badge amarillo en la UI privada de pacientes;
- pantalla de gestión clínica operativa por paciente (`/admin/patients/[id]/encounters`);
- pantalla específica para registrar visita realizada (`/admin/patients/[id]/encounters/new`) con gate de tratamiento activo;
- listado de visitas del paciente ordenadas por fecha más reciente, con corrección inline acotada de fecha/hora de la visita, sin edición clínica completa del `Encounter`;
- en `/encounters`, la gestión de tratamiento se presenta como acceso secundario compacto (link/CTA secundario), incluyendo acceso rápido también durante tratamiento activo;
- en `/encounters`, se muestran estadísticas clínicas mínimas derivadas de visitas (sin persistir nuevos datos), en bloque compacto previo al listado;
- en `/encounters`, el bloque de contexto de tratamiento fue reducido visualmente para no competir con la operación de visitas;
- en `/encounters`, `Registrar visita` vive en el header interno, alineado a la derecha y visible solo con tratamiento activo;
- en `/encounters`, el loader diferencia tratamiento finalizado vs sin tratamiento iniciado usando `activeEpisode` + `mostRecentEpisode`;
- en `/encounters`, el contexto de tratamiento se presenta como metadata compacta (pill/línea informativa), no como card protagonista;
- en `/encounters`, sin tratamiento activo se muestra una única señal impeditiva dominante + salida a `/treatment`, evitando duplicación de bloqueos;
- en `/encounters`, el copy distingue explícitamente `sin tratamiento iniciado` de `tratamiento finalizado`;
- en `/treatment`, la cabecera/copy explicitan que es la superficie de inicio/cierre de tratamiento y no de operación de visitas, con navegación secundaria a visitas;
- en `/treatment`, cuando el tratamiento está finalizado se presenta estado explícito de cierre antes de cualquier reinicio;
- persistencia/lectura FHIR real para `Patient`, `EpisodeOfCare` y `Encounter`.
- en `/admin`, las métricas son derivadas de lectura (no persistidas):
  - resumen operativo por estado de paciente;
  - edad de pacientes con tratamiento activo o finalizado calculada solo sobre `birthDate` válido;
- en `/admin`, la edad se mantiene como dato derivado y no se persiste;
- en `/admin`, las métricas globales de visitas (`Encounter`) permanecen fuera de Fase 1 por falta de consulta agregada eficiente;
- en `/admin`, Fase 1 no introduce nuevas rutas ni gráficos.
- no existe actualmente captura ni render de notas generales del paciente (`Patient.note`) en la UI privada.
- en el frente FHIR de `Patient`, Fase 1 está cerrada para `gender` + `birthDate`, Fase 2 para `Identifier.type` + tests/fixtures de identidad y Fase 3 queda cerrada con `telecom`, `contact.relationship` y `name` resueltos incrementalmente, más deuda/trigger explícitos de `address` documentados en FHIR-018.


#### Plan de performance (deuda explícita) — DASHBOARD-SR-001
- Estrategia actual: métricas SR del dashboard por composición per-patient (`listServiceRequestsByPatientId` por paciente + `incoming-referral` por SR accepted).
- Riesgo: crecimiento N+1 y degradación perceptible de `/admin` con mayor volumen.
- Estrategia objetivo (futuro):
  - read-model agregado para dashboard SR;
  - consulta agregada por estado SR (`in_review`, `accepted`);
  - resolución de `acceptedPendingTreatment` sin consultar `incoming-referral` por cada SR (preagregado/materializado);
  - opcional índice/cache de lectura según patrón de carga.
- Umbral sugerido para migración: revisar implementación al superar ~50-100 pacientes activos o ante latencia perceptible en `/admin`.

#### Cierre documental — Fase 1 dashboard `/admin`

- **Estado de cierre**: Fase 1 cerrada/aprobada para `/admin`.
- **Observaciones no bloqueantes**: cobertura de render atendida parcialmente con micro-patch no funcional en `src/app/admin/__tests__/page.test.ts` (sin cambios de loader/read model/mapper/repository/arquitectura).
- **Comportamiento vigente de `/admin`**:
  - card `Resumen operativo`;
  - card `Edad de pacientes`;
  - CTAs principales `Ver pacientes` y `Nuevo paciente`.
- **Métricas incluidas en Fase 1**:
  - resumen operativo: pacientes totales, en tratamiento activo, tratamiento finalizado y sin tratamiento iniciado (`preliminary + ready_to_start`);
  - embudo de solicitudes: `in_review` (en evaluación) y `accepted` pendientes de tratamiento;
  - edad (pacientes con tratamiento activo o finalizado): paciente más joven, paciente más viejo y promedio.
- **Reglas vigentes de edad**:
  - edad derivada de lectura desde `birthDate` en población con `EpisodeOfCare` activo o finalizado, no persistida;
  - solo fechas válidas/calculables cuentan como `con fecha válida`;
  - `accepted` ya vinculada por `incoming-referral` no cuenta como pendiente de tratamiento;
  - ausentes o inválidas cuentan como `sin fecha válida`;
  - sin edades calculables: UI muestra `—`;
  
- **Arquitectura vigente**:
  - `src/app/admin/page.tsx` no calcula estadísticas inline;
  - `loadAdminDashboard()` centraliza composición de `/admin`;
  - `dashboard-metrics.ts` concentra funciones puras testeables;
  - `dashboard.read-model.ts` mantiene contrato específico de dashboard;
  - UI sin FHIR crudo y lógica route-local en `src/app/admin/*` (sin extracción prematura a dominio).
- **Validación de fase**:
  - tests unitarios de métricas;
  - tests del loader;
  - tests de render de `/admin`;
  - micro-patch de borde para mezcla de fechas válidas/inválidas/ausentes y fallback cuando no hay edades calculables.
- **Fuera de alcance preservado**:
  - métricas globales de visitas, visitas recientes, última visita global, pacientes activos sin visitas;
  - gráficos;
  - nuevas rutas;
  - nuevos métodos globales de `Encounter`;
  - persistencia de edad;
  - persistencia de métricas derivadas.
- **Deuda futura**:
  - evaluar mitigación del N+1 preexistente en `loadPatientsList()` (EpisodeOfCare);
  - decidir si `generatedAt` se muestra en UI o se elimina del contrato;
  - evaluar métricas globales de visitas solo con consulta agregada eficiente o método de repositorio adecuado;
  - extraer métricas a dominio solo si aparecen consumidores reales fuera de `/admin`.

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
- resolución clínica o inicio de tratamiento desde `ServiceRequest` (la implementación vigente es resolución **administrativa** en `/administrative`, sin iniciar tratamiento);
- `Observation` / `Procedure`;
- agenda;
- pagos;
- self-booking;
- `/portal`;
- panel administrativo amplio;
- multiusuario.

## 5) Observaciones técnicas relevantes

1. `sitemap.ts` publica rutas públicas indexables: `/`, `/services` y `/evaluar` (sin rutas `/admin`).
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
- `Patient.birthDate` se trata como fecha calendario administrativa (`YYYY-MM-DD`) en escritura; para lectura legacy de detalle se tolera `YYYY-MM-DDT...` solo para cálculo de edad en display.
- La edad del paciente es **dato derivado de UI** (calculada desde `birthDate`) y **no se persiste**.
- `EpisodeOfCare.startDate` / `endDate` se tratan como fechas calendario (`YYYY-MM-DD`) con validación de formato y calendario real.
- En defaults/envíos de `<input type="date">` se usa fecha local de calendario; **no usar `toISOString().slice(0,10)`** porque introduce riesgo UTC off-by-one.
- `Encounter.period.start` / `period.end` se manejan como FHIR `dateTime` con offset; valores `datetime-local` se normalizan antes de persistir.
- contrato operativo vigente de alta nueva (`/encounters/new`, Fase 2):
  - `startedAt` obligatorio;
  - `endedAt` obligatorio;
  - validación `endedAt >= startedAt`.
- contrato tolerante de lectura legacy:
  - se tolera `period.end` ausente en datos históricos/externos;
  - encuentros históricos con `start === end` se tratan como instante operativo histórico (inicio conocido, sin duración real explícita).
- bloque de métricas mínimas derivadas en `/encounters` (sin persistir nuevos datos) con **scope único de episodio efectivo**:
  - episodio efectivo = activo si existe; si no, último episodio registrado;
  - visitas del tratamiento (conteo de visitas asociadas al episodio efectivo);
  - última visita del tratamiento;
  - primera visita del episodio efectivo (días desde `EpisodeOfCare.startDate` hasta la primera visita válida del episodio);
  - frecuencia promedio entre visitas consecutivas válidas del episodio efectivo;
  - duración promedio y tiempo total **solo** sobre visitas válidas del episodio efectivo con duración explícita (`endedAt > startedAt`).
- transparencia de cobertura de duración en `/encounters`:
  - la parcialidad de duración se informa como helper (no tarjeta protagonista);
  - la cobertura `X de Y` usa `Y = visitas del tratamiento` (episodio efectivo), no el total histórico global;
  - cuando hay exclusiones, el helper resume causales (sin cierre, legacy o fechas no válidas).
- las métricas derivadas de ritmo y duración de `/encounters` se calculan en lectura y **no se persisten**.
- cualquier métrica histórica/global futura debe documentarse explícitamente como scope separado del episodio efectivo.
- `totalCount` global puede seguir existiendo en contrato de stats como dato auxiliar/compatibilidad, pero no integra el set protagonista del bloque de `/encounters`.
- `/encounters/new` registra una visita realizada, por eso requiere inicio y cierre en la carga operativa.
- `occurrenceDate` se mantiene únicamente como compatibilidad transicional de **entrada** (payload legacy), no como contrato operativo vigente de salida.
- edición temporal en `/encounters` corrige inicio y cierre en conjunto, con `startedAt`/`endedAt` obligatorios y validación `endedAt >= startedAt`.
- El listado de visitas ordena por timestamp real parseado (más recientes primero), no por comparación lexicográfica de strings.
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
  - en `/admin/patients` y `/admin/patients/[id]`, la dirección se renderiza siempre como texto legible y la salida externa vive en una acción secundaria separada (`Abrir en Maps`);
  - la acción `Abrir en Maps` se renderiza solo cuando existe `mapsHref` válido y usa `target="_blank"` + `rel="noreferrer"`;
  - en listado (`/admin/patients`) la acción mantiene jerarquía visual baja para no competir con nombre, badge y CTA principal del card.

- **Títulos de pestaña (metadata privada)**
  - las rutas privadas tienen títulos específicos;
  - en rutas dinámicas se usa nombre real del paciente cuando está disponible, con fallback estático razonable.

- **Encabezados internos de superficies de paciente**
  - patrón común: link de retorno, `h1`, subtítulo contextual y metadata compacta;
  - metadata compacta cuando aplica: DNI, edad (si `birthDate` permite cálculo) y badge de tratamiento.
  - este criterio aplica a detalle, administrativa, visitas y tratamiento;
  - no se modifica el header global de `src/app/admin/layout.tsx`.

- **Acción rápida en listado de pacientes (`/admin/patients`)**
  - el CTA `Registrar visita` es contextual y se muestra solo con `operationalStatus === "active_treatment"`;
  - el destino directo del CTA es `/admin/patients/[id]/encounters/new`;
  - el CTA mantiene jerarquía visual secundaria para no competir con el nombre del paciente ni con `Nuevo paciente`;
  - no reemplaza el gate real de registro, que sigue en `/encounters/new` y en la action server.

- **Acción rápida en hub de paciente (`/admin/patients/[id]`)**
  - el CTA `Registrar visita` se muestra solo cuando existe tratamiento activo;
  - el destino del CTA es `/admin/patients/[id]/encounters/new`;
  - mantiene jerarquía secundaria/operativa para convivir con `Gestión Clínica` y `Gestión Administrativa`.

- **Acción principal en visitas (`/admin/patients/[id]/encounters`)**
  - el CTA `Registrar visita` se muestra como acción principal y compacta cerca del encabezado operativo de la pantalla;
  - sin tratamiento activo no se muestra acceso directo a `/encounters/new`: si está **sin tratamiento iniciado** el mensaje impeditivo orienta a iniciar/gestionar tratamiento; si está en **tratamiento finalizado** el mensaje reconoce el cierre y deriva a `Gestionar tratamiento` sin sugerir inicio inmediato como acción principal;
  - la derivación desde visitas usa navegación secundaria compacta hacia `Gestionar tratamiento`, y en tratamiento se ofrece navegación secundaria compacta a `Ver visitas`;
  - el registro real sigue ocurriendo en `/encounters/new` y el gate final permanece en la server action.

- **Feedback de formularios privados**
  - éxito en verde;
  - error en rojo;
  - copy de resultado específico (evitar mensajes genéricos);
  - cuando cancelar implica retorno, el copy debe explicitarlo (ej.: `Cancelar y volver al paciente`).
