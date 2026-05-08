# Auditoría UX/UI clínica post Fase 0 + Fase 1 (sin cambios de dominio/FHIR)

Fecha: 2026-05-07  
Alcance: `/admin/patients/[id]/encounters`, `/admin/patients/[id]/encounters/new`, `/admin/patients/[id]/treatment`.

## 1) Diagnóstico por superficie

### A. Formulario de nueva visita (`EncounterCreateForm`)
**Estado actual**
- La sección temporal obligatoria está arriba y visible (inicio/cierre), lo que mantiene el objetivo operativo primario.
- El bloque “Registro clínico de la visita” está correctamente marcado como opcional, pero el formulario total se vuelve extenso por 7 textareas secuenciales.
- No hay agrupación semántica interna de los campos clínicos; todos tienen el mismo peso visual.

**Conclusión UX**
- Funcionalmente correcto, pero cognitivamente pesado para cierre rápido de sesión domiciliaria.

### B. Cards/listado de visitas (`EncountersList`)
**Estado actual**
- La metadata temporal (fecha, inicio, cierre, duración, estado) está en primer plano y con buena jerarquía.
- La nota clínica aparece como bloque secundario, pero cuando hay mucho texto se expande linealmente y aumenta altura de card.
- Cuando no hay nota clínica, la card queda limpia (sin ruido adicional).

**Conclusión UX**
- Buena prioridad operacional; principal riesgo: pérdida de escaneabilidad con notas largas/múltiples campos completos.

### C. Formulario de contexto longitudinal en `/treatment` (`TreatmentClinicalContextForm`)
**Estado actual**
- Ubicación correcta: cerca del estado del tratamiento activo y fuera del flujo transaccional de visitas.
- Los campos se diferencian por placeholder, pero no por labels persistentes ni subgrupos visuales.
- Los textos largos son cargables (textarea), aunque el formulario es plano y con baja señal estructural.
- Feedback de guardado/error existe y es visible.

**Conclusión UX**
- Correcta responsabilidad de superficie, con oportunidad clara de mejorar legibilidad y comprensión episodio vs visita.

### D. Resumen read-only de contexto en `/encounters` (`encounters/page.tsx`)
**Estado actual**
- Se muestra solo si hay contenido (`hasAnyContent`), evitando ruido.
- Posición: luego del header/CTA y antes de métricas/listado; buena para orientar antes de registrar o revisar visitas.
- Link de edición a `/treatment` tiene jerarquía secundaria adecuada.
- Puede crecer en alto si hay campos largos, compitiendo parcialmente con el inicio del listado de visitas.

**Conclusión UX**
- Aporta contexto útil y consistente con episodio efectivo; principal mejora: compactación visual opcional.

### E. Navegación y responsabilidades
**Estado actual**
- `/treatment` comunica ciclo longitudinal; `/encounters` comunica registro de visitas.
- CTAs principales están bien separados por página (sin colisión mayor).
- Vocabulario casi consistente: se detecta mezcla de “Gestionar tratamiento” vs “gestión de tratamiento”.

**Conclusión UX**
- Responsabilidades bien definidas; ajustar microcopy para consistencia terminológica.

---

## 2) Problemas críticos vs mejoras menores

## Críticos (impactan rendimiento operativo diario)
1. **Longitud/carga cognitiva del formulario de nueva visita** por 7 campos clínicos abiertos en bloque único.
2. **Escaneabilidad de cards con nota larga** por expansión completa de texto en listado.

## Menores (impacto moderado)
1. Falta de subagrupación visual en contexto longitudinal.
2. Inconsistencia menor de copy (“Gestionar” vs “Gestión”).
3. Ausencia de pistas explícitas para diferenciar “evaluación de sesión” vs “tolerancia” (assessment/tolerance).

---

## 3) Recomendaciones priorizadas

### Prioridad alta (patch mínimo recomendado)
1. **Hacer colapsable “Registro clínico de la visita”** (cerrado por defecto, con indicador “Opcional”).
2. **Agrupar campos clínicos por mini-secciones** dentro del colapsable:
   - Observación clínica: Subjective/Objectivo
   - Intervención y respuesta: Intervention/Assessment/Tolerance
   - Continuidad: HomeInstructions/NextPlan
3. **Cards con resumen compacto + expandir detalle clínico**:
   - mostrar hasta N líneas o N caracteres por ítem
   - botón “Ver detalle clínico” / “Ocultar detalle clínico” por card.

### Prioridad media
4. **Agregar labels persistentes en `/treatment`** (no solo placeholders).
5. **Separar visualmente en `/treatment`: “Diagnósticos” y “Plan terapéutico”** con subtítulos.
6. **En `/encounters` read-only, opción colapsable** cuando el contenido supera una altura umbral.

