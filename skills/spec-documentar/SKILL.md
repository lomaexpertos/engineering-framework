---
name: spec-documentar
description: Documenta comportamiento ya implementado, reglas y razones duraderas en docs/. No documenta propuestas como realidad ni sustituye el cierre de iniciativa.
---

# Spec Documentar

Entregar conocimiento vigente que siga siendo útil sin el expediente de desarrollo.

## Contrato

- Consultar `ai-assisted-development/project-artifact-layout.md` y
  `documentation-maintenance.md`; leer fuentes y comportamiento afectados.
- Escribir en `docs/` y actualizar su router. Conservar una sola autoridad por tema.
  Un dominio puede usar `docs/domains/<dominio>/README.md`; dividir reglas, flujos o
  contratos solo si tienen consulta independiente. Respetar estructura canónica
  existente, incluido el productor, sin migrarla implícitamente.
- Documentar propósito, lenguaje, reglas/razones, actores, estados, contratos,
  límites, operación y realización técnica que expliquen el sistema real.
- Promover decisiones confirmadas e invariantes a sus fuentes duraderas. Una
  propuesta no se vuelve realidad por documentarla; hipótesis se identifican.
- No depender de specs, ramas, commits, pruebas aplicadas, archivos revisados o
  reportes para comprender el documento. Esa evidencia vive en el expediente.
  Se permite fecha de revisión como mantenimiento, no un historial de ejecución.
- En flujos críticos, explicar trazabilidad real y cómo diagnosticar fallas, sin
  secretos. Si falta logging requerido, registrar brecha; documentar no lo implementa.
- No modificar código ni datos. Actualizar roadmap/memoria y registrar cierre usa
  `close-initiative`; no afirmar que la documentación por sí sola cierra el trabajo.

## Resultado

Fuente canónica fiel al comportamiento comprobado, router actualizado y límites
reales visibles. No crear documentos por cambios cosméticos sin conocimiento nuevo.
