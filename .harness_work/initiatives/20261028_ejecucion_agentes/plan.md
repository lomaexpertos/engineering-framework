# Plan aprobado: ejecución uniforme de agentes

Autorización: implementar íntegramente los 17 puntos mostrados al usuario.

1. CLI nativo Node22/24, Bash, sin npm, servidor, UI o BD.
2. Core actualizable, project/agents.json versionado, perfiles XDG personales, expedientes y runtime separados.
3. setup/doctor/prepare/run/status/collect/cancel; configuración asistida, diagnóstico, migración con backup.
4. Roles compartidos y perfiles personales; restricciones del proyecto no debilitables; calidad evaluada explícitamente.
5. Adaptadores Codex/Claude Code/OpenCode con capacidades verificadas oficialmente; Pi posterior. Escenarios Codex→OpenCode y Claude→OpenCode.
6. Contratos JSON de encargos y resultados: objetivos, alcance, ownership, permisos, dependencias, validación, evidencias y pendientes.
7. Contexto nuevo mínimo versionado; distinguir conversación/workspace/permisos efectivos; worktrees donde proceda.
8. Flujo definición inteligente→worker→revisión→corrección→verificación→cierre, escalamiento explícito.
9. Preguntas centralizadas por coordinador, needs_input estructurado, respuestas persistidas y bloqueo dependiente.
10. Revisiones funcional/pruebas, seguridad, logging/comentarios, UI y UX; aplicabilidad razonada, evidencia visual cuando corresponda.
11. Revisores misma versión sin escritura; hallazgos trazables consolidados, dos rondas por defecto, límites y ownership.
12. Estados reales, timeout, cancelación de procesos propios, recuperación y trazabilidad sin métricas inventadas.
13. Checkpoints de memoria tras decisiones/integración/bloqueos/interrupción/cierre; general <=100 líneas.
14. Integración ciclo existente y cierre sin trabajadores activos; consolidación y 60 días/purga explícita preservados.
15. Policies, skills y docs con progressive disclosure; AGENTS router <=100 líneas.
16. Pruebas config/roles/contratos/concurrencia/cancelación/recuperación/distribución/cierre; simulaciones distinguidas de clientes reales y dos recorridos mixtos.
17. Entregas lógicas con commits; sin selección autónoma modelos, recursión, integración automática ni reintentos ilimitados.

## Secuencia

- Contratos/perfiles y adaptadores (agent_profiles).
- Ejecutor, workflow y pruebas procesos (agent_runtime).
- Schemas, policies, skills y arquitectura (agent_docs).
- Distribución, lifecycle, integración, revisión independiente y auditoría de cobertura (coordinador).

## Evidencia requerida

Mapear cada requisito a fuentes implementadas y salida de comprobación; registrar limitaciones de cliente real como pendientes hasta verificarlas. No cerrar con evidencia simulada presentada como integración real.
