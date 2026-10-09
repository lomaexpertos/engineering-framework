# Project registry

`projects.yml` es el registro declarativo exclusivo del canal central: repositorios
autorizados para recibir actualizaciones por GitHub App. No controla la instalación
asistida local de [`INSTALL.md`](../../INSTALL.md), que depende de la autorización
del usuario sobre el consumidor actual. Su esquema se mantiene pequeño:

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

Todos los repositorios deben pertenecer al owner configurado en
`ENGINEERING_FRAMEWORK_CONSUMER_ORGANIZATION`. Un registro vacío es válido y hace que
la publicación termine sin solicitar un token de la GitHub App.

En la primera implementación, una release MAJOR requerirá revisión manual aunque
`auto_merge` sea `true`. La selección parcial de Policies o Skills no se incorpora
hasta demostrar una necesidad transversal, porque aumentaría combinaciones y reduciría
la consistencia entre consumidores.

El workflow debe rechazar entradas duplicadas, repositorios con formato inválido y
campos desconocidos antes de obtener credenciales o modificar repositorios externos.
