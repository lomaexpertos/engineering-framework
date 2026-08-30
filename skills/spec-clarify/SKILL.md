---
name: spec-clarify
description: "Usar cuando el usuario responda, cambie o descarte preguntas de una spec existente. Integra las decisiones en el TO-BE y actualiza brechas y estados sin reescribir evidencia AS-IS."
---

# Spec Clarify

Consolidar decisiones nuevas sin perder historia ni contaminar hechos observados.

## Workflow

1. Leer spec, análisis, preguntas y clarificaciones existentes.
2. Asociar cada respuesta con la pregunta y requisito afectados.
3. Distinguir decisión, corrección factual, preferencia, descarte y nueva pregunta.
4. Actualizar el TO-BE, criterios de aceptación y brechas relacionadas.
5. No alterar AS-IS salvo que exista evidencia nueva; registrar la fuente de la
   corrección.
6. Detectar respuestas que contradigan Policies u otras decisiones y hacer visible el
   conflicto.
7. Marcar preguntas resueltas, reemplazadas o todavía abiertas sin borrarlas
   silenciosamente.
8. Recalcular si la spec está lista para planeación.

## Entrega

Resumir decisiones incorporadas, documentos modificados, contradicciones y preguntas
que aún bloquean `spec-plan`.
