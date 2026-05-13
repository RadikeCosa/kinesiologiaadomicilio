# Fuente de verdad operativa del proyecto

> Última actualización: 2026-05-13 (UTC)

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
- `/admin/patients/[id]`: hub del paciente de **lectura y navegación contextual** (no una pantalla dominada por acciones), con acción rápida contextual `Registrar visita` solo si hay tratamiento activo.
- Convención UX/UI vigente del hub (`/admin/patients/[id]`): prioridad visual de lectura **identidad/estado → resumen clínico reciente → contacto operativo → próxima acción recomendada → acciones principales/navegación estructural**.
- En desktop, el hub usa dos columnas con **columna principal/ancha clínico-operativa** (`Resumen clínico reciente`, `Contacto operativo`, contexto compacto de cierre cuando aplica) y **columna lateral/angosta** (`Próxima acción recomendada` compacta + `Acciones principales`).
- En mobile, el orden de render respeta prioridad clínico-operativa antes de acciones: `Resumen clínico reciente` → `Contacto operativo` → `Próxima acción recomendada` → `Acciones principales`.
- `Resumen clínico reciente` en hub es síntesis orientativa de alta jerarquía (sin tendencia completa, sin listado de visitas, sin nota clínica narrativa) y no reemplaza `/encounters`.
- `Próxima acción recomendada` debe permanecer compacta (recomendación breve + apoyo corto) y no duplicar contenido clínico.
- `Acciones principales` cumplen rol de navegación secundaria/estructural.
- `/admin/patients/[id]/administrative`: administración no clínica con lectura + acciones (edición explícita de identidad, contacto y datos operativos) + sección de solicitudes de atención (listado/empty state y alta mínima).
- `/admin/patients/[id]/encounters`: superficie clínica operativa del paciente (header con acción primaria `Registrar visita` cuando hay tratamiento activo, metadata compacta de tratamiento y listado de visitas con corrección inline rápida).
- Convención UX en Gestión clínica (`/encounters`): evitar badges verdes duplicadas con semántica equivalente de tratamiento activo; mantener una única badge dominante para el estado principal (paciente/tratamiento) y degradar estados secundarios del bloque contextual a metadata textual.
- Feedback de éxito transitorio en Gestión clínica: confirmaciones por query param `status` reconocido (por ejemplo `encounter-created`, `treatment-started`) se muestran al volver, se ocultan automáticamente (~5s) y limpian `status` del URL para evitar reaparición al refrescar.
- Esta convención de autolimpieza aplica a feedback de éxito transitorio; mensajes de error relevantes en otros flujos no se autohocultan por defecto salvo decisión explícita de producto/UX.
- `/admin/patients/[id]/encounters/new`: pantalla específica para registrar una visita.
- `/admin/patients/[id]/treatment`: superficie específica de gestión de tratamiento (inicio/finalización de `EpisodeOfCare`).

#### Naming vigente de superficies privadas de paciente
- `/admin/patients/[id]/administrative` → **Gestión administrativa**
- `/admin/patients/[id]/encounters` → **Gestión clínica**
- `/admin/patients/[id]/treatment` → **Tratamiento**

#### Convención conceptual operativa vigente
- **Solicitud de atención**: pedido inicial para evaluar si corresponde iniciar atención.
- **Tratamiento**: ciclo de atención profesional del paciente, activo o finalizado.
- **Gestión clínica / visitas**: registro y consulta de visitas realizadas durante el tratamiento.
- **Flujo operativo**: primero se resuelve la solicitud, luego se inicia tratamiento, con tratamiento activo se registran visitas.

#### Convención vigente de CTAs
- `Ir a gestión clínica` para navegar a `/admin/patients/[id]/encounters`.
- `Registrar visita` solo para la acción puntual de carga de visita.
- `Gestionar tratamiento` para navegar a `/admin/patients/[id]/treatment`.
- `Gestión administrativa` para navegación a `/admin/patients/[id]/administrative`.

#### Nota de cierre documental — Iteración UX/UI + copy (2026-05-05)
- **Estado:** cerrada / aprobada.
- **Resumen de cambios aplicados:**
  - Patch 1: naming de superficies y CTAs;
  - Patch 2: jerarquía visual de solicitudes y convención de tonos;
  - Patch 3: helper texts y microcopy operativo unificado;
  - Patch 4: tests de regresión + documentación.
- **Validación ejecutada en la iteración:** lint + tests relevantes de superficies privadas de paciente (copy visible, estados y empty states).
- **Documentos actualizados:** `docs/fuente-de-verdad-operativa.md`, `README.md`.
- **Documentos revisados sin cambios:** `docs/checklist-sincronizacion-doc-codigo.md`.
- **Fuera de alcance preservado:** sin cambios de dominio, recursos FHIR, mapping, contratos, repositorios ni persistencia.

#### Nota de cierre documental — Fase 0 Encounter clínico estructurado (2026-05-07)
- **Estado:** cerrada / aprobada.
- **Checklist ejecutado:** `docs/checklist-sincronizacion-doc-codigo.md` (README, fuente operativa y auditoría FHIR alineadas con implementación vigente).
- **Documentos actualizados:** `docs/fuente-de-verdad-operativa.md`, `README.md`, `docs/fhir/auditoria-fase0-encounter-nota-clinica-2026-05-05.md`.
- **Documentos revisados sin cambios:** `docs/product/auditoria-preimplementacion-ai-clinica-2026-05-05.md`, `docs/checklist-sincronizacion-doc-codigo.md`.
- **Fuera de alcance preservado:** sin IA, sin `Condition`, sin `Observation`, sin `Procedure`, sin cambios en `ServiceRequest`/`EpisodeOfCare`, sin rediseño global de `/encounters`.
- **Hardening/regresión confirmado:** el patch posterior mantiene clinicalNote estructurada y corrige scoping/listado/métricas de `/encounters` al episodio efectivo; además ratifica que clinicalNote no altera duración ni pertenencia de visitas al episodio.
- **Hardening visual adicional (hub paciente `/admin/patients/[id]`):** se refuerza layout legible del hub (ancho cómodo, metadata compacta y bloque de acciones con wrap/grilla responsive) para evitar compresión extrema del resumen y del bloque `Siguiente paso sugerido`.

