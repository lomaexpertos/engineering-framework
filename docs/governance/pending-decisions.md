# Pendientes de evolución

Estos temas no constituyen contratos implementados ni autorizaciones de ejecución.

## Compatibilidad y adopción

- Extender la validación de clientes a flujos reales de adopción y subagentes.
  Discovery de instrucciones y skills tiene smoke reproducible con CLI reales;
  no equivale a certificar comportamiento de modelos, GUI ni providers productivos.
- Adoptar un consumidor real con reconciliación explícita de contexto heredado; el
  actualizador nunca traslada su documentación por su cuenta.
- Evaluar un adaptador OpenCode cuando exista un consumidor y evidencia de su contrato.
- Resolver skills homónimas instaladas globalmente en equipos adoptados, sin borrarlas
  como efecto de actualizar un proyecto.

## Contratos especializados

- Metadata normativa de Policies y formato verificable de excepciones, conservando
  los datos mínimos y aprobación definidos por la Policy de precedencia.
- Schema/validador de deployment, consistencia de secretos cifrados, comprobación SOPS
  sanitizada y controles de infraestructura por ambiente según necesidad real.
- Ampliar adaptadores de linters por stacks usados en proyectos reales, sin imponer
  un analizador único ni instalar dependencias del producto en el host.
- Completar normas organizacionales de IaC, contenedores, red, cifrado general,
  control de acceso y restauración cuando existan decisiones propias verificables.

## Operación y distribución

El canal central y los workflows de Actions continúan suspendidos. Restaurarlos
requiere decisión y validación aparte; los helpers conservados no equivalen a soporte
operativo vigente para 2.x. `projects.yml` no dispara instalaciones.

La actualización local usa manifest de hashes para integridad; no aporta firmas del
publicador. Una evolución de autenticidad de releases requiere un contrato adicional.
No hay scheduler de purga ni plataforma de observabilidad central incluida.
