# Auditoría de congruencia post entornos FHIR

## 1. Resumen ejecutivo

- Estado general: parcialmente congruente.
- Qué mejoró respecto de la auditoría anterior:
  - ya existe helper server-side de clasificación del entorno FHIR;
  - `/admin` ahora muestra un badge visible con entorno y endpoint;
  - `package.json` ya expone scripts explícitos para `8081` y `8080`, también para build;
  - `.env.example` quedó con default seguro en `8081`;
  - la documentación activa ya refleja que Next apunta a un solo FHIR por ejecución y que `/admin` no es demo pública;
  - hay cobertura de tests para helper y layout/badge.
- Riesgo principal restante:
  - sigue habiendo drift entre algunas piezas de documentación y el estado real post-patch, sobre todo en `README.md` y en auditorías recientes que ya quedaron desactualizadas por el propio patch.
- Recomendación principal:
  - hacer un Patch 2 documental corto, concentrado en alinear `README.md`, etiquetar o archivar auditorías pre-patch ya superadas, y dejar una guía única para validación/build segura con FHIR dev/test.

## 2. Fuentes revisadas

| Archivo o área | Rol esperado | Estado | Observaciones |
|---|---|---|---|
| `README.md` | resumen portfolio-facing y framing general | Correcto con observaciones | El framing general está bien; persisten drift menores/importantes en recursos FHIR listados, checks documentados y conteo de tests. |
| `AGENTS.md` | guía operativa para agentes | Correcto | Quedó bien alineado con código y docs activas sobre FHIR, `/admin`, no demo pública y validación. |
| `docs/README.md` | mapa de documentación activa | Correcto | Ordena bien la jerarquía activa. |
| `docs/fuente-de-verdad-operativa.md` | contrato operativo vigente | Correcto | Es la pieza más alineada con rutas, reglas y límites reales. |
| `docs/fhir/README.md` | índice/contrato FHIR activo | Correcto | Refleja entornos, recursos y límites actuales. |
| `docs/product/README.md` | índice de producto activo | Correcto | Coherente con el alcance actual. |
| `docs/product/solicitud-atencion-flujo-inicial.md` | contrato de `ServiceRequest` | Correcto | Coincide con regla de solicitud aceptada + válida + single-use. |
| `docs/analytics-handoff.md` | contrato de tracking público | Correcto | GA4 solo en shell pública; `/admin` queda fuera. |
| `docs/normalization-data/README.md` | contrato de normalización administrativa | Correcto | Sin drift relevante para este patch. |
| `docs/checklist-sincronizacion-doc-codigo.md` | checklist de control previo a merge | Correcto con observaciones | Sigue siendo útil, pero no menciona explícitamente auditorías recientes que deban archivarse o marcarse como supersedidas. |
| `docs/archive/README.md` | mapa del material histórico | Correcto | La convención de archivo está clara. |
| `docs/archive/audits/auditoria-congruencia-docs-agents-estado-actual-2026-06-25.md` | auditoría previa de congruencia | Correcto con observaciones | Sigue siendo útil como línea base histórica, pero ya no es la foto final post-patch. |
| `docs/archive/audits/auditoria-manejo-entornos-fhir-next-2026-06-25.md` | auditoría previa de entornos FHIR | Requiere ajuste | Quedó archivada porque contiene hallazgos que el patch ya resolvió y no debe consumirse como estado vigente. |
| `package.json` | verdad de scripts y checks | Correcto | Tiene scripts explícitos para `dev`/`build` en `8081` y `8080`. |
| `.env.example` | ejemplo seguro de runtime local | Correcto | Default seguro en `8081`; no induce a operar con `8080` por accidente. |
| `src/lib/fhir/config.ts` | helper de clasificación y lectura segura de `FHIR_BASE_URL` | Correcto | Server-only, clasifica `8081`, `8080`, custom y missing. |
| `src/lib/fhir/__tests__/config.test.ts` | cobertura del helper FHIR | Correcto | Cubre `missing`, `dev`, `local_real` y `custom`. |
| `src/app/admin/layout.tsx` | badge visible y noindex de `/admin` | Correcto | Muestra entorno activo y bloquea indexación. |
| `src/app/admin/layout.test.ts` | cobertura del badge/layout | Correcto | Verifica navegación y badge `FHIR dev/test`. |
| `src/lib/fhir/client.ts` | lectura efectiva de `FHIR_BASE_URL` | Correcto | Consume `getFhirBaseUrl()` server-side; no usa `NEXT_PUBLIC_*`. |
| `src/app/(public)/layout.tsx` | shell pública y GA4 | Correcto | Carga `GoogleAnalytics` y `ScrollDepthTracker` solo en superficie pública. |
| `src/app/robots.ts` y `src/app/sitemap.ts` | indexación pública y exclusión de `/admin` | Correcto | `/admin` disallow; sitemap solo incluye `/`, `/services`, `/evaluar`. |
| `src/app/admin/...` | superficie privada real | Correcto | Las rutas documentadas existen y el flujo sigue dependiendo de FHIR local. |
| `src/app/(public)/...` | superficie pública real | Correcto | Las rutas públicas documentadas existen y `/evaluar` sigue activa. |

