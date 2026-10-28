# ADR-0011: Assisted installation with a shared synchronizer

Para versiones 2.x, distribución y layout evolucionan mediante
[ADR-0013](0013-project-harness.md). Se conserva esta decisión como contexto histórico.

- Status: Accepted
- Date: 2026-10-09

Actualización posterior del 2026-10-09: se retiraron los workflows por decisión del
mantenedor. La instalación asistida se mantiene; el canal central descrito en esta
decisión permanece suspendido hasta una restauración explícita.

## Context

El canal central de ADR-0001 requiere GitHub App, registro de consumidores y PRs.
La adopción actual necesita que el usuario invoque Codex desde un proyecto y decida
cuándo actualizar su rama, sin coordinar publicación masiva ni migrar su contexto
heredado de forma implícita.

## Decision

- `INSTALL.md` en la raíz es el único punto de entrada operativo del canal asistido.
  README y routers relevantes lo enlazan; no se añade otra Skill de instalación.
- Se obtiene `main` de la fuente central, se fija su SHA y se valida ese snapshot
  en Docker. Se instala una copia física, no una referencia dinámica a `main`.
- Se reutiliza `tooling/sync-consumer.mjs` con previsualización y preflight de seguridad.
  Se conservan layout, Policies, las dos copias de Skills y metadata de ownership.
- La sincronización asistida trabaja en la rama actual; no toca HEAD/índice ni crea
  commits, push o PR. El trabajo ajeno puede permanecer pendiente si no colisiona con
  rutas administradas. Downgrades, colisiones y ownership desconocido se detienen.
- El agente inventaría documentación e instrucciones heredadas, particularmente en
  la primera instalación. Las conserva y entrega recomendaciones; migración, borrado
  y cambios normativos locales requieren una tarea autorizada aparte.
- El workflow central sigue disponible como alternativa, sin consumidores habilitados.
  `projects.yml` aplica solo a ese canal. Habilitar entradas requiere decisión explícita.

## Consequences

No se instala una CLI permanente ni se copian docs operativas al consumidor. Los dos
canales producen las mismas salidas desde una sola fuente, sin refactorizar el layout.
La procedencia queda en versión y SHA; integrar el diff asistido en Git corresponde
al usuario. La escritura no promete atomicidad ante fallos de E/S.

Esta decisión amplía ADR-0001 y ADR-0003 sin retirar el bot, y mantiene el ownership
de ADR-0008. El canal compatible se introduce como versión `1.1.0`; el primer piloto
en un proyecto real sigue siendo una actividad posterior.