#### Nota de cierre documental — Fase 1 contexto clínico longitudinal (2026-05-07)
- **Estado:** cerrada / aprobada.
- **Alcance confirmado:**
  - edición principal del contexto longitudinal en `/admin/patients/[id]/treatment`;
  - resumen read-only en `/admin/patients/[id]/encounters` para el episodio efectivo;
  - diagnóstico médico de referencia + diagnóstico kinésico persistidos como `Condition`;
  - vínculo desde `EpisodeOfCare.diagnosis[]` con roles locales versionados (`medical_reference`, `kinesiologic_diagnosis`);
  - situación inicial funcional, objetivos terapéuticos y plan marco en `EpisodeOfCare.extension[]` (URLs versionadas).
- **Estrategia diagnóstica confirmada:**
  - editar diagnóstico crea nueva `Condition` y reemplaza referencia por kind en `EpisodeOfCare.diagnosis[]`;
  - limpiar diagnóstico remueve referencia del `EpisodeOfCare`;
  - no se borra físicamente la `Condition`;
  - se preservan roles diagnósticos desconocidos.
- **No-alcances preservados:** sin IA, sin `Observation`, sin `Procedure`, sin `Goal`, sin cambios de reglas de inicio/cierre de tratamiento y sin cambios de scoping de `/encounters`.
- **Checklist ejecutado:** `docs/checklist-sincronizacion-doc-codigo.md`.

#### Nota de hardening/cierre de bugfix — lectura de contexto longitudinal en `/treatment` (2026-05-12)
- **Estado:** corregido / cerrado.
- **Bug corregido:** en `/admin/patients/[id]/treatment` podía verse `No registrado` al volver/recargar pese a que los datos estaban persistidos; la pérdida era solo de **lectura/reconstrucción del read-model** (no de persistencia).
- **Causa raíz:** `mapEpisodeOfCareRead` descartaba `diagnosisReferences` y `clinicalContext`.
- **Fix aplicado:** `mapEpisodeOfCareRead` preserva `diagnosisReferences` + `clinicalContext`, evitando pérdida de:
  - diagnóstico médico de referencia;
  - impresión/diagnóstico kinésico;
  - `initialFunctionalStatus`;
  - `therapeuticGoals`;
  - `frameworkPlan`.
- **Responsabilidad de superficies (sin cambios):**
  - `/admin/patients/[id]/treatment` continúa como **superficie dueña de edición** del contexto clínico longitudinal del ciclo;
  - `/admin/patients/[id]/encounters` continúa consumiendo ese contexto en **modo read-only**, sin duplicar edición.
- **No-alcances preservados (explícitos):**
  - sin cambios de modelo FHIR;
  - sin cambios de persistencia;
  - sin cambios de actions;
  - sin cambios de `ServiceRequest`;
  - sin cambios de `Encounter`;
  - sin cambios de UX/copy.
- **Trazabilidad:** commit `fe22eca`, PR `Fix treatment clinical context read-model data loss`.
- **Validación ejecutada:** `npm run lint` + `npm test -- src/infrastructure/mappers/episode-of-care/__tests__/episode-of-care.mapper.test.ts src/app/admin/patients/[id]/treatment/__tests__/page.test.ts src/app/admin/patients/[id]/encounters/components/ClinicalCycleContextCard.test.ts`.


#### Nota de cierre documental — FHIR-HARDEN-002 repositorios/roundtrip liviano (2026-05-12)
- **Estado:** cerrado / aprobado.
- **Alcance confirmado:** hardening de preservación en capa repositorio con patrón `GET -> merge -> PUT` usando cliente FHIR mockeado (sin servidor FHIR real en este cierre).
- **Recursos cubiertos:** `Patient`, `ServiceRequest`, `EpisodeOfCare`, `Encounter`.
- **Hallazgo real:** en `Patient` se detectó pérdida de datos externos en update (`identifier` no-DNI, `telecom` no-phone, `name` externo).
- **Fix mínimo aplicado:** patch puntual en mapper write de `Patient` para preservar esos elementos externos durante merge controlado.
- **Garantía lograda:** superior a tests unitarios de mappers aislados y aún inferior a validación end-to-end contra servidor FHIR real/HAPI.
- **Pendientes explícitos:** prueba contra servidor FHIR real/local HAPI, mitigación N+1 de `Observation`, atomicidad/consistencia `Encounter -> Observation`.
- **No-alcances preservados:** sin cambios UI/copy/rutas, sin cambios de dominio/flujos, sin perfiles FHIR formales, sin migraciones, sin `Procedure`/`Goal`/IA.
- **Trazabilidad documental técnica:** `docs/fhir/fhir-harden-002-repository-roundtrip-preservacion.md`.





