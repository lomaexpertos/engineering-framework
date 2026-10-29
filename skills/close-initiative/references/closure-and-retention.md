# Consolidar y registrar cierre instalado

Leer después de aceptar el alcance o decidir cancelarlo. Ejecutar desde la raíz del
consumidor instalado. La autoridad normativa sigue en las Policies de ciclo de vida;
esta referencia describe entradas y comandos del runtime distribuido.

## Verificar estado y consolidar

```bash
bash .harness/work.sh status 20261028_validar_entrada
bash .harness/agents.sh workflow status 20261028_validar_entrada
```

El segundo comando sólo aplica si existe workflow. Su etapa debe ser
`ready_to_close` o `cancelled`. Consultar cada tarea y recoger terminadas; cancelar
trabajadores restantes cuando corresponda. Un `result.json` exitoso no sustituye
pruebas reales de la versión integrada ni aceptación. El runtime rechaza tareas sin
recoger, incluidas preparadas/fallidas; revisar antes de finalizar ownership.

Para cierre entregado, una vez integrada y validada la versión:

```bash
bash .harness/work.sh transition 20261028_validar_entrada validating --confirm
```

Si falla validación, `transition ID active` devuelve a implementación; no cerrar
omisiones requeridas. El estado `validating` no ejecuta pruebas. Después de resolver
revisiones y consolidar conocimiento:

```bash
bash .harness/work.sh transition 20261028_validar_entrada closing --confirm
```

Cancelar el workflow no cancela la iniciativa: tras documentar aprendizajes y alcance
no entregado, pasar a `closing --confirm` desde el estado abierto permitido y usar
`close --cancelled`. No afirmar entrega por una cancelación.

Actualizar fuentes existentes cuando cambie conocimiento significativo o
continuidad. Retirar entradas activas existentes y conservar punto de continuación
para pendientes reales. Las fuentes permanentes no deben depender de expedientes ni
reportes temporales. No crear documentos ni actualizaciones para llenar categorías.

## Entrada estructurada y comprobación

El formato depende del recorrido registrado, según
`ai-assisted-development/proportional-delivery.md`. Crear `closure.json` en el
expediente: `.harness/core/schemas/compact-closure.schema.json` para mínimo/estándar
y `.harness/core/schemas/closure.schema.json` para reforzado o legado.

### Cierre compacto: mínimo y estándar

El coordinador identifica el resultado y la evidencia sin ocho categorías ni
motivos para dimensiones ausentes. Ejemplo ilustrativo para un expediente mínimo;
sustituir fecha, comando y evidencia por lo observado antes de usarlo:

```json
{
  "reviewer": "coordinador",
  "reviewed_at": "2026-10-29T12:00:00.000Z",
  "summary": "Corrección local comprobada sobre la versión integrada",
  "validation": [
    {"command": "Comprobación documentada del proyecto en su contenedor", "outcome": "passed", "evidence": "Resultado observado que confirma los casos afectados"}
  ],
  "sources": []
}
```

`sources` puede quedar vacío cuando no cambió conocimiento permanente; si cambió,
incluir las fuentes existentes bajo `docs/` o `.harness_work/memory/`.
No crear `brief.md`, `resume.md`, páginas de roadmap ni ocho `not_applicable` para
cerrar. Una entrega requiere al menos una validación `passed` y ninguna `failed`
o `not_run`. Una cancelación puede dejar `validation: []`, con razón en `summary`,
sin afirmar alcance entregado. Las revisiones de estándar siguen siendo requisito
del workflow, aunque el registro de cierre sea compacto.

El cierre usa los mismos comandos `transition validating/closing` y `close --check`
de esta guía, con el ID de su expediente. Mínimo directo sin expediente termina
con la respuesta de cambio y comprobación; no necesita crear uno para cerrarlo.

### Cierre completo: reforzado y legado

En `.harness_work/initiatives/20261028_validar_entrada/closure.json`, el recorrido
reforzado conserva las ocho categorías. Ausencia de `track` mantiene este formato.
Ejemplo ilustrativo: sustituir fecha,
revisor, rutas y razones por evidencia observada antes de usarlo. Las rutas de
`sources` son relativas a la raíz del consumidor y deben existir.

