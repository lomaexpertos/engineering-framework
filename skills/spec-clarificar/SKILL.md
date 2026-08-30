---
name: spec-clarificar
description: Consolida respuestas y decisiones en una spec existente antes de planear, actualizando TO-BE, preguntas, clarificaciones y brechas sin reescribir AS-IS ni Best Practices.
---

# Spec Clarificar

Transformar respuestas sueltas en decisiones trazables dentro de una spec existente. No crear una spec desde cero, planear ni modificar código.

## Frontera

Escribir sólo:

- `engineering/specs/<slug>/spec.md`;
- `engineering/specs/<slug>/preguntas.md`;
- `engineering/specs/<slug>/checklist.md`;
- `engineering/specs/<slug>/clarificaciones.md`;
- `engineering/specs/<slug>/as-is.md`, `best-practices.md` y `brechas.md` cuando existan y la aclaración cambie su evidencia, aplicabilidad o estado.

No modificar `plan/`, `implementation/`, reportes de calidad ni `engineering/architecture/`. Se permite leer la arquitectura vigente y el código relevante para verificar una respuesta o detectar una contradicción.

## Entradas

Identificar el slug y leer:

- `spec.md`;
- `preguntas.md` y `checklist.md` si existen;
- `as-is.md`, `best-practices.md` y `brechas.md` si existen;
- `clarificaciones.md` u otros documentos de decisión del slug si existen;
- respuestas nuevas del usuario;
- `engineering/architecture/index.md` y snapshots pertinentes cuando ayuden a validar el comportamiento actual.

Si falta `spec.md`, detenerse y reportar la ruta. Si no existe `preguntas.md`, integrar las aclaraciones nuevas y crear preguntas estructuradas sólo cuando queden decisiones abiertas.

## Flujo

1. Extraer preguntas pendientes, respondidas y descartadas.
2. Mapear cada respuesta nueva con su pregunta o crear una entrada si introduce una decisión material.
3. Contrastar con arquitectura y código cuando la respuesta describa comportamiento existente o entre en conflicto con evidencia conocida.
4. Actualizar estado y `Respuesta o decisión` en `preguntas.md`.
5. Integrar la decisión en las secciones relevantes de `spec.md` y agregar el siguiente `RF-###` si crea un requisito.
6. Actualizar en `brechas.md`, si existe, el TO-BE, la desviación residual, el estado y los RF relacionados.
7. Modificar `as-is.md` sólo cuando exista evidencia nueva sobre el estado observado; registrar fecha y fuente sin reescribir retrospectivamente el punto de partida.
8. Modificar `best-practices.md` sólo cuando cambie una fuente, su vigencia, clasificación o aplicabilidad; una decisión del proyecto no transforma una recomendación en obligación.
9. Actualizar `checklist.md` sólo con cobertura demostrable.
10. Añadir una entrada breve en `clarificaciones.md`.
11. Declarar si la spec está lista para planear, lista con supuestos o bloqueada.

No alterar el sentido de la respuesta para hacerla encajar. Ante una contradicción, preservar la decisión más reciente confirmada, registrar el cambio y señalar cualquier efecto no resuelto.

Mantener `spec.md` como autoridad del TO-BE. No convertir automáticamente toda brecha contra Best Practice en alcance: cada brecha de implementación debe quedar cubierta por RF o marcada como pendiente, diferida, descartada o fuera de alcance.

## Bloqueos y supuestos

Bloquear el avance sólo si una pregunta pendiente puede cambiar materialmente alcance, datos, permisos, seguridad, integraciones, UX, NFR, restricciones, terminología, invariantes o casos borde. Mantener como supuesto una duda menor cuando exista una opción segura y la solución no dependa de ella.

No recomendar `$spec-planear` mientras una decisión material siga abierta. No bloquear por preguntas históricas ya descartadas ni por detalles sin efecto en la solución.

## Formatos

Leer [formatos.md](references/formatos.md) antes de normalizar preguntas o clarificaciones. Conservar la estructura clara de specs anteriores; no imponer un orden rígido de secciones.

Usar RF como convención predeterminada. No generar historias de usuario, story points ni fases sin solicitud, pero preservar convenciones existentes o decisiones explícitas del usuario.

## Cierre

Informar:

- decisiones integradas y RF afectados;
- brechas cuyo estado o desviación residual cambió;
- preguntas que permanecen abiertas y su impacto;
- estado `Lista para planear`, `Lista con supuestos` o `Bloqueada`;
- archivos creados o modificados.