#### Nota de cierre documental — Patch P1 performance `/admin` batch de `ServiceRequest` por pacientes (2026-05-13)
- **Estado:** cerrado / validado contra HAPI real.
- **Cambio operativo confirmado:** el loader de `/admin` deja de hacer N+1 de `ServiceRequest` por paciente y consume una única lectura batch por `patientIds` (`listServiceRequestsByPatientIds(patientIds: string[])`).
- **Query batch validada en servidor real:** HAPI FHIR 8.8.0 (`fhirVersion` 4.0.1) respondió correctamente `ServiceRequest?subject=Patient/{id1},Patient/{id2},...` (HTTP 200).
- **Compatibilidad de encoding validada:** también se validó la forma encoded generada por `URLSearchParams` (`ServiceRequest?subject=Patient%2F{id1}%2CPatient%2F{id2}`) con respuesta correcta en HAPI.
- **Semántica del dashboard preservada:**
  - `in_review` se mantiene como pendiente operativa;
  - `accepted` sin vínculo `incoming-referral` se mantiene como `Pendiente de iniciar tratamiento`;
  - estados terminales (`closed_without_treatment`/`cancelled`) continúan fuera de pendientes.
- **Regla de vínculo preservada:** las solicitudes `accepted` con `incoming-referral` siguen excluidas de `accepted` pendiente cuando ya existe vínculo real con `EpisodeOfCare`.
- **Validación runtime registrada:** `/admin` respondió HTTP 200, renderizó correctamente y sostuvo conteos esperados (2 en evaluación, 1 aceptada pendiente), sin mezcla de solicitudes entre pacientes.
- **No-alcances preservados:** `incoming-referral` no se optimiza en este patch y queda como deuda separada; sin cambios de UI, modelo FHIR, persistencia, cache, read-model materializado ni reglas de clasificación de `ServiceRequest`.
#### Nota de cierre documental — Patch P1 performance `/admin/patients` batch de `EpisodeOfCare` por pacientes (2026-05-13)
- **Estado:** cerrado / validado contra HAPI real.
- **Cambio operativo confirmado:** el loader de `/admin/patients` deja de hacer N+1 de `EpisodeOfCare` por paciente y consume una única lectura batch por `patientIds` (`listEpisodesByPatientIds(patientIds: string[])`).
- **Query batch validada en servidor real:** HAPI FHIR 8.8.0 (`fhirVersion` 4.0.1) respondió correctamente `EpisodeOfCare?patient=Patient/{id1},Patient/{id2},...` (HTTP 200), incluyendo solo episodios del set solicitado y excluyendo pacientes fuera del set.
- **Resolución de estado en loader:** los episodios se agrupan en memoria por `patientId` y desde ese agrupamiento se resuelven `activeEpisode` y `latestEpisode` sin consultas adicionales por paciente.
- **Hardening preservado:** la selección de `latestEpisode` mantiene comparación temporal segura (fechas), no comparación lexicográfica de strings.
- **Aislamiento por paciente validado:** no se observó mezcla de episodios entre pacientes en runtime.
- **Semántica visible preservada en `/admin/patients`:**
  - episodio activo → `En tratamiento`;
  - sin activo pero con episodio finalizado/reciente → `Tratamiento finalizado`;
  - sin episodios → `Sin tratamiento activo`.
- **No-alcances preservados:** sin cambios en `ServiceRequest`, `incoming-referral`, UI, modelo FHIR, persistencia, cache ni read-model materializado; tampoco se aborda el N+1 restante de `/admin` por `ServiceRequest`.
- **Validación registrada:** `/metadata` (HTTP 200, `software.name=HAPI FHIR Server`), query batch de `EpisodeOfCare` y ejecución runtime de `/admin/patients` (HTTP 200) con estados observados consistentes.


#### Nota de cierre documental — Patch P1 performance `/admin` batch de `EpisodeOfCare` por `incoming-referral` (2026-05-13)
- **Estado:** cerrado / validado contra HAPI real.
- **Cambio operativo confirmado:** el loader de `/admin` deja de hacer N+1 de `EpisodeOfCare` por cada `ServiceRequest` `accepted` y consume una única lectura batch por `serviceRequestIds` (`listEpisodesByIncomingReferralIds(serviceRequestIds: string[])`).
- **Query batch validada en servidor real:** HAPI FHIR 8.8.0 (`fhirVersion` 4.0.1) respondió correctamente `EpisodeOfCare?incoming-referral=ServiceRequest/{id1},ServiceRequest/{id2},...` (HTTP 200).
- **Compatibilidad de encoding validada:** también se validó la forma encoded generada por `URLSearchParams` (`EpisodeOfCare?incoming-referral=ServiceRequest%2F{id1}%2CServiceRequest%2F{id2}`) con respuesta correcta en HAPI.
- **Resolución en memoria preservada:** el loader construye sets/mapas en memoria para decidir qué `accepted` siguen pendientes y cuáles quedan excluidas por vínculo real `incoming-referral`.
- **Semántica del dashboard preservada:**
  - `in_review` se mantiene como pendiente operativa;
  - `accepted` sin vínculo `incoming-referral` se mantiene como `Pendiente de iniciar tratamiento`;
  - `accepted` con `EpisodeOfCare` ya vinculado por `incoming-referral` queda excluida de pendientes;
  - estados terminales (`closed_without_treatment`/`cancelled`) continúan fuera de pendientes.
- **Métricas derivadas preservadas:** los conteos siguen calculándose en lectura (sin persistencia nueva).
- **Validación runtime registrada:** en dataset aislado (`test-batch-incoming-referral-admin`), `/admin` respondió HTTP 200 y sostuvo conteos esperados (totales 3; tratamiento 0; finalizado 2; sin iniciar 1; en evaluación 1; aceptadas pendientes 1).
- **No-alcances preservados:** sin cache, sin read-model materializado, sin cambios de UI, sin cambios de modelo FHIR, sin cambios de persistencia y sin rediseño de dashboard.