### Prioridad baja
7. Unificar copy a “Gestión de tratamiento” y “Contexto clínico del tratamiento”.
8. Añadir helper breve para diferencia `assessment` vs `tolerance`.

---

## 4) Propuesta de patch mínimo y reversible (solo UI)

## Patch 1 (alto valor, bajo riesgo)
- Archivo: `EncounterCreateForm.tsx`
- Cambios:
  - Encapsular “Registro clínico de la visita” en `<details><summary>`.
  - Mantener estado temporal visible y obligatorio sin cambios.
  - Añadir subtítulos internos para grupos de textareas.
- Reversibilidad: alta (remover wrapper `details` y subtítulos).

## Patch 2 (alto valor, riesgo moderado)
- Archivo: `EncountersList.tsx`
- Cambios:
  - Estado local por card para expandir/contraer detalle clínico.
  - Render inicial compacto si el texto agregado supera umbral.
- Reversibilidad: alta (eliminar truncado/expand).

## Patch 3 (valor medio, bajo riesgo)
- Archivo: `TreatmentClinicalContextForm.tsx`
- Cambios:
  - Labels visibles + agrupación “Diagnósticos” / “Plan terapéutico”.
  - Mantener exactamente mismos campos y submit.
- Reversibilidad: alta (volver a layout plano).

## Patch 4 (valor medio, bajo riesgo)
- Archivo: `encounters/page.tsx`
- Cambios:
  - colapsable del resumen longitudinal cuando contenido es extenso.
  - mantener link “Editar en tratamiento” secundario.
- Reversibilidad: alta.

---

## 5) Riesgos de regresión visual

1. **Desalineación espaciados/tipografías** entre cards y formularios por introducir wrappers (`details`, bloques internos).
2. **Pérdida de discoverability** si el colapsable queda demasiado oculto (mitigar con badge “Opcional”).
3. **Saltos de altura en listado** al expandir cards (mitigar con transición simple o expansión instantánea consistente).
4. **Inconsistencia responsive** en mobile por nuevos agrupadores.

---

## 6) Tests de render recomendados

### Unit/UI (RTL)
1. `EncounterCreateForm`
- Renderiza campos obligatorios arriba siempre visibles.
- `details` clínico inicia cerrado.
- Al abrir, aparecen 7 campos clínicos.

2. `EncountersList`
- Card con nota larga renderiza resumen compacto.
- Botón expandir/colapsar alterna contenido completo.
- Card sin nota no muestra contenedor clínico.

3. `TreatmentClinicalContextForm`
- Renderiza grupos “Diagnósticos” y “Plan terapéutico”.
- Mantiene submit/feedback sin cambios funcionales.

4. `encounters/page`
- Resumen read-only aparece solo con `hasAnyContent`.
- Link a `/treatment` mantiene estilo secundario.

### Visual/snapshot (foco anti-regresión)
- Snapshot desktop + mobile de:
  - `/encounters/new`
  - `/encounters` con 1 card corta + 1 larga
  - `/treatment` con campos completos

---

## 7) No-alcances explícitos

- Sin cambios de dominio clínico.
- Sin cambios FHIR (resources, mappers, repos, schemas, server actions).
- Sin cambios de scoping por episodio en `/encounters`.
- Sin incorporación de IA ni nuevos recursos (Observation/Procedure/Goal).
- Sin rediseño global de `/admin` ni reglas de inicio/cierre de tratamiento.

---

## Respuesta puntual a las preguntas

- **A1-A8:** Hay sobrecarga moderada; temporal obligatorio está bien priorizado; sí conviene colapsable + agrupación; labels son entendibles pero `assessment`/`tolerance` requiere helper diferencial; helpers actuales son útiles pero pueden acortarse; el orden general es correcto para cierre de sesión.
- **B1-B8:** Metadata temporal está bien priorizada; nota clínica secundaria pero puede dominar si es larga; sí conviene compacto+expandir; notas parciales renderizan bien; escaneabilidad cae con muchas notas completas; poco ruido sin nota; duración/estado son legibles.
- **C1-C8:** Ubicación en `/treatment` es correcta; compite poco con start/finish; se entiende pertenencia al episodio pero puede reforzarse; orden razonable; labels deben reforzarse; sí conviene separar Diagnósticos/Plan; textos largos se pueden cargar; feedback ya existe y es claro.
- **D1-D7:** El resumen aporta contexto y está bien ubicado; conviene colapsable solo para contenido largo; ya muestra solo campos con contenido; link de edición tiene jerarquía secundaria adecuada; respeta episodio efectivo según modelo; riesgo menor de confusión con nota de visita si no se refuerza título/etiqueta longitudinal.
- **E1-E5:** Responsabilidades están claras en gran medida; duplicación es controlada (edición en `/treatment`, lectura en `/encounters`); CTAs no compiten críticamente; recomendable unificar vocabulario exacto.

