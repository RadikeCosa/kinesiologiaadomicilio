# Auditoría UI `/admin`

## Hipótesis evaluada
**Hipótesis principal:** la superficie hoy se percibe vacía, con poca información útil y con acciones redundantes.

**Veredicto:** **validada parcialmente (alta evidencia)**. Hay pantallas con baja densidad informativa y duplicación de acciones de navegación/gestión. No es un problema transversal extremo, pero sí consistente en los flujos principales de pacientes.

## Evidencia por criterio

### 1) Pantallas pobres en contexto
1. **Home de admin con contexto operativo insuficiente.**
   Solo muestra “Accesos rápidos” + dos links, sin volumen de trabajo, estado del día ni pendientes; funciona como menú, no como tablero operativo.
   - Evidencia: `/admin` renderiza título, frase genérica y dos links (`Ver pacientes`, `Nuevo paciente`).

2. **Listado de pacientes con texto técnico interno en vez de contexto de negocio.**
   La bajada “Lectura mínima del Slice 1…” aporta poco al operador y ocupa el espacio que podría resumir situación real (ej. cantidad, activos, finalizados).

3. **Pantalla de detalle del paciente no abre con un resumen operativo arriba.**
   Muestra nombre + acceso a visitas, pero el estado de tratamiento aparece recién más abajo en bloques secundarios.

### 2) Headers débiles
1. **Jerarquía principal inconsistente.**
   En varias pantallas el encabezado de vista usa `h2` aunque es el título principal del contenido (pacientes, nuevo paciente, visitas), reduciendo claridad de escaneo.

2. **Header sin “qué hacer ahora”.**
   En detalle de paciente hay nombre y link a visitas, pero no una acción primaria claramente dominante al entrar.

### 3) Bloques con demasiado aire y poca señal
1. **Card de gestión colapsable agrega fricción sin información nueva visible por defecto.**
   El usuario ve “Gestión del paciente” + botón “Mostrar gestión”; la acción real queda escondida tras 1–2 clics.

2. **Múltiples secciones con contenedores grandes y texto breve.**
   Patrón repetido de `p-4/p-6` + una línea descriptiva + CTA único, lo que aumenta scroll y reduce densidad útil en desktop.

### 4) Links duplicados o semánticamente repetidos
1. **Duplicación de rutas “Nuevo paciente”.**
   Existe en la navegación global del layout y también como CTA principal dentro del listado, lo cual repite la misma intención en la misma vista.

2. **`/admin` repite enlaces que ya están implícitos en el nav persistente.**
   La home privada ofrece exactamente los mismos dos accesos clave que se pueden resolver desde navegación superior + flujo natural de listado.

### 5) Acciones que compiten entre sí
1. **Detalle de paciente mezcla navegación y gestión con pesos similares.**
   “Ver visitas”, “Mostrar gestión”, “Editar datos administrativos” y (si aplica) finalizar tratamiento compiten sin una prioridad visual clara.

2. **Gestión escalonada con toggles incrementa competencia cognitiva.**
   Dos botones tipo toggle consecutivos (“Mostrar gestión” y luego “Editar…”) antes de llegar al formulario principal.

### 6) Ausencia de acción principal clara
1. **En `/admin` no hay una acción primaria explícita según estado.**
   Los dos links tienen estilo equivalente (ambos secundarios), sin priorizar el flujo más frecuente.

2. **En detalle de paciente la CTA visible depende de expandir paneles.**
   Si el objetivo es editar o cerrar tratamiento, no queda claro de forma inmediata al entrar.

### 7) Falta de resumen operativo arriba de cada pantalla
1. **Pacientes:** no se muestra resumen agregado (totales/estados) al inicio.
2. **Detalle:** no hay bloque “estado actual + siguiente paso” arriba de los módulos.
3. **Visitas:** hay mensajes de estado (activo/no activo) pero falta mini resumen de volumen (ej. cantidad de visitas, última visita) en cabecera.

### 8) Layouts que no ayudan a escanear
1. **Demasiados bloques del mismo peso visual.**
   En detalle y visitas casi todo usa cards con estilos similares; cuesta identificar rápidamente “estado”, “acción” y “historial”.

2. **Separación vertical alta entre secciones primarias.**
   Muchos `mt-6` generan lectura más larga sin sumar información proporcional.

## Ajustes mínimos posibles (sin rediseño general)
1. **Eliminar texto técnico/no operativo de cabeceras** y reemplazarlo por una frase de estado concreto de la pantalla (sin agregar features nuevas).
2. **Marcar una sola CTA primaria por vista** (p. ej. estilo primario solo para la acción más frecuente, demás en secundario).
3. **Reducir duplicación de acciones iguales** cuando ya existen en navegación persistente (mantener solo una prominente por contexto).
4. **Desplegar por defecto la gestión principal en detalle** cuando hay una tarea obvia (editar/finalizar), evitando doble toggle.
5. **Compactar spacing vertical en bloques consecutivos** (`mt-6` → menor separación en desktop) para mejorar escaneo sin rehacer layout.
6. **Reforzar encabezados con micro-resumen operativo inmediato** usando datos ya presentes en pantalla (estado de tratamiento, existencia de visitas), sin introducir nuevos módulos.

## Conclusión
La hipótesis se sostiene: hoy `/admin` prioriza estructura y navegación básica, pero deja huecos de contexto operativo y repite acciones en puntos clave. Con ajustes puntuales de jerarquía, visibilidad de acción principal y compactación visual, se puede aumentar señal útil sin rediseño global.
