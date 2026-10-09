# Checks

Aquí viven validaciones automáticas del propio framework y de los repositorios
consumidores. Markdown explica intención; el código del check es la autoridad sobre
lo que realmente se verifica.

## Familias previstas

- [`framework-version/`](framework-version/README.md): versión instalada y
  consistencia de metadata.
- [`framework-integrity/`](framework-integrity/README.md): archivos administrados y
  checksums.
- [`policy-validation/`](policy-validation/README.md): formato, enlaces y metadata
  normativa.
- [`repository-compliance/`](repository-compliance/README.md): contrato completo del
  consumidor.

Los checks consumidores previstos requieren una futura incorporación de CI. Los
workflows de este repositorio fueron retirados; la validación de la fuente se ejecuta
localmente en Docker y durante la instalación asistida, sin
instalar una CLI permanente en los equipos de los desarrolladores. En consumidores, el
check estable se llamará `engineering-framework-compliance`.
