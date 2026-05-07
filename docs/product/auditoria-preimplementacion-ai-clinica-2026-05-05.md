# Auditoría pre-implementación — base clínica para futura feature de AI

Fecha: 2026-05-05 (UTC)
Estado: propuesta técnica (sin implementación de IA)

## 1) Diagnóstico de gaps clínico-funcionales

### 1.1 Hallazgos sobre estado actual

- La app privada (`/admin`) ya soporta `Patient`, `ServiceRequest`, `EpisodeOfCare` y `Encounter` con un pipeline consistente de loaders/actions, reglas y repositorios.
- `Encounter` hoy solo persiste estado finalizado + período (`period.start` / `period.end`), sin nota clínica estructurada ni narrativa.
- No hay modelado operativo vigente para `Condition`, `Observation` ni `Procedure`.
- Para soportar redacción asistida futura (sesión, evolutivo, supervisión), faltan campos clínicos que hoy viven fuera del sistema o quedan implícitos.

### 1.2 Información clínica mínima faltante (para capturar antes de IA)

**Nivel episodio (marco de tratamiento):**
- Diagnóstico de referencia (médico derivante o motivo clínico principal).
- Impresión/hipótesis kinésica basal.
- Situación inicial funcional (línea base del caso).
- Objetivos terapéuticos iniciales (corto/mediano plazo).
- Plan marco de tratamiento (enfoque y criterios de reevaluación).

**Nivel encuentro/visita (evolución por sesión):**
- Subjetivo (S): percepción paciente/familia, dolor, cambios relevantes.
- Objetivo (O): hallazgos observables/medibles de la sesión.
- Intervención (I): técnicas/procedimientos aplicados.
- Evolución/valoración (A): respuesta clínica y progreso frente a objetivos.
- Tolerancia/adherencia de sesión.
- Indicaciones domiciliarias/educación.
- Plan próximo contacto.

Conclusión de gap: **la brecha principal no es de agenda/administración, sino de semántica clínica longitudinal y trazabilidad de acto terapéutico.**

---

## 2) Qué dato vive en `EpisodeOfCare` vs `Encounter`

### 2.1 Regla de asignación

- **`EpisodeOfCare`**: contexto persistente del tratamiento (lo que no debería cambiar sesión a sesión o cambia con baja frecuencia).
- **`Encounter`**: registro atómico por visita (hechos y decisiones de esa sesión).

### 2.2 Propuesta concreta

**`EpisodeOfCare` (nivel caso):**
- Diagnóstico de referencia (texto + codificación opcional).
- Impresión kinésica basal activa.
- Situación inicial/funcional basal.
- Objetivos terapéuticos vigentes.
- Plan marco (frecuencia orientativa, ejes de intervención, criterios de avance/alta).
- Estado clínico resumido del episodio (en curso, en reevaluación, etc.; separado del status administrativo FHIR).

**`Encounter` (nivel sesión):**
- Nota SOAP/PIE estructurada (campos separados, no un solo blob inicialmente).
- Intervenciones realizadas en la sesión.
- Respuesta/tolerancia de la sesión.
- Indicaciones entregadas.
- Plan inmediato (siguiente sesión o ajuste).

Decisión clave: **evitar que `EpisodeOfCare` se convierta en “cajón de sesiones”; y evitar que `Encounter` duplique baseline del caso.**

---

## 3) Uso de `Condition` para diagnóstico médico e impresión kinésica

### 3.1 Recomendación

Implementar `Condition` **en Fase 1** como capa clínica mínima, con separación semántica:

- **Condition A (médica de referencia)**:
  - Fuente: derivación/diagnóstico de origen.
  - Rol: contexto de tratamiento.
  - Puede venir codificada o en texto libre estructurado.

- **Condition B (impresión kinésica / problema funcional activo)**:
  - Fuente: evaluación profesional propia.
  - Rol: hipótesis de trabajo y foco terapéutico.

### 3.2 Consideraciones prácticas

