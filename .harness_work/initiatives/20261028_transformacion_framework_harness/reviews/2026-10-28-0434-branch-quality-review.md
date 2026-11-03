# Revisión final de calidad e integración

Fecha: 2026-10-28. Revisor: agente `distribution`, por encargo del coordinador.
Rama: `alorancam-ajusta-consistencia-framework`.
Base Git observada: `019c35bb1f87d3ed51966745639d04e8ef1a5546`.
HEAD observado: `6a2b6194f7e47925076ce99d2a014578114ae631`, más el worktree de
integración actual, que el coordinador continúa consolidando.

## Alcance e independencia

Lectura de `harness-check.mjs`, `harness-manifest.mjs`, `harness-profiles.mjs`,
`harness-runner-plan.mjs`, lógica nueva de `check.sh`, `harness-work.mjs`, schemas,
piloto de ciclo de vida y smoke de clientes. Se contrastaron RF-002, RF-007, RF-008,
RF-013, RF-014, RF-015 y RF-018 de la especificación.

El revisor fue autor de distribución; esa superficie queda fuera de este veredicto
independiente y tiene una revisión separada por el agente lifecycle. También creó el
wrapper mínimo inicial de check: la revisión de `check.sh` cubre principalmente el
dispatch y las protecciones añadidas después por el coordinador, sin presentar
autoevaluación del wrapper original como independencia completa.

Se reutilizó un agente existente con contexto previo. No se midió el ahorro de tokens
ni se certifica aislamiento de contexto del cliente a partir de esta revisión.

## Veredicto

**Entregable** en las superficies revisadas: no quedan bloqueantes ni recomendaciones
pendientes después de revalidar las correcciones FQ-001 y FQ-002. El veredicto no
sustituye la ejecución final del suite completo sobre el commit que el coordinador
entregue.

## Bloqueantes pendientes

Ninguno demostrado en el estado revalidado.

### FQ-001 — Check requerido de scope reservado podía quedar aprobado sin evidencia

Estado: **corregido y revalidado** antes de este veredicto.

Fuente: `tooling/harness-check.mjs`, selección del bloque de extensiones y agrupación
de resultados; interacción con `runnerPlan()` y `check.sh`.

Condición reproducida: check local `required: true`, `scope: documentation`, comando
`false` y resultado externo válido con `exit_code: 1`. La rama anterior omitía los
checks de proyecto al seleccionar un scope incorporado. El reporte observable era
`{"schema_version":1,"results":[],"ok":true}`. El wrapper podía ejecutar el check
fallido y terminar con un falso éxito, incumpliendo RF-014 y RF-018.

El coordinador corrigió la selección para incluir checks de proyecto coincidentes,
también en scopes incorporados, y agruparlos bajo el scope solicitado.

Se repitió el contraejemplo sobre las fuentes actuales montadas read-only en Docker:

- Con `exit_code: 1`: `check-execution: failed`, `ok: false`.
- Sin evidencia de ejecución: `check-execution: failed`, `ok: false`.

La protección ya no depende de que se ejecute el checker sin `--scope`. El coordinador
añadió además regresiones para los cinco scopes incorporados en el piloto integrado.

## Recomendaciones

### FQ-002 — `checks: null` se acepta aunque el schema exige un array

Estado: **corregido y revalidado**; no queda como recomendación pendiente.

Fuente: `tooling/harness-runner-plan.mjs`, normalización `config.checks || []`;
contraste con `schemas/project-config.schema.json`, propiedad `checks`.

Reproducción confirmada en Docker: con `{"schema_version":1,"checks":null}`,
`runnerPlan()` devuelve `checks: []` y `checkRepository(...,{scope:'extensions'})`
devuelve `configuration: passed`, `ok: true`. El mismo patrón permite valores falsy
como `false` o `0`, aunque no cumplen el contrato declarado.

Impacto: una configuración malformada puede interpretarse como ausencia de checks.
No se demostró omisión de un check requerido que siga declarado en ese JSON; por eso
se clasifica como recomendado, no como bloqueo de entrega.

Corrección mínima: distinguir campo ausente de campo presente inválido y validar el
tipo antes de aplicar el default. Añadir regresiones para `null`, `false` y `0`.

El coordinador aplicó esa corrección. En la revalidación independiente dentro de
Docker, `runnerPlan()` y el checker con scope `extensions` rechazaron por configuración
inválida los tres valores (`null`, `false`, `0`). La ausencia del campo conservó el
default correcto de lista vacía. No se modificó código durante esta revalidación.

## Opcionales

No se añaden preferencias cosméticas ni refactors al alcance.

## Evidencia, protecciones y límites

Los contraejemplos se ejecutaron en la imagen `engineering-distribution:work`,
contenedor efímero sin red, importando las fuentes actuales desde un mount read-only
`/review`. Los fixtures vivieron en `/tmp` del contenedor. La única escritura en el
repositorio de esta revisión es este reporte.

Se observaron las siguientes protecciones pertinentes:

- Checks declarados como argv, imágenes explícitas, timeout y contenedores sin
  privilegios, red host ni socket Docker; limpieza limitada por nombre/label propio.
- Ledger de resultados vinculado al hash de configuración; ausencia de evidencia
  requerida y errores se distinguen del éxito.
- Manifest con validación compartida de forma, ownership, hashes y adaptadores;
  el checker inspecciona contenido administrado desconocido.
- El cierre rechaza dependencias temporales mediante parser Markdown compartido,
  incluye enlaces de referencia y mantiene fechas UTC/retención coherentes.
- El piloto declara explícitamente sus handoffs y revisión como fixtures; no afirma
  haber ejecutado un modelo ni una revisión independiente humana dentro del fixture.
- El smoke de clientes usa binarios CLI reales y captura peticiones al transporte
  local: distingue discovery de certificación semántica, subagentes o modelo real.

Esta auditoría no ejecutó otra vez todo el suite completo ni el smoke de clientes;
esos resultados pertenecen a la validación del coordinador. Tampoco publica releases,
valida cuentas externas ni declara deployments productivos. La revisión semántica
de promoción documental sigue siendo responsabilidad del coordinador; ningún check
estructural demuestra por sí solo que se conservaron todas las razones de negocio.
