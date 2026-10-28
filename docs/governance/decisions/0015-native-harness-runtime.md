# ADR-0015: Runtime nativo para las herramientas del harness

- Estado: Aceptada.
- Fecha: 2026-10-28.
- Aprobación: el responsable solicitó ejecución nativa de las herramientas
  transversales del harness y conservar Docker para el producto.

## Contexto

Construir una imagen para consultar estado, verificar metadata o distribuir archivos
añade una dependencia operativa a herramientas transversales sin dependencias npm.
La separación entre infraestructura del agente y runtime del producto permite
reducir ese coste sin ejecutar aplicaciones consumidoras en el host.

## Decisión

Bootstrap y wrappers `check`, `work` y `update` ejecutan las herramientas del harness
con Node.js 22 o 24, Bash y Git nativos. El preflight comprueba sus dependencias
antes de mutar el consumidor y entrega un diagnóstico si faltan; nunca instala
herramientas automáticamente. Las herramientas usan módulos estándar de Node.
Se eligieron las versiones mayores 22 y 24 por su validación en los entornos disponibles;
otras mayores requieren validación explícita del contrato. El cambio se versiona como 3.0.0 porque
añade un requisito obligatorio al host respecto de 2.x y requiere `--allow-major`.

Docker y GNU `timeout` se requieren al ejecutar checks declarados por el consumidor.
Sus imágenes, argv, scopes, evidencia, aislamiento y límites de ejecución se
conservan. El código, builds, pruebas, linters y servicios del producto permanecen
bajo la Policy de [aislamiento](../../../policies/infrastructure/project-isolation.md).
ShellCheck y shfmt solo se requieren para mantener la fuente del harness. El target
Docker `validation` sigue disponible como validación reproducible opcional de esa fuente.

Esta decisión sustituye exclusivamente el requisito de imagen para las operaciones
del harness descrito en [ADR-0014](0014-safe-harness-operations.md). Conserva snapshots
fijados por SHA, inventario y hashes, locks, journals, recuperación y las protecciones
de rama, índice, ownership y ediciones concurrentes. No autoriza instalar runtimes
del producto en el host, publicación, despliegue ni actualización masiva.

## Consecuencias y revisión

Los consumidores deben disponer de Node.js 22 o 24, Bash y Git antes de operar; la falta
de Docker no impide las operaciones que no ejecutan checks del producto. El riesgo
aceptado es ejecutar código del origen confiado con los permisos del usuario en host;
se conserva la inspección del bootstrap, origen fijo y validación del snapshot, y no
se presenta un hash como firma del publicador.

El alcance incluye la fuente productora y sus herramientas distribuidas, sin extender
la autorización a aplicaciones consumidoras. Revisar esta decisión al cambiar la
versión mayor de Node, introducir dependencias externas o ampliar ejecución nativa.
Los procedimientos vigentes están en [INSTALL.md](../../../INSTALL.md) y
[distribución](../../architecture/distribution.md).
