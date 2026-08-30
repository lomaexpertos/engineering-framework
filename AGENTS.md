# Agent instructions

Este archivo es un router, no un manual. Consulta únicamente las fuentes necesarias
para la tarea actual.

## Invariantes

- Inspecciona el repositorio y sus convenciones antes de modificarlo.
- No debilites ni eludas Policies, validaciones o pruebas para completar una tarea.
- Evita refactors no relacionados y verifica el trabajo antes de declararlo terminado.
- No edites como fuente archivos generados o vendorizados.

## Routing

- Para reglas normativas, comienza en [`policies/README.md`](policies/README.md) y
  sigue el router del dominio aplicable.
- Para ejecutar un workflow repetible, consulta [`skills/README.md`](skills/README.md)
  y después la Skill correspondiente.
- Para arquitectura, distribución o contratos, consulta
  [`docs/architecture/README.md`](docs/architecture/README.md).
- Para versionado, ownership o cambios, consulta
  [`docs/governance/README.md`](docs/governance/README.md).
- Para validaciones automáticas, consulta [`checks/README.md`](checks/README.md).
- Para scripts de construcción o sincronización, consulta
  [`tooling/README.md`](tooling/README.md).

## Precedencia

1. Policies corporativas aplicables.
2. Restricciones documentadas del proyecto, cuando sean más estrictas.
3. Arquitectura y convenciones existentes del proyecto.
4. Preferencias del agente.

Una regla local no puede debilitar silenciosamente una Policy corporativa. Si existe
conflicto o se necesita una excepción, detén la decisión afectada, haz visible el
conflicto y utiliza el mecanismo de excepción documentado.
