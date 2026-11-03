# Auditoría de definición, uso y descubrimiento operativo

## Alcance y criterio

Se auditó la entrega de agentes 3.1.0 y los caminos de instalación/actualización,
checks, trabajo y cierre. La corrección 3.2.0 debe poder operarse desde un consumidor
sin consultar el checkout productor. La revisión distingue contratos y ejemplos
verificables de decisiones y evidencia semántica que corresponden al coordinador.

## Hallazgos y resultado

| Superficie | Hueco observado | Corrección y evidencia |
| --- | --- | --- |
| Descubrimiento | Skill no llevaba a comandos instalados | Cuatro referencias desde skills; test-agent-discovery instala y recorre core/Codex/Claude. |
| Configuración | Modelo/proveedor, setup noTTY y permisos ambiguos | profiles-and-start explica elecciones, JSON, doctor y límites; JSON se valida contra runtime. |
| Iniciativa | No se distinguía estado de iniciativa y workflow | Guías crean brief, ready/active y explican que advance no cambia state; ejemplos ejecutados. |
| Entradas y salida | Formatos no estaban juntos al uso | Task/workflow/answers/decisions/escalation/closure documentados; guías JSON + CLI instalado comprobados. |
| CLI | Sin ayuda; flags/aridad ignorados | Ayuda cuatro wrappers y contratos compartidos; test-agent-cli/test-harness-usage. |
| Root explícito | Wrapper inyectaba root duplicado | Wrapper respeta root del usuario; prueba instalada. |
| Preguntas/reintentos | Recogida impedía responder; contexto perdía preguntas previas | Resultados de intento preservados, respuestas y reanudación verificadas en test-agent-execution. |
| Ownership | Reintento de escritor recogido podía solaparse | Revalidación bajo work.lock al lanzar; prueba rechaza segundo ownership. |
| Procesos | Cancelación huérfana no concluía; cancel de review obsoleto bloqueaba recuperación | Identidad, cancelación y conservación/invalidez de entrega comprobadas con subprocess fixtures. |
| Baseline | No había instrucción operable ante cambio o verificación fallida | Cancelar y reconciliar nuevo expediente/ciclo conservando evidencia; no editar snapshots. Límite del runtime explícito. |
| Checks propios | No había ejemplo ejecutable de runner/captura de evidencia | operations.md distribuido, help y runner JSON probado con validador real. |
| Actualización | Faltaba entrada de uso/discovery normal | Router instalado enlaza operación, ref/check/recover/repair y ownership, ayuda sin fetch. |
| Cierre | Categorías sin comandos/purga accesibles | Guía completa con preview, cancelación, reapertura, holds y 60 días; ejemplos de cierre y retención ejecutados. |
| Control continuo | Guías podían perderse y seguir verde | check context/documentation y validate-framework exigen recursos, rutas, copias y ejemplos. |
| Falsos negativos | Comando sin flags obligatorios, imagen latest, cierre complete sin fuentes | Contratos compartidos del parser/runners, schema cierre alineado y probes negativos. |
| Extensiones locales | Riesgo de confundir local skills y ejemplos de negocio con contratos del harness | Adaptadores corporativos seleccionados diferenciados; prueba local/profilecore y JSON dominio válido. |
| Operación segura del linter | Parsear shell podía heredar startup, y helper directo salía silenciosamente | Bash sólo -n con env acotado, probe BASH_ENV; módulo interno devuelve2 con entrada correcta. |

## Validación y fuentes

- evidence/native-node24.log: suite general con lint, aprobada.
- evidence/optional-node22.log: suite general en imagen opcional Node22, aprobada.
- evidence/final-focused.log: revalidación de ajustes finales del parser, runners,
  schema/guías, lifecycle, lint y estructura sobre integración final.
- reviews/consumer-audit.md y reviews/operability-review.md: revisiones independientes.
- test-guide-check comprueba fuente y consumidores nuevos, scopes normales de check,
  perfiles filtrados, copies y mutaciones deliberadas. No sustituye aceptación de modelo.

El control normal no ejecuta los comandos de los ejemplos, no usa proveedores ni
lee configuración personal. Bash se usa como parser. Las pruebas de consumidor sí
ejecutan el runtime del harness con fixtures explícitos y sin inferencia. La calidad
de modelos y los resultados del producto no se declaran certificados por estos tests.

## Evaluación de alcance

No quedan hallazgos de definición, routing o uso abiertos dentro de estas operaciones.
Nuevas guías/contratos deben ampliar el inventario y sus regresiones; los controles
estructurales no pretenden demostrar toda interpretación posible de un agente.