#### Nota de cierre documental — FHIR-CONSISTENCY-001A éxito parcial Encounter→Observation (2026-05-12)
- **Estado:** cerrado / aprobado.
- **Decisión V1 vigente:** sin atomicidad dura entre `Encounter` y `Observation` en creación de visita.
- **Regla operativa vigente:** `Encounter` es la unidad principal de la visita realizada; métricas funcionales (`Observation`) son anexos opcionales que pueden fallar parcialmente.
- **Semántica de resultado vigente en action:**
  1. `ok:false` = fallo total (no se creó `Encounter`);
  2. `ok:true`, `partial:false` = éxito total;
  3. `ok:true`, `partial:true` = éxito parcial (visita creada con métricas fallidas).
- **Comportamiento ante éxito parcial:** no se borra `Encounter`, no hay rollback compensatorio, se reportan `failedObservationCodes` y logging server-side mínimo (`patientId`, `encounterId`, códigos fallidos).
- **Pendientes explícitos:** reintento manual dirigido para métricas de `Encounter` existente; eventual integración/validación HAPI real; N+1 de `Observation` sigue fuera de este PR.
- **No-alcances preservados:** sin transacciones Bundle, sin colas/jobs, sin dashboard, sin cambios de recursos FHIR, sin cambios de rutas, sin rediseño UI y sin mezclar N+1/performance.
- **Trazabilidad documental técnica:** `docs/fhir/fhir-consistency-001a-encounter-observation-partial-success.md`.

#### Nota de cierre documental — FHIR-HARDEN-001 mappers (2026-05-12)
- **Estado:** cerrado / aprobado.
- **Alcance confirmado:** hardening de **tests unitarios de mappers FHIR** orientado a preservación y roundtrip parcial (sin cambios de runtime).
- **Recursos cubiertos:** `Patient`, `ServiceRequest`, `EpisodeOfCare`, `Encounter`.
- **Garantía entregada:** cobertura de preservación de campos externos/no propios en capa mapper (incluyendo `extension[]`, `note[]`, referencias no locales y arrays en updates, según recurso).
- **Límite explícito del cierre:** no constituye garantía end-to-end de repositorio/servidor (`create -> read -> update -> read`) ni validación integral PUT/GET para todos los payloads externos.
- **Pendientes explícitos posteriores:**
  1. cobertura equivalente a nivel repositorio PUT/GET;
  2. matriz de roundtrip integrada por recurso;
  3. consistencia/atomicidad `Encounter -> Observation`;
  4. mitigación de N+1 en consultas de `Observation`.
- **No-alcances preservados:** sin cambios funcionales, sin cambios UI/copy/rutas, sin cambios de dominio, sin perfiles FHIR formales, sin migraciones, sin `Procedure`/`Goal`/IA.
- **Trazabilidad documental técnica:** `docs/fhir/fhir-harden-001-mappers-roundtrip-preservacion.md`.




#### Nota de cierre documental — Semántica y jerarquía de contacto (2026-05-10)
- **Estado:** cerrada / aprobada.
- **Superficies auditadas:** `/admin/patients/[id]` (hub) y `/admin/patients/[id]/administrative` (Gestión administrativa).
- **Ajustes confirmados:**
  - en el hub se elimina duplicación de CTA cuando falta teléfono del paciente y existe teléfono de contacto principal: el subbloque paciente muestra faltante y la acción queda en el bloque de contacto principal;
  - en administrativa los faltantes de datos se muestran explícitamente (`No informado` / `No informada`) y no se ocultan campos administrativos relevantes;
  - en administrativa el bloque `Datos del paciente` no usa fallback silencioso a contacto principal;
  - en `Contacto principal`, CTAs con semántica por entidad (`entity="mainContact"`): `WhatsApp contacto principal` y `Llamar contacto`;
  - `PhoneContactActions` centraliza la semántica por entidad para alinear label visible + `title` + `aria-label`.
- **Convenciones operativas vigentes (contacto):**
  1. En bloques por entidad, las acciones pertenecen a esa entidad.
  2. El fallback paciente → contacto principal solo se permite en capa explícitamente operativa y sin duplicar CTAs cercanos.
  3. `/administrative` muestra faltantes administrativos de forma explícita; no oculta campos relevantes.
  4. El hub puede sintetizar contexto, pero no duplicar acciones ni mezclar sujetos.
- **No-alcances preservados:** sin cambios de dominio, sin cambios FHIR, sin cambios de schemas/actions/repositorios, sin cambios en normalización telefónica y sin cambios de flujos de solicitudes/tratamiento/visitas.


#### Nota de cierre documental — Jerarquía visual del hub de paciente (2026-05-10)
- **Estado:** cerrada / aprobada.
- **Superficie auditada:** `/admin/patients/[id]`.
- **Convención vigente asentada:** el hub es de lectura y navegación contextual; no debe quedar dominado por bloques de acción.
- **Jerarquía visual vigente:**
  1. identidad/estado;
  2. resumen clínico reciente;
  3. contacto operativo;
  4. próxima acción recomendada (compacta);
  5. acciones principales / navegación estructural.
- **Layout vigente:**
  - desktop: columna principal/ancha para síntesis clínico-operativa + columna lateral/angosta para orientación/navegación;
  - mobile: orden de lectura clínico-operativo antes de acciones.
