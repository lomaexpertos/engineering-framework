---
name: manage-secrets
description: "Usar para crear, rotar, renombrar o retirar secretos, archivos SOPS, recipients age y contratos consumidores. No usar para configuración pública, despliegues ni para revelar valores sensibles."
---

# Manage Secrets

Cambiar el ciclo de vida de secretos sin exponer plaintext ni romper consumidores.

## Contexto y autorización

1. Leer Policies de secretos, SOPS/age, contrato cifrado y configuración.
2. Identificar ambiente, unidad, owner, consumidores y mecanismo aprobado.
3. Confirmar si el valor es productivo, efímero de local/preview o configuración
   pública.
4. Exigir autorización explícita para crear valores productivos, cambiar recipients o
   retirar acceso.

## Workflow

1. Inspeccionar nombres de claves y contratos sin imprimir valores.
2. Definir orden compatible entre consumidor, ciphertext, manifest cerrado, esquema
   sanitizado y runtime.
3. Editar secretos productivos únicamente mediante SOPS en un entorno confiable.
4. Mantener identidades privadas fuera de Git, logs, CI e imágenes.
5. Cambiar recipients como operación separada; validar acceso nuevo antes de retirar
   el anterior.
6. Actualizar en la misma revisión todos los artefactos del contrato afectado.
7. Verificar cifrado, conjunto exacto de claves, permisos y ausencia de plaintext sin
   mostrar contenido.
8. Documentar activación, rollback o recuperación sin ejecutar el deployment.

## Credenciales efímeras

Solo permitir plaintext versionado para local o preview cuando sea descartable,
aislado y sin acceso productivo. Nunca reclasificar una credencial productiva copiándola.

## Entrega

Reportar archivos y claves por nombre, recipients públicos afectados, validaciones y
activación pendiente. Nunca incluir valores, hashes reversibles ni salida descifrada.
