# Detección de secretos

## Alcance

Aplica al adoptar o ejecutar el control de secretos del harness y antes de entregar
cambios que puedan introducir credenciales. Complementa
[secrets.md](secrets.md); detectar un patrón no verifica si una credencial está activa.

## Contrato

1. El control **MUST** declarar su alcance: árbol de trabajo, cambios desde una base
   explícita o historial disponible completo. **MUST NOT** presentar un diff de
   trabajo como revisión del historial ni acreditar un historial superficial como
   completo.
2. El escaneo de cambios **MUST** incluir cambios sin commit, índice, archivos nuevos
   no ignorados y commits desde la base declarada. Un secreto añadido y luego
   eliminado de un commit sigue formando parte de ese alcance.
3. El harness **MUST** fijar una versión comprobada de Gitleaks y sus reglas
   predeterminadas. Configuración local, variables de entorno, baselines,
   `.gitleaksignore` o comentarios de exclusión **MUST NOT** reducir silenciosamente
   el control corporativo.
4. Un hallazgo **MUST** identificar regla, archivo y línea sin imprimir valores,
   coincidencias, fragmentos, parches ni salida cruda del proceso. Los reportes
   temporales **MUST** tener acceso privado y eliminarse al terminar.
5. Herramienta ausente, versión incompatible, timeout, conflicto de índice,
   reporte inválido, alcance incompleto o cambio concurrente **MUST** impedir
   acreditar éxito. No instalar herramientas como efecto del check.
6. Un hallazgo **MUST** revisarse: si es real, revocar o rotar conforme a su autoridad;
   borrar el texto no acredita retirar acceso. Un falso positivo **MUST** justificarse
   con ubicación y regla; una excepción requiere la aprobación y vigencia de
   [precedencia](../precedence.md), sin ocultar el resultado del escaneo.
7. Un control requerido **MUST** conservar evidencia sobre la versión entregada.
   Su ejecución se selecciona según el cambio y la Policy de
   [entrega proporcional](../ai-assisted-development/proportional-delivery.md);
   no añade un workflow a una pregunta conversacional o a un check de documentación.

## Control disponible

[La guía instalada](../../checks/security/README.md) define operación, alcance,
instalación explícita, límites y clasificación de resultados. Un resultado sin
hallazgos significa que las reglas no detectaron patrones en ese alcance; no
demuestra ausencia de todos los secretos ni reemplaza autorización o revisión.