- **Comportamiento preservado:** `Registrar visita` solo con tratamiento activo; accesos a `Gestión clínica`, `Gestión administrativa` y `Tratamiento` visibles como navegación estructural.
- **Cobertura de regresión route-local:** tests de `/admin/patients/[id]` validan orden visible y jerarquía esperada (`Resumen clínico reciente` → `Contacto operativo` → `Próxima acción recomendada` → `Acciones principales`), además de copy compacta y navegación esperada.
- **No-alcances preservados:** sin cambios de dominio, FHIR, schemas/actions/repositorios/loaders, persistencia, datos clínicos nuevos ni duplicación de superficies (`/encounters`, `/administrative`, `/treatment`).

#### Nota de cierre documental — Fase 2A PR3 métricas funcionales en visitas (2026-05-07)
- **Estado:** cerrada / aprobada.
- **Alcance confirmado:** flujo conectado UI → schema/action → persistencia FHIR `Observation` → loader de `/encounters` → card de visita.
- **Métricas soportadas actuales (opcionales por visita):** `TUG` (segundos), `Dolor` (`NRS` 0–10), `Bipedestación` (minutos).
- **Fase 2B PR1:** se agrega `Marcha` (minutos) como `Observation` funcional opcional por visita (`gait-duration-minutes`), asociada a `Patient` + `Encounter`.
- **Modelado/vínculos:** `Observation` asociada a `Patient` + `Encounter`; no existe vínculo directo `Observation` → `EpisodeOfCare` en FHIR R4.
- **Scoping por episodio:** en `/encounters` se deriva por visitas scoped al episodio efectivo y luego se adjuntan métricas por `encounterId`.
- **Render UI:** la card muestra bloque `Métricas funcionales` solo cuando existen datos; sin métricas no se renderiza bloque vacío.
- **Orden canónico en card:** cuando hay métricas, se muestran en orden fijo `TUG → Dolor → Bipedestación → Marcha`, independientemente del orden de entrada.
- **Copy de lectura puntual:** el bloque incluye helper “Valores registrados en esta visita. No representan tendencia.” para evitar interpretación automática.
- **No incluido en Fase 2B PR1:** sin distancia, pasos, asistencia, terreno ni dificultad estructurada; esos detalles permanecen en `clinicalNote` como contexto cualitativo.

- **Legacy sin cierre:** si una visita histórica llega sin `endedAt`, la card explicita `Cierre: Sin cierre registrado` y `Duración: No calculable` (no habilita alta nueva sin cierre).
- **Deudas explícitas:** (1) consistencia transaccional parcial si falla Observation luego de crear Encounter; (2) N+1 en loader por consulta de observations por `encounterId`.
- **No-alcances preservados:** sin dashboard/tendencias avanzadas, sin IA, sin `Procedure`, sin `Goal`, sin interpretación automática, sin predicción ni recomendación clínica automatizada.

#### Criterio vigente de presentación UI entre `encounters` y `treatment`
- En `/admin/patients/[id]/encounters` domina visualmente la operación de visitas (listado y corrección rápida).
- El registro de visita se realiza en `/admin/patients/[id]/encounters/new`.
- El acceso desde `/encounters` hacia `/treatment` es secundario y compacto (navegación de apoyo, no CTA principal).
- En `/admin/patients/[id]/treatment` domina la gestión de tratamiento (inicio o finalización según estado), y el motivo de cierre se presenta como contexto operativo compacto.
- El lenguaje visible al usuario prioriza términos operativos de producto (“tratamiento”, “visitas”).
- Los tecnicismos (`EpisodeOfCare`, `Encounter`) se reservan para soporte/aclaración cuando aportan contexto.
- En `/encounters` se permite contexto de tratamiento **compacto** (solo informativo), sin gestión inline.
- Fase 1 PR3: el contexto clínico longitudinal del ciclo se edita en `/admin/patients/[id]/treatment` y se resume en modo read-only en `/admin/patients/[id]/encounters`; diagnósticos en `Condition` vinculados por `EpisodeOfCare.diagnosis[]`, y baseline/objetivos/plan en `EpisodeOfCare.extension[]` (sin IA).
- Estrategia diagnóstica vigente en Fase 1: replace por kind (nueva `Condition` + reemplazo de referencia) y cleanup por remoción de referencia en `EpisodeOfCare` sin borrado físico de `Condition`.
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
- registrar solicitudes no inicia tratamiento por sí mismo; en el flujo normal, `Aceptar e iniciar tratamiento` crea el episodio vinculado y luego la navegación recomendada continúa en `/treatment` para revisar/completar marco clínico inicial;
- `Aceptar e iniciar tratamiento` requiere elegir explícitamente la **fecha de inicio del tratamiento** antes de confirmar;
- por defecto, esa fecha se precarga con `ServiceRequest.requestedAt` y queda editable para ajuste manual;
- al confirmar, `EpisodeOfCare.period.start` (dominio `startDate`) persiste la fecha elegida y no se fuerza automáticamente la fecha actual, salvo fallback defensivo cuando la solicitud no trae fecha válida;
- reglas vigentes de fecha para `EpisodeOfCare` (gate server-side de negocio en `startEpisodeOfCareAction` y `finishEpisodeOfCareAction`):
  - `EpisodeOfCare.startDate` no puede ser futura;
  - si el inicio usa una `ServiceRequest` `accepted` con `requestedAt` válido, `EpisodeOfCare.startDate` no puede ser anterior a esa fecha de solicitud;
  - `EpisodeOfCare.endDate` no puede ser futura;
  - `EpisodeOfCare.endDate` no puede ser anterior a `EpisodeOfCare.startDate`;
  - la UI puede orientar/validar en cliente, pero no reemplaza este gate server-side;
