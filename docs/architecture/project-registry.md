# Project registry

`projects.yml` es el registro declarativo de repositorios autorizados para recibir
releases. Su esquema inicial se mantiene pequeño:

```yaml
schema_version: 1
projects:
  - repository: company/example
    enabled: true
    auto_merge: true
```

## Fields

- `repository`: identificador obligatorio `owner/name`.
- `enabled`: permite suspender distribución sin borrar la entrada ni su historial.
- `auto_merge`: solicita auto-merge para actualizaciones compatibles después de CI.

En la primera implementación, una release MAJOR requerirá revisión manual aunque
`auto_merge` sea `true`. La selección parcial de Policies o Skills no se incorpora
hasta demostrar una necesidad transversal, porque aumentaría combinaciones y reduciría
la consistencia entre consumidores.

El publisher debe rechazar entradas duplicadas, repositorios con formato inválido y
campos desconocidos antes de obtener credenciales o modificar repositorios externos.
