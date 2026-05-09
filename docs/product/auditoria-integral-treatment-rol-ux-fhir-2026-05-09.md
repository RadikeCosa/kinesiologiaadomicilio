# Auditoría integral — `/admin/patients/[id]/treatment` (producto, UX/UI, flujo clínico y modelado FHIR)

Fecha: 2026-05-09
Estado: diagnóstico y recomendación (sin implementación)

## 0) Alcance y no-alcances

### Alcance auditado
- Superficie `/treatment` (header, estado, inicio/cierre, contexto longitudinal, historial).
- Integración con `/encounters`, hub `/admin/patients/[id]` y `/administrative`.
- Consistencia con documentación operativa/FHIR vigente.

### No-alcances preservados
- Sin cambios de código en dominio, FHIR, schemas, mappers, repositorios o persistencia.
- Sin introducir `Goal`, `CarePlan`, `Procedure`, IA ni cambios de scoping.
- Sin rediseñar integralmente `/encounters` ni hub (solo recomendaciones de integración).

---

## 1) Diagnóstico de rol actual de `/treatment`

## Rol real hoy (observado)
`/treatment` cumple **cuatro roles simultáneos**:
1. Gobernanza de ciclo (`EpisodeOfCare`): iniciar/finalizar.
2. Captura de contexto longitudinal basal (diagnóstico referencia, impresión kinésica, funcional, objetivos, plan marco).
3. Historial administrativo-clínico de ciclos cerrados.
4. Puente de navegación a `/encounters`.

### Problema central
La pantalla mezcla **acción terminal** (finalizar tratamiento) con **trabajo continuo** (editar contexto longitudinal) en una misma jerarquía visual alta. Resultado: se percibe como “pantalla para cerrar” más que “marco clínico del ciclo”.

### Claridad de rol para usuario
Parcial. El copy define bien tratamiento como ciclo, pero la prominencia del bloque ámbar de cierre durante estado activo compite con el formulario longitudinal.

---

## 2) Mapa de responsabilidades (actual vs recomendado)

| Superficie | Actual | Recomendado |
|---|---|---|
| `/administrative` | solicitud + resolución + puente a tratamiento | mantener: **solicitud/aceptación** y precondiciones de inicio |
| `/treatment` | inicio/cierre + contexto + historial | reforzar como **marco clínico del ciclo** + gobernanza del ciclo |
| `/encounters` | ejecución de visitas + lectura resumida del contexto | mantener como **ejecución/evolución por visita** con contexto read-only compacto |
| Hub paciente | estado general y accesos | sumar síntesis mínima de tratamiento/cierre, sin duplicar formularios |

Regla de frontera recomendada:
- **Tratamiento** = define marco del episodio.
- **Visitas** = documentan evolución de cada sesión.
- **Administrativa** = habilita/inicia el episodio desde solicitud.

---

## 3) Problemas priorizados

## Críticos
1. Jerarquía visual: cierre demasiado protagónico durante tratamiento activo.
2. Falta de “resumen post-cierre” clínico utilizable (queda historial mínimo sin síntesis longitudinal).
3. Integración incompleta con hub (contexto longitudinal casi no se refleja como síntesis).

## Medios
1. Mezcla de bloques sin separación explícita “Acciones de ciclo” vs “Contexto clínico”.
2. CTA principal no adaptado por estado (activo/finalizado/sin tratamiento).
3. Contexto en `/encounters` útil pero demasiado escondido para seguimiento rápido.

## Menores
1. Copy inconsistente (“Gestionar tratamiento” vs “Tratamiento activo” vs “Finalizar tratamiento activo”).
2. Terminología “plan marco” puede ser menos accionable que “Plan terapéutico general del ciclo”.

---

## 4) Recomendación de layout/jerarquía

## A) Tratamiento activo (propuesta)
Orden recomendado de arriba hacia abajo:
1. Header del paciente + estado + CTA primario: **“Registrar visita”** (salida a `/encounters/new`).
2. Card “Estado del ciclo” (inicio, solicitud origen, completitud del contexto).
3. Card protagonista “Contexto clínico del ciclo” (editable; 2–3 secciones).
4. Card secundaria “Acciones del ciclo” con acceso a historial.
5. Bloque colapsable/destructivo “Finalizar tratamiento” (cerrado por defecto).

