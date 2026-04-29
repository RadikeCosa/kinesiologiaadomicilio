# Auditoría UX/UI + Producto — Flujo privado de Solicitudes de Atención

Fecha: 2026-04-29 (UTC)
Estado: auditoría (sin implementación)

## A. Executive summary

- El flujo técnico SR→Treatment está bien separado y consistente con los guardrails (no se inicia tratamiento desde `/administrative`; el inicio real ocurre en `/treatment`).
- La principal fricción no es lógica, sino de **descubribilidad y densidad**: para usuarios que recién dan de alta paciente, crear solicitud no queda en el camino más corto mental.
- El formulario de creación de solicitud está funcional pero **sobredimensionado para uso inicial**: mezcla campos core y secundarios sin progresive disclosure.
- `requesterType` + `requesterDisplay` + `requesterContact` tienen semántica válida, pero el lenguaje visible aún obliga a interpretación operativa adicional.
- Recomendación incremental: mantener arquitectura y reglas actuales, y aplicar pulido UX/UI en 1-2 iteraciones de bajo riesgo.

## B. Flows inspected

Se auditó el journey completo en estas superficies:
1. Alta de paciente en `/admin/patients/new`.
2. Redirección al hub `/admin/patients/[id]`.
3. Navegación a `/admin/patients/[id]/administrative`.
4. Apertura de “Nueva solicitud” y carga de `ServiceRequestCreateForm`.
5. Resolución administrativa (`Aceptar`, `No inició`, `Cancelar`) en `ServiceRequestStatusActions`.
6. Derivación de solicitud aceptada a `/admin/patients/[id]/treatment?serviceRequestId=...` e inicio de tratamiento desde esa superficie.

## C. Current user journey

### C.1 Alta de paciente → solicitud
- Usuario crea paciente en `/admin/patients/new`.
- Tras éxito, el sistema redirige al hub `/admin/patients/[id]`.
- En el hub debe elegir `Gestión Administrativa`.
- En administrativa debe ubicar “Solicitudes de atención” y hacer clic en `Nueva solicitud`.
- Recién ahí puede completar formulario y registrar.

### C.2 Paciente existente → solicitud
- Desde `/admin/patients` entra al detalle `/admin/patients/[id]`.
- Desde hub entra a `Gestión Administrativa`.
- En administrativa abre `Nueva solicitud`.

### C.3 Solicitud aceptada → tratamiento
- En la card de solicitud aceptada aparece CTA `Iniciar tratamiento`.
- Este CTA navega a `/treatment` con contexto SR.
- El inicio real ocurre con `StartEpisodeOfCareForm` en `/treatment`.

## D. Main UX frictions

1. **Click-depth elevado para intención frecuente**
   - Crear solicitud post-alta requiere cambios de pantalla y decisión intermedia.
2. **CTA primaria post-alta ausente para siguiente paso natural**
   - El hub no sugiere explícitamente “Crear solicitud” cuando todavía no hay solicitudes.
3. **Formulario largo para primera carga operativa**
   - Si el uso real suele iniciar con “fecha + motivo + quién consulta”, el resto compite visualmente.
4. **Modelo mental de solicitante fragmentado**
   - “Tipo de solicitante” y “Quién solicita” aparecen separados sin microcopy puente.
5. **Jerarquía de acciones en card SR mejorable**
   - `Iniciar tratamiento` (cuando accepted) convive con bloque de acciones de estado sin diferenciación fuerte de “siguiente paso clínico”.
6. **Copy de estados podría distinguir mejor etapas**
   - En operación diaria puede confundirse “Aceptada” con “Tratamiento iniciado”.

## E. Form field audit

## E.1 Campos observados
- Obligatorios: `requestedAt`, `reasonText`.
- Opcionales visibles por defecto: `requesterType`, `reportedDiagnosisText`, `requesterDisplay`, `requesterContact`, `notes`.

## E.2 Evaluación
- Orden actual: fecha/tipo → motivo → diagnóstico/quién solicita → contacto/notas.
- Fortalezas:
  - mínimos obligatorios correctos para no bloquear operación;
  - opciones de requesterType ya cercanas al lenguaje esperado.
- Fricciones:
  - no hay agrupación explícita “Quién consulta” (bloque semántico);
  - `requesterType` y `requesterDisplay` pueden percibirse redundantes;
  - `notes` compite de entrada pese a ser secundario.

## E.3 Recomendación UX de formulario
- Versión corta por defecto (core):
  1) Fecha de solicitud,
  2) Motivo de consulta,
  3) Quién consulta (tipo + nombre opcional).
