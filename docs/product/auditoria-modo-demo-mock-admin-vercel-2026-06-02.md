# Auditoría modo demo/mock para `/admin` en Vercel

Fecha: 2026-06-02  
Estado: auditoría y recomendación, sin implementación  
Alcance: superficie privada `/admin`, rutas principales de pacientes y estrategia para visualizar datos ficticios en Vercel sin depender de HAPI FHIR local.

## 1. Recomendación ejecutiva

La estrategia recomendada para el primer corte es incorporar un **modo demo de lectura basado en fixtures de modelos de dominio/read-model**, seleccionado por una frontera server-side de `data mode` o `repository provider`.

Para Patch 1 conviene evitar un HAPI público, evitar túneles al HAPI local y evitar subir dumps PostgreSQL. También conviene no empezar con fixtures FHIR completos exportados desde HAPI, aunque esa opción puede ser útil más adelante para testear mappers. La prioridad inicial no es simular un servidor FHIR sino permitir que la superficie privada se pueda navegar en Vercel con datos seguros, pequeños y mantenibles.

Propuesta concreta:

- `APP_DATA_MODE=fhir|mock`, con default `fhir`.
- `FHIR_BASE_URL` sigue siendo obligatorio solo cuando `APP_DATA_MODE=fhir`.
- En `mock`, los loaders de `/admin` leen desde repositorios mock o provider mock, no desde `fhirClient`.
- Las Server Actions en `mock` devuelven un error controlado de modo demo y no persisten nada.
- Los datos demo se escriben o generan como fixtures versionados, pequeños, revisables y sin PHI.
- Política explícita: nunca usar dumps de `prod/local-real` ni exportaciones de pacientes reales para demo.

Veredicto: **viable y recomendable**, siempre que el corte inicial sea read-only y la frontera se ubique en infraestructura/repositorios, no en componentes UI ni en recursos FHIR crudos.

## 2. Diagnóstico del estado actual

### 2.1 Wiring actual confirmado

La arquitectura vigente responde a este flujo:

`FHIR Server -> fhirClient -> repositories -> mappers -> domain/read models -> loaders -> UI`

Evidencia en código:

- `src/lib/fhir/config.ts` exige `FHIR_BASE_URL` y valida URL server-side.
- `src/lib/fhir/client.ts` construye requests `GET|POST|PUT` contra `getFhirBaseUrl()`, con `cache: "no-store"` y timeout.
- `src/infrastructure/repositories/*.repository.ts` importan `fhirClient` directamente.
- Los repositorios transforman FHIR a dominio mediante mappers, por ejemplo:
  - `patient.repository.ts` usa `mapFhirPatientToDomain()`.
  - `episode-of-care.repository.ts` usa `mapFhirEpisodeOfCareToDomain()`.
  - `encounter.repository.ts` usa `mapFhirEncounterToDomain()`.
  - `service-request.repository.ts` usa `mapFhirServiceRequestToDomain()`.
  - `observation.repository.ts` usa `mapFhirObservationToFunctionalObservation()`.
  - `condition.repository.ts` usa `mapFhirConditionToEpisodeDiagnosis()`.
- Los loaders de `/admin` importan funciones concretas desde repositorios:
  - `src/app/admin/data.ts`
  - `src/app/admin/patients/data.ts`
  - `src/app/admin/patients/[id]/data.ts`
  - `src/app/admin/patients/[id]/encounters/data.ts`
  - `src/app/admin/patients/[id]/clinical-context.ts`

Esta separación es favorable: la UI ya consume modelos propios y no necesita conocer FHIR crudo.

### 2.2 Dependencia actual que bloquea Vercel

Hoy, en modo normal, cualquier lectura privada termina llamando a `fhirClient`, y `fhirClient` exige `FHIR_BASE_URL`. En Vercel, si no existe un HAPI accesible, la superficie privada queda limitada por configuración o red.

Hay hardening operativo para fallos de FHIR en `/admin`, pero eso no resuelve la necesidad de **ver la app funcionando con datos ficticios**. Un fallback de error ayuda a no romper; un modo mock permitiría navegar la experiencia.