## Nota de implementación del patch mínimo (2026-05-07)

Se implementó un patch UI acotado y reversible con estas decisiones:
- `EncounterCreateForm`: bloque “Registro clínico de la visita” en formato colapsable y agrupado por secciones clínicas, manteniendo campos temporales obligatorios en primer plano y sin cambios de payload/validación.
- `EncountersList`: registro clínico secundario con vista compacta por defecto para notas largas y expansión manual por card, sin tocar duración/estado/scoping.
- `TreatmentClinicalContextForm`: agrupación visual en “Diagnósticos” y “Contexto funcional y plan terapéutico”, manteniendo mismos campos y action.
- `encounters/page`: resumen longitudinal read-only en formato compacto colapsable, solo cuando hay contenido, manteniendo link secundario a `/treatment`.

No-alcances mantenidos: sin cambios de dominio, FHIR, mappers, repos, schemas, server actions, scoping ni reglas clínicas.


## Nota de cierre documental (2026-05-07)

- **Estado:** cerrado / aprobado (patch UX/UI clínico post Fase 0/Fase 1).
- **Qué se implementó (UI-only):**
  - `/admin/patients/[id]/encounters/new`: se mantuvo la metadata temporal obligatoria en primer plano y se movió “Registro clínico de la visita” a bloque opcional colapsable, con agrupación visual por secciones.
  - `/admin/patients/[id]/encounters`: se preservó la prioridad de metadata temporal y se compactó la lectura de notas clínicas extensas con toggle por card.
  - `/admin/patients/[id]/treatment`: se reforzó la agrupación visual de “Diagnósticos” y “Contexto funcional / plan terapéutico”.
  - `/admin/patients/[id]/encounters`: el resumen longitudinal read-only quedó compacto/colapsable y condicionado a contenido.
- **Superficies tocadas:** `EncounterCreateForm`, `EncountersList`, `TreatmentClinicalContextForm`, `encounters/page.tsx` (presentación y microcopy visual).
- **No se tocó:** dominio clínico, recursos FHIR, mappers, repositorios, schemas, server actions, persistencia ni reglas operativas de tratamiento/visitas.
- **Validación ejecutada:**
  - checklist documental aplicado: `docs/checklist-sincronizacion-doc-codigo.md`;
  - verificación de calidad: `npm run lint` (ok) y `npm run test` (falla en entorno por resolución de `zod` en `src/domain/treatment-context/treatment-context.schemas.ts`).
- **Resultado de revisión documental:**
  - actualizado: este documento de auditoría UX/UI;
  - revisados sin cambios: `docs/fuente-de-verdad-operativa.md`, `README.md`, `docs/checklist-sincronizacion-doc-codigo.md`.


## Addendum patch UX/copy mínimo en cards de visitas (2026-05-07)

- Se aplicó patch de presentación en `EncountersList` para casos legacy sin cierre: la card ahora muestra `Cierre: Sin cierre registrado` y `Duración: No calculable` cuando `endedAt` está ausente.
- Se mantuvo intacta la regla operativa vigente de alta/edición con inicio+cierre obligatorios; no se habilitó ningún flujo nuevo sin cierre.
- Se fijó orden canónico de métricas funcionales en card (`TUG → Dolor → Bipedestación`) sin depender del orden de entrada.
- El bloque conserva título `Métricas funcionales` y agrega helper de lectura puntual: “Valores registrados en esta visita. No representan tendencia.”
- Visitas sin métricas continúan sin renderizar bloque vacío; métricas parciales muestran solo valores presentes.
- Backlog futuro (sin implementación): captura y visualización de puntualidad/demora de visita para mejorar interpretación operacional.

## Nota de hardening QA (2026-05-07)
- **Hallazgos QA de origen:** (1) duplicación visual de badges verdes equivalentes en Gestión clínica (`En tratamiento` + `Tratamiento activo`); (2) feedback de éxito post-registro de visita persistente.
- **Implementado (patch UX mínimo y reversible):**
  - deduplicación visual de badges en `/admin/patients/[id]/encounters`: se conserva una sola badge principal de estado operativo en header;
  - el estado del bloque secundario de contexto de tratamiento se degradó a metadata textual (sin segunda badge equivalente);
  - incorporación de `SuccessStatusMessage` para feedback de éxito transitorio por `status` reconocido;
  - autolimpieza visual del éxito a ~5 segundos;
  - limpieza del query param `status` vía `router.replace(..., { scroll: false })` para evitar reaparición tras refresh.
- **No tocado (explícito):**
  - domain/FHIR/schemas/actions/mappers/repositorios;
  - `clinicalNote`;
  - persistencia de `Observation`;
  - scoping por episodio efectivo;
  - cards/listado de visitas salvo lo estrictamente necesario para badge/feedback.
