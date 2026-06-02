# Auditoría funcional, UX y técnica — Tratamiento del paciente
Fecha: 2026-05-10
Alcance: `/admin/patients/[id]/treatment` y su integración con `/admin/patients/[id]/encounters`.

## Diagnóstico general

> **Nota de estado (Fase 1 cerrada documentalmente, 2026-05-10):** ya implementado el cambio de copy visible a **Diagnóstico kinésico**, card read-only de `/encounters` con 5 campos, completitud **5/5** y CTA/empty state orientado a completar el marco clínico en `/treatment`. Queda pendiente Fase 2 (edición campo por campo y eventual normalización interna de naming legacy sin migración obligatoria en esta fase).

Estado general: **apto con riesgos controlables**.

- La superficie `/treatment` ya está orientada como “marco clínico del ciclo” y no solo inicio/cierre.
- Existe modelo longitudinal mínimo (diagnósticos + contexto funcional/objetivos/plan) persistido en EpisodeOfCare (diagnosis + extension).
- `/encounters` ya consume y muestra contexto en modo read-only mediante card específica.
- Riesgo principal: edición actual en **formulario masivo** (no field-by-field), con potencial de error humano y semántica de “guardar todo junto”.
- Riesgo secundario: naming clínico visible e interno aún usa “Impresión kinésica”, no “Diagnóstico kinésico”.

## Hallazgos priorizados

### P0 (corregir primero)
1. **Ningún P0 técnico bloqueante detectado** en preservación de integridad de EpisodeOfCare durante update de contexto.
   - El update lee recurso vigente y aplica merge con `...existing`.
   - Conserva `period`, `status`, `referralRequest` y datos no tocados.
   - No pisa cierre ni otras extensiones: remueve solo extensiones de contexto y vuelve a insertar contexto.

### P1 (alto impacto funcional/UX)
1. **Edición no es campo por campo**.
   - `TreatmentClinicalContextForm` envía todos los campos en una sola acción.
   - Aunque la acción preserva bien datos técnicos, UX/operación queda expuesta a errores de edición masiva.

2. **Terminología visible inconsistente con requerimiento**.
   - Se muestra “Impresión kinésica” en treatment y encounters (detalle), no “Diagnóstico kinésico”.

3. **Card de contexto en `/encounters` no muestra siempre los 5 campos pedidos en vista compacta principal**.
   - Compacto principal prioriza 3 campos (diagnóstico médico, estado funcional inicial, objetivo).
   - Diagnóstico kinésico y plan marco quedan dentro de `details`.

4. **Métrica de completitud incompleta**.
   - Completitud se calcula sobre 3 campos, no 5.
   - Puede informar “Completo” sin diagnóstico kinésico ni plan marco.

### P2 (mejora recomendada)
1. **Copy de “Plan marco del tratamiento” es correcto, pero conviene aclarar explícitamente su diferencia con plan de próxima visita**.
2. **Resumen de tratamiento finalizado en `/treatment` mantiene contexto, pero usa labels legacy (Impresión/Plan) y puede alinearse mejor con copy final unificado**.
3. **Compatibilidad naming interno**: migrar de `kinesiologic_impression` a `kinesiologic_diagnosis` requiere estrategia backward-compatible.

## Revisión por punto solicitado

### 1) Inicio de tratamiento
- Hoy `StartEpisodeOfCareForm` solo inicia episodio con fecha + `serviceRequestId`.
- El contexto clínico longitudinal se carga **después** (sección separada) cuando ya hay episodio activo.
- Cumple operación mínima, pero no cumple el ideal de “iniciar + cargar contexto mínimo” en un único paso guiado.

**Evaluación funcional**
- Simpleza: buena.
- Continuidad clínica inicial obligatoria: media (depende de disciplina del usuario para completar luego).

### 2) Edición posterior del contexto longitudinal
- Sí se puede editar; actualmente por envío único de formulario completo.
- Acción server:
  - permite limpiar diagnóstico removiendo referencia en EpisodeOfCare (sin borrar Condition histórico),
  - al actualizar diagnóstico crea nueva Condition y reemplaza referencia por kind.

