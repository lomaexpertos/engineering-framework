---
name: spec-documentar
description: Investiga y documenta módulos o dominios del repositorio actual y mantiene su AS-IS en docs/. No aplica a conversación general, otros sistemas ni propuestas TO-BE.
---

# Spec Documentar

Entregar conocimiento vigente que siga siendo útil sin el expediente de desarrollo.

## Activación y alcance

- Una petición de analizar, validar o documentar un módulo o dominio de este sistema
  activa investigación del repositorio y documentación AS-IS por defecto. Respetar
  restricciones explícitas como «solo analiza», «solo explícame», «sin archivos» o
  «no documentes»: realizar únicamente el análisis solicitado sin persistir
  documentación. «Solo analiza y documenta» sí autoriza documentación, sin cambios
  de código ni datos.
- Una conversación conceptual, una pregunta sobre el deber ser o una consulta de
  otro sistema no activa esta Skill ni autoriza inspección del repositorio,
  artefactos, registro de trabajo o ejecución del CLI del harness.
- Para investigar un dominio existente, leer
  [references/domain-investigation.md](references/domain-investigation.md).
  Validar una operación o documentar un cambio local cubre solo sus superficies
  afectadas; no exige reconstruir todo el módulo. Para actualizar conocimiento tras
  una implementación validada, revisar esas superficies sin repetir la investigación.

## Contrato

- Consultar `ai-assisted-development/project-artifact-layout.md` y
  `documentation-maintenance.md`; para dominios, aplicar también
  `ai-assisted-development/domain-documentation.md`. Leer fuentes y comportamiento
  afectados, con el código vigente como autoridad de lo implementado.
- Escribir en `docs/` y actualizar su router. Conservar una sola autoridad por tema.
  El recorrido de descubrimiento es `docs/README.md` →
  `docs/domains/<dominio>/README.md`; dividir datos, flujos o dependencias solo si
  tienen consulta independiente. Respetar estructura canónica
  existente, incluido el productor, sin migrarla implícitamente.
- Explicar propósito, capacidades, lenguaje, actores, permisos, estados,
  reglas/razones, contratos, datos, dependencias, configuración y límites con el
  detalle suficiente para responder preguntas habituales sobre el sistema real.
- Promover decisiones confirmadas e invariantes a sus fuentes duraderas. Una
  propuesta no se vuelve realidad por documentarla; no inventar razones de negocio.
- Distinguir evidencia estática, pruebas ejecutadas y comportamiento observado en
  ejecución. Un esquema declarado no acredita el estado de una base real;
  desconocido y no aplicable son resultados diferentes.
- No depender de specs, ramas, commits, pruebas aplicadas, archivos revisados o
  reportes para comprender el documento. Si la evidencia de trabajo necesita
  persistencia, conservarla en el expediente, sin exigir uno por documentar.
  Se permite fecha de revisión como mantenimiento, no un historial de ejecución.
- En flujos críticos, explicar trazabilidad real y cómo diagnosticar fallas, sin
  secretos. Si falta logging requerido, registrar brecha; documentar no lo implementa.
- No modificar código ni datos. Actualizar roadmap/memoria y registrar cierre usa
  `close-initiative`; no afirmar que la documentación por sí sola cierra el trabajo.
- Al cerrar una investigación o un cambio material, integrar el conocimiento nuevo
  en la fuente existente. No crear una nueva versión ni un archivo por sesión.

## Resultado

Fuente canónica fiel al comportamiento comprobado, router actualizado y límites
reales visibles. La documentación evita reconstruir el módulo para consultas
habituales; la revisión de código sigue siendo necesaria ante cambios, dudas o
decisiones que requieran mayor certeza. No crear documentos por cambios cosméticos
sin conocimiento nuevo.
