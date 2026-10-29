# Continuidad, coordinación y cierre

## Qué se conserva

El proyecto separa tres clases de información:

- `docs/` explica producto, sistema, dominios, razones, decisiones e invariantes.
- Memoria operativa resume prioridades, restricciones temporales y puntos de entrada.
- Expedientes guardan definición futura, ejecución, resultados delegados y evidencia.

Una pregunta general puede quedarse en conversación sin iniciar este ciclo. Analizar
el módulo actual puede producir conocimiento canónico directamente, sin convertirlo
en una propuesta de cambio. El límite de intención está en
[conocimiento de dominios](domain-knowledge.md).

Una sesión nueva consulta el router y el resumen o registro del trabajo elegido. No tiene
que reconstruir toda una conversación ni leer iniciativas históricas.
La [policy de memoria](../../policies/ai-assisted-development/memory-and-continuity.md)
define autoridad y límites; su resumen general tiene un máximo de 100 líneas.

## Coordinador y trabajadores

El coordinador mantiene alcance, relación con el usuario, decisiones transversales,
integración, verificación y cierre. Elige mínimo, estándar o reforzado según
[entrega proporcional](../../policies/ai-assisted-development/proportional-delivery.md),
sin pedir al usuario la clasificación. Mínimo permite ejecución directa; el
estándar utiliza un trabajador y un revisor funcional agrupado; reforzado mantiene
el flujo completo y revisión independiente por riesgo. La falta de capacidad para
una revisión requerida queda pendiente, sin simular independencia.

Un único escritor mantiene cada archivo compartido. La entrega entre herramientas
puede usar filesystem común o worktrees; no presupone que los agentes ven la misma
copia. Una capa de delegación y dos trabajadores concurrentes son el presupuesto inicial,
ajustable según recursos e independencia; delegar no implica paralelizar.

La revisión se activa por riesgos del cambio: código, seguridad, integridad, UI/UX,
comentarios, logging y documentación. Un revisor puede cubrir varias dimensiones.
Se distingue independencia de autoevaluación y evidencia real de comprobación omitida.

El [ejecutor uniforme](agent-execution.md) conecta perfiles personales y requisitos
del equipo con encargos/entregas versionados. Las preguntas materiales pasan por el
coordinador. La memoria se actualiza cuando cambia conocimiento significativo o
continuidad; no se crean resúmenes ni actualizaciones por evento sin esa necesidad.

## Registro de trabajo

El runtime `work.sh` permite crear/listar iniciativas, registrar transiciones,
reabrir, mantener holds, cerrar y purgar. El schema instalado define campos y estados;
la transición requiere confirmaciones explícitas cuando afecta preparación, integración
o cierre. El operador no debe interpretar esas confirmaciones como evidencia técnica
producida automáticamente.

`create --track minimal|standard --reason ...` comienza en `active` y crea solo
`state.json`. No genera brief/resume, spec ni plan. `--risk` acepta identificadores
separados por comas y eleva el recorrido cuando corresponde. Reforzado comienza en
`draft` con brief/resume; la ausencia de `track` conserva ese contrato heredado.
La ejecución mínima directa puede omitir el registro completo.

El ciclo distingue draft, ready, active, blocked, validating, closing, closed y cancelled.
Una pausa se mantiene como bloqueo explícito hasta su reanudación; cancelar no afirma
entrega y cerrar no afirma despliegue.

| Estado | Siguientes estados permitidos |
| --- | --- |
| draft | ready o closing |
| ready | active o closing |
| active | validating, blocked o closing |
| blocked | active o closing; una pausa exige reanudación explícita |
| validating | active al corregir fallos, o closing |
| closing | active al retomar trabajo, closed o cancelled mediante cierre |
| closed / cancelled | active mediante reapertura; invalida el plazo anterior |

Preparación, integración y entrada en closing requieren `--confirm`: es una
atestación del coordinador después de revisar las condiciones, no evidencia que el
comando produzca por sí mismo. El cierre exige además el registro de su recorrido
y ausencia de tareas/bloqueantes activos.

## Consolidación antes del cierre

El coordinador promueve conocimiento significativo a las fuentes canónicas y
mantiene resultados/pendientes altos cuando afectan el roadmap. La memoria deja de
presentar la iniciativa como activa si tenía una entrada. No se fabrican documentos,
actualizaciones ni progreso para completar una lista.

En módulos, la consolidación reconcilia explicaciones, flujos, mapas, inventarios y
conteos afectados por los cambios materiales. Reutiliza lo ya conocido y comprueba
las premisas modificadas; no repite una investigación global. Inventariar AS-IS no
demuestra avance de una capacidad futura del producto.

`closure.json` mínimo/estándar registra `reviewer`, `reviewed_at`, `summary`,
`validation` y `sources`. La validación incluye comando, resultado y evidencia;
fuentes puede quedar vacío si no cambió conocimiento permanente. No genera
`closure.md`. El reforzado y legado sin recorrido conservan ocho categorías:
validación, revisiones, documentación, decisiones, invariantes, roadmap, backlog y
memoria, cada una con estado, razón y fuentes; además generan resumen humano.
El runtime comprueba formato y fuentes; la revisión semántica sigue siendo del
coordinador. Los ejemplos operativos están en la
[guía de cierre](../../skills/close-initiative/references/closure-and-retention.md).

La documentación permanente conserva sentido aunque desaparezcan specs, reportes,
ramas, commits y listas de pruebas ejecutadas. Los detalles de verificación permanecen
en el expediente. Los ADR vigentes forman parte del conocimiento permanente.

## Retención y eliminación

Un cierre completo registra fecha UTC y sesenta periodos de 24 horas de retención.
Al cumplirse el plazo, el expediente es elegible; no se elimina automáticamente.
La purga es explícita y tiene previsualización. Holds, bloqueantes, tareas activas,
referencias entrantes necesarias y cambios locales no resueltos impiden el borrado.

Un lote pasa por preparación recuperable con journal fuera de sus destinos. Si se
interrumpe, se recupera la preparación o se completa la eliminación según su fase,
sin declarar éxito parcial. Los locks de dueño desconocido requieren inspección.
Reabrir invalida la elegibilidad anterior y un nuevo cierre inicia otro plazo.

La purga no borra código o tests productivos ni reescribe Git. El historial puede
conservar versiones antiguas: este mecanismo gestiona contexto, no borrado seguro.
