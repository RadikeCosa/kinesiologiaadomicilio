# Auditoría de congruencia documentación / AGENTS / código

## 1. Resumen ejecutivo

- Estado general: parcialmente congruente
- Riesgo principal: la documentación activa es mayormente consistente con el producto real, pero existen algunos drift importantes en la forma de presentar el estado y en la expectativa de alcance operativo (especialmente sobre demo/mock, auth/multiusuario y la precisión del lenguaje de “superficie privada mínima/local”).
- Recomendación principal: conservar el framing actual de case study HealthTech público + app clínica privada mínima/local, pero corregir la documentación para dejar explícito que la admin depende de FHIR local real, que no existe demo pública segura ni mock mode implementado, y que la regla de tratamiento/solicitud está implementada de forma operativa y no solo declarativa.

## 2. Fuentes revisadas

| archivo o área revisada | rol esperado | estado | observaciones |
|---|---|---|---|
| README.md | resumen portfolio-facing y framing general | Parcialmente congruente | Se alinea bien con el proyecto real, pero aún presenta la superficie privada como “meaningful” y “minimal” sin enfatizar suficientemente el requisito de FHIR local real. |
| AGENTS.md | guía operacional para agentes/Codex | Congruente en lo esencial | Es una guía sólida y en general alineada con el código y la documentación activa. |
| docs/README.md | mapa de documentación activa | Congruente | Está bien orientado y no contradice el estado real. |
| docs/fuente-de-verdad-operativa.md | fuente operativa vigente | Congruente | Es la fuente más precisa del flujo actual y se corresponde con el código. |
| docs/arquitectura-objetivo-app-clinica.md | dirección técnica y de producto | Congruente | Mantiene la separación pública/privada y la dirección incremental. |
| docs/fhir/README.md | contrato activo FHIR | Congruente | Refleja bien los recursos y reglas del código actual. |
| docs/product/README.md | mapa de documentación de producto | Congruente | Simple y consistente. |
| docs/product/solicitud-atencion-flujo-inicial.md | contrato operativo de ServiceRequest | Congruente | Alineado con la implementación real de start/accept/use. |
| docs/analytics-handoff.md | tracking público GA4 | Congruente | Coincide con el layout público y el uso de GA4. |
| docs/normalization-data/README.md | normalización de datos administrativos | Congruente | Alineado con los helpers y la lógica de display. |
| docs/checklist-sincronizacion-doc-codigo.md | checklist de cambio | Congruente | No presenta drift claro. |
| docs/archive/README.md | archivo documental | Congruente | Se corresponde con la intención de archivar material histórico. |
| src/app | rutas reales del producto | Congruente | Las rutas públicas y privadas reales están presentes y son coherentes con la documentación. |
| src/app/admin | superficie privada | Congruente | Existe una superficie operaiva mínima basada en FHIR y rutas locales. |
| loaders/actions/read models | flujo de datos actual | Congruente | Hay una arquitectura de loaders/actions/read models bastante alineada con la guía. |
| dominio y reglas operativas | reglas de negocio | Congruente | Se observa lógica real para inicio/cierre de tratamiento, visitas y resumen compartible. |
| repositorios/mappers FHIR | frontera FHIR | Congruente | Se usan recursos FHIR reales y hay mappers/repositories claros. |
| variables de entorno | runtime | Congruente | FHIR_BASE_URL y NEXT_PUBLIC_GA_ID aparecen consistentemente. |
| package.json | scripts y herramientas | Parcialmente congruente | El script de lint usa next lint (deprecated) y el proyecto se compila bien, pero la documentación no lo menciona como deprecated. |
| tests existentes | cobertura | Congruente | Hay 97 archivos y 649 tests pasando. |
| GA4 / robots / sitemap / noindex | visibilidad pública | Congruente | El comportamiento real coincide con la documentación. |

## 3. Hallazgos por severidad

### Críticos

