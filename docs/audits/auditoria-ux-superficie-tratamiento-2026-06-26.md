# Auditoría UX/UI de `/admin/patients/[id]/treatment`

## 1. Resumen ejecutivo

- Estado general: funcionalmente coherente con el contrato del producto, pero con deuda clara de jerarquía de acciones y navegación contextual.
- Hallazgo principal confirmado: en el estado con tratamiento activo, la pantalla muestra dos CTAs distintas que llevan al mismo destino `/admin/patients/[id]/encounters`: `Ver / registrar visitas del ciclo` y `Ir a gestión clínica`.
- Riesgo principal: la duplicación debilita la jerarquía visual, hace parecer que existen dos acciones diferentes y vuelve menos claro cuál es la acción estructural de la superficie y cuál es la acción operativa prioritaria.
- Recomendación principal: mantener la separación actual de responsabilidades entre `administrative`, `treatment` y `encounters`, pero redefinir la jerarquía visible de `/treatment` para que:
  - la acción primaria dependa del estado del tratamiento;
  - la navegación estructural no compita con la acción primaria;
  - el contexto clínico longitudinal se presente como el núcleo de la pantalla cuando hay tratamiento activo;
  - el estado sin tratamiento activo explique de forma más directa que no se pueden registrar visitas hasta iniciar un tratamiento.

## 2. Convención y alcance

- Ubicación del documento: `docs/archive/audits/`.
- Motivo: `docs/product/` hoy queda reservado para documentación activa de producto; las auditorías versionadas o históricas se archivan en `docs/archive/`.

### Hallazgos confirmados en código

- Se basan en rutas, componentes, loaders, actions y tests existentes.

### Inferencias UX

- Son lecturas de claridad, jerarquía y riesgo de confusión a partir de la UI actual.

### Recomendaciones

- No implican cambio implementado todavía.

### Fuera de alcance

- No se proponen cambios en FHIR, repositorios, mappers, schemas, contratos persistidos ni separación entre superficies.

## 3. Fuentes revisadas

- `README.md`
- `AGENTS.md`
- `docs/fuente-de-verdad-operativa.md`
- `docs/arquitectura-objetivo-app-clinica.md`
- `docs/product/solicitud-atencion-flujo-inicial.md`
- `docs/checklist-sincronizacion-doc-codigo.md`
- `docs/product/README.md`
- `docs/archive/README.md`
- `src/app/admin/patients/[id]/treatment/page.tsx`
- `src/app/admin/patients/[id]/page.tsx`
- `src/app/admin/patients/[id]/administrative/page.tsx`
- `src/app/admin/patients/[id]/encounters/page.tsx`
- `src/app/admin/patients/[id]/encounters/new/page.tsx`
- `src/app/admin/patients/page.tsx`
- `src/app/admin/patients/[id]/data.ts`
- `src/app/admin/patients/[id]/clinical-context.ts`
- `src/app/admin/patients/[id]/patient-surface-copy.ts`
- `src/app/admin/patients/[id]/components/TreatmentClinicalContextForm.tsx`
- `src/app/admin/patients/[id]/components/StartEpisodeOfCareForm.tsx`
- `src/app/admin/patients/[id]/components/FinishEpisodeOfCareForm.tsx`
- `src/app/admin/patients/[id]/administrative/components/PatientServiceRequestsSection.tsx`
- `src/app/admin/patients/[id]/administrative/components/ServiceRequestStatusActions.tsx`
- `src/app/admin/patients/[id]/encounters/components/ClinicalCycleContextCard.tsx`
- tests de `page.tsx` en `treatment`, `administrative`, `encounters` y `hub`

## 4. Mapa de archivos involucrados

