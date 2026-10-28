---
name: close-initiative
description: Cierra o cancela una iniciativa consolidando docs, decisiones, invariantes, roadmap y memoria; inicia retención de 60 días sin borrar el expediente.
---

# Close Initiative

Aplicar `ai-assisted-development/initiative-lifecycle.md`, `change-review.md` y
`documentation-maintenance.md`. El coordinador responde por la consolidación semántica;
un comando solo comprueba lo que el contrato puede verificar.

## Contrato

- Confirmar aceptación y revisiones requeridas, bloqueantes resueltos y agentes
  terminados. Un recorte de alcance necesita acuerdo; cancelar no afirma entrega.
- Consultar ejecuciones del harness y reconciliar procesos interrumpidos antes del
  cierre. Contrastar entregas, hallazgos y pruebas con la versión integrada; una
  salida exitosa de proceso no equivale a aceptación ni a independencia de revisión.
- Actualizar fuentes canónicas con `spec-documentar`: comportamiento/razones,
  decisiones confirmadas e invariantes. No duplicar explicación en el cierre.
- Actualizar milestone y pendientes de alto nivel en `docs/roadmap/`; conservar
  tareas minuciosas solo cuando una iniciativa activa las necesite. No fabricar
  progreso, porcentaje o disponibilidad productiva a partir de commits/pruebas.
- Consolidar memoria general y punto de continuación. Preparar `closure.json` según
  `.harness/core/schemas/closure.schema.json`: `reviewer`, `reviewed_at` y categorías
  `validation`, `reviews`, `documentation`, `decisions`, `invariants`, `roadmap`,
  `backlog` y `memory`, cada una con `status`, `reason` y `sources`. `complete` requiere
  fuentes existentes; `not_applicable` requiere razón. Ese registro es la entrada
  legible por el runtime; `closure.md` es resumen humano y no lo sustituye.
- Comprobar que conocimiento permanente no necesite ni enlace el expediente;
  distinguir revisión semántica de comprobaciones estructurales automatizadas.
- Ejecutar previsualización de cierre y registrar la transición mediante el runtime
  instalado, después de consolidar. No marcar cerrado con checks requeridos omitidos.
- Si se interrumpe, conservar `closing` y reanudar sin duplicar decisiones/milestones.
- El cierre inicia 60 días UTC de retención. No ejecutar purga ni programarla como
  efecto del cierre. Reabrir invalida elegibilidad y exige nuevo cierre/plazo.

## Resultado

Conocimiento y roadmap vigentes, memoria limpia y cierre verificable con límites
reales. La evidencia temporal permanece disponible durante su retención.