- ID: HC-01
- severidad: crítica
- archivo(s): README.md, docs/fuente-de-verdad-operativa.md, docs/arquitectura-objetivo-app-clinica.md, AGENTS.md, docs/fhir/README.md
- evidencia documental: estos documentos describen una app clínica privada mínima/local, pero el README y otros textos pueden inducir a inferir que existe una “demo pública” o un estado más productivo de la superficie privada de lo que realmente existe. También se habla de “safe demo mode” en el README como roadmap, no como implementación real.
- evidencia en código: la admin depende de rutas server-side y repositorios FHIR reales; no existe mock/demo mode implementado en la superficie de admin ni en la lógica de rutas. La admin carga datos con repositorios FHIR reales y está protegida de indexación con metadata noindex en [src/app/admin/layout.tsx](src/app/admin/layout.tsx).
- impacto: riesgo de presentar falsamente el proyecto como algo más “demostrable” o “multiusuario” de lo que es, o de incentivar implementaciones que asuman un mock mode existente.
- recomendación: dejar explícito en la documentación activa que la admin es una superficie privada local y que no existe demo pública segura ni mock mode implementado.

- ID: HC-02
- severidad: crítica
- archivo(s): docs/README.md, docs/fuente-de-verdad-operativa.md, docs/arquitectura-objetivo-app-clinica.md, docs/product/solicitud-atencion-flujo-inicial.md, AGENTS.md
- evidencia documental: la documentación activa habla de “superficie privada clínica mínima/local”, pero no siempre deja suficientemente claro que la operación real depende de un servidor FHIR local y de datos reales del entorno.
- evidencia en código: los repositorios y actions usan FHIR client real de forma directa para pacientes, solicitudes, episodios, encounters, observations, practitioner; no hay una ruta de demo/mock. Ejemplos en [src/infrastructure/repositories/practitioner.repository.ts](src/infrastructure/repositories/practitioner.repository.ts), [src/app/admin/patients/[id]/actions/start-episode-of-care.action.ts](src/app/admin/patients/[id]/actions/start-episode-of-care.action.ts) y [src/app/admin/patients/[id]/data.ts](src/app/admin/patients/[id]/data.ts).
- impacto: se podría interpretar que el proyecto está “listo” para uso externo o para una demo sin infraestructura local. Eso no es correcto.
- recomendación: reforzar el framing de local/private y el requisito de FHIR_BASE_URL en la documentación activa.

### Importantes

- ID: HI-01
- severidad: importante
- archivo(s): README.md, docs/fuente-de-verdad-operativa.md, docs/fhir/README.md, docs/product/solicitud-atencion-flujo-inicial.md
- evidencia documental: la documentación habla ampliamente de la lógica de solicitud/episodio/visita y del single-use de solicitudes. Eso está bien, pero el README todavía podría ser más explícito sobre la regla exacta de “solicitud aceptada válida y no usada previamente”.
- evidencia en código: la regla está implementada realmente en [src/app/admin/patients/[id]/actions/start-episode-of-care.action.ts](src/app/admin/patients/[id]/actions/start-episode-of-care.action.ts) y [src/domain/episode-of-care/episode-of-care.rules.ts](src/domain/episode-of-care/episode-of-care.rules.ts). La acción valida: paciente correcto, status accepted, no vinculada a otro episodio, y evita múltiples tratamientos activos.
- impacto: riesgo de desalineación semántica si alguien lee solo el resumen portfolio-facing y no la fuente operativa.
- recomendación: añadir una nota breve en README o en docs/product para dejar claro que el inicio de tratamiento requiere solicitud aceptada válida y no usada previamente.

- ID: HI-02
- severidad: importante
- archivo(s): README.md, docs/analytics-handoff.md, src/app/(public)/layout.tsx, src/app/admin/layout.tsx
- evidencia documental: la documentación dice que GA4 aplica solo a la superficie pública y que /admin queda fuera de tracking público.
- evidencia en código: se confirma en [src/app/(public)/layout.tsx](src/app/(public)/layout.tsx) y [src/app/admin/layout.tsx](src/app/admin/layout.tsx). El tracking público está realmente limitado a la shell pública.
- impacto: bajo, pero conviene que el README no sugiera lo contrario.
- recomendación: no requiere cambio urgente, pero conviene mantener este punto explícito en README para evitar drift.

- ID: HI-03
- severidad: importante
- archivo(s): README.md, docs/fuente-de-verdad-operativa.md, docs/fhir/README.md
- evidencia documental: la documentación activa menciona de manera consistente que la superficie privada no es una historia clínica completa ni un SaaS multiusuario.
- evidencia en código: hay una app operativa mínima, con rutas y features concretas, pero sin auth ni multiusuario. Esto se ve por la ausencia de un sistema de autenticación real y por el enfoque route-local e infrastructural. No hay evidencia de auth implementada.
- impacto: se podría asumir que el proyecto ya tiene una base de seguridad o multiusuario que en realidad no existe.
- recomendación: mantener una frase explícita de “auth y multiusuario no implementados” en el README y AGENTS para evitar declaraciones implícitas.

