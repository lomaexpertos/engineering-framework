# Business operation logging

Cargar esta referencia cuando una operación crítica, un cálculo o un flujo de varios
pasos deba poder reconstruirse mediante logs.

## Operation map

1. Delimitar inicio, fin, resultado y fronteras de la operación.
2. Enumerar pasos de dominio, decisiones, efectos externos y puntos de fallo; evitar
   eventos por detalles internos que no explican el resultado.
3. Elegir un `operation_id` o `correlation_id` estable y propagarlo por todos los
   eventos, jobs, reintentos y servicios participantes.
4. Registrar inicio, checkpoints semánticos, finalización y fallo con nombres de
   evento estables.

## Event contract

Incluir, cuando aplique:

- evento, timestamp UTC, severidad, servicio, ambiente y versión;
- operación, request, entidad, actor o sistema iniciador;
- regla o versión de configuración aplicada;
- bases, unidades, tasas, periodos, redondeos y resultados intermedios;
- estado anterior y posterior, resultado final, duración y motivo de fallo.

Para nómina, por ejemplo, los eventos pueden representar inicio, salario calculado,
cuotas calculadas, ajustes aplicados y total final. Ventas, cotizaciones y facturación
deben usar checkpoints equivalentes de su propio dominio, no copiar esos nombres.

## Data boundary

- Registrar valores de negocio cuando sean necesarios para explicar el resultado;
  no aplicar una redacción genérica que destruya su utilidad diagnóstica.
- Preferir identificadores y resúmenes si ofrecen la misma capacidad de reconstrucción.
- Nunca registrar contraseñas, tokens, llaves, secretos, sesiones ni cadenas de
  conexión. Omitir datos personales y payloads que no aporten al diagnóstico.
- Codificar datos controlados por usuarios para impedir inyección de nuevas líneas o
  campos falsos.
- Alinear acceso y retención de logs con la sensibilidad del contenido.

## Validation

1. Probar éxito, fallo intermedio, reintento y ejecución concurrente.
2. Reconstruir un caso de prueba usando únicamente los eventos emitidos y contrastarlo
   con el estado transaccional.
3. Verificar que cada hecho se registre una sola vez y que todos los eventos conserven
   la correlación.
4. Confirmar que el flujo no dependa del backend de observabilidad y que una falla del
   logger no produzca un resultado de negocio incorrecto.

Los logs explican el camino de decisión; no reemplazan un ledger, una auditoría durable
ni la base de datos como fuente autoritativa del resultado.