- Versión expandida bajo “Más detalles”:
  - diagnóstico informado,
  - contacto del solicitante,
  - notas internas.

## F. Navigation / click-depth audit

## F.1 Desde alta de paciente
Ruta actual típica:
1. Crear paciente (submit),
2. Llegar al hub,
3. Clic en `Gestión Administrativa`,
4. Clic en `Nueva solicitud`,
5. Completar y registrar.

=> 2 clics de navegación + 1 clic de apertura previo al formulario (además del submit final).

## F.2 Desde paciente existente
Ruta actual típica:
1. Abrir paciente en hub,
2. Clic en `Gestión Administrativa`,
3. Clic en `Nueva solicitud`.

=> 2 clics para llegar al formulario.

## F.3 Hallazgo
- La acción existe y es consistente, pero no está en el “camino de menor sorpresa” tras alta.

## G. Suggested hierarchy changes

1. Mantener dos bloques (`Resumen administrativo` y `Solicitudes`) pero subir prominencia de solicitudes cuando no existen.
2. En empty state de SR, sumar CTA dominante y copy orientado a siguiente paso (“Registrar primera solicitud”).
3. En cards SR:
   - fila superior: estado + fecha;
   - cuerpo: motivo;
   - secundarios colapsables: diagnóstico/solicitante/contacto/notas;
   - pie de acciones: distinguir acción administrativa vs clínica.
4. Para `accepted`, destacar `Iniciar tratamiento` como CTA de continuación, con helper claro de que abre `/treatment`.

## H. Patient creation → ServiceRequest recommendation

Evaluación de opciones:
- **A (hub + CTA Crear solicitud)**: mejor equilibrio incremental, bajo riesgo, consistente con arquitectura actual.
- B (redirigir directo a administrativa + formulario abierto): reduce fricción pero cambia comportamiento base y puede desorientar si el operador necesita completar datos antes.
- C (checkbox en alta): útil pero agrega complejidad al alta mínima.
- D (wizard): alto costo y fuera de etapa.

**Recomendación:** ejecutar **Opción A** ahora, con microcopy/CTA contextual en hub post-alta y/o cuando paciente no tenga solicitudes.

## I. Copy recommendations

1. Reemplazar título de bloque semántico por **“Quién consulta”** (visible en formulario), manteniendo mapping interno actual.
2. En estados:
   - `Aceptada` + helper: “Aún no inicia tratamiento”.
   - `No inició`: agregar subtítulo “Solicitud cerrada sin iniciar tratamiento”.
3. En acciones:
   - `Iniciar tratamiento` + helper breve “Se realiza en la pantalla de Tratamiento”.
4. Motivo de cierre/cancelación:
   - mantener obligatorio;
   - exponer con label humano (“Motivo registrado”).
5. Evitar visibilidad de términos técnicos (`ServiceRequest`) en copy UI de operación.

## J. Proposed polish patch (sin tocar arquitectura)

## Must have
1. CTA contextual “Crear solicitud de atención” en hub `/admin/patients/[id]` cuando no hay solicitudes o no hay tratamiento activo.
2. Reordenar formulario a versión corta por defecto + “Más detalles”.
3. Agrupar campos de solicitante bajo encabezado “Quién consulta”.
4. Mejorar copy de estado accepted vs tratamiento iniciado.

## Should have
1. Estado vacío SR más directivo con CTA principal.
2. Jerarquía visual en cards SR (motivo primero, secundarios luego).
3. Helper persistente en `/administrative`: “Iniciar tratamiento se realiza en Tratamiento”.

## Nice to have
1. Acceso directo a “Nueva solicitud” desde listado de pacientes (acción secundaria por fila o menú).
2. Shortcut en dashboard `/admin` para “Pacientes sin solicitud reciente”.
3. Prefill opcional de “Quién consulta = Paciente” si no se informa otra persona.

## K. Explicit non-scope

- No cambiar lógica FHIR/mappers/repositorios.
- No cambiar política single-use SR.
- No cambiar derivación de `PatientOperationalStatus`.
- No cambiar reglas clínicas de `/treatment` ni gating de visitas por `EpisodeOfCare`.
- No tocar `/encounters` salvo copy de navegación contextual en futuras iteraciones.
- No implementar wizard completo en esta etapa.

## L. Final recommendation

Implementar un **UX polish incremental en 2 tandas**:
1) Descubribilidad y navegación (CTA hub + empty state + jerarquía CTA),
2) Simplificación de formulario (core + “Más detalles”) y copy de estados.

Con esto se reduce fricción sin riesgo de regresión clínica ni cambios de arquitectura.