### Menores

- ID: HM-01
- severidad: menor
- archivo(s): package.json, README.md
- evidencia documental: README documenta scripts básicos de lint/test/build.
- evidencia en código: [package.json](package.json) usa `next lint`, que hoy funciona pero está deprecated en Next.js 16. No es un error funcional, pero sí una deuda de tooling.
- impacto: bajo; no afecta el producto, pero puede confundir a nuevos colaboradores.
- recomendación: dejarlo como nota técnica en un próximo patch de mantenimiento, no como bloqueante del audit.

- ID: HM-02
- severidad: menor
- archivo(s): docs/README.md, docs/archive/README.md
- evidencia documental: la documentación activa trata bien el archivo y el estado histórico.
- evidencia en código: no hay contradicción; la carpeta docs/archive existe y parece cumplir su función.
- impacto: bajo.
- recomendación: no requiere acción inmediata; solo mantener el criterio de archivado claro.

## 4. Matriz de congruencia

| tema | documentación dice | código muestra | estado | acción recomendada |
|---|---|---|---|---|
| rutas públicas | /, /services, /evaluar | existen en [src/app/(public)](src/app) | congruente | mantener |
| rutas privadas | /admin, /admin/patients, /admin/patients/[id]/administrative, /admin/patients/[id]/encounters, /admin/patients/[id]/treatment, /admin/configuracion/profesional | existen en [src/app/admin](src/app/admin) | congruente | mantener |
| tracking GA4 | solo en superficie pública | se carga en [src/app/(public)/layout.tsx](src/app/(public)/layout.tsx) y no en [src/app/admin/layout.tsx](src/app/admin/layout.tsx) | congruente | mantener |
| robots/noindex | /admin noindex/nofollow y robots disallow | se ve en [src/app/robots.ts](src/app/robots.ts) y [src/app/admin/layout.tsx](src/app/admin/layout.tsx) | congruente | mantener |
| FHIR resources | Patient, ServiceRequest, EpisodeOfCare, Encounter, Observation, Condition, Practitioner | están presentes en repositorios/mappers y en la arquitectura de admin | congruente | mantener |
| ServiceRequest | no equivale a tratamiento, requiere aceptación para iniciar tratamiento | se ve en [src/app/admin/patients/[id]/actions/start-episode-of-care.action.ts](src/app/admin/patients/[id]/actions/start-episode-of-care.action.ts) y [src/app/admin/patients/[id]/data.ts](src/app/admin/patients/[id]/data.ts) | congruente | reforzar en README |
| EpisodeOfCare | un tratamiento activo por paciente; rule single-use de solicitud | se implementa en [src/domain/episode-of-care/episode-of-care.rules.ts](src/domain/episode-of-care/episode-of-care.rules.ts) y en la action de inicio | congruente | reforzar en docs brief |
| Encounter | visita depende del tratamiento activo para la lógica de superficie clínica | se ve en [src/app/admin/patients/[id]/encounters/new/page.tsx](src/app/admin/patients/[id]/encounters/new/page.tsx) y en [src/features/visit-share-report/visit-share-report.read-model.ts](src/features/visit-share-report/visit-share-report.read-model.ts) | congruente | mantener |
| Observation | métricas funcionales asociadas a la visita | se ve en [src/infrastructure/mappers/functional-observation/functional-observation-write.mapper.ts](src/infrastructure/mappers/functional-observation/functional-observation-write.mapper.ts) y [src/features/visit-share-report/visit-share-report.read-model.ts](src/features/visit-share-report/visit-share-report.read-model.ts) | congruente | mantener |
| Condition | diagnosis médica y kinésica | se ve en [src/infrastructure/mappers/condition/condition-write.mapper.ts](src/infrastructure/mappers/condition/condition-write.mapper.ts) y en [src/app/admin/patients/[id]/data.ts](src/app/admin/patients/[id]/data.ts) | congruente | mantener |
| Practitioner | professional firmante singleton | se ve en [src/infrastructure/repositories/practitioner.repository.ts](src/infrastructure/repositories/practitioner.repository.ts) | congruente | mantener |
| resumen compartible | derivado de visita/episodio y no persistido como recurso principal | se ve en [src/features/visit-share-report/visit-share-report.read-model.ts](src/features/visit-share-report/visit-share-report.read-model.ts) y [src/features/visit-share-report/visit-share-report.composer.ts](src/features/visit-share-report/visit-share-report.composer.ts) | congruente | aclarar en docs si hace falta |
| profesional firmante | configuración single-user basada en Practitioner | se ve en [src/app/admin/configuracion/profesional/page.tsx](src/app/admin/configuracion/profesional/page.tsx) y [src/infrastructure/repositories/practitioner.repository.ts](src/infrastructure/repositories/practitioner.repository.ts) | congruente | mantener |
| entorno local FHIR | requerido para admin | se ve en [package.json](package.json) y en los repositorios | congruente | reforzar en README |
| demo pública/admin mock | no implementado | no hay evidencia de mock/demo mode en src/app/admin ni en infraestructura | congruente con la realidad, pero poco explicitado | corregir documentación |
| auth/multiusuario | no implementado | no hay evidencia en el código | congruente, pero debe quedar explícito | corregir documentación |
| tests/checks | 97 archivos / 649 tests; lint/build pasan | ver resultados de ejecución | congruente | mantener |
| AGENTS.md | guía de trabajo | está alineada y útil | congruente | quizá ajustar solo para reforzar límites y comandos |

