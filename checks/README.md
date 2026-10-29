# Validaciones del harness

El código es autoridad de lo comprobado; estas páginas explican su alcance. Los
checks estructurales no prueban corrección de negocio, UX ni consolidación semántica.

## Router

- Versión/procedencia y metadata: [framework-version](framework-version/README.md).
- Hashes y contenido administrado: [framework-integrity](framework-integrity/README.md).
- Routing y contratos normativos: [policy-validation](policy-validation/README.md).
- Scopes del consumidor y checks del proyecto: [repository-compliance](repository-compliance/README.md).
- Detección de secretos y contratos de infraestructura: [assurance](assurance/README.md).

## Ejecución

En un consumidor, `bash .harness/check.sh` ejecuta los scopes aplicables con Node.js
22 o 24 nativo, Bash y Git, sin dependencias npm. Docker y GNU `timeout` se requieren
solo para ejecutar checks declarados por el proyecto. El preflight diagnostica
dependencias faltantes antes de mutar el consumidor y no instala herramientas.
`--scope <nombre>` selecciona una familia; `--json` entrega salida estructurada.
El coordinador selecciona los scopes afectados por el cambio y sus interacciones;
una tarea local no exige ejecutar todos los scopes por trámite. Los checks
requeridos del proyecto o CI conservan su obligatoriedad. Para modificar el harness,
sus contratos distribuidos o sus guías, validar también instalación, contexto y
documentación, con la prueba de consumidor correspondiente.

La fuente puede validarse con `node tooling/validate-framework.mjs`. El target Docker
`validation` permite ejecutar opcionalmente su suite en un ambiente reproducible.

Scopes integrados: context, documentation, installation, work, extensions, security,
deployment y secrets. Los tres últimos siguen [su guía de adopción](assurance/README.md).
Los
proyectos pueden declarar scopes adicionales junto con sus runners y argv; la
aplicabilidad debe justificarse, no asumirse porque un dominio exista en el catálogo.

El agregado distingue aprobado, incumplimiento y error de configuración/ejecución,
con códigos 0, 1 y 2. Un check requerido sin evidencia ejecutada no se considera aprobado.
No instalar linters ni runtimes del proyecto en el host.

`bash .harness/agents.sh doctor` diagnostica perfiles personales, asignación de roles
y requisitos de ejecución del equipo. La configuración cumple esquemas versionados;
un cliente encontrado no equivale a autenticación o modelo probado. Los contratos y
límites operativos comienzan en [coordinación](../skills/coordinate-work/SKILL.md)
y los [contratos de encargo](../schemas/agent-task.schema.json).
Los resultados de revisión y las pruebas del producto siguen necesitando evidencia
sobre la versión entregada; un proceso de agente terminado no acredita aceptación.

El mantenimiento de la fuente incorpora sintaxis JS/Bash, ShellCheck, shfmt, higiene
de texto y patrones acotados de credenciales. ShellCheck y shfmt no son requisitos
del consumidor. El scope security añade Gitleaks nativo conforme a su guía; el
análisis semántico del código del producto sigue usando sus runners por lenguaje.

Actions y publicación central permanecen suspendidos. La existencia del check local
no configura CI ni branch protection automáticamente.

## Material operativo requerido

Los scopes `context` y `documentation` comprueban las guías del harness además del
contexto propio del proyecto: inventario de recursos obligatorios, routing desde
AGENTS/routers/Skills, adaptadores seleccionados, enlaces/anclas y ejemplos JSON.
Verifican sintaxis Bash y comandos del harness contra sus contratos reales, incluidas
opciones obligatorias. Las plantillas intencionalmente incompletas se distinguen de
entradas ejecutables. Las skills locales ajenas al núcleo conservan su ownership.

El control analiza ejemplos; no los ejecuta, no llama proveedores, no lee perfiles
personales y no instala herramientas. JSON correcto no prueba verdad de evidencia,
calidad del modelo ni suficiencia semántica de una guía. La suite de mantenimiento
instala un consumidor nuevo, ejecuta ejemplos y prueba defectos deliberados para
comprobar que los controles fallan. El inventario y sus pruebas se actualizan cuando
cambia una operación requerida.
