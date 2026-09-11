# Privacidad, entornos y demo segura

> Estado: fuente activa
> Fecha: 2026-09-11
> Alcance: reglas de privacidad y separación de entornos para el repositorio actual y la futura aplicación privada.

## 1. Principio general

El proyecto nace de un contexto asistencial real, pero el repositorio, sus pruebas, documentación, screenshots y demos no deben contener información identificable de pacientes.

La utilidad clínica del producto no justifica copiar datos reales a superficies de desarrollo, portfolio o demostración.

## 2. Datos que no deben versionarse ni publicarse

- nombres o apellidos reales de pacientes;
- DNI reales;
- teléfonos o direcciones reales;
- nombres de familiares o cuidadores;
- notas clínicas identificables;
- diagnósticos vinculables a una persona real;
- matrículas, firmas o datos profesionales privados no destinados a publicación;
- tokens, contraseñas, cookies o claves;
- URLs privadas, certificados o configuración sensible de red;
- backups o exports de HAPI FHIR;
- screenshots del entorno real.

## 3. Entornos actuales

### Dev/test descartable

- endpoint local habitual: `http://localhost:8081/fhir`;
- solo datos ficticios;
- puede reiniciarse o reseedearse;
- es la fuente permitida para tests manuales y screenshots.

### Local-real

- endpoint local habitual: `http://localhost:8080/fhir`;
- puede contener información real;
- no se utiliza para screenshots, fixtures, documentación ni demos;
- no debe exponerse públicamente.

La aplicación actual usa un único `FHIR_BASE_URL` por ejecución. La UI privada muestra el entorno activo para reducir errores operativos.

## 4. Entornos objetivo

La nueva aplicación debe mantener separación inequívoca entre:

### Desarrollo

- datos ficticios;
- reiniciable;
- herramientas de inspección permitidas sin PHI;
- utilizado para implementación y pruebas.

### Demo

- datos totalmente ficticios y reconocibles como demo;
- identidad visual y funcionalidades suficientes para mostrar el producto;
- sin conexión posible al entorno real;
- sin claims de producción, cumplimiento o seguridad no implementados.

### Real privado

- acceso restringido;
- datos clínicos reales;
- analytics públicos deshabilitados;
- logs minimizados;
- backups protegidos;
- sin indexación ni exposición pública.

Las variables, credenciales, bases y URLs no deben ser intercambiables de forma accidental entre demo y real.

## 5. Dispositivos y funcionamiento offline

La PWA podrá almacenar temporalmente contexto clínico y borradores en el teléfono. Esto requiere:

- dispositivo personal autorizado;
- bloqueo de pantalla con PIN, huella u otra credencial segura;
- sesión de aplicación válida;
- autorización offline limitada y renovable;
- almacenamiento local minimizado;
- cifrado o protección local definida antes de usar datos reales;
- borrado al cerrar sesión cuando sea técnicamente posible;
- revocación de dispositivos;
- expiración de acceso offline para dispositivos que no pueden validar su estado;
- estados visibles de sincronización.

No debe utilizarse `localStorage` indiscriminadamente para contenido clínico. La elección de almacenamiento, claves y migraciones requiere diseño explícito.

## 6. Información offline mínima

Solo debe descargarse lo necesario para atender pacientes activos y registrar visitas:

- identificación operativa mínima;
- tratamiento activo;
- contexto clínico longitudinal;
- actividad reciente resumida;
- métricas recientes;
- borradores y operaciones del propio dispositivo;
- metadata de actualización y sincronización.

No se replica por defecto la historia completa, todos los informes ni solicitudes históricas.

## 7. Acceso y autenticación

- la V1 tiene una cuenta profesional provisionada;
- no existe registro público;
- la sesión puede permanecer activa en dispositivos confiables;
- la red privada no sustituye la autenticación de la aplicación;
- el teléfono nunca accede directamente a HAPI FHIR;
- un dispositivo perdido debe poder revocarse;
- una sesión persistente no puede equivaler a autorización offline indefinida.

## 8. Logs, errores y analytics

No registrar en logs o telemetría:

- contenido de notas;
- payloads FHIR completos;
- nombres, DNI, teléfono o domicilio;
- texto de informes;
- tokens o cabeceras de autenticación.

Los logs operativos deben preferir:

- identificadores técnicos no reveladores;
- tipo de operación;
- estado y duración;
- código de error sanitizado;
- dispositivo o request correlacionado sin contenido clínico.

GA4 pertenece únicamente a la landing pública. La aplicación privada no debe cargar analytics públicos.

## 9. Resúmenes e informes

### Resumen familiar

- mostrar preview antes de compartir;
- incluir solo información proporcionada al destinatario;
- no incorporar DNI, domicilio u otros datos administrativos por defecto;
- no afirmar que fue enviado si solo se abrió una aplicación externa.

### Informe de período

- requiere revisión profesional antes de confirmar;
- el PDF final y su texto son información clínica sensible;
- una versión confirmada es inmutable;
- una corrección crea una versión nueva;
- el archivo y sus backups deben recibir la misma protección que el resto del registro clínico.

## 10. Screenshots y materiales de portfolio

- usar exclusivamente el entorno dev/test;
- revisar nombres, contactos, fechas, direcciones y texto clínico antes de guardar;
- preferir fixtures explícitamente ficticios;
- no capturar barras, terminales o paneles con secretos o endpoints privados;
- no reutilizar screenshots del producto actual como evidencia del producto nuevo;
- aclarar si una superficie es prototipo local, demo o aplicación real.

Las capturas privadas actuales fueron creadas con datos ficticios del endpoint dev/test. No representan una demo pública editable.

## 11. Backups y recuperación

- los backups reales contienen información clínica y deben protegerse;
- no deben sincronizarse con servicios personales no evaluados;
- deben incluir lo necesario para recuperar FHIR y configuración crítica;
- debe existir una prueba de restauración antes de depender del sistema;
- las copias demo y real deben mantenerse separadas;
- restaurar nunca debe poblar demo con información real.

Los requisitos de infraestructura relacionados se entregaron al proyecto `Casa` en `docs/remodelacion/04-handoff-infraestructura-casa.md`.

## 12. Lenguaje público permitido

Mientras no exista implementación verificable, no describir la aplicación privada como:

- producción sanitaria;
- plataforma certificada;
- sistema compliant con una normativa específica;
- SaaS multiusuario;
- demo pública segura;
- servicio con disponibilidad garantizada;
- historia clínica integral.

Descripción apropiada durante la transición:

> Aplicación privada clínico-operativa para un profesional independiente, en reconstrucción, con persistencia FHIR local y una demo futura basada únicamente en datos ficticios.

## 13. Checklist previo a usar datos reales

- [ ] autenticación implementada y probada;
- [ ] HTTPS válido;
- [ ] HAPI FHIR no expuesto al cliente;
- [ ] revocación de dispositivos verificada;
- [ ] almacenamiento offline protegido;
- [ ] expiración de acceso offline verificada;
- [ ] logs revisados y sanitizados;
- [ ] analytics públicos ausentes en la app privada;
- [ ] separación real/demo probada;
- [ ] backups protegidos;
- [ ] restauración probada;
- [ ] comportamiento ante pérdida de conexión verificado;
- [ ] política operativa de teléfono perdido definida.