```json
{
  "reviewer": "coordinador",
  "reviewed_at": "2026-10-28T12:00:00.000Z",
  "validation": {"status": "complete", "reason": "Aceptación comprobada sobre la versión integrada", "sources": [".harness_work/initiatives/20261028_validar_entrada/validation.md"]},
  "reviews": {"status": "complete", "reason": "Revisiones requeridas resueltas sobre la versión entregada", "sources": [".harness_work/initiatives/20261028_validar_entrada/reviews.md"]},
  "documentation": {"status": "complete", "reason": "Contrato vigente actualizado", "sources": ["docs/system.md"]},
  "decisions": {"status": "not_applicable", "reason": "No hubo decisiones duraderas nuevas", "sources": []},
  "invariants": {"status": "not_applicable", "reason": "No cambió ninguna invariante", "sources": []},
  "roadmap": {"status": "complete", "reason": "Resultado y siguiente milestone reconciliados", "sources": ["docs/roadmap.md"]},
  "backlog": {"status": "not_applicable", "reason": "No quedaron pendientes fuera del alcance", "sources": []},
  "memory": {"status": "complete", "reason": "Retirado de trabajo activo y continuación actualizada", "sources": [".harness_work/memory/current.md"]}
}
```

`complete` requiere fuentes existentes; `not_applicable` requiere una razón real.
Las fuentes de categorías permanentes deben estar en `docs/`, excepto `memory`, que
admite `.harness_work/memory/`. `validation` y `reviews` pueden citar evidencia del
expediente. El ejemplo no obliga a crear `validation.md`, `reviews.md` ni esos nombres
de docs: usar fuentes reales. `closure.md` no reemplaza el JSON; el comando genera
ese resumen humano. El coordinador responde por la verdad de la consolidación.

```bash
bash .harness/work.sh close 20261028_validar_entrada --check
bash .harness/work.sh close 20261028_validar_entrada
bash .harness/work.sh status 20261028_validar_entrada
```

Para cancelación, usar `--cancelled` tanto en previsualización como en cierre.
`--check` no escribe. El cierre verifica registros, fuentes, bloqueos y referencias
prohibidas; no demuestra semántica, independencia ni ejecución real de pruebas.
Repetir cierre del mismo tipo es idempotente. Una interrupción conserva `closing`
para consolidar/reintentar; no escribir manualmente estado final ni fechas.

## Retención, reapertura y purga explícita

El cierre fija `closed_at` UTC y `retain_until` exactamente 60 × 24 horas después.
No ejecuta ni agenda purga. Reabrir con `bash .harness/work.sh reopen ID` conserva el
cierre anterior como evidencia, vuelve a `active` e invalida fechas de elegibilidad;
el próximo cierre inicia nuevo plazo.

Cuando se solicite purga explícitamente, inspeccionar primero:

```bash
bash .harness/work.sh purge 20261028_validar_entrada --check
```

Sólo después de revisar el lote autorizado, ejecutar el mismo comando sin `--check`.
`purge --eligible --check` previsualiza todos los elegibles, no sólo la iniciativa
actual. No usar `--eligible` para ampliar silenciosamente una eliminación solicitada.
El runtime rechaza plazo pendiente, holds, agentes, cierre inválido, cambios locales,
symlinks y referencias entrantes retenidas. No borrar evidencia para hacer pasar el
check ni confundir purga con borrado seguro del historial Git.

`hold ID --reason "motivo"` impide elegibilidad; `hold ID --release` retira el hold
cuando se resuelve el motivo. Una purga interrumpida deja operation UUID y journal en
`.harness_work/runtime/purge/<UUID>/journal.json`. Inspeccionarlo antes de recuperar:
`work.sh recover UUID --restore` restaura preparación interrumpida; `recover UUID`
completa un lote preparado o en eliminación. Una vez comenzada eliminación definitiva
no se permite restaurar. No usar este recovery para agentes o updates ni borrar
journals/locks para forzar el paso.
