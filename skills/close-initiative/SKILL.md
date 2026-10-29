---
name: close-initiative
description: Cierra o cancela un expediente con evidencia y consolidación proporcional al recorrido; inicia retención de 60 días sin borrarlo. Un mínimo directo no exige expediente.
---

# Close Initiative

Aplicar `ai-assisted-development/initiative-lifecycle.md`, `change-review.md` y
`documentation-maintenance.md`, con recorrido según `proportional-delivery.md`.
El coordinador responde por la consolidación semántica;
un comando solo comprueba lo que el contrato puede verificar.

Para cierre compacto o completo, previsualización, cancelación,
reapertura o retención, consultar
[closure-and-retention.md](references/closure-and-retention.md). La referencia se
distribuye con esta Skill y no requiere documentación del repositorio fuente.

## Contrato

- Confirmar aceptación y revisiones requeridas, bloqueantes resueltos y agentes
  terminados. Un recorte de alcance necesita acuerdo; cancelar no afirma entrega.
- Consultar ejecuciones del harness y reconciliar procesos interrumpidos antes del
  cierre. Contrastar entregas, hallazgos y pruebas con la versión integrada; una
  salida exitosa de proceso no equivale a aceptación ni a independencia de revisión.
- Actualizar fuentes canónicas con `spec-documentar` solo si cambió conocimiento
  significativo; mantener roadmap y memoria si cambia avance de alto nivel o
  continuidad. No fabricar actualizaciones, progreso ni documentos por casilla.
- Preparar `closure.json`: mínimo/estándar siguen
  `.harness/core/schemas/compact-closure.schema.json` con `reviewer`, `reviewed_at`,
  `summary`, `validation` y `sources`. Reforzado usa
  `.harness/core/schemas/closure.schema.json`.
  Reforzado y legado sin recorrido conservan las ocho categorías `validation`,
  `reviews`, `documentation`, `decisions`, `invariants`, `roadmap`, `backlog` y
  `memory`, con `status`, `reason` y `sources`. `complete` requiere fuentes existentes;
  `not_applicable` requiere razón solo en ese cierre completo. `closure.md` no
  sustituye el registro estructurado.
- Comprobar que conocimiento permanente no necesite ni enlace el expediente;
  distinguir revisión semántica de comprobaciones estructurales automatizadas.
- Ejecutar previsualización de cierre y registrar la transición mediante el runtime
  instalado, después de consolidar. No marcar cerrado con checks requeridos omitidos.
- Si se interrumpe, conservar `closing` y reanudar sin duplicar decisiones/milestones.
- El cierre inicia 60 días UTC de retención. No ejecutar purga ni programarla como
  efecto del cierre. Reabrir invalida elegibilidad y exige nuevo cierre/plazo.

## Resultado

Cierre verificable y fuentes afectadas vigentes, con límites reales. La evidencia
temporal permanece disponible durante su retención.