### 2.3 Escrituras actuales

Las Server Actions actuales ejecutan escrituras reales:

- `createPatientAction()` crea `Patient`.
- `updatePatientAction()` actualiza `Patient`.
- `createPatientServiceRequestAction()` puede actualizar `Patient` y crear `ServiceRequest`.
- `updatePatientServiceRequestStatusAction()` actualiza estado de `ServiceRequest`.
- `acceptAndStartTreatmentFromServiceRequestAction()` actualiza `ServiceRequest` y crea `EpisodeOfCare`.
- `startEpisodeOfCareAction()` crea `EpisodeOfCare`.
- `finishEpisodeOfCareAction()` finaliza `EpisodeOfCare`.
- `updateTreatmentClinicalContextFieldAction()` crea `Condition` y actualiza `EpisodeOfCare`.
- `createEncounterAction()` crea `Encounter` y opcionalmente `Observation`.
- `updateEncounterPeriodAction()` actualiza `Encounter`.
- `updateEncounterClinicalNoteAction()` actualiza `Encounter`.

En modo demo, estas acciones no deben intentar escribir en FHIR ni simular persistencia real en memoria compartida, porque Vercel no garantiza estado durable entre requests y porque el objetivo inicial es demostración visual segura.

## 3. Frontera recomendada

La frontera más limpia es un **provider server-side de repositorios**, no una condición en cada componente.

Ubicación conceptual:

`loaders/actions -> repository provider -> fhir repositories | mock repositories`

Objetivo:

- mantener UI y loaders consumiendo dominio/read models;
- mantener FHIR encapsulado en infraestructura;
- permitir que el modo mock sea intercambiable sin tocar componentes;
- permitir que `FHIR_BASE_URL` siga existiendo sin romper el flujo real/local.

Dos formas incrementales posibles:

1. Crear módulos provider, por ejemplo `src/infrastructure/repositories/provider.ts`, con métodos agrupados por recurso.
2. Crear módulos espejo `*.repository.mock.ts` y una capa `repositories/index.ts` que exporte la implementación activa.

Para Patch 1, la opción más segura es mínima: un helper `getAppDataMode()` y un provider explícito para los repositorios usados por `/admin` y rutas de pacientes. No hace falta rediseñar todo el árbol de infraestructura en un solo PR.

## 4. Alternativas comparadas

### A) Fixtures directos de dominio/read-model

Descripción:

Fixtures escritos como objetos `Patient`, `EpisodeOfCare`, `ServiceRequest`, `Encounter`, `FunctionalObservation` y diagnósticos ya normalizados, o incluso fixtures específicos de read-model para rutas donde convenga.

Ventajas:

- máxima seguridad inicial: no se importan dumps ni PHI accidental;
- bajo acoplamiento con FHIR crudo;
- encaja con la arquitectura vigente porque la UI ya consume modelos propios;
- fácil de revisar en PR;
- no requiere servidor, base de datos ni red;
- reduce el alcance de Patch 1.

Costos:

- no ejercita mappers FHIR;
- hay riesgo de fixtures demasiado “perfectos” si no se diseñan con estados variados;
- puede duplicar algo de shape si se escriben read-models finales en vez de dominio.

Veredicto:

**Recomendada para Patch 1**, preferentemente fixtures de dominio por recurso y composición en repositorios mock. Usar read-model fixtures solo si una ruta tiene composición muy costosa y se quiere aislar el primer corte.

### B) Fixtures FHIR sanitizados + repositorios mock usando mappers existentes

Descripción:

Exportar recursos FHIR falsos desde HAPI dev descartable, sanitizarlos, versionarlos como JSON y hacer que repositorios mock los lean usando los mappers actuales.

Ventajas:

- ejercita mappers reales;
- detecta incompatibilidades entre FHIR exportado y dominio;
- permite conservar casos cercanos a HAPI sin levantar servidor.

Costos:

- mayor riesgo de privacidad si el origen no está controlado;
- requiere pipeline de sanitización y revisión;
- fixtures FHIR son más verbosos y menos legibles;
- puede traer extensiones/IDs/metadatos innecesarios;
- complica Patch 1.