| tipo | archivo | rol en `/treatment` |
|---|---|---|
| ruta | `src/app/admin/patients/[id]/treatment/page.tsx` | compone la pantalla, define CTAs, estados y bloques visibles |
| loader | `src/app/admin/patients/[id]/data.ts` | carga detalle de paciente, contexto de solicitud para iniciar tratamiento e historial de ciclos |
| read model | `src/features/patients/read-models/patient-detail.read-model.ts` | shape base del paciente consumido por la ruta |
| read model auxiliar | `src/app/admin/patients/[id]/clinical-context.ts` | arma el contexto clínico longitudinal del ciclo activo |
| copy compartida | `src/app/admin/patients/[id]/patient-surface-copy.ts` | define copy base de tratamiento y gestión clínica |
| componente | `src/app/admin/patients/[id]/components/TreatmentClinicalContextForm.tsx` | edición campo por campo del contexto clínico longitudinal |
| componente | `src/app/admin/patients/[id]/components/StartEpisodeOfCareForm.tsx` | inicio manual de tratamiento desde solicitud aceptada válida |
| componente | `src/app/admin/patients/[id]/components/FinishEpisodeOfCareForm.tsx` | cierre del tratamiento activo |
| action | `src/app/admin/patients/[id]/actions/update-treatment-clinical-context-field.action.ts` | guarda cada campo clínico y revalida `treatment` y `encounters` |
| action | `src/app/admin/patients/[id]/actions/start-episode-of-care.action.ts` | valida e inicia `EpisodeOfCare` |
| action | `src/app/admin/patients/[id]/actions/finish-episode-of-care.action.ts` | valida y cierra `EpisodeOfCare` activo |
| superficie entrante | `src/app/admin/patients/[id]/page.tsx` | hub del paciente con CTA estructural a `Tratamiento` |
| superficie entrante | `src/app/admin/patients/[id]/administrative/page.tsx` | referencia a `Tratamiento` y CTA de iniciar tratamiento desde solicitudes |
| superficie relacionada | `src/app/admin/patients/[id]/encounters/page.tsx` | consume contexto longitudinal en modo lectura y deriva a `treatment` cuando no hay tratamiento activo |
| superficie relacionada | `src/app/admin/patients/[id]/encounters/new/page.tsx` | bloquea registro sin tratamiento activo y deriva a `treatment` |

## 5. Accesos hacia `/admin/patients/[id]/treatment`

### Confirmado en código

- Desde `/admin/patients/[id]`
  - CTA estructural: `Tratamiento` -> `/admin/patients/[id]/treatment`
- Desde `/admin/patients`
  - No hay CTA directa a `/treatment`
  - Se llega primero al hub del paciente
- Desde `/admin/patients/[id]/administrative`
  - link contextual en texto: `Tratamiento`
  - CTA desde solicitud aceptada pendiente: `Iniciar tratamiento` -> `/admin/patients/[id]/treatment?serviceRequestId=...`
  - redirect luego de `Aceptar e iniciar tratamiento`: `/admin/patients/[id]/treatment?status=treatment-started`
- Desde `/admin/patients/[id]/encounters`
  - CTA de recuperación cuando no hay tratamiento activo: `Ir a gestión de tratamiento` -> `/admin/patients/[id]/treatment`
- Desde `/admin/patients/[id]/encounters/new`
  - CTA de bloqueo cuando no hay tratamiento activo: `Ir a gestión de tratamiento` -> `/admin/patients/[id]/treatment`

### Lectura UX

- La entrada a `/treatment` está bien alineada con la responsabilidad de la superficie.
- El único acceso verdaderamente operativo y específico es el que nace desde una solicitud aceptada en `administrative`.
- `/admin/patients` hoy no usa `treatment` como atajo directo, lo cual es consistente con el rol del listado.

## 6. Estado actual de la pantalla

### Confirmado en código

- Título visible: `Tratamiento · Marco clínico del ciclo`
- Subcopy actual: `Definí aquí el marco clínico longitudinal del ciclo activo. La evolución de cada visita se registra en Gestión clínica (Visitas).`
- Cuando hay tratamiento activo:
  - se muestra `TreatmentClinicalContextForm`
  - se muestra badge de estado
  - se muestra CTA primario `Ver / registrar visitas del ciclo` -> `/encounters`
  - se muestra CTA secundario `Ir a gestión clínica` -> `/encounters`
  - se muestra bloque `Tratamiento activo`
  - se muestra cierre dentro de `details`: `Cerrar ciclo de tratamiento (acción final)`
- Cuando no hay tratamiento activo y no hay ciclos previos:
  - se muestra `No hay tratamientos registrados`
  - se muestra `Iniciá un tratamiento desde una solicitud aceptada.`
  - se muestra CTA `Ir a solicitudes`
- Cuando no hay tratamiento activo y sí hay ciclos cerrados:
  - se muestra `No hay tratamiento activo`
  - se sugiere registrar una nueva solicitud para continuar la atención
  - se muestra CTA `Ver historial de solicitudes`
  - se muestra resumen del último tratamiento finalizado
  - se muestra historial compacto de ciclos cerrados
