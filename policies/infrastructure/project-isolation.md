# Aislamiento del trabajo de proyecto

## Propósito

Mantener el host estable entre proyectos y sesiones; el entorno del producto debe
ser reproducible y distinto de la infraestructura general que opera al agente.

## Contrato

1. Compilar, ejecutar, preparar, probar o analizar código de proyecto **MUST** ocurrir
   dentro de imágenes Docker con versiones explícitas y dependencias declaradas,
   aunque ya existan herramientas compatibles en el host.
2. Antes de ejecutar, **MUST** inspeccionar Dockerfiles, Compose y automatización
   existentes y reutilizarlos cuando sean válidos. Si faltan, crear una imagen
   mantenible; para diagnósticos sin autorización de archivos, usar contexto temporal.
3. Runtimes, SDK, gestores, dependencias, extensiones, compiladores y linters del
   producto **MUST NOT** instalarse en el host como atajo. Migraciones y seeds se
   ejecutan desde la imagen de la aplicación.
4. Servicios de estado **MUST** tener contenedores/versiones propios, readiness y
   datos aislados. No conectar pruebas a producción o servicios compartidos sin
   autorización explícita.
5. Git, Docker, clientes de agentes y utilidades transversales pueden operar en host;
   no sustituyen el runtime del producto. Antes de instalar infraestructura general,
   comprobar lo existente y explicar su propósito y fuente confiable.
   El runtime del harness es infraestructura transversal: sus wrappers, bootstrap,
   validadores y operaciones de continuidad/distribución **MAY** ejecutarse con
   Node.js 22 o 24 nativo, Bash y Git, sin dependencias npm. Esta autorización no incluye
   código, pruebas, builds, linters ni servicios del producto consumidor. Los checks
   declarados por el proyecto **MUST** conservar sus runners Docker con dependencias
   explícitas. Docker y GNU `timeout` se requieren solo al ejecutar esos runners.
   Las herramientas del harness **MUST** diagnosticar dependencias faltantes antes
   de mutar el consumidor. Un setup explícito, solicitado directamente o mediante
   `check.sh --setup`, **MAY** instalar automáticamente runtimes y herramientas
   transversales fijados, verificando integridad y usando caché del usuario sin
   reemplazar ejecutables personales ni exigir PATH manual. Check normal y update
   **MUST NOT** descargar herramientas implícitamente; el diagnóstico de setup
   **MUST** ser de solo lectura. Esta preparación **MUST NOT** instalar dependencias
   del producto, clientes de agentes, credenciales ni identidades privadas.
   ShellCheck y shfmt pertenecen al mantenimiento de la fuente del harness; no son
   requisitos de sus consumidores. La imagen de validación de esa fuente **MAY**
   usarse como ambiente reproducible opcional.
6. Imágenes **MUST NOT** copiar secretos. Usar usuario no root cuando sea viable,
   mounts limitados y nombres por proyecto/worktree/sesión; evitar archivos del
   repositorio propiedad de root.
7. **MUST NOT** usar socket Docker montado, red host, privilegios amplios ni limpieza
   global como solución ordinaria. Eliminar solo recursos propios identificados.
8. La entrega **MUST** informar imágenes/targets, contenedores y comandos realmente
   utilizados, o el runtime nativo utilizado para herramientas transversales; una
   comprobación no ejecutada no cuenta como aprobada.

## Excepciones

Si Docker no permite ejecutar razonablemente la tarea, detener esa ejecución antes
de instalar dependencias del producto en host. Documentar limitación, alternativas,
alcance, impacto y retirada, y solicitar excepción explícita según la Policy de
[precedencia](../precedence.md). Una excepción puntual no autoriza otros proyectos.
