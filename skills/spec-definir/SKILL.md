---
name: spec-definir
description: Define o refina cambios funcionales y técnicos como especificaciones verificables bajo engineering/specs/. Usar cuando el usuario quiera convertir una iniciativa en una spec o integrar respuestas y decisiones en una spec existente, antes de planear o implementar.
---

# Spec Definir

Producir la especificación más sencilla que permita comprender y validar el cambio.
Esta Skill cubre tanto la definición inicial como sus aclaraciones posteriores.

## Ubicación y autoridad

- Escribir los artefactos de definición únicamente en `engineering/specs/<slug>/` y
  mantenerlos en español.
- Para una iniciativa nueva usar `YYYYMMDD_nombre_descriptivo`, con la fecha de
  creación y un nombre `snake_case` sin espacios, acentos ni `ñ`. Mantener el slug al
  actualizar y no renombrar expedientes legados por iniciativa propia.
- Mantener `spec.md` como autoridad del comportamiento futuro aprobado.
- No crear el plan técnico ni modificar código durante esta etapa.
- Consultar `engineering/docs/` cuando contenga documentación vigente del módulo,
  pero no escribir allí comportamiento que todavía no ha sido implementado.

## Definir o refinar

1. Entender el problema, el resultado esperado, el alcance y las restricciones ya
   proporcionadas.
2. Leer la documentación y el código directamente relacionados hasta comprender el
   comportamiento afectado. Ajustar la profundidad al riesgo y evitar investigar el
   módulo completo sin necesidad.
3. Distinguir hechos observados, decisiones confirmadas, supuestos y preguntas
   pendientes.
4. Crear o actualizar `spec.md`, preservando la información vigente y la estructura
   clara que ya exista.
5. Cuando el usuario aporte aclaraciones, integrarlas en la spec y actualizar o cerrar
   sus preguntas; no mantener una segunda narración de la misma decisión.

Investigar AS-IS, Best Practices o brechas sólo cuando cambien una decisión, revelen
un riesgo material o hayan sido solicitados. Pueden vivir como secciones de `spec.md`
o como `as-is.md`, `best-practices.md` y `brechas.md` si su volumen o valor
independiente lo justifican. Una práctica recomendada no se convierte en requisito sin
una decisión del proyecto.

Si el usuario sólo quiere documentar cómo funciona actualmente un módulo ya
construido, usar `$spec-documentar` en lugar de crear una iniciativa futura.

## Contenido útil

Incluir en `spec.md`, con la profundidad que requiera el cambio:

- problema, objetivo, alcance y exclusiones;
- comportamiento esperado y reglas de negocio;
- requisitos funcionales `RF-###` y criterios de aceptación verificables;
- actores, datos, estados, permisos, integraciones o requisitos no funcionales cuando
  sean relevantes;
- supuestos, riesgos y preguntas capaces de cambiar materialmente la solución.

Crear `preguntas.md` sólo cuando existan decisiones materiales pendientes que resulte
útil seguir por separado. No crear por defecto checklists, bitácoras de aclaraciones ni
documentos auxiliares vacíos.

## Preparación

La spec está lista para planear cuando el alcance, el comportamiento y la aceptación
sean comprensibles y no quede una decisión material sin resolver. Las dudas menores
pueden permanecer como supuestos explícitos si existe una opción segura y reversible.

Al cerrar, indicar el slug, los archivos modificados y si la spec está lista para
planear o qué decisiones materiales siguen pendientes.