- El inicio de tratamiento solo se habilita si `serviceRequestId` es válido y aceptado.

### Inferencia UX

- La pantalla mezcla tres modos de uso distintos:
  - iniciar tratamiento;
  - editar marco clínico del ciclo activo;
  - revisar cierre e historial.
- Esa mezcla es lógica desde el modelo operativo, pero hoy la UI no siempre deja claro cuál de esos modos es el dominante según el estado.

## 7. Problemas UX/UI detectados

### Hallazgos confirmados

- Duplicación de destino en estado activo:
  - `Ver / registrar visitas del ciclo` apunta a `/encounters`
  - `Ir a gestión clínica` también apunta a `/encounters`
- Un botón estructural compite con un botón primario:
  - el CTA aparentemente operativo y el CTA aparentemente estructural llevan al mismo lugar
- La jerarquía de cierre queda escondida dentro de un `details`
  - reduce prominencia, pero también puede ocultar una acción estructural importante al final del ciclo
- El bloque `Tratamiento activo` aporta poco contexto propio
  - solo muestra fecha de inicio
  - el verdadero contenido central queda absorbido por el formulario de contexto clínico
- El historial se presenta después de varias capas de contenido, sin una separación visual especialmente fuerte entre:
  - ciclo activo;
  - resumen del último ciclo finalizado;
  - historial de ciclos cerrados

### Inferencias UX

- La duplicación de `/encounters` hace pensar que:
  - una acción sirve para ver;
  - otra para registrar;
  - o que existen dos vistas clínicas diferentes.
- El título `Tratamiento · Marco clínico del ciclo` combina dos conceptos en la cabecera:
  - superficie de producto;
  - subtarea de edición.
  Eso vuelve menos nítido si la pantalla es principalmente de gestión del tratamiento o principalmente de documentación longitudinal.
- El cierre del tratamiento aparece como acción final, pero su ubicación colapsada no ayuda a entenderlo como paso formal de cierre de ciclo.

## 8. Problemas de wording detectados

### Confirmados

- `Marco clínico del ciclo`
  - es correcto internamente, pero no es la formulación más directa para un profesional que piensa en términos operativos cotidianos
- `Ver / registrar visitas del ciclo`
  - mezcla dos verbos y sugiere una superficie híbrida
- `Ir a gestión clínica`
  - es abstracto y compite con el CTA anterior
- `No hay tratamientos registrados`
  - comunica ausencia histórica, pero no explica explícitamente la consecuencia operativa sobre visitas
- `No hay tratamiento activo`
  - correcto como estado, pero insuficiente como guía
- `Plan marco del tratamiento`
  - es entendible, aunque algo técnico y menos natural que `plan general del tratamiento`
- `Diagnóstico médico de referencia`
  - es preciso, pero puede sonar documental antes que operativo

### Lenguaje técnico filtrándose a UI

- Confirmado:
  - `EpisodeOfCare` no aparece crudo en la UI principal, lo cual está bien.
- Parcialmente técnico o demasiado interno:
  - `ciclo`
  - `marco clínico`
  - `contexto clínico del ciclo`
- Lectura:
  - no es jerga FHIR, pero sí lenguaje de modelado interno más que lenguaje de producto orientado al profesional.

## 9. Riesgos de confusión para el usuario

- Riesgo 1: interpretar que `Ver / registrar visitas del ciclo` y `Ir a gestión clínica` abren pantallas distintas.
- Riesgo 2: no distinguir entre:
  - iniciar tratamiento;
  - completar contexto longitudinal;
  - registrar visitas.
- Riesgo 3: asumir que si existe una solicitud aceptada ya se pueden registrar visitas.
- Riesgo 4: leer `No hay tratamientos registrados` como un problema histórico y no como un bloqueo operativo actual.
- Riesgo 5: no identificar rápidamente que el contexto longitudinal se completa en `/treatment` y la evolución puntual va en `/encounters`.
- Riesgo 6: percibir `cerrar ciclo de tratamiento` como una opción secundaria o avanzada por estar dentro de un acordeón.

## 10. Evaluación específica contra el objetivo pedido

### 10.1 CTAs duplicados, redundantes o confusos

- Confirmado: sí.
- Caso principal:
  - `Ver / registrar visitas del ciclo`
  - `Ir a gestión clínica`
  - ambos apuntan a `/admin/patients/[id]/encounters`

