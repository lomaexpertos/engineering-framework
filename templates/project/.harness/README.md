# Harness instalado

- Reglas compartidas: [core/policies/README.md](core/policies/README.md).
- Skills: [core/skills/README.md](core/skills/README.md).
- Reglas propias: `project/README.md`, cuando existan.
- Conocimiento del proyecto: `docs/README.md` desde la raíz del repositorio.
- Continuidad: `.harness_work/README.md` desde la raíz del repositorio.

`core/`, este router y los wrappers son administrados. `project/` pertenece al proyecto.
Los comandos se invocan con Bash desde cualquier directorio. Docker, Bash y Git son
infraestructura compartida; los runtimes del proyecto permanecen en sus imágenes.
