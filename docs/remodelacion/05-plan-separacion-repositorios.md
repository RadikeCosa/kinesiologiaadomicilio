# Plan de separación de la landing y la aplicación privada

> Estado: etapa 1 completada; núcleo clínico y piloto online implementados; acceso con passkeys implementado, pendiente de prueba real en dispositivos
> Actualizado: 2026-09-14
> Alcance: definir el corte, el orden de migración y las condiciones de seguridad. Este documento no implica que los repositorios ya estén separados.

## 1. Decisión ejecutiva

Quedan definidos dos repositorios independientes:

1. **`kinesiologiaadomicilio`**: sitio público con presencia profesional, servicios, orientación inicial, SEO, analytics y contacto por WhatsApp. Durante la transición conserva también el admin legado.
2. **`kinesiologia-clinica`**: aplicación privada para organización de pacientes activos, tratamientos, registro de visitas, seguimiento longitudinal e informes.

El segundo repositorio ya existe:

- copia local: `/home/ramiro/dev/kinesiologia-clinica`;
- remoto privado: `github.com/RadikeCosa/kinesiologia-clinica`;
- rama inicial: `main`;
- fundación publicada: commit `2767e79`;
- primer bloque del adaptador FHIR publicado: commit `c5dd186`, con lectura server-side de pacientes activos a partir de `Patient` y `EpisodeOfCare`.

La aplicación privada se construirá desde cero. Del proyecto actual se reutilizarán contratos de dominio, conocimiento FHIR, mappers, repositorios y pruebas que sigan siendo válidos; no se trasladará el frontend de `/admin` como base visual.

No se creará un paquete compartido en esta etapa. Si ambos productos necesitan una misma pieza en el futuro, primero se tolerará una duplicación pequeña y explícita. Solo se extraerá una dependencia común cuando el contrato sea estable y exista un costo real de mantenerla duplicada.

## 2. Estrategia de transición

Este repositorio seguirá siendo temporalmente la aplicación combinada y el `/admin` actual continuará operativo mientras se construye su reemplazo.

El primer movimiento será crear un repositorio nuevo para la aplicación privada. El repositorio actual conservará la landing y el admin legado durante la transición. `/admin` se retirará de aquí únicamente cuando el nuevo producto haya alcanzado la paridad mínima, se haya validado contra una copia segura de datos y exista un camino de reversión.

Esta secuencia evita dos riesgos:

- interrumpir la operación clínica por una extracción prematura;
- convertir el código actual de `/admin` en la estructura obligatoria del nuevo frontend.

## 3. Frontera del repositorio público

### Responsabilidades

- rutas `/`, `/services` y `/evaluar`;
- contenido institucional y de servicios;
- SEO, metadata, `robots` y `sitemap`;
- GA4 exclusivamente en la superficie pública;
- llamados a la acción y mensajes precompletados para WhatsApp;
- activos visuales públicos.

### Código que pertenece al producto público

- `src/app/(public)/`
- `src/app/home/`
- `src/app/hero/`
- `src/components/Header.tsx`
- `src/components/Footer.tsx`
- `src/components/PhoneLink.tsx`
- `src/components/ScrollDepthTracker.tsx`
- `src/components/WhatsAppButton.tsx`
- `src/components/WhatsAppIcon.tsx`
- `src/lib/analytics.ts`
- `src/lib/config.ts`
- `src/lib/navLinks.ts`
- `src/lib/servicesData.ts`
- `src/lib/whatsapp-messages.ts`
- `src/app/robots.ts`
- `src/app/sitemap.ts`
- `public/`
- las pruebas asociadas a esos módulos.

`src/app/layout.tsx`, `src/app/globals.css` y `src/components/ui/` son piezas técnicas mixtas. Al finalizar la separación, el repositorio público conservará solo lo que sus rutas realmente utilicen.

### Lo que no debe quedar en el producto público

- rutas o acciones de `/admin`;
- modelos clínicos;
- cliente, configuración, repositorios o mappers FHIR;
- variables o documentación del entorno clínico;
- generación de informes clínicos;
- autenticación de la aplicación privada;
- almacenamiento offline de información clínica.

## 4. Frontera del repositorio privado

### Responsabilidades

- identidad profesional y acceso privado;
- dispositivos confiables y revocación;
- pacientes activos y prioridades operativas;
- solicitudes de atención y tratamientos;
- registro de visitas en vivo o retrospectivas;
- PWA, borradores offline y sincronización idempotente;
- seguimiento longitudinal;
- resumen de visita para compartir;
- informe de período en PDF;
- integración server-side con HAPI FHIR.

### Código actual que se evaluará para reutilización

Se migra por contrato y prueba, no por carpeta completa:

