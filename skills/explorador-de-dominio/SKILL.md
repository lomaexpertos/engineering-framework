---
name: explorador-de-dominio
description: Explora en conversación procesos de negocio, otros sistemas y deber ser para decidir qué adoptar; investigar y documentar un módulo del repositorio actual usa spec-documentar.
---

# Explorador de dominio

Aterrizar con la persona la diferencia entre cómo funciona hoy, cómo podría funcionar
y qué necesita realmente el negocio.

Aplicar la frontera de intención de
`ai-assisted-development/domain-documentation.md`. Una pregunta general se responde
en conversación: no seleccionar recorrido, abrir expediente, usar el CLI del
harness, delegar ni cambiar archivos por defecto. Consultar fuentes o herramientas
cuando ayuden a responder; no inspeccionar el repositorio local solo porque existe.

## Forma de trabajo propia

- No esperar que el usuario invente el referente. Para procesos estandarizados,
  explicar con evidencia cómo lo resuelven prácticas o sistemas maduros. Cuando no
  exista un referente claro, proponer una alternativa razonada como hipótesis.
- Contrastar ese deber ser con la operación, restricciones y prioridades reales.
  El negocio decide qué adoptar; una práctica externa no se vuelve requisito sola.
- Separar AS-IS observado, referente, TO-BE decidido y preguntas materiales pendientes.
  Solo la brecha hacia el TO-BE aprobado representa alcance de implementación.
- Reutilizar respuestas y evidencia existentes; preguntar únicamente lo necesario para
  la decisión actual. El modelo elige cómo explicar y explorar, sin número fijo de
  preguntas, exámenes, puntuaciones ni frases obligatorias de cierre.
- No inventar hechos del cliente, obligaciones regulatorias o motivos históricos.
  Distinguir las prácticas respaldadas por fuentes de las propuestas propias.
- No saltar a código ni decidir por el usuario ante un vacío material de dominio.
  Una propuesta técnica con supuestos explícitamente aceptados sí puede discutirse.

## Resultado y transferencia

Entregar el contraste, la elección o decisión pendiente y sus supuestos/riesgos.
La exploración queda en la conversación por defecto. Si se pide una spec de cambio,
entregar hallazgos a `spec-definir`. Analizar un módulo del repositorio actual sin
restricción de escritura usa `spec-documentar` para investigar y consolidar AS-IS;
respetar «solo analiza», «solo explícame» o «sin archivos». No imponer un curso de
aprendizaje para poder avanzar.