Veredicto:

**Buena candidata para Patch 2**, no para el primer corte. Si se usa, debe existir allowlist de campos, reidentificación a IDs `demo-*`, limpieza de `meta`, `identifier`, teléfonos, domicilios y cualquier texto libre que pueda venir de datos reales.

### C) HAPI demo separado

Descripción:

Levantar un HAPI público o privado accesible desde Vercel con dataset demo.

Ventajas:

- la app usa el camino FHIR real sin bifurcar repositorios;
- útil para validación end-to-end completa;
- simula mejor latencia, errores y queries reales.

Costos:

- introduce operación de infraestructura;
- requiere seguridad, hosting, backups, resets y monitoreo;
- aumenta riesgo de exposición por mala carga de datos;
- contradice la restricción actual de no depender de FHIR público;
- es sobreingeniería para visualizar `/admin`.

Veredicto:

**No recomendado para Patch 1 ni Patch 2**. Puede evaluarse en futuro si la demo necesita flujos de escritura persistentes, pruebas de integración reales o ambientes comerciales.

### D) Mock en `fhirClient`

Descripción:

Condicionar `fhirClient` para que, si `APP_DATA_MODE=mock`, responda bundles FHIR fake.

Ventajas:

- requiere menos cambios en imports existentes;
- ejercita repositorios y mappers;
- preserva firmas actuales.

Costos:

- acopla el modo demo al protocolo FHIR en el punto más bajo;
- obliga a simular búsquedas FHIR, bundles, `GET`, `POST`, `PUT` y errores;
- vuelve más difícil razonar sobre seguridad;
- mezcla responsabilidades de cliente HTTP con fixture store.

Veredicto:

**No recomendado** para el objetivo actual. Es tentador por corto plazo, pero convierte el cliente FHIR en un servidor fake parcial.

### E) Loaders demo específicos por ruta

Descripción:

Condicionar cada loader de `/admin` para retornar fixtures si `APP_DATA_MODE=mock`.

Ventajas:

- muy rápido para una demo visual;
- poco movimiento inicial si se limita a seis rutas.

Costos:

- dispersa la lógica de modo demo;
- aumenta riesgo de drift;
- no escala bien a actions ni repositorios;
- puede terminar acoplando UI/read-model a decisiones de infraestructura.

Veredicto:

Aceptable solo como spike descartable. Para un patch mantenible, conviene provider de repositorios.

## 5. Recomendación incremental

### Patch 1: demo read-only con fixtures de dominio

Objetivo:

Habilitar navegación de `/admin` y rutas principales de pacientes en Vercel con datos ficticios, sin HAPI, sin datos reales y sin escrituras.

Alcance sugerido:

- Agregar `APP_DATA_MODE=fhir|mock`.
- Agregar `getAppDataMode()` server-only.
- En modo `fhir`, mantener comportamiento actual y seguir usando `FHIR_BASE_URL`.
- En modo `mock`, resolver los repositorios usados por las rutas objetivo desde fixtures dominio/read-model.
- Crear fixtures pequeños y revisables:
  - 4 a 6 pacientes;
  - al menos 1 paciente en tratamiento activo;
  - al menos 1 paciente preliminar con faltantes;
  - al menos 1 paciente listo para iniciar;
  - al menos 1 paciente con tratamiento finalizado;
  - solicitudes `in_review`, `accepted` pendiente, `accepted` vinculada, `closed_without_treatment` y `cancelled`;
  - encuentros del ciclo activo y de un ciclo finalizado;
  - observaciones funcionales opcionales;
  - contexto clínico longitudinal con algunos campos faltantes.
- Bloquear Server Actions de escritura con error controlado:
  - `ok: false`;
  - mensaje: `Modo demo: esta acción no modifica datos.`
- No tocar landing pública.
- No introducir base de datos.
- No exponer HAPI.

Criterio de éxito:

- Vercel puede renderizar las rutas objetivo con `APP_DATA_MODE=mock` sin `FHIR_BASE_URL`.
- Modo local real sigue funcionando con `APP_DATA_MODE=fhir` y `FHIR_BASE_URL`.
- Ninguna action en demo persiste ni simula éxito engañoso.

