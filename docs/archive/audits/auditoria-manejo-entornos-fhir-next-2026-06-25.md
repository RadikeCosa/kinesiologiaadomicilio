# Auditoría de manejo de entornos FHIR en Next.js

## 1. Resumen ejecutivo

- Estado actual: parcialmente ordenado, pero todavía confuso y poco robusto para alternar entre prueba y local-real.
- Riesgo principal: la app depende de una única variable de entorno, `FHIR_BASE_URL`, y el proyecto mezcla dos fuentes de verdad operativa: los scripts inline del package y el archivo local `.env.local`. Eso facilita que un desarrollador termine apuntando a `8080` o `8081` sin percibirlo claramente.
- Recomendación principal: mantener la estrategia actual de `FHIR_BASE_URL` como punto de entrada, pero formalizarla con un modelo de entornos simple y explícito: prueba/dev y local-real, con scripts claros, documentación breve y una señal visible en `/admin` para evitar confusiones operativas.

## 2. Cómo funciona hoy

### 2.1 Scripts actuales

El proyecto expone estos scripts en [package.json](../../package.json):

- `npm run dev` → apunta a `http://localhost:8081/fhir`
- `npm run dev:fhir-dev` → apunta a `http://localhost:8081/fhir`
- `npm run dev:fhir-real` → apunta a `http://localhost:8080/fhir`
- `npm run build` → no fija `FHIR_BASE_URL`; depende del entorno que Next reciba.

Evidencia:
- [package.json](../../package.json)
- [README.md](../../README.md)

### 2.2 Variables y archivos de entorno

Hay un archivo de ejemplo seguro en [.env.example](../../.env.example) que deja por defecto `FHIR_BASE_URL=http://localhost:8081/fhir` y comenta la opción de `8080`.

Además existe un archivo local [.env.local](../../.env.local) con:

- `FHIR_BASE_URL=http://localhost:8080/fhir`
- `NEXT_PUBLIC_GA_ID=...`
- `RUN_FHIR_RUNTIME_TESTS=true`

Eso significa que, en la práctica, la app puede recibir el valor de `8080` por defecto cuando no se sobrescribe explícitamente el entorno en la ejecución.

### 2.3 Flujo de lectura de `FHIR_BASE_URL`

El valor se lee en [src/lib/fhir/config.ts](../../src/lib/fhir/config.ts):

- solo se permite leerlo en el servidor;
- si falta, se lanza un error de configuración;
- si el valor es inválido, se lanza un error de configuración.

Luego el cliente FHIR en [src/lib/fhir/client.ts](../../src/lib/fhir/client.ts) construye la URL final para cada request a través de `fetch`.

### 2.4 Qué pasa si falta `FHIR_BASE_URL`

El código está preparado para fallar de forma controlada:

- si falta la variable, se genera un error de tipo `config`;
- la capa de admin lo convierte en `AdminOperationalError` en [src/app/admin/operational-error.ts](../../src/app/admin/operational-error.ts);
- la UI muestra un mensaje operativo en [src/app/admin/error.tsx](../../src/app/admin/error.tsx).

Esto es positivo desde el punto de vista de seguridad operativa, pero no es visible ni claro para el desarrollador que simplemente ejecuta la app sin revisar la variable.

### 2.5 Qué pasa si el servidor FHIR no está levantado

El cliente hace requests con timeout de 10 segundos. Si el endpoint no responde, el error se clasifica como `network` o `timeout` y se convierte en un error operacional en `/admin`.

Evidencia:
- [src/lib/fhir/client.ts](../../src/lib/fhir/client.ts)
- [src/lib/fhir/errors.ts](../../src/lib/fhir/errors.ts)
- [src/app/admin/patients/data.ts](../../src/app/admin/patients/data.ts)

### 2.6 Qué pasa con los repositorios y acciones

La gran mayoría de los flujos privados/admin dependen directamente del cliente FHIR y, por lo tanto, de `FHIR_BASE_URL`:

- pacientes
- solicitudes de atención
- episodios de tratamiento
- visitas
- observaciones funcionales
- configuración del profesional firmante

