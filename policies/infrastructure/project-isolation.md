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
6. Imágenes **MUST NOT** copiar secretos. Usar usuario no root cuando sea viable,
   mounts limitados y nombres por proyecto/worktree/sesión; evitar archivos del
   repositorio propiedad de root.
7. **MUST NOT** usar socket Docker montado, red host, privilegios amplios ni limpieza
   global como solución ordinaria. Eliminar solo recursos propios identificados.
8. La entrega **MUST** informar imágenes/targets, contenedores y comandos realmente
   utilizados; una comprobación no ejecutada no cuenta como aprobada.

## Excepciones

Si Docker no permite ejecutar razonablemente la tarea, detener esa ejecución antes
de instalar dependencias del producto en host. Documentar limitación, alternativas,
alcance, impacto y retirada, y solicitar excepción explícita según la Policy de
[precedencia](../precedence.md). Una excepción puntual no autoriza otros proyectos.