### Patch 2: fixtures FHIR sanitizados opcionales

Objetivo:

Si se necesita mayor fidelidad técnica, incorporar fixtures FHIR sanitizados que pasen por mappers existentes.

Alcance sugerido:

- Script local de exportación solo desde HAPI dev descartable.
- Script de sanitización con allowlist por recurso.
- Bloqueo explícito para no aceptar origen `http://localhost:8080/fhir`.
- IDs reescritos a `demo-patient-*`, `demo-episode-*`, etc.
- Revisión manual del JSON antes de commit.
- Tests de mappers/repositorios mock contra esos fixtures.

Este patch debe seguir sin subir dumps PostgreSQL.

### Futuro: demo persistente o HAPI demo

Solo considerar si aparece una necesidad real:

- demos comerciales con formularios editables;
- entrenamiento interno con resets de dataset;
- validación end-to-end contra API FHIR real;
- permisos/autenticación por roles;
- datos demo compartidos entre sesiones.

Opciones futuras:

- HAPI demo aislado con seed controlado;
- store mock durable propio;
- entorno preview con dataset resettable.

No es necesario ahora.

## 6. Impacto por rutas

### `/admin`

Debe entrar en Patch 1.

Necesita datos mock para:

- `loadPatientsList()`;
- `listServiceRequestsByPatientIds()`;
- `listEpisodesByIncomingReferralIds()`.

Debe mostrar métricas derivadas reales desde fixtures, no números hardcodeados en la página.

### `/admin/patients`

Debe entrar en Patch 1.

Necesita datos mock para:

- `listPatients()`;
- `listEpisodesByPatientIds()`;
- `listServiceRequestsByPatientIds()`;
- `listEpisodesByIncomingReferralIds()`.

Debe cubrir filtros por `status` y `signal`.

### `/admin/patients/[id]`

Debe entrar en Patch 1.

Necesita datos mock para:

- `getPatientById()`;
- `getActiveEpisodeByPatientId()`;
- `getMostRecentEpisodeByPatientId()`;
- `listServiceRequestsByPatientId()`;
- `listEpisodeOfCareByIncomingReferral()`;
- `listEncountersByPatientId()`;
- `listFunctionalObservationsByEncounterId()`;
- `getConditionDiagnosisById()`.

El hub debe mostrar contacto, próximo paso sugerido y resumen clínico reciente sin depender de FHIR.

### `/admin/patients/[id]/administrative`

Debe entrar en Patch 1 en modo lectura.

Necesita datos mock para:

- detalle de paciente;
- solicitudes por paciente;
- vínculo solicitud-tratamiento por `incoming-referral`.

Actions de crear/resolver solicitud deben devolver error controlado de modo demo.

### `/admin/patients/[id]/treatment`

Debe entrar en Patch 1 en modo lectura.

Necesita datos mock para:

- tratamiento activo;
- historial de ciclos cerrados;
- contexto clínico;
- service request aceptada válida o ya usada si se quiere mostrar el flujo.

Actions de iniciar/finalizar tratamiento y editar marco clínico deben devolver error controlado.

### `/admin/patients/[id]/encounters`

Debe entrar en Patch 1.

Necesita datos mock para:

- paciente;
- episodio activo o reciente;
- encounters por paciente;
- observations por encounter;
- contexto clínico longitudinal;
- estadísticas y tendencia derivadas.

Actions de crear visita, editar horario y editar nota clínica deben devolver error controlado. La acción de `Resumen para compartir` puede mantenerse si solo compone texto desde datos ya cargados y no persiste; si se detecta persistencia futura, debe bloquearse también.

### Rutas relacionadas no incluidas inicialmente

`/admin/patients/new` y `/admin/patients/[id]/encounters/new` pueden renderizar, pero sus submits deben estar bloqueados. Si Patch 1 busca solo visualización, no hace falta optimizarlas como demo principal.

`/admin/configuracion/profesional` queda fuera del alcance inicial salvo que se quiera demostrar reportes/firma. Si se incluye más adelante, también debe ser read-only o fixtureado sin persistencia.