## 3. Verificación del Patch 1 de entornos FHIR

| Punto verificado | Evidencia principal | Estado | Observaciones |
|---|---|---|---|
| Helper de clasificación | `src/lib/fhir/config.ts` | Correcto | Clasifica `http://localhost:8081/fhir` como `FHIR dev/test`, `http://localhost:8080/fhir` como `FHIR local-real`, y mantiene fallback `custom`/`missing`. |
| Badge en `/admin` | `src/app/admin/layout.tsx` | Correcto | Muestra `Entorno FHIR: ...` y `endpointLabel` en header privado. |
| Scripts | `package.json` | Correcto | `dev`, `dev:fhir-dev`, `dev:fhir-test`, `dev:fhir-real`, `build:fhir-test`, `build:fhir-real` coinciden con el modelo de entornos documentado. |
| `.env.example` | `.env.example` | Correcto | Default seguro en `8081`; `8080` queda comentado y señalado como local-real. |
| Documentación activa | `README.md`, `AGENTS.md`, `docs/fuente-de-verdad-operativa.md`, `docs/fhir/README.md` | Correcto con observaciones | El contrato principal quedó bien reflejado, pero `README.md` todavía necesita pequeños ajustes de precisión. |
| Tests del helper | `src/lib/fhir/__tests__/config.test.ts` | Correcto | Hay cobertura directa del helper nuevo. |
| Tests del layout/badge | `src/app/admin/layout.test.ts` | Correcto | Hay prueba del badge visible en admin. |

## 4. Matriz de congruencia actual

