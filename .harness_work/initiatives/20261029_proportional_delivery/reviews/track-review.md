# Revisión independiente de los tres recorridos

Alcance: Policy vigente, selección de recorrido, ejecución instalada, diagnóstico por
roles, revisión requerida y cierre compacto. La suite usa consumidores nuevos y sus
wrappers Bash; el cliente sintético prueba el protocolo local sin proveedor, modelo
ni credenciales personales.

## Resultado

Aprobado para el alcance revisado, sin bloqueantes abiertos. La pasada final de
`node tooling/test-proportional-delivery.mjs` terminó con código 0 sobre la fuente
actual y seis consumidores nuevos. `node --check tooling/test-proportional-delivery.mjs`
también terminó con código 0.

## Bloqueantes

Ninguno abierto.

## Hallazgos corregidos y revalidados

- **T1 — Cierre con revisión obsoleta.** La prueba que modifica `fixture.txt` tras
  completar el estándar ahora obtiene rechazo de `work.sh close ID --check`.
  `assertFinalDelivery` contrasta archivos con la entrega final antes del cierre;
  permite consolidar docs ajenos al ownership y protege docs incluidos en la entrega.
- **T2 — Revisión estándar sin control realizado.** La ausencia de evidencia o una
  lista exclusivamente `not_run` impide avanzar. Una inspección comprobada con
  `passed` puede coexistir con pruebas declaradas `not_run`, sin inventar su ejecución.
- **T3 — Ejemplos nuevos omitidos por el linter.** Las guías de los tres recorridos
  usan el mismo inventario para discovery y comprobación JSON. Las mutaciones de
  recorrido, riesgo y tipo de `needs_definition` son rechazadas en el consumidor.

## Recomendaciones

Ninguna adicional al alcance.

## Mejoras opcionales

Ninguna necesaria para esta entrega.

## Controles comprobados

- Mínimo directo sin expediente, perfil ni CLI de agentes.
- Mínimo delegado: `active` con solo `state.json`, un trabajador y cierre compacto
  sin ocho categorías ni documentos canónicos cuando no cambia conocimiento.
- Estándar con definición opcional, un trabajador y un revisor funcional que agrupa
  seguridad, logging, UI y UX; revisión realizada distinguida de pruebas omitidas.
- Legado sin `track`: definición, implementación, cinco revisores aplicables y
  verificación final; ocho ejecuciones en la fixture completa.
- Elevación por cada riesgo material, pisos por superficie/incertidumbre y proyecto,
  imposibilidad de rebajar el expediente y revisiones obligatorias del proyecto.
- Rechazo de tareas sin recoger, bloqueantes, validación vacía/fallida/no ejecutada,
  fuentes ausentes y manipulación de `required_reviews`.
- Guías de fuente y consumidor; rechazo de ejemplos con recorrido desconocido,
  riesgo inválido o `needs_definition` de tipo incorrecto.

## Entorno y límites

Node.js `v24.18.0`, Bash y Git nativos para mantenimiento del harness, según el
contrato de infraestructura autorizado. No se ejecutó código de un producto, no se
usaron imágenes ni contenedores y no se certificó calidad semántica de un modelo.
La suite limpia únicamente sus directorios temporales.
