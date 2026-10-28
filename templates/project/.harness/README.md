# Harness instalado

- Reglas compartidas: [core/policies/README.md](core/policies/README.md).
- Skills: [core/skills/README.md](core/skills/README.md).
- Reglas propias: `project/README.md`, cuando existan.
- Conocimiento del proyecto: `docs/README.md` desde la raíz del repositorio.
- Continuidad: `.harness_work/README.md` desde la raíz del repositorio.

`core/`, este router y los wrappers son administrados. `project/` pertenece al proyecto.
Los comandos se invocan con Bash desde cualquier directorio y usan Node.js 22 o 24
nativo y Git, sin dependencias npm. `environment.sh` centraliza el preflight: los
faltantes se diagnostican sin instalar herramientas ni mutar el consumidor.
Docker y GNU `timeout` se requieren para ejecutar checks declarados por el proyecto.
Los runtimes, builds, pruebas y linters de la aplicación permanecen en sus imágenes.

`bash .harness/agents.sh setup` prepara perfiles personales fuera del repositorio.
`bash .harness/agents.sh doctor` comprueba roles y adaptadores antes de delegar.
El contrato de ejecución se consulta en `core/schemas/agent-task.schema.json`
y en la Skill `coordinate-work`.

## Operación y continuidad

- Configurar perfiles e iniciar trabajo: [coordinación](core/skills/coordinate-work/SKILL.md).
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