- en `/admin/patients/[id]/treatment`, la UI distingue explícitamente `Fecha de solicitud` (`ServiceRequest.requestedAt`) de `Inicio` (`EpisodeOfCare.startDate`) y usa cada dato según su semántica;
- en `/admin/patients/[id]/encounters`, el baseline de cálculo de primera visita y métricas del ciclo usa `EpisodeOfCare.startDate` cuando existe (no `ServiceRequest.requestedAt`);
- la estadística `Primera visita` en `/encounters` se calcula por **días calendario enteros** entre `EpisodeOfCare.startDate` y la fecha calendario de la primera `Encounter.startedAt` del episodio efectivo;
- ese cálculo no usa diferencia horaria/fraccional ni `Math.ceil` sobre milisegundos; ejemplo canónico: inicio `2026-01-12` + primera visita `2026-01-13T22:52:00` => **1 día**;
- las acciones cross-route usan feedback liviano por query param (`status`) para preservar confirmación en la pantalla destino;
- `Aceptar e iniciar tratamiento` navega a `/admin/patients/[id]/treatment?status=treatment-started`;
- `Registrar visita` navega a `/admin/patients/[id]/encounters?status=encounter-created`;
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
  - la clasificación visual prioriza el vínculo real `incoming-referral` con `EpisodeOfCare`;
  - si una solicitud tiene tratamiento vinculado, se muestra como `Aceptada — tratamiento activo` o `Aceptada — tratamiento finalizado` según el estado del episodio, aunque el status leído requiera normalización defensiva;
  - `in_review` y `accepted` sin vínculo `incoming-referral` son pendientes operativas (esta última como compatibilidad transicional);
  - `closed_without_treatment` y `cancelled` son terminales históricas (sin acciones de resolución ni peso operativo);
  - la UI separa explícitamente `Estado de solicitud` y `Estado clínico vinculado` en cada card;
  - `accepted` + tratamiento activo puede mostrarse en tono `emerald`;
  - `accepted` + tratamiento finalizado se muestra en tono `amber` (no como vigente);
  - `closed_without_treatment` y `cancelled` se muestran en tono `slate` como histórico/no accionable;
  - `entered_in_error` usa tono `red` por tratarse de error real;
  - los casos no accionables muestran `Sin acción pendiente.`;
- los motivos de cierre/cancelación se intentan persistir en `statusReason.text` y también en `ServiceRequest.note[]` con prefijo `resolution-reason:v1:` por compatibilidad con HAPI local; la lectura prioriza `statusReason.text`, luego `statusReason.coding[].display/text`, y por último `note[]` etiquetada, mostrándose en el historial operativo junto al motivo/detalle de cierre del ciclo cuando existe episodio finalizado vinculado.
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
- convención P0 UX/UI en Gestión clínica (UI-only):
  - en `/admin/patients/[id]/encounters/new`, `Puntualidad operativa` se presenta compacta en opciones inline con wrap responsive;
  - en `/admin/patients/[id]/encounters`, `Tendencia funcional` se muestra antes de `Estadísticas de visitas`;
  - en cards de visitas, la puntualidad se renderiza como chip discreto cuando existe (fuera de la línea principal de metadata temporal);
  - en `Estadísticas de visitas`, puede mostrarse KPI operativo compacto secundario: `Puntualidad: X/Y en horario o demora leve`;
- convención P1 visual en Gestión clínica (UI-only):
  - `Tendencia funcional` prioriza jerarquía interna `Último` (principal) + `Previo`/`Cambio` (secundarios), sin interpretación clínica automática;
  - si hay una sola medición en la métrica, se muestra `Sin comparación previa`;
  - el delta puede llevar énfasis visual neutro, sin umbrales clínicos ni semáforos diagnósticos;
