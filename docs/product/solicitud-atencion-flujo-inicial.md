# Solicitudes de atención — contrato operativo vigente

> Estado: vigente
> Última actualización: 2026-06-24 (UTC)

## Propósito

Este documento resume el contrato actual de `ServiceRequest` en la superficie privada.

No intenta conservar toda la historia de auditorías o planes previos. Para eso existe `docs/archive/`.

## Qué representa una solicitud de atención

En lenguaje de producto, una solicitud de atención es el pedido inicial de evaluación o atención.

No es:

- tratamiento;
- visita;
- paciente;
- autorización automática para registrar visitas.

## Superficie dueña

La gestión principal de solicitudes vive en:

- `/admin/patients/[id]/administrative`

Desde ahí se pueden:

- leer solicitudes existentes;
- registrar una solicitud mínima;
- editar la fecha de una solicitud no absorbida por tratamiento;
- aceptar;
- cancelar;
- cerrar como `No inició` con motivo;
- marcar como `Carga errónea` una solicitud registrada por error, sin hard delete FHIR;
- derivar el inicio de tratamiento a `/treatment` cuando corresponde.

## Datos mínimos vigentes

La solicitud mínima puede registrar:

- fecha;
- motivo;
- datos básicos de quién consulta: relación + nombre.

Los teléfonos operativos y el domicilio de atención pertenecen al contexto administrativo del `Patient`, no al modelo principal de `ServiceRequest`.

## Reglas operativas clave

### 1. Una solicitud no inicia tratamiento por sí sola

Registrar una solicitud:

- no crea `EpisodeOfCare`;
- no habilita `Registrar visita`;
- no cambia por sí misma el estado clínico del paciente.

### 2. Iniciar tratamiento requiere solicitud aceptada

El inicio de tratamiento requiere una `ServiceRequest`:

- del paciente correcto;
- con estado `accepted`;
- no usada previamente;
- válida para vincularla a `EpisodeOfCare`.

### 3. Política single-use

Una solicitud `accepted` ya vinculada a un `EpisodeOfCare` no puede reutilizarse para iniciar otro ciclo.

Si hace falta un nuevo tratamiento, se requiere una nueva solicitud.

Esa misma restricción también bloquea:

- editar la fecha de la solicitud;
- marcarla como `Carga errónea`.

### 4. Vínculo real con tratamiento

Cuando se inicia tratamiento desde una solicitud válida:

- el `EpisodeOfCare` se vincula por `referralRequest = ServiceRequest/{id}`;
- la UI y los loaders priorizan ese vínculo real para clasificar el estado operativo de la solicitud.

## Estados visibles

La lectura operativa vigente distingue, como mínimo:

- `in_review`: pendiente operativa;
- `accepted` sin vínculo real a tratamiento: pendiente de iniciar tratamiento;
- `accepted` con vínculo real a tratamiento: solicitud ya absorbida por el ciclo;
- `closed_without_treatment`: histórica terminal;
- `cancelled`: histórica terminal.
- `entered_in_error`: carga errónea, reservada para registros creados por error.

## Relación con tratamiento y visitas

El flujo operativo vigente es:

1. se registra o resuelve una solicitud;
2. si corresponde, se inicia tratamiento en `/treatment`;
3. recién con `EpisodeOfCare` activo se habilita `Registrar visita`.

Las visitas siguen dependiendo del tratamiento activo, no de la mera existencia de una solicitud.

## Responsabilidades por superficie

- `/administrative`
  Gestión administrativa de solicitudes y datos no clínicos del paciente.
- `/treatment`
  Inicio real de tratamiento y vínculo con la solicitud aceptada.
- `/encounters`
  Gestión clínica de visitas ya dentro de un tratamiento activo.

## Qué leer si cambia este contrato

- `docs/fuente-de-verdad-operativa.md`
- `docs/fhir/README.md`
- `docs/checklist-sincronizacion-doc-codigo.md`
