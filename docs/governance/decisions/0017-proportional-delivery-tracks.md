# ADR-0017: Recorridos de entrega según riesgo

- Estado: Aceptada.
- Fecha: 2026-10-29.
- Sustituye parcialmente ADR-0013 y ADR-0016 en cantidad de etapas, artefactos y
  revisores; conserva ownership, autorización, aislamiento y verificación.

## Contexto

El flujo uniforme trataba una corrección local como una iniciativa completa:
definición, múltiples revisores y ocho categorías de cierre. Esa estructura
añadía costo sin producir conocimiento o confianza proporcionales, y podía hacer
de perfiles personales y artefactos un prerrequisito para cambios ya claros.

## Decisión

La autoridad normativa queda en la Policy de
[entrega proporcional](../../../policies/ai-assisted-development/proportional-delivery.md).
El coordinador elige el recorrido con la evidencia disponible. El runtime conserva
el recorrido y su razón, eleva por riesgos y por requisitos más estrictos del
proyecto, y trata el legado sin recorrido como reforzado.

La realización distingue ejecución directa opcional sin expediente, registros
compactos para trabajo acotado y el expediente completo cuando el riesgo lo
justifica. La revisión estándar agrupa dimensiones en un encargo funcional;
el flujo reforzado conserva independencia por riesgo. El cierre compacto registra
resultado y validación sin convertir ausencia de cambios documentales en ocho
declaraciones administrativas.

## Consecuencias

El CLI y los perfiles siguen disponibles para delegar; no son obligatorios para
una tarea mínima directa. La reducción de etapas no desactiva checks, pruebas
necesarias, controles del proyecto ni el ambiente reproducible. Si falta una
revisión requerida, se conserva pendiente.

Documentación, decisiones, roadmap y memoria cambian por conocimiento significativo
o continuidad. No se fabrican actualizaciones para completar un registro. Los
expedientes conservan las mismas protecciones de retención, reapertura y purga.

Los contratos y ejemplos instalados se prueban desde consumidores nuevos; una
comprobación estructural no certifica clasificación, aceptación ni independencia.
