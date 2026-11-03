# Doctor de preparación productiva

## Alcance y entrada

Todo repositorio que administre un runtime productivo **MUST** mantener un doctor
ejecutable y versionado para verificar su preparación antes del primer arranque.
En el perfil Bash, la entrada canónica es
`infra/deploy/production/scripts/doctor.sh`; otra tecnología declara su entrada
equivalente en el README de producción. No crear scripts ficticios en repositorios
sin infraestructura productiva propia ni sustituirlo por una checklist manual.

El README **MUST** explicar invocación, alcance por host/unidad, identidad operativa,
prerrequisitos del propio doctor, permisos, catálogo de checks y límites de cobertura.
En varios hosts, cada host/unidad requiere su diagnóstico; un éxito local no acredita
los demás. No inferir que un binario encontrado implica servicio accesible o permisos.

## Cobertura definida por el proyecto

1. El catálogo **MUST** derivarse de manifests, configuración, scripts y contratos
   vigentes: cubrir exhaustivamente los prerrequisitos aplicables y automatizar la
   mayor cantidad verificable. No basta comprobar que Docker o un comando existen.
2. Cada check **MUST** tener ID estable, requisito/fuente, alcance, obligatoriedad,
   predicado verificable, resultado esperado y diagnóstico accionable. Omitidos y
   no aplicables **MUST** quedar visibles con causa; no usar listas vacías para aprobar.
3. El proyecto decide los checks concretos y umbrales. Como guía de descubrimiento,
   considerar herramientas/versiones y permisos efectivos, archivos/configuración,
   artefactos y compatibilidad, identidad/rutas/ownership, recursos/capacidad, red y
   dependencias, persistencia, secretos y prerrequisitos de recuperación. No son
   tecnologías ni valores universales obligatorios: justificar cobertura y límites.
4. Validar la raíz y confinamiento según [runtime-state.md](../runtime-state.md).
   No ejecutar código arbitrario extraído de configuración para «verificarlo».
5. Comprobaciones imposibles antes del arranque, validación funcional o descifrado
   autorizado **MUST** tener gate propio identificado; no simularlas como aprobadas.
   Estado cifrado no acredita descifrado, puerto abierto no acredita readiness y
   existencia de backup no acredita restauración.

## Ejecución determinista y segura

- **MUST** operar sin instalar, reparar, iniciar/reiniciar servicios, descargar,
  migrar, descifrar ni cambiar configuración/estado. No pedir `sudo` ni elevar
  privilegios por sí solo; la falta de acceso produce un resultado no verificable.
- **MUST** usar entradas explícitas, predicados objetivos, orden estable, límites de
  tiempo por check y total, y códigos de salida definidos. Misma entrada y estado
  observado producen la misma decisión; tiempo/condiciones externas se identifican.
  No depender de un juicio de IA, sleeps arbitrarios ni retries ilimitados.
- **MUST** evaluar todos los checks independientes aunque uno falle. Un dependiente
  que no pueda ejecutarse queda `BLOCKED` con causa, no `PASS`. Ante una condición
  insegura, detener la rama afectada sin ejecutar probes peligrosos.
- **MUST** sanear salida y errores: no mostrar secretos, tokens, DSN, contenido de
  archivos sensibles ni salida cruda de procesos. Probes externos deben ser acotados,
  de lectura y autorizados para ese destino; el doctor no amplía acceso operativo.
- **MUST NOT** crear archivos para probar escritura en un directorio no validado.
  Cualquier comprobación que requiera cambios pertenece a otro gate explícito;
  reportarla como no cubierta. El reporte sale por stdout/stderr; persistirlo es una
  acción explícita con destino seguro y no una modificación implícita del doctor.

## Gate de arranque y resultado

`deploy.sh precheck` **MUST** invocar el mismo motor de checks, sin una versión
reducida divergente. `install`/`release` y cualquier entrada que arranque producción
**MUST** exigir doctor satisfactorio sobre la versión/configuración/unidad efectiva
antes de arrancar. La preparación autorizada puede instalar prerrequisitos ausentes;
después reejecuta doctor antes del arranque. No exigir que los elementos a instalar
ya existan para preparar el host ni permitir arrancar tras un diagnóstico fallido.

El resultado **MUST** resumir cobertura y decisión: `PASS`, `FAIL`, `ERROR`, `BLOCKED`,
`WARN`, `N/A`, con ID y razón por check. `WARN` solo admite recomendaciones;
`N/A` requiere no aplicabilidad real. Una validación requerida no ejecutada o
desconocida **MUST** bloquear el arranque. Un reporte viejo no reemplaza la ejecución
actual: cambios de versión/configuración o estado invalidan la evidencia anterior.

Alloy/Loki son contexto externo, **MUST NOT** clasificarse como requisitos ni
dependencias bloqueantes. Ausencia, timeout, falta de acceso o ingestión no verificada
solo generan `WARN`/observación, sin afectar el resultado ni el exit code. Esta regla
prevalece sobre el tratamiento genérico de evaluaciones incompletas anterior; ver
[container-logging.md](../container-logging.md).

Códigos obligatorios: **0** preparado (requeridos satisfechos); **1** requisitos
incumplidos; **2** evaluación incompleta/error, incluidos requeridos bloqueados.
Si coinciden errores e incumplimientos, prevalece 2. Mostrar todos los hallazgos.
Un modo JSON **SHOULD** entregar los mismos IDs, resultados, alcance y decisión.
Doctor aprobado acredita preparación observada, no salud funcional ni autorización
para desplegar; conservar los [health checks posteriores](../health-checks.md).

El doctor **MUST** tener pruebas aisladas con fixtures de éxito, incumplimiento,
error, dependencia bloqueada, no aplicabilidad y timeout; comprobar códigos,
decisión reproducible, salida saneada y ausencia de efectos sobre el entorno.

## Estilo de salida ilustrativo

```text
DOCTOR production | proyecto=acme | host=prod-01 | unidad=api | revision=abc1234
runtime=/home/appmanager/acme-runtime | version=1.2.0 | modo=solo lectura
[PASS] runtime.root       Raíz canónica, sin enlaces; permisos efectivos verificados
[PASS] tooling.engine     Versión admitida y acceso al servicio comprobados
[FAIL] artifact.available Artefacto requerido ausente. Acción: preparar versión 1.2.0
[BLOCKED] artifact.config Depende de artifact.available; compatibilidad sin evaluar
[WARN] telemetry.alloy    No disponible/no verificable; observación no bloqueante
[N/A] traffic.dual-slot   Estrategia declarada sin doble slot
RESUMEN total=6 pass=2 fail=1 error=0 blocked=1 warn=1 na=1
RESULTADO: NO PREPARADO | evaluación requerida incompleta | exit=2
```

Los nombres, checks y valores del ejemplo no son un inventario universal. Cada repo
adapta el contenido y conserva claridad, conteos, diagnóstico y semántica de salida.
