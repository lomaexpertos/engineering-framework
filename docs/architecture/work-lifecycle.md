# Continuidad, coordinación y cierre

## Qué se conserva

El proyecto separa tres clases de información:

- `docs/` explica producto, sistema, dominios, razones, decisiones e invariantes.
- Memoria operativa resume prioridades, restricciones temporales y puntos de entrada.
- Expedientes guardan definición futura, ejecución, resultados delegados y evidencia.

Una sesión nueva consulta el router y el resumen de la iniciativa elegida. No tiene
que reconstruir toda una conversación ni leer iniciativas históricas.
La [policy de memoria](../../policies/ai-assisted-development/memory-and-continuity.md)
define autoridad y límites; su resumen general tiene un máximo de 100 líneas.

## Coordinador y trabajadores

El coordinador mantiene alcance, relación con el usuario, decisiones transversales,
integración, verificación y cierre. Delega siempre que las capacidades y permisos
reales lo permitan, con objetivo, exclusiones, ownership, referencias mínimas y salida
verificable. Sin subagentes, declara el límite y ejecuta el contrato en secuencia.

Un único escritor mantiene cada archivo compartido. La entrega entre herramientas
puede usar filesystem común o worktrees; no presupone que los agentes ven la misma
copia. Una capa de delegación y dos trabajadores concurrentes son el presupuesto inicial,
ajustable según recursos e independencia; delegar no implica paralelizar.

La revisión se activa por riesgos del cambio: código, seguridad, integridad, UI/UX,
comentarios, logging y documentación. Un revisor puede cubrir varias dimensiones.
Se distingue independencia de autoevaluación y evidencia real de comprobación omitida.

## Registro de trabajo

El runtime `work.sh` permite crear/listar iniciativas, registrar transiciones,
reabrir, mantener holds, cerrar y purgar. El schema instalado define campos y estados;
la transición requiere confirmaciones explícitas cuando afecta preparación, integración
o cierre. El operador no debe interpretar esas confirmaciones como evidencia técnica
producida automáticamente.

El ciclo distingue draft, ready, active, blocked, validating, closing, closed y cancelled.
Una pausa se mantiene como bloqueo explícito hasta su reanudación; cancelar no afirma
entrega y cerrar no afirma despliegue.

## Consolidación antes del cierre

El coordinador consolida comportamiento/razones, decisiones e invariantes en las fuentes
canónicas, y resultados/pendientes altos en roadmap. La memoria deja de presentar la
iniciativa como activa. No se fabrican documentos o progreso para completar una lista.

`closure.json` registra reviewer, fecha de revisión y ocho categorías: validación,
revisiones, documentación, decisiones, invariantes, roadmap, backlog y memoria. Cada
categoría declara estado, razón y fuentes. El runtime comprueba el registro y existencia
ubicación de fuentes; la revisión semántica sigue siendo responsabilidad del coordinador.
`closure.md` es un resumen humano, no reemplaza el registro estructurado.

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