- No bloquear adopción por codificación completa desde día 1.
- Permitir arranque con texto clínico normalizado + `clinicalStatus` básico.
- Dejar codificación exhaustiva como hardening posterior.
- Mantener trazabilidad temporal (inicio, resolución/cierre por episodio).

Decisión: **sí conviene `Condition` temprano** porque ordena la narrativa clínica y mejora calidad de futuros prompts sin exponer FHIR crudo a UI.

---

## 4) ¿`Observation` y `Procedure` ahora o después?

### 4.1 `Observation`

**Recomendación: entrar en Fase 2 (no bloquear Fase 1).**

Motivo:
- Para notas iniciales y borradores evolutivos alcanza capturar objetivo textual estructurado en Encounter.
- `Observation` suma más cuando hay set de métricas repetibles (dolor, ROM, fuerza, pruebas funcionales) y panel longitudinal.

### 4.2 `Procedure`

**Recomendación: entrada mínima en Fase 2 (o fin de Fase 1 si el equipo llega).**

Motivo:
- En el corto plazo, la intervención puede quedar como sección estructurada en Encounter.
- `Procedure` aporta trazabilidad formal de actos, útil para analítica clínica y supervisión asistida futura.

Decisión global:
- **Ahora:** Condition + nota clínica estructurada.
- **Después:** Observation/Procedure con catálogo progresivo y mayor granularidad.

---

## 5) Matriz dato clínico → recurso/dominio → prioridad

| Dato clínico | Recurso FHIR / dominio app | Prioridad | Fase sugerida |
|---|---|---:|---:|
| Diagnóstico de referencia (médico) | `Condition` (episode-scoped) + read model de episodio | Alta | 1 |
| Impresión/diagnóstico kinésico activo | `Condition` (episode-scoped) | Alta | 1 |
| Situación inicial funcional | `EpisodeOfCare` (extension/campo dominio) | Alta | 1 |
| Objetivos terapéuticos | `EpisodeOfCare` (campo dominio estructurado) | Alta | 1 |
| Plan marco de tratamiento | `EpisodeOfCare` (campo dominio estructurado) | Media-Alta | 1 |
| Subjetivo de sesión | `Encounter` (campo estructurado) | Alta | 0 |
| Objetivo de sesión (texto clínico) | `Encounter` (campo estructurado) | Alta | 0 |
| Intervención realizada | `Encounter` (campo estructurado; migrable a `Procedure`) | Alta | 0 |
| Evolución/valoración de sesión | `Encounter` (campo estructurado) | Alta | 0 |
| Tolerancia/adherencia sesión | `Encounter` (campo corto estructurado) | Media | 0 |
| Indicaciones domiciliarias | `Encounter` (campo estructurado) | Alta | 0 |
| Plan próxima sesión | `Encounter` (campo estructurado) | Alta | 0 |
| Métricas seriadas (dolor, ROM, etc.) | `Observation` | Media | 2 |
| Procedimientos codificados longitudinales | `Procedure` | Media | 2 |

---

## 6) Plan incremental propuesto (sin IA)

## Fase 0 — Captura clínica estructurada mínima en Encounter

Objetivo: habilitar registro clínico de sesión útil para trabajo humano y dataset futuro.

Alcance:
- Extender modelo de entrada/salida de Encounter con bloques: subjetivo, objetivo, intervención, evolución, tolerancia, indicaciones, plan.
- UI privada en `/admin/patients/[id]/encounters` para cargar/editar nota de sesión.
- Validación con schema (mantener patrón existente de actions + parseo).
- Persistencia vía repositorio/mapper (sin FHIR crudo en componentes).

Criterio de éxito:
- Una sesión queda clínicamente documentada aunque no existan aún Observation/Procedure formales.

## Fase 1 — Contexto clínico longitudinal en Episode + Condition

Objetivo: dar marco clínico del caso para coherencia longitudinal.

