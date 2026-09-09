# Frontend and UX review

Aplicar estos controles cuando el cambio toque interfaz. Respetar primero el design
system, componentes y convenciones vigentes del proyecto.

## Comportamiento

Comprobar estados de carga, error, vacío, éxito, permisos y disabled; validación
visible y equivalente en backend cuando persista datos; navegación, foco, teclado y
etiquetas accesibles según el componente.

En flujos secuenciales, verificar que los datos condicionantes aparezcan antes que sus
dependencias, que los datos derivables no se soliciten innecesariamente y que acciones
críticas muestren impacto o confirmación suficiente.

## Reutilización

Reportar componentes inline, estilos locales o duplicación sólo cuando ignoren un
contrato existente, creen inconsistencia material o introduzcan un costo concreto. No
exigir componentización de fragmentos triviales ni una abstracción sin reutilización o
complejidad real.

Si el dominio no permite confirmar un flujo o una regla visual, registrar una pregunta
o limitación en lugar de inventar una obligación.
