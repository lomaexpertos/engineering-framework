---
name: spec-documentar
description: Crea o actualiza la documentación canónica de un módulo ya existente o una funcionalidad ya implementada bajo engineering/docs/, explicando su comportamiento vigente, sus reglas y razones de negocio y su realización técnica. Usar cuando el usuario pida la documentación final, actual o fuente de verdad de un módulo, o después de una implementación validada que cambie materialmente ese conocimiento; no usar para propuestas futuras.
---

# Spec Documentar

Entregar una fuente de verdad del módulo vigente, no una propuesta ni una bitácora.

## Ubicación, nombres y autoridad

Escribir únicamente:

```text
engineering/docs/index.md
engineering/docs/<modulo>/README.md
```

Módulo estable en `snake_case` ASCII, sin fecha, espacios, acentos ni `ñ`.
Actualizar el README existente; Git conserva historia. `index.md` es solo router.
Concentrar documentación y diagramas en ese README; no crear `negocio.md`,
`flujos.md` o `tecnico.md`.

Leer documentación legada como evidencia; no moverla ni mantener otra autoridad
vigente sin una transición autorizada. No modificar código, datos, specs o planes.

## Contrato del contenido

Documentar comportamiento ya existente y validado: propósito, reglas y razones
conocidas, actores, estados, datos, contratos y realización técnica pertinentes.
El modelo decide secciones y diagramas; no exigir inventarios de clases o columnas.

En módulos críticos, explicar su trazabilidad real: eventos/correlación, decisiones
o cálculos reconstruibles y dónde se diagnostican fallas, sin valores sensibles.
Si falta logging requerido por `development/logging.md`, señalar la brecha;
documentarlo no sustituye implementarlo ni autoriza inventar evidencia.

Distinguir decisiones confirmadas de inferencias y exponer discrepancias de autoridad.
Incluir fecha/commit de verificación y límites reales. Usar esta Skill por solicitud
de documentación vigente o cambio material, no por notas temporales o cambios cosméticos.

## Resultado esperado

README canónico fiel a la evidencia y router actualizado si cambia la cobertura.
Informar módulo, archivos, verificación y vacíos; no presentar TO-BE como AS-IS.
