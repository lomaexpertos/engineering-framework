# Local environment

## Purpose

Proveer un ambiente reproducible en la estación del desarrollador sin heredar riesgos
ni supuestos de producción.

## Requirements

1. El ambiente local **MUST** iniciar su infraestructura mínima mediante un comando o
   entrypoint documentado.
2. **SHOULD** permitir seleccionar grupos de servicios mediante profiles u otro
   mecanismo explícito cuando no todos sean necesarios.
3. **SHOULD** evitar nombres, puertos y recursos que colisionen innecesariamente.
4. La persistencia de datos **MUST** ser intencional y contar con un procedimiento de
   limpieza.
5. Overrides personales **MUST NOT** mezclarse con configuración compartida.
6. Toda credencial versionada en texto plano **MUST** ser deliberadamente desechable,
   estar aislada de producción y poder revocarse sin impacto operativo.
7. Su README **MUST** documentar requisitos, inicio rápido, perfiles, endpoints,
   persistencia, rebuild, dependencias remotas y limpieza.
8. El nombre `localstack` **MUST NOT** usarse salvo que el ambiente utilice realmente
   el producto LocalStack.