### 10.2 Botón estructural apuntando al mismo destino que otro botón primario

- Confirmado: sí.
- Ocurre en `/treatment` cuando existe `activeEpisode`.

### 10.3 Jerarquía visual actual

- Iniciar tratamiento
  - visible, pero subordinado a la presencia de `serviceRequestId`
  - correctamente gateado
- Ver estado del tratamiento
  - visible, aunque con poco desarrollo en el bloque `Tratamiento activo`
- Editar contexto clínico longitudinal
  - muy visible cuando hay tratamiento activo
- Ir a gestión clínica
  - visible, pero hoy compite con el CTA primario hacia el mismo destino
- Cerrar tratamiento
  - visible pero atenuado dentro de `details`
- Revisar historial
  - presente, aunque más cerca de un bloque de soporte que de una navegación claramente priorizada

### 10.4 Presentación actual del contexto clínico longitudinal

- Confirmado:
  - se presenta como formulario de cinco campos independientes
  - cada campo se edita por separado
  - cada campo muestra helper text específico
  - los diagnósticos se editan desde la misma superficie y se reflejan también en `/encounters`
- Lectura UX:
  - el contenido es razonable y clínicamente interpretable
  - la granularidad por campo ayuda
  - falta una envolvente más clara de “esto organiza el tratamiento, no la visita”

### 10.5 Claridad para un profesional que no piensa en FHIR

- Evaluación general: aceptable pero mejorable.
- A favor:
  - no se expone terminología FHIR cruda
  - se habla de visitas, tratamiento, solicitudes
- En contra:
  - algunos textos suenan más a estructura interna que a flujo operativo directo
  - la UI todavía exige inferir demasiado la diferencia entre superficie de tratamiento y superficie clínica

### 10.6 Estado vacío sin tratamiento activo

- Confirmado:
  - no explica de forma explícita que sin tratamiento activo no se pueden registrar visitas
- Evaluación:
  - cumple como estado administrativo/estructural
  - queda corto como instrucción operativa

### 10.7 Estado con tratamiento activo

- Confirmado:
  - sí guía a `/encounters`
  - pero lo hace dos veces hacia el mismo destino
- Evaluación:
  - la intención es correcta
  - la ejecución de la jerarquía no lo es

## 11. Propuesta de jerarquía de acciones

### Recomendación

- Estado sin tratamiento activo y sin solicitud aceptada válida:
  - CTA principal: `Ir a solicitudes de atención`
  - CTA secundario: ninguno clínico
- Estado sin tratamiento activo y con solicitud aceptada válida:
  - CTA principal: `Iniciar tratamiento`
  - CTA secundario: `Volver a solicitudes`
- Estado con tratamiento activo:
  - CTA principal: `Ir a gestión clínica`
  - CTA secundario: `Registrar visita`
  - alternativa válida:
    - CTA principal: `Registrar visita`
    - CTA secundario: `Ver gestión clínica`
  - recomendación preferida:
    - si la página `/encounters` sigue siendo el hub clínico del ciclo, conviene priorizar `Ir a gestión clínica` y dejar `Registrar visita` para esa superficie o como CTA secundario diferenciado
- Estado con tratamiento finalizado:
  - CTA principal: `Ver historial del tratamiento`
  - CTA secundario: `Ir a solicitudes de atención para iniciar un nuevo ciclo`

### Regla estructural propuesta

- En `/treatment` no deberían convivir dos botones hermanos que lleven al mismo `href`.
- La navegación estructural puede vivir como link de texto o CTA terciario, pero no competir con la acción operativa principal.

## 12. Propuesta de wording

### Estado sin tratamiento activo

- Recomendado:
  - `Todavía no hay un tratamiento activo.`
  - `Para registrar visitas primero necesitás iniciar un tratamiento desde una solicitud de atención aceptada.`

### Estado con tratamiento activo

- Recomendado:
  - `Hay un tratamiento activo en curso.`
  - `Completá acá el contexto general del tratamiento y usá Gestión clínica para registrar o revisar visitas.`

### Contexto clínico longitudinal

- Recomendado:
  - `Contexto general del tratamiento`
  - o `Marco general del tratamiento`
- Recomendación preferida:
  - `Contexto general del tratamiento`

### Diagnóstico médico de referencia

- Recomendado:
  - `Diagnóstico médico de referencia`
  - helper: `Dejá el diagnóstico con el que llega o fue derivado este tratamiento.`

