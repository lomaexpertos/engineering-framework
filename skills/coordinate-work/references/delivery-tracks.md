# Operar recorridos mínimo y estándar

Leer después de elegir recorrido con la Policy
`ai-assisted-development/proportional-delivery.md`. Los comandos se ejecutan desde
la raíz del consumidor instalado. Su clasificación es responsabilidad del
coordinador; no se envía un formulario de clasificación al usuario.

## Mínimo directo

Una corrección clara, local, reversible y sin impacto material puede ejecutarse
directamente: inspeccionar el contexto necesario, modificar, comprobar el resultado
y resumir cambio y validación. No requiere iniciativa, perfiles personales, spec,
plan, definición, preguntas ni revisores adicionales. Los controles del proyecto y
el ambiente Docker siguen vigentes. Si emerge riesgo o incertidumbre, elevar el
recorrido antes de continuar la decisión afectada.

## Mínimo con un trabajador

Para usar el ejecutor, crear solo su registro compacto y comprobar el rol necesario:

```bash
bash .harness/work.sh create 20261029_ajuste_local --title "Ajuste local" --owner coordinador --track minimal --reason "Corrección local reversible con aceptación clara"
bash .harness/agents.sh doctor --roles implementation
```

`create` empieza en `active` y crea únicamente `state.json`; no preparar brief,
resume ni `ready` por defecto. Los archivos de workflow y encargo aparecen cuando
se usan. Guardar este ejemplo adaptado como `workflow-input.json` dentro del
expediente; `src/entrada.js` debe existir y ser el alcance real autorizado:

```json
{
  "id": "ajuste",
  "initiative": "20261029_ajuste_local",
  "track": "minimal",
  "assessment": {"reason": "Corrección local reversible con aceptación clara", "risks": []},
  "needs_definition": false,
  "objective": "Corregir el mensaje local de validación",
  "scope": ["Mensaje de validación en src/entrada.js"],
  "exclusions": ["Cambios de contrato público y despliegue"],
  "ownership": ["src/entrada.js"],
  "references": ["AGENTS.md"],
  "acceptance": ["Mensaje corregido y comportamiento existente comprobado"]
}
```

Incluir archivos de pruebas en ownership si se modificarán. No se exige
`applicability` ni motivos para dimensiones ausentes. `assessment` puede heredarse
del estado cuando ya describe el mismo trabajo.

```bash
bash .harness/agents.sh workflow create --input .harness_work/initiatives/20261029_ajuste_local/workflow-input.json
bash .harness/agents.sh workflow run 20261029_ajuste_local
bash .harness/agents.sh workflow status 20261029_ajuste_local
bash .harness/agents.sh workflow advance 20261029_ajuste_local --confirm --reviewer coordinador
```

Antes de `advance`, inspeccionar diff, aceptación y evidencia `passed` del
trabajador sobre la versión integrada. El recorrido pasa de implementación a
`ready_to_close`, sin crear tareas de definición ni revisión. Continuar con cierre
compacto en [closure-and-retention.md](../../close-initiative/references/closure-and-retention.md).

## Estándar con revisión agrupada

Para un cambio acotado en una superficie compartida, iniciar registro compacto y
diagnosticar implementación y revisión funcional:

```bash
bash .harness/work.sh create 20261029_ajuste_compartido --title "Ajuste compartido" --owner coordinador --track standard --reason "Cambio acotado con aceptación conocida en módulo compartido" --risk shared_surface
bash .harness/agents.sh doctor --roles implementation,functional
```

Ejemplo de input adaptado al archivo real:

```json
{
  "id": "compartido",
  "initiative": "20261029_ajuste_compartido",
  "track": "standard",
  "assessment": {"reason": "Cambio acotado con aceptación conocida en módulo compartido", "risks": ["shared_surface"]},
  "needs_definition": false,
  "objective": "Corregir una validación interna compartida",
  "scope": ["Validación interna en src/entrada.js"],
  "exclusions": ["Contrato público, datos críticos y despliegue"],
  "ownership": ["src/entrada.js"],
  "references": ["AGENTS.md"],
  "acceptance": ["Casos afectados corregidos y consumidores internos compatibles"]
}
```

Guardar en el expediente y operar con `workflow create/run/status/advance` como en
el mínimo. El ciclo es `implementation → review → ready_to_close`. La revisión crea
un solo encargo `functional` independiente del implementador, que cubre
comportamiento, pruebas y seguridad, logging/comentarios, UI/UX afectadas. No crea
un revisor por dimensión ni exige una matriz de no aplicables. El coordinador acepta
la versión final con evidencia y bloqueantes resueltos antes de avanzar.
El revisor puede reutilizar pruebas del autor identificándolas como heredadas y
marcar su repetición `not_run` con razón; debe aportar al menos evidencia `passed`
de inspección propia, por ejemplo del diff y sus interacciones. Una lista vacía o
solo `not_run` no acredita revisión. No necesita permiso shell para esa inspección.

Usar `needs_definition: true` cuando exista una incertidumbre material de alcance,
comportamiento o aceptación; el riesgo `uncertainty` también activa definición.
No crear preguntas si las fuentes disponibles permiten resolverla. Definir no
impone spec formal. Los hallazgos bloqueantes vuelven a corrección y revisión; las
respuestas, límites y recuperación usan las operaciones pertinentes de
[workflow-operations.md](workflow-operations.md).

## Elevación y compatibilidad

Los pisos de riesgo y `minimum_track` del proyecto prevalecen sobre el recorrido
solicitado. Un riesgo material de seguridad, datos, dinero, migración, contrato
público, producción o irreversibilidad activa reforzado. Declarar esos riesgos en
`assessment.risks` o en `work create --risk` con identificadores de la Policy.
Un workflow nunca rebaja el recorrido del expediente. No editar estados ni
snapshots para sortear esa validación. Los expedientes y workflows sin `track`
conservan el ciclo reforzado de [workflow-operations.md](workflow-operations.md).
