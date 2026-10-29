---
name: manage-secrets
description: "Crea, rota, renombra o retira secretos, archivos SOPS, recipients age y contratos consumidores. No despliega ni revela valores sensibles."
---

# Manage Secrets

Entregar un cambio compatible del contrato de secretos sin revelar valores ni desplegarlo.

## Convenciones y autoridad

- Consultar `security/secrets.md`, `sops-age.md`, `encrypted-environment-contract.md`
  e `infrastructure/configuration.md` para el perfil aplicable.
- Usar SOPS/age y los artefactos de contrato aprobados: ciphertext, manifest cerrado,
  esquema sanitizado y consumidores. Mantenerlos consistentes en la misma revisión.
- Exigir autorización explícita para crear valores productivos, cambiar recipients
  o retirar acceso. Cambios de recipients son una operación separada; validar acceso
  nuevo antes de retirar el anterior.
- Mantener identidades privadas fuera de Git, logs, CI e imágenes. Inspeccionar
  nombres/contratos sin imprimir plaintext; no revelar valores ni material sensible.
- Plaintext versionado solo para credenciales descartables de local/preview,
  aisladas de producción y sin acceso productivo, conforme a la Policy.
- No ejecutar el deployment ni alterar servicios externos.

## Resultado esperado

Archivos y nombres de claves afectados, recipients públicos, evidencia de cifrado y
consistencia, activación/recuperación pendientes. El modelo elige cómo aplicar el contrato.