- `src/domain/`: reglas, esquemas y tipos que representen el dominio acordado;
- `src/infrastructure/mappers/`: traducciones FHIR todavía compatibles;
- `src/infrastructure/repositories/`: operaciones útiles, después de desacoplarlas de configuración global cuando corresponda;
- `src/lib/fhir/`: cliente y utilidades, revisados detrás de una interfaz de aplicación;
- `src/features/`: composición y read models válidos, eliminando dependencias hacia archivos de rutas;
- pruebas unitarias y de integración que expresen contratos vigentes.

Las rutas, layouts, componentes y formularios actuales de `src/app/admin/` funcionan como evidencia del comportamiento existente. No son la base del nuevo frontend. Sus acciones y loaders pueden aportar casos de uso o criterios de aceptación, pero deben reubicarse detrás de límites propios de la aplicación.

### Dependencias que deben resolverse antes de copiar

- `features/treatment-report` no debe depender de módulos ubicados bajo `src/app/admin`;
- los repositorios no deben depender de un cliente FHIR global difícil de sustituir en pruebas o sincronización;
- los modelos de paciente no deben importar helpers de presentación administrativa;
- los estados clínicos y los estados de sincronización deben ser conceptos distintos;
- la UI no debe recibir recursos FHIR crudos ni conocer `FHIR_BASE_URL`.

## 5. Orden de ejecución

### Etapa 0 — Punto de control

- revisar y guardar los cambios actuales del repositorio;
- registrar el commit exacto del baseline;
- confirmar el nombre y la ubicación del nuevo repositorio privado;
- confirmar que no haya datos reales en fixtures, capturas o ejemplos;
- respaldar el entorno FHIR real antes de cualquier prueba de compatibilidad.

### Etapa 1 — Crear el esqueleto privado

**Estado: completada el 2026-09-11.**

- iniciar un repositorio vacío con TypeScript, pruebas y chequeos mínimos;
- establecer capas de UI, aplicación, dominio e infraestructura;
- configurar entornos separados para desarrollo, demo y uso real;
- documentar desde el inicio que HAPI FHIR solo es accesible desde el servidor.

No se elimina ni modifica `/admin` en esta etapa.

### Etapa 2 — Recuperar el núcleo reutilizable (en curso)

- portar primero reglas y esquemas de dominio con sus pruebas;
- portar mappers y contratos FHIR con pruebas de compatibilidad;
- portar repositorios detrás de interfaces explícitas;
- corregir los acoplamientos detectados antes de incorporar casos de uso;
- contrastar lectura y escritura contra el endpoint descartable de HAPI FHIR.

El objetivo no es copiar todo, sino conservar conocimiento probado sin arrastrar la estructura del frontend anterior.

Primer bloque completado:

- cliente FHIR inyectable, paginación y errores sanitizados;
- contratos, mappers y repositorios de `Patient` y `EpisodeOfCare`;
- caso de uso propio para listar pacientes activos;
- pruebas unitarias y prueba de integración contra el HAPI descartable de `8081` con datos ficticios.

Antes de retirar `/admin` todavía faltan, como mínimo, el contexto clínico asociado al tratamiento, la lectura y escritura de `Encounter`, las observaciones necesarias y la confirmación de una visita mediante relectura desde HAPI FHIR.

### Etapa 3 — Primer corte vertical

Construir una única experiencia completa:

```text
Ingresar
  -> ver pacientes activos
  -> abrir contexto mínimo de un paciente
  -> iniciar o cargar una visita
  -> registrar entrada, salida y contenido clínico mínimo
  -> confirmar en HAPI FHIR
  -> volver a leer la visita confirmada
```

La primera versión de este corte puede requerir conexión. Su finalidad es validar límites de dominio, aplicación y FHIR antes de sumar sincronización offline.

### Etapa 4 — Offline y PWA

- instalar la PWA en el teléfono;
- guardar contexto mínimo de pacientes activos;
- conservar borradores sin conexión;
- implementar identificadores de cliente e idempotencia;
- mostrar estados local, pendiente, confirmado, fallido y en conflicto;
- verificar pérdida y recuperación de conexión sin duplicar visitas.

### Etapa 5 — Seguimiento e informes

- construir cronología y lectura longitudinal;
- derivar el resumen de visita para revisar y compartir;
- generar informes de evolución o cierre;
- producir PDF con membrete y firma;
- persistir versiones finales inmutables en `DocumentReference`.

### Etapa 6 — Corte definitivo

- ejecutar pruebas de regresión y compatibilidad;
- validar el flujo real desde teléfono y computadora;
- comprobar backup y recuperación;
- pasar la operación al nuevo producto privado;
- retirar `/admin` y las dependencias clínicas del repositorio público;
- simplificar configuración, dependencias, documentación y CI del sitio público.

