# Architecture overview

## Componentes

1. **Fuente:** Policies, Skills, plantillas y checks versionados en este repositorio.
2. **Release:** tag SemVer inmutable cuyo valor coincide con `VERSION`.
3. **Builder:** genera una distribución determinista y un manifest de integridad.
4. **Publisher:** usa una GitHub App para actualizar consumidores mediante PR.
5. **Consumer:** conserva físicamente Policies, metadata y Skills de una versión.
6. **Compliance:** verifica el contrato sin depender de la rama `main` del framework.

## Límites

- `policies/` contiene normas corporativas, no descripciones de productos.
- `skills/` contiene procedimientos corporativos repetibles, no peculiaridades de un sistema.
- `docs/` describe este framework y su gobierno.
- En consumidores, `engineering/corporate/` es generado y
  `engineering/project/` pertenece al equipo del producto.
- `checks/` verifica; `tooling/` construye y sincroniza.

## Progressive disclosure

`AGENTS.md` dirige a un router de dominio. El router identifica los pocos documentos
aplicables, y una Skill los combina con documentación y código del proyecto. Esta
jerarquía evita cargar todo el framework en cada tarea.