**Riesgos auditados**
- PUT/merge incompleto: bajo (usa recurso existente + merge).
- Reemplazo accidental de `extension[]`: bajo-medio (filtra por URLs conocidas; si URL futura colisiona, riesgo teórico).
- Pérdida `diagnosis[]` no objetivo: bajo (filtra solo roles locales médico/kinésico).
- Afectar `period/start/end/status`: bajo (no se toca en `applyEpisodeClinicalContextToFhir`).

### 3) Modelado FHIR
- Diagnóstico médico y kinésico como `Condition` referenciadas desde `EpisodeOfCare.diagnosis[]`: **válido y recomendable para V1**.
- Contexto inicial/objetivo/plan en `EpisodeOfCare.extension[]` versionadas: **consistente con decisión de proyecto**.
- Cierre en extensiones específicas + `status=finished` y `period.end`: consistente.
- `note[]` no es el canal principal: correcto.

**Preguntas específicas**
- ¿Está bien `Condition` para diagnóstico kinésico? **Sí**, para V1 simple y trazable.
- ¿Conviene otro recurso/campo ahora? **No**; evitar complejidad prematura.
- ¿Renombrar `kinesiologic_impression` a `kinesiologic_diagnosis`? **Sí en capa de dominio/copy**, manteniendo lectura legacy.
- Compatibilidad: soportar ambos codes en lectura + escribir nuevo code en alta/edición.
- ¿Migración? No obligatoria inmediata si hay tolerancia legacy; migración batch opcional diferida.

### 4) Relación con `/encounters`
- Ya existe card read-only antes de tendencia/estadísticas/listado: correcto en jerarquía general.
- No hay edición inline: correcto.
- CTA principal “Registrar visita” mantiene prioridad visual.

**Gaps**
- Falta elevar diagnóstico kinésico + plan marco al bloque compacto.
- Empty state puede ser más accionable (invitar explícitamente a completar 5 campos en Treatment).

### 5) Cierre de tratamiento
- Flujo de cierre simple (motivo + detalle + fecha): alineado con alcance actual.
- Preserva `startDate` y valida `endDate` (no futura, no anterior al inicio).
- No pisa contexto longitudinal ni referralRequest al cerrar.
- Resumen read-only de ciclo finalizado existe y es razonable para V1.

### 6) UX/Copy recomendado

#### Agrupación
- Título de bloque recomendado: **“Marco clínico del tratamiento”** (global).
- Subgrupo interno recomendado: **“Contexto clínico inicial del ciclo”**.

#### Labels recomendados
- Diagnóstico médico de referencia
- Diagnóstico kinésico
- Situación funcional inicial
- Objetivo de tratamiento
- Plan terapéutico marco del ciclo *(alternativa breve: Plan marco del tratamiento)*

#### Empty state recomendado (`/encounters`)
- “Este ciclo aún no tiene contexto clínico completo. Completá diagnóstico médico de referencia, diagnóstico kinésico, situación funcional inicial, objetivo y plan marco en Tratamiento.”

#### CTA recomendado (`/encounters` → `/treatment`)
- “Completar marco clínico en Tratamiento”
- Si ya está completo: “Ver/editar marco clínico en Tratamiento”

## Recomendación funcional final

1. Mantener diseño general actual (sin rediseño).
2. Consolidar `/treatment` como fuente única editable del marco clínico longitudinal.
3. Mantener `/encounters` read-only con card compacta más completa (5 campos).
4. Implementar edición **campo por campo** (acciones discretas) para bajar riesgo operativo.
5. Mantener cierre simple, sin agregar historia de cierre rica en esta fase.

## Recomendación FHIR/modelado final

1. Mantener `Condition + EpisodeOfCare.diagnosis[]` para ambos diagnósticos.
2. Renombrar semántica de negocio/UX a “kinesiologic_diagnosis” con compatibilidad legacy:
   - lectura: aceptar `kinesiologic_impression` y `kinesiologic_diagnosis`;
   - escritura: producir `kinesiologic_diagnosis`.
