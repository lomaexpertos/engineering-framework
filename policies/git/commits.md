# Commits

## Requirements

1. Cada commit **MUST** representar una unidad lógica comprensible y **MUST NOT**
   incluir cambios no relacionados.
2. Antes de commitear, el diff staged **MUST** inspeccionarse para confirmar alcance,
   archivos inesperados, secretos y artefactos generados.
3. Los mensajes **MUST** seguir Conventional Commits y describir el resultado del
   cambio. Un cuerpo **SHOULD** añadirse cuando explique decisiones, validaciones,
   migraciones o riesgos que el título no comunique.
4. Código, pruebas y documentación que forman una misma unidad **MAY** permanecer en
   el mismo commit; separarlos **MUST NOT** dejar commits deliberadamente rotos.
5. Las validaciones relevantes **SHOULD** ejecutarse antes del commit o su omisión debe
   quedar visible en la entrega.