### Jerarquía de CTA
- Primaria (activo): `Registrar visita`.
- Secundaria: `Guardar contexto clínico`.
- Terciaria/destructiva: `Finalizar tratamiento` (en panel colapsado + confirmación).

## B) Tratamiento finalizado
1. Header + badge “Tratamiento finalizado”.
2. **Resumen de cierre** read-only (diagnóstico, objetivos, plan, métricas inicial/final si existen, motivo/detalle, período, visitas).
3. Historial de ciclos (incluye vínculo con solicitud origen).
4. CTA principal: `Ir a gestión administrativa para nuevo ciclo`.

---

## 5) Cierre de tratamiento (posición, jerarquía y validaciones)

### Recomendación
- Mover de bloque protagónico visible a bloque colapsable “Finalizar tratamiento”.
- Mantener estilo de acción final/destructiva (ámbar/rojo suave), no primaria.

### Copy sugerido
- Título: **“Cerrar ciclo de tratamiento”**.
- Botón: **“Registrar cierre del tratamiento”**.
- Confirmación: incluir fecha, motivo y resumen de impacto (“se bloqueará registro de nuevas visitas hasta iniciar nuevo ciclo”).

### Validaciones mínimas UX antes de confirmar
- Fecha de cierre requerida y no anterior al inicio.
- Motivo requerido.
- Detalle requerido cuando motivo = “otro”.
- Confirm modal con resumen previo al commit.

---

## 6) Integración recomendada con `/encounters`, hub y post-cierre

## `/encounters`
Mantener contexto read-only, pero:
- Mostrar un resumen compacto no colapsado (2–3 líneas: objetivo principal, impresión kinésica, baseline breve).
- Mantener detalle completo en `details`.
- CTA claro: `Editar contexto en Tratamiento`.
- Si episodio finalizado: badge explícito “Visitas en modo historial”.

## Hub `/admin/patients/[id]`
Agregar síntesis mínima (sin duplicar):
- objetivo terapéutico principal (si existe),
- inicio/fin del último ciclo,
- motivo de cierre del último ciclo finalizado.

## Post-cierre
Crear en `/treatment` una sección read-only “Resumen del tratamiento finalizado” como artefacto longitudinal de cierre.

---

## 7) Revisión FHIR (sin cambios de implementación)

## Lo que está bien hoy
1. `EpisodeOfCare` como recurso de ciclo de tratamiento: correcto.
2. Separación semántica solicitud (`ServiceRequest`) vs tratamiento (`EpisodeOfCare`) vs visita (`Encounter`): correcta.
3. Cierre (`closureReason`/`closureDetail`) en `EpisodeOfCare.extension[]`: decisión pragmática consistente.
4. Contexto longitudinal en extensiones del episodio para V1: aceptable por alcance.

## Deuda FHIR actual
1. Riesgo de “cajón de sastre” en `EpisodeOfCare.extension[]` si no se gobierna whitelist/versionado.
2. Objetivos/plan sin estructura formal interoperable (limitación asumida V1).
3. Poca trazabilidad estructurada de baseline/follow-up cuando no hay `Observation` formal.

## Recursos futuros (evaluación)
- `Goal`: valor medio-alto cuando necesiten seguimiento por objetivo/estado; hoy puede ser complejidad prematura.
- `CarePlan`: valor alto para equipos multi-profesional y planificable; prematuro en V1 actual.
- `Condition`: ya aporta para diagnósticos; consolidar calidad/roles antes de expandir.
- `Observation`: próximo candidato real para baseline/final y tendencia funcional.
- `Procedure`: bajo valor inmediato para alcance actual.
- `Appointment`: útil operativo, no debe gobernar semántica clínica de ciclo.

Recomendación temporal:
- Ahora: hardening semántico + UX sobre modelo actual.
- P1/P2: evaluar `Observation` y luego `Goal` si hay demanda real.

---

