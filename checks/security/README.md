# Control de secretos

El scope `security` integra Gitleaks con el contrato de
[detección de secretos](../../policies/security/secret-scanning.md).
Usa el binario nativo **8.30.1**, reglas predeterminadas de esa versión y Git, como
herramientas transversales del agente. No instala herramientas durante el check.

Desde la raíz del consumidor:

```bash
bash .harness/check.sh --scope security
bash .harness/check.sh --scope security --json
```

El agregado y la selección se configuran conforme a
[la guía de adopción](../assurance/README.md). El control distingue
`passed`, `failed` y `error`: herramienta ausente, versión distinta o ejecución
incompleta son errores, nunca evidencia de aprobación.

## Alcance del escaneo

| Modo | Evidencia |
| --- | --- |
| `worktree` | Archivos tracked y nuevos no ignorados del árbol actual y versiones retenidas en el índice, sin seguir enlaces. No acredita contenido histórico. Funciona antes del primer commit. |
| `changes` | Árbol cambiado, versiones del índice y commits `base_ref..HEAD`. `base_ref` es obligatorio, se resuelve a commit y nunca se infiere una rama. |
| `history` | Árbol actual, índice y commits alcanzables por todas las refs Git locales. Rechaza clones superficiales; no recupera refs ausentes del clon, commits inaccesibles o contenido remoto no obtenido. |

Los archivos ignorados y no tracked no pertenecen al inventario; no almacenar allí
secretos que se pretendan revisar con este control. Los submódulos requieren revisar
sus propios repositorios; un tipo no cubierto produce error. No promete inspección
del interior de archivos binarios o comprimidos. El límite es 32 MiB por archivo y
256 MiB por snapshot; excederlo impide acreditar el escaneo. Hay timeout por etapa.
Al terminar se comprueba que inventario/contenido observado, refs e índice no hayan
cambiado; una modificación requiere repetir.

El modo incremental rechaza flags Git `assume-unchanged` y `skip-worktree` que
puedan ocultar cambios; no los retira automáticamente. El historial ignora objetos
de reemplazo Git e incluye HEAD aunque esté detached y no tenga una rama local.
Nombres no UTF-8 o con carácter de reemplazo Unicode producen error explícito;
no se acredita cobertura parcial de esos archivos.

## Reglas y confidencialidad

La configuración del scanner la construye el harness temporalmente con
`extend.useDefault=true`; la versión fija también fija sus reglas incluidas.
No se cargan configuraciones locales o de `GITLEAKS_*`, baselines ni exclusiones
del proyecto. Los snapshots privados evitan que `.gitleaksignore` del proyecto
altere el resultado; se ignoran comentarios `gitleaks:allow`.

Se captura la salida del proceso sin retransmitirla, se aplica `--redact=100` y el
resultado público solo conserva regla, archivo, línea y etapa. Los reportes y las
copias temporales se crean fuera del repositorio con acceso privado y se eliminan
en `finally`; no se guardan reportes crudos en Git ni en la memoria compartida.

Un hallazgo justificado como falso positivo conserva el resultado y su evidencia;
la versión inicial no incluye un mecanismo para convertirlo en `passed` mediante
una allowlist local. Resolver su disposición sigue la Policy de precedencia.
No modificar reglas o silenciar el scanner para conseguir una entrega verde.

## Obtención y comprobación de herramienta

Usar la instalación explícita documentada por el harness. La procedencia es la
[release oficial 8.30.1](https://github.com/gitleaks/gitleaks/releases/tag/v8.30.1),
verificando el artefacto contra sus checksums. Una descarga no se ejecuta antes de
esa verificación. El wrapper acepta solo esa versión; una actualización del scanner
requiere revisar y probar sus contratos y reglas.

El mantenimiento puede ejecutar `tooling/test-secret-scan.mjs` con fixtures de
proceso; `HARNESS_TEST_GITLEAKS` permite señalar el binario real de la versión
comprobada para los casos de tokens sintéticos, índice e historial. Es una opción
de pruebas, no una ruta elegida por configuración del consumidor. Las pruebas no
usan credenciales emitidas ni invocan proveedores remotos.