3. Mantener extensiones versionadas para estado inicial, objetivo y plan marco.
4. Evitar `note[]` como canal principal salvo fallback legado.

## Patch plan incremental (sin sobreimplementar)

### Fase 1 (seguridad + copy)
- Cambiar labels visibles a “Diagnóstico kinésico”.
- Ajustar card `/encounters` para mostrar los 5 campos en compacto o semicompleto sin ruido.
- Corregir cálculo de completitud a 5/5.

### Fase 2 (edición por campo)
- Separar acciones server por campo (diagnóstico médico, diagnóstico kinésico, situación inicial, objetivo, plan marco).
- Cada acción debe:
  - leer estado actual,
  - actualizar solo su campo,
  - preservar diagnosis/extension ajenas,
  - revalidar rutas treatment + encounters.

### Fase 3 (naming interno compatible)
- Introducir `kinesiologic_diagnosis` en constantes y mapeo escritura.
- Mantener parser/lector legacy de `kinesiologic_impression`.
- Opcional: script de migración offline (no blocking).

## Archivos probables a tocar (cuando se implemente)

- `src/app/admin/patients/[id]/components/TreatmentClinicalContextForm.tsx`
- `src/app/admin/patients/[id]/encounters/components/ClinicalCycleContextCard.tsx`
- `src/app/admin/patients/[id]/clinical-context.ts`
- `src/app/admin/patients/[id]/actions/upsert-episode-clinical-context.action.ts` (o nuevas acciones por campo)
- `src/infrastructure/mappers/episode-of-care/episode-of-care-context.constants.ts`
- `src/infrastructure/mappers/episode-of-care/episode-of-care-write.mapper.ts`
- Tests asociados en `.../__tests__` y `.../*.test.ts(x)`.

## Tests de regresión mínimos recomendados

1. Inicio de tratamiento y carga posterior de 5 campos longitudinales.
2. Edición de un campo sin alterar otros 4.
3. Editar diagnóstico médico sin afectar diagnóstico kinésico.
4. Editar diagnóstico kinésico sin afectar diagnóstico médico.
5. Limpiar un diagnóstico remueve referencia en EpisodeOfCare sin borrar Condition histórica.
6. Preservación de `referralRequest` al editar contexto.
7. Preservación de `period.start`, `period.end`, `status` al editar contexto.
8. Render read-only en `/encounters` sin controles de edición.
9. Empty state accionable en `/encounters` cuando falta contexto.
10. Cierre de tratamiento preserva contexto longitudinal y diagnóstico referenciado.

## No-alcances explícitos

- No rediseño visual grande.
- No IA/ayuda clínica automática.
- No incorporación de `Goal`, `Procedure` ni recursos clínicos avanzados en esta fase.
- No dashboard de tendencia avanzada.
- No historia clínica de cierre enriquecida (mantener cierre simple).

## Cierre documental Fase 2A (implementado)

- `/admin/patients/[id]/treatment` queda consolidada como **única superficie editable** del marco clínico del ciclo.
- El marco clínico ahora se edita **campo por campo** (sin guardado masivo):
  1) diagnóstico médico de referencia;
  2) diagnóstico kinésico;
  3) situación funcional inicial;
  4) objetivo de tratamiento;
  5) plan marco del tratamiento.
- Cada campo tiene submit independiente y no existe botón global “guardar todo”.
- `/admin/patients/[id]/encounters` mantiene consumo del marco clínico en modo read-only, sin edición inline.
- Cada actualización de campo preserva el resto del contexto clínico y campos estructurales no relacionados del `EpisodeOfCare` (incluyendo `period.start`, `period.end`, `status`, `referralRequest`, diagnósticos/extensiones ajenas y cierre).

### Pendientes explícitos
- Fase 2B: normalización de naming interno `kinesiologic_diagnosis` con compatibilidad transicional.
- Posible test E2E posterior para reforzar garantías de superficie completa.
- Se mantienen no-alcances: sin Goal, sin Procedure, sin IA, sin dashboard clínico y sin cierre clínico enriquecido.
