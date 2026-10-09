# Architecture overview

## Componentes

1. **Fuente:** Policies, Skills, plantillas y checks versionados en este repositorio.
2. **Versión:** `VERSION` identifica el contenido corporativo publicado.
3. **Instalación asistida:** `INSTALL.md` guía a Codex; un snapshot de `main` se
   valida y sincroniza desde Docker sobre la rama actual del consumidor.
4. **Canal central opcional:** workflows y GitHub App crean branches y Pull Requests
   para consumidores habilitados en el registro.
5. **Consumer:** conserva físicamente Policies, metadata y Skills de una versión.
6. **Integración consumidor:** el desarrollador revisa e integra el cambio asistido;
   en el canal central, CI y las protecciones gobiernan el merge del PR.

## Límites

- `policies/` contiene normas corporativas, no descripciones de productos.
- `skills/` contiene procedimientos corporativos repetibles, no peculiaridades de un sistema.
- `docs/` describe este framework y su gobierno.
- `docs/`, `tooling/`, workflows y el registro de proyectos son internos y no se
  distribuyen a consumidores.
- En consumidores, `engineering/corporate/` y las copias corporativas de Skills son
  salidas generadas por el mismo sincronizador en ambos canales.
- En consumidores, `engineering/docs/`, `engineering/specs/` y
  `engineering/quality-review/` son propiedad del proyecto y se crean únicamente
  cuando exista contenido real.
- `checks/` verifica; `tooling/` valida y sincroniza desde la fuente.

## Progressive disclosure

`AGENTS.md` dirige a un router de dominio. El router identifica los pocos documentos
aplicables, y una Skill los combina con documentación y código del proyecto. Esta
jerarquía evita cargar todo el framework en cada tarea.