Evidencia:
- [src/infrastructure/repositories/patient.repository.ts](../../src/infrastructure/repositories/patient.repository.ts)
- [src/infrastructure/repositories/service-request.repository.ts](../../src/infrastructure/repositories/service-request.repository.ts)
- [src/infrastructure/repositories/episode-of-care.repository.ts](../../src/infrastructure/repositories/episode-of-care.repository.ts)
- [src/app/admin/patients/[id]/actions/start-episode-of-care.action.ts](../../src/app/admin/patients/[id]/actions/start-episode-of-care.action.ts)

### 2.7 Señal visible en `/admin`

Hoy no existe una señal visible que indique claramente contra qué entorno FHIR se está trabajando. El layout de admin solo muestra el título de “Superficie privada” en [src/app/admin/layout.tsx](../../src/app/admin/layout.tsx), pero no informa el endpoint ni el entorno activo.

### 2.8 Documentación activa

La documentación actual menciona el modelo de entornos en varios lugares, pero no lo presenta como una operación diaria explícita ni como una decisión de runtime bien formalizada:

- [README.md](../../README.md)
- [AGENTS.md](../../AGENTS.md)
- [docs/fuente-de-verdad-operativa.md](../../docs/fuente-de-verdad-operativa.md)
- [docs/fhir/README.md](../../docs/fhir/README.md)

La documentación sí sabe que hay dos puertos, pero no ofrece suficiente claridad para que un desarrollador nuevo sepa cuál usar, qué prevalece cuando falta configuración y qué riesgos hay al mezclar datos.

## 3. Modelo de entornos deseado

### 3.1 Entorno de prueba/dev

- objetivo: datos falsos, descartables o de laboratorio;
- puerto esperado: `8081`;
- uso recomendado: desarrollo inicial, pruebas locales, creación rápida de datos de ejemplo;
- riesgo: no debe mezclarse con datos de trabajo más persistentes.

### 3.2 Entorno local-real

- objetivo: datos reales o más persistentes usados localmente;
- puerto esperado: `8080`;
- uso recomendado: operaciones más serias, validación de flujo real, manejo cuidadoso de datos;
- riesgo: si se usa por error desde un contexto de prueba, puede contaminar datos reales o provocar efectos no deseados.

### 3.3 Qué riesgos hay al mezclarlos

- confusión operativa entre datos de prueba y datos locales reales;
- escritura accidental sobre el entorno equivocado;
- falta de visibilidad de qué endpoint está activo;
- uso inconsistente entre scripts y archivo `.env.local`.

## 4. Hallazgos

### Críticos

- ID: FHIR-CR-01
- severidad: crítica
- evidencia: [package.json](../../package.json), [.env.example](../../.env.example), [.env.local](../../.env.local), [src/lib/fhir/config.ts](../../src/lib/fhir/config.ts)
- impacto: existe riesgo real de que el desarrollador use el entorno equivocado sin darse cuenta, especialmente porque `npm run build` no fija el endpoint y puede heredar `.env.local`.
- recomendación: introducir una estrategia de selección de entorno más explícita y documentada.

- ID: FHIR-CR-02
- severidad: crítica
- evidencia: [src/lib/fhir/config.ts](../../src/lib/fhir/config.ts), [src/app/admin/error.tsx](../../src/app/admin/error.tsx), [src/app/admin/operational-error.ts](../../src/app/admin/operational-error.ts)
- impacto: la app no ofrece ninguna señal clara de qué endpoint está usando en `/admin`, lo que incrementa el riesgo de operar contra el entorno incorrecto.
- recomendación: agregar una señal visible y una mínima validación de contexto en la superficie privada.

### Importantes

- ID: FHIR-HI-01
- severidad: importante
- evidencia: [README.md](../../README.md), [AGENTS.md](../../AGENTS.md), [docs/fuente-de-verdad-operativa.md](../../docs/fuente-de-verdad-operativa.md), [docs/fhir/README.md](../../docs/fhir/README.md)
- impacto: la documentación menciona los dos puertos, pero no define una operación diaria clara ni una política simple de “qué usar en qué contexto”.
- recomendación: documentar una guía breve y explícita para el flujo diario de desarrollo.

