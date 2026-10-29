---
name: branch-quality-review
description: Revisa una rama, PR, rango de commits o patch contra su base para decidir si es entregable. Reporta defectos con evidencia y separa bloqueantes, recomendaciones y mejoras opcionales; no audita todo el repositorio.
---

# Branch Quality Review

Decidir si el cambio solicitado es entregable, sin ampliar la revisión a todo el repositorio.

## Alcance y restricciones

- Verificar artefacto, base real, rango, objetivo y criterios de aceptación.
  Revisar superficies modificadas; ampliar solo por una interacción o riesgo concreto.
- Aplicar las Policies de los dominios afectados y convenciones del proyecto.
  En operaciones críticas, verificar logging implementado y evidencia conforme a
  `development/logging.md`; su ausencia no es una tarea opcional posterior.
- No reportar deuda preexistente salvo que el cambio la agrave o dependa de ella.
  No imponer patrones, índices, locks ni abstracciones por preferencia.
- No modificar código, pruebas, migraciones ni configuración. La única escritura
  propia de la revisión es el reporte. No publicar comentarios, aprobar, mergear ni
  reescribir historia sin una petición adicional.
- Aplicar `ai-assisted-development/change-review.md`, `proportional-delivery.md` y
  `coordination.md`. Delegar si la independencia requerida o el alcance lo necesita,
  con superficies/ownership delimitados; la disponibilidad de agentes no obliga a
  crear otro auditor. Distinguir revisión independiente de autoevaluación.

## Evidencia y clasificación

Cada hallazgo necesita ubicación, condición concreta, comportamiento/impacto,
evidencia, protecciones consideradas y corrección mínima. Una sospecha no basta;
si falta confirmación, registrar pregunta o limitación. No hay cuota de hallazgos.

- **Bloqueante:** defecto introducido/agravado, escenario realista, impacto material,
  protección insuficiente y confianza alta; incluye incumplir una Policy de entrega
  aplicable como logging obligatorio en el flujo crítico modificado.
- **Recomendado:** problema concreto con impacto limitado, poco probable o recuperable.
  Una prueba faltante no bloquea por sí sola salvo obligación o falta de otra
  evidencia razonable para un flujo crítico.
- **Opcional:** preferencia o mejora sin impacto demostrado; como máximo cinco,
  ninguna obligatoria para entregar.

El modelo decide cómo revisar y validar. Usar infraestructura aislada para validaciones;
una comprobación omitida es una limitación, no automáticamente un defecto.

## Reporte y veredicto

Crear exactamente un reporte por ejecución en:

```text
.harness_work/initiatives/<YYYYMMDD_nombre_descriptivo>/reviews/YYYY-MM-DD-HHMM-branch-quality-review.md
```

Reutilizar el slug de una spec relacionada; en otro caso usar fecha de creación y
`snake_case` ASCII. Incluir metadata/alcance, veredicto, hallazgos por clasificación,
preguntas, validaciones y limitaciones; plan mínimo solo para bloqueantes.
Es evidencia temporal: no enlazarlo individualmente en routers permanentes.

Veredictos: **No entregable** si hay bloqueantes demostrados;
**Entregable con recomendaciones** si solo hay correcciones valiosas no obligatorias;
**Entregable** si no se encontraron defectos materiales.
Sin bloqueantes, declarar que recomendaciones/opcionales no impiden el merge.