| Tema | Documentación dice | Código muestra | Estado | Acción recomendada |
|---|---|---|---|---|
| Framing del repo | Case study HealthTech; superficie pública + privada mínima; no full EHR ni SaaS multiusuario | Rutas y arquitectura separan público y privado; no hay auth/multiusuario | Correcto | Mantener. |
| Rutas públicas | `/`, `/services`, `/evaluar` | Existen en `src/app/(public)/page.tsx`, `src/app/(public)/services/page.tsx`, `src/app/(public)/evaluar/page.tsx` | Correcto | Mantener. |
| Rutas privadas | `/admin`, `/admin/configuracion/profesional`, `/admin/patients`, `/admin/patients/new`, `/admin/patients/[id]`, `/administrative`, `/encounters`, `/encounters/new`, `/treatment` | Existen en `src/app/admin/...` | Correcto | Mantener. |
| GA4 | Solo en superficie pública | `GoogleAnalytics` se carga solo en `src/app/(public)/layout.tsx`; `/admin` usa otro layout | Correcto | Mantener. |
| Noindex/robots | `/admin` no indexable ni presentable como demo pública | `src/app/admin/layout.tsx` define `robots.index=false`; `src/app/robots.ts` desautoriza `/admin` | Correcto | Mantener. |
| `FHIR_BASE_URL` | Obligatoria, server-side, un FHIR por ejecución | `src/lib/fhir/config.ts` y `src/lib/fhir/client.ts` la leen solo del server | Correcto | Mantener. |
| FHIR dev/test 8081 | `8081 = dev/test, datos descartables` | `package.json`, `.env.example` y helper lo clasifican así | Correcto | Mantener. |
| FHIR local-real 8080 | `8080 = local-real, datos reales/locales` | `package.json`, `.env.example` y helper lo clasifican así | Correcto | Mantener. |
| Badge entorno `/admin` | `/admin` muestra entorno activo | `src/app/admin/layout.tsx` lo renderiza; `src/app/admin/layout.test.ts` lo verifica | Correcto | Mantener. |
| Mock/demo mode | No implementado | No hay provider mock ni capa demo en `src/app/admin` o repositorios | Correcto | Mantener explícito. |
| Auth/multiusuario | No implementado | No hay auth, login, sesiones ni control multiusuario real | Correcto | Mantener explícito. |
| `ServiceRequest` | No equivale a tratamiento | `start-episode-of-care.action.ts` exige solicitud aceptada y válida | Correcto | Mantener. |
| `EpisodeOfCare` | Iniciar tratamiento requiere solicitud aceptada válida y no usada previamente | `start-episode-of-care.action.ts` valida patient, `accepted`, fecha y single-use | Correcto | Mantener. |
| `Encounter` | Las visitas dependen de tratamiento activo | `create-encounter.action.test.ts` y loaders usan `getActiveEpisodeByPatientId` | Correcto | Mantener. |
| `Observation` | Métricas funcionales anexas a visita | Repositorios/read models cargan `Observation` por `Encounter` | Correcto | Mantener. |
| `Condition` | Diagnóstico médico y kinésico se persisten como `Condition` | `condition.repository.ts` y contexto clínico lo implementan | Correcto con observaciones | Alinear `README.md`, que hoy no lo lista en su resumen FHIR. |
| `Practitioner` | Profesional firmante basado en `Practitioner` singleton | `practitioner.repository.ts` y pantalla `/admin/configuracion/profesional` lo confirman | Correcto | Mantener. |
| Resumen compartible | Existe y depende del contexto real de visita/profesional | `visit-share-report.read-model.ts` lo arma desde `Encounter`, `EpisodeOfCare`, `Patient`, `Practitioner` | Correcto | Mantener. |
| Scripts | Scripts explícitos para dev/build por entorno | `package.json` los tiene | Correcto con observaciones | Documentar también `build:fhir-test` y `build:fhir-real` en `README.md` o fuente operativa. |
| Tests/checks | Lint, test y build deben validar el estado real | `npm run lint`, `npm run test`, `FHIR_BASE_URL=http://localhost:8081/fhir npm run build` pasaron | Correcto con observaciones | Actualizar conteo de tests y comando de build recomendado en `README.md`. |
| `AGENTS.md` | Debe alinear framing, FHIR local y límites del repo | Quedó consistente con el código y el patch | Correcto | Mantener. |

## 5. Hallazgos por severidad

### Críticos

No se detectaron contradicciones críticas vigentes entre documentación activa, `AGENTS.md` y código que hoy induzcan a operar contra el entorno equivocado, exponer datos o presentar falsamente `/admin` como demo pública.

### Importantes

- ID: IMP-01
- severidad: importante
- archivo(s): `README.md`, `package.json`, `AGENTS.md`
- evidencia documental:
  - `README.md` sigue mostrando `npm run build` como check genérico y no documenta `build:fhir-test` / `build:fhir-real`.
  - `README.md` todavía reporta `97` test files y `649` tests.
- evidencia en código:
  - `package.json` ya tiene `build:fhir-test` y `build:fhir-real`.
  - La validación real de hoy dio `98` test files y `653` tests.
  - `AGENTS.md` ya recomienda `FHIR_BASE_URL=http://localhost:8081/fhir npm run build`.
- impacto:
  - puede dejar una guía incompleta para validar el proyecto de forma segura y reproducible después del patch.
- recomendación:
  - actualizar `README.md` para reflejar los scripts de build por entorno y el estado real de tests/checks.

