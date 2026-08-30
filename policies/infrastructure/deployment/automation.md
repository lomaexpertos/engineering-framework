# Deployment automation

## Requirements

Un entrypoint productivo **MUST**:

1. resolver rutas sin depender del directorio actual;
2. validar argumentos, identificadores y versiones antes de modificar el entorno;
3. ofrecer prechecks y un modo de diagnóstico sin cambios;
4. impedir ejecuciones concurrentes incompatibles sobre la misma unidad;
5. modificar únicamente la unidad solicitada;
6. respetar slots, profiles y ciclos independientes declarados;
7. validar salud y exposición después del cambio;
8. persistir estado únicamente después de la validación;
9. terminar con estado y código de salida inequívocos; y
10. documentar recuperación y rollback.

## Safety

- La automatización **MUST NOT** ejecutar una operación global cuando incluya slots
  inactivos, profiles excluyentes o unidades con ciclos independientes.
- Cambios de configuración, secretos, estado y deployment que no puedan coexistir
  **MUST** compartir el mismo lock.
- Scripts privilegiados **MUST** tener alcance cerrado y estar separados de entrypoints
  no privilegiados.
- Todo script ejecutable **MUST** declarar un shebang acorde con su intérprete.
- Los módulos reutilizables bajo una ruta como `scripts/lib/` **MUST NOT** actuar como
  entrypoints independientes.
- Diagnóstico y logs **MUST NOT** exponer secretos.
- Repetir una operación exitosa **SHOULD** converger al mismo estado sin trabajo
  destructivo innecesario.
