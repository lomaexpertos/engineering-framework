# Validaciones del harness

El código es autoridad de lo comprobado; estas páginas explican su alcance. Los
checks estructurales no prueban corrección de negocio, UX ni consolidación semántica.

## Router

- Versión/procedencia y metadata: [framework-version](framework-version/README.md).
- Hashes y contenido administrado: [framework-integrity](framework-integrity/README.md).
- Routing y contratos normativos: [policy-validation](policy-validation/README.md).
- Scopes del consumidor y checks del proyecto: [repository-compliance](repository-compliance/README.md).

## Ejecución

En la fuente se construye el target Docker `validation` y se ejecuta su suite. En un
consumidor, `bash .harness/check.sh` prepara la imagen del runtime y ejecuta los scopes
aplicables. `--scope <nombre>` selecciona una familia; `--json` entrega salida estructurada.

Scopes integrados: context, documentation, installation, work y extensions. Los
proyectos pueden declarar scopes adicionales junto con sus runners y argv; la
aplicabilidad debe justificarse, no asumirse porque un dominio exista en el catálogo.

El agregado distingue aprobado, incumplimiento y error de configuración/ejecución,
con códigos 0, 1 y 2. Un check requerido sin evidencia ejecutada no se considera aprobado.
No instalar linters ni runtimes del proyecto en el host.

La fuente incorpora sintaxis JS/Bash, ShellCheck, shfmt, higiene de texto y patrones
acotados de credenciales. Esto no sustituye un analizador completo de secretos ni
linters semánticos de cada lenguaje. Esos comandos se declaran con sus imágenes.

Actions y publicación central permanecen suspendidos. La existencia del check local
no configura CI ni branch protection automáticamente.