## 8) Estados esperados de `/treatment` (contrato UX)

1. Sin tratamiento ni historial: explicar flujo y CTA a solicitudes.
2. Solicitud aceptada pendiente: permitir inicio guiado desde solicitud.
3. Activo sin visitas: CTA primaria “Registrar primera visita”.
4. Activo con visitas: CTA primaria “Registrar visita” + tendencia/resumen.
5. Activo con contexto incompleto: checklist de completitud (no bloqueante).
6. Activo con contexto completo: mostrar estado “contexto completo”.
7. Finalizado: resumen de cierre + sólo lectura.
8. Finalizado con nuevo ciclo posterior: distinguir “ciclo actual” vs “históricos”.
9. Episode con Condition faltante: fallback textual con alerta suave de consistencia.
10. Legacy incompleto: placeholders explícitos “sin dato registrado”.

---

## 9) Wireframes textuales

## A) Tratamiento activo
- Header paciente + badge + CTA `Registrar visita`.
- [Card] Estado del ciclo (inicio, solicitud origen, completitud contexto).
- [Card editable] Contexto clínico:
  - Sección 1 Diagnóstico de referencia e impresión kinésica.
  - Sección 2 Estado funcional inicial.
  - Sección 3 Objetivos + plan terapéutico.
  - Botón `Guardar contexto clínico`.
- [Accordion cerrado] Finalizar tratamiento.
- [Card] Historial de ciclos cerrados.

## B) Tratamiento finalizado
- Header + badge finalizado.
- [Card read-only] Resumen del tratamiento finalizado.
- [Card] Historial de ciclos.
- CTA `Iniciar nuevo ciclo desde Gestión administrativa`.

## C) Sin tratamiento
- Mensaje “No hay tratamiento iniciado”.
- Paso a paso breve: solicitud → aceptación → inicio.
- CTA `Ir a solicitudes`.

## D) Nuevo ciclo posterior
- Bloque destacado “Ciclo activo actual”.
- Sección separada “Ciclos anteriores”.
- Evitar mezcla visual entre datos activos e históricos.

---

## 10) Patch mínimo sugerido (P0, sin tocar domain/FHIR/persistencia)

1. Reordenar layout de `/treatment`: contexto antes de cierre.
2. Convertir cierre en bloque colapsable de menor jerarquía.
3. Ajustar copy para reforzar propósito de marco clínico del ciclo.
4. Agregar “Resumen de tratamiento finalizado” read-only usando datos ya disponibles.
5. Definir CTA primario por estado (activo = visitas; finalizado/sin activo = administrativa).

---

## 11) Roadmap recomendado

## P1 (UX-producto)
- Checklist de completitud de contexto longitudinal.
- Confirmación de cierre con resumen pre-cierre.
- Síntesis mínima de tratamiento en hub.

## P2 (información clínica estructurada)
- Consolidar métricas inicial/final visibles en resumen post-cierre.
- Evaluar formalización con `Observation` (primero) y `Goal` (después) según uso real.
- Gobernanza explícita de extensiones (catálogo, límites, ownership).

---

## 12) Tests recomendados

1. Matriz de estados UI de `/treatment` (10 estados definidos arriba).
2. Test de jerarquía/visibilidad (cierre colapsado por defecto en activo).
3. Test de CTA por estado.
4. Test de integración de navegación bidireccional `/treatment` ↔ `/encounters`.
5. Test de resumen post-cierre (render con/ sin datos parciales).
6. Test de resiliencia ante datos legacy incompletos.

---

## 13) Respuestas ejecutivas a preguntas clave

- **Nombre de pantalla**: mantener “Tratamiento” (es más transversal), con subtítulo “Marco clínico del ciclo”.
- **Protagonista en activo**: contexto clínico longitudinal + CTA a visitas.
- **Protagonista en finalizado**: resumen de cierre longitudinal.
- **Cierre arriba o abajo**: abajo/colapsado (pero accesible).
- **Relación con Gestión clínica**: tratamiento define marco; encounters ejecuta evolución por sesión.
- **Riesgo principal a evitar**: duplicar evolución de visitas dentro de tratamiento.