## 5. Evaluación de AGENTS.md

- ¿es suficiente para orientar a Codex? Sí, es suficiente y bien orientado para este repositorio.
- ¿contradice alguna fuente activa? No, en general no contradice.
- ¿le falta explicar arquitectura, límites, comandos o criterios de documentación? Le falta un poco más de concreción sobre los límites operativos del proyecto: que la admin depende de FHIR local, que no existe mock/demo mode, y que hay un patrón claro de read flow/write flow. Eso no es una contradicción, pero sí una oportunidad de claridad.
- ¿incluye instrucciones peligrosas o demasiado amplias? No. Es prudente y bien delimitado.
- ¿qué debería cambiarse? Solo se recomienda reforzar, no reemplazar: añadir una nota breve sobre “la superficie privada requiere FHIR local real” y “no existe auth/multiusuario/demo pública segura implementada”.

## 6. Plan de acción propuesto

### Patch 1 — correcciones críticas

- lista de archivos a tocar
  - README.md
  - docs/fuente-de-verdad-operativa.md
  - docs/arquitectura-objetivo-app-clinica.md
  - AGENTS.md
- objetivo
  - dejar explícito que la admin es una superficie privada local que depende de FHIR local real y que no existe mock/demo pública segura implementada.
- riesgo
  - bajo; se trata de documentación y framing, no de lógica funcional.
- tests/checks esperados
  - no aplica cambio funcional; verificar que README/docs sigan siendo consistentes con el código y correr lint/test/build si corresponde.

### Patch 2 — alineación documental importante

- lista de archivos a tocar
  - docs/product/solicitud-atencion-flujo-inicial.md
  - docs/fhir/README.md
  - docs/analytics-handoff.md
- objetivo
  - reforzar la regla exacta del inicio de tratamiento (solicitud aceptada, válida y no usada previamente), y aclarar que GA4 aplica a la superficie pública, no a /admin.
- riesgo
  - bajo.
- tests/checks esperados
  - lint/test/build no deberían verse afectados, pero se recomienda repetir los checks si se actualiza documentación con enlaces o secciones nuevas.

### Patch 3 — limpieza menor / claridad

- lista de archivos a tocar
  - package.json
  - docs/README.md
- objetivo
  - dejar una nota menor sobre el estado del linting y la herramienta de Next.js, sin cambiar comportamiento funcional.
- riesgo
  - muy bajo.
- tests/checks esperados
  - lint/test/build se mantienen.

## 7. Comandos ejecutados

| comando | resultado | observaciones |
|---|---|---|
| npm run lint | éxito | `next lint` reportó “No ESLint warnings or errors”. |
| npm run test | éxito | 97 archivos, 649 tests pasaron. |
| FHIR_BASE_URL=http://localhost:8081/fhir npm run build | éxito | Build de producción completado con rutas públicas y privadas generadas. |

## 8. Conclusión

Recomiendo pasar a un primer patch de documentación y framing, no a un patch funcional. El primer patch más seguro es el de correcciones críticas en README, docs/fuente-de-verdad-operativa.md, docs/arquitectura-objetivo-app-clinica.md y AGENTS.md porque mejora la precisión del proyecto sin modificar comportamiento ni introducir riesgo técnico.
