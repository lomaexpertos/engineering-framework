# Checks

Aquí viven validaciones automáticas del propio framework y de los repositorios
consumidores. Markdown explica intención; el código del check es la autoridad sobre
lo que realmente se verifica.

## Familias previstas

- [`framework-version/`](framework-version/README.md): versión instalada y
  compatibilidad del manifest.
- [`framework-integrity/`](framework-integrity/README.md): archivos administrados y
  checksums.
- [`policy-validation/`](policy-validation/README.md): formato, enlaces y metadata
  normativa.
- [`repository-compliance/`](repository-compliance/README.md): contrato completo del
  consumidor.

La interfaz objetivo es un comando idempotente `engineering-framework verify` y un
check de CI estable llamado `engineering-framework-compliance`.
