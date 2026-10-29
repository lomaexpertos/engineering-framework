# Harness instalado

- Reglas compartidas: [core/policies/README.md](core/policies/README.md).
- Elegir recorrido mínimo, estándar o reforzado:
  [entrega proporcional](core/policies/ai-assisted-development/proportional-delivery.md).
- Skills: [core/skills/README.md](core/skills/README.md).
- Secretos y contratos de deployment: [controles de assurance](core/checks/assurance/README.md).
- Reglas propias: `project/README.md`, cuando existan.
- Conocimiento del proyecto: `docs/README.md` desde la raíz del repositorio.
- Continuidad: `.harness_work/README.md` desde la raíz del repositorio.

`core/`, este router y los wrappers son administrados. `project/` pertenece al proyecto.
Los comandos se invocan con Bash desde cualquier directorio y usan Node.js 22 o 24
nativo y Git, sin dependencias npm. `environment.sh` centraliza el preflight: los
faltantes se diagnostican sin instalar herramientas ni mutar el consumidor.
Preparar el equipo con `bash .harness/setup.sh`, o preparar y validar con
`bash .harness/check.sh --setup`. Se reutilizan herramientas compatibles y se
instalan las faltantes en caché de usuario; no requiere configurar PATH manualmente.
`bash .harness/setup.sh --check` diagnostica sin descargas ni escrituras. Los checks
normales y update no descargan herramientas. Prerrequisitos y límites están en
[la guía](core/checks/assurance/README.md#herramientas-transversales).
Docker y GNU `timeout` se requieren para ejecutar checks declarados por el proyecto.
Los runtimes, builds, pruebas y linters de la aplicación permanecen en sus imágenes.

Mínimo directo no requiere expediente ni perfiles. Si se usa el ejecutor,
`bash .harness/agents.sh setup` prepara perfiles personales fuera del repositorio.
`bash .harness/agents.sh doctor --roles implementation` comprueba el trabajador
mínimo; estándar usa `--roles implementation,functional` y añade `definition` solo
si se activa. El diagnóstico general de perfiles sigue disponible sin `--roles`.
El contrato de ejecución se consulta en `core/schemas/agent-task.schema.json`
y en la Skill `coordinate-work`.

## Operación y continuidad

- Configurar perfiles e iniciar trabajo: [coordinación](core/skills/coordinate-work/SKILL.md).
- Operar mínimo o estándar: [recorridos](core/skills/coordinate-work/references/delivery-tracks.md).
- Consolidar y cerrar: [cierre](core/skills/close-initiative/SKILL.md).
- Configurar checks y extensiones: [operación](core/checks/repository-compliance/operations.md).
- Crear documentación y memoria cuando no existan: [plantillas opcionales](core/templates/context/README.md).

Descubrir sintaxis sin ejecutar trabajo con `bash .harness/agents.sh --help`,
`bash .harness/work.sh --help`, `bash .harness/check.sh --help` y
`bash .harness/update.sh --help`. Para configurar proveedores, usar elecciones
explícitas de cada integrante; no copiar credenciales al proyecto.

## Actualización protegida

```bash
bash .harness/update.sh --ref REF --check
bash .harness/update.sh --ref REF
```

Sustituir REF por una rama, tag o SHA revisado del repositorio público del harness;
el predeterminado es main. El actualizador fija el SHA descargado. Publicar una
rama de desarrollo no la convierte en main ni actualiza consumidores automáticamente.
Revisar el plan antes de aplicar; conservar configuración y cambios locales.
`--allow-major` acepta una migración incompatible revisada; `--repair` acepta
reparar divergencias administradas revisadas, sin adquirir ownership de archivos ajenos.
`--recover` recupera una transacción propia interrumpida si no hubo ediciones posteriores.

Antes de actualizar, finalizar o cancelar trabajadores y recoger sus entregas.
Ante lock/journal pendiente, inspeccionar identidad y procesos reales; no borrar
locks desconocidos ni editar manifests para forzar éxito. Los locks que sobrevivan
a una caída del proceso requieren reconciliación explícita del operador. Resolver
primero el update interrumpido y después reanudar cambios de trabajo.