Alcance:
- Crear flujo para Condition de referencia médica.
- Crear flujo para Condition kinésica activa.
- Incorporar en Episode campos estructurados: situación inicial, objetivos, plan marco.
- Exponer read model consolidado en vistas de tratamiento.

Criterio de éxito:
- El profesional puede leer rápidamente “desde dónde arranca el caso” y “contra qué objetivos evoluciona”.

## Fase 2 — Formalización clínica avanzada para analítica/supervisión futura

Objetivo: robustecer estructura para casos de uso AI y métricas avanzadas.

Alcance:
- Introducir Observation para variables repetibles y tendencia.
- Introducir Procedure para actos terapéuticos trazables/codificables.
- Normalizar catálogos mínimos (sin sobrecodificar en primera iteración).

Criterio de éxito:
- Datos aptos para reportes evolutivos consistentes y soporte de supervisión de tratamiento.

---

## 7) Riesgos y no-alcances

### 7.1 Riesgos

- **Sobrediseño temprano:** intentar codificar todo FHIR completo antes de capturar hábito clínico básico.
- **Baja calidad de texto libre:** si no hay estructura mínima, IA futura heredará ruido semántico.
- **Duplicación semántica:** repetir baseline en cada Encounter y perder fuente de verdad del episodio.
- **Carga operativa en UI:** formularios demasiado extensos pueden reducir adopción.
- **Privacidad:** riesgo de mezclar datos administrativos sensibles en dataset clínico para IA.

### 7.2 No-alcances explícitos de este audit

- No diseñar prompts ni proveedores de IA.
- No habilitar inferencia automática.
- No resolver codificación terminológica exhaustiva (SNOMED/LOINC full) en esta etapa.
- No cambiar la arquitectura base de entrada/salida de la app.

---

## 8) Privacidad y preparación para IA (guardrails)

Regla recomendada desde Fase 0:
- **Separar estrictamente payload clínico de payload administrativo.**

Para cualquier feature futura de IA:
- Incluir solo campos clínicos necesarios para la tarea.
- Excluir identificadores directos y datos de contacto/finanzas/logística.
- Aplicar principio de mínimo dato y trazabilidad de acceso.

Checklist mínimo:
- Dataset clínico derivado explícito (whitelist de campos permitidos).
- Revisión de seguridad antes de cualquier integración de modelo.
- Auditoría de logs para asegurar no exfiltración accidental de PHI no necesaria.

---

## 9) Criterios de aceptación (primero datos clínicos, no IA)

### 9.1 Funcionales

1. Se puede registrar nota clínica estructurada por Encounter con los bloques mínimos definidos.
2. Se puede mantener y consultar contexto clínico de Episode (baseline, objetivos, plan).
3. Se pueden registrar/consultar diagnósticos de referencia y kinésico mediante `Condition`.
4. La UI no consume ni construye recursos FHIR crudos.

### 9.2 Arquitectura / calidad

5. Escritura entra únicamente por Server Actions.
6. Todo input clínico nuevo valida con schemas en capa de acción/dominio.
7. Persistencia pasa por repositorios + mappers (lectura y escritura coherentes).
8. Se agregan tests unitarios/integración para reglas y acciones de los nuevos datos clínicos.

### 9.3 Privacidad

9. Queda documentada una lista de campos clínicos permitidos para uso futuro de IA.
10. Queda explícitamente prohibido enviar datos administrativos sensibles en flujos de IA.

---

## 10) Recomendación ejecutiva final

Para preparar una AI clínica útil, el mayor retorno inmediato está en **mejorar captura y estructura de dato clínico** antes que en introducir modelos.

Orden recomendado:
1. **Fase 0:** enriquecer Encounter clínico.
2. **Fase 1:** consolidar marco longitudinal con Episode + Condition.
3. **Fase 2:** formalizar Observation/Procedure para analítica y supervisión asistida.

Con este camino, la app mantiene su arquitectura actual, reduce riesgo de retrabajo y crea una base segura para IA sin exponer datos administrativos sensibles.
