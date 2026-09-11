# Handoff de infraestructura para el proyecto Casa

> Estado: requisitos de aplicación listos para evaluación de infraestructura
> Fecha: 2026-09-11
> Proyecto receptor: `Casa`
> Origen: decisiones de la nueva aplicación privada de kinesiología domiciliaria
> Alcance: expresar necesidades y criterios de aceptación sin imponer una tecnología de VPN, red mesh, hardware o proveedor.

## 1. Objetivo

Proveer acceso privado, estable y seguro desde un teléfono y una computadora autorizados hacia una aplicación clínica alojada en infraestructura propia.

La solución debe permitir uso remoto cotidiano sin exponer públicamente HAPI FHIR. La aplicación conservará soporte offline para cortes de conectividad.

## 2. Componentes involucrados

- teléfono personal con PWA;
- computadora de trabajo;
- servidor propio donde se ejecutará la aplicación;
- HAPI FHIR R4 como persistencia clínica;
- red doméstica compartida con dispositivos familiares;
- mecanismo de acceso privado remoto todavía por decidir.

## 3. Requisitos obligatorios

### Acceso privado

- la aplicación debe tener una URL estable;
- la URL debe utilizar HTTPS válido;
- debe ser accesible desde el teléfono mediante datos móviles o redes externas;
- solo dispositivos o identidades autorizadas pueden alcanzar la aplicación;
- no deben abrirse públicamente HAPI FHIR, puertos administrativos ni consolas del servidor;
- la solución debe permitir revocar un dispositivo perdido.

### Frontera de servicios

- el teléfono accede únicamente a la aplicación;
- la aplicación server-side accede a HAPI FHIR;
- HAPI FHIR no debe ser enrutable directamente desde el teléfono ni desde internet;
- la red privada no reemplaza la autenticación propia de la aplicación.

### Disponibilidad

- el servidor debe poder permanecer encendido durante la jornada de trabajo;
- aplicación y FHIR deben recuperarse automáticamente después de un reinicio razonable;
- una caída de conectividad no debe impedir que la PWA conserve borradores locales;
- al restablecerse la conexión, la aplicación debe poder sincronizar sin cambios manuales de dirección.

### Red doméstica y familia

- alojar la aplicación no debe debilitar la seguridad de otros dispositivos familiares;
- los servicios clínicos deben quedar aislados de dispositivos domésticos que no los necesitan;
- la administración de la solución debe estar restringida;
- no deben reutilizarse credenciales familiares compartidas para acceder a la aplicación clínica.

### Backup y recuperación

- debe existir backup regular de la persistencia de HAPI FHIR;
- deben incluirse configuraciones necesarias para reconstruir el servicio;
- los backups deben estar protegidos porque contienen información clínica;
- debe existir al menos una prueba documentada de restauración antes de depender del sistema con datos reales.

## 4. Requisitos deseables

- monitoreo básico de disponibilidad;
- aviso ante caída prolongada o fallo de backup;
- inventario de dispositivos autorizados;
- logs técnicos mínimos sin contenido clínico;
- segmentación del servidor respecto de dispositivos IoT o poco confiables;
- alimentación protegida o apagado controlado;
- actualizaciones de seguridad con una rutina definida;
- acceso administrativo remoto separado del acceso normal a la aplicación;
- posibilidad futura de migrar el servicio a otro servidor sin cambiar la URL utilizada por la PWA.

## 5. Criterios de aceptación

La solución de infraestructura se considera apta cuando se puede demostrar que:

1. un teléfono autorizado accede a la aplicación desde una red móvil;
2. una computadora autorizada accede mediante la misma identidad estable del servicio;
3. un dispositivo no autorizado no puede alcanzar la aplicación;
4. el navegador recibe un certificado HTTPS válido y permite instalar/operar la PWA;
5. HAPI FHIR no es accesible directamente desde el teléfono;
6. ningún puerto clínico está publicado hacia internet;
7. revocar el teléfono impide nuevas conexiones privadas;
8. reiniciar el servidor recupera aplicación y FHIR sin reconfigurar el teléfono;
9. una interrupción temporal permite continuar offline y sincronizar al volver la conectividad;
10. un backup puede restaurarse en un entorno de prueba;
11. la solución no requiere desactivar controles de seguridad del navegador ni aceptar certificados inválidos.

## 6. Información que el proyecto Casa debe devolver

- topología elegida;
- tecnología de acceso privado;
- equipo que actuará como servidor;
- forma de obtener nombre estable y HTTPS;
- reglas de acceso entre teléfono, aplicación y HAPI FHIR;
- procedimiento para autorizar y revocar dispositivos;
- disponibilidad esperada;
- estrategia de backup y restauración;
- estrategia de actualización y mantenimiento;
- riesgos aceptados y limitaciones conocidas;
- instrucciones mínimas para que la aplicación consuma el servicio.

## 7. Fuera de alcance del proyecto Casa

- autenticación interna de la aplicación;
- autorización offline dentro de la PWA;
- cifrado y migración del almacenamiento local del navegador;
- dominio clínico y reglas de negocio;
- modelado o configuración funcional de recursos FHIR;
- sincronización e idempotencia de visitas;
- generación de reportes y PDFs;
- datos demo y fixtures;
- diseño del frontend.

## 8. Restricciones de privacidad

- no usar datos reales durante pruebas de red o infraestructura;
- no copiar bases clínicas a dispositivos o servicios no aprobados;
- no incluir payloads, nombres, DNI, direcciones o notas clínicas en logs;
- no publicar screenshots que revelen información clínica o configuración sensible;
- no exponer secretos, tokens, certificados privados ni variables de entorno en documentación versionada.

## 9. Decisiones deliberadamente no impuestas

Este handoff no exige:

- una VPN tradicional;
- una red mesh concreta;
- apertura de puertos en el router;
- un proveedor cloud;
- un modelo específico de servidor;
- una herramienta particular de backup;
- un producto determinado de monitoreo.

El proyecto Casa debe seleccionar la solución más proporcionada al entorno doméstico y justificar cómo cumple los criterios anteriores.