## 7. Server Actions en modo demo

Recomendación para Patch 1: **deshabilitar escrituras con error controlado**.

No simular éxito todavía.

Motivos:

- evita expectativas falsas del usuario;
- evita implementar un store mutable en Vercel;
- evita divergencias por request aislada/serverless;
- reduce riesgo de bugs por revalidación contra datos que no cambiaron;
- mantiene el mensaje de seguridad claro: demo visual, no operación.

Mensaje recomendado:

`Modo demo: esta acción no modifica datos. Usá el entorno FHIR local para operar datos reales.`

Acciones alcanzadas:

- crear paciente;
- editar paciente;
- crear solicitud;
- cambiar estado de solicitud;
- aceptar e iniciar tratamiento;
- iniciar tratamiento;
- finalizar tratamiento;
- editar contexto clínico;
- crear visita;
- editar horario de visita;
- editar nota clínica.

Excepción posible:

- acciones puramente derivadas y sin persistencia, como cargar/generar texto local de resumen compartible, pueden seguir funcionando si no escriben ni llaman servicios externos.

## 8. Naming de variables de entorno

Recomendación:

```bash
APP_DATA_MODE=fhir
FHIR_BASE_URL=http://localhost:8081/fhir
```

Valores:

- `APP_DATA_MODE=fhir`: usa HAPI FHIR real/local. Requiere `FHIR_BASE_URL`.
- `APP_DATA_MODE=mock`: usa fixtures demo. No requiere `FHIR_BASE_URL`.

Defaults:

- si `APP_DATA_MODE` no está definido, asumir `fhir` para no cambiar el comportamiento actual;
- si `APP_DATA_MODE=fhir` y falta `FHIR_BASE_URL`, mantener el error operacional actual;
- si `APP_DATA_MODE=mock`, nunca llamar a `getFhirBaseUrl()`.

Variables que no conviene usar:

- `NEXT_PUBLIC_APP_DATA_MODE`: no hace falta exponer el modo al cliente para Patch 1.
- `USE_MOCKS=true`: menos explícita y más difícil de extender.
- `FHIR_BASE_URL=mock`: mezcla semánticas de transporte con modo de datos.

## 9. Riesgos de seguridad y mitigaciones

### Riesgo: usar datos reales por accidente

Mitigación:

- política explícita: nunca usar dumps ni exportaciones de `prod/local-real` (`http://localhost:8080/fhir`) para demo;
- solo fixtures escritos a mano o exportaciones desde dev descartable (`http://localhost:8081/fhir`) después de sanitización;
- revisión manual obligatoria antes de commit;
- nombres, teléfonos, direcciones y DNI claramente ficticios.

### Riesgo: subir dumps PostgreSQL

Mitigación:

- prohibir dumps PostgreSQL en repo;
- versionar solo fixtures JSON/TS pequeños y revisables;
- agregar patterns a `.gitignore` si aparecen archivos de dump/export pesados.

### Riesgo: textos libres con PHI

Mitigación:

- sanitizar `note`, diagnósticos, motivos, instrucciones y observaciones textuales;
- preferir escribir fixtures clínicos ficticios a mano;
- no confiar solo en anonimizar identificadores.

### Riesgo: IDs reversibles o referencias reales

Mitigación:

- reescribir IDs a prefijos `demo-*`;
- no conservar `meta.source`, `meta.versionId`, timestamps de servidor real ni URLs internas sensibles.

### Riesgo: acciones que aparentan modificar datos

Mitigación:

- bloquear con error controlado;
- copy visible en formularios si se decide agregar banner demo más adelante;
- tests de actions en `APP_DATA_MODE=mock`.

### Riesgo: drift entre mock y FHIR real

Mitigación:

- fixtures de dominio deben cubrir estados operativos clave;
- Patch 2 puede agregar fixtures FHIR sanitizados para ejercitar mappers;
- tests comunes para loaders con provider mock y para repositorios FHIR existentes.

## 10. Tests necesarios

### Patch 1

Tests mínimos:

- `getAppDataMode()`:
  - default `fhir`;
  - acepta `fhir`;
  - acepta `mock`;
  - rechaza valores desconocidos con error claro.
