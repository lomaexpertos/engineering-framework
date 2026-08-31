# Architecture overview

## Componentes

1. **Fuente:** Policies, Skills, plantillas y checks versionados en este repositorio.
2. **Versión:** `VERSION` identifica el contenido corporativo publicado.
3. **Workflows centrales:** validan `main` y publican manualmente las copias.
4. **GitHub App:** crea branches y Pull Requests en los consumidores autorizados.
5. **Consumer:** conserva físicamente Policies, metadata y Skills de una versión.
6. **CI consumidor:** valida el PR antes de que auto-merge lo integre a `main`.

## Límites

- `policies/` contiene normas corporativas, no descripciones de productos.
- `skills/` contiene procedimientos corporativos repetibles, no peculiaridades de un sistema.
- `docs/` describe este framework y su gobierno.
- `docs/`, `tooling/`, workflows y el registro de proyectos son internos y no se
  distribuyen a consumidores.
- En consumidores, `engineering/corporate/` y las copias corporativas de Skills son
  administradas por el bot.
- `checks/` verifica; `tooling/` solo auxilia al workflow central.

## Progressive disclosure

`AGENTS.md` dirige a un router de dominio. El router identifica los pocos documentos
aplicables, y una Skill los combina con documentación y código del proyecto. Esta
jerarquía evita cargar todo el framework en cada tarea.
