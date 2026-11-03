# Evidencia y límites

Implementación documental: 589b534. Corrección de imagen: 699b7ea. Referencia hermana
inspeccionada únicamente en lectura; no se ejecutó su código ni se le escribieron archivos.

Validación dentro de contenedores de sesión, sin red y como UID/GID del operador:

- `docker build --target validation -t engineering-harness-validation:monorepo .`:
  base Node 22.19.0 Alpine 3.22 fijada por digest, herramientas declaradas en imagen.
- `bash tooling/run-validation.sh --with-lint`: validador, lint y primeras 25 suites
  aprobados; el comando terminó con exit 1 en la última suite, antes de ejecutar
  su fixture, por falta de curl en el Dockerfile preexistente. Ver `evidence/validation.log`.
- Tras declarar curl 8.14.1-r4, se reconstruyó la imagen y se reejecutaron
  `test-harness-setup.mjs`, `test-setup-bootstrap.mjs` y `test-setup-integration.mjs`:
  exit 0, `evidence/setup-recheck.log`. No se cambiaron ni omitieron tests. Cobertura
  total aprobada: 26 suites distintas; no se repitieron las 23 no afectadas por ese prerrequisito.
- `node tooling/validate-framework.mjs` con inventario de cambios: exit 0 incluido
  gate de VERSION, `evidence/source-validation.log`. Sintaxis JS/Bash, ShellCheck y
  shfmt aprobados en la ejecución integrada. AGENTS fuente 60 líneas y plantilla 54.
- Gitleaks 8.30.1 real en imagen derivada de validación: control worktree e índice,
  sin hallazgos, `evidence/secret-scan.log`; no se afirma escaneo de todo el historial.
- Revisión funcional independiente y del delta de imagen: `review.md`, sin bloqueantes.

La prueba nueva instala un consumidor con perfil core para ambos clientes,
comprueba que los recursos distribuidos coinciden con fuente, preserva apps legado,
docs, SQL, infraestructura, ignores y CI propios. Elimina recursos/rutas y verifica
que context/documentation fallen. Instalación no crea apps ni workflows de release.

No se ejecutaron modelos externos, plugins npm de release, publicación GitHub real,
previews ni deployment. Tampoco se revalidaron descargas reales del setup (opt-in y
runtime sin cambios). Esas operaciones del producto requieren adopción y evidencia
propias; los checks de guías no las certifican.
