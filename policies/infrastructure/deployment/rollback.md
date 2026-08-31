# Deployment rollback

## Purpose

Garantizar que cada cambio productivo tenga una respuesta explícita ante fallos sin
suponer que toda operación es reversible de la misma manera.

## Requirements

1. Cada unidad productiva **MUST** documentar rollback o recuperación antes de ejecutar
   un cambio material.
2. El procedimiento **MUST** identificar artefactos, configuración, secretos, estado y
   dependencias que deban restaurarse como conjunto.
3. La versión anterior **MUST** conservarse hasta que salud, exposición y flujo
   consumidor de la nueva versión hayan sido validados.
4. Un rollback **MUST NOT** restaurar archivos individuales si eso puede mezclar
   contratos de versiones distintas.
5. Cambios de esquema o estado irreversibles **MUST** declarar por qué no admiten
   rollback y cuál es su estrategia de recuperación o avance correctivo.
6. El procedimiento **MUST** especificar el criterio que lo activa, autoridad requerida,
   verificación posterior y estado final esperado.
7. La capacidad de recuperación **SHOULD** probarse periódicamente en un entorno seguro.