- Config FHIR:
  - `APP_DATA_MODE=mock` no exige `FHIR_BASE_URL`;
  - `APP_DATA_MODE=fhir` mantiene requisito de `FHIR_BASE_URL`.
- Provider:
  - en `mock` no llama `fhirClient`;
  - en `fhir` conserva implementación actual.
- Repositorios mock:
  - listan pacientes;
  - resuelven paciente por id;
  - filtran episodios por paciente;
  - resuelven activo/reciente;
  - filtran solicitudes por paciente;
  - resuelven `incoming-referral`;
  - filtran encounters y observations por paciente/encounter.
- Loaders:
  - `/admin` produce dashboard con fixtures;
  - `/admin/patients` produce lista ordenada y filtros;
  - detalle/hub produce próximo paso esperado;
  - administrative muestra solicitudes;
  - treatment muestra activo/historial/contexto;
  - encounters muestra visitas, stats y tendencia.
- Server Actions:
  - cada action de escritura devuelve `ok:false` y mensaje demo;
  - no llama repositorios de escritura en modo mock.

Validación recomendada:

```bash
npm run lint
npm test
npm run build
```

Si se agregan tests que cambian `process.env`, deben aislar/restaurar env por test para evitar contaminación entre casos.

### Patch 2

Tests adicionales:

- sanitizador rechaza/limpia campos prohibidos;
- export desde `FHIR_BASE_URL=http://localhost:8080/fhir` falla explícitamente;
- fixtures FHIR sanitizados pasan por mappers;
- no aparecen patrones de DNI/teléfono/direcciones reales en fixtures.

## 11. Impacto documental

Patch 1 debería actualizar:

- `README.md`:
  - explicar `APP_DATA_MODE=fhir|mock`;
  - aclarar que `mock` permite Vercel sin HAPI;
  - mantener scripts locales `dev:fhir-dev` y `dev:fhir-real`;
  - documentar que el modo demo es read-only.
- `docs/fuente-de-verdad-operativa.md`:
  - agregar política de modo demo;
  - explicitar que `/admin` puede renderizar con fixtures ficticios;
  - aclarar que operación real sigue siendo FHIR local/real.
- Este documento:
  - puede quedar como auditoría base de decisión.

Docs FHIR:

- No hace falta tocar `docs/fhir/*` en Patch 1 si los fixtures son de dominio/read-model y no cambian contratos FHIR.
- Si Patch 2 introduce fixtures FHIR sanitizados o scripts de export/sanitización, conviene agregar una nota en `docs/fhir/README.md` o un documento técnico específico sobre política de fixtures FHIR.

Docs producto:

- No hace falta tocar landing ni docs de captación pública.
- Si se agrega un banner visible de demo dentro de `/admin`, documentarlo como comportamiento de producto.

## 12. No-alcances explícitos

No hacer en Patch 1:

- no exponer HAPI local por túneles;
- no desplegar HAPI público;
- no subir dumps PostgreSQL;
- no usar datos de `prod/local-real`;
- no introducir base de datos nueva;
- no implementar persistencia mock durable;
- no simular éxito de escrituras;
- no cambiar dominio clínico;
- no cambiar mappers FHIR salvo necesidad puntual;
- no tocar landing pública;
- no agregar autenticación o permisos;
- no implementar reset de dataset demo;
- no convertir fixtures en fuente clínica real;
- no prometer que demo reproduce todos los bordes de HAPI.

## 13. Decisión propuesta

Aprobar Patch 1 con esta caja:

- `APP_DATA_MODE=fhir|mock`;
- fixtures seguros de dominio/read-model;
- provider server-side de repositorios;
- rutas objetivo navegables en Vercel;
- Server Actions read-only por bloqueo controlado;
- documentación mínima en README y fuente operativa;
- tests de provider, loaders y actions en modo mock.

Este camino conserva la arquitectura por capas, no acopla UI a FHIR crudo, protege datos reales y evita infraestructura prematura. Patch 2 puede sumar fixtures FHIR sanitizados si aparece necesidad de mayor fidelidad técnica.