- ID: IMP-02
- severidad: importante
- archivo(s): `docs/archive/audits/auditoria-manejo-entornos-fhir-next-2026-06-25.md`
- evidencia documental:
  - esa auditoría todavía afirma que no existe señal visible en `/admin` y que no hay scripts `build:fhir-test` o `build:fhir-real`.
- evidencia en código:
  - `src/app/admin/layout.tsx` ya muestra el badge de entorno.
  - `package.json` ya expone ambos scripts de build.
- impacto:
  - si alguien toma esa auditoría reciente como fuente activa, puede concluir erróneamente que el patch no se implementó o que el repo sigue en estado pre-patch.
- recomendación:
  - mantenerla en archivo histórico con referencia explícita a que quedó supersedida por esta auditoría post-patch.

- ID: IMP-03
- severidad: importante
- archivo(s): `README.md`, `docs/fhir/README.md`, `src/infrastructure/repositories/condition.repository.ts`
- evidencia documental:
  - `docs/fhir/README.md` y `docs/fuente-de-verdad-operativa.md` listan `Condition` como recurso activo.
  - `README.md` en su sección “FHIR Modeling” enumera `Patient`, `ServiceRequest`, `EpisodeOfCare`, `Encounter`, `Observation`, `Practitioner`, pero omite `Condition`.
- evidencia en código:
  - `Condition` se usa realmente para diagnósticos del contexto clínico longitudinal.
- impacto:
  - el resumen portfolio-facing queda levemente incompleto respecto del modelado FHIR real.
- recomendación:
  - decidir si `README.md` debe mantener un resumen mínimo o si conviene alinearlo listando también `Condition`.

### Menores

- ID: MEN-01
- severidad: menor
- archivo(s): `package.json`, `README.md`
- evidencia documental:
  - la documentación sigue presentando `npm run lint` como check normal sin anotar detalles de tooling.
- evidencia en código:
  - `npm run lint` pasó, pero muestra el warning deprecado real de `next lint` en Next.js 16.
- impacto:
  - no rompe congruencia funcional, pero sí deja una deuda de mantenimiento de tooling.
- recomendación:
  - tratarlo como patch técnico aparte, sin mezclarlo con contrato de producto/FHIR.

- ID: MEN-02
- severidad: menor
- archivo(s): `docs/checklist-sincronizacion-doc-codigo.md`, `docs/audits/`
- evidencia documental:
  - el checklist habla de documentación principal, referencias rotas y archivo, pero no contempla explícitamente auditorías recientes que hayan quedado supersedidas por un patch.
- evidencia en código:
  - hoy existen al menos dos auditorías del mismo día, una pre-patch y esta post-patch.
- impacto:
  - aumenta la chance de conservar informes recientes con conclusiones ya vencidas dentro de la misma superficie visible.
- recomendación:
  - añadir una regla breve para marcar o archivar auditorías superadas cuando un patch ya resolvió sus hallazgos.

## 6. Validación ejecutada

| Comando | Resultado | Observaciones |
|---|---|---|
| `npm run lint` | OK | Sin errores de ESLint. Mostró warning real deprecado de `next lint`. |
| `npm run test` | OK | `98` test files, `653` tests en verde. Incluye helper FHIR y layout de admin. |
| `FHIR_BASE_URL=http://localhost:8081/fhir npm run build` | OK | Build exitoso. Next informó carga de `.env.local`, pero el `FHIR_BASE_URL` explícito permitió validar el flujo seguro en `8081`. |

## 7. Plan de acción propuesto

1. Patch documental corto:
   actualizar `README.md` para reflejar build/checks reales post-patch, conteo actual de tests y, si se considera útil, la presencia de `Condition` en el modelado FHIR.
2. Higiene de auditorías:
   mantener `docs/archive/audits/auditoria-manejo-entornos-fhir-next-2026-06-25.md` y `docs/archive/audits/auditoria-congruencia-docs-agents-estado-actual-2026-06-25.md` como línea base histórica ya supersedida.
3. Regla de mantenimiento:
   extender levemente `docs/checklist-sincronizacion-doc-codigo.md` para contemplar auditorías recientes ya vencidas por patches posteriores.
