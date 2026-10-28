---
name: spec-definir
description: Define o refina cambios funcionales y técnicos como especificaciones verificables bajo .harness_work/initiatives/. Usar cuando el usuario quiera convertir una iniciativa en una spec o integrar respuestas y decisiones en una spec existente, antes de planear o implementar.
---

# Spec Definir

Entregar la definición verificable del cambio; el modelo elige cómo obtenerla.

## Ubicación, nombres y autoridad

- Artefactos en español bajo `.harness_work/initiatives/<slug>/`.
  Slug nuevo: `YYYYMMDD_nombre_descriptivo`, fecha de creación y `snake_case` ASCII,
  sin espacios, acentos ni `ñ`. Conservar slugs existentes.
- `spec.md` es la autoridad del comportamiento futuro aprobado. Actualizarlo con
  las aclaraciones; no mantener otra narración de la misma decisión.
- No crear el plan técnico ni modificar código en esta etapa.
  `docs/` aporta AS-IS; no escribir allí una propuesta como realidad vigente.
- Conservar la estructura útil existente: problema, objetivo, alcance/exclusiones,
  reglas, requisitos `RF-###` y aceptación; actores, estados, datos o contratos según
  el cambio. Distinguir hechos, decisiones, supuestos y preguntas materiales.
- En operaciones críticas, incluir aceptación de logging desde el mismo desarrollo
  conforme a `development/logging.md`; no dejarlo como mejora posterior.
- AS-IS, referente y brechas solo si aportan una decisión o se solicitan. Pueden ser
  secciones o `as-is.md`, `best-practices.md`, `brechas.md` si su valor justifica
  separarlos. Un referente externo no es requisito sin decisión del proyecto.
- `preguntas.md` solo para decisiones materiales que convenga seguir aparte.
  No crear checklists, bitácoras o documentos vacíos por defecto.

## Resultado esperado

Spec lista para planear si alcance, comportamiento y aceptación son claros y no
quedan decisiones materiales sin resolver. Dudas menores admiten supuestos seguros
y visibles. Informar slug, archivos y pendientes.
Documentación de un módulo vigente usa `spec-documentar`, no una iniciativa nueva.
