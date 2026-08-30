---
name: code-review
description: "Usar para revisar una rama, PR, commit, patch o módulo buscando defectos funcionales, regresiones, mantenibilidad y pruebas. Enruta seguridad e integridad a revisiones especializadas."
---

# Code Review

Encontrar defectos accionables con evidencia, no producir un resumen decorativo.

## Alcance

1. Resolver base, target y conjunto exacto de cambios o archivos.
2. Leer instrucciones, Policies, documentación y pruebas aplicables.
3. Inspeccionar diff y contexto suficiente de consumidores y dependencias.
4. Identificar riesgos de seguridad, datos, migraciones, concurrencia, frontend,
   performance y operación.

Usar `security-review` para una auditoría de seguridad explícita y
`data-integrity-review` para pagos, inventario, concurrencia, idempotencia o efectos
distribuidos críticos.

## Workflow

1. Reconstruir el comportamiento anterior y el nuevo por flujo afectado.
2. Revisar caminos exitosos, errores, permisos, estados límite y compatibilidad.
3. Verificar que las pruebas detecten defectos relevantes y no solo ejecuten líneas.
4. Buscar validaciones debilitadas, errores silenciados y refactors fuera de alcance.
5. Ejecutar comprobaciones focalizadas cuando sean seguras y aporten evidencia.
6. Confirmar cada hallazgo contra código concreto y evitar especulación no accionable.
7. Ordenar hallazgos por severidad e impacto, no por categoría.

## Salida

Cada hallazgo incluye severidad, ubicación, escenario, impacto y corrección esperada.
Si no hay hallazgos, declarar riesgos residuales y validaciones no ejecutadas. No
modificar código durante la revisión salvo solicitud explícita posterior.