- listado de visitas del paciente ordenadas por fecha más reciente, con corrección inline acotada de fecha/hora de la visita;
- registro clínico estructurado mínimo por `Encounter` (opcional) con campos: subjective, objective, intervention, assessment, tolerance, homeInstructions y nextPlan;
- la nota clínica de `Encounter` se persiste en `Encounter.extension[]` (URLs propias versionables) y `Encounter.note[]` se usa solo como fallback legacy/transicional de lectura;
- si los campos clínicos llegan vacíos, no se persisten extensiones clínicas vacías;
- la Fase 0 no introdujo IA ni cambios en `Condition`/`Procedure`; posteriormente Fase 2A agregó `Observation` funcional mínima por visita.
- en `/encounters`, la gestión de tratamiento se presenta como acceso secundario compacto (link/CTA secundario), incluyendo acceso rápido también durante tratamiento activo;
- en `/encounters`, se muestran estadísticas clínicas mínimas derivadas de visitas (sin persistir nuevos datos), en bloque compacto previo al listado;
- en `/encounters`, el bloque de contexto de tratamiento fue reducido visualmente para no competir con la operación de visitas;
- en `/encounters`, `Registrar visita` vive en el header interno, alineado a la derecha y visible solo con tratamiento activo;
- en `/encounters`, el loader diferencia tratamiento finalizado vs sin tratamiento iniciado usando `activeEpisode` + `mostRecentEpisode`;
- en `/encounters`, el contexto de tratamiento se presenta como metadata compacta (pill/línea informativa), no como card protagonista;
- en `/encounters`, sin tratamiento activo se muestra una única señal impeditiva dominante + salida a `/treatment`, evitando duplicación de bloqueos;
- en `/encounters`, el copy distingue explícitamente `sin tratamiento iniciado` de `tratamiento finalizado`;
- en `/treatment`, la cabecera/copy explicitan que es la superficie de inicio/cierre de tratamiento y no de operación de visitas, con navegación secundaria a visitas;
- en `/admin/patients/[id]/treatment`, el marco clínico del ciclo se gestiona **solo** en esta superficie con patrón **lectura primero + edición campo por campo** (5 mini-forms con submit independiente): diagnóstico médico de referencia, diagnóstico kinésico, situación funcional inicial, objetivo de tratamiento y plan marco del tratamiento;
- en `/admin/patients/[id]/treatment`, no existe submit global de guardado masivo del marco clínico;
- en `/admin/patients/[id]/treatment`, cada campo muestra valor actual o `No registrado`; si hay valor ofrece `Editar ...`, si falta valor ofrece `Agregar ...`, y solo se abre el input del campo activo;
- cada edición de campo del marco clínico lee el `EpisodeOfCare` vigente y preserva datos estructurales no relacionados (`period.start`, `period.end`, `status`, `referralRequest`, diagnósticos ajenos, extensiones ajenas y extensiones de cierre);
- en `/admin/patients/[id]/encounters`, el marco clínico se consume en modo read-only y sin edición inline;
- en `/admin/patients/[id]/encounters`, el marco clínico se muestra en card compacta read-only con los 5 campos, sin `Completitud` y sin detalle longitudinal duplicado; campos faltantes muestran `No registrado`;
- en `/admin/patients/[id]/encounters`, no hay bloqueo de `Registrar visita` por marco clínico incompleto;
- pendientes explícitos: posible test E2E posterior y no-alcances vigentes (sin Goal, sin Procedure, sin IA, sin dashboard clínico, sin cierre clínico enriquecido).
- en `/treatment`, cuando el tratamiento está finalizado se presenta estado explícito de cierre antes de cualquier reinicio;
- persistencia/lectura FHIR real para `Patient`, `EpisodeOfCare` y `Encounter`.
- en `EpisodeOfCare`, el motivo/detalle de cierre se persisten en `extension[]` (URLs propias versionables para reason/detail); `note[]` no es canal principal por pérdida en roundtrip HAPI y se mantiene solo como fallback legacy de lectura.
- en `/admin`, las métricas son derivadas de lectura (no persistidas):
  - resumen operativo por estado de paciente;
  - edad de pacientes con tratamiento activo o finalizado calculada solo sobre `birthDate` válido;
- en `/admin`, la edad se mantiene como dato derivado y no se persiste;
- en `/admin`, las métricas globales de visitas (`Encounter`) permanecen fuera de Fase 1 por falta de consulta agregada eficiente;
- en `/admin`, Fase 1 no introduce nuevas rutas ni gráficos.
- no existe actualmente captura ni render de notas generales del paciente (`Patient.note`) en la UI privada.
- puntualidad operativa de inicio de visita (`visitStartPunctuality`) disponible como metadata manual/transicional opcional de `Encounter`;
- `visitStartPunctuality` se persiste en `Encounter.extension[]` con URL versionada `encounter-operational-punctuality-status-v1` y `valueCode` cerrado (`on_time_or_minor_delay`, `delayed`, `severely_delayed`);
- la puntualidad operativa no es dato clínico, no vive en `clinicalNote`, no vive en `Observation` y no altera `startedAt`/`endedAt`;
- en `/admin/patients/[id]/encounters/new` la captura es opcional, ubicada en bloque compacto entre Inicio/Cierre y métricas funcionales;
- en `/admin/patients/[id]/encounters` se renderiza en la card solo cuando existe (`Puntualidad: ...`);
- en `Estadísticas de visitas`, el KPI de puntualidad usa denominador solo sobre visitas del episodio efectivo con `visitStartPunctuality` cargado y puede mostrar `Z sin dato` como detalle secundario;
- esta iteración no introduce `Appointment`, `scheduledStartAt`, `delayMinutes` calculado ni dashboard operativo.
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
  - Convención vigente en superficies privadas de paciente (`/admin/patients/[id]` y `/administrative`): el bloque compacto de identidad estable (nombre + badge de tratamiento + DNI/edad + detalle opcional) puede reutilizar `src/app/admin/patients/[id]/components/PatientIdentityHeaderCard.tsx` como componente **presentacional route-local**.
  - `PatientIdentityHeaderCard` **no** es header universal de superficie ni design system; no debe absorber link de retorno, `h1`/subtítulo, CTAs, navegación, solicitudes, sugerencia de siguiente paso ni lógica clínica/administrativa.
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
- `Procedure` (las `Observation` funcionales mínimas de visita ya están implementadas en Fase 2A);
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
- `npm run build`: sin errores de TypeScript detectados; en este entorno falla por configuración al faltar `FHIR_BASE_URL` durante prerender de `/admin`.

## Convenciones de datos administrativos (UI privada)

- Gender se muestra traducido en UI, manteniendo códigos FHIR internos.
- DNI se almacena como solo dígitos y se usa así para duplicados.
- Teléfono se normaliza antes de persistir y se reutiliza para links.
- Los teléfonos se muestran en UI privada mediante helper central de display, con formato argentino amigable cuando el patrón es reconocible (por ejemplo, `299 15 521-7189`, `0299 15 521-7189`, `+54 9 299 521-7189`).
- El texto visible del teléfono se mantiene separado de los links de llamada/WhatsApp, que siguen saliendo de helpers de enlaces.
- En formularios privados, el copy de carga de teléfono indica que se prefiere un número con WhatsApp para coordinar horarios y seguimiento, pero no es obligatorio y permite teléfonos fijos.
- Los nombres de paciente, contacto principal, `requesterDisplay` de solicitudes y direcciones se normalizan antes de persistir con capitalización administrativa consistente; no se aplica a textos clínicos/libres ni a códigos/enums.
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
- Hardening regresión Fase 0 (Encounter clínico estructurado): el listado protagonista de `/encounters` se scopea estrictamente al episodio efectivo y la nota clínica no altera ni el cálculo de duración (`startedAt`/`endedAt`) ni el scoping.

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

