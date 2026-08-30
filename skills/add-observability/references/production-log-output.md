# Production log output

Cargar esta referencia al cambiar configuración productiva, contenedores Docker o el
destino de logs de una aplicación.

## Application contract

1. Inspeccionar logger, handlers, formato y diferencias por ambiente.
2. Configurar producción para emitir eventos informativos por `stdout` y errores por
   `stderr` cuando el framework lo soporte.
3. Mantener cada evento estructurado como un registro lógico y reutilizar campos de
   servicio, ambiente, severidad, evento y correlación.
4. Eliminar la dependencia de archivos internos o montajes como salida primaria.
5. No agregar SDKs, endpoints, credenciales ni configuración de Grafana Alloy, Loki u
   otro backend al contrato base de la aplicación.

## Docker contract

1. Inspeccionar Compose, scripts de deployment y defaults documentados del host.
2. Usar el driver `local` por servicio o verificar que sea el default administrado.
3. Definir o verificar límites de rotación y retención. Si no existe un valor
   corporativo aprobado, documentar la decisión del proyecto en lugar de inventarlo.
4. Elegir explícitamente entrega `blocking` o `non-blocking` según la tolerancia a
   backpressure y pérdida de eventos.
5. Recrear contenedores afectados cuando cambie el default del daemon.
6. Mantener los archivos internos del driver bajo propiedad exclusiva de Docker; la
   integración del collector pertenece a la infraestructura del host.

## Validation

- Generar al menos un evento informativo y uno de error, y comprobar ambos streams.
- Verificar driver y opciones efectivas del contenedor, no solo el YAML declarado.
- Confirmar rotación acotada y acceso mediante herramientas soportadas por Docker.
- Probar que la aplicación funciona sin Alloy, Loki ni conectividad con un backend.
- Documentar cualquier excepción y el contrato equivalente que la justifica.