- ID: FHIR-HI-02
- severidad: importante
- evidencia: [package.json](../../package.json), [README.md](../../README.md)
- impacto: hoy no hay scripts como `build:fhir-test` o `build:fhir-real`; la estrategia de build está menos clara que la de dev.
- recomendación: incluir scripts más expresivos para build y operación, sin sobre-diseñar.

- ID: FHIR-HI-03
- severidad: importante
- evidencia: [src/lib/fhir/config.ts](../../src/lib/fhir/config.ts), [src/lib/fhir/client.ts](../../src/lib/fhir/client.ts)
- impacto: el sistema no tiene una validación de entorno activa que impida usar accidentalmente `local-real` en escenas de prueba o viceversa.
- recomendación: agregar validación o advertencia en server-side y/o UI, pero sin introducir auth ni mock mode.

### Menores

- ID: FHIR-HM-01
- severidad: menor
- evidencia: [package.json](../../package.json)
- impacto: el comando `next lint` está deprecated en la herramienta, aunque no afecta directamente el manejo de entornos FHIR.
- recomendación: dejarlo como deuda técnica de tooling, no como foco del audit FHIR.

- ID: FHIR-HM-02
- severidad: menor
- evidencia: no se encontraron archivos Docker/FHIR específicos en este repo aparte de la documentación y el uso de la variable de entorno.
- impacto: la referencia al servidor externo queda implícita y depende del contexto local externo.
- recomendación: documentar la expectativa de que el servidor HAPI debe levantarse por separado y que la app solo apunta a él.

## 5. Alternativas evaluadas

### Alternativa A — Mantener `FHIR_BASE_URL` explícito por script

Ventajas:
- es la solución más simple;
- mantiene compatibilidad con el código actual;
- no introduce nuevas capas ni complejidad.

Desventajas:
- sigue dependiendo de que el desarrrollador recuerde qué script usa qué endpoint;
- no resuelve de forma clara la confusión de `.env.local` versus scripts.

Riesgo: bajo.
Esfuerzo: bajo.
Recomendación: útil como base, pero insuficiente si se quiere seguridad operativa.

### Alternativa B — Usar archivos `.env.fhir-dev` / `.env.fhir-real` o equivalentes

Ventajas:
- separa la configuración por contexto;
- mejora la claridad para desarrollo local;
- permite una carga más explícita y documentable.

Desventajas:
- requiere una convención clara para cargar los archivos;
- puede ser más confuso si no se documenta bien cómo se selecciona uno u otro.

Riesgo: medio.
Esfuerzo: medio.
Recomendación: buena opción si se quiere una separación limpia sin introducir un sistema complejo.

### Alternativa C — Usar `APP_ENV` / `FHIR_ENV` para resolver el endpoint

Ventajas:
- da un criterio centralizado para decidir el entorno activo;
- permite preparar lógica más explícita de runtime y UI.

Desventajas:
- requiere más decisiones de diseño y más superficie de cambios;
- si se hace demasiado genérico, puede complicar el flujo actual.

Riesgo: medio.
Esfuerzo: medio.
Recomendación: aceptable si se quiere una solución más institucional, pero puede ser excesiva para este momento.

### Alternativa D — Agregar scripts y señal visible en `/admin`

Ventajas:
- es muy simple de entender;
- mejora mucho la seguridad operativa con bajo riesgo;
- no exige introducir infraestructura nueva ni mock mode.

Desventajas:
- no sustituye por sí sola la necesidad de una regla clara de entorno.

Riesgo: bajo.
Esfuerzo: bajo a medio.
Recomendación: esta es la mejor opción complementaria para el primer patch.

## 6. Propuesta recomendada

La estrategia recomendada es una mezcla simple de las alternativas A y D, con una pequeña mejora en la documentación y una señal visible en `/admin`.

### 6.1 Cómo debería iniciarse Next apuntando a FHIR de prueba

- usar un script explícito como `npm run dev:fhir-test` o `npm run dev:fhir-dev`;
- el endpoint debería ser claramente `http://localhost:8081/fhir`;
- la documentación debería señalar que este entorno es para pruebas y datos descartables.

### 6.2 Cómo debería iniciarse Next apuntando a FHIR local-real