## 6. Condiciones para retirar `/admin`

El corte final requiere, como mínimo:

- acceso privado funcional desde los dispositivos autorizados;
- listado y contexto de pacientes activos;
- alta, edición, lectura y sincronización confiable de visitas;
- registro retrospectivo;
- lectura compatible de pacientes, tratamientos, visitas y métricas existentes;
- ausencia de escrituras duplicadas ante reintentos;
- indicación inequívoca del estado de sincronización;
- generación utilizable de los dos tipos de reporte acordados;
- backup reciente y procedimiento de reversión probado;
- validación con datos ficticios antes de tocar el entorno real.

Hasta cumplir estas condiciones, el admin actual es el respaldo operativo y no debe eliminarse.

## 7. Hitos ejecutados

El repositorio privado y su esqueleto técnico ya fueron creados. No se borró `/admin`, no se movieron carpetas masivamente y no se trasladó su diseño.

El primer hito terminó con:

- el repositorio privado ejecutándose de forma independiente;
- una estructura de capas documentada;
- un contrato mínimo de salud pasando sus pruebas;
- un chequeo server-side de disponibilidad de HAPI FHIR;
- ninguna dependencia de la nueva UI respecto del frontend de `/admin` actual.

Validación del hito:

- lint sin errores ni advertencias;
- 3 pruebas unitarias pasando;
- build de producción correcto;
- auditoría npm con 0 vulnerabilidades conocidas;
- endpoint de salud verificado sin revelar `FHIR_BASE_URL`.

La etapa 2 comenzó con el bloque publicado en `c5dd186`. Después se añadieron un diagnóstico no clínico de compatibilidad WebAuthn (`c457f50`) y una lista local de pacientes activos, de solo lectura y limitada al HAPI descartable de `8081` (`010de3f`). En el trabajo posterior a ese commit se implementó un piloto local de ficha, contexto de tratamiento y visitas online con datos ficticios. El acceso con passkeys ya está implementado, pendiente de validar con credenciales reales en teléfono y computadora. Todavía no hay borradores offline, PWA ni informes en la aplicación nueva.

El contrato de visita finalizada ya escribe `Encounter` y una métrica opcional en `Observation` con identidades estables, y confirma mediante relectura. El siguiente tramo es validar el flujo interactivo desde el teléfono, resolver acceso y sesiones, y luego construir borradores y sincronización. La autenticación deberá proteger toda superficie clínica antes de incorporar datos reales o ampliar el acceso. No se reutilizará el frontend de `/admin` como base visual.

### Punto de control del 2026-09-14

- Repositorio combinado: `main` en `982b497`, limpio y sincronizado; lint y 774 pruebas aprobadas.
- Repositorio privado al iniciar: `main` en `010de3f`, limpio y sincronizado; lint y 23 pruebas unitarias aprobadas. El trabajo del piloto posterior todavía no constituye un corte operativo.
- Contratos migrados: lectura server-side de `Patient` y `EpisodeOfCare` activos, cliente FHIR inyectable, paginación, errores sanitizados, contexto de tratamiento y `Condition`, lectura y escritura de `Encounter`, `Observation` opcional y reintento con identidad estable.
- Prueba del piloto: contrato contra HAPI `8081` crea una visita ficticia, reintenta sin duplicarla y relee visita y métrica. Lint, pruebas unitarias y build del repositorio privado aprobados.
- Pendiente para aceptar la etapa 3: recorrido interactivo desde teléfono y comprobación de ergonomía con datos ficticios; no usar datos reales. El diagnóstico de compatibilidad WebAuthn ya funcionó en Chrome de Ubuntu y Android según el profesional.
- Acceso: una cuenta provisionada con passkeys, sesiones por dispositivo, revocación y recuperación implementadas en el repositorio privado. Pruebas automatizadas y bloqueo de rutas sin sesión aprobados; falta probar el ciclo real de registro, ingreso, revocación y recuperación en ambos dispositivos.
- HAPI descartable de `8081`: contenedores en ejecución y `GET /fhir/metadata` responde HTTP 200. El entorno real de `8080` no se utilizó.

## 8. Decisiones menores pendientes

Estas decisiones no bloquean la preparación, pero deben cerrarse al iniciar el nuevo repositorio:

- mecanismo concreto de autenticación y recuperación;
- librería de persistencia local cifrada o protegida;
- estrategia PWA y service worker;
- herramienta de generación de PDF;
- URL privada y certificados que proveerá el proyecto Casa.

No está pendiente la decisión principal: la landing y la aplicación privada serán dos productos y dos repositorios.
