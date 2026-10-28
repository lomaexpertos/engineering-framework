# Validaciones del harness

El código es autoridad de lo comprobado; estas páginas explican su alcance. Los
checks estructurales no prueban corrección de negocio, UX ni consolidación semántica.

## Router

- Versión/procedencia y metadata: [framework-version](framework-version/README.md).
- Hashes y contenido administrado: [framework-integrity](framework-integrity/README.md).
- Routing y contratos normativos: [policy-validation](policy-validation/README.md).
- Scopes del consumidor y checks del proyecto: [repository-compliance](repository-compliance/README.md).

## Ejecución

En un consumidor, `bash .harness/check.sh` ejecuta los scopes aplicables con Node.js
22 o 24 nativo, Bash y Git, sin dependencias npm. Docker y GNU `timeout` se requieren
solo para ejecutar checks declarados por el proyecto. El preflight diagnostica
dependencias faltantes antes de mutar el consumidor y no instala herramientas.
`--scope <nombre>` selecciona una familia; `--json` entrega salida estructurada.

La fuente puede validarse con `node tooling/validate-framework.mjs`. El target Docker
`validation` permite ejecutar opcionalmente su suite en un ambiente reproducible.

Scopes integrados: context, documentation, installation, work y extensions. Los
proyectos pueden declarar scopes adicionales junto con sus runners y argv; la
aplicabilidad debe justificarse, no asumirse porque un dominio exista en el catálogo.

El agregado distingue aprobado, incumplimiento y error de configuración/ejecución,
con códigos 0, 1 y 2. Un check requerido sin evidencia ejecutada no se considera aprobado.
No instalar linters ni runtimes del proyecto en el host.

`bash .harness/agents.sh doctor` diagnostica perfiles personales, asignación de roles
y requisitos de ejecución del equipo. La configuración cumple esquemas versionados;
un cliente encontrado no equivale a autenticación o modelo probado. Los contratos y
límites están en [ejecución de agentes](../docs/architecture/agent-execution.md).
Los resultados de revisión y las pruebas del producto siguen necesitando evidencia
sobre la versión entregada; un proceso de agente terminado no acredita aceptación.

El mantenimiento de la fuente incorpora sintaxis JS/Bash, ShellCheck, shfmt, higiene
de texto y patrones acotados de credenciales. ShellCheck y shfmt no son requisitos
del consumidor. Esto no sustituye un analizador completo de secretos ni
linters semánticos de cada lenguaje. Esos comandos se declaran con sus imágenes.

Actions y publicación central permanecen suspendidos. La existencia del check local
no configura CI ni branch protection automáticamente.
