# Container logging

## Scope

Esta Policy aplica a aplicaciones ejecutadas en contenedores Docker de producción.
El contrato aplicativo se define en
[`../development/logging.md`](../development/logging.md).

## Contrato de recolección

El contrato obligatorio del repositorio es backend → `stdout`/`stderr` → driver
Docker `local`. Alloy del host → Loki describe el entorno de recolección previsto,
no un prerrequisito del producto. El repositorio declara la captura/rotación en Compose
por servicio (o configuración equivalente versionada); no depende de un default
desconocido del daemon. No instalar plugins de logging ni enviar desde Docker o la
aplicación directamente a Loki. Alloy y su envío asíncrono no bloqueante pertenecen
a la infraestructura del host; el repo documenta identidades para discovery/relabeling,
sin instalar/configurar ese servicio externo por inferencia.

Alloy/Loki **MUST NOT** bloquear instalación, arranque, deployment, CI ni entrega.
Su ausencia, indisponibilidad, falta de permisos, timeout o ingestión no comprobada
solo pueden generar `WARN`/observación, nunca `FAIL`, `ERROR` o `BLOCKED`, ni cambiar
el código de salida a fallo. No convertirlos en checks requeridos ni dependencias
de un gate. Comprobarlos es opcional y no autoriza instalar o reparar el host.

Con los requisitos propios satisfechos, el diagnóstico puede mostrar:

```text
[WARN] telemetry.alloy No disponible/no verificable; solo observación
RESULTADO: PREPARADO | requeridos satisfechos | exit=0
```

## Capacidad local y rotación

Cada contenedor backend **MUST** dimensionar al menos **50 MB diarios durante 10 días**
(base de 500 MB antes de overhead), ampliando capacidad si el volumen real lo exige.
Perfil base de Compose; fragmento para incorporar al servicio real:

```yaml
services:
  api:
    logging:
      driver: local
      options:
        max-size: "50m"
        max-file: "11"
        compress: "true"
        mode: "non-blocking"
        max-buffer-size: "1m"
```

Se reservan diez archivos completos más el activo; no reducir a diez contando el
activo parcialmente vacío. Presupuestar disco por contenedor/réplica, overhead y
lectura de rotados, sin asumir ahorro por compresión. El buffer es independiente
de la capacidad de retención; ampliarlo con evidencia si la carga lo necesita.

Docker rota por **tamaño**, no por calendario: esta configuración no acredita por sí
sola diez días de historial. **MUST** comprobar volumen/ventana efectivos y ampliar
los límites para cumplirla. Recrear/eliminar contenedores puede perder su historial
local. La retención remota de Loki es contexto externo: documentarla si se conoce,
sin deducirla de Compose ni exigir confirmación para aprobar el repositorio.

## Ownership y fiabilidad

1. Docker **MUST** capturar `stdout` y `stderr` mediante el driver `local`, configurado
   como arriba. Toda desviación requiere excepción aprobada, no elección del agente.
2. `mode: non-blocking` **MUST** impedir backpressure de logging sobre el backend.
   Su buffer puede descartar mensajes al llenarse: no promete entrega sin pérdidas.
   Detectar saturación/fallos de captura local; anomalías externas solo se observan.
   No tratar logs como ledger.
3. Los archivos internos creados por el driver **MUST** permanecer bajo control de
   Docker. Collectors externos **MUST** usar una integración soportada con Docker y
   **MUST NOT** depender de leer directamente esos archivos.
4. Un cambio al driver default **MUST** contemplar que solo afecta contenedores
   creados después del cambio; el rollout **MUST** recrear y verificar los existentes.
5. El repositorio **MUST NOT** duplicar emisiones/metadata ni multiplicar labels de
   campos arbitrarios. Anomalías de Alloy/Loki son observaciones no bloqueantes.
   Labels/campos siguen
   [logging.md](../development/logging.md#campos-y-cardinalidad).
6. Eventos de auditoría que no puedan perderse **MUST** contar con persistencia
   durable separada; el driver de logs **MUST NOT** tratarse como ledger.

## Decoupling

1. La configuración de Docker **MUST NOT** incorporar endpoints o credenciales de
   Grafana Alloy, Loki u otro backend dentro de la aplicación.
2. Antes de arrancar, doctor/precheck **MUST** validar configuración declarada,
   opciones, espacio e identidades; configuración efectiva si ya existen contenedores.
   No exigir eventos de un backend aún sin arrancar. En aceptación posterior, probar
   ambos streams, JSON, correlación, no duplicación y filtrado por ruta normalizada,
   con fixtures saneados. Recepción en Alloy/Loki puede observarse por separado y
   con autorización; no forma parte de la aceptación requerida. Si no se comprueba,
   informar la observación sin inventar éxito ni bloquear la entrega. Los fallos
   propios de emisión o captura local siguen siendo incumplimientos del repositorio.

## References

- [Configure logging drivers](https://docs.docker.com/engine/logging/configure/)
- [Local file logging driver](https://docs.docker.com/engine/logging/drivers/local/)
- [Alloy: loki.source.docker](https://grafana.com/docs/alloy/latest/reference/components/loki/loki.source.docker/)
- [Loki: labels acotados](https://grafana.com/docs/loki/latest/get-started/labels/bp-labels/)