- usar un script explícito como `npm run dev:fhir-real`;
- el endpoint debería ser claramente `http://localhost:8080/fhir`;
- el uso debería reservarse para datos reales o más persistentes, con cuidado operativo.

### 6.3 Cómo debería documentarse

- dejar una sección breve en README y docs FHIR con una regla operativa simple:
  - `8081 = pruebas/dev/datos descartables`
  - `8080 = local-real/datos reales o persistentes`
- aclarar que la app Next apunta a un solo FHIR por ejecución;
- aclarar que la selección depende de `FHIR_BASE_URL` o del script que lo fija.

### 6.4 Si conviene mostrar el entorno activo en `/admin`

Sí, conviene. No hace falta mostrar un banner agresivo, pero sí una señal discreta y útil:

- “Entorno clínico: dev/test” o “Entorno clínico: local-real”;
- el texto debería venir de la misma configuración que define el endpoint.

### 6.5 Si conviene validar entorno en server-side

Sí, pero de forma simple. La validación podría ser una advertencia o un mensaje operacional cuando el entorno activo no coincide con la intención declarada, sin bloquear la app ni introducir una lógica compleja.

### 6.6 Qué no conviene hacer todavía

- no introducir mock mode;
- no introducir auth;
- no introducir Docker nuevo;
- no exponer `FHIR_BASE_URL` como variable pública;
- no presentar `/admin` como demo pública ni como plataforma SaaS.

## 7. Plan de implementación por patches

### Patch 1 — documentación y scripts seguros

- archivos a tocar:
  - [README.md](../../README.md)
  - [AGENTS.md](../../AGENTS.md)
  - [docs/fuente-de-verdad-operativa.md](../../docs/fuente-de-verdad-operativa.md)
  - [docs/fhir/README.md](../../docs/fhir/README.md)
  - [package.json](../../package.json)
- objetivo:
  - dejar explicita la diferencia entre `8081` y `8080`;
  - documentar la regla de que un solo entorno está activo por ejecución;
  - mejorar los nombres de los scripts sin cambiar el modelo base.
- riesgo:
  - bajo.
- validación esperada:
  - lint/test/build sin cambios funcionales relevantes.

### Patch 2 — indicador operativo en `/admin`

- archivos a tocar:
  - [src/app/admin/layout.tsx](../../src/app/admin/layout.tsx)
  - posiblemente un helper de configuración compartido en [src/lib/fhir/config.ts](../../src/lib/fhir/config.ts)
- objetivo:
  - mostrar de forma visible el entorno activo (`dev/test` o `local-real`) en la interfaz privada.
- riesgo:
  - bajo.
- validación esperada:
  - render correcto del banner o chip en `/admin` y no romper el layout.

### Patch 3 — validaciones o hardening adicional

- archivos a tocar:
  - [src/lib/fhir/config.ts](../../src/lib/fhir/config.ts)
  - [src/lib/fhir/errors.ts](../../src/lib/fhir/errors.ts)
  - posibles pruebas de integración/admin
- objetivo:
  - hacer más explícito el estado del endpoint y reducir el riesgo de usar el entorno incorrecto.
- riesgo:
  - medio, pero controlable.
- validación esperada:
  - tests y build sin regresiones; mensajes claros en caso de configuración o fallo de conexión.

## 8. Comandos ejecutados

- `npm run lint` → éxito; `next lint` reportó que no hay warnings ni errors.
- `npm run test` → éxito; 97 archivos y 649 tests pasaron.
- `FHIR_BASE_URL=http://localhost:8081/fhir npm run build` → éxito; se generaron las rutas públicas y privadas.
- `env -u FHIR_BASE_URL npm run build` → éxito; el build siguió funcionando porque no se evaluó el cliente FHIR durante la compilación, aunque el runtime de `/admin` dependería de la configuración efectiva.

## 9. Conclusión

Conviene pasar a un primer patch de documentación y señalización, no a un cambio funcional complejo. El primer patch más seguro es el de documentación y scripts claros, seguido de un pequeño indicador visible en `/admin` para que sea evidente contra qué entorno FHIR está operando la instancia local.

La decisión más importante no es cambiar la arquitectura de FHIR, sino hacerla explícita, consistente y difícil de malinterpretar para quien trabaje en el proyecto.
