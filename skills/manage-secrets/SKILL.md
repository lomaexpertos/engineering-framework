---
name: manage-secrets
description: "Crea, rota, renombra o retira secretos, archivos SOPS, recipients age y contratos consumidores. No despliega ni revela valores sensibles."
---

# Manage Secrets

Entregar un cambio compatible del contrato de secretos sin revelar valores ni desplegarlo.

## Convenciones y autoridad

- Consultar `security/secrets.md`, `sops-age.md`, `encrypted-environment-contract.md`
  e `infrastructure/configuration.md` para el perfil aplicable.
- Para identidad, entrega de valores o acceso, cargar
  `security/sops-private-material.md`: rutas privadas únicas, sin búsquedas ni
  secretos por chat. El usuario deposita archivos; el asistente hace la importación
  y validación autorizadas. Archivo nuevo usa públicas; edición requiere privada.
- Usar SOPS/age y los artefactos de contrato aprobados: ciphertext, manifest cerrado,
  esquema sanitizado y consumidores. Mantenerlos consistentes en la misma revisión.
- Exigir autorización explícita para crear valores productivos, cambiar recipients
  o retirar acceso. Cambios de recipients son una operación separada; validar acceso
  nuevo antes de retirar el anterior.
- Mantener identidades privadas fuera de Git, logs, CI e imágenes. Inspeccionar
  nombres/contratos sin imprimir plaintext; no revelar valores ni material sensible.
- En proyecto nuevo o existente, documentar mapa de ambientes/unidades/servicios,
  públicas y consumidores y revisar ejecutores/materializador/CI frente a las Policies.
  Identificar overrides heredados; no afirmar que documentar ya los eliminó del código.
  Los ejecutores deben usar la ruta privada canónica; fixtures sintéticos son aislados.
  Aplicar los criterios de adopción de `sops-private-material.md` y los gates dotenv;
  no usar operaciones productivas para probar la política.
- Plaintext versionado solo para credenciales descartables de local/preview,
  aisladas de producción y sin acceso productivo, conforme a la Policy.
- No ejecutar el deployment ni alterar servicios externos.
- Validar el contrato con `bash .harness/check.sh --scope secrets`; para preparar
  herramientas usar `bash .harness/setup.sh` o añadir `--setup` al check.
  Diagnosticar sin instalar con `bash .harness/setup.sh --check`; adopción y límites
  en `.harness/core/checks/assurance/README.md`.
  El check no acredita descifrado, consumo real ni activación. Antes de entregar
  cambios ejecutar también el escaneo de `security` aplicable.

## Resultado esperado

Archivos y nombres de claves afectados, recipients públicos, evidencia de cifrado y
consistencia, activación/recuperación pendientes. El modelo elige cómo aplicar el contrato.
