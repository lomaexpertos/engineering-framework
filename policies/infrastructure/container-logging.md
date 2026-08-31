# Container logging

## Scope

Esta Policy aplica a aplicaciones ejecutadas en contenedores Docker de producción.
El contrato aplicativo se define en
[`../development/logging.md`](../development/logging.md).

## Docker ownership

1. Docker **MUST** capturar `stdout` y `stderr` mediante el driver `local`, configurado
   por servicio o como default del daemon, salvo una excepción aprobada o una
   plataforma con un contrato equivalente.
2. Retención y rotación **MUST** estar acotadas mediante defaults administrados o las
   opciones `max-size` y `max-file`; el deployment **MUST** verificar la configuración
   efectiva y no asumirla.
3. Los archivos internos creados por el driver **MUST** permanecer bajo control de
   Docker. Collectors externos **MUST** usar una integración soportada con Docker y
   **MUST NOT** depender de leer directamente esos archivos.
4. Un cambio al driver default **MUST** contemplar que solo afecta contenedores
   creados después del cambio; el rollout **MUST** recrear y verificar los existentes.
5. El modo de entrega `blocking` o `non-blocking` **MUST** seleccionarse y documentarse
   según el riesgo. `non-blocking` **MAY** perder mensajes al agotar su buffer;
   `blocking` **MAY** aplicar backpressure sobre la aplicación.
6. Eventos de auditoría que no puedan perderse **MUST** contar con persistencia
   durable separada; el driver de logs **MUST NOT** tratarse como ledger.

## Decoupling

1. La configuración de Docker **MUST NOT** incorporar endpoints o credenciales de
   Grafana Alloy, Loki u otro backend dentro de la aplicación.
2. La automatización del repositorio **SHOULD** validar driver, límites y disponibilidad
   de ambos streams sin administrar el collector de infraestructura del host.

## References

- [Configure logging drivers](https://docs.docker.com/engine/logging/configure/)
- [Local file logging driver](https://docs.docker.com/engine/logging/drivers/local/)