- **Convención de WhatsApp operativo (superficie privada de pacientes)**
  - la acción de WhatsApp asociada al paciente prioriza el teléfono del paciente;
  - si el paciente no tiene teléfono operativo, usa el teléfono del contacto principal;
  - el copy debe explicitar destino al contacto principal (`Enviar WhatsApp a contacto principal`);
  - si no existe ningún teléfono operativo, no se renderiza CTA de WhatsApp y se muestra fallback operativo de ausencia de canal.

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

### Actualización — Tendencia funcional simple en `/encounters` (2026-05-09)
- `/admin/patients/[id]/encounters` incorpora bloque compacto **Tendencia funcional** derivado en lectura desde `Observation` funcionales de visitas del **episodio efectivo**.
- La tendencia es simple por métrica (TUG, Dolor, Bipedestación, Marcha): `último`, `previo` (si existe) y `delta` (`latest - previous`).
- El bloque muestra solo métricas con datos y no se renderiza si no hay métricas.
- Las métricas derivadas de tendencia **no se persisten**.
- Se mantiene separación UX: valores puntuales en cards de visita vs tendencia global en bloque dedicado.
- Sin dashboard, sin gráficos y sin interpretación automática clínica.

#### Nota de cierre documental — Batch Observations en `/encounters` (2026-05-12)
- **Estado:** cerrado con validación en HAPI local real.
- **Alcance confirmado:** el loader de `/admin/patients/[id]/encounters` dejó de consultar `Observation` funcional por visita (N+1) y ahora consume un método batch único por `encounterIds` del episodio efectivo.
- **Query batch implementada:** `Observation?encounter=Encounter/{id1},Encounter/{id2},...`.
- **Validación HAPI real (2026-05-12):** `GET /metadata` OK (`HTTP 200`) en `http://localhost:8080/fhir`; `software.name=HAPI FHIR Server`, `software.version=8.8.0`, `fhirVersion=4.0.1`; la query `Observation?encounter=Encounter/1004,Encounter/1005` devolvió observaciones de ambos encounters.
- **Scoping preservado:** episodio efectivo (activo o, en su ausencia, último registrado); además se filtra defensivamente por `patientId` y por `encounterId` dentro del set efectivo.
- **Filtro defensivo validado:** no se mezclaron observaciones de otro paciente (`1015`) ni de encounters fuera del episodio efectivo (`1012`).
- **Derivados preservados:** cards por visita y tendencia funcional siguen derivándose de `Observation`; no se persisten métricas derivadas.
- **Compatibilidad HAPI/fallback:** en este entorno HAPI 8.8.0 la query batch con OR por coma funcionó en runtime; el fallback queda activo como compatibilidad para servidores FHIR que no soporten ese formato en `encounter`.
- **No-alcances preservados:** sin cambios de UI/captura, sin cambios de schemas/actions, sin cambios de modelo clínico/FHIR de dominio, sin dashboard/gráficos/IA, sin `Procedure`/`Goal`.

#### Nota de cierre documental — P2 resumen clínico reciente en hub (2026-05-09)
- **Estado:** cerrada / aprobada.
- **Alcance confirmado:** `/admin/patients/[id]` incorpora `Resumen clínico reciente` como síntesis orientativa con estado de tratamiento, última visita, visitas del episodio, hasta 2 métricas recientes y CTA a Gestión clínica.
- **Límites confirmados:** no reemplaza `/admin/patients/[id]/encounters`; sin tendencia completa, sin notas clínicas, sin listado de visitas y sin estadísticas extensas en el hub.
- **No-alcances preservados:** sin dashboard clínico, sin IA, sin `Procedure`, sin `Goal`, sin interpretación automática.


### Tratamiento (`/admin/patients/[id]/treatment`)
- Es la superficie de **marco clínico del ciclo** (no una pantalla de cierre).
- El **contexto clínico longitudinal** es protagonista en la jerarquía visual.
- El **cierre de ciclo** es una acción secundaria y colapsada por defecto.
- Si el ciclo está finalizado, se muestra un **resumen read-only** antes del historial completo.

- `/admin/patients/[id]/encounters` muestra una card compacta **read-only** de contexto clínico del ciclo para interpretar tendencia/visitas; la edición permanece en `/treatment`.
- La card read-only de `/encounters` muestra 5 campos del marco clínico del ciclo: diagnóstico médico de referencia, diagnóstico kinésico, situación funcional inicial, objetivo de tratamiento y plan marco del tratamiento.
- La completitud del marco clínico en `/encounters` se calcula sobre esos 5 campos (**5/5**).
- Empty state/CTA en `/encounters`: orienta a completar el marco clínico en `/treatment` cuando faltan datos.
- Fase 2A cerrada: en `/treatment` la edición del marco clínico es campo por campo (5 submits independientes) y ya no existe guardado masivo global.
- Fase 2B cerrada: naming interno de diagnóstico kinésico normalizado a `kinesiologic_diagnosis`.
- No-alcances vigentes: sin Goal, sin Procedure, sin IA, sin dashboard clínico, sin cierre clínico enriquecido y sin edición inline en `/encounters`.

- Regla P1 de navegación privada: cada superficie mantiene **un CTA primario** de su tarea principal; enlaces cruzados (`/administrative`, `/treatment`, `/encounters`) se presentan como secundarios/contextuales.
