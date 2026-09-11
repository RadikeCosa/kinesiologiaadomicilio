# Documentación activa

La documentación principal distingue tres cosas: qué existe hoy, qué producto queremos construir y cómo se realizará la separación. El material reemplazado se retira de la documentación versionada y puede conservarse localmente en `docs/archive/`, que está ignorado por Git.

## Estado actual

- [`operacion.md`](./operacion.md): términos, flujos y reglas clínicas y administrativas confirmadas.
- [`fhir/README.md`](./fhir/README.md): frontera de integración y contratos FHIR R4 activos.
- [`privacidad-entornos-y-demo.md`](./privacidad-entornos-y-demo.md): datos permitidos, entornos, dispositivos, logs y material demostrativo.
- [`analytics-handoff.md`](./analytics-handoff.md): medición exclusiva de la superficie pública.
- [`screenshots/README.md`](./screenshots/README.md): catálogo y reglas de sanitización de capturas.

## Remodelación

Leer en este orden:

1. [`00-baseline-actual.md`](./remodelacion/00-baseline-actual.md): punto de partida verificado del repositorio combinado.
2. [`02-vision-y-alcance.md`](./remodelacion/02-vision-y-alcance.md): usuario, problema, promesa, principios y V1 de la aplicación privada.
3. [`03-decisiones-arquitectura.md`](./remodelacion/03-decisiones-arquitectura.md): dominio, FHIR, acceso, offline, sincronización, informes y topología.
4. [`04-handoff-infraestructura-casa.md`](./remodelacion/04-handoff-infraestructura-casa.md): requisitos entregados al proyecto Casa.
5. [`05-plan-separacion-repositorios.md`](./remodelacion/05-plan-separacion-repositorios.md): frontera exacta, secuencia y condiciones para dividir landing y `/admin`.

La decisión vigente es separar ambos productos en dos repositorios. `kinesiologia-clinica` ya tiene una fundación técnica independiente y documentada, pero todavía no recibió código clínico legado. `/admin` sigue operativo en este repositorio hasta que su reemplazo alcance las condiciones de corte.

## Jerarquía de fuentes

Cuando dos documentos parezcan contradecirse:

1. el código y las pruebas describen lo implementado;
2. `operacion.md`, `fhir/README.md` y `privacidad-entornos-y-demo.md` describen el contrato actual;
3. `remodelacion/02`, `03` y `05` describen el producto objetivo y el plan de transición;
4. `archive/` aporta contexto histórico, pero no define comportamiento vigente.

Actualizar documentación solo cuando cambie un contrato, una decisión o un comportamiento verificable. Evitar documentos de seguimiento que repitan información ya consolidada.

## Archivo local

`docs/archive/` no se publica con el repositorio. Si una referencia histórica vuelve a ser necesaria, debe verificarse contra el código actual e incorporarse de forma concisa a una fuente activa.
