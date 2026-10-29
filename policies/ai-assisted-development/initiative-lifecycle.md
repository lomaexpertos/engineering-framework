# Ciclo de vida, cierre y retención

## Estados y autoridad

El expediente usa `draft`, `ready`, `active`, `blocked`, `validating`, `closing`,
`closed` o `cancelled`. El schema instalado es autoridad de sus campos; el runtime
valida transiciones y no inventa documentación semántica.

Registro opcional, punto de inicio y formato de cierre siguen
[proportional-delivery.md](proportional-delivery.md). Un expediente nuevo mínimo o
estándar puede empezar en `active` con razón y sin brief/resume; el legado sin
recorrido conserva reforzado.

- `ready`: alcance y aceptación suficientes.
- `validating`: integración terminada; fallos devuelven a `active`.
- `blocked`: causa, estado anterior y siguiente desbloqueo identificados. Una pausa
  solicitada no se interpreta como abandono y solo se reanuda por instrucción.
- `closing`: revisiones requeridas resueltas; consolidación en curso.
- `closed`: resultado validado y conocimiento consolidado.
- `cancelled`: cierre de aprendizajes y pendientes sin afirmar alcance entregado.

## Cierre obligatorio

1. El coordinador **MUST** resolver bloqueantes del alcance declarado y confirmar que
   no quedan trabajadores activos. Un cambio de alcance requiere acuerdo explícito.
2. **MUST** promover conocimiento significativo y mantener continuidad en las
   fuentes canónicas afectadas, actualizando fuentes existentes antes de crear
   otras. Mínimo/estándar usan cierre compacto con resumen y evidencia. Reforzado
   registra `validation`, `reviews`, `documentation`, `decisions`, `invariants`,
   `roadmap`, `backlog` y `memory`, con motivo cuando una categoría no aplica.
   Ningún recorrido crea documentos ni actualizaciones para llenar casillas.
3. Docs **MUST** seguir siendo comprensibles sin specs, pruebas aplicadas, ramas,
   commits, reportes o listas de archivos revisados. No enlazar trabajo descartable
   desde conocimiento permanente; evidencia detallada permanece en el expediente.
4. El cierre **MUST** distinguir validado, cerrado y desplegado. Un script verifica
   condiciones declaradas, no demuestra que toda explicación sea verdadera.
5. El cierre **MUST** ser reanudable e idempotente. Una interrupción deja `closing`,
   no éxito parcial ni duplicados de decisiones/milestones.

## Retención y purga

1. `closed_at` usa UTC y `retain_until` suma exactamente 60 × 24 horas. El plazo es
   mínimo de elegibilidad, no orden automática de borrado.
2. La purga **MUST** ser explícita y tener previsualización; **MUST NOT** ejecutarse
   por update, check o cierre ni instalar un scheduler implícito.
3. **MUST** rechazar trabajo activo, cierre incompleto, fecha inválida, holds,
   agentes/locks activos, cambios locales no resueltos o referencias entrantes desde
   contenido retenido. Enlaces internos de un lote eliminado juntos son admisibles.
4. **MUST** restringir rutas a expedientes identificados, no seguir symlinks y revalidar
   antes de borrar. Un lote interrumpido conserva identidad y journal fuera de los
   destinos para completarse o restaurarse sin referencias retenidas rotas.
5. Reabrir **MUST** invalidar la elegibilidad previa; el nuevo cierre inicia otro plazo.
6. Purga **MUST NOT** borrar código/tests productivos, hacer commit/push/reset ni
   reescribir historial. Git puede conservar contenido antiguo: no es borrado seguro.

La comprobación decisiva es comprender el sistema y continuar su roadmap después
de retirar un expediente elegible sin recuperarlo.
