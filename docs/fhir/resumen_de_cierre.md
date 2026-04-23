Resumen maestro de cierre — frente FHIR Patient
1. Estado general

El frente de remediación FHIR de Patient puede considerarse cerrado para el backlog FHIR-001 a FHIR-018.
El trabajo quedó ordenado en tres fases: contrato administrativo mínimo coherente, identidad semántica mínima y mejoras semánticas no bloqueantes.

2. Qué quedó resuelto
Fase 1 — contrato administrativo mínimo coherente

Quedó cerrado el soporte real de:

Patient.gender end-to-end;
Patient.birthDate end-to-end;
alineación documental de ese contrato.

Eso implica que hoy gender y birthDate están soportados en:

contrato interno;
schemas;
mappers/tipos FHIR;
UI de alta;
UI de edición/detalle;
tests de regresión de Fase 1.

La referencia rápida ya no debería tratarlos como faltantes/parciales en esta etapa cerrada.

Fase 2 — semántica mínima de identidad

Quedó cerrado el enriquecimiento de identidad operativa:

DNI sigue siendo la regla operativa vigente;
Patient.identifier quedó enriquecido con Identifier.type;
se blindó compatibilidad con búsqueda por DNI y duplicados sin romper datos legacy.

Importante: esto no abrió validación RENAPER, identidad federada ni semántica de identidad validada. Eso quedó explícitamente fuera de alcance.

Fase 3 — mejoras semánticas no bloqueantes

Quedó cerrado, de forma incremental y transicional:

Patient.telecom con convención mínima de un único phone;
Patient.contact.relationship con catálogo mínimo controlado;
mejora incremental de Patient.name, sin rediseño completo de HumanName;
deuda explícita y triggers de evolución de Patient.address, manteniendo address.text como simplificación vigente.
3. Decisiones operativas que quedaron aceptadas
Identidad
El DNI sigue siendo el identificador operativo central del flujo actual.
Identifier.type enriquece semántica, pero no cambia la regla operativa ni agrega verificación externa.
Gender
gender usa vocabulario FHIR directo:
male
female
other
unknown

No se introdujo traducción persistida ni semántica local paralela. Esto fue correcto para evitar drift entre contrato interno y FHIR.

BirthDate
birthDate quedó validada y transportada como YYYY-MM-DD, sin semántica clínica extra.
Telecom
El teléfono principal del paciente vive transicionalmente en Patient.telecom.
Se usa un único telecom principal con system: "phone".
No se usa use.
WhatsApp no se modela como canal FHIR separado en esta etapa; sigue siendo una convención operativa de producto/UI sobre el mismo número.
Contact relationship
Patient.contact.relationship representa la relación operativa del contacto principal único.
Se aceptó un catálogo mínimo transicional:
parent
spouse
child
sibling
caregiver
other
Name
Patient.name se mejoró de forma incremental, pero sin rediseño completo de HumanName.
La guía vigente sigue siendo mantenerlo simple y consistente.
Address
address.text sigue siendo la simplificación aceptada hoy.
No se reabre modelado estructurado salvo aparición de triggers concretos.
4. Qué quedó explícitamente fuera de alcance

Este frente no implementó ni debe presentarse como si hubiera implementado:

validación RENAPER;
identidad validada vs declarada;
múltiples identificadores equivalentes;
multicontacto con prioridad avanzada;
semántica formal de WhatsApp como canal FHIR;
modelado rico de guardian/caregiver;
rediseño exhaustivo de HumanName;
address estructurado completo.
5. Qué deuda queda viva, pero condicionada

La única deuda importante que quedó viva en este frente es condicionada, no abierta como implementación inmediata:

Patient.address

Se reabre solo si aparecen necesidades reales como:

geocodificación;
filtros por localidad o zona;
lógica logística/ruteo más fina;
integración con agenda/ruteo;
interoperabilidad postal más rica.

Mientras esos triggers no aparezcan, la simplificación address.text sigue siendo aceptable.

6. Criterio para no reabrir este frente sin evidencia

No conviene reabrir el frente Patient solo por “mejorarlo un poco más”.
Debería reabrirse únicamente si aparece evidencia concreta de alguno de estos casos:

bug funcional real;
nueva necesidad operativa del producto;
necesidad clara de interoperabilidad más rica;
trigger documental ya definido para address;
expansión explícita de alcance clínico/administrativo.
7. Qué puede tomar el equipo como fuente de verdad

Para este frente, las referencias centrales quedaron acá:

docs/fhir/README.md como índice del frente;
docs/fhir/plan-remediacion-fhir-patient.md para el encuadre por fases;
docs/fhir/backlog-remediacion-fhir.md para trazabilidad de tickets;
docs/fhir/referencia-patient-modelado-minimo.md como referencia operativa rápida;
docs/fhir/adr-001-identidad-operativa-patient.md para la decisión de identidad;
docs/fuente-de-verdad-operativa.md para el estado vigente del producto y sus límites.
8. Cierre ejecutivo

En términos prácticos, el resultado final es este:

Patient quedó mejor modelado;
sin abrir una refactorización total;
con decisiones pequeñas, trazables y documentadas;
y con límites explícitos para no sobredimensionar lo implementado.

La conclusión operativa que yo usaría para el equipo sería:

El frente FHIR de Patient quedó cerrado para el alcance actual del producto. No reabrir sin evidencia nueva o trigger explícito.

Si querés, el próximo paso puede ser que te lo convierta en un documento markdown listo para pegar en docs/fhir/ como cierre-maestro-remediacion-fhir-patient.md.