# Coordinación y delegación

## Alcance

Trabajo de proyecto conducido por un agente coordinador, con o sin subagentes nativos.

## Contrato

1. El coordinador **MUST** delegar ejecución y revisión siempre que las capacidades
   reales y las instrucciones de la sesión lo permitan. Conserva alcance, relación
   con el usuario, dependencias, integración, verificación y cierre.
2. Sin capacidad de delegación, **MUST** declarar el límite y trabajar en secuencia;
   no simular agentes ni invocar otros proveedores o credenciales implícitamente.
3. Cada encargo **MUST** identificar objetivo, resultado esperado, alcance/exclusiones,
   ownership de escritura, referencias mínimas, dependencias, permisos y validación.
4. El trabajador **MUST** recibir contexto acotado. No heredar toda la conversación
   por defecto; si el cliente lo impone, hacer visible esa limitación.
5. Cada archivo compartido **MUST** tener un solo escritor. El coordinador serializa
   routers, memoria general, roadmap y contratos con ownership superpuesto.
6. La delegación **MUST NOT** ampliar autorización ni permitir deploy, push, acceso a
   secretos o efectos externos no incluidos en la tarea original.
7. El presupuesto inicial **SHOULD** ser una capa de delegación y dos trabajadores
   concurrentes, limitado por la herramienta. Puede ajustarse por independencia y
   recursos; delegar no exige paralelizar ni crear roles permanentes.
8. El resultado **MUST** indicar conclusión, cambios, verificación ejecutada/omitida,
   hallazgos, pendientes y candidatos a conocimiento duradero. Logs extensos viven
   en el expediente, no en la conversación coordinadora.
9. El coordinador **MUST** inspeccionar resultado/diff y verificar integración. El
   mensaje de éxito del trabajador no sustituye evidencia del resultado conjunto.
10. Antes de cerrar, purgar o actualizar rutas en uso, **MUST** confirmar fin o
    cancelación de trabajadores y revalidar ownership y estado. Un lock no excluye
    escritores que no respeten el protocolo.
11. Worktrees o artefactos de entrega **MUST** usarse cuando el cliente no comparte
    filesystem o haya superposición; no asumir que otros agentes ven los cambios.

Los encargos y resultados se guardan en
`.harness_work/initiatives/<id>/agents/<task-id>/`.
