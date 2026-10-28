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
