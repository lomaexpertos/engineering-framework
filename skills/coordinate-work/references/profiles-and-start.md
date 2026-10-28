# Preparar una ejecución instalada

Leer al configurar el ejecutor o comenzar una iniciativa. Los comandos se ejecutan
**desde la raíz Git del consumidor instalado**, donde existen `.harness/agents.sh`
y `.harness/work.sh`. Esta referencia se distribuye con la Skill: no requiere tener
el checkout fuente del framework. Los contratos de campos se distribuyen también en
`.harness/core/schemas/`.

Para consultar sintaxis sin lanzar trabajadores: `bash .harness/agents.sh --help`
o `bash .harness/agents.sh workflow --help`; `bash .harness/work.sh --help`
explica el ciclo de iniciativa. `--root /ruta/consumidor` selecciona otra raíz.
La salida de operación es JSON; leer tanto contenido como código de salida.

## Diagnóstico y elección personal

El runtime del harness necesita Node.js 22 o 24, Bash y Git. Los comandos del producto
usan su ambiente Docker documentado; disponer de Node para el harness no autoriza a
probar el producto en el host.

```bash
bash .harness/agents.sh doctor
bash .harness/agents.sh setup
bash .harness/agents.sh doctor
```

`setup` interactivo detecta clientes, solicita nombre de perfil, cliente, modelo,
permiso, patrones shell cuando aplican, límites y asignación de los siete roles.
Elegir explícitamente con el usuario cliente/proveedor/modelo disponible: detección
no es autorización ni recomendación de un modelo. No instala clientes ni inicia
sesión. La autenticación sigue bajo control del cliente. Sin terminal interactiva,
`setup` no pregunta: usar `--input` con configuración preparada.

La ruta predeterminada es `$XDG_CONFIG_HOME/harness/profiles.json` o
`$HOME/.config/harness/profiles.json`. `--config /ruta/personal/profiles.json`
selecciona otra ruta; conservar esa opción en **cada** comando que resuelva perfiles
(`setup`, `doctor`, `run`, `workflow create/run/escalate`). `--input` es el archivo
que se importa, no la ruta donde se guarda la configuración. Setup respalda una
configuración previa si cambia y escribe archivos personales con modo `0600`.

Ejemplo de entrada JSON **ilustrativo, no listo para ejecutar**: sustituir los dos
placeholders por modelos elegidos y disponibles; no introducir credenciales.
Los perfiles son decisiones personales, no archivos de configuración del equipo.

```json
{
  "schema_version": 1,
  "profiles": {
    "reasoning": {
      "adapter": "codex",
      "model": "REPLACE_WITH_EXPLICIT_REVIEW_MODEL",
      "permission": "read-only"
    },
    "builder": {
      "adapter": "codex",
      "model": "REPLACE_WITH_EXPLICIT_IMPLEMENTATION_MODEL",
      "permission": "workspace-write"
    }
  },
  "roles": {
    "definition": "reasoning",
    "implementation": "builder",
    "functional": "reasoning",
    "security": "reasoning",
    "logging": "reasoning",
    "ui": "reasoning",
    "ux": "reasoning"
  },
  "limits": {
    "max_concurrency": 2,
    "timeout_seconds": 1800,
    "max_correction_rounds": 2
  }
}
```

Después de editar y guardar el ejemplo como archivo personal, importarlo con
`bash .harness/agents.sh setup --input /ruta/personal/seleccion.json` y repetir doctor.
`adapter` admite `codex`, `claude`, `opencode`; OpenCode requiere `model` con forma
`proveedor/modelo` y cliente v2 compatible. No existe campo `provider` separado.
`executable` opcional es ruta absoluta o nombre de PATH; `client_profile` sólo aplica
a Codex. Para Claude/OpenCode con escritura, `shell_allowlist` es un array de patrones
explícitos del cliente: vacío implica sin shell. No usar patrones amplios para
resolver una prueba bloqueada. Codex usa la política/sandbox del cliente y rechaza
ese campo. Un perfil lector de Claude/OpenCode no recibe shell: la verificación
puede necesitar contrastar evidencia ejecutada por el implementador.

Los requisitos versionados de equipo viven en `.harness/project/agents.json`:
`required_roles`, `allowed_adapters`, `model_allowlist` por rol y `limits` con
`schema_version: 1`. Si no se declaran roles, se requieren los siete. Los límites
personales y de equipo se combinan por el mínimo; el perfil personal no puede
relajar al proyecto. Un rol comparte perfil si esa fue la selección explícita;
perfiles con nombres distintos no prueban independencia de revisión.

Doctor verifica configuración, presencia, versión y flags del cliente; devuelve
`authentication: not_checked` y `execution_verified: false`. Un doctor verde no
certifica credenciales, ejecución real ni calidad del modelo. Un lanzamiento real
puede producir efectos/coste autorizados; no lanzarlo como prueba implícita de setup.

## Expediente antes de delegar

El ID tiene forma `YYYYMMDD_slug_con_guiones_bajos`. Ejemplo, sustituible por el
objetivo actual:

```bash
bash .harness/work.sh create 20261028_validar_entrada --title "Validar entrada" --owner "coordinador"
bash .harness/work.sh status 20261028_validar_entrada
```

Editar `.harness_work/initiatives/20261028_validar_entrada/brief.md` con objetivo,
alcance, exclusiones, aceptación y decisiones/dudas. `create` genera un texto inicial:
no confirma que el alcance esté definido. Mantener `resume.md` con estado observado,
bloqueos y siguiente acción, y la memoria general con el punto de entrada vigente.
Después de confirmar semánticamente el brief:

```bash
bash .harness/work.sh transition 20261028_validar_entrada ready --confirm
bash .harness/work.sh transition 20261028_validar_entrada active
```

El runtime comprueba brief no vacío y `--confirm`, no la suficiencia de sus criterios.
Continuar con [workflow-operations.md](workflow-operations.md) para un ciclo completo,
o [individual-tasks.md](individual-tasks.md) para encargos individuales.