### Diagnóstico kinésico

- Recomendado:
  - `Diagnóstico kinésico actual`
  - helper: `Describí el problema funcional que organiza este tratamiento.`

### Situación funcional inicial

- Recomendado:
  - `Situación funcional al inicio`
  - helper: `Describí cómo estaba la persona al comenzar este tratamiento.`

### Objetivos terapéuticos

- Recomendado:
  - `Objetivos del tratamiento`
  - helper: `Redactalos como metas observables o verificables del ciclo.`

### Plan marco

- Recomendado:
  - `Plan general del tratamiento`
  - helper: `Usalo para dejar la estrategia general, la frecuencia orientativa y los ejes de trabajo.`

### Cierre de tratamiento

- Recomendado:
  - `Cerrar tratamiento`
  - helper: `Usá esta acción cuando el ciclo ya terminó y querés dejar registrado el cierre formal.`

## 13. Recomendación de patch mínimo posterior

### Paso 1

- Resolver la duplicación de CTAs en `/treatment`.
- Mantener un solo CTA principal hacia `/encounters` cuando hay tratamiento activo.

### Paso 2

- Reescribir el estado vacío de `/treatment` para explicitar el gate:
  - sin tratamiento activo no se registran visitas
  - el paso previo es iniciar tratamiento desde solicitud aceptada

### Paso 3

- Ajustar cabecera y subtítulos de la pantalla para distinguir:
  - superficie `Tratamiento`
  - bloque `Contexto general del tratamiento`

### Paso 4

- Revisar naming puntual:
  - `Ver / registrar visitas del ciclo`
  - `Ir a gestión clínica`
  - `Plan marco del tratamiento`
  - `No hay tratamientos registrados`

### Paso 5

- Revaluar la presentación del cierre:
  - mantenerlo colapsado si se prioriza seguridad visual
  - o volverlo un bloque visible pero claramente secundario/destructivo

## 14. Tests recomendados si se implementa el patch

- Test de `/treatment` con tratamiento activo:
  - verificar que exista un solo CTA principal hacia `/encounters`
  - verificar que no haya dos botones hermanos con el mismo `href`
- Test de `/treatment` sin tratamiento activo:
  - verificar copy explícito sobre imposibilidad de registrar visitas
  - verificar CTA correcto hacia `administrative#service-requests`
- Test de `/treatment` con solicitud aceptada válida:
  - verificar que el bloque de inicio quede jerárquicamente por encima del historial
- Test de `/encounters`:
  - verificar que la referencia hacia `treatment` siga presente cuando no hay tratamiento activo
- Test de copy en `TreatmentClinicalContextForm`:
  - verificar labels/helpers nuevos si se modifican
- Test de hub `/admin/patients/[id]`:
  - verificar consistencia entre CTA estructural `Tratamiento` y próxima acción recomendada

## 15. Documentación a actualizar si cambia comportamiento visible

- `docs/fuente-de-verdad-operativa.md`
  - si cambia la jerarquía visible de CTAs o la descripción del rol de `/treatment`
- `README.md`
  - solo si cambia la forma de resumir el flujo privado a alto nivel
- `docs/checklist-sincronizacion-doc-codigo.md`
  - no necesariamente requiere cambios, pero sí debería usarse como control antes de merge
- `docs/product/solicitud-atencion-flujo-inicial.md`
  - solo si cambia la explicación visible del paso solicitud -> inicio de tratamiento

## 16. Fuera de alcance

- Cambiar repositorios, mappers o recursos FHIR
- Agregar nuevas queries por conveniencia
- Refactorizar la arquitectura route-local
- Unificar `administrative`, `treatment` y `encounters`
- Cambiar el contrato operativo de `ServiceRequest`, `EpisodeOfCare` o `Encounter`
- Tocar la landing pública o analytics

## 17. Conclusión

La superficie `/admin/patients/[id]/treatment` ya cumple el contrato funcional correcto del producto, pero hoy comunica con menos claridad de la que podría. El problema principal no es de dominio ni de arquitectura, sino de jerarquía visual y wording: la pantalla sí sabe qué hacer, pero no siempre lo explica con una sola acción dominante por estado.

La corrección más valiosa y menos riesgosa sería un patch acotado de copy y jerarquía de CTAs en `/treatment`, manteniendo intactos FHIR, loaders, actions y responsabilidades entre superficies.
