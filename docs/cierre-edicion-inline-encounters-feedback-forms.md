# Cierre — edición inline de fecha/hora en visitas y feedback auto-dismiss

## Estado

Implementado y validado.

## Resumen

Se implementó corrección inline acotada de fecha/hora en el listado de visitas de `/admin/patients/[id]/encounters`.

La edición permite modificar únicamente la ocurrencia temporal del `Encounter`, manteniendo el alcance fuera de edición clínica completa. El update valida ownership contra el paciente, normaliza el valor `datetime-local` a `FHIR dateTime`, sincroniza `period.start` y `period.end`, persiste mediante repositorio/mapper dedicados y revalida la ruta específica de encounters.

Se endureció `getEncounterById` para distinguir correctamente 404 de errores no-404, evitando ocultar fallas de infraestructura como recursos inexistentes.

La UX inline quedó modelada con estado puro testeable: inicio de edición, cambio de draft, cancelación, bloqueo durante pending y prevención de guardado inválido.

Además, se consolidó el feedback de formularios privados mediante `useFormFeedback`, con auto-dismiss de mensajes exitosos, persistencia de errores bloqueantes y protección contra updates luego de desmontaje.

Documentación actualizada de forma mínima en `docs/fuente-de-verdad-operativa.md`, declarando la corrección inline acotada de fecha/hora sin presentarla como edición clínica completa.

## Alcance funcional

Incluye:

- edición inline de fecha/hora de visitas ya registradas;
- acción discreta por fila con lápiz;
- `input type="datetime-local"` en modo edición;
- acciones “Guardar” y “Cancelar”;
- persistencia acotada de `Encounter.period.start` y `Encounter.period.end`;
- revalidación de `/admin/patients/[id]/encounters`;
- feedback exitoso auto-ocultable en formularios privados;
- errores bloqueantes persistentes por defecto.

No incluye:

- edición clínica completa de `Encounter`;
- edición de notas clínicas;
- edición de diagnóstico, procedimientos, observaciones o evolución;
- cambios en rutas;
- nuevos recursos FHIR;
- incorporación de librerías de formularios o datepicker custom.

## Decisiones técnicas

### Update acotado de Encounter

Se decidió agregar un flujo mínimo de update para modificar únicamente la ocurrencia temporal de una visita.

Esto evita sobredimensionar el recurso `Encounter` y mantiene el slice actual como operación simple de visitas realizadas.

### Sincronización de `period.start` y `period.end`

El update sincroniza ambos campos con el mismo valor para conservar el criterio vigente del `Encounter` base.

### Validación de pertenencia al paciente

La acción server valida que el `Encounter` pertenezca al `patientId` de la ruta antes de persistir cambios.

Esto evita editar recursos asociados a otro paciente.

### Hardening de `getEncounterById`

`getEncounterById` devuelve `null` sólo ante 404.

Errores no-404 se relanzan para no ocultar problemas reales de infraestructura o servidor.

### Estado inline testeable

La lógica de transición de edición inline se extrajo a un módulo puro para poder testear comportamiento sin depender de entorno DOM.

### Feedback reutilizable

`useFormFeedback` centraliza el comportamiento de mensajes en formularios privados:

- éxito con auto-dismiss;
- errores persistentes por defecto;
- limpieza de timers;
- protección contra updates luego de desmontaje.

## Validación

- `npm run lint`: OK
- `npm run test`: OK
- `npm run build`: limitado por falta de `FHIR_BASE_URL` en prerender de rutas admin.

## Tests cubiertos

- update exitoso de fecha/hora de `Encounter`;
- rechazo cuando el `Encounter` no existe;
- rechazo cuando el `Encounter` pertenece a otro paciente;
- distinción 404 vs errores no-404 en repositorio;
- mappers de update con sincronización de `period.start` y `period.end`;
- schema de update y normalización a FHIR `dateTime`;
- estado inline: iniciar edición, cambiar draft, cancelar, pending/disabled;
- `useFormFeedback` con fake timers y cleanup.

## Límites vigentes

La mejora no cambia el alcance clínico del producto.

`/admin/patients/[id]/encounters` sigue siendo una superficie clínica operativa mínima para registrar y listar visitas realizadas. La corrección inline de fecha/hora existe para resolver errores administrativos de carga, no para abrir edición clínica longitudinal del encuentro.

## Próximos pasos posibles

No hay acción inmediata requerida.

Sólo considerar mejoras adicionales si aparece evidencia real de uso, por ejemplo:

- necesidad de entorno `jsdom` para tests de interacción de componente real;
- edición de otros campos mínimos de visita;
- historial/auditoría de modificaciones;
- permisos por usuario cuando exista auth productiva.
